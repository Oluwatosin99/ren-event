<template>
  <div class="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors">
      <div class="flex items-center gap-3.5">
        <div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
          <VIcon name="qr" size="lg" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Food Delivery &amp; Served Scanner
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              Active Server Station
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scan guest meal ticket QR codes or type Ticket/Order ID to mark orders as <strong>Delivered &amp; Served</strong>
          </p>
        </div>
      </div>

      <!-- Server Identity Badge (Admin sees All/Per-Person selector; Delivery Personnel sees their own logged-in name) -->
      <div class="w-full sm:w-auto bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-start gap-2.5">
        <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {{ isAdmin ? 'View Server:' : 'Logged-In Server:' }}
        </div>
        <select
          v-if="isAdmin"
          v-model="adminServerFilter"
          class="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
        >
          <option value="ALL" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            All Servers
          </option>
          <option v-for="s in serverRoster" :key="s" :value="s" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            {{ s }}
          </option>
        </select>
        <span v-else class="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{{ effectiveServerName }}</span>
        </span>
      </div>
    </div>

    <!-- Floating Glass Notification Toast for "Marked as Served" -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="servedToast"
        class="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-50 p-[1.5px] rounded-2xl bg-gradient-to-r from-emerald-500 via-yellow-400 to-orange-500 shadow-2xl"
      >
        <div class="relative overflow-hidden rounded-[14.5px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl px-4 py-3.5 flex items-start gap-3">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-yellow-400/5 to-orange-500/10 pointer-events-none"></div>
          <div class="relative z-10 w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <VIcon name="checkCircle" size="sm" />
          </div>
          <div class="relative z-10 flex-1 min-w-0">
            <div class="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Marked as Served
            </div>
            <div class="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
              {{ servedToast.guest }} <span class="font-mono text-xs text-slate-500 dark:text-slate-400">({{ servedToast.orderId }})</span>
            </div>
            <div class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              {{ servedToast.tableSeat }} • Confirmed by {{ servedToast.serverName }}
            </div>
          </div>
          <button
            @click="servedToast = null"
            type="button"
            class="relative z-10 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-black p-1"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>

    <!-- Quick Stats: Admin sees all 4 KPIs; Delivery Personnel sees only My Scans Today -->
    <div v-if="isAdmin" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Total Served</div>
        <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
          {{ totalServedCount }}
        </div>
        <div class="text-[11px] text-slate-400">Across All Tables</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">
          {{ adminServerFilter === 'ALL' ? 'All Server Scans' : 'Server Scans' }}
        </div>
        <div class="text-2xl font-black text-orange-500 font-mono mt-0.5">
          {{ myServedCount }}
        </div>
        <div class="text-[11px] text-slate-400 truncate">
          {{ adminServerFilter === 'ALL' ? 'Combined Team' : `By ${selectedServerLabel.split(' ')[0]}` }}
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Awaiting Service</div>
        <div class="text-2xl font-black text-yellow-600 dark:text-yellow-400 font-mono mt-0.5">
          {{ pendingServedCount }}
        </div>
        <div class="text-[11px] text-slate-400">Printed &amp; En Route</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Completion</div>
        <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
          {{ completionRate }}%
        </div>
        <div class="text-[11px] text-slate-400">Served vs Received</div>
      </div>
    </div>

    <div v-else class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
      <div>
        <div class="text-xs font-bold text-slate-500 dark:text-slate-400">My Scans Today</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Delivered meals confirmed by {{ effectiveServerName }}</div>
      </div>
      <div class="text-3xl font-black text-orange-500 font-mono">
        {{ myServedCount }}
      </div>
    </div>

    <!-- Scanner / Search Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <VIcon name="camera" size="xs" class="text-emerald-500" />
          <span>Scan Ticket QR or Enter Receipt / Order ID</span>
        </h2>

        <button
          @click="toggleCameraScanner"
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
          :class="cameraActive
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'"
        >
          <VIcon name="camera" size="xs" />
          <span>{{ cameraActive ? 'Stop Scanner' : 'Start Delivery QR Scanner' }}</span>
        </button>
      </div>

      <!-- Optional Live Camera Preview -->
      <div v-if="cameraActive" class="rounded-2xl overflow-hidden bg-slate-950 border-2 border-orange-500/60 relative h-52 flex items-center justify-center">
        <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover"></video>
        <div class="absolute inset-0 pointer-events-none border-2 border-emerald-400/70 m-6 rounded-xl"></div>
        <div class="absolute bottom-2 left-3 right-3 text-center text-[11px] font-bold text-emerald-300 bg-slate-950/80 px-3 py-1 rounded-lg">
          Auto-scanning meal receipt QR code… hold steady
        </div>
      </div>

      <form @submit.prevent="handleScanSubmit" class="flex flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <input
            v-model="scanInput"
            type="text"
            ref="scanInputRef"
            placeholder="e.g. REN-ORD-1114-T12S4, ORD-1114, or REN-0842"
            class="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          <VIcon name="qr" size="sm" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <button
          type="submit"
          :disabled="isScanning"
          class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 shrink-0"
        >
          <VIcon name="check" size="sm" />
          <span>{{ isScanning ? 'Verifying...' : 'Mark Delivered' }}</span>
        </button>
      </form>

      <!-- Scan Notification Alerts -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="scanFeedback"
          class="p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3"
          :class="scanFeedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'"
        >
          <div class="flex items-center gap-2">
            <VIcon :name="scanFeedback.type === 'success' ? 'checkCircle' : 'alert'" size="sm" />
            <span>{{ scanFeedback.message }}</span>
          </div>
          <button @click="scanFeedback = null" type="button" class="text-slate-400 hover:text-slate-600">×</button>
        </div>
      </Transition>
    </div>

    <!-- Live Scanned Log & Delivery Records -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">
            {{ isAdmin ? 'Live Delivery Stream & Audit Log' : filterOnlyMine ? 'My Delivered Scans Today' : 'All Orders' }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ isAdmin ? 'Search by Guest Name, Order ID, Table, or Server' : 'Orders you have scanned and confirmed as delivered' }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="relative flex-1 sm:flex-initial">
            <input
              v-model="logFilterQuery"
              type="text"
              placeholder="Filter by name / table..."
              class="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white w-full sm:w-48 focus:outline-none focus:border-emerald-500"
            />
            <VIcon name="search" size="xs" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            v-if="!isAdmin"
            @click="filterOnlyMine = !filterOnlyMine"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold border transition shrink-0"
            :class="filterOnlyMine
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'"
          >
            {{ filterOnlyMine ? 'My Delivered Scans' : 'All Orders' }}
          </button>
        </div>
      </div>

      <!-- Mobile Compact List View (Order ID, Name, Status + Eye Icon -> Details Modal) -->
      <div class="md:hidden space-y-2.5">
        <div
          v-for="ord in filteredDeliveryOrders"
          :key="`mob-${ord.id}`"
          class="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-xs text-slate-900 dark:text-white">{{ ord.id }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0"
                :class="ord.status === 'delivered'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : ord.status === 'processed'
                  ? 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30'
                  : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'"
              >
                {{ ord.status === 'delivered' ? 'Served' : ord.status === 'processed' ? 'Printed' : 'Ordered' }}
              </span>
            </div>
            <div class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-1">
              {{ ord.guest }}
            </div>
          </div>

          <button
            @click="selectedOrderModal = ord"
            type="button"
            class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition shrink-0 shadow-sm"
            aria-label="View order details"
            title="View full order details"
          >
            <VIcon name="eye" size="sm" />
          </button>
        </div>

        <div v-if="filteredDeliveryOrders.length === 0" class="py-8 text-center text-xs text-slate-400">
          No orders match your filter.
        </div>
      </div>

      <!-- Desktop Orders Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
              <th class="py-2.5 px-3">Order ID</th>
              <th class="py-2.5 px-3">Guest &amp; Seat</th>
              <th class="py-2.5 px-3">Dish</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Served By</th>
              <th class="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            <tr
              v-for="ord in filteredDeliveryOrders"
              :key="ord.id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition"
            >
              <td class="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                {{ ord.id }}
                <div class="text-[10px] text-slate-400 font-normal">{{ ord.time }}</div>
              </td>
              <td class="py-3 px-3">
                <div class="font-bold text-slate-900 dark:text-white">{{ ord.guest }}</div>
                <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {{ ord.table }} • {{ ord.seat }}
                </div>
              </td>
              <td class="py-3 px-3">
                <div class="font-bold text-slate-800 dark:text-slate-200">{{ ord.dish }}</div>
                <div class="text-[10px] text-slate-400">
                  {{ (ord.sides || []).join(', ') }} | {{ (ord.proteins || []).join(', ') }}
                </div>
              </td>
              <td class="py-3 px-3">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                  :class="ord.status === 'delivered'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : ord.status === 'processed'
                    ? 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30'
                    : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'"
                >
                  {{ ord.status === 'delivered' ? 'Served' : ord.status === 'processed' ? 'Printed / Ready' : 'Unprocessed' }}
                </span>
              </td>
              <td class="py-3 px-3">
                <span v-if="ord.servedBy" class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <VIcon name="checkCircle" size="xs" class="text-emerald-500" />
                  <span>{{ ord.servedBy }}</span>
                </span>
                <span v-else class="text-[11px] text-slate-400 italic">Not served yet</span>
              </td>
              <td class="py-3 px-3 text-right">
                <button
                  v-if="ord.status !== 'delivered'"
                  @click="quickDeliver(ord.id)"
                  type="button"
                  class="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-sm"
                >
                  Mark Served
                </button>
                <span v-else class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Delivered ✓
                </span>
              </td>
            </tr>

            <tr v-if="filteredDeliveryOrders.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400">
                No orders match your search query.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Full Order Details Modal (Mobile Eye Icon) -->
    <div
      v-if="selectedOrderModal"
      @click.self="selectedOrderModal = null"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-base text-slate-900 dark:text-white">{{ selectedOrderModal.id }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                :class="selectedOrderModal.status === 'delivered'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : selectedOrderModal.status === 'processed'
                  ? 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30'
                  : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'"
              >
                {{ selectedOrderModal.status === 'delivered' ? 'Served' : selectedOrderModal.status === 'processed' ? 'Printed / Ready' : 'Ordered' }}
              </span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">Placed at {{ selectedOrderModal.time }}</div>
          </div>
          <button
            @click="selectedOrderModal = null"
            type="button"
            class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-black"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div class="flex justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Guest Name</span>
              <span class="font-black text-slate-900 dark:text-white text-right">{{ selectedOrderModal.guest }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Table &amp; Seat</span>
              <span class="font-black text-emerald-600 dark:text-emerald-400 text-right">{{ selectedOrderModal.table }} • {{ selectedOrderModal.seat }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Main Dish</span>
              <span class="font-bold text-slate-900 dark:text-white text-right">{{ selectedOrderModal.dish }}</span>
            </div>
            <div v-if="(selectedOrderModal.sides || []).length" class="flex justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Sides</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 text-right">{{ selectedOrderModal.sides.join(', ') }}</span>
            </div>
            <div v-if="(selectedOrderModal.proteins || []).length" class="flex justify-between gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Proteins</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 text-right">{{ selectedOrderModal.proteins.join(', ') }}</span>
            </div>
            <div class="flex justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Served By</span>
              <span class="font-bold text-slate-900 dark:text-white text-right">
                {{ selectedOrderModal.servedBy || 'Not served yet' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <button
            v-if="selectedOrderModal.status !== 'delivered'"
            @click="quickDeliverFromModal(selectedOrderModal.id)"
            type="button"
            class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md"
          >
            Mark as Served
          </button>
          <button
            @click="selectedOrderModal = null"
            type="button"
            class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
            :class="selectedOrderModal.status === 'delivered' ? 'w-full' : ''"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'

const { eventState, userSession, updateOrderStatus } = useEventSuite()

const scanInput = ref('')
const scanInputRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const cameraActive = ref(false)
let mediaStream: MediaStream | null = null
const isScanning = ref(false)
const scanFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const logFilterQuery = ref('')
const filterOnlyMine = ref(true)
const selectedOrderModal = ref<any>(null)
const servedToast = ref<{ orderId: string; guest: string; tableSeat: string; serverName: string } | null>(null)
let servedToastTimer: ReturnType<typeof setTimeout> | null = null

const triggerServedToast = (order: any) => {
  if (servedToastTimer) clearTimeout(servedToastTimer)
  servedToast.value = {
    orderId: order.id,
    guest: order.guest,
    tableSeat: `${order.table} • ${order.seat}`,
    serverName: effectiveServerName.value
  }
  servedToastTimer = setTimeout(() => {
    servedToast.value = null
  }, 4000)
}

const isAdmin = computed(() => userSession.value?.role === 'admin')

const defaultServerRoster = [
  'Numbere Tamunoemi',
  'Maduabuchi Ogu',
  'UI-SCiN-Sampling-Agent',
  'UI-SCiN-Nadrr-Server',
  'Taiwo Balogun',
  'Chiamaka Okonjo',
  'General Food Server'
]

const serverRoster = computed(() => {
  const dbDeliveryUsers = (eventState.value?.users || [])
    .filter((u: any) => u.role === 'delivery')
    .map((u: any) => String(u.name || '').replace(/\s*\(Delivery\)\s*$/i, '').trim())
    .filter(Boolean)
  return Array.from(new Set([...dbDeliveryUsers, ...defaultServerRoster]))
})

const adminServerFilter = ref('ALL')

// Clean display name for the logged-in delivery server (or selected server for Admin)
const effectiveServerName = computed(() => {
  const rawName = String(userSession.value?.name || '').replace(/\s*\(Delivery\)\s*$/i, '').trim()
  if (isAdmin.value) {
    return adminServerFilter.value !== 'ALL' ? adminServerFilter.value : (rawName || 'Admin')
  }
  return rawName || 'Food Server'
})

const selectedServerLabel = computed(() => {
  if (isAdmin.value) {
    return adminServerFilter.value === 'ALL' ? 'All Servers' : adminServerFilter.value
  }
  return effectiveServerName.value
})

const matchesServerName = (servedBy: string | undefined, targetName: string) => {
  if (!servedBy || !targetName) return false
  const a = servedBy.replace(/\s*\(Delivery\)\s*$/i, '').trim().toLowerCase()
  const b = targetName.replace(/\s*\(Delivery\)\s*$/i, '').trim().toLowerCase()
  return a === b || a.includes(b) || b.includes(a)
}

onMounted(() => {
  // No localStorage override for non-admin servers; their logged-in identity is authoritative
})

let scanRafId: number | null = null
let scanCanvas: HTMLCanvasElement | null = null
let scanCtx: CanvasRenderingContext2D | null = null
let lastFrameCheck = 0
let lastDecodedValue = ''
let lastDecodedTime = 0

const stopDeliveryCamera = () => {
  if (scanRafId !== null) {
    cancelAnimationFrame(scanRafId)
    scanRafId = null
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  cameraActive.value = false
}

const runDeliveryQrLoop = (timestamp: number) => {
  if (!cameraActive.value) return
  scanRafId = requestAnimationFrame(runDeliveryQrLoop)

  if (timestamp - lastFrameCheck < 140 || isScanning.value) return
  lastFrameCheck = timestamp

  const video = videoRef.value
  if (!video || video.readyState < video.HAVE_ENOUGH_DATA || !video.videoWidth || !video.videoHeight) {
    return
  }

  if (!scanCanvas) {
    scanCanvas = document.createElement('canvas')
    scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true })
  }
  if (!scanCtx) return

  if (scanCanvas.width !== video.videoWidth || scanCanvas.height !== video.videoHeight) {
    scanCanvas.width = video.videoWidth
    scanCanvas.height = video.videoHeight
  }

  scanCtx.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height)
  const imageData = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height)
  const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth'
  })

  if (decoded?.data) {
    const raw = decoded.data.trim()
    const now = Date.now()
    if (raw && (raw !== lastDecodedValue || now - lastDecodedTime > 2500)) {
      lastDecodedValue = raw
      lastDecodedTime = now
      if (navigator.vibrate) navigator.vibrate(100)
      scanInput.value = raw
      handleScanSubmit()
    }
  }
}

const toggleCameraScanner = async () => {
  if (cameraActive.value) {
    stopDeliveryCamera()
    return
  }
  if (import.meta.client && navigator.mediaDevices?.getUserMedia) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      cameraActive.value = true
      await nextTick()
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
        await videoRef.value.play().catch(() => {})
      }
      scanRafId = requestAnimationFrame(runDeliveryQrLoop)
    } catch {
      scanFeedback.value = { type: 'error', message: 'Camera permission unavailable. Enter Order or Receipt ID manually below.' }
    }
  }
}

onUnmounted(() => {
  stopDeliveryCamera()
})

const allOrders = computed(() => eventState.value?.orders || [])

const totalServedCount = computed(() => {
  return allOrders.value.filter(o => o.status === 'delivered').length
})

const myServedCount = computed(() => {
  if (isAdmin.value && adminServerFilter.value === 'ALL') {
    return totalServedCount.value
  }
  const target = isAdmin.value ? adminServerFilter.value : effectiveServerName.value
  return allOrders.value.filter(o => o.status === 'delivered' && matchesServerName(o.servedBy, target)).length
})

const pendingServedCount = computed(() => {
  return allOrders.value.filter(o => o.status === 'processed').length
})

const completionRate = computed(() => {
  if (!allOrders.value.length) return '0.0'
  return ((totalServedCount.value / allOrders.value.length) * 100).toFixed(1)
})

const filteredDeliveryOrders = computed(() => {
  const q = logFilterQuery.value.trim().toLowerCase()
  return allOrders.value.filter(o => {
    if (isAdmin.value) {
      if (adminServerFilter.value !== 'ALL' && !matchesServerName(o.servedBy, adminServerFilter.value)) {
        return false
      }
    } else if (filterOnlyMine.value && (o.status !== 'delivered' || !matchesServerName(o.servedBy, effectiveServerName.value))) {
      return false
    }
    if (!q) return true
    return (
      o.id.toLowerCase().includes(q) ||
      o.guest.toLowerCase().includes(q) ||
      o.table.toLowerCase().includes(q) ||
      o.seat.toLowerCase().includes(q) ||
      (o.servedBy && o.servedBy.toLowerCase().includes(q)) ||
      o.dish.toLowerCase().includes(q)
    )
  })
})

const handleScanSubmit = async () => {
  const token = scanInput.value.trim()
  if (!token) return

  isScanning.value = true
  scanFeedback.value = null

  try {
    const res = await updateOrderStatus({
      action: 'scan_delivery',
      query: token,
      serverName: effectiveServerName.value
    })

    if (res.ok && res.order) {
      triggerServedToast(res.order)
      scanFeedback.value = {
        type: 'success',
        message: `Order ${res.order.id} for ${res.order.guest} (${res.order.table} • ${res.order.seat}) successfully marked as Served by ${effectiveServerName.value}!`
      }
      scanInput.value = ''
    }
  } catch (err: any) {
    scanFeedback.value = {
      type: 'error',
      message: err?.data?.statusMessage || err?.message || 'Could not find or update order.'
    }
  } finally {
    isScanning.value = false
    nextTick(() => {
      scanInputRef.value?.focus()
    })
  }
}

const quickDeliver = async (orderId: string) => {
  try {
    const res = await updateOrderStatus({
      action: 'scan_delivery',
      query: orderId,
      serverName: effectiveServerName.value
    })
    if (res?.ok && res?.order) {
      triggerServedToast(res.order)
    }
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to update order status')
  }
}

const quickDeliverFromModal = async (orderId: string) => {
  await quickDeliver(orderId)
  selectedOrderModal.value = null
}
</script>
