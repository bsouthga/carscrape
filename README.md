## Edmunds.com scraping script

### Requirements

[NodeJS](https://nodejs.org/en/) is required to run this script.

### Installation

After installing [NodeJS](https://nodejs.org/en/), clone this repository and
navigate to it's directory in your terminal.

Next, run `npm install` to install the dependencies.

### Usage

To scrape a list of cars and locations, run the following command...

```shell
./scrape -c cars.csv -l locations.csv
```

This will produce an output csv file with a name something like `results_2015-10-03T04:00:00.000Z.csv`.
