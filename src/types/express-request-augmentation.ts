/// <reference types="express-serve-static-core" />

declare module "express-serve-static-core" {
  interface Request {
    validated?: unknown;
    auth_user_id?: number;
    request_id?: string;
  }
}

export {};
