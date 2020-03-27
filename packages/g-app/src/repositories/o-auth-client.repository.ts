import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {OAuthClient, OAuthClientGrant, OAuthClientRelations, OAuthToken, OAuthAuthorizationCode} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {OAuthClientGrantRepository} from './o-auth-client-grant.repository';
import {OAuthTokenRepository} from './o-auth-token.repository';
import {OAuthAuthorizationCodeRepository} from './o-auth-authorization-code.repository';

export class OAuthClientRepository extends DefaultCrudRepository<OAuthClient,
  typeof OAuthClient.prototype.id,
  OAuthClientRelations> {

  public readonly grants: HasManyRepositoryFactory<OAuthClientGrant,
    typeof OAuthClientGrant.prototype.client_id>;

  public readonly tokens: HasManyRepositoryFactory<OAuthToken,
    typeof OAuthToken.prototype.client_id>;

  public readonly authorizationCodes: HasManyRepositoryFactory<OAuthAuthorizationCode, typeof OAuthClient.prototype.id>;

  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
    @repository.getter('OAuthClientGrantRepository')
      getOAuthClientGrantRepository: Getter<OAuthClientGrantRepository>,
    @repository.getter('OAuthTokenRepository')
      getOAuthTokenRepository: Getter<OAuthTokenRepository>, @repository.getter('OAuthAuthorizationCodeRepository') protected oAuthAuthorizationCodeRepositoryGetter: Getter<OAuthAuthorizationCodeRepository>,
  ) {
    super(OAuthClient, dataSource);

    this.authorizationCodes = this.createHasManyRepositoryFactoryFor('authorizationCodes', oAuthAuthorizationCodeRepositoryGetter);
    this.registerInclusionResolver('authorizationCodes', this.authorizationCodes.inclusionResolver);

    this.grants = this.createHasManyRepositoryFactoryFor('grants', getOAuthClientGrantRepository);
    this.registerInclusionResolver('grants', this.grants.inclusionResolver);

    this.tokens = this.createHasManyRepositoryFactoryFor('tokens', getOAuthTokenRepository);
    this.registerInclusionResolver('tokens', this.tokens.inclusionResolver);

  }
}
