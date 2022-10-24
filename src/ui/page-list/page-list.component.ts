import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { DeletePage, GetPage, GetPages, PageFilterParameter, SortOrder } from '../generated/ui-types'
import {
    BaseListComponent,
    DataService,
    ModalService,
    NotificationService,
    ServerConfigService,
} from '@vendure/admin-ui/core'
import { DELETE_PAGE, GET_PAGES } from './page-list.graphql'
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker'
import { EMPTY, Observable, merge } from 'rxjs'
import { debounceTime, takeUntil, switchMap, tap } from 'rxjs/operators'
import Page = GetPage.Page
import { LanguageCode } from '@vendure/core'
import { FormControl, FormGroup } from '@angular/forms'
import { LogicalOperator } from '../generated/shop-types'
export type PageSearchForm = {
    name: string
    section: string
    slug: string
}
@Component({
    selector: 'pages',
    templateUrl: './page-list.component.html',
    styleUrls: ['./page-list.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageListComponent
    extends BaseListComponent<GetPages.Query, GetPages.Items, GetPages.Variables>
    implements OnInit, OnDestroy
{
    searchForm = new FormGroup({
        name: new FormControl(''),
        section: new FormControl(''),
        slug: new FormControl(''),
    })

    availableLanguages$: Observable<LanguageCode[]>
    contentLanguage$: Observable<LanguageCode>

    constructor(
        private dataService: DataService,
        router: Router,
        route: ActivatedRoute,
        private modalService: ModalService,
        private notificationService: NotificationService,
        private serverConfigService: ServerConfigService,
    ) {
        super(router, route)

        super.setQueryFn(
            (...args: any[]) => {
                return this.dataService.query(GET_PAGES, args)
            },
            data => data.pages,
            (skip, take) => this.createQueryOptions(skip, take, this.searchForm.value),
        )
    }
    ngOnInit() {
        super.ngOnInit()
        this.contentLanguage$ = this.dataService.client
            .uiState()
            .mapStream(({ uiState }) => uiState.contentLanguage)
            .pipe(tap(() => this.refresh()))

        merge(this.searchForm.valueChanges.pipe(debounceTime(250)), this.route.queryParamMap)
            .pipe(takeUntil(this.destroy$))
            .subscribe(val => {
                if (!val.params) {
                    this.setPageNumber(1)
                }
                this.refresh()
            })

        this.availableLanguages$ = this.serverConfigService.getAvailableLanguages()
    }

    ngOnDestroy() {
        this.destroy$.next(undefined)
        this.destroy$.complete()
    }
    setLanguage(code: LanguageCode) {
        this.setQueryParam('lang', code)

        this.dataService.client.setContentLanguage(code).subscribe()
    }
    deletePage(page: Page) {
        this.modalService
            .dialog({
                title: `Delete Page with  slug: ${page.slug} and id: ${page.id}?`,
                buttons: [
                    { type: 'secondary', label: _('common.cancel') },
                    { type: 'danger', label: _('common.delete'), returnValue: true },
                ],
            })
            .pipe(
                switchMap(response =>
                    response
                        ? this.dataService.mutate<DeletePage.Mutation, DeletePage.Variables>(DELETE_PAGE, {
                              input: { id: page.id },
                          })
                        : EMPTY,
                ),
            )
            .subscribe(
                response => {
                    if (response.deletePage) {
                        this.notificationService.success(_('common.notify-delete-success'), {
                            entity: 'Page',
                        })
                        this.refresh()
                    } else {
                        this.notificationService.error('Could not delete this Page.')
                    }
                },
                () => {
                    this.notificationService.error(_('common.notify-delete-error'), {
                        entity: 'Page',
                    })
                },
            )
    }

    private createQueryOptions(skip: number, take: number, searchForm: PageSearchForm): GetPages.Variables {
        const filter: PageFilterParameter = {}
        if (searchForm.name) {
            filter.title = {
                contains: searchForm.name,
            }
        }
        if (searchForm.slug) {
            filter.slug = {
                contains: searchForm.slug,
            }
        }
        const response: GetPages.Variables = {
            options: {
                skip,
                take,
                filter,
                filterOperator: LogicalOperator.AND,
                sort: {
                    position: SortOrder.DESC,
                },
            },
        }

        if (searchForm.section) {
            response.sections = [searchForm.section]
        } else {
            response.sections = []
        }
        return response
    }
}
