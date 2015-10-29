## Edmunds.com api access script

### Requirements

[NodeJS](https://nodejs.org/en/) and a shell environment with bash is required to run this script.

Mac users, terminal uses Bash, so you are good to go.

Windows users, as windows does not come with a Bash shell, try installing [cygwin](http://cygwin.com/install.html) or use [git bash](https://git-for-windows.github.io/)

Developer note:

The javascript in this project is written using modern ES6/7 Syntax
and therefore must be run/compiled with [BabelJS](https://babeljs.io/). No further
effort is necessary though, as babel is included as an `npm` dependency, and
the script utilizes `babel-node` to run the javascript.

### Installation

1. install [NodeJS](https://nodejs.org/en/)

2. Clone this repository by running (or download the zip file)...
    `git clone https://github.com/bsouthga/carscrape.git`

3. Navigate to the project folder (`carscrape`) in your bash shell

4. Run `npm install` to install the dependencies.

### Usage

To scrape a list of cars and locations, run the following command...

```shell
./scrape -v vehicles.csv -l locations.csv -c credentials.json
```

Where `credentials.json` are your api credentials to the Edmunds api, of the format...

```json
{
  "client_id": "ENTER YOUR SECRET ID",
  "client_secret": "ENTER YOUR SECRET KEY"
}
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

Edmunds.com api scraping script...

EXAMPLE

  ./scrape -v vehicles.csv -l locations.csv -c credentials.json -o out.csv

OPTIONS

  -v : csv file of vehicles to scrape, must contain 'Make' and 'Model' columns
        additionally, vehicle make and model must appear on lookup on edmunds.com

  -l : csv file of locations to scrape, must contain 'ZIP'

  -c : json file of credentials for api access, should be of the form...
        {
          \"client_id\": \"ENTER YOUR SECRET ID\",
          \"client_secret\": \"ENTER YOUR SECRET KEY\"
        }

  -o : (optional) filename of output csv, if omitted, data will be output
       to file named 'results_(unix timestamp).csv'

  -h : show this message
```
