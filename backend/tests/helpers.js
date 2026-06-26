import jwt from "jsonwebtoken";

export const makeToken = (overrides = {}) =>
  jwt.sign(
    { id: 1, email: "test@example.com", role: "USER", ...overrides },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

export const makeAdminToken = () => makeToken({ id: 99, role: "ADMIN" });
export const makeAuthorToken = () => makeToken({ id: 1, role: "AUTHOR" });

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
