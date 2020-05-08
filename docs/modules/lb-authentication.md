
  # Authentication for loopback application
Để secure một  API thì chúng ta cần phải làm các bước sau:

-   decorate the endpoints of a controller with the  `@authenticate(strategyName, options?)`  decorator (app developer)
-   insert the authentication action in a custom sequence (app developer)
-   create a custom authentication strategy with a unique  **name**  (extension developer)
-   register the custom authentication strategy (app developer)

Point 1,2 thì xem lại phần sequence. Tập trung vào point 3&4 để là khai báo custom authentication strategy.

*Default strategy* của loopback  sẽ có dạng như sau:

```typescript
export interface AuthenticationStrategy {
  /**
   * The 'name' property is a unique identifier for the
   * authentication strategy (for example: 'basic', 'jwt', etc)
   */
  name: string;

  /**
   * The 'authenticate' method takes in a given request and returns a user profile
   * which is an instance of 'UserProfile'.
   * (A user profile is a minimal subset of a user object)
   * If the user credentials are valid, this method should return a 'UserProfile' instance.
   * If the user credentials are invalid, this method should throw an error
   * If the user credentials are missing, this method should throw an error, or return 'undefined'
   * and let the authentication action deal with it.
   *
   * @param request - Express request object
   */
  authenticate(request: Request): Promise<UserProfile | undefined>;
}
```

Đây là ví dụ tạo một  custom stragery để verify  username&password. Đầu tiên chúng ta cần tạo 1 basic authentication strategy
```typescript
export interface Credentials {
  username: string;
  password: string;
}

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  constructor(
    @inject(UserServiceBindings.USER_SERVICE)
    private userService: UserService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const credentials: Credentials = this.extractCredentials(request);
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);

    return userProfile;
  }

  extractCredentials(request: Request): Credentials {
    let creds: Credentials;

    /**
     * Code to extract the 'basic' user credentials from the Authorization header
     */

    return creds;
  }
}
```

Sau đó khai báo trong Application như  thế này

```typescript
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    /* set up miscellaneous bindings */

    //...

    // load the authentication component
    this.component(AuthenticationComponent);

    // register your custom authentication strategy
    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);

    // use your custom authenticating sequence
    this.sequence(MyAuthenticatingSequence);

    this.static('/', path.join(__dirname, '../public'));

    this.projectRoot = __dirname;

    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
```

Câu hỏi ở đây là tại sao loopback lại có thể tìm được đúng strategy của chúng ta. Cách làm của loopback là:

 1. Khi  decorator controller method bằng @authenticate thì loopback lưu vào metadata của  method đó tên của strategy
 2.  Thêm vào sequence có thêm action authenticate.
```typescript
export class DefaultSequence implements SequenceHandler {
  /**
   * Constructor: Injects findRoute, invokeMethod & logError
   * methods as promises.
   *
   * @param {FindRoute} findRoute Finds the appropriate controller method,
   *  spec and args for invocation (injected via SequenceActions.FIND_ROUTE).
   * @param {ParseParams} parseParams The parameter parsing function (injected
   * via SequenceActions.PARSE_PARAMS).
   * @param {InvokeMethod} invoke Invokes the method specified by the route
   * (injected via SequenceActions.INVOKE_METHOD).
   * @param {Send} send The action to merge the invoke result with the response
   * (injected via SequenceActions.SEND)
   * @param {Reject} reject The action to take if the invoke returns a rejected
   * promise result (injected via SequenceActions.REJECT).
   */
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  /**
   * Runs the default sequence. Given a handler context (request and response),
   * running the sequence will produce a response or an error.
   *
   * Default sequence executes these steps
   *  - Finds the appropriate controller method, swagger spec
   *    and args for invocation
   *  - Parses HTTP request to get API argument list
   *  - Invokes the API which is defined in the Application Controller
   *  - Writes the result from API into the HTTP response
   *  - Error is caught and logged using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   *
   * @param context The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  async handle(context: RequestContext): Promise<void> {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);

      debug('%s result -', route.describe(), result);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```
 3. Trong AuthenticateAction thì lấy ra authentication strategy hiện tại. Lấy ra bằng cách nào thì chỉ đơn giản là @inject  getter của @loopback/authentication vào constructor
```typescript
export class AuthenticateActionProvider implements Provider<AuthenticateFn> {
  constructor(
    // The provider is instantiated for Sequence constructor,
    // at which time we don't have information about the current
    // route yet. This information is needed to determine
    // what auth strategy should be used.
    // To solve this, we are injecting a getter function that will
    // defer resolution of the strategy until authenticate() action
    // is executed.
    @inject.getter(AuthenticationBindings.STRATEGY)
    readonly getStrategy: Getter<AuthenticationStrategy>,
    @inject.setter(SecurityBindings.USER)
    readonly setCurrentUser: Setter<UserProfile>,
  ) {}

  /**
   * @returns authenticateFn
   */
  value(): AuthenticateFn {
    return request => this.action(request);
  }

  /**
   * The implementation of authenticate() sequence action.
   * @param request The incoming request provided by the REST layer
   */
  async action(request: Request): Promise<UserProfile | undefined> {
    const strategy = await this.getStrategy();
    if (!strategy) {
      // The invoked operation does not require authentication.
      return undefined;
    }

    const userProfile = await strategy.authenticate(request);
    if (!userProfile) {
      // important to throw a non-protocol-specific error here
      let error = new Error(
        `User profile not returned from strategy's authenticate function`,
      );
      Object.assign(error, {
        code: USER_PROFILE_NOT_FOUND,
      });
      throw error;
    }

    this.setCurrentUser(userProfile);
    return userProfile;
  }
}
```
 4. Câu hỏi là Loopback làm những việc gì để lấy được current strategy. Nó khai báo *AuthenticationStrategyProvider* như sau

```typescript
@extensionPoint(
  AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  {scope: BindingScope.TRANSIENT},
) //this needs to be transient, e.g. for request level context.
export class AuthenticationStrategyProvider
  implements Provider<AuthenticationStrategy | undefined> {
  constructor(
    @extensions()
    private authenticationStrategies: Getter<AuthenticationStrategy[]>,
    @inject(AuthenticationBindings.METADATA)
    private metadata?: AuthenticationMetadata,
  ) {}
  async value(): Promise<AuthenticationStrategy | undefined> {
    if (!this.metadata) {
      return undefined;
    }
    const name = this.metadata.strategy;
    const strategy = await this.findAuthenticationStrategy(name);
    if (!strategy) {
      // important to throw a non-protocol-specific error here
      let error = new Error(`The strategy '${name}' is not available.`);
      Object.assign(error, {
        code: AUTHENTICATION_STRATEGY_NOT_FOUND,
      });
      throw error;
    }
    return strategy;
  }

  async findAuthenticationStrategy(name: string) {
    const strategies = await this.authenticationStrategies();
    const matchingAuthStrategy = strategies.find(a => a.name === name);
    return matchingAuthStrategy;
  }
}
```

Bằng cách sử dụng ***@extensionPoint/@extensions*** . Design pattern này cũng tương tự như là delegate pattern.
@extensionPoint cho phép nhiều 3rd module đẩy service của nó vào. Đó chính là khai báo

    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);
```typescript
/**
 * Registers an authentication strategy as an extension of the * AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME extension * point. * @param context - Context object
 * @param strategyClass - Class for the authentication strategy
 */export function registerAuthenticationStrategy(
  context: Context,
  strategyClass: Constructor<AuthenticationStrategy>,
) {
  return addExtension(
	context,
    AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    strategyClass,
    {
	  namespace:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    },
  );
}
```
```typescript
/**
 * Register an extension for the given extension point to the context * @param context - Context object
 * @param extensionPointName - Name of the extension point
 * @param extensionClass - Class or a provider for an extension
 * @param options - Options Options for the creation of binding from class
 */export function addExtension(
  context: Context,
  extensionPointName: string,
  extensionClass: Constructor<unknown>,
  options?: BindingFromClassOptions,
) {
  const binding = createBindingFromClass(extensionClass, options).apply(
  extensionFor(extensionPointName),
  );
  context.add(binding);
  return binding;
}
```
 Trong khi thằng @extensions (số nhiều nhé) lấy ra hết tất cả các **extensionClass** đã được khai báo trước đó và tìm cái mình muốn lấy. Cái việc tìm này thì phải tự việc thủ công tuỳ theo logic. Như ở trên chính  là function ***findAuthenticationStrategy***, ở đây  nó lấy theo  name, cái mà cũng được khai báo ở *@authenticate* decorator trong controller method.
5. Trong authenticate action chỉ cần gọi tiếp  function authenticate là abstract method của interface ***AuthenticateStrategy***

# Integrate với passportjs

Passportjs nó không viết theo chuẩn của loopback là implements interface AuthenticateStrategy, tức là nó không có function *authenticate*. Do đó thằng loopback nó khịa ra thêm một cái adaptor để convert passport strategy thành cái mà loopback cần.

Các bước cần thực hiện.

 1. Apply adaptor vào passportjs strategy. Thay vì phải tự tạo strategy như khi mình tự làm thì bây giờ apply adator vào để biến đổi.
```typescript
// In file 'my-basic-auth-strategy.ts'
import {BasicStrategy} from 'passport-http';
import {UserProfileFactory} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {myUserProfileFactory} from '<path to user profile factory>';

function verify(username: string, password: string, cb: Function) {
  users.find(username, password, cb);
}
const basicStrategy = new BasicStrategy(verify);

// Apply the adapter
export const AUTH_STRATEGY_NAME = 'basic';
export const basicAuthStrategy = new StrategyAdapter(
  // The configured basic strategy instance
  basicStrategy,
  // Give the strategy a name
  // You'd better define your strategy name as a constant, like
  // `const AUTH_STRATEGY_NAME = 'basic'`.
  // You will need to decorate the APIs later with the same name.
  AUTH_STRATEGY_NAME,
  // Provide a user profile factory
  myUserProfileFactory,
);
```

 2. Khai báo strategy vào @extensionPoint
```typescript
import {Application, CoreTags} from '@loopback/core';
import {AuthenticationBindings} from '@loopback/authentication';
import {basicAuthStrategy} from './my-basic-auth-strategy';

app
  .bind('authentication.strategies.basicAuthStrategy')
  .to(basicAuthStrategy)
  .tag({
    [CoreTags.EXTENSION_FOR]:
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  });
```
3. Các bước tạo sequence và thêm authenticate action lấy từ @loopback/authentication vẫn như thế.
