<img width="100px" height="100px" align="right" src="assets/icon.png" alt="TCP chat icon" />

# TCP Chat

Simple, quick and lightweight chat built over TCP and Rust.

</br>

![TCP Chat example](assets/example.png)

</br>

## Overview

TCP Chat is a simple chat made in Rust with a communication over TCP. The purpose of this project is learn about parallelism and low-level network communication.

This project doesn't want to replace any tool or being a new way to communicate, is just for learn Rust and has several issues (see [Known Issues](#known-issues)).

## Stack

### Frontend

-   **Language:** [TypeScript](https://www.typescriptlang.org/), [Rust](https://www.rust-lang.org/es)
-   **Libs:** [Solid](https://www.solidjs.com/), [Tauri](https://tauri.app/), [Vite](https://vitejs.dev/)
-   **Style:** [Tailwind](https://tailwindcss.com/)

### Backend

-   **Language:** [Rust](https://www.rust-lang.org/es)
-   **Libs:** [Tokio](https://tokio.rs/), [Serde](https://serde.rs/)
-   **Protocols:** [TCP](https://www.rfc-editor.org/rfc/rfc793.html)

## Getting started

Since the project is built with Tokio, the standard library and Tauri, TCP Chat is multiplatform.

To get started, clone the repo.
```sh
git clone https://github.com/gatomod/tcp-chat && cd tcp-chat
```

### Server

#### Using Docker
```sh
# Build Dockerfile
docker build -t gatomo/tcp-chat:latest .

# Run the container
# - Choose a port. 3000 is the default one
docker run --name tcp-chat -p 3000:3000 gatomo/tcp-chat

# You can set a custom port
docker run --name tcp-chat -p 4444:3000 gatomo/tcp-chat # Docker binding
docker run --name tcp-chat -p 3000:4444 -e PORT='4444' gatomo/tcp-chat # env variable to pass to server
```

#### Manually
```sh
# build the server
cargo build --release -p server

# Run the server
./target/release/tcp-chat # using generated binary
cargo run --release -p server # using Cargo

PORT=4444 ./target/release/tcp-chat # You can pass custom port with env
```

### Client

Client dependencies are managed with [PNPM](https://pnpm.io/), a fast and disk efficient package manager. You can use NPM or Yarn if you want, but I recommend you use PNPM. You can install it with `npm i -g pnpm` and then restarting your terminal.

```sh
# Go to client folder
cd client

# Install dependencies
pnpm i

# Build the client
pnpm tauri build
```

## How it works?

### The connection
The server opens a TCP Listener. For each new connection spawns a thread and keeps open the connection. At this point, client and server can share the data.

When a connection sends a message, data is sent to server, which shares the packet between all threads and send the message to all connections.

Tauri receives the message and passes it to the web client.

### The "handshake"
TCP Chat has an own protocol to join server and share messages. Those messages are serialized in JSON and are defined at [structs.rs](server/src/structs.rs). All messages have an "op" field (which says the operation to perform) and "data" field (with required data for specified operation). If data is invalid or there are missing fields in "data", server will reply with an error response.

For join, client sends a packet with the proper information to join. Server stores it in a hashmap linking client address and data.

For send a message, client sends a message, the data field will be just the message, without user data. When the server receives it, it'll find the client address in the hashmap and package the user data into the message. Once it's done, message and user data is sent to all connections.

## Known issues

As I said before, the purpose of this project is learn parallelism and low-level network communication. There's several issues related to stability and security. I didn't noticed about that when I developed this project and I don't have intention to fix it. Although these issues, server is resilient enough, I tried to crash client and server and I didn't found any way to do it. Anyway, if you want to fix some issues feel free to open a Pull Request and I'll review and merge it! 

- **Crypto:** Packets are not encrypted, you can open Wireshark (or any sniffer) and you can see the messages you send. A simple solution is using TLS or any kind of cryptographic technique (assymetric encryption or Diffie-Hellman). This was my fault.
- **Packet overflow** *(partially fixed)***:** Data communication is serialized in JSON. When the payload is larger than max buffer size (previously 2048 bytes, actually 65535 bytes) overflow bytes are ignored. This behavior causes a serialization error due to ignoring JSON closing brackets and quotes. This could be avoided limiting payload or using other markup languages that doesn't use closing characters.
- **Payload too large:** Actually is not a big issue, but client is really simple and having a lot of large messages could generate performance issues with client rendering and memory usage.
- **Unexpected connection looses:** Connection can be lost with packet overflows, but when running server on Windows if a connection is lost due to an error, rest of connections could also be lost without any reason. This could be a Windows issue. In addition, when connection is lost, user data remains in the hashmap.

## Troubleshooting

Since TCP Chat client is built over Tauri, it could be some issues while building it. Most of theese problems are missing dependencies. I'll add more points as I receive issues with a reasonable solution.

### Linux: Failed to run custom build command for \<x>
Error could be caused due to missing dependencies. Find the name of missing package at line where error says "Perhaps you should add the directory containing \<x>", where "x" is the name of the missing package. Try installing it or updating your system. Some examples of missing packages are `glibc` and `libsoup`.

## Release history
-   1.1.0
    -   Extend max buffer size to 65535 bytes
    -   Add Docker support
    -   Fix README
-   1.0.0
    -   Initial release

## License

TCP Chat is licensed under the [GNU Affero General Public License v.3.0](https://www.gnu.org/licenses/agpl-3.0.html).

## Contribute

Any PR is welcome! Is a small project so the guideline is to follow the code style and not make insane purposes.

## Links

**[Donate (via PayPal)](https://paypal.me/gatomooficial) - [Discord](https://discord.gg/E2yBpMq2Km) - [Revolt](https://rvlt.gg/fX4a7k1B)**

_Gátomo - GNU Affero General Public License v.3.0 License_
