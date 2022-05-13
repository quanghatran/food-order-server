import { EntityRepository, Repository } from 'typeorm';
import { User } from 'src/entities';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  constructor() {
    super();
  }

  async findByEmail(email: string): Promise<User> {
    return await this.findOne({
      where: {
        email,
      },
    });
  }
}
