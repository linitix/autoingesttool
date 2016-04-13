# Changes Log

###### 2.1.1

* update dependencies version

###### 2.1.0

* reformat and refactor code
* add promise for sales report and financial report download
* add test suite for sales report using promise

###### 2.0.2

* avoid code duplication by moving some functions in `Helpers` module
* fix issue with `FinancialReporter` callback not used at the end

###### 2.0.0

* refactor module into 2 submodules `SalesReporter` and `FinancialReporter`
* add unit testing with `vows`
* upgrade project dependencies and devDependencies
* update README

###### 1.0.9

* update third party modules

###### 1.0.8

* remove travis.yml file
* remove Travis badge
* update third party modules
* add Gitter badge

###### 1.0.7

* remove OS restrictions
* refactor package.json file

###### 1.0.6

* add travis configuration file

###### 1.0.5

* add badges in README

###### 1.0.4

* remove debugging `console.log()`

###### 1.0.3

* remove last element in report JSON file. The last element is the empty line at the end of the report file

###### 1.0.2

* report JSON file is now an array of objects (Sales, Newsstand, Opt-in)

###### 1.0.1

* `OPT-IN` option move from `report_type` to `report_subtype` attribute

###### 1.0.0

* module creation