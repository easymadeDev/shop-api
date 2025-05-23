import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Try to get token from cookie
    const tokenFromCookie = request.cookies?.isAuthenticated;

    // Try to get token from Authorization header
    const authHeader = request.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // If no token in either location, throw error
    const token = tokenFromHeader || tokenFromCookie;
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }
}
