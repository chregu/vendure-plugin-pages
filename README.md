# vendure-plugin-pages

A simple plugin to manage "static" pages for your frontend.

You can create/edit such pages in the vendure backend with multi-lingual pages.

It's more of a proof of concept than an "out-of-the-box" solution (for now?). But will maybe help others in getting up to speed.

Check out the code and put it into your `src/plugins` folder. Also add the `PagesPlugin` to your `src/vendure-config.ts` config.

And then generate some migrations for it `yarn migration:generate pages` should do it for you (untested)