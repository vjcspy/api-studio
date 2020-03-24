import {DefaultTransactionalRepository, Getter, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {OAuthToken, User, UserRelations} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {OAuthTokenRepository} from './o-auth-token.repository';

export class UserRepository extends DefaultTransactionalRepository<User,
  typeof User.prototype.id,
  UserRelations> {

  public readonly o_auth_token: HasOneRepositoryFactory<OAuthToken,
    typeof OAuthToken.prototype.id>;

  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
    @repository.getter('OAuthTokenRepository')
      getOAuthTokenRepository: Getter<OAuthTokenRepository>,
  ) {
    super(User, dataSource);

    // retrieve OAuthTokenRepo
    this.o_auth_token = this.createHasOneRepositoryFactoryFor(
      'o_auth_token',
      getOAuthTokenRepository,
    );

    // register inclusion resolver
    this.registerInclusionResolver('o_auth_token', this.o_auth_token.inclusionResolver);
  }
}
