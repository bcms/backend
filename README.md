# BCMS Backend

This is a repository for the BCMS Backend project which is a core module of the [BCMS](https://github.com/becomesco/cms) . It provides REST API for the [BCMS UI](https://github.com/becomesco/cms-ui) securely. This API is currently accessible in 3 ways:

- Using [BCMS SDK](https://github.com/becomesco/cms-sdk) in conjunction with a VueJS framework - It provides a lot of features in addition to automated security and API calls. Some of them are client side caching, error handling, type system and many more.
- Using [BCMS Client](https://github.com/becomesco/cms-client)
- Using HTTP requests (REST) - List of endpoints can be seen in [BCMS API docs](https://thebcms.com/api/v1/docs).

## For Developers

BCMS Backend is written using [Purple Cheetah](https://github.com/becomesco/purple-cheetah) tool set and if you are not familiar with it, it would be a good idea to check it out. This project depends on the [BCMS Shim](https://github.com/becomesco/cms-shim) and it must be run in conjunction with the backend. Before you get started developing, you will need to install:

- [Docker](https://www.docker.com/),
- [Docker Compose](https://docs.docker.com/compose/),
- [NodeJS](https://nodejs.org/) and
- [NPM](https://www.npmjs.com/)

You can use [YARN](https://yarnpkg.com/) but NPM is recommended.

### Get started

- Clone the repository: `git clone git@github.com:becomesco/cms-backend`,
- Install dependencies: `npm i`,
- **Full** - `docker-compose up`
- **Standalone development - BCMS Shim and Proxy will not be started** - `docker-compose -f compose-standalone.yml up` (have in mind that you will need Shim running in a separate container)
- Done, once you change something in the `./src` application will be reloaded. Make sure to use `docker-compose build` if needed.
