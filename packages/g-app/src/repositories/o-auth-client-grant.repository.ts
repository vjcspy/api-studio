import {DefaultCrudRepository} from '@loopback/repository';
import {OAuthClientGrant, OAuthClientGrantRelations} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OAuthClientGrantRepository extends DefaultCrudRepository<OAuthClientGrant,
  typeof OAuthClientGrant.prototype.id,
  OAuthClientGrantRelations> {
  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
  ) {
    super(OAuthClientGrant, dataSource);
  }
}
