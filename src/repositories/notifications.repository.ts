import { EntityRepository, Repository } from 'typeorm';
import { Notification } from '../entities'

@EntityRepository(Notification)
export class NotificationsRepository extends Repository<Notification> {
  constructor() {
    super();
  }
}
