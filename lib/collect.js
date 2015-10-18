import edmunds from './api';
import moment  from 'moment';
import args    from 'yargs';
import csv     from 'fast-csv';
import fs      from 'fs';
import _       from 'lodash';
import { sleep, getCsv } from './util';

const argv = args.argv;

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
        api            = edmunds(require('./credentials.json'));

  writableStream.on("finish",  () => {
    console.log("-> finished writing results...");
  });

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

      // walk through the pages of the api response
      try {

        let nextUrl,
            lastUrl,
            pagenum = 0;

        do {
          pagenum++

          const data = await api
            .get('inventory/v2/inventories', {
              pagenum,
              zipcode: zip,
              make:    car.Make,
              model:   car.Model,
              radius:  50,
              status:  'new'
            });

          // sleep for one second before making another request
          await sleep(1000);

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
