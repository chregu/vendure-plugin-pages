import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Observable } from 'rxjs'

import { GET_SECTIONS } from './tag-selector.graphql'
import { DataService } from '@vendure/admin-ui/core'
import { GetSectionsList, SortOrder } from '../generated/ui-types'

/** mostly copy/pasted from vendure.io -> packages/admin-ui/src/lib/core/src/shared/components/tag-selector*/
@Component({
    selector: 'pages-tag-selector',
    templateUrl: './tag-selector.component.html',
    styleUrls: ['./tag-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: TagSelectorComponent,
            multi: true,
        },
    ],
})
export class TagSelectorComponent implements OnInit, ControlValueAccessor {
    @Input() placeholder: string | undefined
    @Input() multiple = true
    allSections$: Observable<string[]>
    onChange: (val: any) => void
    onTouch: () => void
    _value: string[]
    disabled: boolean

    constructor(private dataService: DataService) {}

    ngOnInit(): void {
        this.allSections$ = this.dataService
            .query<GetSectionsList.Query, GetSectionsList.Variables>(GET_SECTIONS, {
                options: { sort: { value: SortOrder.ASC } },
            })
            .mapStream(data => data.sections.items.map(i => i.value))
    }

    addTagFn(val: string) {
        return val
    }

    registerOnChange(fn: any): void {
        this.onChange = fn
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled
    }

    writeValue(obj: unknown): void {
        if (Array.isArray(obj)) {
            this._value = obj
        }
    }

    valueChanged(event: string[]) {
        this.onChange(event)
    }
}
