# autoingesttool

[![Travis Build on branch master](https://img.shields.io/travis/linitix/autoingesttool/master.svg?style=flat-square)](https://travis-ci.org/linitix/autoingesttool/branches) [![NPM total downloads per month](https://img.shields.io/npm/dm/autoingesttool.svg?style=flat-square)](https://www.npmjs.com/package/autoingesttool) [![David dependencies](https://img.shields.io/david/linitix/autoingesttool.svg?style=flat-square)](https://david-dm.org/linitix/autoingesttool) [![David dev dependencies](https://img.shields.io/david/dev/linitix/autoingesttool.svg?style=flat-square)](https://david-dm.org/linitix/autoingesttool) [![CodeClimate](https://img.shields.io/codeclimate/github/linitix/autoingesttool.svg?style=flat-square)](https://codeclimate.com/github/linitix/autoingesttool)

Apple Auto-Ingest tool written in JavaScript for NodeJS.

## Prerequesites

Download the [iTunes Connect Sales And Trends Guide Apps](http://www.apple.com/itunesnews/docs/AppStoreReportingInstructions.pdf) PDF file.

## Dependencies

* [is-my-json-valid](https://www.npmjs.org/package/is-my-json-valid) : A JSONSchema validator that uses code generation to be extremely fast.
* [mkdirp](https://www.npmjs.org/package/mkdirp) : Recursively mkdir, like "mkdir -p".
* [async](https://www.npmjs.org/package/async) : Higher-order functions and common patterns for asynchronous code.
* [request](https://www.npmjs.org/package/request) : Simplified HTTP request client.
* [moment](https://www.npmjs.org/package/moment) : Parse, manipulate, and display dates.
* [clone](https://www.npmjs.org/package/clone) : Deep cloning of objects and arrays.
* [lodash](https://www.npmjs.com/package/lodash) : Lodash modular utilities

## Features

* Automatic validation of all parameters.
* Asynchronous report download.
* Automatic extraction of downloaded report archive.
* Automatic creation of report file formatted in JSON.
* Choose where all files will be created.
* Downloading cancelled if archive already exists.
* Extraction cancelled if text file already exists.

## Installation

``` 
$ npm install [--save] autoingesttool
```

## Usage

First you need to import the module.

``` javascript
var AutoIngestTool = require("autoingesttool");
```

Create a JSON object with all required parameters for `Sales` report.

| Property       | Type   | Description                              | Possible values                          | Required |
| -------------- | ------ | ---------------------------------------- | ---------------------------------------- | :------- |
| username       | string | iTunes Connect account username which have access to the Sales and Trends reports. | -                                        | **YES**  |
| password       | string | iTunes Connect account password.         | -                                        | **YES**  |
| vendor_number  | string | iTunes Connect vendor number.            | -                                        | **YES**  |
| report_type    | string | Report type. [Learn more](http://help.apple.com/itc/appsreporterguide/#/itc5c4817729) | Sales, Newsstand                         | **YES**  |
| report_subtype | string | Report subtype. [Learn more](http://help.apple.com/itc/appsreporterguide/#/itc5c4817729) | Summary, Detailed, Opt-In                | **YES**  |
| date_type      | string | Date type. [Learn more](http://help.apple.com/itc/appsreporterguide/#/itc5c4817729) | Daily, Weekly, Monthly, Yearly           | **YES**  |
| report_date    | string | Date of the report. [Learn more](http://help.apple.com/itc/appsreporterguide/#/itc5c4817729) | *YYYYMMDD* (Daily and Weekly), *YYYYMM* (Monthly), *YYYY* (Yearly) | NO       |

``` javascript
// Sales
var parameters = {
	username: "admin",
	password: "adminpasswd",
	vendor_number: "88776655",
	report_type: "Sales",
	report_subtype: "Summary",
	date_type: "Daily",
	report_date: "20160201"
};
```

Or you can create a JSON object to download `Financial` report.

| Property      | Type   | Description                              | Possible values | Required |
| ------------- | ------ | ---------------------------------------- | --------------- | :------- |
| username      | string | iTunes Connect account username which have access to the Sales and Trends reports. | -               | **YES**  |
| password      | string | iTunes Connect account password.         | -               | **YES**  |
| vendor_number | string | iTunes Connect vendor number including 2 leading zeroes. | -               | **YES**  |
| report_type   | string | Report type. [Learn more](http://help.apple.com/itc/appsreporterguide/#/itc82976faf8) | DRR             | **YES**  |
| region_code   | string | Two-character code of country of report to download. For a list of region codes, [see here](http://help.apple.com/itc/appsreporterguide/#/itc82976faf8). | -               | **YES**  |
| fiscal_year   | number | Four-digit year of report to download. Year is specific to Apple’s [fiscal calendar](http://www.apple.com/itunes/go/itunesconnect/financialreports) | -               | **YES**  |
| fiscal_period | number | Two-digit period in fiscal year of report to download (01-12). Period is specific to Apple’s [fiscal calendar](http://www.apple.com/itunes/go/itunesconnect/financialreports). | -               | **YES**  |

``` javascript
// Financial
var parameters = {
	username: "admin",
	password: "adminpasswd",
	vendor_number: "0088776655",
	report_type: "DRR",
	region_code: "US",
	fiscal_year: 2014,
	fiscal_period: 1
};
```

Then you need to create another JSON object with the paths where the archive will be downloaded, extracted and transformed. **IMPORTANT :** All parameters are required.

``` javascript
var paths = {
	archive: "/path/to/archive",
    report: "/path/to/extracted/archive",
    json_report: "/path/to/transformed/archive"
};
```

You can now call the desired method to download a `Sales` report or a `Financial` report.

``` javascript
// Download Sales report
AutoIngestTool.downloadSalesReport(salesParams, paths, function (err, updatedPaths) {
  if (err && (err instanceof AutoIngestTool.INVALID_PARAMETERS_ERROR))
    // Handle error
  if (err && (err instanceof AutoIngestTool.INVALID_PATHS_ERROR))
    // Handle error
  if (err && (err instanceof AutoIngestTool.EMPTY_FILE_ERROR))
    // Handle error
  if (err)
    // Handle error

  console.log(result);
});

// Download Financial report
AutoIngestTool.downloadFinancialReport(financialParams, paths, function (err, updatedPaths) {
  if (err && (err instanceof AutoIngestTool.INVALID_PARAMETERS_ERROR))
    // Handle error
  if (err && (err instanceof AutoIngestTool.INVALID_PATHS_ERROR))
    // Handle error
  if (err && (err instanceof AutoIngestTool.EMPTY_FILE_ERROR))
    // Handle error
  if (err)
    // Handle error

  console.log(result);
});
```

**IMPORTANT :**

- You can have an `INVALID_PARAMETERS_ERROR` or `INVALID_PATHS_ERROR` when there is an issue with the parameters or paths JSON.
- If you try to download a report that have not been generated yet by Apple, you will receive an `EMPTY_FILE_ERROR` because the module have downloaded an empty file. This empty file will be removed automatically.

If there is no error, the callback will return an updated `paths` JSON object.

``` javascript
// updatedPaths
{
  archive: "/path/to/archive.txt.gz",
  report: "/path/to/extracted/archive.txt",
  json_report: "/path/to/transformed/archive.json"
}
```

Finally, you can open and parse the created JSON file and process it.

## Report Formats

### Sales Report

``` json
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

### Newsstand Report

``` json
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

### Opt-in Report

``` json
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

### Financial Report

``` json
[
    {
        "StartDate": "12/27/2015",
        "End Date": "01/30/2016",
        "UPC": null,
        "ISRC_ISBN": null,
        "VendorIdentifier": "APP001",
        "Quantity": 295,
        "PartnerShare": 2.10,
        "ExtendedPartnerShare": 619.50,
        "PartnerShareCurrency": "USD",
        "SalesorReturn": "S",
        "AppleIdentifier": "88776655",
        "Artist_Show_Developer_Author": "Developer name",
        "Title": "App Name",
        "Label_Studio_Network_Developer_Publisher": null,
        "Grid": null,
        "ProductTypeIdentifier": "1F",
        "ISAN_OtherIdentifier": null,
        "CountryOfSale": "US",
        "PreorderFlag": null,
        "PromoCode": null,
        "CustomerPrice": 2.99,
        "CustomerCurrency": "USD"
	},
	{
	    "TotalRows": 1,
	    "TotalUnits": 295,
	    "TotalAmount": 567
	}
]
```

## Unit Testing (only if you want to contribute)

Actually you can only test sales report (daily, weekly, monthly and yearly) downloading. **Why?** We haven't created yet newsstand applications to get access to newsstand and opt-in reports.

So feel free to add tests for these reports.

### How To

Install all dependencies and devDependencies

``` sh
$ npm install
```

Run test using `vows`

``` sh
$ vows tests/* --spec
```