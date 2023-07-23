declare global {
  interface Error {
    status?: number;
  }
}

declare module "express-session" {
  export interface SessionData {
    color: string;
  }
}

export {};
