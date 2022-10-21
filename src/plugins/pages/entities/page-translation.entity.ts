import { LanguageCode } from '@vendure/common/lib/generated-types'
import { DeepPartial } from '@vendure/common/lib/shared-types'
import { Column, Entity, ManyToOne, Unique } from 'typeorm'

import { Page } from './page.entity'
import { Translation, VendureEntity } from '@vendure/core'

@Unique('slug_language', ['languageCode', 'slug']) // named; multiple fields
@Entity()
export class PageTranslation extends VendureEntity implements Translation<Page> {
    constructor(input?: DeepPartial<Translation<PageTranslation>>) {
        super(input)
    }

    @Column('varchar')
    languageCode: LanguageCode

    @Column()
    title: string

    @Column()
    slug: string

    @Column('text')
    text: string

    @ManyToOne(() => Page, base => base.translations, { onDelete: 'CASCADE' })
    base: Page
}
