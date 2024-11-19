import { Controller, SetMetadata, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './products.service';
import { ecommerce } from '../../../proto/ecommerce';
import AddProductRequest = ecommerce.AddProductRequest;
import AddProductResponse = ecommerce.AddProductResponse;
import GetProductRequest = ecommerce.GetProductRequest;
import GetProductResponse = ecommerce.GetProductResponse;
import GetAllProductsResponse = ecommerce.GetAllProductsResponse;
import GetAllProductsRequest = ecommerce.GetAllProductsRequest;
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../common/guards/jwt.strategy';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  @GrpcMethod('ProductService', 'AddProduct')
  @SetMetadata('role', ['seller'])
  async addProduct(data: AddProductRequest): Promise<AddProductResponse> {
    const response = await this.productService.addProduct(
      data.name,
      data.price,
      data.description,
      data.stock,
      data.sellerId,
    );
    return {
      success: true,
      code: 201,
      data: {
        productId: response.id,
      },
      error: null,
      meta: null,
    };
  }

  @GrpcMethod('ProductService', 'GetProduct')
  async getProduct(data: GetProductRequest): Promise<GetProductResponse> {
    const response = await this.productService.getProductById(data.productId);
    if (response) {
      return {
        success: true,
        code: 200,
        data: {
          name: response.name,
          price: response.price,
          description: response.description,
          stock: response.stock,
          sellerId: response.seller_id,
        },
        error: null,
        meta: null,
      };
    } else {
      return {
        success: false,
        code: 404,
        data: null,
        error: {
          message: 'Product not found',
          details: null,
        },
        meta: null,
      };
    }
  }

  @GrpcMethod('ProductService', 'GetAllProducts')
  async getAllProducts(
    data: GetAllProductsRequest,
  ): Promise<GetAllProductsResponse> {
    const page: number = data.page;
    const limit = 10;
    const offset: number = (page - 1) * limit;

    const response = await this.productService.getAllProducts(limit, offset);
    const totalProducts: number =
      await this.productService.getTotalProductsCount();
    const productsData = response.map((product) => ({
      productId: product.productid,
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      sellerId: product.sellerid,
    }));
    return {
      success: true,
      code: 200,
      data: productsData,
      error: null,
      meta: {
        pagination: {
          total: totalProducts,
          page: page,
          limit: limit,
        },
      },
    };
  }
}
