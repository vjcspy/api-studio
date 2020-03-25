import {DefaultCrudRepository, Getter, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {OAuthClient, OAuthClientGrant, OAuthClientRelations, OAuthToken} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {OAuthClientGrantRepository} from './o-auth-client-grant.repository';
import {OAuthTokenRepository} from './o-auth-token.repository';

export class OAuthClientRepository extends DefaultCrudRepository<OAuthClient,
  typeof OAuthClient.prototype.id,
  OAuthClientRelations> {

  public readonly grants: HasManyRepositoryFactory<OAuthClientGrant,
    typeof OAuthClientGrant.prototype.client_id>;

  public readonly tokens: HasManyRepositoryFactory<OAuthToken,
    typeof OAuthToken.prototype.client_id>;

  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
    @repository.getter('OAuthClientGrantRepository')
      getOAuthClientGrantRepository: Getter<OAuthClientGrantRepository>,
    @repository.getter('OAuthTokenRepository')
      getOAuthTokenRepository: Getter<OAuthTokenRepository>,
  ) {
    super(OAuthClient, dataSource);

    // retrieve OAuthTokenRepo
    this.grants = this.createHasManyRepositoryFactoryFor(
      'grants',
      getOAuthClientGrantRepository,
    );

    this.tokens = this.createHasManyRepositoryFactoryFor(
      'tokens',
      getOAuthTokenRepository,
    );

    // register inclusion resolver
    this.registerInclusionResolver('grants', this.grants.inclusionResolver);
    this.registerInclusionResolver('tokens', this.tokens.inclusionResolver);
  }
}
