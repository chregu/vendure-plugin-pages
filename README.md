# vendure-plugin-pages

A simple plugin to manage "static" (or CMS) pages for your frontend.

You can create/edit such pages in the vendure backend with multi-lingual pages.

It's more of a proof of concept than an "out-of-the-box" solution (for now?). But will maybe help others in getting up to speed.

Check out the code and move the code from the src folder and put it into a `src/plugins/pages` folder. Also add the `PagesPlugin` to your `src/vendure-config.ts` config.

```ts
import { PagesPlugin } from './plugins/pages/pages-plugin'

plugins: [
  PagesPlugin
  ...
]
```

Also add `PagesPlugin.ui` to the `extensions` in `compileUiExtensions` in the `AdminUiPlugin.init` section

```ts
import { PagesPlugin } from './plugins/pages/pages-plugin'

plugins: [
  AdminUiPlugin.init({
    port: 3002,
    route: 'admin',
    app: compileUiExtensions({
      outputPath: path.join(__dirname, 'admin-ui'),
      extensions: [PagesPlugin.ui],
    }),
  }),
];

```

And then generate some migrations for it. `yarn migration:generate pages` should do it for you (untested...)