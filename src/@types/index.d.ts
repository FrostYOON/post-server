import { IUser } from "../models/users.js";

declare global {
  namespace Express {
    export interface User extends Omit<IUser, "password"> {}
  }
}
