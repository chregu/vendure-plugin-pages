import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
    Allow,
    Ctx,
    Permission,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction,
    Translated,
} from '@vendure/core'
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

@Resolver()
export class PagesAdminResolver {
    constructor(private pagesService: PagesService) {}

    @Query()
    @Allow(Permission.ReadCatalog)
    async pages(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPagesArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ): Promise<PaginatedList<Translated<Page>>> {
        return this.pagesService.findAll(ctx, args.options, relations)
    }

    @Query()
    async page(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPageArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ) {
        return this.pagesService.findOne(ctx, args.id, relations)
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateCatalog)
    async updatePage(@Ctx() ctx: RequestContext, @Args() { input }: MutationUpdatePageArgs) {
        return this.pagesService.update(ctx, input)
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.CreateCatalog)
    async createPage(@Ctx() ctx: RequestContext, @Args() { input }: MutationCreatePageArgs) {
        return this.pagesService.create(ctx, input)
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.DeleteCatalog)
    async deletePage(@Ctx() ctx: RequestContext, @Args() { input }: MutationDeletePageArgs): Promise<boolean> {
        return this.pagesService.delete(ctx, input.id)
    }
}
