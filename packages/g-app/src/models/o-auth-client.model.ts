import {Entity, model, property, hasOne} from '@loopback/repository';
import {OAuthToken} from './o-auth-token.model';

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

  @hasOne(() => OAuthToken, {keyTo: 'client_id'})
  oAuthToken: OAuthToken;

  constructor(data?: Partial<OAuthClient>) {
    super(data);
  }
}

export interface OAuthClientRelations {
  // describe navigational properties here
}

export type OAuthClientWithRelations = OAuthClient & OAuthClientRelations;
