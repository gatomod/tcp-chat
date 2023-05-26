use serde::{Deserialize, Serialize};

// Data blocks
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]

pub enum RequestBlock {
    #[serde(rename = "data")]
    Login(ReqLogin),
    #[serde(rename = "data")]
    Msg(String),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum ResponseBlock {
    #[serde(rename = "data")]
    Error(ResError),
    #[serde(rename = "data")]
    Msg(ResMsg),
}

// Base structs
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub op: String,

    // #[serde(flatten)]
    pub data: RequestBlock,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Response {
    pub op: String,
    pub status: String,

    // #[serde(flatten)]
    pub data: ResponseBlock,
}

// Request data blocks
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReqLogin {
    pub addr: String,
    pub name: String,
    pub color: String,
}

// Response data blocks
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ResError {
    pub kind: String,
    pub msg: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ResMsg {
    pub user: String,
    pub color: String,
    pub msg: String,
}
