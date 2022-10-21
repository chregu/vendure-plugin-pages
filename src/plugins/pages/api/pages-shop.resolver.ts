import { Args, Query, Resolver } from '@nestjs/graphql'
import { Ctx, ListQueryBuilder, RequestContext, TransactionalConnection } from '@vendure/core'
import { QueryPageArgs } from '../ui/generated/ui-types'
import { Page } from '../entities/page.entity'
import { QueryPageBySlugArgs } from '../ui/generated/shop-types'
import { PageTranslation } from '../entities/page-translation.entity'

@Resolver()
export class PagesShopResolver {
    constructor(private connection: TransactionalConnection, private listQueryBuilder: ListQueryBuilder) {}

    @Query()
    async page(@Ctx() ctx: RequestContext, @Args() args: QueryPageArgs) {
        return this.connection.getRepository(ctx, Page).findOne(args.id, {})
    }
    @Query()
    async pageBySlug(@Ctx() ctx: RequestContext, @Args() args: QueryPageBySlugArgs) {
        return this.connection.getRepository(ctx, PageTranslation).findOne({
            where: { languageCode: args.languageCode, slug: args.slug },
        })
    }
}
