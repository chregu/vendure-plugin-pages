import { Injectable } from '@nestjs/common'
import {
    assertFound,
    LanguageCode,
    ListQueryBuilder,
    PaginatedList,
    RelationPaths,
    RequestContext,
    TransactionalConnection,
    TranslatableSaver,
    Translated,
    TranslatorService,
} from '@vendure/core'

import { CreatePageInput, PageListOptions, UpdatePageInput } from '../ui/generated/ui-types'
import { Page } from '../entities/page.entity'
import { PageTranslation } from '../entities/page-translation.entity'
import { SelectQueryBuilder } from 'typeorm'

@Injectable()
export class PagesService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private translator: TranslatorService,
        private translatableSaver: TranslatableSaver,
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: PageListOptions,
        relations?: RelationPaths<Page>,
    ): Promise<PaginatedList<Translated<Page>>> {
        const qb = this.getQueryBuilder(options, ctx, relations)
            .orderBy('page.section', 'ASC')
            .addOrderBy('page.position', 'ASC')
        return this.getTranslatedQueryBuilderResponse(qb, ctx)
    }

    async findOne(
        ctx: RequestContext,
        id: string | number,
        relations?: RelationPaths<Page>,
    ): Promise<Page | undefined> {
        return this.connection
            .getRepository(ctx, Page)
            .findOne(id, { relations })
            .then(page => page && this.translator.translate(page, ctx))
    }

    async findBySlugAndLanguage(
        ctx: RequestContext,
        slug: string,
        languageCode: LanguageCode,
    ): Promise<PageTranslation | undefined> {
        return this.connection.getRepository(ctx, PageTranslation).findOne({
            where: { languageCode: languageCode, slug: slug },
        })
    }

    findBySection(ctx: RequestContext, section: string, options?: PageListOptions, relations?: RelationPaths<Page>) {
        const qb = this.getQueryBuilder(options, ctx, relations)
        qb.where({ section: section }).orderBy('page.position', 'ASC')
        return this.getTranslatedQueryBuilderResponse(qb, ctx)
    }

    async create(ctx: RequestContext, input: CreatePageInput): Promise<Page> {
        const page = await this.translatableSaver.create({
            ctx,
            input,
            entityType: Page,
            translationType: PageTranslation,
        })
        return assertFound(this.findOne(ctx, page.id))
    }

    async update(ctx: RequestContext, input: UpdatePageInput): Promise<Page> {
        const page = await this.translatableSaver.update({
            ctx,
            input,
            entityType: Page,
            translationType: PageTranslation,
        })

        return assertFound(this.findOne(ctx, page.id))
    }

    async delete(ctx: RequestContext, id: string | number): Promise<boolean> {
        const result = await this.connection.getRepository(ctx, Page).delete({ id })
        return !!(result?.affected && result?.affected > 0)
    }

    private getQueryBuilder(
        options: PageListOptions | undefined,
        ctx: RequestContext,
        relations?: RelationPaths<Page>,
    ) {
        return this.listQueryBuilder.build(Page, options || undefined, {
            ctx,
            relations,
        })
    }
    private getTranslatedQueryBuilderResponse(qb: SelectQueryBuilder<Page>, ctx: RequestContext) {
        return qb.getManyAndCount().then(([pages, totalItems]) => {
            const items = pages.map(item => this.translator.translate(item, ctx))
            return {
                items,
                totalItems,
            }
        })
    }
}
