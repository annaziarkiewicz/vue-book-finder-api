export type CoverColor = 'mint' | 'navy' | 'rose'

export interface Author {
    avatar?: string | null
    key: string
    name: string
}

export interface Book {
    authors: Author[]
    cover: string
    coverColor: CoverColor
    key: string
    title: string
    year: number | null
}

export interface BookDetails {
    description: string
    firstPublishDate: string
    isbn10: string[]
    isbn13: string[]
    languages: string[]
    pages: number | null
    publishDate: string
    publishers: string[]
    subjects: string[]
    title: string
}

export interface OpenLibraryAuthorApi {
    key?: string
    name?: string
}

export interface OpenLibraryAuthorReferenceApi {
    author?: {
        key?: string
    }
}

export interface OpenLibraryDescriptionApi {
    value?: string
}

export interface OpenLibraryEditionApi {
    authors?: OpenLibraryAuthorReferenceApi[]
    covers?: number[]
    first_publish_year?: number
    isbn_10?: string[]
    isbn_13?: string[]
    key?: string
    languages?: {
        key: string
    }[]
    number_of_pages?: number
    publish_date?: string
    publishers?: string[]
    title?: string
    works?: {
        key?: string
    }[]
}

export interface OpenLibraryEditionsApi {
    entries: OpenLibraryEditionApi[]
}

export interface OpenLibrarySearchApi {
    docs?: OpenLibrarySearchDocApi[]
}

export interface OpenLibrarySearchDocApi {
    author_key?: string[]
    author_name?: string[]
    cover_i?: number
    first_publish_year?: number
    key: string
    title: string
}

export interface OpenLibraryWorkApi {
    authors?: OpenLibraryAuthorReferenceApi[]
    covers?: number[]
    description?: OpenLibraryDescriptionApi | string
    first_publish_date?: string
    key?: string
    subjects?: string[]
    title?: string
}

export interface WikipediaPageApi {
    thumbnail?: {
        source: string
    }
}

export interface WikipediaSearchApi {
    query?: {
        pages?: Record<string, WikipediaPageApi>
    }
}

export type CoverVariant = 'book' | 'cover'

export type WikipediaAvatarMode = 'exact' | 'search'

export interface WelcomeItem {
    image: string
    name: string
}