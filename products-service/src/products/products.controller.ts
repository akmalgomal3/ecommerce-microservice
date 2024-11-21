import { Controller, SetMetadata, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './products.service';
import { product } from '../../../proto/product';
import AddProductRequest = product.AddProductRequest;
import AddProductResponse = product.AddProductResponse;
import GetProductRequest = product.GetProductRequest;
import GetProductResponse = product.GetProductResponse;
import GetAllProductsResponse = product.GetAllProductsResponse;
import GetAllProductsRequest = product.GetAllProductsRequest;
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { createResponse } from '../../../common/response/response.util';
import UpdateProductRequest = product.UpdateProductRequest;
import UpdateProductResponse = product.UpdateProductResponse;

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @GrpcMethod('ProductService', 'AddProduct')
  @SetMetadata('role', ['seller'])
  async addProduct(data: AddProductRequest): Promise<AddProductResponse> {
    if (data.price <= 0) {
      return createResponse(false, 400, null, {
        message: 'Price must be greater than 0',
        details: { field: 'price', value: data.price },
      });
    }

    if (data.stock <= 0) {
      return createResponse(false, 400, null, {
        message: 'Stock must be greater than 0',
        details: JSON.stringify({ field: 'stock', value: data.stock }),
      });
    }
    try {
      const response = await this.productService.addProduct(
        data.name,
        data.price,
        data.description,
        data.stock,
        data.sellerId,
      );
      return createResponse(true, 201, {
        message: 'Product Added',
        productId: response.id,
      });
    } catch (e) {
      return createResponse(false, 400, null, {
        message: 'Failed to add new product!',
        details: e,
      });
    }
  }

  @GrpcMethod('ProductService', 'GetProduct')
  async getProduct(data: GetProductRequest): Promise<GetProductResponse> {
    const response = await this.productService.getProductById(data.productId);
    if (response) {
      return createResponse(true, 200, {
        name: response.name,
        price: response.price,
        description: response.description,
        stock: response.stock,
        sellerId: response.seller_id,
      });
    } else {
      return createResponse(false, 400, null, {
        message: 'Product not found',
        details: null,
      });
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
    return createResponse(true, 200, productsData, null, {
      pagination: {
        total: totalProducts,
        page: page,
        limit: limit,
      },
    });
  }

  @GrpcMethod('ProductService', 'UpdateProduct')
  @SetMetadata('role', ['seller'])
  async updateProduct(
    data: UpdateProductRequest,
  ): Promise<UpdateProductResponse> {
    try {
      if (data.price != null && data.price <= 0) {
        return createResponse(false, 400, null, {
          message: 'Price must be greater than 0',
          details: { field: 'price', value: data.price },
        });
      }

      if (data.stock != null && data.stock <= 0) {
        return createResponse(false, 400, null, {
          message: 'Stock must be greater than 0',
          details: JSON.stringify({ field: 'stock', value: data.stock }),
        });
      }
      const response = await this.productService.updateProduct(
        data.productId,
        data.name,
        data.price,
        data.description,
        data.stock,
      );
      return createResponse(true, 201, {
        productId: response.id,
        name: response.name,
        price: response.price,
        description: response.description,
        stock: response.stock,
        updatedAt: response.updated_at,
      });
    } catch (e) {
      return createResponse(false, 400, null, {
        message: 'Failed to change product data!',
        details: e,
      });
    }
  }
}
