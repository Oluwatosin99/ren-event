<template>
  <Transition
    leave-active-class="transition-opacity duration-700 ease-out pointer-events-none"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      @click="dismiss"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 cursor-pointer select-none transition-colors"
      :class="isDark ? 'bg-[#090d16]' : 'bg-white'"
      role="status"
      aria-label="Renaissance Event Platform Loading"
    >
      <div class="relative flex flex-col items-center justify-center max-w-md w-full">
        <!-- Soft radial glow behind logo (no CSS blur filter to avoid iOS Safari black tile glitch) -->
        <div
          class="absolute w-64 h-64 rounded-full pointer-events-none opacity-60"
          style="background: radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(249,115,22,0.10) 45%, transparent 70%);"
        ></div>

        <!-- Clean Official Renaissance Logo (Light / Dark) -->
        <div class="relative z-10">
          <img
            :src="isDark ? '/images/brand/renaissance-logo-dark.jpg' : '/images/brand/renaissance-logo-light.jpg'"
            alt="Renaissance"
            class="w-72 sm:w-96 h-auto object-contain rounded-2xl mx-auto"
          />
        </div>

        <!-- Renaissance 4-Color Progress Bar (Guaranteed Left-to-Right Fill + Gradient Sweep) -->
        <div class="relative z-10 mt-6 w-52 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div class="splash-gradient-bar h-full rounded-full"></div>
        </div>

        <span class="relative z-10 mt-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Tap anywhere to continue
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isDark } = useEventSuite()

const splashPlayed = useState<boolean>('ren-splash-played', () => false)
// Start visible IMMEDIATELY on first load so there is zero flash of the main content
const visible = ref(true)
const step = ref(1)

let t1: ReturnType<typeof setTimeout> | null = null

const dismiss = () => {
  visible.value = false
  splashPlayed.value = true
}

onMounted(() => {
  // Play once per full page load (e.g. /Orders, /Personnel, /), skip on client-side route changes
  if (splashPlayed.value) {
    visible.value = false
    return
  }
  t1 = setTimeout(() => {
    dismiss()
  }, 3000)
})

onBeforeUnmount(() => {
  if (t1) clearTimeout(t1)
})
</script>

<style scoped>
.splash-gradient-bar {
  width: 0%;
  background: linear-gradient(90deg, #008751 0%, #f97316 25%, #facc15 50%, #dc2626 75%, #008751 100%);
  background-size: 200% 100%;
  animation: splashFill 3s cubic-bezier(0.22, 1, 0.36, 1) forwards, gradientSweep 1.6s linear infinite;
}

@keyframes splashFill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@keyframes gradientSweep {
  0% {
    background-position: 200% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
