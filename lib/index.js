import _       from 'lodash';
import cheerio from 'cheerio';
import moment  from 'moment';
import request from 'request-promise';

// delay between requests while scraping
const requestDelay = 1000;
const date = moment().startOf('day').toISOString();


async function sleep() {
  return new Promise(res => setTimeout(res, requestDelay));
}


async function carSearch(params) {
  console.log('  -> searching for cars...');

  const base = 'http://www.edmunds.com/inventory/srp.html',
        e    = encodeURIComponent,
        p    = _.map(params, (value, key) => `${e(key)}=${e(value)}`),
        url  = `${base}?${p.join('&')}`;

  return cheerio.load(await request(url));
}


async function getCarDetails(url) {
  console.log(`  -> getting car details...`);

  const $     = cheerio.load(await request(`http://www.edmunds.com${url}`)),
        text  = c => $(c).text().replace(/\s+/g, ' ').trim(),
        color = c => $(c).css('background-color');

  return {
    date,
    name:           text('h1 span[itemprop="name"]'),
    price:          $('meta[itemprop="price"]').attr('content'),
    vin:            text('.vi-details .vi-vin:nth-child(2)'),
    stock:          text('.vi-details .vi-vin:first-child'),
    exterior:       color('.ext-swatch.swatch'),
    interior:       color('.int-swatch.swatch'),
    dealer_name:    text('.vi-li-dn'),
    dealer_address: text('.dealer-address'),
    dealer_rating:  $('.rating-big').attr('title'),
    dealer_phone:   text('.vi-li-dp')
  };
}

async function scrape() {

  const $ = await carSearch({
    radius: 50,
    zip:    20001,
    year:   2015,
    make:   'BMW',
    model:  'i3',
    sub:    'i3 Hatchback',
    tko_v1: true
  });

  const listings = $('.pod li.listing-entry-wrap').toArray();

  for (const node of listings) {
    await sleep();
    const url = $(node).find('.vehicle-name a').attr('href');
    const data = await getCarDetails(url);
    console.log(data);
  }

}


scrape().catch(error => console.log(error.stack || error));
