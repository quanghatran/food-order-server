import { CategoryProduct } from "src/entities";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(CategoryProduct)
export class CategoryProductRepository extends Repository<CategoryProduct> {
    constructor() {
        super();
    }
}