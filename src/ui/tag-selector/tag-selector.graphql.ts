import gql from 'graphql-tag'

export const GET_SECTIONS = gql`
    query GetSectionsList($options: SectionListOptions) {
        sections(options: $options) {
            items {
                value
            }
            totalItems
        }
    }
`
