import {Request, RestBindings, get, ResponseObject} from '@loopback/rest';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';

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
export class PingController {
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

  @get('/test')
  async test(
    @repository(UserRepository) userRepo: UserRepository,
  ): Promise<object> {
    const count = await userRepo.count();
    return {
      a: 1,
      b: 2,
      ...count,
    };
  }
}
