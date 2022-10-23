import { NgModule } from '@angular/core'
import { SharedModule, addNavMenuSection } from '@vendure/admin-ui/core'
import { Permission } from './generated/ui-types'

@NgModule({
    imports: [SharedModule],
    providers: [
        addNavMenuSection(
            {
                id: 'Pages',
                label: 'Content',
                requiresPermission: Permission.ReadPages,
                items: [
                    {
                        id: 'Pages',
                        label: 'Pages',
                        routerLink: ['/extensions/pages'],
                        // Icon can be any of https://clarity.design/icons
                        icon: 'book',
                        requiresPermission: Permission.ReadPages,
                    },
                ],
            },
            // Add this section before the "settings" section
            'settings',
        ),
    ],
})
export class PagesUiExtensionModule {}
