import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {OAuthClient} from './o-auth-client.model';
import {User, UserWithRelations} from './user.model';

@model()
export class OAuthToken extends Entity {
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
  access_token: string;

  @property({
    type: 'date',
  })
  access_token_expires_on?: string;

  @property({
    type: 'string',
  })
  refresh_token?: string;

  @property({
    type: 'date',
  })
  refresh_token_expires_on?: string;

  @belongsTo(() => User, {name: 'user'}, {
    type: 'number',
  })
  user_id?: number;

  @belongsTo(() => OAuthClient, {name: 'o_auth_client'}, {
    type: 'string',
  })
  client_id?: string;

  constructor(data?: Partial<OAuthToken>) {
    super(data);
  }
}

export interface OAuthTokenRelations {
  user?: UserWithRelations;
  o_auth_client?: OAuthClient
}

export type OAuthTokenWithRelations = OAuthToken & OAuthTokenRelations;
