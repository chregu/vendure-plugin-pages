import { DeepPartial } from '@vendure/common/lib/shared-types'
import { Column, Entity } from 'typeorm'
import { VendureEntity } from '@vendure/core'

@Entity()
export class PageSection extends VendureEntity {
    constructor(input?: DeepPartial<PageSection>) {
        super(input)
    }

    @Column()
    value: string
}
