import { PAGE_FRAGMENT } from '../common/fragments.graphql'
import gql from 'graphql-tag'

export const GET_PAGES = gql`
    query GetPages($options: PageListOptions) {
        pages(options: $options) {
            items {
                ...Page
            }
            totalItems
        }
    }
    ${PAGE_FRAGMENT}
`

export const DELETE_PAGE = gql`
    mutation DeletePage($input: DeletePageInput!) {
        deletePage(input: $input)
    }
`
