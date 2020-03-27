import {
  DefaultTransactionalRepository,
  Getter,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {OAuthAuthorizationCode, OAuthToken, User, UserRelations} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {OAuthAuthorizationCodeRepository} from './o-auth-authorization-code.repository';
import {OAuthTokenRepository} from './o-auth-token.repository';

export class UserRepository extends DefaultTransactionalRepository<User,
  typeof User.prototype.id,
  UserRelations> {

  public readonly tokens: HasManyRepositoryFactory<OAuthToken,
    typeof OAuthToken.prototype.id>;

  public readonly authorizationCodes: HasManyRepositoryFactory<OAuthAuthorizationCode,
    typeof OAuthAuthorizationCode.prototype.id>;

  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
    @repository.getter('OAuthTokenRepository')
      getOAuthTokenRepository: Getter<OAuthTokenRepository>,
    @repository.getter('OAuthAuthorizationCodeRepository')
    public getOAuthAuthorizationCodeRepository: Getter<OAuthAuthorizationCodeRepository>,
  ) {
    super(User, dataSource);

    this.tokens = this.createHasManyRepositoryFactoryFor(
      'tokens',
      getOAuthTokenRepository,
    );
    this.registerInclusionResolver('tokens', this.tokens.inclusionResolver);

    this.authorizationCodes = this.createHasManyRepositoryFactoryFor(
      'authorizationCodes',
      getOAuthAuthorizationCodeRepository,
    );
    this.registerInclusionResolver('tokens', this.tokens.inclusionResolver);
    this.registerInclusionResolver('authorizationCodes', this.authorizationCodes.inclusionResolver);
  }
}
