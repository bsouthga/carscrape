/**
 * API abstraction for edmunds.com
 */

import _       from 'lodash';
import OAuth   from 'oauth';
import moment  from 'moment';
import request from 'request-promise';

export default Object.assign(edmunds, {
  API,
  edmunds
});

// easy invocation helper
function edmunds(opts) {
  return new API(opts);
}


class API {

  // starting point of api requests
  baseUrl = 'https://api.edmunds.com/api/';

  // new API(...)
  constructor({ key, client_id, client_secret }) {
    if (!(key || (client_id && client_secret))) {
      throw new Error(
        'key or (client_id + client_secret) required for api access'
      );
    }

    if (key && !(client_id && client_secret)) {
      console.warn('client_id && client_secret required for inventory api');
    }

    Object.assign(this, {
      key, // public api access
      client_id,
      client_secret,
      token: null,
      tokenExpires: new Date() // immediately expire so we generate new one
    });
  }

  // get Oauth2 access token
  async auth() {
    const { client_secret, client_id } = this;

    // oath helper object
    var oauth2 = new OAuth.OAuth2(
      client_id,
      client_secret,
      'https://api.edmunds.com/inventory/token',
      null,
      'oauth2/token',
      null
    );

    // set expiration date for this token
    this.tokenExpires = moment().add(1, 'hour').toDate();

    // request access token from edmunds
    const access_token = await new Promise(
      (res, rej) => oauth2.getOAuthAccessToken(
        '',
        { grant_type : 'client_credentials' },
        (e, token) => e ? rej(e) : res(token)
      )
    );

    return access_token;
  }

  // make a request to the api,
  // api.get('inventory/v2/inventories', opts).then(...);
  async get(type, opts) {

    const options = {
      pagesize: 50,
      fmt: 'json',
      ...opts
    }

    // if hitting inventory api, require access token
    if (!this.key || /^inventory/.test(type)) {
      // if our token has expired, generate a new one
      if (!this.tokenExpires < new Date() || !this.token) {
        this.token = await this.auth();
      }
      options.access_token = this.token;
    } else {
      options.key = this.key;
    }

    // build request uri
    const encode = encodeURIComponent,
          params = _(options)
            .map((value, key) => `${encode(key)}=${encode(value)}`)
            .join('&'),
          uri = `${this.baseUrl}${type}?${params}`;

    return JSON.parse(await request(uri));
  }

}
