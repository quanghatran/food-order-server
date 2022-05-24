import { EntityRepository, Repository } from "typeorm";
import { Order, Store } from "../entities";

@EntityRepository(Store)
export class OrderRepository extends Repository<Order> {
  constructor() {
    super();
  }
}
