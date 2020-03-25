// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, post, requestBody} from '@loopback/openapi-v3';
import {service} from '@loopback/core';
import {OAuth2ServerProvider} from '../services';
import OAuth2Server = require('oauth2-server');
import {inject} from '@loopback/context';
import {Request, RestBindings, Response} from '@loopback/rest';
import {Getter, repository} from '@loopback/repository';
import {OAuthClientRepository, OAuthTokenRepository, UserRepository} from '../repositories';
import {OAuthClient, OAuthClientGrant, User} from '../models';
import {randomString} from '@vjcspy/g-base';
import * as _ from 'lodash';

export class AuthController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @service(OAuth2ServerProvider) public oAuth2Server: OAuth2Server,
    @repository.getter('UserRepository')
    public getUserRepository: Getter<UserRepository>,
    @repository.getter('OAuthTokenRepository')
    public getOAuthTokenRepository: Getter<OAuthTokenRepository>,
    @repository.getter('OAuthClientRepository')
    public getOAuthClientRepository: Getter<OAuthClientRepository>,
  ) {
  }

  @post('/auth/generate-otp')
  generateOtp() {
    return 'otp';
  }

  @post('/oauth/token')
  async getToken(
    @requestBody({
      description: 'data',
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              grant_type: {type: 'string'},
              username: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
      data: object,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const {Request, Response} = OAuth2Server;
    const request = {...this.req, body: {...data}};

    const token = await this.oAuth2Server.token(new Request(request), new Response(response));

    return {token};
  }

  @get('/oauth/dummy-data')
  async dummyData() {
    const clients = [
      new OAuthClient({
        client_id: 'application_id',
        client_secret: 'application_secret',
      }),
      new OAuthClient({
        client_id: 'application_' + randomString(5),
        client_secret: randomString(20),
      }),
      new OAuthClient({
        client_id: 'application_' + randomString(5),
        client_secret: randomString(20),
      }),
    ];

    const grants = [
      new OAuthClientGrant({
        type: 'password',
      }),
      new OAuthClientGrant({
        type: 'refresh_token',
      }),
      new OAuthClientGrant({
        type: 'authorization_code',
      }),
    ];

    _.each(clients, async (client) => {
      const clientRepository = await this.getOAuthClientRepository();
      const newClient = await clientRepository.save(client);
      _.each(grants, async grant => {
        // @ts-ignore
        (await this.getOAuthClientRepository()).grants(newClient.client_id).create(grant);
      });

    });

    const users = [
      new User({
        phone: '123456789',
        username: 'vjcspy',
        password: '123456',
      }),
    ];

    _.each(users, async (user) => {
      const userRepository = await this.getUserRepository();
      await userRepository.save(user);
    });
  }

  @get('/oauth/dump-db')
  async dumpDb() {
    const userRepository = await this.getUserRepository();
    const clientRepository = await this.getOAuthClientRepository();
    const tokenRepository = await this.getOAuthTokenRepository();

    const users = await userRepository.find({include: [{relation: 'tokens'}]});
    const clients = await clientRepository.find({include: [{relation: 'grants'}]});


    return {users, clients};
  }
}
