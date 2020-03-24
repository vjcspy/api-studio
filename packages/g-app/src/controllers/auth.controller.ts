// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {post} from '@loopback/openapi-v3';

export class AuthController {
  constructor() {
  }

  @post('/auth/generate-otp')
  generateOtp() {
    return 'otp';
  }

  @post('/auth/get-token')
  getToken() {
    return 'token';
  }
}
