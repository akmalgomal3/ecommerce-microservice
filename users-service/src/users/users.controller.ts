import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './users.service';
import { user } from '../../../proto/user';
import RegisterRequest = user.RegisterRequest;
import RegisterResponse = user.RegisterResponse;
import LoginRequest = user.LoginRequest;
import LoginResponse = user.LoginResponse;
import { createResponse } from '../../../common/response/response.util';

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
}
