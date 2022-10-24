import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { DeleteSection, GetSections, Section, SectionFilterParameter, SortOrder } from '../generated/ui-types'
import { BaseListComponent, DataService, ModalService, NotificationService } from '@vendure/admin-ui/core'
import { DELETE_SECTION, GET_SECTIONS } from './section-list.graphql'
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker'
import { EMPTY, merge } from 'rxjs'
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators'
import { FormControl, FormGroup } from '@angular/forms'
import { LogicalOperator } from '../generated/shop-types'

export type SectionSearchForm = {
    name: string
}
@Component({
    selector: 'sections',
    templateUrl: './section-list.component.html',
    styleUrls: ['./section-list.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionListComponent
    extends BaseListComponent<GetSections.Query, GetSections.Items, GetSections.Variables>
    implements OnInit, OnDestroy
{
    searchForm = new FormGroup({
        name: new FormControl(''),
    })

    constructor(
        private dataService: DataService,
        router: Router,
        route: ActivatedRoute,
        private modalService: ModalService,
        private notificationService: NotificationService,
    ) {
        super(router, route)

        super.setQueryFn(
            (...args: any[]) => {
                return this.dataService.query(GET_SECTIONS, args)
            },
            data => data.sections,
            (skip, take) => this.createQueryOptions(skip, take, this.searchForm.value),
        )
    }
    ngOnInit() {
        super.ngOnInit()

        merge(this.searchForm.valueChanges.pipe(debounceTime(250)), this.route.queryParamMap)
            .pipe(takeUntil(this.destroy$))
            .subscribe(val => {
                if (!val.params) {
                    this.setPageNumber(1)
                }
                this.refresh()
            })
    }

    ngOnDestroy() {
        this.destroy$.next(undefined)
        this.destroy$.complete()
    }

    deleteSection(section: Section) {
        this.modalService
            .dialog({
                title: `Delete Section with slug: ${section.value}?`,
                buttons: [
                    { type: 'secondary', label: _('common.cancel') },
                    { type: 'danger', label: _('common.delete'), returnValue: true },
                ],
            })
            .pipe(
                switchMap(response =>
                    response
                        ? this.dataService.mutate<DeleteSection.Mutation, DeleteSection.Variables>(DELETE_SECTION, {
                              input: { id: section.id },
                          })
                        : EMPTY,
                ),
            )
            .subscribe(
                response => {
                    if (response.deleteSection) {
                        this.notificationService.success(_('common.notify-delete-success'), {
                            entity: 'Section',
                        })
                        this.refresh()
                    } else {
                        this.notificationService.error('Could not delete this Section.')
                    }
                },
                () => {
                    this.notificationService.error(_('common.notify-delete-error'), {
                        entity: 'Section',
                    })
                },
            )
    }

    private createQueryOptions(skip: number, take: number, searchForm: SectionSearchForm): GetSections.Variables {
        const filter: SectionFilterParameter = {}

        if (searchForm.name) {
            filter.value = {
                contains: searchForm.name,
            }
        }
        return {
            options: {
                skip,
                take,
                filter,
                filterOperator: LogicalOperator.AND,
                sort: { value: SortOrder.ASC },
            },
        }
    }
}
