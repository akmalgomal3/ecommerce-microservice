import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'role',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToRpc().getContext()['internalRepr'];
    if (!request) {
      throw new ForbiddenException('No metadata found in request');
    }

    const authHeader = request.get('authorization');
    if (!authHeader || authHeader.length === 0) {
      throw new ForbiddenException('Missing authorization token');
    }

    const token = authHeader[0].replace('Bearer ', '').trim();
    let payload: { sub: any; username: any; role: any };

    try {
      // Verify the token and get the payload
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }

    // Extract userId, username, and role from the payload
    const { sub: userId, username, role } = payload;

    if (!userId || !username || !role) {
      throw new ForbiddenException('Invalid token payload');
    }

    // Check if the user's role matches any of the required roles
    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException('You do not have permission (RolesGuard)');
    }

    return true;
  }
}
