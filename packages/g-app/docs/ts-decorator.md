# Example typescript decorator

Sử dụng để như một interceptor để thêm những tính năng cần thiết cho class, và class member.

> Decorator được hứa hẹn sẽ là 1 một của javascript (kể từ ES 7), tuy
> nhiên typescript đã đi trước với việc hỗ trợ từ đầu Decorator (vốn là
> 1 tính năng được sử dụng khá nhiều trong C#, một ngôn ngữ cũng do
> Microsoft phát triển). 

Để enable được tính năng thử nghiệm, phải bật `experimentalDecorators` compiler option hoặc là ở command line hoặc là trong file `tsconfig.json`

## Decorator

_Decorator_  có thể coi như một cú pháp khai báo đặc biệt, không bao giờ đứng độc lập mà luôn được gắn kèm với một khai báo class, method, property hoặc accessor.  _Decorator_  được viết dưới cú pháp dạng  `@expression`, với  `expression`  trỏ tới một function sẽ được gọi tới ở runtime, có nhiệm vụ thay đổi hoặc bổ sung cho đối tượng được decorate.

**Trong javascript thuần từ trước phiên bản ES6**, khái niệm decorator cũng đã xuất hiện dưới dạng "functional composition" - bao bọc 1 function với 1 function khác. Ví dụ: khi ta gần ghi log lại hoạt động của 1 function , ta có thể tạo 1  `decorator`  function bao bọc lấy function cần thực hiện.

```javascript
function doBusinessJob(arg) {
  console.log('do my job');
}

function logDecorator(job) {
  return function() {
    console.log('start my job');
    const result = job.apply(this, arguments);
    return result;
  }
}

const logWrapper = logDecorator(doBusinessJob);

```

function được gói trong  `logWrapper`  được gọi y hệt như với  `doBusinessJob`, với điểm khác biệt là nó sẽ thực hiện thêm việc ghi log trước khi business được thực hiện.

```javascript
doBusinessJob();
// do my job
logDecorator();
// start my job
// do my job

```

Tương tự như trên, trong typescript,  `@expression`  thực chất cũng là một function:

```javascript
function expression(target) {
   // do something with target 
}
```

#### Decorator factory:

Để customize cách mà 1 decorator được apply vào target của nó, **hoặc truyền params cho decorator**, ta có thể sử dụng  `decorator factory`  - thực chất cũng lại là 1 function, trả về 1 expression mà sẽ được decorator gọi tới ở run-time.

```javascript
function customDecorator(value: integer) {   // => decorator factory
  return function (target): void {           // => decorator
     // do something with decorated target and input value
  }
}
```

**Trong Typescript, có 5 loại decorator:**

-   class decorator
-   method decorator
-   property decorator
-   accessor decorator
-   parameter decorator


## Class decorator

Một  ***Class decorator***  được định nghĩa ngay phía trước định nghĩa lớp đó.

```javascript
@classDecorator
@sealed
export class Greeter {  
  property = "property";  
    greeting: string;  
  
    constructor(message: string) {  
  console.log("original constructor");  
        this.greeting = message;  
    }  
  
  greet() {  
  console.log('Hello, ' + this.greeting);  
    }  
}  
  
  
function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {  
  return class extends constructor {  
  newProperty = "new property";  
        greeting = "override";  
    }  
}  
  
  
function sealed(constructor: Function) {  
  console.log("start decorator class");  
    Object.seal(constructor);  
    Object.seal(constructor.prototype);  
}
```
Nếu Decarator function có thể trả về 1 khai báo class mới thì nó sẽ thay thế constructor cũ.  

## Method decorator

Khác với  `Class decorator`  ,  `Method decorator`  được khai báo với 3 params:
    -   target : Class chứa cái method đó.
    -   tên của member được decorate ( mà đối với  `method decorator`  thì là tên của method)
    -   `Property Descriptor`  của method.

```javascript
export class ClassWithDecoratorMethod {  
  @logDecorator  
 @enumerable(false)  
  doSomething(...args: string[]) {  
  console.log("do something with args: " + args);  
    }  
}  
  
  
function logDecorator(target: any, key: string, descriptor: any) {  
  const originalMethod = descriptor.value;  
  
    descriptor.value = function (...args: any[]) {  
  console.log('start my job');  
        return originalMethod.apply(this, args);  
    };  
  
    return descriptor;  
}  
  
function enumerable(value: boolean) {  
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {  
 descriptor.enumerable = value;  
    };  
}
```

Ở ví dụ trên ta có 2 cách để khai báo là dùng function hoặc factory tương tự như class decorator

## Accessor decorator

Tương tự với  `method decorator`,  `accessor decorator`  dùng để decorate cho accessor của 1 property nào đó.

```javascript
class Demo {
  private _name: string;

  @modify
  get name(): string {
    return `先生 ${this._name}`;
  }
}

```

_Chú ý_: Với accessor decorator, ta chỉ định nghĩa decorate với accessor nào (get hoặc set) được viết trước tiên.

```javascript
@modify
get name(): string {
}

// không viết @modify ở đây nữa !
set name(input: string): void {
}
```

## Property decorator

Khác với  `method decorator`  và  `accessor decorator`,  `property decorator`  sẽ chỉ có 2 params đầu vào :  `Property Descriptor`  không được truyền vào như 1 argument của  `property decorator`

```javascript
import "reflect-metadata";  
  
export class ClassWithPropertyDecorator {  
  @format("Hello, %s")  
  greeting: string;  
  
    constructor(message: string) {  
  this.greeting = message;  
    }  
  
  greet() {  
  let formatString = getFormat(this, "greeting");  
        console.log(formatString);  
        return formatString.replace("%s", this.greeting);  
    }  
}  
  
const formatMetadataKey = Symbol("format");  
  
function format(formatString: string) {  
  console.log("decorator property function");  
    return function (target: any, propertyName: string) {  
  console.log(target);  
        console.log(propertyName);  
        Reflect.defineMetadata(formatMetadataKey, formatString, target, propertyName);  
    }  
}  
  
function getFormat(target: any, propertyKey: string) {  
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);  
}
```

## Parameter decorator

Decorator loại này được định nghĩa ngay trước 1 parameter - có thể là 1 param của 1 function hoặc của  `constructor`  của Class.

`Parameter decorator`  nhận đầu vào là 3 params

-   class đầu vào.
-   tên của param được decorate.
-   thứ tự của param trong list các params của function cha.

`Parameter decorator`  chỉ được sử dụng để kiểm tra sự tồn tại của params trong function , và thường được dùng kết hợp với  `method decorator`  hoặc  `accessor decorator`
