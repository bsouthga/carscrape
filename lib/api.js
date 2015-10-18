import _       from 'lodash';
import OAuth   from 'oauth';
import moment  from 'moment';
import request from 'request-promise';


export default edmunds;


function edmunds(opts) {
  return new API(opts);
}


function endpointMethods(...methods) {
  return classToWrap => {
    methods.forEach(method => {
      classToWrap.prototype[method] = function(...args) {
        return this.get(`${method}/v2`, ...args);
      }
    });
    return classToWrap;
  }
}


@endpointMethods(
  'vehicle',
  'inventory',
  'media',
  'dealer'
)
export class API {

  baseUrl = 'https://api.edmunds.com/api/';

  constructor({ key, client_id, client_secret }) {
    Object.assign(this, {
      key,
      client_id,
      client_secret,
      tokenExpires: new Date()
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

  async get(type, options) {
    // if our token has expired, generate a new one
    if (!this.tokenExpires < new Date() || !this.token) {
      this.token = await this.auth();
    }

    let uri = `${this.baseUrl}${type}?fmt=json&access_token=${this.token}`;

    const encode = encodeURIComponent,
          params = _(options)
            .map((value, key) => `${encode(key)}=${encode(value)}`)
            .join('&');

    if (params) {
      uri += `&${params}`;
    }

    return await request(uri);
  }

}

edmunds(require('./credentials.json'))
  .inventory('inventories', { zipcode: 94062 })
  .then(data => console.log(data))
  .catch(e => console.log(e.stack));
