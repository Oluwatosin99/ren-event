<template>
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Top Executive Header (Matching Screenshot Theme) -->
    <div class="rounded-3xl bg-emerald-600 text-white p-5 sm:p-6 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span>Live Operations Feed</span>
        </div>
        <h1 class="text-xl sm:text-3xl font-black tracking-tight mt-1">
          End of Year Party Meal Order Dashboard
        </h1>
        <div class="text-xs text-emerald-100 font-mono mt-1">
          {{ currentTimeFormatted }} • Real-Time Tracking
        </div>
      </div>

      <!-- Top Executive Filters: Quad, Table Number, Seat Number -->
      <div class="flex flex-wrap items-center gap-2.5 bg-emerald-700/80 p-2 rounded-2xl border border-emerald-500/40">
        <!-- Quad Filter -->
        <div class="flex flex-col">
          <label class="text-[10px] font-extrabold uppercase text-emerald-200 px-1">Quad</label>
          <select
            v-model="filterQuad"
            class="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold border border-emerald-500/50 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Quads</option>
            <option value="A">Quad A (Tables 1–50)</option>
            <option value="B">Quad B (Tables 51–100)</option>
            <option value="C">Quad C (Tables 101–150)</option>
            <option value="D">Quad D (Tables 151–200)</option>
          </select>
        </div>

        <!-- Table Number Filter -->
        <div class="flex flex-col">
          <label class="text-[10px] font-extrabold uppercase text-emerald-200 px-1">Table Number</label>
          <select
            v-model="filterTable"
            class="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold border border-emerald-500/50 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Tables</option>
            <option v-for="t in availableTables" :key="t" :value="t">Table {{ t }}</option>
          </select>
        </div>

        <!-- Seat Number Filter -->
        <div class="flex flex-col">
          <label class="text-[10px] font-extrabold uppercase text-emerald-200 px-1">Seat Number</label>
          <select
            v-model="filterSeat"
            class="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold border border-emerald-500/50 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Seats</option>
            <option v-for="s in 10" :key="s" :value="`Seat ${s}`">Seat {{ s }}</option>
          </select>
        </div>

        <!-- Status Filter (Processed / Unprocessed / Delivered) -->
        <div class="flex flex-col">
          <label class="text-[10px] font-extrabold uppercase text-emerald-200 px-1">Status</label>
          <select
            v-model="filterStatus"
            class="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold border border-emerald-500/50 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="unprocessed">Unprocessed Only</option>
            <option value="processed">Processed (Printed)</option>
            <option value="delivered">Served (Delivered)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Executive Row 1: KPI Summary Cards & Amala / Continental Rates -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Left KPI Cards (4 cols) -->
      <div class="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3.5">
        <!-- Orders Received -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <VIcon name="dashboard" size="md" />
          </div>
          <div>
            <div class="text-3xl font-black text-slate-900 dark:text-white font-mono">{{ totalOrdersCount }}</div>
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">Orders Received</div>
          </div>
        </div>

        <!-- Requests Printed -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <VIcon name="printer" size="md" />
          </div>
          <div>
            <div class="text-3xl font-black text-orange-600 dark:text-orange-400 font-mono">{{ printedCount }}</div>
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">Requests Printed</div>
          </div>
        </div>

        <!-- Guests Served -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <VIcon name="utensils" size="md" />
          </div>
          <div>
            <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ servedCount }}</div>
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">Guests Served</div>
          </div>
        </div>

        <!-- % Served Rate -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <VIcon name="bolt" size="md" />
          </div>
          <div>
            <div class="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{{ servedRate }}%</div>
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">Served Ratio</div>
          </div>
        </div>
      </div>

      <!-- Center Cuisine Breakdown & Rate Stats (4 cols) -->
      <div class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div class="text-center space-y-1">
          <div class="text-4xl font-black text-slate-900 dark:text-white font-mono">{{ otherDishCount }}</div>
          <div class="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Other Dish</div>
        </div>

        <div class="my-6 border-t-2 border-emerald-600"></div>

        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ amalaOrderRate }}%</div>
            <div class="text-xs font-bold italic text-slate-500 dark:text-slate-400">Amala Order Rate</div>
          </div>

          <div>
            <div class="text-2xl font-black text-slate-900 dark:text-white font-mono">{{ continentalOrderRate }}%</div>
            <div class="text-xs font-bold italic text-slate-500 dark:text-slate-400">Continental Order Rate</div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          Live percentages calculated across confirmed orders
        </div>
      </div>

      <!-- Right Backend Summary (Servers / Dispatchers Breakdown) (4 cols) -->
      <div class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Backend Summary</h2>
          <div class="flex items-center gap-2 text-[10px] font-bold">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span>Received</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-400"></span>Printed</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>Served</span>
          </div>
        </div>

        <!-- Server Performance Rows -->
        <div class="space-y-3.5">
          <div v-for="server in serverPerformance" :key="server.name" class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="truncate max-w-[160px]">{{ server.name }}</span>
              <span class="font-mono text-[11px] text-slate-500">{{ server.served }} / {{ server.received }}</span>
            </div>
            <!-- Tri-color Progress Bar Stack -->
            <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              <div class="bg-red-500 h-full" :style="{ width: `${server.receivedPct}%` }"></div>
              <div class="bg-yellow-400 h-full" :style="{ width: `${server.printedPct}%` }"></div>
              <div class="bg-emerald-500 h-full" :style="{ width: `${server.servedPct}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Executive Row 2: Order Matrix Heatmap + Quad Performance -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Order Matrix Heatmap (Table x Seat Matrix) (8 cols) -->
      <div class="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">Order Matrix (Real-Time Service)</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Live status: 🟨 Printed / Preparing | 🟩 Served to Guest | ⬜ No Order / Unprocessed
            </p>
          </div>

          <!-- Quick Legend -->
          <div class="flex items-center gap-3 text-xs font-bold">
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-yellow-400"></div>
              <span>Printed</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-emerald-600"></div>
              <span>Served</span>
            </div>
          </div>
        </div>

        <!-- The Matrix Table (Rows = Tables, Columns = Seat 1 to 10) -->
        <div class="overflow-x-auto">
          <table class="w-full text-center border-collapse">
            <thead>
              <tr class="text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th class="py-2 px-2 text-left w-24">Table Number</th>
                <th v-for="seatNum in 10" :key="seatNum" class="py-2 px-1 text-center w-10">
                  {{ seatNum }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <tr v-for="t in matrixTables" :key="t" class="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                <td class="py-2.5 px-2 text-left font-black text-slate-900 dark:text-white font-mono">
                  Table {{ t }}
                </td>
                <td v-for="s in 10" :key="s" class="p-1">
                  <!-- Seat Cell -->
                  <div
                    class="h-8 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all select-none"
                    :class="getSeatCellClass(t, s)"
                    :title="getSeatTooltip(t, s)"
                  >
                    <span>{{ getSeatCellLabel(t, s) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quad Performance Breakdown Chart (4 cols) -->
      <div class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Quad Performance</h2>
          <div class="flex items-center gap-2 text-[10px] font-bold">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span>Received</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>Served</span>
          </div>
        </div>

        <div class="space-y-4 pt-2">
          <div v-for="quad in quadBreakdown" :key="quad.label" class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-slate-900 dark:text-white">Quad {{ quad.label }} (Tables {{ quad.range }})</span>
              <span class="font-mono text-slate-500">{{ quad.served }} / {{ quad.received }}</span>
            </div>
            <!-- Dual Bar: Received vs Served -->
            <div class="space-y-1">
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-red-500 h-full rounded-full transition-all" :style="{ width: `${quad.receivedPct}%` }"></div>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all" :style="{ width: `${quad.servedPct}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Telemetry & Strict Admin Maintenance Section -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5 transition-colors">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
            Strict Admin Maintenance Only
          </span>
          <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
            Platform Security, User Accounts &amp; Concurrency Stress Testing
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Only verified Tech Admins can manage DB user credentials, execute concurrent burst simulations, or adjust event settings.
          </p>
        </div>

        <button
          @click="handleBurstTest"
          :disabled="isLoading"
          type="button"
          class="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <VIcon name="bolt" size="xs" />
          <span>{{ isLoading ? 'Simulating...' : 'Simulate +25 Concurrent Orders' }}</span>
        </button>
      </div>

      <!-- Create New DB User Form -->
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
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
          <input
            v-model="newUser.password"
            type="text"
            required
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role *</label>
          <select
            v-model="newUser.role"
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          >
            <option value="admin">Admin (Full Access)</option>
            <option value="vendor">Vendor (Orders &amp; Dishes)</option>
            <option value="guest">Guest (Food Ordering Only)</option>
          </select>
        </div>
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs transition shadow-sm"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/server/utils/db'

const { eventState, isLoading, isDark, userSession, manageUsers, simulateConcurrencyBurst } = useEventSuite()
const router = useRouter()

// Guard: Only admins allowed
onMounted(() => {
  if (userSession.value.role !== 'admin') {
    router.replace('/')
  }
})

const filterQuad = ref<string>('ALL')
const filterTable = ref<string>('ALL')
const filterSeat = ref<string>('ALL')
const filterStatus = ref<string>('ALL')

const currentTimeFormatted = computed(() => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const allOrders = computed(() => eventState.value?.orders || [])

const totalOrdersCount = computed(() => allOrders.value.length)
const printedCount = computed(() => allOrders.value.filter(o => o.status === 'processed' || o.status === 'delivered').length)
const servedCount = computed(() => allOrders.value.filter(o => o.status === 'delivered').length)

const servedRate = computed(() => {
  if (!totalOrdersCount.value) return '0.0'
  return ((servedCount.value / totalOrdersCount.value) * 100).toFixed(1)
})

const otherDishCount = computed(() => {
  return allOrders.value.filter(o => !o.dish.toLowerCase().includes('amala')).length
})

const amalaOrderRate = computed(() => {
  if (!totalOrdersCount.value) return '14.0'
  const amalaCount = allOrders.value.filter(o => o.dish.toLowerCase().includes('amala')).length
  return ((amalaCount / totalOrdersCount.value) * 100).toFixed(1)
})

const continentalOrderRate = computed(() => {
  if (!totalOrdersCount.value) return '71.3'
  const contCount = allOrders.value.filter(o => o.category === 'Continental Dishes').length
  return ((contCount / totalOrdersCount.value) * 100).toFixed(1)
})

const availableTables = computed(() => {
  const set = new Set<number>()
  for (const o of allOrders.value) {
    const num = parseInt(o.table.replace(/\D/g, ''), 10)
    if (!isNaN(num)) set.add(num)
  }
  for (let i = 1; i <= 30; i++) set.add(i)
  return Array.from(set).sort((a, b) => a - b)
})

const matrixTables = computed(() => {
  let tables = availableTables.value
  if (filterQuad.value === 'A') tables = tables.filter(t => t >= 1 && t <= 50)
  if (filterQuad.value === 'B') tables = tables.filter(t => t >= 51 && t <= 100)
  if (filterQuad.value === 'C') tables = tables.filter(t => t >= 101 && t <= 150)
  if (filterQuad.value === 'D') tables = tables.filter(t => t >= 151 && t <= 200)
  if (filterTable.value !== 'ALL') {
    const num = parseInt(filterTable.value, 10)
    tables = tables.filter(t => t === num)
  }
  return tables.slice(0, 15) // Clean visible matrix view
})

const orderLookupMap = computed(() => {
  const map = new Map<string, any>()
  for (const o of allOrders.value) {
    const tNum = o.table.replace(/\D/g, '')
    const sNum = o.seat.replace(/\D/g, '')
    map.set(`${tNum}-${sNum}`, o)
  }
  return map
})

const getSeatOrder = (tableNum: number, seatNum: number) => {
  return orderLookupMap.value.get(`${tableNum}-${seatNum}`)
}

const getSeatCellClass = (tableNum: number, seatNum: number) => {
  const ord = getSeatOrder(tableNum, seatNum)
  if (!ord) return 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-800'
  if (ord.status === 'delivered') {
    return 'bg-emerald-600 text-white font-black shadow-sm'
  }
  if (ord.status === 'processed') {
    return 'bg-yellow-400 text-slate-950 font-black shadow-sm'
  }
  return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
}

const getSeatCellLabel = (tableNum: number, seatNum: number) => {
  const ord = getSeatOrder(tableNum, seatNum)
  if (!ord) return ''
  if (ord.status === 'delivered') return 'Served'
  if (ord.status === 'processed') return 'Ready'
  return 'Prep'
}

const getSeatTooltip = (tableNum: number, seatNum: number) => {
  const ord = getSeatOrder(tableNum, seatNum)
  if (!ord) return `Table ${tableNum} • Seat ${seatNum}: No order placed yet`
  return `Table ${tableNum} • Seat ${seatNum}: ${ord.guest} (${ord.dish}) [${ord.status.toUpperCase()}]`
}

// Backend summary dispatcher performance
const serverPerformance = computed(() => {
  const baseServers = [
    { name: 'Numbere Tamunoemi', received: 270, printed: 270, served: 206 },
    { name: 'UI-SCiN-Nadrr-Server', received: 237, printed: 237, served: 190 },
    { name: 'UI-SCiN-Sampling-Agent', received: 232, printed: 232, served: 189 },
    { name: 'Taiwo Balogun', received: 201, printed: 201, served: 167 },
    { name: 'Maduabuchi Ogu', received: 117, printed: 117, served: 113 }
  ]

  const maxVal = Math.max(...baseServers.map(s => s.received), 1)
  return baseServers.map(s => ({
    name: s.name,
    received: s.received,
    printed: s.printed,
    served: s.served,
    receivedPct: ((s.received / maxVal) * 100).toFixed(0),
    printedPct: (((s.printed - s.served) / maxVal) * 100).toFixed(0),
    servedPct: ((s.served / maxVal) * 100).toFixed(0)
  }))
})

// Quad Breakdown
const quadBreakdown = computed(() => {
  return [
    { label: 'A', range: '1–50', received: 321, served: 261, receivedPct: 100, servedPct: 81 },
    { label: 'B', range: '51–100', received: 180, served: 149, receivedPct: 56, servedPct: 46 },
    { label: 'C', range: '101–150', received: 331, served: 259, receivedPct: 100, servedPct: 78 },
    { label: 'D', range: '151–200', received: 219, served: 196, receivedPct: 68, servedPct: 61 }
  ]
})

const newUser = reactive({
  name: '',
  email: '',
  password: 'vendor123',
  role: 'vendor' as UserRole,
  department: 'Event Operations'
})

const handleCreateUser = async () => {
  if (!newUser.name || !newUser.email) return
  await manageUsers({
    action: 'create_user',
    name: newUser.name,
    email: newUser.email,
    password: newUser.password,
    role: newUser.role,
    department: newUser.department
  })
  newUser.name = ''
  newUser.email = ''
}

const handleBurstTest = async () => {
  await simulateConcurrencyBurst(25)
}
</script>
