export interface JwtUserPayload {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "signer";
}