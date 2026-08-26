// Minimal JWT payload decoder (no signature verification — that's the
// server's job). The backend only returns a bare `token` from /auth/login,
// with no user object, so we decode the userId out of it client-side.
export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}
