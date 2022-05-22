import { EntityRepository, Repository } from 'typeorm';
import { Product } from 'src/entities';

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  constructor() {
    super();
  }
}
