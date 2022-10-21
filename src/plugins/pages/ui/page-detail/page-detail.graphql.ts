import { PAGE_FRAGMENT } from '../common/fragments.graphql'
import gql from 'graphql-tag'

export const UPDATE_PAGE = gql`
    mutation UpdatePage($input: UpdatePageInput!) {
        updatePage(input: $input) {
            ...Page
        }
    }
    ${PAGE_FRAGMENT}
`
export const CREATE_PAGE = gql`
    mutation CreatePage($input: CreatePageInput!) {
        createPage(input: $input) {
            ...Page
        }
    }
    ${PAGE_FRAGMENT}
`
