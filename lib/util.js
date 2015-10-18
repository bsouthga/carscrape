import csv from 'fast-csv';
import fs  from 'fs';

/**
 * return promise pausing for requestDelay
 */
export async function sleep(dur=requestDelay) {
  return new Promise(res => setTimeout(res, dur));
}


/**
 * return promise resolving to array of csv contents
 */
export async function getCsv(fileName) {
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
