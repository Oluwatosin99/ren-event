<template>
  <div class="inline-flex items-center justify-center bg-white rounded-lg overflow-hidden">
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      :alt="`QR Code for ${value}`"
      :width="size"
      :height="size"
      class="block"
      style="image-rendering: pixelated;"
    />
    <div
      v-else
      :style="{ width: `${size}px`, height: `${size}px` }"
      class="flex items-center justify-center text-[10px] font-mono text-slate-400 bg-slate-100"
    >
      QR...
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

const props = withDefaults(
  defineProps<{
    value: string
    size?: number
  }>(),
  {
    size: 120
  }
)

const qrDataUrl = ref('')

const generateQr = async (text: string) => {
  if (!import.meta.client || !text) {
    qrDataUrl.value = ''
    return
  }
  try {
    qrDataUrl.value = await QRCode.toDataURL(text, {
      width: props.size * 2,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch {
    qrDataUrl.value = ''
  }
}

watch(
  () => [props.value, props.size] as const,
  ([val]) => {
    generateQr(val)
  },
  { immediate: true }
)
</script>
