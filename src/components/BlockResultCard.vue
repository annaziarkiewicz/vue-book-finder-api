<template>
    <div
        class="az-result-card"
        :class="{ 'az-result-card--active': cardHovered && !authorHovered }"
        role="button"
        tabindex="0"
        @click="emit('select')"
        @keydown="onKeyDown"
        @keydown.space.prevent="emit('select')"
        @mouseenter="cardHovered = true"
        @mouseleave="cardHovered = false"
    >
        <BlockCover
            :cover="item.cover"
            :cover-color="item.coverColor"
            :open="cardHovered && !authorHovered"
        />

        <div class="az-result-card__details">
            <div class="az-result-card__title">
                {{ item.title }}
            </div>

            <BlockAuthors
                :authors="item.authors"
                @author-select="emit('author-select', $event)"
                @hover-change="authorHovered = $event"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import BlockAuthors from '@/components/BlockAuthors.vue'
import BlockCover from '@/components/BlockCover.vue'

import type { Author, Book } from '@/types/bookFinder'

defineProps<{
    item: Book
}>()

const emit = defineEmits<{
    (event: 'author-select', author: Author): void
    (event: 'select'): void
}>()

const authorHovered = ref(false)
const cardHovered = ref(false)

const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && !event.code.endsWith('Enter')) {
        return
    }

    event.preventDefault()
    emit('select')
}
</script>

<style lang="scss" scoped>
.az-result-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    cursor: pointer;
    text-align: center;

    &--active {
        .az-result-card__title {
            color: $color-grey-400;
            text-shadow: 1px 1px $color-grey-200;
        }
    }

    &:focus-visible {
        @include focus-ring($color-grey-400, true);
    }

    &__details {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    &__title {
        font-size: 15px;
        line-height: 1.25em;
        color: $color-milk-100;
        text-transform: uppercase;
        overflow-wrap: anywhere;
    }
}
</style>