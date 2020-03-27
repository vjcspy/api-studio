import {BelongsToAccessor, DefaultCrudRepository, Getter, repository} from '@loopback/repository';
import {OAuthAuthorizationCode, OAuthAuthorizationCodeRelations, OAuthClient, User} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {OAuthClientRepository} from './o-auth-client.repository';
import {UserRepository} from './user.repository';

export class OAuthAuthorizationCodeRepository extends DefaultCrudRepository<OAuthAuthorizationCode,
  typeof OAuthAuthorizationCode.prototype.id,
  OAuthAuthorizationCodeRelations> {

  public readonly user: BelongsToAccessor<User,
    typeof User.prototype.id>;

  public readonly client: BelongsToAccessor<OAuthClient,
    typeof OAuthClient.prototype.clientId>;

  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
    @repository.getter('UserRepository')
      getUserRepository: Getter<UserRepository>,
    @repository.getter('OAuthClientRepository')
      getOAuthClientRepository: Getter<OAuthClientRepository>,
  ) {
    super(OAuthAuthorizationCode, dataSource);

    // @ts-ignore
    this.user = this.createBelongsToAccessorFor('user', getUserRepository);
    this.registerInclusionResolver('user', this.user.inclusionResolver);

    // @ts-ignore
    this.client = this.createBelongsToAccessorFor('client', getOAuthClientRepository);
    this.registerInclusionResolver('client', this.client.inclusionResolver);

  }
}
