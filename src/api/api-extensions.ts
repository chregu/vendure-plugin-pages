import gql from 'graphql-tag'

export const commonApiExtensions = gql`
    type Page implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        text: String
        title: String
        slug: String
        position: String
        section: String
        translations(languageCode: LanguageCode): [PageTranslation!]!
    }

    type PageTranslation {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        languageCode: LanguageCode!
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
        section: String
        position: Int
        translations: [PageTranslationInput!]
    }

    input CreatePageInput {
        section: String
        position: Int
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
        """
        Return a page by its slug. languageCode is needed, independent of the general languageCode setting
        """
        pageBySlug(slug: String!, languageCode: LanguageCode!): Page
        """
        Returns all pages matching a sectio ordered by their position.
        Separate by comma for multiple sections.
        """
        pagesBySection(section: String!): PageList!
    }
`
