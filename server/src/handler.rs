use std::{collections::HashMap, net::SocketAddr, println, sync::Arc};

use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::TcpStream,
    sync::{broadcast::Sender, RwLock},
};

use crate::structs::{Request, RequestBlock, ResError, ResMsg, Response, ResponseBlock, UserData};

pub async fn handler(
    mut socket: TcpStream,
    addr: SocketAddr,
    chat_rwlock: Arc<RwLock<HashMap<SocketAddr, UserData>>>,
    tx: Sender<String>,
) {
    let mut rx = tx.subscribe();

    println!("[ ACK ] {} joined", addr);

    // FIXME This sucks, can't read more than 2048 bytes
    let mut buf = vec![0; 2048];

    loop {
        tokio::select! {
            // Buffer to broadcast
            result = socket.read(&mut buf) => {
                // Connection handler
                let buf_len = match result {
                    Err(e) => {
                        eprintln!("[ ERR ] Error reading data: {}", e);
                        return;
                    }
                    Ok(n) if n == 0 => {
                        break;
                    }
                    Ok(n) => n,
                };

                buf.resize(buf_len, 0);

                // Parse input data
                let data: Request = match serde_json::from_str(&String::from_utf8_lossy(&buf)) {
                    Err(err) => {
                        let error = Response {
                            op: "ERROR_MSG",
                            status: "ERR",
                            data: ResponseBlock::Error(ResError {
                                kind: "PARSE",
                                msg: err.to_string(),
                            }),
                        };

                        socket.write(serde_json::to_string(&error).unwrap().as_bytes())
                            .await
                            .unwrap();

                        break;
                    }
                    Ok(data) => data,
                };

                // Match operations
                match (data.op.as_str(), &data.data) {
                    ("LOGIN", RequestBlock::Login(data)) => {
                        let mut add_user = chat_rwlock.write().await;

                        for i in add_user.iter() {
                            if i.1.name == data.name {
                                let error = Response {
                                op: "ERROR_MSG",
                                status: "ERR",
                                data: ResponseBlock::Error(ResError {
                                    kind: "PARSE",
                                    msg: "Username already exists".to_string(),
                                }),
                            };

                            socket.write(serde_json::to_string(&error).unwrap().as_bytes())
                                .await
                                .unwrap();

                                println!("[ FIN ] {} left", addr);
                                return;
                            }
                        }

                            add_user.insert(
                                addr,
                                UserData {
                                    name: data.name.clone(),
                                    color: data.color.clone(),
                                    addr,
                                },
                            );

                    }
                    ("MSG", RequestBlock::Msg(msg)) => {
                        /*
                        Nota para mí
                        El message delivery funciona de la siguiente manera

                        Ya que broadcast es para pasar información entre hilos, se usa un tokio select para
                        hacer dos operaciones: enviar mensaje al resto de hilos y recibir mensajes de otros hilos.

                        Cuando un hilo quiere enviar un mensaje, manda un broadcast a todas las conexiones (hilos)
                        y estos envían el mensaje a cada conexión. De esta manera es como se envían los mensajes,
                        los hilos se comunican entre sí y estos que gestionan la conexión de cada cliente envían
                        el mensaje.
                         */

                        let users = chat_rwlock.read().await;


                        let sender = users.get(&addr).unwrap().clone();

                        let res = Response {
                            op: "MSG",
                            status: "OK",
                            data: ResponseBlock::Msg(ResMsg {
                                color: sender.color.as_str().to_string(),
                                user: sender.name.as_str().to_string(),
                                msg: msg.to_string(),
                            }),
                        };

                        tx.send(serde_json::to_string(&res).unwrap()).unwrap();
                    }
                    (&_, _) => {
                        let error = Response {
                            op: "ERR_MSG",
                            status: "ERR",
                            data: ResponseBlock::Error({
                                ResError {
                                    kind: "DATA",
                                    msg: "Data is not well balanced".into(),
                                }
                            }),
                        };
                        socket
                            .write(serde_json::to_string(&error).unwrap().as_bytes())
                            .await
                            .unwrap();

                    }
                };
            }

            // Broadcast to buffer
            msg = rx.recv() => {
                if let Ok(data) = msg {
                    socket.write(data.as_bytes()).await.unwrap();
                }
            }
        };

        // Clear buffer
        buf = vec![0; 2048];
    }
    let mut add_user = chat_rwlock.write().await;

    add_user.remove(&addr);

    println!("[ FIN ] {} left", addr);
}
