# vendure-plugin-pages

A simple plugin to manage "static" (or CMS) pages for your frontend.

You can create/edit such pages in the vendure backend with multi-lingual pages.

It's more of a proof of concept than an "out-of-the-box" solution (for now, at least, I don't plan to publish it as npm package, but the skeleton would be here). 
But will others help others in getting up to speed.

To use: get the code and move the code from the src folder and put it into a `src/plugins/pages` folder. Also add the `PagesPlugin` to your `src/vendure-config.ts` config.

```ts
import { PagesPlugin } from './plugins/pages/pages-plugin'

export const config: VendureConfig = {
    //...
    plugins: [
      //...
      PagesPlugin,
    ]
}
```

Also add `PagesPlugin.ui` to the `extensions` in `compileUiExtensions` in the `AdminUiPlugin.init` section

```ts
import { PagesPlugin } from './plugins/pages/pages-plugin'
//...
export const config: VendureConfig = {
    //...
    plugins: [
        //...
        AdminUiPlugin.init({
            port: 3002,
            route: 'admin',
            app: compileUiExtensions({
                outputPath: path.join(__dirname, '../admin-ui'),
                extensions: [PagesPlugin.ui],
            }),
        }),
    ]
}

```

And then generate some migrations for it. `yarn migration:generate pages` should do it for you (untested...)

## Querying pages

To get a page in your frontend, you can do a GraphQL request to the shop API like this

```graphql
query {
  pageBySlug(slug:"uber-uns", languageCode:de) {
    slug
    text
    title
   
  }
}

```
To get all pages for a section (make sure, the endpoint uses the correct languageCode parameter, eg: `https://localhost:3000/shop-api?languageCode=de)
``` 
query {
  pagesBySection(section:"footer") {
    slug
    text
    title
   
  }
}
```



## GraphQL Codegen

This repository can automatically generate GraphQL types for use in the plugin code (see `src/e2e/plugin.e2e-spec.ts`).  To generate the types, ensure the development server is running, and use the command:

```bash
yarn dev:generate-types
```

## Linting

This repository uses [eslint](https://eslint.org/) & [Prettier](https://prettier.io/) for finding and fixing common code issues and formatting your code in a standard way. To identify and fix issues, use the command:

```bash
yarn lint:fix
```

## Development Server

A development server is configured in the `dev-server` folder, using [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) to spin up a Postgres database, as well as a server and worker.  This is used to test the plugin during development.

To start the server, run:

```bash
yarn dev:run
```

To populate or reset the database, run the following command:

```bash
yarn dev:populate
```

To restart the server (only) after a change, use the following command:

```bash
yarn dev:restart
```

Note: The Docker containers must be rebuilt when updating dependencies.  Use the following command:

```bash
yarn dev:rebuild
```