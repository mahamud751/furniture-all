import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

export type AuthUser = { sub: string; role: "admin" | "customer"; email: string };

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  sign(user: AuthUser, expiresIn: `${number}${"h" | "d"}`) {
    return this.jwt.sign(user, { expiresIn });
  }

  require(req: Request, role?: AuthUser["role"]): AuthUser {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) throw new UnauthorizedException("Sign in required.");
    try {
      const payload = this.jwt.verify<AuthUser>(token);
      if (role && payload.role !== role) throw new ForbiddenException("You do not have access to this.");
      return payload;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException("Sign in again.");
    }
  }

  optionalCustomer(req: Request): AuthUser | null {
    const header = req.headers.authorization ?? "";
    if (!header.startsWith("Bearer ") || header.trim().length < 8) return null;
    return this.require(req, "customer");
  }
}
