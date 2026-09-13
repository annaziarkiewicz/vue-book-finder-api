<template>
    <section
        class="az-app"
        :class="{ 'az-app--inside-iframe': isIframe }"
    >
        <BlockSearchBar
            button-label="Search"
            :disabled="loading || (!query.trim() && !searched)"
            :model-value="query"
            placeholder="Search for your favorite book or author..."
            @search="searchBooks"
            @update:model-value="updateQuery"
        />

        <BlockWelcomeScreen v-if="!searched" />

        <BlockSearchResults
            v-else
            :error="error"
            :items="books"
            :loading="loading"
            @author-select="openAuthor"
            @select="openBook"
        />

        <BlockResultDetails
            v-if="activeBook"
            :key="activeBook.key"
            :authors="authors"
            :book="activeBook"
            :details="details"
            :error="detailsError"
            :loading="detailsLoading"
            :model-value="detailsVisible"
            @author-select="openAuthor"
            @retry="loadBookDetails(activeBook)"
            @update:model-value="updateDetailsVisibility"
        />
    </section>

    <BlockSplinter :is-iframe="isIframe" />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue'

import { useDetails } from '@/composables/useDetails'
import { useIframeCommunication } from '@/composables/useIframeCommunication'
import { useOpenLibrary } from '@/composables/useOpenLibrary'
import { useSearch } from '@/composables/useSearch'
import { useUrl } from '@/composables/useUrl'

import BlockResultDetails from '@/components/BlockResultDetails.vue'
import BlockSearchBar from '@/components/BlockSearchBar.vue'
import BlockSearchResults from '@/components/BlockSearchResults.vue'
import BlockSplinter from '@/components/BlockSplinter.vue'
import BlockWelcomeScreen from '@/components/BlockWelcomeScreen.vue'

import type { Author, Book } from '@/types/bookFinder'

const { isIframe } = useIframeCommunication()

const {
    books,
    error,
    loading,
    query,
    searched,
    cancelSearch,
    loadBooks,
    resetSearch
} = useSearch()

const {
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
} = useDetails()

const {
    getBookId,
    getBookKey,
    getErrorMessage
} = useOpenLibrary()

const {
    skipNextPopstateLoad,
    urlChangeId,
    getSearchStateFromUrl,
    getUrlParamsWithoutBook,
    invalidateUrlChange,
    updateUrl
} = useUrl()

const resetApplication = () => {
    resetSearch()
    resetDetails()
}

const loadSearchResults = (searchQuery: string) => {
    resetDetails()

    return loadBooks(searchQuery)
}

const searchBooks = async () => {
    const searchQuery = query.value.trim()

    if (!searchQuery) {
        query.value = ''

        updateUrl({})
        resetApplication()
        return
    }

    query.value = searchQuery

    updateUrl({
        search: searchQuery
    })

    await loadSearchResults(searchQuery)
}

const updateQuery = (value: string) => {
    invalidateUrlChange()
    cancelSearch()
    query.value = value
}

const openAuthor = async (author: Author) => {
    query.value = author.name

    updateUrl({
        search: author.name
    })

    await loadSearchResults(author.name)
}

const openBook = async (book: Book) => {
    const params = getUrlParamsWithoutBook()

    params.book = getBookId(book.key)

    updateUrl(
        params,
        false,
        {
            bookDetails: true
        }
    )

    await showBookDetails(book)
}

const updateDetailsVisibility = (value: boolean) => {
    if (value) {
        detailsVisible.value = true
        return
    }

    if (window.history.state?.bookDetails) {
        skipNextPopstateLoad.value = true
        resetDetails()
        window.history.back()
        return
    }

    updateUrl(getUrlParamsWithoutBook(), true)
    resetDetails()
}

const handleUrlChange = async () => {
    const currentUrlChangeId = ++urlChangeId.value
    const searchParams = new URLSearchParams(window.location.search)
    const bookId = searchParams.get('book')?.trim() ?? ''
    const searchQuery = getSearchStateFromUrl()

    query.value = searchQuery

    if (searchQuery) {
        await loadSearchResults(searchQuery)
    } else {
        resetApplication()
    }

    if (currentUrlChangeId !== urlChangeId.value) {
        return
    }

    if (!bookId) {
        resetDetails()
        return
    }

    const bookKey = getBookKey(bookId)
    const existingBook = books.value.find((book) => {
        return book.key === bookKey
    })

    try {
        if (existingBook) {
            await showBookDetails(existingBook)
            return
        }

        await showBookDetailsById(bookId)
    } catch (caughtError) {
        if (currentUrlChangeId === urlChangeId.value) {
            error.value = getErrorMessage(caughtError)
            resetDetails()
        }
    }
}

const handlePopstate = () => {
    if (skipNextPopstateLoad.value) {
        skipNextPopstateLoad.value = false
        return
    }

    handleUrlChange()
}

onMounted(() => {
    window.addEventListener('popstate', handlePopstate)
    handleUrlChange()
})

onBeforeUnmount(() => {
    window.removeEventListener('popstate', handlePopstate)
    cancelSearch()
    resetDetails()
})
</script>

<style lang="scss" scoped>
.az-app {
    position: relative;
    width: 100%;
    max-width: 960px;
    min-height: 680px;
    padding: 136px 36px 24px;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 36px;
    background: #B6B6AF;

    @media (max-width: 767px) {
        padding-inline: 24px;
    }

    &:not(.az-app--inside-iframe) {
        margin-block-start: 24px;
    }
}
</style>