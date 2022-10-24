import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SharedModule, CanDeactivateDetailGuard } from '@vendure/admin-ui/core'
import { PageDetailComponent } from './page-detail/page-detail.component'
import { PageDetailResolver } from './providers/routing/page-detail-resolver'
import { Observable } from 'rxjs'
import { Page } from './generated/ui-types'
import { map } from 'rxjs/operators'
import { PageListComponent } from './page-list/page-list.component'
import { TagSelectorComponent } from './tag-selector/tag-selector.component'
import { SectionListComponent } from './section-list/section-list.component'

export function pageDetailBreadcrumb(resolved: { entity: Observable<Page.Fragment> }) {
    return resolved.entity.pipe(
        map(entity => [
            {
                label: 'Pages',
                link: ['/extensions', 'pages'],
            },
            {
                label: `${entity.title}`,
                link: [],
            },
        ]),
    )
}
@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: 'pages',
                pathMatch: 'full',
                component: PageListComponent,
                data: { breadcrumb: 'Pages' },
            },
            {
                path: 'sections',
                pathMatch: 'full',
                component: SectionListComponent,
                data: { breadcrumb: 'Sections' },
            },

            {
                path: 'pages/:id',
                component: PageDetailComponent,
                resolve: { entity: PageDetailResolver },
                canDeactivate: [CanDeactivateDetailGuard],

                data: { breadcrumb: pageDetailBreadcrumb },
            },
        ]),
    ],
    declarations: [PageDetailComponent, PageListComponent, TagSelectorComponent, SectionListComponent],
    providers: [PageDetailResolver],
})
export class PagesUiLazyModule {}
