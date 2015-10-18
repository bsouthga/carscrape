import _       from 'lodash';
import request from 'request-promise';

export default edmunds;

function edmunds(opts) {
  return new API(opts);
}

export class API {

  baseUrl = 'https://api.edmunds.com/api/vehicle/v2/';

  constructor({ key, client_id, client_secret }) {
    Object.assign(this, {
      key,
      client_id,
      client_secret
    });
  }

  vehicle(type, options) {
    return this.get(`vehicle/v2/${type}`, options);
  }

  inventory(type, options) {
    return this.get(`inventory/v2/${type}`, options);
  }

  async authorize() {
    const { client_secret, client_id } = this;

    const response = await request({
      method: 'POST',
      uri: 'https://api.edmunds.com/inventory/token',
      body: {
        grant_type: 'client_credentials',
        client_secret,
        client_id
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      json: true // Automatically stringifies the body to JSON
    });
  }

  async get(type, options) {

    let url = `${this.baseUrl}${type}?fmt=json&api_key=${this.key}`;

    const e = encodeURIComponent,
          params = _(options)
            .map((value, key) => `${e(key)}=${e(value)}`)
            .join('&');

    if (params) {
      url += `&${params}`;
    }

    return await request(url);
  }

}
