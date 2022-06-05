import { EntityRepository, Repository } from 'typeorm';
import { StoreDetail } from '../entities';

@EntityRepository(StoreDetail)
export class StoreDetailRepository extends Repository<StoreDetail> {
  constructor() {
    super();
  }
}
