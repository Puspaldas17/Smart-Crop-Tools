import { RequestHandler, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "agriverse-secret-change-in-production";
const JWT_EXPIRES = "7d";

export interface AuthPayload {
  id: string;
  role: "farmer" | "vet" | "admin";
  name: string;
}

/** Sign a JWT token for a user */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/** Middleware: verify JWT token from Authorization header */
export const verifyToken: RequestHandler = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please login." });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token. Please login again." });
  }
};

/** Middleware factory: require a specific role (or any of multiple roles) */
export function requireRole(...roles: string[]): RequestHandler {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
}

/** Optional auth — attaches user if token present but does not block */
export const optionalAuth: RequestHandler = (req: any, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.slice(7), JWT_SECRET) as AuthPayload;
    } catch {
      // ignore invalid token — treat as guest
    }
  }
  next();
};
