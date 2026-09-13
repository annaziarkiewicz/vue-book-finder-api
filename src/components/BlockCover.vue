<template>
    <div
        class="az-book"
        :class="[
            `az-book--${variant}`,
            { 'az-book--open': variant === 'book' && open }
        ]"
        :style="{ '--book-width': `${size}px` }"
    >
        <div
            class="az-book__cover"
            :class="{
                'az-book__cover--loading': loading,
                [`az-book__cover--${coverColor}`]: coverMissing
            }"
        >
            <BlockLoaderRing
                v-if="loading"
                aria-hidden="true"
                :size="variant === 'book' ? 24 : 36"
            />

            <img
                v-if="!coverMissing"
                v-show="!loading"
                class="az-book__image"
                alt=""
                :src="cover"
                @error="onImageError"
                @load="onImageLoad"
            >

            <div v-if="coverMissing" class="az-book__empty">
                No cover
            </div>

            <div class="az-book__cover-effect" />
            <div class="az-book__cover-light" />
        </div>

        <div v-if="variant === 'book'" class="az-book__inside" />
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import BlockLoaderRing from '@/components/BlockLoaderRing.vue'

import type { CoverColor, CoverVariant } from '@/types/bookFinder'

const props = withDefaults(defineProps<{
    cover: string
    coverColor: CoverColor
    open?: boolean
    size?: number
    variant?: CoverVariant
}>(), {
    open: false,
    size: 120,
    variant: 'book'
})

const isCoverMissing = (cover: string) => {
    return !cover || cover.includes('-1-M.jpg') || cover.includes('-1-L.jpg')
}

const coverMissing = ref(isCoverMissing(props.cover))
const loading = ref(!coverMissing.value)

const onImageError = () => {
    coverMissing.value = true
    loading.value = false
}

const onImageLoad = () => {
    loading.value = false
}

watch(() => props.cover, (cover) => {
    coverMissing.value = isCoverMissing(cover)
    loading.value = !coverMissing.value
})
</script>

<style lang="scss" scoped>
.az-book {
    position: relative;
    width: var(--book-width);
    height: calc(var(--book-width) * 1.5);
    flex-shrink: 0;

    &--book {
        perspective: 2000px;
    }

    &--cover {
        .az-book__cover {
            box-shadow:
                inset 4px 1px 3px rgba(#FFFFFF, .38),
                inset 0 -1px 2px rgba(#000000, .5),
                0 24px 24px -20px rgba($color-grey-400, .5);
        }
    }

    &--open {
        .az-book__cover {
            box-shadow:
                inset 4px 1px 3px rgba(#FFFFFF, .38),
                inset 0 -1px 2px rgba(#000000, .5),
                10px 0 10px -5px rgba(#000000, .19);
            transform: perspective(2000px) rotateY(-30deg);
            transform-style: preserve-3d;

            &-effect {
                width: calc(var(--book-width) / 3);
            }

            &-light {
                opacity: 1;
                width: 70%;
            }
        }
    }

    &__cover {
        position: absolute;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow:
            inset 4px 1px 3px rgba(#FFFFFF, .38),
            inset 0 -1px 2px rgba(#000000, .5);
        border-radius: 2px;
        transform-origin: 0 50%;
        transition: all .5s ease-in-out;

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }

        &--loading {
            background: #CFCFC9;
        }

        &--mint {
            background: $color-mint-200;
            color: $color-mint-400;
        }

        &--navy {
            background: $color-navy-200;
            color: $color-navy-400;
        }

        &--rose {
            background: $color-rose-200;
            color: $color-rose-400;
        }

        &-effect {
            position: absolute;
            top: 0;
            left: calc(var(--book-width) / 12);
            width: calc(var(--book-width) / 6);
            height: 100%;
            background-image: linear-gradient(
                90deg,
                rgba(#FFFFFF, .2) 0%,
                rgba(#FFFFFF, 0) 100%
            );
            border-left: 2px solid rgba(#000000, .06);
            pointer-events: none;
            transition: all .5s ease;

            @media (prefers-reduced-motion: reduce) {
                transition: none;
            }
        }

        &-light {
            position: absolute;
            top: 0;
            right: 0;
            opacity: .1;
            width: 90%;
            height: 100%;
            background-image: linear-gradient(
                90deg,
                rgba(#FFFFFF, 0) 0%,
                rgba(#FFFFFF, .2) 100%
            );
            border-radius: 3px;
            pointer-events: none;
            transition: all .5s ease;

            @media (prefers-reduced-motion: reduce) {
                transition: none;
            }
        }
    }

    &__image {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 2px;
        object-fit: cover;
    }

    &__empty {
        font-size: 12px;
        line-height: 1em;
        text-transform: uppercase;
    }

    &__inside {
        position: absolute;
        top: 2%;
        left: 1px;
        z-index: 1;
        width: calc(100% - 2px);
        height: 96%;
        background: $color-milk-200;
        box-shadow:
            10px 40px 40px -10px rgba($color-grey-400, .2),
            inset -2px 0 0 $color-grey-300,
            inset -3px 0 0 $color-grey-200,
            inset -4px 0 0 $color-milk-200,
            inset -5px 0 0 $color-grey-200,
            inset -6px 0 0 $color-milk-200,
            inset -7px 0 0 $color-grey-200,
            inset -8px 0 0 $color-milk-200,
            inset -9px 0 0 $color-grey-200;
        border-radius: 3px;
        border: 1px solid $color-grey-300;
    }
}
</style>