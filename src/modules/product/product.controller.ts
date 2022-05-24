import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/')
  getAll() {
    return this.productService.getAllProduct();
  }

  @Get('/search-by-product-name')
  searchByProductName(@Query('q') q: string) {
    return this.productService.searchByNameProduct(q.trim());
  }

  @Get('/search-by-store-name')
  searchByStoreName(@Query('q') q: string) {
    return this.productService.searchByNameStore(q.trim());
  }
}
