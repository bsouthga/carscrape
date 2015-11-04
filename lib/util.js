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
export function flatten(obj, toString) {
  const out = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Object) {
      const flat = flatten(value);
      for (const innerKey in flat) {
        const innerValue = flat[innerKey];
        out[`${key}_${innerKey}`] = innerValue && innerValue.toString && toString ?
          innerValue.toString(): innerValue;
      }
    } else {
       out[key] = value && value.toString && toString ?
        value.toString(): value;
    }
  }

  return out;
}
