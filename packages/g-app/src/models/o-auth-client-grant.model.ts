import {belongsTo, Entity, model, property} from '@loopback/repository';
import {OAuthClient} from './o-auth-client.model';

@model({settings: {strict: false}})
export class OAuthClientGrant extends Entity {
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
  type: string;

  @belongsTo(() => OAuthClient, {name: 'client'}, {
    type: 'string',
    mysql:
      {
        columnName: 'client_id',
        dataType: 'VARCHAR',
        dataLength: 50,
        nullable: 'N',
      },
  })
  clientId?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<OAuthClientGrant>) {
    super(data);
  }
}

export interface OAuthClientGrantRelations {
  client: OAuthClient
}

export type OAuthClientGrantWithRelations = OAuthClientGrant & OAuthClientGrantRelations;
