<template>
    <div class="az-results-grid">
        <BlockResultCard
            v-for="item in items"
            :key="item.key"
            :item="item"
            @author-select="emit('author-select', $event)"
            @select="emit('select', item)"
        />
    </div>
</template>

<script lang="ts" setup>
import BlockResultCard from '@/components/BlockResultCard.vue'

import type { Author, Book } from '@/types/bookFinder'

defineProps<{
    items: Book[]
}>()

const emit = defineEmits<{
    (event: 'author-select', author: Author): void
    (event: 'select', item: Book): void
}>()
</script>

<style lang="scss" scoped>
.az-results-grid {
    width: 100%;
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-content: start;
    gap: 36px 24px;

    @media (max-width: 767px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 480px) {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>