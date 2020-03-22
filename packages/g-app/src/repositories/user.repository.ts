import {DefaultTransactionalRepository} from '@loopback/repository';
import {User, UserRelations} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserRepository extends DefaultTransactionalRepository<User,
  typeof User.prototype.id,
  UserRelations> {
  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
  ) {
    super(User, dataSource);
  }
}
