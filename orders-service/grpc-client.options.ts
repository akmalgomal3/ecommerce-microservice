import { ClientOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';

export const productsGrpcOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:3002',
    package: 'product',
    protoPath: path.join('../proto/product.proto'),
  },
};
