import { EntityRepository, Repository } from 'typeorm';
import { Order } from '../entities';

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
  constructor() {
    super();
  }
}
