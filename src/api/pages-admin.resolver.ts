import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Allow, Ctx, RelationPaths, Relations, RequestContext, Transaction, Translated } from '@vendure/core'
import {
    MutationCreatePageArgs,
    MutationUpdatePageArgs,
    QueryPageArgs,
    QueryPagesArgs,
    MutationDeletePageArgs,
} from '../ui/generated/ui-types'
import { Page } from '../entities/page.entity'
import { PaginatedList } from '@vendure/common/lib/shared-types'
import { PagesService } from '../service/pages.service'
import { PagesPermission } from '../pages-permission'

@Resolver()
export class PagesAdminResolver {
    constructor(private pagesService: PagesService) {}

    @Query()
    @Allow(PagesPermission.Read)
    async pages(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPagesArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ): Promise<PaginatedList<Translated<Page>>> {
        return this.pagesService.findAll(ctx, args.options, relations)
    }

    @Query()
    @Allow(PagesPermission.Read)
    async page(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPageArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ) {
        return this.pagesService.findOne(ctx, args.id, relations)
    }

    @Transaction()
    @Mutation()
    @Allow(PagesPermission.Update)
    async updatePage(@Ctx() ctx: RequestContext, @Args() { input }: MutationUpdatePageArgs) {
        return this.pagesService.update(ctx, input)
    }

    @Transaction()
    @Mutation()
    @Allow(PagesPermission.Create)
    async createPage(@Ctx() ctx: RequestContext, @Args() { input }: MutationCreatePageArgs) {
        return this.pagesService.create(ctx, input)
    }

    @Transaction()
    @Mutation()
    @Allow(PagesPermission.Delete)
    async deletePage(@Ctx() ctx: RequestContext, @Args() { input }: MutationDeletePageArgs): Promise<boolean> {
        return this.pagesService.delete(ctx, input.id)
    }
}
