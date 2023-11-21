# repo using esmodules with Apps Script

Currently, Google Apps Script does **not** support ES modules. Hence the typical `export`/`import` pattern cannot be used and will fail.

The trick here is to make sure not to export any functions in your entry point code, e.g. `index.ts`, _and_ to prevent any generation of export statement in the final bundle (see the custom rollup plugin in [rollup.config.js](./rollup.config.js).


## Pre requisites

* Terminal with linux-like abilities (windows users : use WSL)
* Node installed (at least last LTS version)
* Your favorite IDE
* [clasp](https://www.npmjs.com/package/@google/clasp) installed & configured 
* (recommended) GIT

## ⚠️ BOILERPLATE USAGE WARNING ⚠️
Don't forget to run `git remote remove origin` after cloning this boilerplate
**dont push production code in this boilerplate**

## Usage

* Add your script id to [.clasp.json](./.clasp.json)
* Put your code into [index.ts](./src/index.ts)

## Install Packages

`npm install` / `npm i`

## Run tests

`npm run test` > with code coverage generation

`npm run test:watch` > watcher mode / no code coverage

## Build

`npm run build`

unused code will be removed through this process

html files stay untouched during this process but are copied in the "build" folder

## Deploy (this will also build)

`npm run push`

# folder structure (WIP)

### what is domain / infra related to ?


| Domain | Infra |
| ----------- | ----------- |
| **domain** code must not be related to google API | **infra** for "infrastructure" include code related to google API |
| **domain** code consist of pure fonction, without side effects | **infra** methods should remain as thin and dumb as possible in order to ensure all business logic is located to the domain side (which is testable) |
| **domain** code is easily testable | |

| Folder | Description |
| ----------- | ----------- |
| /src/domain | generic domain methods & constants |
| /src/html | html files of the project |
| /src/infra | generic infra related methods |
| /src/legacy | place to put old unoptimized code coming of a migration from an existing project |
| /src/lib | common utility methods shared through multiple projects |
| /src/index.ts | entry point of the application <br /> typically where you put "onOpen" function <br /> **no exports allowed here** |
| /src/services | for usecases shared between multiple usecases |
| /src/usecase | every buttons / menu item should redirect to one (and only one) usecase <br /> usecase are organized in separate subfolders |
| /src/usecase/[usecaseName]/domain | usecase specific domain methods & constants |
| /src/usecase/[usecaseName]/test | test assertions related to domain |
| /src/usecase/[usecaseName]/infra | usecase specific infra methods |


**possible upcoming changes :**
* better separation between generic & specific types
* type declaration files inside each usecases needing it