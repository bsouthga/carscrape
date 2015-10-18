## Edmunds.com scraping script

### Requirements

[NodeJS](https://nodejs.org/en/) is required to run this script.

Developer note:

The javascript in this project is written using modern ES6/7 Syntax
and therefore must be run/compiled with [BabelJS](https://babeljs.io/). No further
effort is necessary though, as babel is included as an `npm` dependency, and
the script utilizes `babel-node` to run the javascript.

### Installation

After installing [NodeJS](https://nodejs.org/en/), clone this repository and
navigate to it's directory in your terminal.

Next, run `npm install` to install the dependencies.

### Usage

To scrape a list of cars and locations, run the following command...

```shell
./scrape -c cars.csv -l locations.csv
```

This will produce an output csv file with a name something like `results_1444696434.csv`
(the number is the current unix timestamp).

For help with usage, run...

```shell
./scrape -h
```

you should see...

```
Usage for ./scrape...

  EXAMPLE

    ./scrape -v vehicles.csv -l locations.csv -o out.csv

  OPTIONS

    -v : csv file of vehicles to scrape, must contain 'Make' and 'Model' columns
          additionally, vehicle make and model must appear on lookup on edmunds.com

    -l : csv file of locations to scrape, must contain 'ZIP'

    -o : (optional) filename of output csv, if omitted, data will be output
         to file named 'results_(unix timestamp).csv'

    -h : show this message
```
