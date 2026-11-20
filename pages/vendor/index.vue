<template>
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Top Vendor Operations Header -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm transition-colors">
      <div class="flex items-center gap-3.5">
        <div class="p-3 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 shrink-0">
          <VIcon name="printer" size="lg" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Vendor Orders Dashboard &amp; Thermal Receipt Station
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              XPrinter XP-80T • 79.5 ± 0.5mm
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor live orders, filter Unprocessed / Processed / Table / Seat, print or reprint 80mm thermal receipts, and verify delivery QR codes
          </p>
        </div>
      </div>

      <!-- Delivery QR Scan + Upload Menu Shortcut -->
      <div class="flex flex-wrap items-center gap-2">
        <form @submit.prevent="handleScanDeliveryQr" class="w-full sm:w-auto flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <VIcon name="qr" size="sm" class="text-emerald-600 dark:text-emerald-400 ml-1.5 shrink-0" />
          <input
            v-model="deliveryQrInput"
            type="text"
            placeholder="Scan Order QR / ID"
            class="flex-1 min-w-[120px] sm:w-44 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            class="w-full sm:w-auto justify-center px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shrink-0"
          >
            Mark Delivered
          </button>
        </form>

        <NuxtLink
          v-if="userSession?.role === 'admin'"
          to="/vendor/menu"
          class="px-3.5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <VIcon name="upload" size="xs" />
          <span>Upload Food &amp; Plates</span>
        </NuxtLink>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- LIVE VENDOR DASHBOARD SUMMARY CARDS                                 -->
    <!-- =================================================================== -->
    <div v-if="eventState" class="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Orders</span>
          <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <VIcon name="utensils" size="xs" />
          </div>
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
          {{ eventState.orders.length }}
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {{ nigerianOrdersCount }} Nigerian • {{ continentalOrdersCount }} Continental
        </div>
      </div>

      <div
        @click="filterStatus = 'unprocessed'"
        class="cursor-pointer bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 shadow-sm transition-all"
        :class="filterStatus === 'unprocessed' ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 hover:border-red-500/50'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-red-600 dark:text-red-400">Unprocessed</span>
          <div class="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <VIcon name="clock" size="xs" />
          </div>
        </div>
        <div class="text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-1">
          {{ unprocessedCount }}
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pending Print</div>
      </div>

      <div
        @click="filterStatus = 'processed'"
        class="cursor-pointer bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 shadow-sm transition-all"
        :class="filterStatus === 'processed' ? 'border-orange-500' : 'border-slate-200 dark:border-slate-800 hover:border-orange-500/50'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-orange-600 dark:text-orange-400">Processed</span>
          <div class="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <VIcon name="printer" size="xs" />
          </div>
        </div>
        <div class="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono mt-1">
          {{ processedCount }}
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Printed / Kitchen</div>
      </div>

      <div
        @click="filterStatus = 'delivered'"
        class="cursor-pointer bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 shadow-sm transition-all"
        :class="filterStatus === 'delivered' ? 'border-emerald-600' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">Delivered</span>
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <VIcon name="checkCircle" size="xs" />
          </div>
        </div>
        <div class="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
          {{ deliveredCount }}
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Served at Table</div>
      </div>

      <div class="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Plates Left</span>
          <div class="p-2 rounded-xl bg-yellow-400/20 text-yellow-700 dark:text-yellow-400">
            <VIcon name="dashboard" size="xs" />
          </div>
        </div>
        <div class="text-2xl font-black text-yellow-600 dark:text-yellow-400 font-mono mt-1">
          {{ totalPlatesLeft.toLocaleString() }}
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ soldOutDishesCount }} Sold Out</div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- FILTERS BAR: PROCESSED / UNPROCESSED / TABLE # / SEAT # / SEARCH    -->
    <!-- =================================================================== -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors">
      <!-- Status Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="filterStatus = tab.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          :class="filterStatus === tab.value
            ? 'bg-emerald-600 text-white shadow'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <span>{{ tab.label }}</span>
          <span
            class="px-1.5 py-0.2 rounded-full text-[10px] font-black"
            :class="filterStatus === tab.value ? 'bg-yellow-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Search + Table Number + Seat Number Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <input
            v-model="searchOrderQuery"
            type="text"
            placeholder="Search guest or ORD-..."
            class="pl-7 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white w-40 focus:outline-none focus:border-emerald-500"
          />
          <VIcon name="search" size="xs" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <VIcon name="filter" size="xs" class="text-orange-500" />
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Table:</span>
          <select
            v-model="filterTable"
            class="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL" class="bg-white dark:bg-slate-900">All Tables</option>
            <option v-for="t in availableTablesInOrders" :key="t" :value="t" class="bg-white dark:bg-slate-900">
              {{ t }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Seat:</span>
          <select
            v-model="filterSeat"
            class="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL" class="bg-white dark:bg-slate-900">All Seats</option>
            <option v-for="s in availableSeatsInOrders" :key="s" :value="s" class="bg-white dark:bg-slate-900">
              {{ s }}
            </option>
          </select>
        </div>

        <button
          v-if="filterTable !== 'ALL' || filterSeat !== 'ALL' || filterStatus !== 'all' || searchOrderQuery"
          @click="resetFilters"
          type="button"
          class="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold transition flex items-center gap-1"
        >
          <VIcon name="refresh" size="xs" />
          <span>Reset</span>
        </button>

        <button
          v-if="unprocessedCount > 0"
          @click="handleBatchPrintUnprocessed"
          type="button"
          class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <VIcon name="printer" size="xs" />
          <span>Print All {{ unprocessedCount }} Unprocessed</span>
        </button>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- DUAL WORKSPACE: PROCESSED & UNPROCESSED ORDERS TABLE + 80MM TICKET  -->
    <!-- =================================================================== -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <!-- Left 8 Cols: Processed & Unprocessed Orders Table -->
      <div class="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden transition-colors">
        <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="text-xs font-extrabold text-slate-700 dark:text-slate-200">
            Processed &amp; Unprocessed Orders Table ({{ filteredOrders.length }})
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">Click a row to preview or print/reprint its 80mm receipt</span>
        </div>

        <div v-if="filteredOrders.length === 0" class="py-14 text-center text-slate-400 text-sm">
          No orders match your current filters.
        </div>

        <!-- Desktop & Tablet Structured Table -->
        <div v-else class="hidden md:block overflow-x-auto max-h-[620px] overflow-y-auto">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-slate-100 dark:bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 z-10">
              <tr>
                <th class="py-3 px-4">Order &amp; Time</th>
                <th class="py-3 px-4">Table &amp; Seat</th>
                <th class="py-3 px-4">Guest &amp; Dish</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Receipt Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <tr
                v-for="order in filteredOrders"
                :key="order.id"
                @click="selectedOrderId = order.id"
                class="cursor-pointer transition-colors"
                :class="activeOrder?.id === order.id
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/10'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-950/60'"
              >
                <td class="py-3 px-4 whitespace-nowrap">
                  <div class="font-mono font-black text-orange-600 dark:text-orange-400">{{ order.id }}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ order.time }}</div>
                </td>

                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-lg bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30 font-extrabold">
                    {{ order.table }} • {{ order.seat }}
                  </span>
                </td>

                <td class="py-3 px-4">
                  <div class="font-extrabold text-slate-900 dark:text-white">{{ order.guest }}</div>
                  <div class="text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">{{ order.dish }}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">
                    Sides: {{ order.sides.join(', ') }} • Protein: {{ order.proteins.join(', ') }}
                  </div>
                </td>

                <td class="py-3 px-4 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border inline-flex items-center gap-1"
                    :class="order.status === 'unprocessed'
                      ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                      : order.status === 'processed'
                        ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'"
                  >
                    <VIcon :name="order.status === 'unprocessed' ? 'clock' : order.status === 'processed' ? 'printer' : 'check'" size="xs" />
                    <span>{{ order.status }}</span>
                  </span>
                  <div class="text-[10px] text-slate-400 mt-1 font-mono">
                    Prints: {{ order.printCount }}
                  </div>
                </td>

                <td class="py-3 px-4 whitespace-nowrap text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <button
                      @click.stop="triggerPhysicalPrint(order.id)"
                      type="button"
                      class="px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1"
                      :class="order.printCount > 0
                        ? 'bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-800 dark:text-yellow-300 border border-yellow-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'"
                    >
                      <VIcon name="printer" size="xs" />
                      <span>{{ order.printCount > 0 ? 'Reprint' : 'Print' }}</span>
                    </button>

                    <button
                      v-if="order.status !== 'delivered'"
                      @click.stop="handleMarkDelivered(order.id)"
                      type="button"
                      class="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 font-bold text-xs transition"
                      title="Mark Delivered"
                    >
                      <VIcon name="check" size="xs" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List View (Phones) -->
        <div v-if="filteredOrders.length > 0" class="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            @click="selectedOrderId = order.id"
            class="p-4 space-y-2 transition-colors"
            :class="activeOrder?.id === order.id ? 'bg-emerald-500/10' : ''"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono font-black text-xs text-orange-600 dark:text-orange-400">{{ order.id }} • {{ order.time }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border"
                :class="order.status === 'unprocessed'
                  ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                  : order.status === 'processed'
                    ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'"
              >
                {{ order.status }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="font-extrabold text-sm text-slate-900 dark:text-white">{{ order.guest }}</div>
              <span class="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 font-bold text-xs">
                {{ order.table }} • {{ order.seat }}
              </span>
            </div>
            <div class="text-xs font-bold text-emerald-700 dark:text-emerald-400">{{ order.dish }}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">
              Sides: {{ order.sides.join(', ') }} • Protein: {{ order.proteins.join(', ') }}
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-[11px] font-mono text-slate-400">Printed: {{ order.printCount }}x</span>
              <div class="flex gap-2">
                <button
                  @click.stop="triggerPhysicalPrint(order.id)"
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1"
                >
                  <VIcon name="printer" size="xs" />
                  <span>{{ order.printCount > 0 ? 'Reprint' : 'Print' }}</span>
                </button>
                <button
                  v-if="order.status !== 'delivered'"
                  @click.stop="handleMarkDelivered(order.id)"
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs"
                >
                  Deliver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- RIGHT 4 COLS: XPRINTER XP-80T 80MM THERMAL TICKET / RECEIPT       -->
      <!-- ================================================================= -->
      <div class="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md flex flex-col items-center sticky top-20 transition-colors">
        <div class="w-full flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <VIcon name="printer" size="xs" />
              <span>XP-80T Thermal Receipt</span>
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              79.5 ± 0.5mm (80mm Roll)
            </div>
          </div>

          <button
            v-if="activeOrder"
            @click="triggerPhysicalPrint(activeOrder.id)"
            type="button"
            class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md flex items-center gap-1.5"
          >
            <VIcon name="printer" size="xs" />
            <span>{{ activeOrder.printCount > 0 ? 'Reprint Slip' : 'Print Slip' }}</span>
          </button>
        </div>

        <!-- 80mm Dimension Indicator -->
        <div class="w-full max-w-[302px] flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-1">
          <span>0 mm</span>
          <span class="text-orange-600 dark:text-orange-400 font-bold">79.5 ± 0.5 mm</span>
          <span>80 mm</span>
        </div>

        <!-- ACTUAL 80MM THERMAL TICKET RECEIPT -->
        <div
          v-if="activeOrder"
          id="xp80t-printable-ticket"
          class="w-full max-w-[302px] bg-[#fffdf9] text-slate-950 rounded-b-xl shadow-2xl border-t-[10px] border-slate-900 font-mono text-xs overflow-hidden relative border-x border-slate-300"
        >
          <div class="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-[10px]">
            <span>XP-80T • 79.5mm</span>
            <span class="font-bold text-yellow-400">
              {{ activeOrder.printCount > 1 ? `REPRINT #${activeOrder.printCount}` : 'ORDER TICKET' }}
            </span>
          </div>

          <div class="p-4 space-y-3">
            <div class="text-center border-b-2 border-dashed border-slate-400 pb-2.5">
              <div class="flex justify-center mb-1.5">
                <img
                  src="/images/svg/placeholder-bw-light.svg"
                  alt="RenGala"
                  class="h-12 w-auto object-contain"
                />
              </div>
              <div class="font-black text-sm tracking-tight leading-tight">RENGALA</div>
              <div class="text-[10px] font-bold text-slate-600 uppercase">End of Year Event • Kitchen Slip</div>

              <div class="mt-2 bg-slate-950 text-white py-2 px-3 rounded-lg border-2 border-slate-900">
                <div class="text-[9px] uppercase tracking-widest text-yellow-400 font-bold">Table &amp; Seat</div>
                <div class="text-lg font-black tracking-tight">
                  {{ activeOrder.table.toUpperCase() }} • {{ activeOrder.seat.toUpperCase() }}
                </div>
              </div>
            </div>

            <div class="space-y-1 text-[11px] border-b-2 border-dashed border-slate-400 pb-2.5">
              <div class="flex justify-between">
                <span class="text-slate-600">ORDER NO:</span>
                <strong class="text-slate-950 font-black">{{ activeOrder.id }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">GUEST:</span>
                <strong class="text-slate-950 text-right truncate max-w-[170px]">{{ activeOrder.guest }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">CATEGORY:</span>
                <strong class="text-slate-950">{{ activeOrder.category }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">TIME:</span>
                <span>{{ activeOrder.time }}</span>
              </div>
            </div>

            <div class="space-y-2.5 border-b-2 border-dashed border-slate-400 pb-3">
              <div>
                <div class="text-[10px] font-bold text-slate-500 uppercase">Selected Dish:</div>
                <div class="font-black text-sm text-slate-950 leading-snug mt-0.5">
                  1x {{ activeOrder.dish }}
                </div>
              </div>

              <div class="bg-slate-100 p-2 rounded border border-slate-300">
                <div class="text-[10px] font-bold text-slate-600 uppercase">Protein:</div>
                <div class="font-black text-xs text-slate-950 mt-0.5">
                  {{ activeOrder.proteins.join(' + ') }}
                </div>
              </div>

              <div>
                <div class="text-[10px] font-bold text-slate-500 uppercase">Sides:</div>
                <div class="font-bold text-xs text-slate-900 mt-0.5">
                  + {{ activeOrder.sides.join(', ') }}
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center pt-1">
              <div class="text-[9px] font-bold text-slate-600 uppercase mb-1">
                Scan QR Upon Table Delivery
              </div>
              <div class="p-2 bg-white border-2 border-slate-900 rounded-lg">
                <QrCode :value="activeOrder.qrToken || activeOrder.id" :size="112" />
              </div>
              <div class="text-[10px] font-bold text-slate-700 mt-1">{{ activeOrder.qrToken || activeOrder.id }}</div>
              <div class="mt-2 px-2.5 py-0.5 rounded bg-slate-900 text-white font-extrabold text-[10px] uppercase">
                STATUS: {{ activeOrder.status.toUpperCase() }}
              </div>
            </div>
          </div>

          <div class="h-3 w-full bg-slate-900 flex items-center justify-around overflow-hidden">
            <span v-for="n in 18" :key="n" class="w-2 h-2 rounded-full bg-[#fffdf9] -mt-2"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { eventState, userSession, updateOrderStatus } = useEventSuite()

// Role guard: only Vendor and Admin allowed
onMounted(() => {
  if (userSession.value.role === 'guest') {
    router.replace('/menu')
  }
})

const filterStatus = ref<'all' | 'unprocessed' | 'processed' | 'delivered'>('all')
const filterTable = ref<string>('ALL')
const filterSeat = ref<string>('ALL')
const searchOrderQuery = ref('')
const selectedOrderId = ref<string>('ORD-1114')
const deliveryQrInput = ref('')

const unprocessedCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.orders.filter(o => o.status === 'unprocessed').length
})

const processedCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.orders.filter(o => o.status === 'processed').length
})

const deliveredCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.orders.filter(o => o.status === 'delivered').length
})

const nigerianOrdersCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.orders.filter(o => o.category === 'Nigerian Dishes').length
})

const continentalOrdersCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.orders.filter(o => o.category === 'Continental Dishes').length
})

const totalPlatesLeft = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.menuItems.reduce((s, i) => s + (i.manualClosed ? 0 : i.stock), 0)
})

const soldOutDishesCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.menuItems.filter(i => i.stock <= 0 || i.manualClosed).length
})

const statusTabs = computed(() => [
  { label: 'All Orders', value: 'all' as const, count: eventState.value?.orders.length || 0 },
  { label: 'Unprocessed', value: 'unprocessed' as const, count: unprocessedCount.value },
  { label: 'Processed', value: 'processed' as const, count: processedCount.value },
  { label: 'Delivered', value: 'delivered' as const, count: deliveredCount.value }
])

const targetStatusOrders = computed(() => {
  if (!eventState.value) return []
  if (filterStatus.value === 'all') {
    return eventState.value.orders
  }
  return eventState.value.orders.filter(o => o.status === filterStatus.value)
})

const availableTablesInOrders = computed(() => {
  const set = new Set(targetStatusOrders.value.map(o => o.table))
  return Array.from(set).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10) || 0
    const nb = parseInt(b.replace(/\D/g, ''), 10) || 0
    return na - nb
  })
})

const availableSeatsInOrders = computed(() => {
  let orders = targetStatusOrders.value
  if (filterTable.value !== 'ALL') {
    orders = orders.filter(o => o.table === filterTable.value)
  }
  const set = new Set(orders.map(o => o.seat))
  if (set.size === 0) {
    return Array.from({ length: 10 }, (_, i) => `Seat ${i + 1}`)
  }
  return Array.from(set).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10) || 0
    const nb = parseInt(b.replace(/\D/g, ''), 10) || 0
    return na - nb
  })
})

const filteredOrders = computed(() => {
  if (!eventState.value) return []
  const q = searchOrderQuery.value.trim().toLowerCase()
  return eventState.value.orders.filter((o) => {
    if (filterStatus.value !== 'all' && o.status !== filterStatus.value) return false
    if (filterTable.value !== 'ALL' && o.table !== filterTable.value) return false
    if (filterSeat.value !== 'ALL' && o.seat !== filterSeat.value) return false
    if (q && !o.guest.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q) && !o.dish.toLowerCase().includes(q)) return false
    return true
  })
})

const activeOrder = computed(() => {
  if (!eventState.value || eventState.value.orders.length === 0) return null
  return (
    eventState.value.orders.find(o => o.id === selectedOrderId.value) ||
    filteredOrders.value[0] ||
    eventState.value.orders[0]
  )
})

const resetFilters = () => {
  filterStatus.value = 'all'
  filterTable.value = 'ALL'
  filterSeat.value = 'ALL'
  searchOrderQuery.value = ''
}

const triggerPhysicalPrint = async (orderId: string) => {
  selectedOrderId.value = orderId
  await updateOrderStatus({
    orderId,
    action: 'print',
    printTicket: true,
    performedBy: userSession.value?.name || 'Kitchen Staff'
  })
  if (import.meta.client) {
    setTimeout(() => {
      window.print()
    }, 100)
  }
}

const handleMarkDelivered = async (orderId: string) => {
  await updateOrderStatus({ orderId, status: 'delivered' })
}

const handleScanDeliveryQr = async () => {
  if (!deliveryQrInput.value.trim()) return
  try {
    const res = await updateOrderStatus({
      action: 'scan_delivery',
      query: deliveryQrInput.value.trim()
    })
    if (res.order) {
      selectedOrderId.value = res.order.id
    }
    deliveryQrInput.value = ''
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Order QR not found')
  }
}

const handleBatchPrintUnprocessed = async () => {
  if (!eventState.value) return
  const ids = eventState.value.orders.filter(o => o.status === 'unprocessed').map(o => o.id)
  if (!ids.length) return
  await updateOrderStatus({
    action: 'batch_print',
    orderIds: ids
  })
}
</script>

