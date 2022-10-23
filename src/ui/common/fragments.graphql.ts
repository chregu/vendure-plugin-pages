import gql from 'graphql-tag'

export const PAGE_FRAGMENT = gql`
    fragment Page on Page {
        id
        createdAt
        updatedAt
        title
        slug
        section
        position
        translations {
            id
            slug
            text
            languageCode
            title
        }
    }
`
