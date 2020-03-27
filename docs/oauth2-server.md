# OAuth2 server
Hiện tại  đang  sử dụng lib [này](https://github.com/oauthjs/express-oauth-server). Lúc implement nó đang là version 3.0.1. Tương lai có thể nó sẽ upgrade lên nhưng hiện tại không tìm được lib nào chuẩn hơn.

## Grant type là gì?
Grant type là cách mà Authorization Server của OAuth 2.0 có thể process và xác nhận rằng Client Application đủ điều kiện để có thể access tới Resource Server. Có tất cả 4 loại grant type mà OAuth 2.0 định nghĩa trong spec của mình, đó là:

-   Authorization Code
-   Implicit
-   Resource Owner Password Credentials
-   Client Credentials

### Resource Owner Password Credentials Grant
Đây là kiểu cơ bản khi client có (username,password) của resource owner. Cái này thường được sử dụng trên những device được tin tưởng.

     +----------+
     | Resource |
     |  Owner   |
     |          |
     +----------+
          v
          |    Resource Owner
         (A) Password Credentials
          |
          v
     +---------+                                  +---------------+
     |         |>--(B)---- Resource Owner ------->|               |
     |         |         Password Credentials     | Authorization |
     | Client  |                                  |     Server    |
     |         |<--(C)---- Access Token ---------<|               |
     |         |    (w/ Optional Refresh Token)   |               |
     +---------+                                  +---------------+

                Resource Owner Password Credentials Flow
Các bước thực hiện như sau:
 - ( A ) Resource owner cung cấp cho  client username&pass
 - ( B ) Client gửi request kèm theo credentials cho oauth server
 - ( C ) Oauth server trả về token cho client nếu verify  được user.

Các function cần thiết phải implement trong model:

-   [generateAccessToken(client, user, scope, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-generateaccesstoken): **optional**, oauth2-server đã implement rồi
-   [generateRefreshToken(client, user, scope, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-generaterefreshtoken): **optional**, oauth2-server đã implement rồi
-   [getClient(clientId, clientSecret, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-getclient): Lấy client từ database, **required**
-   [getUser(username, password, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-getuser): Lấy user để verify, nếu không tìm thấy thì trả về false
-   [saveToken(token, client, user, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-savetoken): Save token vào database
-   [validateScope(user, client, scope, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-validatescope): Verify xem client được vào những scope resource nào

Phải include client credentials vào header, user credentials và grant type vào trong request body:

-   **Headers**
    -   **Authorization**:  `"Basic " + clientId:clientSecret base64'd`

        -   (for example, to use  `application:secret`, you should send  `Basic YXBwbGljYXRpb246c2VjcmV0`)
    -   **Content-Type**:  `application/x-www-form-urlencoded`

-   **Body**
    -   `grant_type=password&username=pedroetb&password=password`
        -   (contains 3 parameters:  `grant_type`,  `username`  and  `password`)

For example, using  `curl`:

```
curl http://localhost:3000/oauth/token \
	-d "grant_type=password" \
	-d "username=pedroetb" \
	-d "password=password" \
	-H "Authorization: Basic YXBwbGljYXRpb246c2VjcmV0" \
	-H "Content-Type: application/x-www-form-urlencoded"

```

Server sẽ respond như thế này:

```
{
	"accessToken": "951d6f603c2ce322c5def00ce58952ed2d096a72",
	"accessTokenExpiresAt": "2018-11-18T16:18:25.852Z",
	"refreshToken": "67c8300ad53efa493c2278acf12d92bdb71832f9",
	"refreshTokenExpiresAt": "2018-12-02T15:18:25.852Z",
	"client": {
		"id": "application"
	},
	"user": {
		"id": "pedroetb"
	}
}
```

### Authorization Code Grant

     +----------+
     | Resource |
     |   Owner  |
     |          |
     +----------+
          ^
          |
         (B)
     +----|-----+          Client Identifier      +---------------+
     |         -+----(A)-- & Redirection URI ---->|               |
     |  User-   |                                 | Authorization |
     |  Agent  -+----(B)-- User authenticates --->|     Server    |
     |          |                                 |               |
     |         -+----(C)-- Authorization Code ---<|               |
     +-|----|---+                                 +---------------+
       |    |                                         ^      v
      (A)  (C)                                        |      |
       |    |                                         |      |
       ^    v                                         |      |
     +---------+                                      |      |
     |         |>---(D)-- Authorization Code ---------'      |
     |  Client |          & Redirection URI                  |
     |         |                                             |
     |         |<---(E)----- Access Token -------------------'
     +---------+       (w/ Optional Refresh Token)

   Note: The lines illustrating steps (A), (B), and (C) are broken into
   two parts as they pass through the user-agent.

   The flow illustrated in Figure 3 includes the following steps:

   (A)  The client initiates the flow by directing the resource owner's
        user-agent to the authorization endpoint.  The client includes
        its client identifier, requested scope, local state, and a
        redirection URI to which the authorization server will send the
        user-agent back once access is granted (or denied).

   (B)  The authorization server authenticates the resource owner (via
        the user-agent) and establishes whether the resource owner
        grants or denies the client's access request.

   (C)  Assuming the resource owner grants access, the authorization
        server redirects the user-agent back to the client using the
        redirection URI provided earlier (in the request or during
        client registration).  The redirection URI includes an
        authorization code and any local state provided by the client
        earlier.

   (D)  The client requests an access token from the authorization
        server's token endpoint by including the authorization code
        received in the previous step.  When making the request, the
        client authenticates with the authorization server.  The client
        includes the redirection URI used to obtain the authorization
        code for verification.

   (E)  The authorization server authenticates the client, validates the
        authorization code, and ensures that the redirection URI
        received matches the URI used to redirect the client in
        step (C).  If valid, the authorization server responds back with
        an access token and, optionally, a refresh token.

Chúng  ta có thể thay thế bước A, B thành 1 flow khác để lấy được Authorization Code. Chẳng  hạn như oauth server sẽ gửi  về một mã OTP cho Resource Owner và họ sẽ nhập vào client app. Các bước sau tương tự.

Các function cần phải implement trong model:

-   [generateAccessToken(client, user, scope, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-generateaccesstoken):**optional**, oauth2-server đã implement rồi
-   [generateRefreshToken(client, user, scope, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-generaterefreshtoken):**optional**, oauth2-server đã implement rồi
-   [generateAuthorizationCode(client, user, scope, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-generateauthorizationcode):**optional**, oauth2-server đã implement rồi
-   [getAuthorizationCode(authorizationCode, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-getauthorizationcode): Lấy ra Authorization Code object từ database
-   [getClient(clientId, clientSecret, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-getclient): Lấy  client object từ database
-   [saveToken(token, client, user, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-savetoken): Save token object vào database
-   [saveAuthorizationCode(code, client, user, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-saveauthorizationcode): Save Authorization code object vào database
-   [revokeAuthorizationCode(code, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-revokeauthorizationcode): Xoá Authorization code khỏi database
-   [validateScope(user, client, scope, [callback])](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-validatescope): Verify scope

Base trên authorization code grant type, chúng ta tạo ra kiểu verify bằng phone number. Đầu tiên người  dùng sẽ nhập số điện thoại trên app -> gửi request lên server để sinh ra mã OTP. Mã OTP này  sau được gửi đến người dùng (ở đây chính là authorization code). Thay vì nguyên bản của grant type này phải gửi user credentials hoặc người dùng phải login thì bây giờ chứng thực bằng OTP.

```c
curl --location --request POST 'http://localhost:3000/oauth/phone-authorize' \
--header 'Authorization: Basic YXBwbGljYXRpb25faWQ6YXBwbGljYXRpb25fc2VjcmV0' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'phone=123456789' \
--data-urlencode 'client_id=YXBwbGljYXRpb25faWQ6YXBwbGljYXRpb25fc2VjcmV0' \
--data-urlencode 'response_type=code'
```
Lưu ý client_id được tạo thành bằng: encodeBase64(clientId:clientSecret). Request này sẽ trigger server trả về OTP cho user.

Người dùng sau khi có mã OTP sẽ nhập vào app để tạo request lấy token. Lưu ý phải include client credentials vào header, user credentials và grant type vào trong request body:

-   **Headers**
    -   **Authorization**:  `"Basic " + clientId:clientSecret base64'd`

        -   (for example, to use  `application:secret`, you should send  `Basic YXBwbGljYXRpb246c2VjcmV0`)
    -   **Content-Type**:  `application/x-www-form-urlencoded`

-   **Body**
    -   `grant_type=authorization_code&code=1234`
        -   (contains 2 parameters:  `grant_type`,  `code` )
```c
curl --location --request POST 'http://localhost:3000/oauth/token' \
--header 'Authorization: Basic YXBwbGljYXRpb25faWQ6YXBwbGljYXRpb25fc2VjcmV0' \
--data-urlencode 'code=1234' \
--data-urlencode 'grant_type=authorization_code'
```
