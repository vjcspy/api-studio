import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {
  AuthenticateFn,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  AuthenticationBindings,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {Logger} from './providers';
import {GBaseBinding} from './types';

const SequenceActions = RestBindings.SequenceActions;

export class BaseSequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION) protected authenticateRequest: AuthenticateFn,
    @inject(GBaseBinding.Logger) protected logger: Logger,
  ) {
  }

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;

      this.logger.info('Request ' + request.url);

      const route               = this.findRoute(request);

      // call authentication action
      await this.authenticateRequest(request);

      // Authentication successful, proceed to invoke controller
      const args   = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      //
      // The authentication action utilizes a strategies resolver to find
      // an authentication strategies by name, and then it calls
      // strategies.authenticate(request).
      //
      // The strategies resolver throws a non-http error if it cannot
      // resolve the strategies. When the strategies resolver obtains
      // a strategies, it calls strategies.authenticate(request) which
      // is expected to return a authentication profile. If the authentication profile
      // is undefined, then it throws a non-http error.
      //
      // It is necessary to catch these errors and add HTTP-specific status
      // code property.
      //
      // Errors thrown by the strategies implementations already come
      // with statusCode set.
      //
      // In the future, we want to improve `@loopback/rest` to provide
      // an extension point allowing `@loopback/authentication` to contribute
      // mappings from error codes to HTTP status codes, so that application
      // don't have to map codes themselves.
      if (
        error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        error.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error, {statusCode: 401 /* Unauthorized */});
      }

      this.reject(context, error);
      return;
    }
  }
}
