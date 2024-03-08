import CSRF from "csrf";

export function signCSRF() {
  const tokens = new CSRF();
  return tokens.create(process.env.CSRF_SECRET!);
}

export function verifyCSRF(token: string) {
  const tokens = new CSRF();
  return tokens.verify(process.env.CSRF_SECRET!, token);
}
