import {DefaultCrudRepository} from '@loopback/repository';
import {OAuthClient, OAuthClientRelations} from '../models';
import {DefaultDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OAuthClientRepository extends DefaultCrudRepository<OAuthClient,
  typeof OAuthClient.prototype.id,
  OAuthClientRelations> {
  constructor(
    @inject('datasources.default') dataSource: DefaultDataSource,
  ) {
    super(OAuthClient, dataSource);
  }
}
