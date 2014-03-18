# autoingesttool

Apple Auto-Ingest tool written in JavaScript for NodeJS.

## Prerequesites

Download the [iTunes Connect Sales And Trends Guide Apps](http://www.apple.com/itunesnews/docs/AppStoreReportingInstructions.pdf) PDF file.

## Dependencies

* [jsonschema](https://www.npmjs.org/package/jsonschema) : A fast and easy to use JSON schema validator.
* [mkdirp](https://www.npmjs.org/package/mkdirp) : Recursively mkdir, like "mkdir -p".
* [async](https://www.npmjs.org/package/async) : Higher-order functions and common patterns for asynchronous code.
* [request](https://www.npmjs.org/package/request) : Simplified HTTP request client.
* [moment](https://www.npmjs.org/package/moment) : Parse, manipulate, and display dates.
* [clone](https://www.npmjs.org/package/clone) : Deep cloning of objects and arrays.

## Features

* Automatic validation of all parameters.
* Asynchronous report download.
* Automatic extraction of downloaded report archive.
* Automatic creation of report file formatted in JSON.
* Choose where all files will be created.
* Downloading cancelled if archive already exists.
* Extraction cancelled if text file already exists.

## How To

### Install

```
$ npm install [--save] autoingesttool
```

### Use

###### ADD MODULE

```javascript
var AutoIngestTool = require("autoingesttool");
```

###### CREATE A JSON WITH ALL REQUIRED PARAMETERS

```javascript
var parameters = {
	username: "ITUNES_CONNECT_USERNAME",
    password: "ITUNES_CONNECT_PASSWORD",
    vendor_number: "ITUNES_CONNECT_VENDOR_NUMBER",
    report_type: "SALES | NEWSSTAND",
    report_subtype: "SUMMARY | DETAILED | OPT-IN",
    date_type: "DAILY | WEEKLY | MONTHLY | YEARLY",
    report_date: "DAILY=YYYYMMDD | MONTHLY=YYYYMM | YEARLY=YYYY"
};
```

**IMPORTANT :**

* Only `report_date` is optionnal.

###### CREATE A JSON WITH THE PATHS WHERE THE ARCHIVE WILL BE DOWNLOADED AND EXTRACTED

```javascript
var paths = {
	archive: "PATH_WHERE_ARCHIVE_WILL_BE_DOWNLOADED",
    report: "PATH_WHERE_ARCHIVE_WILL_BE_EXTRACTED",
    json_report: "PATH_WHERE_REPORT_WILL_BE_FORMATTED"
};
```

**IMPORTANT :**

* All parameters are required.

###### CALL `downloadReportInPathsWithParameters` METHOD

```javascript
AutoIngestTool.downloadReportInPathsWithParameters(
	parameters,
    paths,
    function (err, filesPath) {
    	if (err && (err instanceof AutoIngestTool.INVALID_PARAMETERS_ERROR)) return console.log(err);
        if (err && (err instanceof AutoIngestTool.INVALID_PATHS_ERROR)) return console.log(err);
        if (err && (err instanceof AutoIngestTool.EMPTY_FILE_ERROR)) return console.log(err);
    	if (err) return console.log(err);

        console.log(filesPath);
    }
);
```

The report formatted in JSON will have one of these structures :

* Sales report

```json
[
	{
    	"Provider": "APPLE",
    	"ProviderCountry": "US",
    	"SKU": "00000000",
    	"Developer": "ME",
    	"Title": "The Applicationssssss",
    	"Version": "7.1.2",
    	"ProductTypeIdentifier": "7T",
    	"Units": 11.00,
    	"DeveloperProceeds": 0.00,
    	"BeginDate": "03/13/2014",
    	"EndDate": "03/13/2014",
    	"CustomerCurrency": "JPY",
    	"CountryCode": "JP",
    	"CurrencyofProceeds": "JPY",
    	"AppleIdentifier": "111111111",
    	"CustomerPrice": 0.00,
    	"PromoCode": null,
    	"ParentIdentifier": null,
    	"Subscription": null,
    	"Period": null,
    	"Category": "Music"
	}
]
```

* Newsstand report

```json
[
	{
    	"Provider": "APPLE",
        "ProviderCountry": "US",
        "SKU": "00000000",
        "Developer": "ME",
        "Title": "Something",
        "Version": "1.2.3",
        "ProductTypeIdentifier": "1E",
        "Units": 1.00,
        "DeveloperProceeds": 1.00,
        "CustomerCurrency": "JPY",
        "CountryCode": "JP",
        "CurrencyofProceeds": "JPY",
        "AppleIdentifier": "11111111",
        "CustomerPrice": 1.00,
        "PromoCode": null,
        "ParentIdentifier": null,
        "Subscription": null,
        "Period": null,
        "DownloadDate": null,
        "CustomerIdentifier": null,
        "ReportDate": null,
        "SalesReturn": "S",
        "Category": "Here"
    }
]
```

* Opt-in report

```json
[
	{
    	"FirstName": "Oula",
        "LastName": "Hop",
        "EmailAddress": "oula.hop@splash.titi",
        "PostalCode": "22312334",
        "AppleIdentifier": "923843",
        "ReportStartDate": "10/10/2000",
        "ReportEndDate": "10/10/2001"
    }
]
```

**IMPORTANT :**

* You can have an `INVALID_PARAMETERS_ERROR` or `INVALID_PATHS_ERROR` when there is an issue with the parameters or paths JSON.
* If you try to download a report that have not been generated yet by Apple, you will receive an `EMPTY_FILE_ERROR` because the module have downloaded an empty file. This empty file will be removed automatically.
* If there is no error, the archive, report and json formatted report files path will be returned as a JSON.

## License

The MIT License (MIT)

Copyright (c) 2014 [Linitix](http://www.linitix.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Changes Log

###### 1.0.2

* Report JSON file is now an array of objects (Sales, Newsstand, Opt-in).

###### 1.0.1

* `OPT-IN` option move from `report_type` to `report_subtype` attribute.

###### 1.0.0

* module creation.