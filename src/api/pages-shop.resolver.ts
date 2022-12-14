import { Args, Query, Resolver } from '@nestjs/graphql'
import { Ctx, RelationPaths, Relations, RequestContext } from '@vendure/core'
import { QueryPageArgs } from '../ui/generated/ui-types'
import { Page } from '../entities/page.entity'
import { QueryPageBySlugArgs, QueryPagesBySectionArgs } from '../ui/generated/shop-types'
import { PagesService } from '../service/pages.service'

@Resolver()
export class PagesShopResolver {
    constructor(private pagesService: PagesService) {}

    @Query()
    async page(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPageArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ) {
        return this.pagesService.findOne(ctx, args.id, relations)
    }
    @Query()
    async pageBySlug(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPageBySlugArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ) {
        return this.pagesService.findBySlug(ctx, args.slug, relations)
    }

    @Query()
    async pagesBySection(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPagesBySectionArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ) {
        return this.pagesService.findBySection(ctx, args.sections || [], args.options, relations)
    }
}
