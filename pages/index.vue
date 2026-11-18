<template>
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center min-h-[75vh]">
    <div class="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 transition-colors">
      <div class="flex justify-center">
        <img
          :src="isDark ? '/images/brand/renaissance-logo-dark.jpg' : '/images/brand/renaissance-logo-light.jpg'"
          alt="Renaissance Event"
          class="w-64 sm:w-72 h-auto object-contain rounded-2xl"
        />
      </div>

      <div class="flex items-center justify-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
      </div>

      <div class="space-y-2">
        <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Renaissance Event Platform
        </h1>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
          Kindly contact support for your respective link.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isDark } = useEventSuite()
</script>
