import moment             from 'moment';
import args               from 'yargs';
import csv                from 'fast-csv';
import fs                 from 'fs';
import path               from 'path';
import _                  from 'lodash';
import edmunds            from './api';
import { sleep, getCsv, flatten }  from './util';

const argv = args.argv;

if (!argv.credentials) {
  throw new Error('no --credentials <filename> flag given!');
}

collect()
  .catch(err => console.log(err));

async function collect() {

  const fixKeys = record => _.reduce(
    record,
    (out, value, key) => (out[key.trim().toLowerCase()] = value, out),
    {}
  );

  const csvStream      = csv.format({headers: true}),
        csvFileName    = typeof argv.csv === 'string' ?
                           argv.csv :
                           `./results_${moment().unix()}.csv`,
        writableStream = fs.createWriteStream(csvFileName),
        cars           = _.map(await getCsv(argv.vehicles), fixKeys),
        locations      = _.map(await getCsv(argv.locations), fixKeys),
        firstCar       = cars[0],
        api            = edmunds(require(path.resolve('./', argv.credentials)));


  writableStream.on("finish",  () => {
    console.log(`-> finished writing results to ${csvFileName}...`);
  });

  csvStream.pipe(writableStream);

  for (const car of cars) {

    if (!car.make && car.model) {
      console.log('\'Make\' and \'Model\' required for all cars, skipping...');
      continue;
    }

    const make = car.make,
          model = car.model;

    for (const city of locations) {

      if (!city.zip) {
        console.log('\'zip\' required for city search, skipping...');
        continue;
      }

      const radius = city.radius || defaultRadius;

      const zipcode = city.zip.length === 4 ? `0${city.zip}` : city.zip;


      // walk through the pages of the api response
      try {

        let nextUrl,
            lastUrl,
            pagenum = 0;

        do {
          pagenum++

          console.log(
            `Collecting page ${pagenum} of ${make} ${model} in zipcode ${zipcode} (api calls so far: ${api.calls + 1})...`
          );

          const data = await api
            .get('inventory/v2/inventories', {
              pagenum,
              make,
              model,
              zipcode,
              radius,
              status:  'new'
            });

          _.each(data.inventories, car => {
            const record = {
              search_state:     city.state,
              search_city:      city.city,
              search_radius:    radius,
              collection_date:  moment().format("MMM DD YYYY HH:mm:ss"),
              ...flatten(car)
            };

            csvStream.write(record);
          });

          // sleep for 1.1 seconds before making another request
          await sleep(argv.delay || 550);

          nextUrl = _.find(data.links, { rel: 'next' });
          lastUrl = _.find(data.links, { rel: 'last' });

        } while (nextUrl && nextUrl !== lastUrl);

      } catch (err) {
        console.log('API collection error: ', err);
      }

    }
  }

  csvStream.end();
}
