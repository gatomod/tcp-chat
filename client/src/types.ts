export type Request = {
	op: string;
	data: string | ReqLogin;
};

export type Response = {
	op: string;
	status: string;
	data: ResMsg | ResError;
};

export type ReqLogin = {
	addr: string;
	name: string;
	color: string;
};

export type ResMsg = {
	user: string;
	color: string;
	msg: string;
};

export type ResError = {
	kind: string;
	msg: string;
};
