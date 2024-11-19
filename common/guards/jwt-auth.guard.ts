import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServerUnaryCall } from '@grpc/grpc-js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const type = context.getType();

    if (type === 'rpc') {
      // This is for gRPC requests
      const grpcContext: ServerUnaryCall<any, any> = context
        .switchToRpc()
        .getContext();

      const bearerToken = grpcContext['internalRepr'].get('authorization')[0];
      return { headers: { authorization: bearerToken } };
    }

    // Default for HTTP requests
    return context.switchToHttp().getRequest();
  }
}
