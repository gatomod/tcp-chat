use std::net::SocketAddr;

use serde::{Deserialize, Serialize};

// Hashmap struct
#[derive(Debug, Clone)]
pub struct UserData {
    pub name: String,
    pub color: String,
    pub addr: SocketAddr,
    // pub socket: &'a std::net::TcpStream,
}

// Data blocks
#[derive(Debug, Deserialize, Clone)]
#[serde(untagged)]

pub enum RequestBlock {
    #[serde(rename = "data")]
    Login(ReqLogin),
    #[serde(rename = "data")]
    Msg(String),
}

#[derive(Debug, Serialize, Clone)]
#[serde(untagged)]
pub enum ResponseBlock<'a> {
    #[serde(rename = "data")]
    Error(ResError<'a>),
    #[serde(rename = "data")]
    Msg(ResMsg),
}

// Base structs
#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub op: String,

    // #[serde(flatten)]
    pub data: RequestBlock,
}

#[derive(Debug, Serialize, Clone)]
pub struct Response<'a> {
    pub op: &'a str,
    pub status: &'a str,

    // #[serde(flatten)]
    pub data: ResponseBlock<'a>,
}

// Request data blocks
#[derive(Debug, Deserialize, Clone)]
pub struct ReqLogin {
    pub name: String,
    pub color: String,
}

// Response data blocks
#[derive(Debug, Serialize, Clone)]
pub struct ResError<'a> {
    pub kind: &'a str,
    pub msg: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct ResMsg {
    pub user: String,
    pub color: String,
    pub msg: String,
}
