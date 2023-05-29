<img width="100px" height="100px" align="right" alt="Inquirer Logo" src="assets/icon.png" title="Inquirer.js"/>

# TCP Chat

Simple, quick and lightweight chat built over TCP and Rust.

</br>

![](assets/example.png)

</br>

## Overview

TCP Chat is a simple chat made in Rust with a communication over TCP. The purpose of this project is learn about parallelism and low-level network communication.

This project doesn't want to replace any tool or being a new way to communicate, is just for learn Rust and has several issues (such as non-encrypted packets).

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

To start using TCP Chat you need to clone repository, install dependencies and build locally.

```bash
# Clone the repo
git clone https://github.com/gatomod/tcp-chat.git

# Build the server
cargo build --release -p server

# Build the client
cd client

pnpm i
pnpm tauri build
```

Then run it

```bash
# Init server
target/release/server

# By default, server is on port 3000
# Add an env variable to edit it
PORT=4848 target/release/server

# Start client
target/release/tcp-chat
```

## How it works?

The server opens a TCP Listener. For each new connection spawns a thread and keeps open the connection. At this point, client and server can share the data (which is serialized in JSON, structs are defined in [structs.rs](server/src/structs.rs)).

When a connection sends a message, data is sent to server, which shares the packet between all threads and send the message to all connections.

Tauri receives the message and passes it to the web client.

## Release history

-   1.0.0
    -   Initial release

## License

TCP Chat is licensed under the [GNU General Public License v.3.0](https://www.gnu.org/licenses/gpl-3.0.html).

## Contribute

Any PR is welcome! Is a small project so the guideline is to follow the code style and not make insane purposes.

**_Note:_** _typo errors will be declined._

## Links

**[Web](https://gatomo.ga) - [Donate (via PayPal)](https://paypal.me/gatomooficial) - [Discord](https://discord.gg/E2yBpMq2Km) - [Revolt](https://rvlt.gg/fX4a7k1B)**

_Gátomo - GNU General Public License v.3.0 License_
