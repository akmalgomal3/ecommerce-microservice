import { Controller, SetMetadata, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './users.service';
import { user } from '../../../proto/user';
import RegisterRequest = user.RegisterRequest;
import RegisterResponse = user.RegisterResponse;
import LoginRequest = user.LoginRequest;
import LoginResponse = user.LoginResponse;
import { createResponse } from '../../../common/response/response.util';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import DeleteUserRequest = user.DeleteUserRequest;
import DeleteUserResponse = user.DeleteUserResponse;

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'Register')
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.userService.createUser(
      data.username,
      data.password,
      data.role,
    );
    return createResponse(true, 201, {
      userId: response.id,
    });
  }

  @GrpcMethod('UserService', 'Login')
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.userService.validateUser(
      data.username,
      data.password,
    );
    if (response) {
      const token = await this.userService.login(response);
      return createResponse(true, 200, {
        token: token.access_token,
      });
    } else {
      return createResponse(false, 401, null, {
        message: 'Invalid credentials',
        details: null,
      });
    }
  }

  @GrpcMethod('UserService', 'DeleteUser')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('role', ['admin'])
  async deleteUser(data: DeleteUserRequest): Promise<DeleteUserResponse> {
    const response = await this.userService.deleteUser(data.username);
    if (response) {
      return createResponse(true, 200, {
        userId: response.id,
      });
    } else {
      return createResponse(false, 401, null, {
        message: 'Delete User Failed!',
        details: null,
      });
    }
  }
}
