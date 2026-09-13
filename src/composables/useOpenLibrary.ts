import type {
    CoverColor,
    OpenLibraryDescriptionApi,
    WikipediaAvatarMode,
    WikipediaSearchApi
} from '@/types/bookFinder'

const coverColors: CoverColor[] = ['mint', 'navy', 'rose']
const wikipediaLanguages = ['pl', 'en']

export const useOpenLibrary = () => {
    const fetchJson = async <T>(
        url: string,
        signal?: AbortSignal
    ): Promise<T> => {
        const response = await fetch(url, { signal })
        const body = await response.json()

        if (!response.ok) {
            throw body
        }

        return body
    }

    const buildCoverUrl = (id?: number) => {
        return id
            ? `https://covers.openlibrary.org/b/id/${id}-M.jpg`
            : 'https://covers.openlibrary.org/b/id/-1-M.jpg'
    }

    const getAuthorKey = (authorKey: string) => {
        if (!authorKey) {
            return ''
        }

        return authorKey.startsWith('/authors/')
            ? authorKey
            : `/authors/${authorKey}`
    }

    const getBookId = (bookKey: string) => {
        return bookKey.replace(/^\/works\//, '')
    }

    const getBookKey = (bookId: string) => {
        return `/works/${getBookId(bookId)}`
    }

    const getCoverColor = (): CoverColor => {
        return coverColors[Math.floor(Math.random() * coverColors.length)]
    }

    const getDescription = (
        description?: OpenLibraryDescriptionApi | string
    ) => {
        if (typeof description === 'string') {
            return description
        }

        return description?.value ?? ''
    }

    const getErrorMessage = (caughtError: unknown) => {
        if (caughtError instanceof Error) {
            return caughtError.message
        }

        if (caughtError && typeof caughtError === 'object') {
            const errorEntry = Object.entries(caughtError)[0]

            if (errorEntry) {
                const [key, value] = errorEntry

                return `${key}: ${String(value)}`
            }
        }

        return 'Unknown error.'
    }

    const isAbortError = (caughtError: unknown) => {
        return (
            caughtError instanceof Error
            && caughtError.name === 'AbortError'
        )
    }

    const getWikipediaAvatar = async (
        language: string,
        authorName: string,
        mode: WikipediaAvatarMode,
        signal: AbortSignal
    ) => {
        const searchParams = mode === 'exact'
            ? `titles=${encodeURIComponent(authorName)}&redirects=1`
            : `generator=search&gsrsearch=${encodeURIComponent(`"${authorName}"`)}&gsrwhat=title&gsrlimit=1`
        const wikipediaData = await fetchJson<WikipediaSearchApi>(
            `https://${language}.wikipedia.org/w/api.php?action=query&${searchParams}&prop=pageimages&piprop=thumbnail&pithumbsize=96&format=json&origin=*`,
            signal
        )
        const pages = Object.values(wikipediaData.query?.pages ?? {})

        return pages[0]?.thumbnail?.source ?? null
    }

    const getAuthorAvatar = async (
        authorName: string,
        signal: AbortSignal
    ) => {
        const modes: WikipediaAvatarMode[] = ['exact', 'search']

        for (const mode of modes) {
            for (const language of wikipediaLanguages) {
                try {
                    const avatar = await getWikipediaAvatar(
                        language,
                        authorName,
                        mode,
                        signal
                    )

                    if (avatar) {
                        return avatar
                    }
                } catch (caughtError) {
                    if (isAbortError(caughtError)) {
                        throw caughtError
                    }
                }
            }
        }

        return null
    }

    return {
        buildCoverUrl,
        fetchJson,
        getAuthorAvatar,
        getAuthorKey,
        getBookId,
        getBookKey,
        getCoverColor,
        getDescription,
        getErrorMessage,
        isAbortError
    }
}