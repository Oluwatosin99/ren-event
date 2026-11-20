<template>
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Top Executive Header (Isometric Hexagons at 19% Opacity + Watermarked Glass) -->
    <div class="p-[2px] rounded-3xl bg-gradient-to-r from-emerald-500 via-yellow-400 to-orange-500 shadow-xl">
      <div class="relative overflow-hidden rounded-[22px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <!-- Soft Renaissance Ambient Wash -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-yellow-400/10 to-orange-500/10 pointer-events-none"></div>

        <!-- Isometric Hexagon / Cube Pattern at 19% Opacity -->
        <svg class="absolute inset-0 w-full h-full opacity-[0.19] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="renHexGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="50%" stop-color="#eab308" />
              <stop offset="100%" stop-color="#f97316" />
            </linearGradient>
            <pattern id="isoHexPattern" width="56" height="96" patternUnits="userSpaceOnUse">
              <path
                d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 0 L28 32 M0 48 L28 32 L56 48 M28 64 L28 96 M0 48 L28 64 L56 48 M0 80 L28 64 L56 80"
                fill="none"
                stroke="url(#renHexGrad)"
                stroke-width="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#isoHexPattern)" />
        </svg>

        <div class="relative z-10">
          <div class="flex flex-wrap items-center gap-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Operations Feed</span>
            </div>
          </div>
          <h1 class="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-2.5">
            RenGala Meal Order Dashboard
          </h1>
          <div class="text-xs text-slate-600 dark:text-slate-300 font-mono mt-2 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white shadow-sm">
              {{ currentTimeFormatted }}
            </span>
            <span class="font-sans font-semibold text-slate-500 dark:text-slate-400">• Real-Time Tracking Active</span>
          </div>
        </div>

        <!-- Top Executive Filters: Quad, Table, Seat, Status (Frosted White Glass Card) -->
        <div class="relative z-10 flex flex-wrap items-center gap-3 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <!-- Quad Filter -->
          <div class="flex flex-col min-w-[120px] flex-1 sm:flex-initial">
            <label class="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 px-1 mb-1">Quad</label>
            <select
              v-model="filterQuad"
              class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Quads</option>
              <option value="A">Quad A (Tables 1–50)</option>
              <option value="B">Quad B (Tables 51–100)</option>
              <option value="C">Quad C (Tables 101–150)</option>
              <option value="D">Quad D (Tables 151–200)</option>
            </select>
          </div>

          <!-- Table Number Filter -->
          <div class="flex flex-col min-w-[120px] flex-1 sm:flex-initial">
            <label class="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 px-1 mb-1">Table</label>
            <select
              v-model="filterTable"
              class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Tables</option>
              <option v-for="t in availableTables" :key="t" :value="t">Table {{ t }}</option>
            </select>
          </div>

          <!-- Seat Number Filter -->
          <div class="flex flex-col min-w-[110px] flex-1 sm:flex-initial">
            <label class="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 px-1 mb-1">Seat</label>
            <select
              v-model="filterSeat"
              class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Seats</option>
              <option v-for="s in maxSeatsPerTable" :key="s" :value="`Seat ${s}`">Seat {{ s }}</option>
            </select>
          </div>

          <!-- Status Filter (Processed / Unprocessed / Delivered) -->
          <div class="flex flex-col min-w-[140px] flex-1 sm:flex-initial">
            <label class="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 px-1 mb-1">Status</label>
            <select
              v-model="filterStatus"
              class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="unprocessed">Unprocessed Only</option>
              <option value="processed">Processed (Printed)</option>
              <option value="delivered">Served (Delivered)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Operations Tab Bar -->
    <div class="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
      <button
        v-for="tab in adminTabs"
        :key="tab.id"
        type="button"
        @click="adminTab = tab.id"
        class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5"
        :class="adminTab === tab.id
          ? 'bg-emerald-600 text-white shadow'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'"
      >
        <VIcon :name="tab.icon" size="xs" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge !== undefined"
          class="px-1.5 py-0.2 rounded-full text-[10px] font-black"
          :class="adminTab === tab.id ? 'bg-yellow-400 text-slate-950' : 'bg-orange-500 text-white'"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- =================================================================== -->
    <!-- TAB 1: ORDER MATRIX & EXECUTIVE KPIS                                -->
    <!-- =================================================================== -->
    <template v-if="adminTab === 'matrix'">
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
          <div class="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <VIcon name="bolt" size="md" />
          </div>
          <div>
            <div class="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{{ servedRate }}%</div>
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

      <!-- Right Backend Summary (Delivery Personnel Breakdown — 3 Separate Bars per Server) (4 cols) -->
      <div class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div class="space-y-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Backend Summary</h2>
          <div class="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-300">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>Orders Received</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>Orders Printed</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Orders Served</span>
          </div>
        </div>

        <!-- Server Performance Rows (3 Distinct Horizontal Bars matching PowerBI layout) -->
        <div class="space-y-4 max-h-[260px] overflow-y-auto pr-1">
          <div
            v-for="server in serverPerformance"
            :key="server.name"
            class="grid grid-cols-12 items-center gap-2.5"
          >
            <div class="col-span-4 text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate text-right" :title="server.name">
              {{ server.name }}
            </div>
            <div class="col-span-8 space-y-1">
              <!-- Bar 1: Orders Received (Red) -->
              <div class="flex items-center gap-1.5">
                <div class="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-r-md overflow-hidden">
                  <div
                    class="h-full bg-red-500 rounded-r-md transition-all duration-500"
                    :style="{ width: `${server.receivedPct}%` }"
                  ></div>
                </div>
                <span class="w-7 text-right font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">{{ server.received }}</span>
              </div>
              <!-- Bar 2: Orders Printed (Yellow) -->
              <div class="flex items-center gap-1.5">
                <div class="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-r-md overflow-hidden">
                  <div
                    class="h-full bg-yellow-400 rounded-r-md transition-all duration-500"
                    :style="{ width: `${server.printedPct}%` }"
                  ></div>
                </div>
                <span class="w-7 text-right font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">{{ server.printed }}</span>
              </div>
              <!-- Bar 3: Orders Served (Green) -->
              <div class="flex items-center gap-1.5">
                <div class="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-r-md overflow-hidden">
                  <div
                    class="h-full bg-emerald-500 rounded-r-md transition-all duration-500"
                    :style="{ width: `${server.servedPct}%` }"
                  ></div>
                </div>
                <span class="w-7 text-right font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{{ server.served }}</span>
              </div>
            </div>
          </div>

          <div v-if="serverPerformance.length === 0" class="py-8 text-center text-xs text-slate-400">
            No delivery scanner personnel found.
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
              Red = Order Placed | Yellow = Processing / Receipt Printed | Green = Marked Delivered
            </p>
          </div>

          <!-- Quick Legend -->
          <div class="flex items-center gap-3 text-xs font-bold">
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-red-600"></div>
              <span>Ordered</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-yellow-400"></div>
              <span>Printed</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-emerald-600"></div>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        <!-- The Matrix Table (Rows = Tables, Columns = Seat 1 to N) -->
        <div class="overflow-x-auto max-h-[460px] overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table class="w-full text-center border-collapse">
            <thead class="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
              <tr class="text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th class="py-2 px-2 text-left w-24">Table</th>
                <th v-for="seatNum in maxSeatsPerTable" :key="seatNum" class="py-2 px-1 text-center min-w-[28px] sm:w-10">
                  {{ seatNum }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <tr v-for="t in matrixTables" :key="t" class="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                <td class="py-2 px-2 text-left font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                  T{{ t }} <span class="hidden sm:inline font-sans font-bold text-slate-500 dark:text-slate-400">(Table {{ t }})</span>
                </td>
                <td v-for="s in maxSeatsPerTable" :key="s" class="p-0.5 sm:p-1">
                  <!-- Seat Cell: Mobile uses S/O/P, Desktop uses Served/Ordered/Printed -->
                  <div
                    class="h-7 sm:h-8 rounded-lg flex items-center justify-center font-black text-[10px] transition-all select-none"
                    :class="getSeatCellClass(t, s)"
                    :title="getSeatTooltip(t, s)"
                  >
                    <span class="sm:hidden">{{ getSeatCellShortLabel(t, s) }}</span>
                    <span class="hidden sm:inline">{{ getSeatCellLabel(t, s) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quad Performance Breakdown Vertical Bar Chart (4 cols — 100% Real DB Data) -->
      <div class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Quad Performance</h2>
          <div class="flex items-center gap-2.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>Received</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Served</span>
          </div>
        </div>

        <!-- Vertical Grouped Columns: A, B, C, D -->
        <div class="flex-1 flex items-end justify-around gap-3 pt-6 pb-2 min-h-[220px] border-b border-slate-200 dark:border-slate-800">
          <div v-for="quad in quadBreakdown" :key="quad.label" class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div class="w-full flex items-end justify-center gap-1.5 h-44">
              <!-- Received Bar (Red) -->
              <div class="flex flex-col items-center justify-end h-full w-6 sm:w-7">
                <span class="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">{{ quad.received }}</span>
                <div
                  class="w-full bg-red-500 rounded-t-md transition-all duration-500"
                  :style="{ height: quad.received > 0 ? `${Math.max(6, quad.receivedPct)}%` : '2px', opacity: quad.received > 0 ? 1 : 0.25 }"
                ></div>
              </div>
              <!-- Served Bar (Green) -->
              <div class="flex flex-col items-center justify-end h-full w-6 sm:w-7">
                <span class="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">{{ quad.served }}</span>
                <div
                  class="w-full bg-emerald-500 rounded-t-md transition-all duration-500"
                  :style="{ height: quad.served > 0 ? `${Math.max(6, quad.servedPct)}%` : '2px', opacity: quad.served > 0 ? 1 : 0.25 }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center">
          <div v-for="quad in quadBreakdown" :key="`lbl-${quad.label}`">
            <div class="text-xs font-black text-slate-900 dark:text-white">{{ quad.label }}</div>
            <div class="text-[10px] text-slate-400">T{{ quad.range }}</div>
          </div>
        </div>
      </div>
    </div>
    </template>

    <!-- =================================================================== -->
    <!-- TAB 4: GATE REGISTRATION LOGS & VIP / NON-VIP ADMISSION TRACKER     -->
    <!-- =================================================================== -->
    <div v-if="adminTab === 'registration'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <VIcon name="qr" size="sm" class="text-orange-500" />
            <span>Gate Registration &amp; Admission Logs</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Track scanner personnel admission counts and filter admitted guests by VIP and Non-VIP tiers
          </p>
        </div>
      </div>

      <!-- Summary / Sum Block -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Admitted</div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {{ admittedAttendees.length }}
          </div>
          <div class="text-[10px] text-slate-400">Gate Verified Attendees</div>
        </div>
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-semibold">VIP Admitted</div>
          <div class="text-2xl font-black text-yellow-600 dark:text-yellow-400 font-mono mt-0.5">
            {{ vipAdmittedCount }}
          </div>
          <div class="text-[10px] text-slate-400">VIP Tier Guests</div>
        </div>
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Non-VIP Admitted</div>
          <div class="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono mt-0.5">
            {{ nonVipAdmittedCount }}
          </div>
          <div class="text-[10px] text-slate-400">Regular / On-Site / Plus-One</div>
        </div>
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Scanner Personnel</div>
          <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {{ scannerPersonnelStats.length }}
          </div>
          <div class="text-[10px] text-slate-400">Active Gate Officers</div>
        </div>
      </div>

      <!-- Scanner Personnel Admission Counts -->
      <div class="space-y-2">
        <div class="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Scanner Personnel Logs (Admissions per Officer)
        </div>
        <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50 dark:bg-slate-950 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="py-2.5 px-4">Scanner Personnel</th>
                <th class="py-2.5 px-4 text-right">Total Admitted</th>
                <th class="py-2.5 px-4 text-right">VIP</th>
                <th class="py-2.5 px-4 text-right">Non-VIP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="officer in scannerPersonnelStats" :key="officer.name" class="hover:bg-slate-50/70 dark:hover:bg-slate-950/40">
                <td class="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{{ officer.name }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{{ officer.total }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-yellow-600 dark:text-yellow-400">{{ officer.vip }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-orange-600 dark:text-orange-400">{{ officer.nonVip }}</td>
              </tr>
              <tr v-if="scannerPersonnelStats.length === 0">
                <td colspan="4" class="py-6 text-center text-slate-400">No gate admissions logged yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Admitted Guests Table with VIP / Non-VIP Filter -->
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Admitted Guests Log ({{ filteredAdmittedGuests.length }})
          </div>
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              v-for="tab in [
                { id: 'all', label: 'All' },
                { id: 'vip', label: 'VIP Only' },
                { id: 'non_vip', label: 'Non-VIP Only' }
              ]"
              :key="tab.id"
              type="button"
              @click="vipFilter = tab.id as any"
              class="px-3 py-1 rounded-lg text-[11px] font-bold transition"
              :class="vipFilter === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50 dark:bg-slate-950 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="py-2.5 px-4">Ticket ID</th>
                <th class="py-2.5 px-4">Guest Name</th>
                <th class="py-2.5 px-4">Tier</th>
                <th class="py-2.5 px-4">Contact</th>
                <th class="py-2.5 px-4">Table &amp; Seat</th>
                <th class="py-2.5 px-4">Admitted By</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="att in filteredAdmittedGuests" :key="att.ticketId" class="hover:bg-slate-50/70 dark:hover:bg-slate-950/40">
                <td class="py-2.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">{{ att.ticketId }}</td>
                <td class="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{{ att.name }}</td>
                <td class="py-2.5 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    :class="(att.isVip || att.type === 'VIP')
                      ? 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/40'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'"
                  >
                    {{ (att.isVip || att.type === 'VIP') ? 'VIP' : 'Non-VIP' }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-500 dark:text-slate-400">
                  <div>{{ att.phone || '—' }}</div>
                  <div class="text-[10px] font-mono">{{ att.email || '—' }}</div>
                </td>
                <td class="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{{ att.table }} • {{ att.seat }}</td>
                <td class="py-2.5 px-4">
                  <div class="font-semibold text-slate-700 dark:text-slate-300">{{ att.admittedBy || 'Gate Pre-Sync' }}</div>
                  <div class="text-[10px] text-slate-400">{{ att.checkedInAt || 'Checked-In' }}</div>
                </td>
              </tr>
              <tr v-if="filteredAdmittedGuests.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400">No admitted guests match this filter.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- TAB 5: PERSONNEL USERS DIRECTORY & SYSTEM MAINTENANCE               -->
    <!-- =================================================================== -->
    <div v-if="adminTab === 'users'" class="space-y-6">
      <!-- Users Information Table -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Personnel Users Directory ({{ personnelUsers.length }})
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Manage Admin, Gate Register / Scanner, and Delivery Checker accounts
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

        <!-- Desktop & Laptop Table View -->
        <div class="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50 dark:bg-slate-950 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Password (Base64)</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="u in personnelUsers" :key="u.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-950/40">
                <td class="py-3 px-4 font-mono text-slate-400">#{{ u.id }}</td>
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ u.name }}</td>
                <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{{ u.email }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-1.5">
                    <code class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 max-w-[140px] truncate">
                      {{ revealedUserPasswords[u.id] ? decodeBase64Password(u.passwordBase64) : (u.passwordBase64 || '—') }}
                    </code>
                    <button
                      v-if="u.passwordBase64"
                      type="button"
                      @click="toggleRevealUserPassword(u.id)"
                      class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition shrink-0"
                      :class="revealedUserPasswords[u.id]
                        ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'"
                    >
                      {{ revealedUserPasswords[u.id] ? 'Hide' : 'Decode' }}
                    </button>
                  </div>
                </td>
                <td class="py-3 px-4 text-slate-500 dark:text-slate-400">{{ u.department }}</td>
                <td class="py-3 px-4">
                  <select
                    :value="u.role"
                    @change="handleUpdateUserRole(u.id, ($event.target as HTMLSelectElement).value as UserRole)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor / Receipt Printer</option>
                    <option value="registrar">Register / Gate Scanner</option>
                    <option value="delivery">Delivery Checker</option>
                  </select>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      @click="openUserEditModal(u)"
                      class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-[11px] transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      @click="handleDeleteUser(u.id, u.name)"
                      class="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white font-bold text-[11px] transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Clean List View (No Horizontal Overflow) -->
        <div class="md:hidden divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div
            v-for="u in personnelUsers"
            :key="u.id"
            class="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono text-slate-400">#{{ u.id }}</span>
                <span class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ u.name }}</span>
              </div>
              <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {{ u.email }}
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                :class="u.role === 'admin'
                  ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                  : u.role === 'registrar'
                    ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'"
              >
                {{ u.role }}
              </span>
              <button
                type="button"
                @click="openUserEditModal(u)"
                class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                aria-label="View & Edit User Details"
              >
                <VIcon name="eye" size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create New Personnel User -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div class="text-sm font-black text-slate-900 dark:text-white">
          Add New Personnel Account
        </div>
        <form @submit.prevent="handleCreateUser" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              v-model="newUser.name"
              type="text"
              required
              placeholder="e.g. Chinedu Okafor"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              placeholder="officer@renaissance.ng"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
            <input
              v-model="newUser.password"
              type="text"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role *</label>
            <select
              v-model="newUser.role"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            >
              <option value="admin">Admin (Full Access)</option>
              <option value="vendor">Vendor / Receipt Printer</option>
              <option value="registrar">Register / Gate Scanner</option>
              <option value="delivery">Delivery Checker</option>
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

    <!-- =================================================================== -->
    <!-- TAB 4: TABLES & SEATS LAYOUT EDITOR (EXCEL / CSV OR MANUAL)         -->
    <!-- =================================================================== -->
    <div v-if="adminTab === 'tables'" class="space-y-6">
      <!-- Safety Check Banner -->
      <div
        class="rounded-3xl p-5 sm:p-6 border-2 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        :class="allOrders.length > 0
          ? 'bg-red-500/10 border-red-500/40'
          : 'bg-emerald-500/10 border-emerald-500/40'"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2 font-black text-sm" :class="allOrders.length > 0 ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'">
            <VIcon :name="allOrders.length > 0 ? 'alert' : 'checkCircle'" size="sm" />
            <span>
              {{ allOrders.length > 0
                ? `Safety Check Locked: ${allOrders.length} Active Order(s) on Tables`
                : 'Safety Check Clear: 0 Active Orders — Safe to Edit Tables & Seats' }}
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            {{ allOrders.length > 0
              ? 'Existing tables are protected while orders exist. Clear all orders first before applying a new table layout.'
              : `Current Layout: ${eventState?.capacity.totalTables || 200} Tables × ${eventState?.capacity.seatsPerTable || 10} Seats/Table (${(eventState?.capacity.totalExpected || 2000).toLocaleString()} total seats).` }}
          </p>
        </div>

        <button
          v-if="allOrders.length > 0"
          type="button"
          @click="handleClearAllOrders"
          :disabled="isLoading"
          class="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs shadow-md transition shrink-0"
        >
          Clear All Orders
        </button>
      </div>

      <div v-if="tableLayoutFeedback" class="p-3.5 rounded-2xl text-xs font-bold border" :class="tableLayoutFeedback.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'">
        {{ tableLayoutFeedback.message }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Option 1: Upload Excel / CSV File -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <VIcon name="upload" size="sm" class="text-orange-500" />
              <span>Upload Excel / CSV Table Sheet</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload an <code class="font-mono">.xlsx</code>, <code class="font-mono">.xls</code>, or <code class="font-mono">.csv</code> file with columns like <strong>Table</strong> and <strong>Seats</strong> (or TableNumber / SeatNumber). Preview first, then apply.
            </p>
          </div>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleExcelTableUpload"
            class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-orange-500/15 file:text-orange-700 dark:file:text-orange-300 file:font-bold cursor-pointer"
          />

          <div v-if="parsedExcelTables.length > 0" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-emerald-700 dark:text-emerald-400">Preview Ready: {{ parsedExcelTables.length }} Tables</span>
              <span class="font-mono text-slate-500">{{ parsedExcelTotalSeats }} Total Seats</span>
            </div>
            <div class="max-h-36 overflow-y-auto text-[11px] font-mono text-slate-600 dark:text-slate-300 space-y-1">
              <div v-for="row in parsedExcelTables.slice(0, 12)" :key="row.tableNo" class="flex justify-between">
                <span>Table {{ row.tableNo }}</span>
                <span>{{ row.seats }} seats</span>
              </div>
              <div v-if="parsedExcelTables.length > 12" class="text-slate-400">...and {{ parsedExcelTables.length - 12 }} more tables</div>
            </div>
            <button
              type="button"
              @click="applyExcelTableLayout"
              :disabled="isLoading || allOrders.length > 0"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs transition"
            >
              {{ allOrders.length > 0 ? 'Clear All Orders First to Apply' : 'Apply Uploaded Table Layout' }}
            </button>
          </div>
        </div>

        <!-- Option 2: Manual Table & Seat Setup -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <VIcon name="grid" size="sm" class="text-emerald-600 dark:text-emerald-400" />
              <span>Manual Table &amp; Seat Setup</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quickly define how many tables exist and how many seats per table.
            </p>
          </div>

          <form @submit.prevent="applyManualTableLayout" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Tables *</label>
                <input
                  v-model.number="manualLayout.totalTables"
                  type="number"
                  min="1"
                  max="500"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seats Per Table *</label>
                <input
                  v-model.number="manualLayout.seatsPerTable"
                  type="number"
                  min="1"
                  max="30"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex justify-between">
              <span>Calculated Total Capacity:</span>
              <strong class="font-mono text-emerald-700 dark:text-emerald-400">{{ (manualLayout.totalTables * manualLayout.seatsPerTable).toLocaleString() }} Seats</strong>
            </div>

            <button
              type="submit"
              :disabled="isLoading || allOrders.length > 0"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs transition shadow-sm"
            >
              {{ allOrders.length > 0 ? 'Clear All Orders First to Save' : 'Save Manual Table Layout' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Personnel User Details & Edit Modal -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedUserModal"
        class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="selectedUserModal = null"
      >
        <form
          @submit.prevent="handleSaveUserEdit"
          class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
        >
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div class="text-[11px] font-mono text-slate-400">Personnel ID #{{ selectedUserModal.id }}</div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">Edit Personnel Account</h3>
            </div>
            <button
              type="button"
              @click="selectedUserModal = null"
              class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
            >
              <VIcon name="x" size="xs" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
              <input
                v-model="editUserForm.name"
                type="text"
                required
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Email Address *</label>
              <input
                v-model="editUserForm.email"
                type="email"
                required
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Department</label>
              <input
                v-model="editUserForm.department"
                type="text"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Assigned Role *</label>
              <select
                v-model="editUserForm.role"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="vendor">Vendor / Receipt Printer</option>
                <option value="registrar">Register / Gate Scanner</option>
                <option value="delivery">Delivery Checker</option>
              </select>
            </div>

            <div v-if="selectedUserModal?.passwordBase64" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Stored Password (Base64)</span>
                <button
                  type="button"
                  @click="toggleRevealUserPassword(selectedUserModal.id)"
                  class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition"
                  :class="revealedUserPasswords[selectedUserModal.id]
                    ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'"
                >
                  {{ revealedUserPasswords[selectedUserModal.id] ? 'Hide Decoded' : 'Decode Base64' }}
                </button>
              </div>
              <div class="font-mono text-xs font-bold text-slate-900 dark:text-white break-all">
                {{ revealedUserPasswords[selectedUserModal.id] ? decodeBase64Password(selectedUserModal.passwordBase64) : selectedUserModal.passwordBase64 }}
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">New Password (optional — saved as Base64)</label>
              <input
                v-model="editUserForm.password"
                type="text"
                placeholder="Leave blank to keep current password"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button
              type="button"
              @click="handleDeleteUser(selectedUserModal.id, selectedUserModal.name)"
              :disabled="isLoading"
              class="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white font-black text-xs transition"
            >
              Delete User
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs transition"
            >
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/server/utils/db'

const {
  eventState,
  isLoading,
  isDark,
  userSession,
  manageUsers,
  simulateConcurrencyBurst
} = useEventSuite()
const router = useRouter()
const selectedUserModal = ref<any>(null)
const revealedUserPasswords = reactive<Record<number, boolean>>({})

const decodeBase64Password = (b64: string | undefined) => {
  if (!b64) return '—'
  try {
    return decodeURIComponent(escape(atob(b64)))
  } catch {
    try {
      return atob(b64)
    } catch {
      return b64
    }
  }
}

const toggleRevealUserPassword = (userId: number) => {
  revealedUserPasswords[userId] = !revealedUserPasswords[userId]
}
const editUserForm = reactive({
  name: '',
  email: '',
  department: '',
  role: 'registrar' as UserRole,
  password: ''
})

const openUserEditModal = (u: any) => {
  selectedUserModal.value = u
  editUserForm.name = u.name
  editUserForm.email = u.email
  editUserForm.department = u.department || 'Event Operations'
  editUserForm.role = u.role
  editUserForm.password = ''
}

const handleSaveUserEdit = async () => {
  if (!selectedUserModal.value) return
  await manageUsers({
    action: 'update_user',
    userId: selectedUserModal.value.id,
    name: editUserForm.name,
    email: editUserForm.email,
    department: editUserForm.department,
    role: editUserForm.role,
    password: editUserForm.password
  })
  selectedUserModal.value = null
}

const handleDeleteUser = async (userId: number, name: string) => {
  if (import.meta.client && !confirm(`Delete personnel user "${name}"?`)) return
  await manageUsers({ action: 'delete_user', userId })
  if (selectedUserModal.value?.id === userId) {
    selectedUserModal.value = null
  }
}

const nowTick = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval> | null = null

// Guard: Only admins (and legacy vendor sessions) allowed
onMounted(() => {
  if (userSession.value.role === 'vendor') {
    router.replace('/vendor')
    return
  }
  if (userSession.value.role !== 'admin') {
    router.replace('/Personnel')
  }
  clockTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const adminTab = ref<'matrix' | 'registration' | 'users' | 'tables'>('matrix')

const adminTabs = computed(() => [
  { id: 'matrix' as const, label: 'Order Matrix & KPIs', icon: 'layers', badge: undefined },
  { id: 'tables' as const, label: 'Tables & Layout', icon: 'grid', badge: undefined },
  { id: 'registration' as const, label: 'Registration Logs', icon: 'qr', badge: undefined },
  { id: 'users' as const, label: 'Personnel Users', icon: 'users', badge: undefined }
])

// Tables & Layout editor state
const tableLayoutFeedback = ref<{ ok: boolean; message: string } | null>(null)
const parsedExcelTables = ref<Array<{ tableNo: number; seats: number }>>([])
const parsedExcelTotalSeats = computed(() => parsedExcelTables.value.reduce((s, r) => s + r.seats, 0))
const manualLayout = reactive({
  totalTables: eventState.value?.capacity.totalTables || 200,
  seatsPerTable: eventState.value?.capacity.seatsPerTable || 10
})

const handleClearAllOrders = async () => {
  if (import.meta.client && !confirm(`Are you sure you want to clear all ${allOrders.value.length} active orders? This cannot be undone.`)) {
    return
  }
  tableLayoutFeedback.value = null
  try {
    const res = await $fetch<any>('/api/orders', {
      method: 'PATCH',
      body: { action: 'clear_all_orders' }
    })
    if (res.state) eventState.value = res.state
    tableLayoutFeedback.value = { ok: true, message: 'All orders cleared. You can now safely edit or upload the table layout.' }
  } catch (err: any) {
    tableLayoutFeedback.value = { ok: false, message: err?.data?.statusMessage || 'Failed to clear orders.' }
  }
}

const handleExcelTableUpload = async (e: Event) => {
  tableLayoutFeedback.value = null
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const XLSX = await import('xlsx')
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet)

    const map = new Map<number, number>()
    for (const r of rows) {
      const keys = Object.keys(r)
      const tableKey = keys.find(k => /table/i.test(k)) || keys[0]
      const seatKey = keys.find(k => /seat/i.test(k)) || keys[1]
      const tVal = parseInt(String(r[tableKey] || '').replace(/\D/g, ''), 10)
      const sVal = seatKey ? parseInt(String(r[seatKey] || '').replace(/\D/g, ''), 10) : 10
      if (!isNaN(tVal) && tVal > 0) {
        const current = map.get(tVal) || 0
        map.set(tVal, Math.max(current, isNaN(sVal) ? 10 : Math.min(30, sVal)))
      }
    }

    parsedExcelTables.value = Array.from(map.entries())
      .map(([tableNo, seats]) => ({ tableNo, seats }))
      .sort((a, b) => a.tableNo - b.tableNo)

    if (parsedExcelTables.value.length === 0) {
      tableLayoutFeedback.value = { ok: false, message: 'No valid table numbers found in the uploaded file.' }
    }
  } catch {
    tableLayoutFeedback.value = { ok: false, message: 'Could not read Excel/CSV file. Please check the file format.' }
  }
}

const applyExcelTableLayout = async () => {
  tableLayoutFeedback.value = null
  try {
    const res = await $fetch<any>('/api/tables', {
      method: 'POST',
      body: { action: 'update_layout', customTables: parsedExcelTables.value }
    })
    if (res.state) eventState.value = res.state
    tableLayoutFeedback.value = { ok: true, message: `Applied uploaded layout: ${parsedExcelTables.value.length} tables (${parsedExcelTotalSeats.value} seats).` }
  } catch (err: any) {
    tableLayoutFeedback.value = { ok: false, message: err?.data?.statusMessage || 'Failed to apply uploaded layout.' }
  }
}

const applyManualTableLayout = async () => {
  tableLayoutFeedback.value = null
  try {
    const res = await $fetch<any>('/api/tables', {
      method: 'POST',
      body: {
        action: 'update_layout',
        totalTables: manualLayout.totalTables,
        seatsPerTable: manualLayout.seatsPerTable
      }
    })
    if (res.state) eventState.value = res.state
    tableLayoutFeedback.value = { ok: true, message: `Saved manual layout: ${manualLayout.totalTables} tables × ${manualLayout.seatsPerTable} seats.` }
  } catch (err: any) {
    tableLayoutFeedback.value = { ok: false, message: err?.data?.statusMessage || 'Failed to save manual layout.' }
  }
}

// Personnel Users tab state
const personnelUsers = computed(() => {
  return (eventState.value?.users || []).filter(u => u.role !== 'guest')
})

const handleUpdateUserRole = async (userId: number, role: UserRole) => {
  await manageUsers({ action: 'update_role', userId, role })
}

const vipFilter = ref<'all' | 'vip' | 'non_vip'>('all')

const admittedAttendees = computed(() => {
  return (eventState.value?.attendees || []).filter(a => a.checkedIn)
})

const vipAdmittedCount = computed(() => {
  return admittedAttendees.value.filter(a => a.isVip || a.type === 'VIP').length
})

const nonVipAdmittedCount = computed(() => {
  return admittedAttendees.value.filter(a => !(a.isVip || a.type === 'VIP')).length
})

const scannerPersonnelStats = computed(() => {
  const map = new Map<string, { name: string; total: number; vip: number; nonVip: number }>()
  for (const att of admittedAttendees.value) {
    const officer = att.admittedBy || 'Gate Pre-Sync'
    const entry = map.get(officer) || { name: officer, total: 0, vip: 0, nonVip: 0 }
    entry.total++
    if (att.isVip || att.type === 'VIP') entry.vip++
    else entry.nonVip++
    map.set(officer, entry)
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
})

const filteredAdmittedGuests = computed(() => {
  return admittedAttendees.value.filter(a => {
    const isVip = a.isVip || a.type === 'VIP'
    if (vipFilter.value === 'vip') return isVip
    if (vipFilter.value === 'non_vip') return !isVip
    return true
  })
})

const filterQuad = ref<string>('ALL')
const filterTable = ref<string>('ALL')
const filterSeat = ref<string>('ALL')
const filterStatus = ref<string>('ALL')

const currentTimeFormatted = computed(() => {
  return new Date(nowTick.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
  if (!totalOrdersCount.value) return '0.0'
  const amalaCount = allOrders.value.filter(o => o.dish.toLowerCase().includes('amala')).length
  return ((amalaCount / totalOrdersCount.value) * 100).toFixed(1)
})

const continentalOrderRate = computed(() => {
  if (!totalOrdersCount.value) return '0.0'
  const contCount = allOrders.value.filter(o => o.category === 'Continental Dishes').length
  return ((contCount / totalOrdersCount.value) * 100).toFixed(1)
})

const maxSeatsPerTable = computed(() => eventState.value?.capacity.seatsPerTable || 10)

const availableTables = computed(() => {
  const total = eventState.value?.capacity.totalTables || 200
  const set = new Set<number>()
  for (let i = 1; i <= total; i++) set.add(i)
  for (const o of allOrders.value) {
    const num = parseInt(o.table.replace(/\D/g, ''), 10)
    if (!isNaN(num)) set.add(num)
  }
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
  return tables
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
  return 'bg-red-600 text-white font-black shadow-sm'
}

const getSeatCellLabel = (tableNum: number, seatNum: number) => {
  const ord = getSeatOrder(tableNum, seatNum)
  if (!ord) return ''
  if (ord.status === 'delivered') return 'Served'
  if (ord.status === 'processed') return 'Printed'
  return 'Ordered'
}

const getSeatCellShortLabel = (tableNum: number, seatNum: number) => {
  const ord = getSeatOrder(tableNum, seatNum)
  if (!ord) return ''
  if (ord.status === 'delivered') return 'S'
  if (ord.status === 'processed') return 'P'
  return 'O'
}

const getSeatTooltip = (tableNum: number, seatNum: number) => {
  const ord = getSeatOrder(tableNum, seatNum)
  if (!ord) return `Table ${tableNum} • Seat ${seatNum}: No order placed yet`
  return `Table ${tableNum} • Seat ${seatNum}: ${ord.guest} (${ord.dish}) [${ord.status.toUpperCase()}]`
}

// Backend Summary: 100% Real Data from Delivery Personnel (`users` with role='delivery') & live `orders`
const serverPerformance = computed(() => {
  const cleanName = (n: string) => String(n || '').replace(/\s*\(Delivery\)\s*$/i, '').trim()
  const serverNames = new Set<string>()

  // Include all registered delivery personnel from MySQL `users`
  for (const u of eventState.value?.users || []) {
    if (u.role === 'delivery' && u.name) {
      serverNames.add(cleanName(u.name))
    }
  }
  // Include any other person who has actually scanned/served an order
  for (const o of allOrders.value) {
    if (o.servedBy) {
      serverNames.add(cleanName(o.servedBy))
    }
  }

  const rows = Array.from(serverNames).map((name) => {
    const targetLower = name.toLowerCase()
    const matched = allOrders.value.filter((o) => {
      if (!o.servedBy) return false
      const s = cleanName(o.servedBy).toLowerCase()
      return s === targetLower || s.includes(targetLower) || targetLower.includes(s)
    })

    const received = matched.length
    const printed = matched.filter(o => Number(o.printCount || 0) > 0 || o.status === 'processed' || o.status === 'delivered').length
    const served = matched.filter(o => o.status === 'delivered').length

    return { name, received, printed, served }
  })

  rows.sort((a, b) => (b.served - a.served) || (b.received - a.received) || a.name.localeCompare(b.name))

  const maxVal = Math.max(...rows.map(r => Math.max(r.received, r.printed, r.served)), 1)
  return rows.map(s => ({
    ...s,
    receivedPct: s.received > 0 ? Math.max(4, Math.round((s.received / maxVal) * 100)) : 0,
    printedPct: s.printed > 0 ? Math.max(4, Math.round((s.printed / maxVal) * 100)) : 0,
    servedPct: s.served > 0 ? Math.max(4, Math.round((s.served / maxVal) * 100)) : 0
  }))
})

// Quad Breakdown: 100% Real Data computed from live `orders` across Quads A, B, C, D
const quadBreakdown = computed(() => {
  const quads = [
    { label: 'A', range: '1–50', min: 1, max: 50, received: 0, served: 0 },
    { label: 'B', range: '51–100', min: 51, max: 100, received: 0, served: 0 },
    { label: 'C', range: '101–150', min: 101, max: 150, received: 0, served: 0 },
    { label: 'D', range: '151–200', min: 151, max: 9999, received: 0, served: 0 }
  ]

  for (const o of allOrders.value) {
    const tNum = parseInt(String(o.table || '').replace(/\D/g, ''), 10)
    if (isNaN(tNum)) continue
    const q = quads.find(x => tNum >= x.min && tNum <= x.max)
    if (!q) continue
    q.received++
    if (o.status === 'delivered') q.served++
  }

  const maxVal = Math.max(...quads.map(q => Math.max(q.received, q.served)), 1)
  return quads.map(q => ({
    label: q.label,
    range: q.range,
    received: q.received,
    served: q.served,
    receivedPct: q.received > 0 ? Math.round((q.received / maxVal) * 100) : 0,
    servedPct: q.served > 0 ? Math.round((q.served / maxVal) * 100) : 0
  }))
})

const newUser = reactive({
  name: '',
  email: '',
  password: 'gate123',
  role: 'registrar' as UserRole,
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
