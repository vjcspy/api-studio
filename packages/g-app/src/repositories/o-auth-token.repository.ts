import {BelongsToAccessor, DefaultCrudRepository, Getter, repository} from '@loopback/repository';
import {OAuthToken, OAuthTokenRelations, User} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {UserRepository} from './user.repository';

export class OAuthTokenRepository extends DefaultCrudRepository<OAuthToken,
  typeof OAuthToken.prototype.id,
  OAuthTokenRelations> {

  public readonly user: BelongsToAccessor<User,
    typeof User.prototype.id>;

  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
    @repository.getter('UserRepository')
      getUserRepository: Getter<UserRepository>,
  ) {
    super(OAuthToken, dataSource);

    // @ts-ignore
    this.user = this.createBelongsToAccessorFor('user', getUserRepository);

    // add this line to register inclusion resolver
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
