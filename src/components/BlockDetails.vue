<template>
    <div
        ref="detailsRef"
        aria-label="Book details"
        class="az-details"
        role="region"
        :tabindex="isScrollable ? 0 : undefined"
    >
        <BlockLoaderDots v-if="loading" />

        <div v-else-if="error" class="az-details__error">
            <BlockError :message="error" />

            <button
                class="az-details__retry"
                type="button"
                @click="emit('retry')"
            >
                Retry
            </button>
        </div>

        <template v-else>
            <div v-if="details.description" class="az-details__description">
                <h3 class="az-details__description-label">
                    Description:
                </h3>

                <div class="az-details__description-value">
                    {{ details.description }}
                </div>
            </div>

            <div v-if="hasDetails" class="az-details__list">
                <h3 class="az-details__list-label">
                    Details:
                </h3>

                <div v-if="details.publishDate" class="az-details__item">
                    <span class="az-details__item-label">
                        Publish date:
                    </span>

                    <span class="az-details__item-value">
                        {{ details.publishDate }}
                    </span>
                </div>

                <div v-if="details.publishers.length" class="az-details__item">
                    <span class="az-details__item-label">
                        Publishers:
                    </span>

                    <span class="az-details__item-value">
                        {{ details.publishers.join(', ') }}
                    </span>
                </div>

                <div v-if="details.languages.length" class="az-details__item">
                    <span class="az-details__item-label">
                        Languages:
                    </span>

                    <span class="az-details__item-value">
                        {{ details.languages.join(', ') }}
                    </span>
                </div>

                <div v-if="details.pages" class="az-details__item">
                    <span class="az-details__item-label">
                        Pages:
                    </span>

                    <span class="az-details__item-value">
                        {{ details.pages }}
                    </span>
                </div>

                <div v-if="details.isbn10.length" class="az-details__item">
                    <span class="az-details__item-label">
                        ISBN-10:
                    </span>

                    <span class="az-details__item-value">
                        {{ details.isbn10.join(', ') }}
                    </span>
                </div>

                <div v-if="details.isbn13.length" class="az-details__item">
                    <span class="az-details__item-label">
                        ISBN-13:
                    </span>

                    <span class="az-details__item-value">
                        {{ details.isbn13.join(', ') }}
                    </span>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    watch
} from 'vue'

import BlockError from '@/components/BlockError.vue'
import BlockLoaderDots from '@/components/BlockLoaderDots.vue'

import type { BookDetails } from '@/types/bookFinder'

const props = defineProps<{
    details: BookDetails
    error: string | null
    loading: boolean
}>()

const emit = defineEmits<{
    (event: 'retry'): void
}>()

const detailsRef = ref<HTMLElement | null>(null)
const isScrollable = ref(false)

const hasDetails = computed(() => {
    return Boolean(
        props.details.publishDate
        || props.details.publishers.length
        || props.details.languages.length
        || props.details.pages
        || props.details.isbn10.length
        || props.details.isbn13.length
    )
})

const updateScrollable = () => {
    if (!detailsRef.value || window.innerWidth <= 767) {
        isScrollable.value = false
        return
    }

    isScrollable.value = detailsRef.value.scrollHeight > detailsRef.value.clientHeight
}

watch(
    () => [
        props.details,
        props.error,
        props.loading
    ],
    async () => {
        await nextTick()
        updateScrollable()
    }
)

onMounted(async () => {
    await nextTick()
    updateScrollable()
    window.addEventListener('resize', updateScrollable)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateScrollable)
})
</script>

<style lang="scss" scoped>
.az-details {
    overflow-y: auto;
    padding-block: 8px 4px;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: $color-grey-200;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: $color-milk-200;
        border-radius: 4px;
    }

    &:focus-visible {
        @include focus-ring($color-grey-400, 4px);
    }

    &__error {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
    }

    &__retry {
        padding: 16px 24px;
        background: $color-rose-200;
        border-radius: 8px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 500;
        color: $color-milk-200;
        text-transform: uppercase;
        transition: .25s;

        &:focus-visible {
            @include focus-ring($color-grey-400, 8px);
        }

        &:hover {
            background: $color-rose-300;
        }
    }

    &__description {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;

        &-label {
            font-size: 12px;
            line-height: 1em;
            color: $color-milk-500;
            text-transform: uppercase;
        }

        &-value {
            padding-inline-end: 12px;
            font-size: 20px;
            line-height: 1.5em;
            color: $color-milk-100;
            overflow-wrap: anywhere;

            @media (max-width: 767px) {
                padding: 0;
            }
        }
    }

    &__list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;

        &-label {
            font-size: 12px;
            line-height: 1em;
            color: $color-milk-500;
            text-transform: uppercase;
        }
    }

    &__item {
        font-size: 20px;
        line-height: 1.5em;

        &-label {
            color: $color-milk-200;
        }

        &-value {
            color: $color-milk-100;
            overflow-wrap: anywhere;
        }
    }
}
</style>