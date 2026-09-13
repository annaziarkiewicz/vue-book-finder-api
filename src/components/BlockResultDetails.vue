<template>
    <BlockModal
        :model-value="modelValue"
        title="Book details"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <div class="az-result-details">
            <div class="az-result-details__start">
                <BlockCover
                    :cover="book.cover"
                    :cover-color="book.coverColor"
                    :size="240"
                    variant="cover"
                />

                <BlockAuthors
                    :authors="authors"
                    variant="details"
                    @author-select="emit('author-select', $event)"
                />
            </div>

            <div class="az-result-details__end">
                <div v-if="book.year" class="az-result-details__date">
                    First published {{ book.year }}
                </div>

                <h2 class="az-result-details__title">
                    {{ book.title }}
                </h2>

                <BlockDetails
                    :details="details"
                    :error="error"
                    :loading="loading"
                    @retry="emit('retry')"
                />
            </div>
        </div>
    </BlockModal>
</template>

<script lang="ts" setup>
import BlockAuthors from '@/components/BlockAuthors.vue'
import BlockCover from '@/components/BlockCover.vue'
import BlockDetails from '@/components/BlockDetails.vue'
import BlockModal from '@/components/BlockModal.vue'

import type { Author, Book, BookDetails } from '@/types/bookFinder'

defineProps<{
    authors: Author[]
    book: Book
    details: BookDetails
    error: string | null
    loading: boolean
    modelValue: boolean
}>()

const emit = defineEmits<{
    (event: 'author-select', author: Author): void
    (event: 'retry'): void
    (event: 'update:modelValue', value: boolean): void
}>()
</script>

<style lang="scss" scoped>
.az-result-details {
    width: 100%;
    padding: 36px;
    display: flex;
    gap: 48px;

    @media (max-width: 767px) {
        padding: 24px;
        flex-direction: column;
        gap: 0;

        :deep(.az-details) {
            overflow: visible;
            flex: none;
            order: 4;
        }

        :deep(.az-authors__co-authors) {
            overflow: visible;
            flex: none;
        }
    }

    &__start {
        width: 240px;
        min-height: 0;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: 36px;

        @media (max-width: 767px) {
            width: 100%;
            margin-block-end: 24px;
            order: 3;

            :deep(.az-book) {
                margin-inline: auto;
            }
        }
    }

    &__end {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex: 1;
        flex-direction: column;

        @media (max-width: 767px) {
            display: contents;
        }
    }

    &__date {
        font-size: 12px;
        line-height: 1em;
        color: $color-milk-500;
        text-transform: uppercase;

        @media (max-width: 767px) {
            order: 1;
        }
    }

    &__title {
        margin-block-end: 12px;
        font-size: 36px;
        line-height: 1.25em;
        color: $color-milk-100;
        text-transform: uppercase;
        overflow-wrap: anywhere;

        &:before {
            content: '';
            width: 38px;
            height: 26px;
            float: right;

            @media (max-width: 767px) {
                width: 44px;
                height: 32px;
            }
        }

        @media (max-width: 767px) {
            order: 2;
        }

        @media (max-width: 480px) {
            font-size: 24px;
        }
    }
}
</style>