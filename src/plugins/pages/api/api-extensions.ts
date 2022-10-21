import gql from 'graphql-tag'

export const commonApiExtensions = gql`
    type Page implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        name: String
        text: String
        title: String
        slug: String
        translations: [PageTranslation!]!
    }

    type PageTranslation {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        languageCode: LanguageCode!
        name: String!
        text: String!
        title: String!
        slug: String!
    }

    type PageList implements PaginatedList {
        items: [Page!]!
        totalItems: Int!
    }
`

export const adminApiExtensions = gql`
    ${commonApiExtensions}
    # Auto-generated at runtime
    input PageListOptions

    input PageTranslationInput {
        id: ID
        languageCode: LanguageCode!
        text: String!
        slug: String!
        title: String!
    }
    input UpdatePageInput {
        id: ID!
        translations: [PageTranslationInput!]
    }

    input CreatePageInput {
        translations: [PageTranslationInput!]
    }

    input DeletePageInput {
        id: ID!
    }

    extend type Query {
        pages(options: PageListOptions): PageList!
        page(id: ID!): Page
    }

    extend type Mutation {
        updatePage(input: UpdatePageInput!): Page!
        createPage(input: CreatePageInput!): Page!
        deletePage(input: DeletePageInput!): Boolean
    }
`

export const shopApiExtensions = gql`
    ${commonApiExtensions}
    extend type Query {
        page(id: ID!): Page
        pageBySlug(slug: String!, languageCode: LanguageCode!): Page
    }
`
