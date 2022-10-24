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
        sections: [PageSection!]
        enabled: Boolean
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

    type PageSection {
        value: String!
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
        sections: [String!]
        position: Int
        enabled: Boolean
        translations: [PageTranslationInput!]
    }

    input CreatePageInput {
        position: Int
        enabled: Boolean
        sections: [String!]

        translations: [PageTranslationInput!]
    }

    input DeletePageInput {
        id: ID!
    }

    input DeleteSectionInput {
        id: ID!
    }

    type Section implements Node {
        id: ID!
        value: String!
    }

    type SectionList implements PaginatedList {
        items: [Section!]!
        totalItems: Int!
    }

    input SectionListOptions

    extend type Query {
        pages(options: PageListOptions, sections: [String!]): PageList!
        page(id: ID!): Page
        sections(options: SectionListOptions): SectionList!
    }

    extend type Mutation {
        updatePage(input: UpdatePageInput!): Page!
        createPage(input: CreatePageInput!): Page!
        deletePage(input: DeletePageInput!): Boolean
        deleteSection(input: DeleteSectionInput!): Boolean
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
        Returns all pages matching a section ordered by their position.
        Separate by comma for multiple sections.
        Won't return disabled pages.
        """
        pagesBySection(sections: [String!]): PageList!
    }
`
