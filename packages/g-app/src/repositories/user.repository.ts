import {
  DefaultTransactionalRepository,
  Getter,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {OAuthToken, User, UserRelations} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {OAuthTokenRepository} from './o-auth-token.repository';

export class UserRepository extends DefaultTransactionalRepository<User,
  typeof User.prototype.id,
  UserRelations> {

  public readonly tokens: HasManyRepositoryFactory<OAuthToken,
    typeof OAuthToken.prototype.id>;

  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
    @repository.getter('OAuthTokenRepository')
      getOAuthTokenRepository: Getter<OAuthTokenRepository>,
  ) {
    super(User, dataSource);

    // retrieve OAuthTokenRepo
    this.tokens = this.createHasManyRepositoryFactoryFor(
      'tokens',
      getOAuthTokenRepository,
    );

    // register inclusion tokens
    this.registerInclusionResolver('tokens', this.tokens.inclusionResolver);
  }
}
