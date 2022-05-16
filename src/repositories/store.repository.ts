import { EntityRepository, Repository } from 'typeorm';
import { Store } from 'src/entities';

@EntityRepository(Store)
export class StoreRepository extends Repository<Store> {
  constructor() {
    super();
  }

  async findByEmail(email: string): Promise<Store> {
    return await this.findOne({
      where: {
        email,
      },
    });
  }
}
