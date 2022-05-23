import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../repositories';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  getAllProduct() {
    return this.productRepository.find();
  }
}
