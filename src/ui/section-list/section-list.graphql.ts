import { SECTION_FRAGMENT } from '../common/fragments.graphql'
import gql from 'graphql-tag'

export const GET_SECTIONS = gql`
    query GetSections($options: SectionListOptions) {
        sections(options: $options) {
            items {
                ...Section
            }
            totalItems
        }
    }
    ${SECTION_FRAGMENT}
`

export const DELETE_SECTION = gql`
    mutation DeleteSection($input: DeleteSectionInput!) {
        deleteSection(input: $input)
    }
`
