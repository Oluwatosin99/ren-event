<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 selection:bg-orange-500 selection:text-white">
    <!-- Application Loader Splash (Always runs first on initial load & reload for ~2.5s) -->
    <BrandSplash />

    <!-- Top Application Navigation Bar -->
    <header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors duration-300">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <!-- Brand Identity (Official RenGala Light/Dark SVG Mark + Role Badge) -->
        <NuxtLink to="/" class="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div class="relative w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
            <img
              :src="isDark ? '/images/svg/rengala-mark-dark.svg' : '/images/svg/rengala-mark-light.svg'"
              alt="RenGala"
              class="w-full h-full object-contain"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                RenGala
              </span>
              <span
                class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full border"
                :class="roleBadgeClasses"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="roleDotClasses"></span>
                <span>{{ roleLabel }}</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              End of Year Event • Operations &amp; Catering
            </p>
          </div>
        </NuxtLink>

        <!-- Role-Filtered Desktop & Tablet Navigation -->
        <nav
          v-if="visibleNavItems.length > 0"
          class="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <NuxtLink
            v-for="item in visibleNavItems"
            :key="item.to"
            :to="item.to"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="isActiveRoute(item.to)
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-900'"
          >
            <VIcon :name="item.icon" size="xs" />
            <span>{{ item.label }}</span>
            <span
              v-if="item.badge !== undefined"
              class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black"
              :class="isActiveRoute(item.to) ? 'bg-yellow-400 text-slate-950' : 'bg-orange-500 text-white'"
            >
              {{ item.badge }}
            </span>
          </NuxtLink>
        </nav>

        <!-- Right Controls: Light/Dark Mode Toggle + Switch Entry / Sign Out -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Light / Dark Mode Switcher -->
          <button
            @click="toggleTheme"
            type="button"
            class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <VIcon v-if="isDark" name="sun" size="sm" class="text-yellow-400" />
            <VIcon v-else name="moon" size="sm" class="text-emerald-700" />
            <span class="hidden sm:inline">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>

          <!-- Sign Out (Personnel Only) -->
          <button
            v-if="userSession.loggedIn && userSession.role !== 'guest'"
            @click="handleSwitchPortal"
            type="button"
            class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Sign Out to Personnel Login"
          >
            <VIcon name="logout" size="xs" />
            <span class="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Route View -->
    <main class="flex-1 pb-20 md:pb-8 flex flex-col">
      <NuxtPage />
    </main>

    <!-- Role-Filtered Mobile Bottom Navigation (iPhone & Android Thumb Bar) -->
    <nav
      v-if="visibleNavItems.length > 0"
      class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-1.5 py-1.5 flex items-center justify-around transition-colors duration-300"
    >
      <NuxtLink
        v-for="item in visibleNavItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-w-[56px]"
        :class="isActiveRoute(item.to)
          ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
          : 'text-slate-500 dark:text-slate-400 font-medium'"
      >
        <div
          class="p-1.5 rounded-lg transition-transform"
          :class="isActiveRoute(item.to) ? 'bg-emerald-500/15 scale-105' : ''"
        >
          <VIcon :name="item.icon" size="sm" />
        </div>
        <span class="text-[10px] mt-0.5 tracking-tight truncate max-w-[68px]">{{ item.shortLabel }}</span>
        <span
          v-if="item.badge"
          class="absolute top-0.5 right-1 px-1.5 min-w-[16px] h-4 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { eventState, isDark, initTheme, toggleTheme, userSession, initSession, logoutSession, fetchState } = useEventSuite()

// Keep <html> class & dynamic brand favicon synchronized on SSR & client
useHead({
  htmlAttrs: {
    class: computed(() => (isDark.value ? 'dark' : ''))
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: computed(() => (isDark.value ? '/images/svg/rengala-mark-dark.svg' : '/images/svg/rengala-mark-light.svg'))
    }
  ]
})

let pollTimer: any = null
onMounted(async () => {
  initTheme()
  initSession()
  await fetchState()
  pollTimer = setInterval(() => {
    fetchState()
  }, 8000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const unprocessedOrdersCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.orders.filter(o => o.status === 'unprocessed').length
})

const roleLabel = computed(() => {
  if (userSession.value.role === 'admin') return 'Admin'
  if (userSession.value.role === 'registrar') return 'Gate Scanner'
  if (userSession.value.role === 'delivery') return 'Delivery Checker'
  if (userSession.value.role === 'vendor') return 'Food Vendor'
  return 'Guest'
})

const roleBadgeClasses = computed(() => {
  if (userSession.value.role === 'admin') {
    return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
  }
  if (userSession.value.role === 'registrar' || userSession.value.role === 'vendor') {
    return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30'
  }
  return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
})

const roleDotClasses = computed(() => {
  if (userSession.value.role === 'admin') return 'bg-red-500'
  if (userSession.value.role === 'registrar' || userSession.value.role === 'vendor') return 'bg-orange-500'
  return 'bg-emerald-500'
})

// Strict Role-Based Navigation (Combined tabs on mobile to keep bottom bar clean):
// - Placeholder (/), Guest (/Orders), Personnel Login (/Personnel): No nav clutter
// - Registrar: ONLY Gate Scanner
// - Delivery: ONLY Delivery Scanner
// - Vendor: Orders & Print + Menu & Plates
// - Admin: 4 clean combined tabs (Admin Matrix, Gate Scan, Kitchen, Delivery)
const visibleNavItems = computed(() => {
  const path = route.path.toLowerCase()
  if (path === '/' || path === '/orders' || path === '/menu' || path === '/personnel') {
    return []
  }

  const role = userSession.value.role

  if (role === 'registrar') {
    return [
      {
        to: '/scanner',
        label: 'Gate Scanner',
        shortLabel: 'Gate Scan',
        icon: 'qr',
        badge: undefined
      }
    ]
  }

  if (role === 'delivery') {
    return [
      {
        to: '/delivery',
        label: 'Delivery Scanner',
        shortLabel: 'Delivery',
        icon: 'checkCircle',
        badge: undefined
      }
    ]
  }

  if (role === 'vendor') {
    return [
      {
        to: '/vendor',
        label: 'Kitchen Orders',
        shortLabel: 'Orders',
        icon: 'printer',
        badge: unprocessedOrdersCount.value || undefined
      }
    ]
  }

  if (role === 'admin') {
    return [
      {
        to: '/admin',
        label: 'Admin',
        shortLabel: 'Admin',
        icon: 'layers',
        badge: undefined
      },
      {
        to: '/scanner',
        label: 'Gate Scan',
        shortLabel: 'Gate',
        icon: 'qr',
        badge: undefined
      },
      {
        to: '/vendor',
        label: 'Kitchen Orders',
        shortLabel: 'Orders',
        icon: 'printer',
        badge: unprocessedOrdersCount.value || undefined
      },
      {
        to: '/vendor/menu',
        label: 'Menu Uploader',
        shortLabel: 'Menu',
        icon: 'upload',
        badge: undefined
      },
      {
        to: '/delivery',
        label: 'Delivery',
        shortLabel: 'Delivery',
        icon: 'checkCircle',
        badge: undefined
      }
    ]
  }

  return []
})

const isActiveRoute = (path: string) => {
  if (path === '/') return route.path === '/'
  if (path === '/vendor') return route.path === '/vendor'
  return route.path.toLowerCase().startsWith(path.toLowerCase())
}

const handleSwitchPortal = () => {
  logoutSession()
  router.push('/Personnel')
}
</script>
