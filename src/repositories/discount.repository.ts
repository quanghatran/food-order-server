import { EntityRepository, Repository } from 'typeorm';
import { Discount } from '../entities';

@EntityRepository(Discount)
export class DiscountRepository extends Repository<Discount> {
  constructor() {
    super();
  }
}
