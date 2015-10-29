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

  const csvStream      = csv.format({headers: true}),
        csvFileName    = typeof argv.csv === 'string' ?
                           argv.csv :
                           `./results_${moment().unix()}.csv`,
        writableStream = fs.createWriteStream(csvFileName),
        cars           = await getCsv(argv.vehicles),
        locations      = await getCsv(argv.locations),
        firstCar       = cars[0],
        api            = edmunds(require(path.resolve('./', argv.credentials)));

  writableStream.on("finish",  () => {
    console.log(`-> finished writing results to ${csvFileName}...`);
  });

  csvStream.pipe(writableStream);

  for (const car of cars) {

    if (!car.Make && car.Model) {
      console.log('\'Make\' and \'Model\' required for all cars, skipping...');
      continue;
    }

    const make = car.Make,
          model = car.Model;

    for (const city of locations) {

      if (!city.ZIP) {
        console.log('\'ZIP\' required for city search, skipping...');
        continue;
      }

      const zipcode = city.ZIP.length === 4 ? `0${city.ZIP}` : city.ZIP;


      // walk through the pages of the api response
      try {

        let nextUrl,
            lastUrl,
            pagenum = 0;

        do {
          pagenum++

          console.log(
            `Collecting page ${pagenum} of ${make} ${model} in zipcode ${zipcode} (api calls so far: ${api.calls})...`
          );

          const data = await api
            .get('inventory/v2/inventories', {
              pagenum,
              make,
              model,
              zipcode,
              radius:  50,
              status:  'new'
            });

          _.each(data.inventories, car => {
            csvStream.write({ collection_date: new Date(), ...flatten(car) });
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
