<template>
  <div class="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 max-w-4xl mx-auto w-full">
    <div class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl transition-colors space-y-8">
      <!-- Branded Header -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="w-2 h-2 rounded-full bg-orange-500"></span>
            <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span class="w-2 h-2 rounded-full bg-red-600"></span>
          </span>
          <span>RenGala • Personnel Portal</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Staff &amp; Operations Sign In
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Sign in with your database credentials. Each role is routed directly to its dedicated station and navigation menu.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="lg:col-span-7 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <VIcon name="lock" size="xs" class="text-orange-500" />
            <span>Database Authentication</span>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Staff Email Address</label>
              <input
                v-model="loginForm.email"
                type="email"
                required
                placeholder="e.g. gate1@renaissance.ng or admin@renaissance.ng"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                v-model="loginForm.password"
                type="password"
                required
                placeholder="Enter your password"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div v-if="loginError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <VIcon name="alert" size="xs" />
            <span>{{ loginError }}</span>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <span>{{ isLoading ? 'Authenticating...' : 'Sign In to Station' }}</span>
            <VIcon name="arrowRight" size="sm" />
          </button>
        </form>

        <!-- Real DB Test Accounts Reference -->
        <div class="lg:col-span-5 space-y-3">
          <div class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            DB Personnel Accounts (Tap to Fill &amp; Test)
          </div>

          <button
            v-for="acct in testAccounts"
            :key="acct.email"
            type="button"
            @click="fillAndLogin(acct.email, acct.password)"
            class="w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3"
            :class="acct.cardClass"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <VIcon :name="acct.icon" size="xs" :class="acct.iconClass" />
                <span class="text-xs font-black text-slate-900 dark:text-white">{{ acct.title }}</span>
              </div>
              <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {{ acct.email }} • {{ acct.password }}
              </div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ acct.desc }}
              </div>
            </div>
            <VIcon name="arrowRight" size="xs" class="text-slate-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ['/personnel']
})

const router = useRouter()
const { isLoading, loginWithDb } = useEventSuite()

const loginForm = reactive({
  email: '',
  password: ''
})
const loginError = ref('')

const testAccounts = [
  {
    title: 'Admin (Full Operations & Kitchen)',
    email: 'admin@renaissance.ng',
    password: 'admin123',
    desc: 'Order Matrix, Kitchen Orders, Menu Uploader, Reg Logs & Users',
    icon: 'layers',
    iconClass: 'text-red-600 dark:text-red-400',
    cardClass: 'bg-red-500/5 hover:bg-red-500/10 border-red-500/25'
  },
  {
    title: 'Register / Gate Scanner',
    email: 'gate1@renaissance.ng',
    password: 'gate123',
    desc: 'Scan QR passes or manually admit guests',
    icon: 'qr',
    iconClass: 'text-orange-600 dark:text-orange-400',
    cardClass: 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/25'
  },
  {
    title: 'Food Vendor / Receipt Printer',
    email: 'vendor@renaissance.ng',
    password: 'vendor123',
    desc: 'View all orders, search, print & reprint thermal receipts',
    icon: 'printer',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    cardClass: 'bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-500/30'
  },
  {
    title: 'Delivery Checker',
    email: 'delivery@renaissance.ng',
    password: 'delivery123',
    desc: 'Scan order QR or enter Receipt ID to mark delivered',
    icon: 'checkCircle',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    cardClass: 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/25'
  }
]

const routeByRole = (role: string) => {
  if (role === 'admin') return '/admin'
  if (role === 'vendor') return '/vendor'
  if (role === 'registrar') return '/scanner'
  if (role === 'delivery') return '/delivery'
  return '/Orders'
}

const handleLogin = async () => {
  loginError.value = ''
  const res = await loginWithDb(loginForm.email, loginForm.password)
  if (!res.ok) {
    loginError.value = res.error
    return
  }
  router.push(routeByRole(res.role))
}

const fillAndLogin = async (email: string, password: string) => {
  loginForm.email = email
  loginForm.password = password
  await handleLogin()
}
</script>
