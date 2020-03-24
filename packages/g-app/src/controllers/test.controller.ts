import {Request, RestBindings, get, ResponseObject} from '@loopback/rest';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {OAuthClientRepository, OAuthTokenRepository, UserRepository} from '../repositories';
import {OAuthClient, OAuthToken, User} from '../models';
import _ from 'lodash';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class TestController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {
  }

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      date: new Date(),
      url: this.req.url,
      headers: {...this.req.headers},
    };
  }

  @get('/example-create-user-and-token')
  async createUserAndToken(
    @repository(UserRepository) userRepo: UserRepository,
    @repository(OAuthClientRepository) oauthClientRepo: OAuthClientRepository,
    @repository(OAuthTokenRepository) oauthTokenRepo: OAuthTokenRepository,
  ): Promise<object> {
    const users = [
      new User({phone: this.randomString(11)}),
      new User({phone: this.randomString(11)}),
      new User({phone: this.randomString(11)}),
      new User({phone: this.randomString(11)}),
      new User({phone: this.randomString(11)}),
    ];
    _.each(users, async (user) => {
      user = await userRepo.save(user);
      const tokenData: OAuthToken = new OAuthToken({
        access_token: this.randomString(),
      });
      // @ts-ignore
      userRepo.o_auth_token(user.id).create(tokenData);
    });
    return {};
  }

  @get('/get-user-from-token')
  async getUserFromToken(
    @repository(UserRepository) userRepo: UserRepository,
    @repository(OAuthClientRepository) oauthClientRepo: OAuthClientRepository,
    @repository(OAuthTokenRepository) oauthTokenRepo: OAuthTokenRepository,
  ) {
    const oAuthToken = await oauthTokenRepo.find({
      where: {
        id: 1,
      }, include: [{relation: 'user'}],
    });
    return {oAuthToken};
  }

  protected randomString(length: number = 7) {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 2 + length);
  };

}
