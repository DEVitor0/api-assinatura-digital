import { JwtUserPayload } from "../jwt-payload";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
