import { DeepPartial } from '@vendure/common/lib/shared-types'
import { Translatable, Translation, VendureEntity } from '@vendure/core'
import { Column, Entity, OneToMany } from 'typeorm'
import { PageTranslation } from './page-translation.entity'

@Entity()
export class Page extends VendureEntity implements Translatable {
    constructor(input?: DeepPartial<Page>) {
        super(input)
    }

    @Column({ default: '' })
    section: string

    @Column({ default: 1, type: 'int' })
    position: string

    @Column({ default: false })
    enabled: boolean

    @OneToMany(() => PageTranslation, translation => translation.base, { eager: true })
    translations: Array<Translation<Page>>
}
