// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

import {get, post, requestBody} from '@loopback/openapi-v3';
import {service} from '@loopback/core';
import {OAuth2ServerProvider} from '../services';
import OAuth2Server = require('oauth2-server');
import {inject} from '@loopback/context';
import {Request, RestBindings, Response, HttpErrors} from '@loopback/rest';
import {Getter, repository} from '@loopback/repository';
import {
  OAuthAuthorizationCodeRepository,
  OAuthClientRepository,
  OAuthTokenRepository,
  UserRepository,
} from '../repositories';
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
    @repository.getter('OAuthAuthorizationCodeRepository')
    public getOAuthAuthorizationCodeRepository: Getter<OAuthAuthorizationCodeRepository>,
  ) {
  }

  @post('/oauth/phone-authorize')
  async phoneAuthorize(
    @requestBody({
                   description: 'data',
                   content: {
                     'application/x-www-form-urlencoded': {
                       schema: {
                         type: 'object',
                         properties: {
                           phone: {type: 'string'},
                         },
                       },
                     },
                   },
                   responses: {
                     '200': null,
                   },
                 })
      data: any,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const {Request, Response} = OAuth2Server;
    const request             = {...this.req, body: {...data, response_type: 'code'}};

    const authenticateHandler = {
      handle: async (request: any, response: any) => {
        const userRepository = await this.getUserRepository();

        const user = await userRepository.findOne({
                                                    where: {
                                                      phone: data.phone,
                                                    },
                                                  });
        return user ? {phone: user.phone, id: user.id, userId: user.id} : false;
      },
    };

    const authorizationCode = await this.oAuth2Server.authorize(new Request(request), new Response(response), {
      authenticateHandler,
      allowEmptyState: true,
      authorizationCodeLifetime: 300, // 5 minutes
    });

    /*
    * Important!!!!
    * Bởi vì đang sử dụng authorize bằng  otp nên người dùng không cần truyền lên username/password mà vẫn  có thể lấy  được authorizationCode qua SMS.
    * Nếu không xoá authorizationCode ở response thì hacker có thể lợi dụng api này để lúc nào cũng lấy được accessToken của user
    * */
    // delete authorizationCode['authorizationCode'];

    return authorizationCode;
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
    const request             = {...this.req, body: {...data}};

    return await this.oAuth2Server.token(new Request(request), new Response(response));
  }

  @get('/oauth/dummy-data')
  async dummyData() {
    if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('prod') > -1) {
      throw new HttpErrors.NotAcceptable('=)))))');
    }

    const clients = [
      new OAuthClient({
                        clientId: 'application_id',
                        clientSecret: 'application_secret',
                      }),
      new OAuthClient({
                        clientId: 'application_' + randomString(5),
                        clientSecret: randomString(20),
                      }),
      new OAuthClient({
                        clientId: 'application_' + randomString(5),
                        clientSecret: randomString(20),
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
      const clientRepository       = await this.getOAuthClientRepository();
      const newClient: OAuthClient = await clientRepository.save(client);
      _.each(grants, async grant => {
        // @ts-ignore
        (await this.getOAuthClientRepository()).grants(newClient.clientId).create(grant);
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

    return this.dumpDb();
  }

  @get('/oauth/dump-db')
  async dumpDb() {
    if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('prod') > -1) {
      throw new HttpErrors.NotAcceptable('=)))))');
    }

    const userRepository   = await this.getUserRepository();
    const clientRepository = await this.getOAuthClientRepository();
    // const codeRepository   = await this.getOAuthAuthorizationCodeRepository();

    const users   = await userRepository.find({include: [{relation: 'tokens'}, {relation: 'authorizationCodes'}]});
    const clients = await clientRepository.find({include: [{relation: 'grants'}]});

    return {users, clients};
  }
}
