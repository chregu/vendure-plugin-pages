import { PAGE_FRAGMENT } from '../../common/fragments.graphql'
import gql from 'graphql-tag'

export const GET_PAGE = gql`
    query GetPage($id: ID!) {
        page(id: $id) {
            ...Page
        }
    }
    ${PAGE_FRAGMENT}
`
