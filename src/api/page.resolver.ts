import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { Ctx, RequestContext } from '@vendure/core'
import { Page } from '../entities/page.entity'
import { PageTranslationsArgs } from '../ui/generated/shop-types'

@Resolver('Page')
export class PageResolver {
    @ResolveField()
    translations(@Ctx() ctx: RequestContext, @Parent() page: Page, @Args() args: PageTranslationsArgs) {
        if (!args.languageCode) {
            return page.translations
        }
        // if we have many languages, this better would be filtered on the SQL level
        return page.translations.filter(translation => translation.languageCode === args.languageCode)
    }
}
