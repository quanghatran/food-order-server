import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiTags } from '@nestjs/swagger';
<<<<<<< HEAD
=======
import { GetAllProductDto } from './dto/get-all-product.dto';
import { ProductCaregoryDto } from './dto/product-category.dto';
import { ProductStoreDto } from './dto/product-store.dto';
>>>>>>> 299eb0c... api

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/all-product')
  getAll(@Query() data: GetAllProductDto) {
    return this.productService.getAllProduct(data);
  }

  @Get('/all-product/:categoryId')
  getProductByCategory(
    @Param('categoryId') categoryId: string,
    @Query() data: ProductCaregoryDto,
  ) {
    return this.productService.getProductByCategory(categoryId, data);
  }

  @Get('/all-product/:storeId')
  getProductByStore(
    @Param('storeId') storeId: string,
    @Query() data: ProductStoreDto,
  ) {
    return this.productService.getProductByStore(storeId, data);
  }

  @Get('/search-by-product-name')
  searchByProductName(@Query('q') q: string) {
    return this.productService.searchByNameProduct(q.trim());
  }

  @Get('/search-by-store-name')
  searchByStoreName(@Query('q') q: string) {
    return this.productService.searchByNameStore(q.trim());
  }

  @Get('/search')
  search(@Query() q: string) {
    return this.productService.search(q);
  }

  @Get('/top-product')
  getTopProduct(@Query('limit', ParseIntPipe) limit: number) {
    console.log(limit);
    return this.productService.getTopProducts(limit);
  }

  @Get('/:productId')
  productDetail(@Param('productId') productId: string) {
    return this.productService.getProductDetails(productId);
  }


}
