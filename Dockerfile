FROM rust:alpine

WORKDIR /server

COPY server /server

RUN apk add musl-dev

RUN cargo build --release

EXPOSE 3000

CMD [ "./target/release/server" ]
