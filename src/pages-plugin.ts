import { PluginCommonModule, VendurePlugin } from '@vendure/core'
import { AdminUiExtension } from '@vendure/ui-devkit/compiler'
import path from 'path'
import { Page } from './entities/page.entity'
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions'
import { PagesAdminResolver } from './api/pages-admin.resolver'
import { PagesShopResolver } from './api/pages-shop.resolver'
import { PageTranslation } from './entities/page-translation.entity'

@VendurePlugin({
    imports: [PluginCommonModule],

    entities: [Page, PageTranslation],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [PagesShopResolver],
    },
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [PagesAdminResolver],
    },
})
export class PagesPlugin {
    static ui: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        ngModules: [
            {
                type: 'shared',
                ngModuleFileName: 'pages-ui-extension.module.ts',
                ngModuleName: 'PagesUiExtensionModule',
            },
            {
                type: 'lazy',
                route: 'pages',
                ngModuleFileName: 'pages-ui-lazy.module.ts',
                ngModuleName: 'PagesUiLazyModule',
            },
        ],
    }
}