import { ref } from 'vue'

import { useOpenLibrary } from '@/composables/useOpenLibrary'

import type {
    Author,
    Book,
    BookDetails,
    OpenLibraryAuthorApi,
    OpenLibraryEditionApi,
    OpenLibraryEditionsApi,
    OpenLibraryWorkApi
} from '@/types/bookFinder'

const createEmptyDetails = (): BookDetails => {
    return {
        description: '',
        firstPublishDate: '',
        isbn10: [],
        isbn13: [],
        languages: [],
        pages: null,
        publishDate: '',
        publishers: [],
        subjects: [],
        title: ''
    }
}

export const useDetails = () => {
    const activeBook = ref<Book | null>(null)
    const authors = ref<Author[]>([])
    const details = ref<BookDetails>(createEmptyDetails())
    const detailsError = ref<string | null>(null)
    const detailsLoading = ref(false)
    const detailsVisible = ref(false)

    let detailsRequestController: AbortController | null = null
    let avatarRequestController: AbortController | null = null

    const {
        buildCoverUrl,
        fetchJson,
        getAuthorAvatar,
        getAuthorKey,
        getBookKey,
        getCoverColor,
        getDescription,
        getErrorMessage,
        isAbortError
    } = useOpenLibrary()

    const loadAuthors = async (
        authorReferences: NonNullable<OpenLibraryWorkApi['authors']>,
        signal: AbortSignal
    ): Promise<Author[]> => {
        return Promise.all(
            authorReferences.map(async (authorReference) => {
                const authorKey = getAuthorKey(
                    authorReference.author?.key ?? ''
                )

                if (!authorKey) {
                    return {
                        key: '',
                        name: ''
                    }
                }

                try {
                    const authorData = await fetchJson<OpenLibraryAuthorApi>(
                        `https://openlibrary.org${authorKey}.json`,
                        signal
                    )

                    return {
                        key: authorKey.replace('/authors/', ''),
                        name: authorData.name ?? authorKey
                    }
                } catch (caughtError) {
                    if (isAbortError(caughtError)) {
                        throw caughtError
                    }

                    return {
                        key: authorKey.replace('/authors/', ''),
                        name: authorKey
                    }
                }
            })
        )
    }

    const loadAuthorAvatars = async (
        book: Book,
        requestController: AbortController
    ) => {
        const authorsWithAvatars = book.authors.length > 2
            ? book.authors.slice(0, 1)
            : book.authors
        const avatars = await Promise.all(
            authorsWithAvatars.map((author) => {
                return getAuthorAvatar(
                    author.name,
                    requestController.signal
                )
            })
        )

        if (avatarRequestController !== requestController) {
            return
        }

        authors.value = book.authors.map((author, index) => ({
            ...author,
            avatar: avatars[index] ?? null
        }))
    }

    const resetDetails = () => {
        avatarRequestController?.abort()
        detailsRequestController?.abort()
        avatarRequestController = null
        detailsRequestController = null
        activeBook.value = null
        authors.value = []
        details.value = createEmptyDetails()
        detailsError.value = null
        detailsLoading.value = false
        detailsVisible.value = false
    }

    const loadBookDetails = async (book: Book) => {
        avatarRequestController?.abort()
        detailsRequestController?.abort()

        const requestController = new AbortController()

        avatarRequestController = requestController
        detailsRequestController = requestController
        authors.value = book.authors.map((author) => ({
            ...author,
            avatar: null
        }))
        details.value = createEmptyDetails()
        detailsError.value = null
        detailsLoading.value = true

        void loadAuthorAvatars(book, requestController).catch(() => {})

        try {
            let edition: OpenLibraryEditionApi | null = null
            let work: OpenLibraryWorkApi | null = null

            if (book.key.startsWith('/works/')) {
                work = await fetchJson<OpenLibraryWorkApi>(
                    `https://openlibrary.org${book.key}.json`,
                    requestController.signal
                )
            } else {
                edition = await fetchJson<OpenLibraryEditionApi>(
                    `https://openlibrary.org${book.key}.json`,
                    requestController.signal
                )

                const workKey = edition.works?.[0]?.key

                if (workKey) {
                    work = await fetchJson<OpenLibraryWorkApi>(
                        `https://openlibrary.org${workKey}.json`,
                        requestController.signal
                    )
                }
            }

            if (detailsRequestController !== requestController) {
                return
            }

            const workKey = work?.key

            if (workKey) {
                const editionsData = await fetchJson<OpenLibraryEditionsApi>(
                    `https://openlibrary.org${workKey}/editions.json?limit=20`,
                    requestController.signal
                )

                edition = editionsData.entries.find((item) => {
                    return item.publishers?.length
                        || item.number_of_pages
                        || item.publish_date
                }) ?? edition
            }

            if (detailsRequestController !== requestController) {
                return
            }

            details.value = {
                description: getDescription(work?.description),
                firstPublishDate: work?.first_publish_date ?? '',
                isbn10: edition?.isbn_10 ?? [],
                isbn13: edition?.isbn_13 ?? [],
                languages: (edition?.languages ?? []).map((language) => {
                    return language.key.replace('/languages/', '')
                }),
                pages: edition?.number_of_pages ?? null,
                publishDate: edition?.publish_date ?? '',
                publishers: edition?.publishers ?? [],
                subjects: work?.subjects ?? [],
                title: work?.title ?? book.title
            }
        } catch (caughtError) {
            if (
                isAbortError(caughtError)
                || detailsRequestController !== requestController
            ) {
                return
            }

            detailsError.value = getErrorMessage(caughtError)
        } finally {
            if (detailsRequestController === requestController) {
                detailsLoading.value = false
                detailsRequestController = null
            }
        }
    }

    const showBookDetails = async (book: Book) => {
        activeBook.value = book
        detailsVisible.value = true

        await loadBookDetails(book)
    }

    const showBookDetailsById = async (bookId: string) => {
        detailsRequestController?.abort()

        const requestController = new AbortController()

        detailsRequestController = requestController

        try {
            const bookKey = getBookKey(bookId)
            const work = await fetchJson<OpenLibraryWorkApi>(
                `https://openlibrary.org${bookKey}.json`,
                requestController.signal
            )
            const bookAuthors = await loadAuthors(
                work.authors ?? [],
                requestController.signal
            )
            const parsedYear = work.first_publish_date
                ? Number(work.first_publish_date.slice(0, 4))
                : null
            const book: Book = {
                authors: bookAuthors,
                cover: buildCoverUrl(work.covers?.[0]),
                coverColor: getCoverColor(),
                key: bookKey,
                title: work.title ?? '',
                year: parsedYear !== null && !Number.isNaN(parsedYear)
                    ? parsedYear
                    : null
            }

            if (detailsRequestController !== requestController) {
                return
            }

            activeBook.value = book
            detailsVisible.value = true
            detailsRequestController = null

            await loadBookDetails(book)
        } catch (caughtError) {
            if (
                isAbortError(caughtError)
                || detailsRequestController !== requestController
            ) {
                return
            }

            detailsRequestController = null
            throw caughtError
        }
    }

    return {
        activeBook,
        authors,
        details,
        detailsError,
        detailsLoading,
        detailsVisible,
        loadBookDetails,
        resetDetails,
        showBookDetails,
        showBookDetailsById
    }
}