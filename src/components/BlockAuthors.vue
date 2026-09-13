<template>
    <div
        v-if="authors.length"
        class="az-authors"
        :class="`az-authors--${variant}`"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <template v-if="variant === 'list'">
            <span
                class="az-authors__author"
                role="button"
                tabindex="0"
                @click="onAuthorClick($event, authors[0])"
                @keydown="onAuthorKeyDown($event, authors[0])"
                @keydown.space.prevent="onAuthorClick($event, authors[0])"
            >
                {{ authors[0].name }}
            </span>

            <template v-if="authors.length === 2">
                <span class="az-authors__comma">,</span>

                <span
                    class="az-authors__author"
                    role="button"
                    tabindex="0"
                    @click="onAuthorClick($event, authors[1])"
                    @keydown="onAuthorKeyDown($event, authors[1])"
                    @keydown.space.prevent="onAuthorClick($event, authors[1])"
                >
                    {{ authors[1].name }}
                </span>
            </template>

            <span
                v-else-if="authors.length > 2"
                class="az-authors__more"
            >
                +{{ authors.length - 1 }}
            </span>
        </template>

        <template v-else-if="authors.length <= 2">
            <div
                v-for="author in authors"
                :key="author.key || author.name"
                class="az-authors__primary"
                role="button"
                tabindex="0"
                @click="onAuthorClick($event, author)"
                @keydown="onAuthorKeyDown($event, author)"
                @keydown.space.prevent="onAuthorClick($event, author)"
            >
                <img
                    v-if="author.avatar"
                    class="az-authors__avatar"
                    alt=""
                    :src="author.avatar"
                >

                <div
                    v-else
                    class="az-authors__avatar"
                >
                    No image
                </div>

                <div class="az-authors__content">
                    <span class="az-authors__name">
                        {{ author.name }}
                    </span>

                    <span class="az-authors__type">
                        Author
                    </span>
                </div>
            </div>
        </template>

        <template v-else>
            <div
                class="az-authors__primary"
                role="button"
                tabindex="0"
                @click="onAuthorClick($event, authors[0])"
                @keydown="onAuthorKeyDown($event, authors[0])"
                @keydown.space.prevent="onAuthorClick($event, authors[0])"
            >
                <img
                    v-if="authors[0].avatar"
                    class="az-authors__avatar"
                    alt=""
                    :src="authors[0].avatar"
                >

                <div
                    v-else
                    class="az-authors__avatar"
                >
                    No image
                </div>

                <div class="az-authors__content">
                    <span class="az-authors__name">
                        {{ authors[0].name }}
                    </span>

                    <span class="az-authors__type">
                        Author
                    </span>
                </div>
            </div>

            <div
                ref="coAuthorsRef"
                aria-label="Co-authors"
                class="az-authors__co-authors"
                role="region"
                :tabindex="isScrollable ? 0 : undefined"
            >
                <span class="az-authors__co-authors-label">
                    Co-authors:
                </span>

                <div class="az-authors__co-authors-list">
                    <template
                        v-for="(author, index) in coAuthors"
                        :key="author.key || author.name"
                    >
                        <button
                            class="az-authors__co-author"
                            type="button"
                            @click="onAuthorClick($event, author)"
                        >
                            {{ author.name }}
                        </button>

                        <span v-if="index < coAuthors.length - 1" class="az-authors__co-author-separator">, </span>
                    </template>
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

import type { Author } from '@/types/bookFinder'

type AuthorsVariant = 'details' | 'list'

const props = withDefaults(defineProps<{
    authors: Author[]
    variant?: AuthorsVariant
}>(), {
    variant: 'list'
})

const emit = defineEmits<{
    (event: 'author-select', author: Author): void
    (event: 'hover-change', value: boolean): void
}>()

const coAuthorsRef = ref<HTMLElement | null>(null)
const isScrollable = ref(false)

const coAuthors = computed(() => {
    return props.authors.slice(1)
})

const onAuthorClick = (event: Event, author: Author) => {
    event.stopPropagation()
    emit('author-select', author)
}

const onAuthorKeyDown = (event: KeyboardEvent, author: Author) => {
    if (event.key !== 'Enter' && !event.code.endsWith('Enter')) {
        return
    }

    event.preventDefault()
    onAuthorClick(event, author)
}

const onMouseEnter = () => {
    if (props.variant === 'list') {
        emit('hover-change', true)
    }
}

const onMouseLeave = () => {
    if (props.variant === 'list') {
        emit('hover-change', false)
    }
}
const updateScrollable = () => {
    if (!coAuthorsRef.value || window.innerWidth <= 767) {
        isScrollable.value = false
        return
    }

    isScrollable.value = coAuthorsRef.value.scrollHeight > coAuthorsRef.value.clientHeight
}

watch(
    () => [
        props.authors,
        props.variant
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
.az-authors {
    display: flex;

    &--list {
        flex-wrap: wrap;
        justify-content: center;
    }

    &--details {
        min-height: 0;
        flex: 1;
        flex-direction: column;
        gap: 20px;
    }

    &__author,
    &__comma,
    &__more {
        font-size: 12px;
        line-height: 1em;
        color: $color-milk-500;
        text-transform: uppercase;
        overflow-wrap: anywhere;
    }

    &__author {
        cursor: pointer;
        text-align: center;

        &:hover {
            color: $color-grey-400;
        }

        &:focus-visible {
            background: $color-grey-400;
            outline: none;
            color: #B6B6AF;

            &:hover {
                color: #CFCFC9;
            }
        }
    }

    &__comma {
        margin-inline-end: 4px;
    }

    &__more {
        margin-inline-start: 4px;
    }

    &__primary {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        gap: 12px;
        cursor: pointer;

        &:focus-visible {
            background: $color-grey-400;
            outline: none;
        }

        &:hover {
            .az-authors__name {
                color: $color-grey-400;
            }
        }

        &:focus-visible {
            &:hover {
                .az-authors__name {
                    color: $color-milk-500;
                }
            }
        }
    }

    &__avatar {
        width: 48px;
        height: 48px;
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        background: #CFCFC9;
        border-radius: 50%;
        object-fit: cover;
        font-size: 9px;
        color: $color-milk-300;
    }

    &__content {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow-wrap: anywhere;
    }

    &__name {
        font-size: 20px;
        line-height: 1.25em;
        color: $color-milk-200;
    }

    &__type,
    &__co-authors-label {
        font-size: 12px;
        line-height: 1em;
        color: $color-milk-500;
        text-transform: uppercase;
    }

    &__co-authors {
        overflow-y: auto;
        min-height: 0;
        padding-block: 8px 4px;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 4px;

        &:focus-visible {
            @include focus-ring($color-grey-400, 4px);
        }

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
    }

    &__co-authors-list {
        padding-inline-end: 8px;
        line-height: 1.5em;
        overflow-wrap: anywhere;
    }

    &__co-author {
        padding: 0;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        line-height: 1.5em;
        color: $color-milk-200;

        &:hover {
            color: $color-grey-400;
        }

        &:focus-visible {
            background: $color-grey-400;
            outline: none;

            &:hover {
                color: #CFCFC9;
            }
        }
    }

    &__co-author-separator {
        margin-inline-end: 4px;
        font-size: 14px;
        line-height: 1.5em;
        color: $color-milk-200;
    }
}
</style>