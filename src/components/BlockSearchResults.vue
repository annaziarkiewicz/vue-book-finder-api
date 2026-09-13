<template>
    <div
        :aria-busy="loading"
        class="az-search-results"
    >
        <BlockLoaderDots v-if="loading" />

        <BlockError
            v-else-if="error"
            :message="error"
        />

        <BlockResultsGrid
            v-else
            :items="items"
            @author-select="emit('author-select', $event)"
            @select="emit('select', $event)"
        />
    </div>
</template>

<script lang="ts" setup>
import BlockError from '@/components/BlockError.vue'
import BlockLoaderDots from '@/components/BlockLoaderDots.vue'
import BlockResultsGrid from '@/components/BlockResultsGrid.vue'

import type { Author, Book } from '@/types/bookFinder'

defineProps<{
    error: string | null
    items: Book[]
    loading: boolean
}>()

const emit = defineEmits<{
    (event: 'author-select', author: Author): void
    (event: 'select', item: Book): void
}>()
</script>

<style lang="scss" scoped>
.az-search-results {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>