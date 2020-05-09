# Controller

Trong loopback có nhiều cách để tạo một router nhưng có đều phải khai bao 2 thứ quan trọng nhất đó là `spec` và `operation`

## Spec
Spec ở đây là open-api spec.  Xem ở [đây](http://spec.openapis.org/oas/v3.0.3#openapi-object)
Loopback có wrap open-api bằng decorator. Nhiệm vụ chính là transfer metadata từ loopback sang OpenAPI 3.0.0 specifications. Ví dụ một số chức năng như define spec, parse parameter truyền vào request.... Xem chi tiết ở  [đây](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.html)
Ví dụ routing to controller

```typescript
const spec = {
  parameters: [{name: 'name', schema: {type: 'string'}, in: 'query'}],
  responses: {
    '200': {
      description: 'greeting text',
      content: {
        'application/json': {
          schema: {type: 'string'},
        },
      },
    },
  },
};
```
Sau đó chúng ta có 2 cách, hoặc là gọi trong application:
```typescript
// ... in your application constructor
this.route('get', '/greet', spec, MyController, 'greet');
```
Hoặc sử dụng decorator trong controller:
``` typescript
import {get} from '@loopback/rest';

class MyController {
  @get('/greet', spec)
  greet(name: string) {
    return `hello ${name}`;
  }
}

// ... in your application constructor
this.controller(MyController);

```

## Controller parameter decorator

Chúng ta có thể truyền parameter vào function của controller theo 2 cách. Hoặc là định nghĩa trong spec, hoặc là sử dụng những parameter decorator mà loopback build sẵn như: [param(paramSpec)](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.param.html), [requestBody(requestBodySpec)](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.requestbody.html)
ParamSpec và RequestBodySpec thì xem trong Open-API hoặc có thể sử dụng thêm variable của  chúng ví dụ như `@param.query.string(name,ParameterObject)`
Lúc này cũng cần phải xem `ParameterObject` trong Open-Api để define.

Ví dụ function cho 2 cách trên:

```typescript
test(
  @param({
  name: 'entity_type',
           required: true,
           in: 'query',
         }) entityType: string,
  @param.query.string('time', {
  required: true,
  }) time: number,
): object {
  return {
	entityType,
    time
  };
}
```

## Handle Error

````typescript
import {HelloRepository} from '../repositories';
import {HelloMessage} from '../models';
import {get, param, HttpErrors} from '@loopback/rest';
import {repository} from '@loopback/repository';

export class HelloController {
  constructor(@repository(HelloRepository) protected repo: HelloRepository) {}

  // returns a list of our objects
  @get('/messages')
  async list(@param.query.number('limit') limit = 10): Promise<HelloMessage[]> {
    // throw an error when the parameter is not a natural number
    if (!Number.isInteger(limit) || limit < 1) {
      throw new HttpErrors.UnprocessableEntity('limit is not a natural number');
    } else if (limit > 100) {
      limit = 100;
    }
    return this.repo.find({limit});
  }
}
````
