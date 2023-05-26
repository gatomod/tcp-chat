// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod structs;

use structs::{ReqLogin, Request, RequestBlock, ResError, Response};
use tauri::{Event, Window};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::TcpStream,
    sync::mpsc,
};

#[derive(Debug)]
enum Listener {
    Msg,
    Leave,
}

#[tauri::command]
async fn connect(window: Window, req_data: Request) -> Result<(), Response> {
    // Data splitter. Data structure is really inefficient
    let mut data = ReqLogin {
        addr: "".into(),
        name: "".into(),
        color: "".into(),
    };

    if let RequestBlock::Login(r_data) = req_data.clone().data {
        data = r_data;
    };

    // Socket
    let mut socket = match TcpStream::connect(data.clone().addr).await {
        Err(err) => {
            return Err(Response {
                status: "ERR".into(),
                op: "LOGIN".into(),
                data: structs::ResponseBlock::Error(ResError {
                    kind: "CONNECTION".into(),
                    msg: err.to_string(),
                }),
            })
        }
        Ok(s) => s,
    };

    // Login request
    socket
        .write(serde_json::to_string(&req_data).unwrap().as_bytes())
        .await
        .unwrap();

    // Client event
    let (tx, mut rx) = mpsc::channel::<(Listener, Event)>(1);
    let event_sender = tx.clone();
    let leave_sender = tx.clone();

    let event = window.listen("CLI_MSG", move |e| {
        event_sender.try_send((Listener::Msg, e)).unwrap();
    });

    let leave_ev = window.listen("CLI_LEAVE", move |e| {
        leave_sender.try_send((Listener::Leave, e)).unwrap()
    });

    // FIXME Again, this sucks
    let mut buf = vec![0; 2048];

    loop {
        tokio::select! {
            // Read from server, send to client
            result = socket.read(&mut buf) => {
                let buf_len = match result {
                    Err(err) => {
                        return Err(Response {
                            status: "ERR".into(),
                            op: "READ".into(),
                            data: structs::ResponseBlock::Error(ResError {
                                kind: "SOCKET".into(),
                                msg: err.to_string(),
                            }),
                        })
                    }
                    Ok(n) if n == 0 => {
                        break;
                    }
                    Ok(n) => n,
                };

                buf.resize(buf_len, 0);

                // Parse input data
                let data_str = String::from_utf8_lossy(&buf);

                // Send data block to client
                window.emit("SRV_MSG", serde_json::from_str::<Response>(&data_str).unwrap_or_else(|e| {
                    Response {
                        op: "MSG".into(),
                        status: "ERR".into(),
                        data: structs::ResponseBlock::Error(ResError { kind: "READ".to_string(), msg: e.to_string() })
                    }
                }).data).unwrap();
            }

            // Read from client, send to server
            payload = rx.recv() => {
                match payload {
                    Some((Listener::Msg, data)) => {
                        if let Err(err) = socket.write(data.payload().unwrap().as_bytes()).await {

                            window.emit("SRV_MSG", Response {
                                status: "ERR".into(),
                                op: "WRITE".into(),
                                data: structs::ResponseBlock::Error( ResError {
                                    kind: "SEND".into(),
                                    msg: err.to_string()
                                }),
                            }).unwrap();


                    };
                    }
                    Some((Listener::Leave, _)) => {
                        break;
                    }
                    None => return Ok(())
                }
            }
        }

        buf = vec![0; 1024];
    }

    window.unlisten(event);
    window.unlisten(leave_ev);

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
