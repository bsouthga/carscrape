import csv from 'fast-csv';
import fs  from 'fs';
import _   from 'lodash';

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


/**
 * Recursively flatten an object
 */
export function flatten(obj) {
  const out = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Object) {
      for (const innerKey in flatten(value)) {
        const innerValue = value[innerKey];
        out[`${key}_${innerKey}`] = innerValue;
      }
    } else if (!(value instanceof Array)) {
       out[key] = value;
    }
  }

  return out;
}
