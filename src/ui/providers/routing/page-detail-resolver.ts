import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { BaseEntityResolver, DataService } from '@vendure/admin-ui/core'

import { GetPage, Page } from '../../generated/ui-types'
import { GET_PAGE } from './pages.resolver.graphql'

@Injectable()
export class PageDetailResolver extends BaseEntityResolver<Page.Fragment> {
    constructor(router: Router, dataService: DataService) {
        super(
            router,
            {
                __typename: 'Page',
                id: '',
                createdAt: '',
                updatedAt: '',
                enabled: false,
                translations: [],
            },
            id =>
                dataService
                    .query<GetPage.Query, GetPage.Variables>(GET_PAGE, {
                        id: id,
                    })
                    .mapStream(data => {
                        return data.page
                    }),
        )
    }
}
