import {
    BaseDetailComponent,
    DataService,
    NotificationService,
    ServerConfigService,
    createUpdatedTranslatable,
} from '@vendure/admin-ui/core'
import { pick } from '@vendure/common/lib/pick'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { CreatePage, PageFragment, UpdatePage, Page } from '../generated/ui-types'
import { filter, mapTo, mergeMap, take } from 'rxjs/operators'
import { Observable, combineLatest } from 'rxjs'
import { CREATE_PAGE, UPDATE_PAGE } from './page-detail.graphql'
import { normalizeString } from '@vendure/common/lib/normalize-string'
import { LanguageCode } from '@vendure/core'

@Component({
    selector: 'pages',
    templateUrl: './page-detail.component.html',
    styleUrls: ['./page-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDetailComponent extends BaseDetailComponent<PageFragment> implements OnInit, OnDestroy {
    detailForm: FormGroup
    page$: Observable<PageFragment>

    constructor(
        protected dataService: DataService,
        route: ActivatedRoute,
        router: Router,
        private formBuilder: FormBuilder,
        serverConfigService: ServerConfigService,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
    ) {
        super(route, router, serverConfigService, dataService)
        this.detailForm = this.formBuilder.group({
            enabled: false,
            slug: ['', Validators.required],
            text: ['', Validators.required],
            title: ['', Validators.required],
            section: [''],
            sections: [[]],
            position: ['', Validators.pattern(/^[0-9]+$/)],
        })
    }

    ngOnInit(): void {
        this.init()
        this.page$ = this.entity$
    }

    ngOnDestroy(): void {
        this.destroy()
    }

    protected setFormValues(entity: Page.Fragment, languageCode: LanguageCode): void {
        const currentTranslation = this.findTranslation(entity, languageCode)
        this.detailForm.patchValue({
            slug: currentTranslation ? currentTranslation.slug : '',
            text: currentTranslation ? currentTranslation.text : '',
            title: currentTranslation ? currentTranslation.title : '',
            sections: entity.sections?.map(t => t.value) || [],
            enabled: entity.enabled,
            position: entity.position || 1,
        })
    }

    private findTranslation(entity: Page.Fragment, languageCode: LanguageCode) {
        return (entity?.translations || []).find(t => t.languageCode === languageCode)
    }

    save() {
        combineLatest(this.page$, this.languageCode$)
            .pipe(
                take(1),
                mergeMap(([page, languageCode]) => {
                    const formValue = this.detailForm.value
                    const input = createUpdatedTranslatable({
                        translatable: page,
                        updatedFields: formValue,
                        languageCode,
                        defaultTranslation: {
                            title: formValue.title,
                            text: formValue.text,
                            slug: formValue.slug,
                            languageCode,
                        },
                    })
                    return this.dataService
                        .mutate<UpdatePage.Mutation, UpdatePage.Variables>(UPDATE_PAGE, {
                            input: {
                                ...pick(input, ['id', 'translations']),
                                position: parseInt(formValue.position) || 1,
                                sections: formValue.sections,
                                enabled: formValue.enabled,
                            },
                        })
                        .pipe(mapTo(true))
                }),
            )
            .pipe(filter(result => !!result))
            .subscribe(
                () => {
                    this.detailForm.markAsPristine()
                    this.changeDetector.markForCheck()
                    this.notificationService.success('common.notify-update-success', {
                        entity: 'Page',
                    })
                },
                () => {
                    this.notificationService.error('common.notify-update-error', {
                        entity: 'Page',
                    })
                },
            )
    }

    updateCode(currentCode: string, nameValue: string) {
        combineLatest(this.entity$, this.languageCode$)
            .pipe(take(1))
            .subscribe(([entity, languageCode]) => {
                const slugControl = this.detailForm.get(['slug'])
                const currentTranslation = this.findTranslation(entity, languageCode)
                const currentSlugIsEmpty = !currentTranslation || !currentTranslation.slug
                if (slugControl && slugControl.pristine && currentSlugIsEmpty) {
                    slugControl.setValue(normalizeString(`${nameValue}`, '-'))
                }
            })
    }

    create() {
        if (!this.detailForm.dirty) {
            return
        }

        combineLatest(this.page$, this.languageCode$)
            .pipe(
                take(1),
                mergeMap(([page, languageCode]) => {
                    const formValue = this.detailForm.value
                    const input = createUpdatedTranslatable({
                        translatable: page,
                        updatedFields: formValue,
                        languageCode,
                        defaultTranslation: {
                            title: formValue.title,
                            text: formValue.text,
                            slug: formValue.slug,
                            languageCode,
                        },
                    })
                    return this.dataService.mutate<CreatePage.Mutation, CreatePage.Variables>(CREATE_PAGE, {
                        input: {
                            ...pick(input, ['translations']),
                            position: parseInt(formValue.position) || 1,
                            sections: formValue.sections,
                            enabled: formValue.enabled,
                        },
                    })
                }),
            )

            .pipe(filter(result => result !== false))
            .subscribe(
                data => {
                    this.detailForm.markAsPristine()
                    this.changeDetector.markForCheck()
                    this.notificationService.success('common.notify-create-success', {
                        entity: 'Page',
                    })
                    if (data !== false) {
                        this.router.navigate(['../', data.createPage.id], { relativeTo: this.route })
                    }
                },
                () => {
                    this.notificationService.error('common.notify-create-error', {
                        entity: 'Page',
                    })
                },
            )
    }
}
