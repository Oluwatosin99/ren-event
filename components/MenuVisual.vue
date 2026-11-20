<template>
  <div class="relative w-full h-full overflow-hidden select-none bg-white dark:bg-[#090d16]">
    <!-- Real Dish Photo Mode -->
    <img
      v-if="showRealPhoto"
      :src="src"
      :alt="alt"
      loading="lazy"
      @error="imgErrored = true"
      class="w-full h-full object-cover transition-transform duration-500"
      :class="hoverScale ? 'group-hover:scale-105' : ''"
    />

    <!-- Official RenGala Placeholder SVG (Light / Dark) -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center relative overflow-hidden"
      :class="isDark ? 'bg-[#090d16]' : 'bg-[#f8fafc]'"
    >
      <img
        :src="isDark ? '/images/svg/placeholder-green-dark.svg' : '/images/svg/placeholder-green-light.svg'"
        :alt="alt"
        class="w-full h-full object-contain p-1 transition-transform duration-500"
        :class="hoverScale ? 'group-hover:scale-105' : ''"
      />

      <div
        v-if="!compact"
        class="absolute bottom-2 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 shadow-sm"
      >
        {{ meta.shortLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageDisplayMode, MenuSubCat } from '~/server/utils/db'
import { SUBCAT_META } from '~/utils/menuCatalog'

const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    subCat?: MenuSubCat
    imageMode?: ImageDisplayMode
    compact?: boolean
    hoverScale?: boolean
  }>(),
  {
    subCat: 'other',
    imageMode: 'photo',
    compact: false,
    hoverScale: false
  }
)

const { isDark } = useEventSuite()

const imgErrored = ref(false)
watch(() => props.src, () => {
  imgErrored.value = false
})

const meta = computed(() => SUBCAT_META[props.subCat || 'other'] || SUBCAT_META.other)
const showRealPhoto = computed(() => props.imageMode !== 'placeholder' && Boolean(props.src) && !imgErrored.value)
</script>
