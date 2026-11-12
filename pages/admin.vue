<template>
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Top Admin Tech Builders Banner -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm transition-colors">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 flex items-center justify-center shrink-0">
          <img
            :src="isDark ? '/images/brand/logo-mark-dark.svg' : '/images/brand/logo-mark-light.svg'"
            alt="Renaissance Event"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Admin Console &amp; SQLite Database Operations
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
              Full Tech Builder Access
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage database user roles (Admin, Vendor, Guest), monitor SQLite WAL concurrency, and access all event stations
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <button
          @click="handleBurstTest"
          :disabled="isLoading"
          type="button"
          class="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <VIcon name="bolt" size="xs" />
          <span>{{ isLoading ? 'Simulating...' : 'Simulate +25 Concurrent Orders' }}</span>
        </button>

        <NuxtLink
          to="/vendor"
          class="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <VIcon name="printer" size="xs" />
          <span>Orders &amp; Print</span>
        </NuxtLink>
      </div>
    </div>

    <!-- System Telemetry Metrics -->
    <div v-if="eventState" class="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">SQLite Lock Latency</div>
        <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
          {{ eventState.metrics.avgResponseMs }} ms
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">{{ eventState.metrics.totalProcessedLockOps.toLocaleString() }} Txns</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Gate Checked-In</div>
        <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
          {{ eventState.capacity.checkedInCount.toLocaleString() }}
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">of {{ eventState.capacity.totalExpected.toLocaleString() }} Capacity</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Total Meal Orders</div>
        <div class="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono mt-1">
          {{ eventState.orders.length }}
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">Live Kitchen Stream</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Plates Remaining</div>
        <div class="text-2xl font-black text-yellow-600 dark:text-yellow-400 font-mono mt-1">
          {{ totalPlatesLeft.toLocaleString() }}
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">{{ eventState.menuItems.length }} Menu Items</div>
      </div>

      <div class="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">DB User Accounts</div>
        <div class="text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-1">
          {{ eventState.users.length }}
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">Admin / Vendor / Guest</div>
      </div>
    </div>

    <!-- All Stations Quick Jump Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <NuxtLink to="/scanner" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition flex items-center gap-3 shadow-sm">
        <div class="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"><VIcon name="qr" size="md" /></div>
        <div>
          <div class="text-xs font-extrabold text-slate-900 dark:text-white">QR Gate Scanner</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">Check-in &amp; Walk-ins</div>
        </div>
      </NuxtLink>

      <NuxtLink to="/menu" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 transition flex items-center gap-3 shadow-sm">
        <div class="p-2.5 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400"><VIcon name="utensils" size="md" /></div>
        <div>
          <div class="text-xs font-extrabold text-slate-900 dark:text-white">Guest Food App</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">Mobile Ordering UI</div>
        </div>
      </NuxtLink>

      <NuxtLink to="/vendor" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-yellow-500 transition flex items-center gap-3 shadow-sm">
        <div class="p-2.5 rounded-xl bg-yellow-400/20 text-yellow-700 dark:text-yellow-400"><VIcon name="printer" size="md" /></div>
        <div>
          <div class="text-xs font-extrabold text-slate-900 dark:text-white">Vendor Orders &amp; Print</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">XP-80T Thermal Table</div>
        </div>
      </NuxtLink>

      <NuxtLink to="/vendor/menu" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500 transition flex items-center gap-3 shadow-sm">
        <div class="p-2.5 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400"><VIcon name="upload" size="md" /></div>
        <div>
          <div class="text-xs font-extrabold text-slate-900 dark:text-white">Menu &amp; Plate Upload</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">Stock &amp; Sold-Out Control</div>
        </div>
      </NuxtLink>
    </div>

    <!-- =================================================================== -->
    <!-- SQLITE USER ACCOUNTS & ROLE ACCESS MANAGEMENT (ADMIN/VENDOR/GUEST)  -->
    <!-- =================================================================== -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5 transition-colors">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Database User &amp; Role Management (Admin • Vendor • Guest)
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Create or reassign roles in SQLite. Users without an Admin or Vendor role automatically see only "Order Your Food".
          </p>
        </div>
      </div>

      <!-- Create New User Form -->
      <form @submit.prevent="handleCreateUser" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
          <input
            v-model="newUser.name"
            type="text"
            required
            placeholder="e.g. Brossa Adewale"
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
          <input
            v-model="newUser.email"
            type="email"
            required
            placeholder="user@renaissance.ng"
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
          <input
            v-model="newUser.password"
            type="text"
            required
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role *</label>
          <select
            v-model="newUser.role"
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="admin">Admin (All Access)</option>
            <option value="vendor">Vendor (Food &amp; Orders)</option>
            <option value="guest">Guest (Order Only)</option>
          </select>
        </div>
        <button
          type="submit"
          class="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5"
        >
          <VIcon name="plus" size="xs" />
          <span>Add DB User</span>
        </button>
      </form>

      <!-- Users Table -->
      <div v-if="eventState" class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="bg-slate-100 dark:bg-slate-950 text-[11px] font-extrabold uppercase text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="py-2.5 px-4">Name</th>
              <th class="py-2.5 px-4">Email</th>
              <th class="py-2.5 px-4">Department / Team</th>
              <th class="py-2.5 px-4">Role</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-for="u in eventState.users" :key="u.id">
              <td class="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{{ u.name }}</td>
              <td class="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">{{ u.email }}</td>
              <td class="py-2.5 px-4 text-slate-500 dark:text-slate-400">{{ u.department }}</td>
              <td class="py-2.5 px-4">
                <select
                  :value="u.role"
                  @change="handleRoleChange(u.id, ($event.target as HTMLSelectElement).value)"
                  class="px-2.5 py-1 rounded-lg border text-xs font-extrabold bg-slate-50 dark:bg-slate-950"
                  :class="u.role === 'admin'
                    ? 'border-red-500/40 text-red-700 dark:text-red-400'
                    : u.role === 'vendor'
                      ? 'border-orange-500/40 text-orange-700 dark:text-orange-400'
                      : 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'"
                >
                  <option value="admin">admin</option>
                  <option value="vendor">vendor</option>
                  <option value="guest">guest</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { eventState, isLoading, isDark, userSession, simulateConcurrencyBurst, manageUsers } = useEventSuite()

onMounted(() => {
  if (userSession.value.role !== 'admin') {
    router.replace(userSession.value.role === 'vendor' ? '/vendor' : '/menu')
  }
})

const newUser = reactive({
  name: '',
  email: '',
  password: 'vendor123',
  role: 'vendor' as 'admin' | 'vendor' | 'guest'
})

const totalPlatesLeft = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.menuItems.reduce((s, i) => s + (i.manualClosed ? 0 : i.stock), 0)
})

const handleBurstTest = async () => {
  await simulateConcurrencyBurst(25)
}

const handleCreateUser = async () => {
  if (!newUser.name.trim() || !newUser.email.trim()) return
  try {
    await manageUsers({
      action: 'create_user',
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role
    })
    newUser.name = ''
    newUser.email = ''
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Unable to create user')
  }
}

const handleRoleChange = async (userId: number, role: string) => {
  await manageUsers({
    action: 'update_role',
    userId,
    role
  })
}
</script>
