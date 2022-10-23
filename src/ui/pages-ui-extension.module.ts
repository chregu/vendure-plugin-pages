import { NgModule } from '@angular/core'
import { SharedModule, addNavMenuSection } from '@vendure/admin-ui/core'

@NgModule({
    imports: [SharedModule],
    providers: [
        addNavMenuSection(
            {
                id: 'Pages',
                label: 'Oomnium',
                items: [
                    {
                        id: 'Pages',
                        label: 'Pages',
                        routerLink: ['/extensions/pages'],
                        // Icon can be any of https://clarity.design/icons
                        icon: 'book',
                    },
                ],
            },
            // Add this section before the "settings" section
            'settings',
        ),
    ],
})
export class PagesUiExtensionModule {}
