import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
    Allow,
    assertFound,
    Ctx,
    ListQueryBuilder,
    Permission,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction,
    TransactionalConnection,
    TranslatableSaver,
    Translated,
    TranslatorService,
} from '@vendure/core'
import {
    MutationCreatePageArgs,
    MutationUpdatePageArgs,
    QueryPageArgs,
    QueryPagesArgs,
    MutationDeletePageArgs,
} from '../ui/generated/ui-types'
import { Page } from '../entities/page.entity'
import { ID, PaginatedList } from '@vendure/common/lib/shared-types'
import { PageTranslation } from '../entities/page-translation.entity'

@Resolver()
export class PagesAdminResolver {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private translator: TranslatorService,
        private translatableSaver: TranslatableSaver,
    ) {}

    @Query()
    @Allow(Permission.ReadCatalog)
    async pages(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPagesArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ): Promise<PaginatedList<Translated<Page>>> {
        const foo = this.listQueryBuilder
            .build(Page, args.options || undefined, {
                ctx,
                relations,
            })
            .getManyAndCount()
            .then(([pages, totalItems]) => {
                const items = pages.map(item => this.translator.translate(item, ctx))
                return {
                    items,
                    totalItems,
                }
            })
        return foo
    }

    @Query()
    async page(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryPageArgs,
        @Relations(Page) relations: RelationPaths<Page>,
    ) {
        return this.connection
            .getRepository(ctx, Page)
            .findOne(args.id, { relations })
            .then(page => page && this.translator.translate(page, ctx))
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateCatalog)
    async updatePage(@Ctx() ctx: RequestContext, @Args() { input }: MutationUpdatePageArgs) {
        const page = await this.translatableSaver.update({
            ctx,
            input,
            entityType: Page,
            translationType: PageTranslation,
        })

        return assertFound(this.findOne(ctx, page.id))
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.CreateCatalog)
    async createPage(@Ctx() ctx: RequestContext, @Args() { input }: MutationCreatePageArgs) {
        const page = await this.translatableSaver.create({
            ctx,
            input,
            entityType: Page,
            translationType: PageTranslation,
        })
        return assertFound(this.findOne(ctx, page.id))
    }
    @Transaction()
    @Mutation()
    @Allow(Permission.DeleteCatalog)
    async deletePage(@Ctx() ctx: RequestContext, @Args() { input }: MutationDeletePageArgs): Promise<boolean> {
        const result = await this.connection.getRepository(ctx, Page).delete({ id: input.id })
        return !!(result?.affected && result?.affected > 0)
    }

    findOne(
        ctx: RequestContext,
        pageId: ID,
        relations: RelationPaths<Page> = [],
    ): Promise<Translated<Page> | undefined> {
        return this.connection
            .getRepository(ctx, Page)
            .findOne(pageId, { relations })
            .then(page => page && this.translator.translate(page, ctx))
    }
}
