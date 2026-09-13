import { ref } from 'vue'

import { useOpenLibrary } from '@/composables/useOpenLibrary'

import type {
    Book,
    OpenLibrarySearchApi,
    OpenLibrarySearchDocApi
} from '@/types/bookFinder'

export const useSearch = () => {
    const books = ref<Book[]>([])
    const error = ref<string | null>(null)
    const loading = ref(false)
    const query = ref('')
    const searched = ref(false)

    let searchRequestController: AbortController | null = null

    const {
        buildCoverUrl,
        fetchJson,
        getCoverColor,
        getErrorMessage,
        isAbortError
    } = useOpenLibrary()

    const mapDocsToBooks = (docs: OpenLibrarySearchDocApi[]): Book[] => {
        return docs.map((doc) => ({
            authors: (doc.author_name ?? []).map((name, index) => ({
                key: doc.author_key?.[index] ?? '',
                name
            })),
            cover: buildCoverUrl(doc.cover_i),
            coverColor: getCoverColor(),
            key: doc.key,
            title: doc.title,
            year: doc.first_publish_year ?? null
        }))
    }

    const removeDuplicates = (results: Book[]) => {
        const uniqueBooks = new Map<string, Book>()

        results.forEach((book) => {
            uniqueBooks.set(book.key, book)
        })

        return Array.from(uniqueBooks.values())
    }

    const cancelSearch = () => {
        searchRequestController?.abort()
        searchRequestController = null
        loading.value = false
    }

    const resetSearch = () => {
        cancelSearch()
        books.value = []
        error.value = null
        searched.value = false
    }

    const loadBooks = async (searchQuery: string) => {
        cancelSearch()

        const requestController = new AbortController()

        searchRequestController = requestController
        books.value = []
        error.value = null
        loading.value = true
        searched.value = true

        try {
            const encodedQuery = encodeURIComponent(searchQuery)
            const [authorData, titleData] = await Promise.all([
                fetchJson<OpenLibrarySearchApi>(
                    `https://openlibrary.org/search.json?author=${encodedQuery}`,
                    requestController.signal
                ),
                fetchJson<OpenLibrarySearchApi>(
                    `https://openlibrary.org/search.json?title=${encodedQuery}`,
                    requestController.signal
                )
            ])

            if (searchRequestController !== requestController) {
                return
            }

            books.value = removeDuplicates([
                ...mapDocsToBooks(titleData.docs ?? []),
                ...mapDocsToBooks(authorData.docs ?? [])
            ])

            if (!books.value.length) {
                error.value = 'No results found.'
            }
        } catch (caughtError) {
            if (
                isAbortError(caughtError)
                || searchRequestController !== requestController
            ) {
                return
            }

            error.value = getErrorMessage(caughtError)
        } finally {
            if (searchRequestController === requestController) {
                loading.value = false
                searchRequestController = null
            }
        }
    }

    return {
        books,
        error,
        loading,
        query,
        searched,
        cancelSearch,
        loadBooks,
        resetSearch
    }
}