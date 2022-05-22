import { EntityRepository, Repository } from 'typeorm';
import { Category } from 'src/entities';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  constructor() {
    super();
  }
}
