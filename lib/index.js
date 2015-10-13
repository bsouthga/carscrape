import _       from 'lodash';
import cheerio from 'cheerio';
import moment  from 'moment';
import request from 'request-promise';
import csv     from 'fast-csv';
import args    from 'yargs';
import fs      from 'fs';


// delay between requests while scrapingc
const requestDelay = 10,
      radius = 50, // mile radius to search
      root = 'http://www.edmunds.com',
      date = moment().startOf('day').toISOString(),
      argv = args.argv;


async function sleep() {
  return new Promise(res => setTimeout(res, requestDelay));
}


async function getCsv(fileName) {
  const stream = fs.createReadStream(fileName),
        out = [];

  await new Promise((res, rej) => {
    csv
     .fromStream(stream, {headers : true})
     .on("data", data => out.push(data))
     .on("error", rej)
     .on("end", res);
  });

  return out;
}


async function carSearch(params) {

  const base = `${root}/inventory/srp.html`,
        e    = encodeURIComponent,
        p    = _.map(params, (v, k) => `${e(k)}=${e(v)}`),
        url  = `${base}?${p.join('&')}`;

  return cheerio.load(await request(url));
}


async function getCarDetails(url) {

  const $     = cheerio.load(await request(`${root}${url}`)),
        text  = c => $(c).text().replace(/\s+/g, ' ').trim(),
        color = c => $(c).css('background-color');

  return {
    url,
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


async function walkSearchResults(params, csvStream) {

  const results = [];

  console.log(`-> Searching for ${params.make} ${params.model} near ${params.zip}...`);
  let $ = await carSearch(params);

  do {

    const title = $('h1.gutter-top-1').text(),
          page  = $('.listingsCurrentJumpPage').text();

    console.log(
      `-> Reading page ${page} of results for ${title}...`
        .replace(/\s+/g, ' ')
        .trim()
    );

    const listings = $('.pod li.listing-entry-wrap').toArray();

    for (const node of listings) {
      await sleep();
      const url = $(node).find('.vehicle-name a').attr('href');
      const data = await getCarDetails(url);

      if (csvStream) {
        csvStream.write(data);
      } else {
        results.push(data)
      }
    }

    const url = `${root}${$('.listingsNextPage a').attr('href')}`;
    $ = cheerio.load(await request(url));

  } while($('.listingsNextPage a').attr('href'))

  if (!csvStream) {
    return results;
  }
}


async function scrape() {


  const csvStream      = csv.format({headers: true}),
        csvFileName    = typeof argv.csv === 'string' ?
                           argv.csv :
                           `./results_${moment().unix()}.csv`,
        writableStream = fs.createWriteStream(csvFileName),
        cars           = await getCsv(argv.vehicles),
        locations      = await getCsv(argv.locations),
        firstCar       = cars[0];

  writableStream.on("finish",  () => console.log("done!"));

  csvStream.pipe(writableStream);

  for (const city of locations) {
    if (!city.ZIP) {
      console.log('\'ZIP\' required for city search, skipping...');
      continue;
    }

    const zip = city.ZIP.length === 4 ? `0${city.ZIP}` : city.ZIP;

    for (const car of cars) {
      if (!car.Make && car.Model) {
        console.log('\'Make\' and \'Model\' required for all cars, skipping...');
        continue;
      }

      await walkSearchResults({
        radius,
        zip,
        year:   2015,
        make:   car.Make,
        model:  car.Model
      }, csvStream);
    }
  }

  csvStream.end();
}

scrape().catch(error => console.log(error.stack || error));
