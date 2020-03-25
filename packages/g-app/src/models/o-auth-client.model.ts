import {Entity, model, property, hasOne, hasMany} from '@loopback/repository';
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
  })
  client_id: string;

  @property({
    type: 'string',
    required: true,
  })
  client_secret: string;

  @hasMany(() => OAuthToken, {keyTo: 'client_id', keyFrom: 'client_id'})
  tokens: OAuthToken;

  @hasMany(() => OAuthClientGrant, {keyTo: 'client_id', keyFrom: 'client_id'})
  grants: OAuthClientGrant[];

  constructor(data?: Partial<OAuthClient>) {
    super(data);
  }
}

export interface OAuthClientRelations {
  // describe navigational properties here
}

export type OAuthClientWithRelations = OAuthClient & OAuthClientRelations;
