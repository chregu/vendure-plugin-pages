import gql from 'graphql-tag'

export const PAGE_FRAGMENT = gql`
    fragment Page on Page {
        id
        createdAt
        updatedAt
        title
        slug
        sections {
            value
        }
        position
        enabled
        translations {
            id
            slug
            text
            languageCode
            title
        }
    }
`

export const SECTION_FRAGMENT = gql`
    fragment Section on Section {
        id
        value
    }
`
