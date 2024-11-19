import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './users.service';
import { ecommerce } from '../../../proto/ecommerce';
import RegisterRequest = ecommerce.RegisterRequest;
import RegisterResponse = ecommerce.RegisterResponse;
import LoginRequest = ecommerce.LoginRequest;
import LoginResponse = ecommerce.LoginResponse;

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
    return {
      success: true,
      code: 201,
      data: {
        userId: response.id,
      },
      error: null,
      meta: null,
    };
  }

  @GrpcMethod('UserService', 'Login')
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.userService.validateUser(
      data.username,
      data.password,
    );
    if (response) {
      const token = await this.userService.login(response);
      return {
        success: true,
        code: 200,
        data: {
          token: token.access_token,
        },
        error: null,
        meta: null,
      };
    } else {
      return {
        success: false,
        code: 401,
        data: null,
        error: {
          message: 'Invalid credentials',
          details: null,
        },
        meta: null,
      };
    }
  }
}
