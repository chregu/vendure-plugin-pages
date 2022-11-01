import { Injectable } from '@nestjs/common'
import {
    assertFound,
    EntityNotFoundError,
    LanguageCode,
    ListQueryBuilder,
    ListQueryOptions,
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
import { PageSection } from '../entities/page-section.entity'
import { unique } from '@vendure/common/lib/unique'

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
        sections: string[] = [],
        options?: PageListOptions,
        relations?: RelationPaths<Page>,
    ): Promise<PaginatedList<Translated<Page>>> {
        const qb = this.getQueryBuilder(options, ctx, relations).addOrderBy('page.position', 'ASC')
        if (sections.length > 0) {
            qb.leftJoin('page.sections', 'sections')
                .where(`sections.value IN (:...sections)`)
                .setParameters({ sections })
        }
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

    async findBySlug(ctx: RequestContext, slug: string, relations?: RelationPaths<Page>): Promise<Page | undefined> {
        // query is from ProductService.findOneBySlug
        const qb = this.connection.getRepository(ctx, Page).createQueryBuilder('page')
        const translationQb = this.connection
            .getRepository(ctx, PageTranslation)
            .createQueryBuilder('_page_translation')
            .select('_page_translation.baseId')
            .andWhere('_page_translation.slug = :slug', { slug })

        qb.leftJoin('page.translations', 'translation')
            .andWhere('page.id IN (' + translationQb.getQuery() + ')')
            .setParameters(translationQb.getParameters())
            .select('page.id', 'id')
            .addSelect(
                // tslint:disable-next-line:max-line-length
                `CASE translation.languageCode WHEN '${ctx.languageCode}' THEN 2 WHEN '${ctx.channel.defaultLanguageCode}' THEN 1 ELSE 0 END`,
                'sort_order',
            )
            .orderBy('sort_order', 'DESC')

        const result = await qb.getRawOne()
        if (!result) {
            throw new EntityNotFoundError('Page', slug)
        }

        return this.findOne(ctx, result.id, relations)
    }

    findBySection(ctx: RequestContext, sections: string[], options?: PageListOptions, relations?: RelationPaths<Page>) {
        const qb = this.getQueryBuilder(options, ctx, relations)

        qb.orderBy('page.position', 'ASC')
            .leftJoin('page.sections', 'sections')
            .where(`sections.value IN (:...sections)`)
            .setParameters({ sections })
        return this.getTranslatedQueryBuilderResponse(qb, ctx)
    }

    async create(ctx: RequestContext, input: CreatePageInput): Promise<Page> {
        const page = await this.translatableSaver.create({
            ctx,
            input,
            entityType: Page,
            translationType: PageTranslation,
            beforeSave: async page => {
                if (input.sections) {
                    page.sections = await this.valuesToSections(ctx, input.sections)
                }
            },
        })
        return assertFound(this.findOne(ctx, page.id))
    }

    async update(ctx: RequestContext, input: UpdatePageInput): Promise<Page> {
        const page = await this.translatableSaver.update({
            ctx,
            input,
            entityType: Page,
            translationType: PageTranslation,
            beforeSave: async page => {
                if (input.sections) {
                    page.sections = await this.valuesToSections(ctx, input.sections)
                }
            },
        })

        return assertFound(this.findOne(ctx, page.id))
    }

    async delete(ctx: RequestContext, id: string | number): Promise<boolean> {
        const result = await this.connection.getRepository(ctx, Page).delete({ id })
        return !!(result?.affected && result?.affected > 0)
    }

    async deleteSection(ctx: RequestContext, id: string | number): Promise<boolean> {
        const section = await this.connection.getEntityOrThrow(ctx, PageSection, id)

        await this.connection.getRepository(ctx, PageSection).remove(section)
        return true
    }

    findAllSections(ctx: RequestContext, options?: ListQueryOptions<PageSection>): Promise<PaginatedList<PageSection>> {
        return this.listQueryBuilder
            .build(PageSection, options, { ctx })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }))
    }

    async valuesToSections(ctx: RequestContext, values: string[]): Promise<PageSection[]> {
        const tags: PageSection[] = []
        for (const value of unique(values)) {
            tags.push(await this.sectionValueToSection(ctx, value))
        }
        return tags
    }

    private getQueryBuilder(
        options: PageListOptions | undefined,
        ctx: RequestContext,
        relations?: RelationPaths<Page>,
    ) {
        return this.listQueryBuilder.build(Page, options || undefined, {
            ctx,
            relations: [...(relations ?? []), 'sections'],
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

    private async sectionValueToSection(ctx: RequestContext, value: string): Promise<PageSection> {
        const existing = await this.connection.getRepository(ctx, PageSection).findOne({ where: { value } })
        if (existing) {
            return existing
        }
        return await this.connection.getRepository(ctx, PageSection).save(new PageSection({ value }))
    }
}
