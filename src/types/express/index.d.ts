declare namespace Express {
  interface Request {
    validated?: unknown;
    auth_usr_id?: number;
    request_id?: string;
  }
}
