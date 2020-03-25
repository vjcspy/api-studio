import {Entity, model, property, hasMany} from '@loopback/repository';
import {OAuthToken} from './o-auth-token.model';
import {OAuthClientGrant} from './o-auth-client-grant.model';

@model()
export class OAuthClient extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    mysql:
      {
        columnName: 'client_id',
        dataType: 'VARCHAR',
        dataLength: 50,
        nullable: 'N',
      },
  })
  clientId: string;

  @property({
    type: 'string',
    required: true,
    mysql:
      {
        columnName: 'client_secret',
        dataType: 'VARCHAR',
        dataLength: 50,
        nullable: 'N',
      },
  })
  clientSecret: string;

  @hasMany(() => OAuthToken, {keyTo: 'clientId', keyFrom: 'clientId'})
  tokens: OAuthToken;

  @hasMany(() => OAuthClientGrant, {keyTo: 'clientId', keyFrom: 'clientId'})
  grants: OAuthClientGrant[];

  constructor(data?: Partial<OAuthClient>) {
    super(data);
  }
}

export interface OAuthClientRelations {
  // describe navigational properties here
}

export type OAuthClientWithRelations = OAuthClient & OAuthClientRelations;
