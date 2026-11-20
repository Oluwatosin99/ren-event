<template>
  <div class="max-w-5xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8">
    <!-- App Header Banner (Replicated Admin Isometric Hexagons at 19% Opacity + Watermarked Glass) -->
    <div class="p-[2px] rounded-3xl bg-gradient-to-r from-emerald-500 via-yellow-400 to-orange-500 shadow-xl mb-6">
      <div class="relative overflow-hidden rounded-[22px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Soft RenGala Ambient Wash -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-yellow-400/10 to-orange-500/10 pointer-events-none"></div>

        <!-- Isometric Hexagon / Cube Pattern at 19% Opacity -->
        <svg class="absolute inset-0 w-full h-full opacity-[0.19] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ordersHexGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="50%" stop-color="#eab308" />
              <stop offset="100%" stop-color="#f97316" />
            </linearGradient>
            <pattern id="ordersIsoHexPattern" width="56" height="96" patternUnits="userSpaceOnUse">
              <path
                d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 0 L28 32 M0 48 L28 32 L56 48 M28 64 L28 96 M0 48 L28 64 L56 48 M0 80 L28 64 L56 80"
                fill="none"
                stroke="url(#ordersHexGrad)"
                stroke-width="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ordersIsoHexPattern)" />
        </svg>

        <div class="relative z-10 max-w-xl">
          <div class="flex flex-wrap items-center gap-2 mb-2.5">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
              <VIcon name="utensils" size="xs" />
              <span>Order Your Food</span>
            </span>
          </div>
          <h1 class="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            RenGala Meal Menu
          </h1>
          <p class="text-xs sm:text-sm mt-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
            Confirm your Name, Table, and Seat number below, choose Nigerian or Continental cuisine, and switch between Grid, Form List, or Grouped views. Items unavailable automatically mark <strong>SOLD OUT</strong>.
          </p>
        </div>

        <div v-if="lastGuestOrder" class="relative z-10 shrink-0">
          <button
            @click="showTicketModal = true"
            type="button"
            class="w-full md:w-auto px-4 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2"
          >
            <VIcon name="ticket" size="sm" />
            <span>My Meal Ticket ({{ lastGuestOrder.id }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ORDER FORM (hidden once this device/seat has ordered) -->
    <template v-if="!lastGuestOrder">
    <!-- Dev Override Active Banner -->
    <div
      v-if="devOverrideActive"
      class="mb-4 p-3 rounded-2xl border-2 border-dashed border-yellow-500 bg-yellow-400/15 text-yellow-900 dark:text-yellow-200 text-xs font-bold flex items-center gap-2"
    >
      <VIcon name="alert" size="sm" />
      <span>DEV OVERRIDE ACTIVE — the one-order-per-seat rule is bypassed for your next order.</span>
    </div>

    <!-- Section 1: Name, Table Number & Seat Number -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md mb-6 transition-colors">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">1</span>
          <h2 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Your Table &amp; Seat Details</h2>
        </div>
        <span class="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
          <VIcon name="chair" size="xs" />
          <span>Served at your seat</span>
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            1. Full Name <span class="text-red-600">*</span>
          </label>
          <input
            v-model="orderForm.guest"
            type="text"
            placeholder="Enter your full name"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            2. Table Number <span class="text-red-600">*</span>
          </label>
          <select
            v-model="orderForm.table"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option v-for="t in 200" :key="t" :value="`Table ${t}`">
              Table {{ t }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            3. Seat Number <span class="text-red-600">*</span>
          </label>
          <select
            v-model="orderForm.seat"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option v-for="s in 10" :key="s" :value="`Seat ${s}`">
              Seat {{ s }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Section 2: Meal Category, View Switcher, Sub-Categories & Dishes -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md mb-6 transition-colors">
      <!-- Top Controls: Step Title, Search & View Mode Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">2</span>
          <h2 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            4. Select Your Meal Category <span class="text-red-600">*</span>
          </h2>
        </div>

        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <!-- Search Box -->
          <div class="relative flex-1 sm:w-52">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Jambalaya, Jollof..."
              class="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
            <VIcon name="search" size="xs" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <!-- 3-Way Menu View Switcher: Grid | Form List | Grouped -->
          <div class="inline-flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              v-for="mode in viewModes"
              :key="mode.id"
              type="button"
              @click="menuViewMode = mode.id"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
              :class="menuViewMode === mode.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
              :title="mode.label"
            >
              <VIcon :name="mode.icon" size="xs" />
              <span class="hidden sm:inline">{{ mode.short }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Category Toggle Buttons (Nigerian vs Continental) -->
      <div class="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <button
          type="button"
          @click="selectCategory('nigerian')"
          class="p-2.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-1.5 sm:gap-2 min-w-0"
          :class="selectedCategory === 'nigerian'
            ? 'border-emerald-600 bg-emerald-500/10 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-600 text-white shrink-0">
              <VIcon name="utensils" size="sm" />
            </div>
            <div class="min-w-0">
              <div class="font-black text-[11px] leading-tight sm:text-sm text-slate-900 dark:text-white">Nigerian Dishes</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Jollof, Ofada, Afang, Egusi, Amala</div>
            </div>
          </div>
          <span class="shrink-0 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            {{ nigerianDishesCount }}
          </span>
        </button>

        <button
          type="button"
          @click="selectCategory('continental')"
          class="p-2.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-1.5 sm:gap-2 min-w-0"
          :class="selectedCategory === 'continental'
            ? 'border-orange-500 bg-orange-500/10 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div class="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-orange-500 text-white shrink-0">
              <VIcon name="star" size="sm" />
            </div>
            <div class="min-w-0">
              <div class="font-black text-[11px] leading-tight sm:text-sm text-slate-900 dark:text-white">Continental Dishes</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Oriental, Jambalaya, Prawns, Noodles</div>
            </div>
          </div>
          <span class="shrink-0 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-orange-500/20 text-orange-700 dark:text-orange-300">
            {{ continentalDishesCount }}
          </span>
        </button>
      </div>

      <!-- Categorized Sub-Filters (Rice, Swallows, Noodles, Proteins, Sauces + Quick Flavor Chips) -->
      <div class="mb-5 space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">Course:</span>
          <button
            type="button"
            @click="selectedSubCat = 'all'"
            class="px-2.5 py-1 rounded-full text-[11px] font-bold border transition"
            :class="selectedSubCat === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
              : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'"
          >
            All ({{ categoryDishes.length }})
          </button>
          <button
            v-for="sc in availableSubCatsForCategory"
            :key="sc.id"
            type="button"
            @click="selectedSubCat = sc.id"
            class="px-2.5 py-1 rounded-full text-[11px] font-bold border transition"
            :class="selectedSubCat === sc.id
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'"
          >
            {{ sc.shortLabel }} ({{ countSubCat(sc.id) }})
          </button>
        </div>

        <!-- Quick Flavor / Rice / Sauce Filter Chips -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">Focus:</span>
          <button
            v-for="tag in activeFlavorTags"
            :key="tag"
            type="button"
            @click="selectedFlavorTag = tag"
            class="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition border"
            :class="selectedFlavorTag === tag
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Prompt Label -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
          {{ selectedCategory === 'nigerian' ? '5. Select Your Nigerian Meal Preference' : '7. Select Your Continental Meal Preference' }}
          <span class="text-red-600">*</span>
        </span>
        <span class="text-[11px] text-slate-500 dark:text-slate-400">
          Showing {{ filteredDishes.length }} option{{ filteredDishes.length === 1 ? '' : 's' }}
        </span>
      </div>

      <!-- Empty Filter State -->
      <div
        v-if="filteredDishes.length === 0"
        class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2"
      >
        <p class="text-sm font-bold text-slate-700 dark:text-slate-300">No dishes matched this filter.</p>
        <button
          @click="resetMenuFilters"
          type="button"
          class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          Show All {{ selectedCategory === 'nigerian' ? 'Nigerian' : 'Continental' }} Dishes
        </button>
      </div>

      <!-- VIEW MODE 1: VISUAL GRID VIEW -->
      <TransitionGroup
        v-else-if="menuViewMode === 'grid'"
        name="slide-fade"
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
      >
        <div
          v-for="dish in filteredDishes"
          :key="dish.id"
          @click="handleDishClick(dish)"
          class="group relative rounded-2xl border-2 overflow-hidden transition-all duration-200 flex flex-col justify-between"
          :class="dishCardClasses(dish)"
        >
          <div>
            <div class="relative h-36 w-full overflow-hidden bg-slate-200 dark:bg-slate-900">
              <MenuVisual
                :src="dish.image"
                :alt="dish.name"
                :sub-cat="dish.subCat"
                :image-mode="dish.imageMode"
                hover-scale
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent pointer-events-none"></div>

              <!-- Top Right Plate Counter / Sold Out Badge -->
              <div class="absolute top-2.5 right-2.5">
                <span
                  v-if="isDishSoldOut(dish)"
                  class="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1"
                >
                  <VIcon name="ban" size="xs" />
                  <span>SOLD OUT</span>
                </span>
              </div>

              <div class="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2">
                <span class="text-[10px] font-semibold text-slate-200 truncate">
                  {{ dish.vendor }}
                </span>
                <span class="px-1.5 py-0.5 rounded bg-slate-950/65 text-[9px] font-bold uppercase text-yellow-300 shrink-0">
                  {{ SUBCAT_META[dish.subCat || 'other'].shortLabel }}
                </span>
              </div>
            </div>

            <div class="p-3.5">
              <div class="flex items-start justify-between gap-2">
                <h3
                  class="font-extrabold text-sm leading-snug"
                  :class="isDishSoldOut(dish) ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'"
                >
                  {{ dish.name }}
                </h3>
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                  :class="selectedDishId === dish.id && !isDishSoldOut(dish)
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-400 dark:border-slate-600'"
                >
                  <VIcon v-if="selectedDishId === dish.id && !isDishSoldOut(dish)" name="check" size="xs" />
                </div>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {{ dish.description }}
              </p>
            </div>
          </div>

          <div class="px-3.5 pb-3">
            <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                :class="isDishSoldOut(dish) ? 'bg-red-600 w-0' : dish.stock <= dish.threshold ? 'bg-orange-500' : 'bg-emerald-600'"
                :style="{ width: `${Math.min(100, Math.round((dish.stock / Math.max(1, dish.initialStock)) * 100))}%` }"
              ></div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- VIEW MODE 2: CLASSIC FORM RADIO LIST VIEW (App-styled Microsoft Form layout) -->
      <div v-else-if="menuViewMode === 'list'" class="space-y-2">
        <div
          v-for="dish in filteredDishes"
          :key="dish.id"
          @click="handleDishClick(dish)"
          class="rounded-2xl border-2 p-2.5 sm:p-3 transition-all flex items-center justify-between gap-3"
          :class="dishCardClasses(dish)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- Radio Circle -->
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="selectedDishId === dish.id && !isDishSoldOut(dish)
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-400 dark:border-slate-600'"
            >
              <div v-if="selectedDishId === dish.id && !isDishSoldOut(dish)" class="w-2 h-2 rounded-full bg-white"></div>
            </div>

            <!-- Small Dish Photo / Placeholder Thumbnail -->
            <div class="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
              <MenuVisual
                :src="dish.image"
                :alt="dish.name"
                :sub-cat="dish.subCat"
                :image-mode="dish.imageMode"
                compact
              />
            </div>

            <!-- Dish Title & Details -->
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  class="font-bold text-xs sm:text-sm"
                  :class="isDishSoldOut(dish) ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'"
                >
                  {{ dish.name }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {{ dish.vendor }} • {{ SUBCAT_META[dish.subCat || 'other'].shortLabel }}
              </div>
            </div>
          </div>

          <!-- Right Plate Stock Status -->
          <div class="shrink-0 text-right">
            <span
              v-if="isDishSoldOut(dish)"
              class="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[10px] uppercase"
            >
              SOLD OUT
            </span>
          </div>
        </div>
      </div>

      <!-- VIEW MODE 3: GROUPED COURSE SHOWCASE VIEW (Rice / Soups & Swallows / Noodles / Proteins / Sauces) -->
      <div v-else class="space-y-6">
        <div
          v-for="group in groupedDishes"
          :key="group.subCat.id"
          class="space-y-2.5"
        >
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-black border"
                :class="group.subCat.badgeClass"
              >
                {{ group.subCat.label }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ group.items.length }} options</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="dish in group.items"
              :key="dish.id"
              @click="handleDishClick(dish)"
              class="rounded-2xl border-2 p-3 transition-all flex items-center gap-3"
              :class="dishCardClasses(dish)"
            >
              <div class="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                <MenuVisual
                  :src="dish.image"
                  :alt="dish.name"
                  :sub-cat="dish.subCat"
                  :image-mode="dish.imageMode"
                  compact
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <h4
                    class="font-extrabold text-xs sm:text-sm leading-snug"
                    :class="isDishSoldOut(dish) ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'"
                  >
                    {{ dish.name }}
                  </h4>
                  <div
                    class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                    :class="selectedDishId === dish.id && !isDishSoldOut(dish)
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-400 dark:border-slate-600'"
                  >
                    <VIcon v-if="selectedDishId === dish.id && !isDishSoldOut(dish)" name="check" size="xs" />
                  </div>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{{ dish.description }}</p>
                <div class="flex items-center justify-between mt-1.5">
                  <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{{ dish.vendor }}</span>
                  <span
                    v-if="isDishSoldOut(dish)"
                    class="text-[10px] font-extrabold font-mono text-red-600"
                  >
                    SOLD OUT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Sides & Proteins -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Preferred Sides -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md transition-colors">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">6. Preferred Sides <span class="text-red-600">*</span></h3>
          </div>
          <span class="text-[11px] font-bold text-orange-600 dark:text-orange-400">{{ selectedSides.length }} / 2 selected</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3.5">Please select at most 2 options.</p>

        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-for="side in sidesList"
            :key="side"
            type="button"
            @click="toggleSide(side)"
            class="p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between"
            :class="selectedSides.includes(side)
              ? 'border-emerald-600 bg-emerald-500/10 text-slate-900 dark:text-white'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'"
          >
            <div class="flex items-center gap-2">
              <VIcon :name="side === 'None' ? 'ban' : 'utensils'" size="xs" :class="selectedSides.includes(side) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'" />
              <span class="text-xs font-bold">{{ side }}</span>
            </div>
            <span
              v-if="selectedSides.includes(side)"
              class="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center"
            >
              <VIcon name="check" size="xs" />
            </span>
          </button>
        </div>
      </div>

      <!-- Protein Selection -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md transition-colors">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">4</span>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">8. Select Protein <span class="text-red-600">*</span></h3>
          </div>
          <span class="text-[11px] font-bold text-orange-600 dark:text-orange-400">{{ selectedProteins.length }} / 2 selected</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3.5">Select at most 2 options (None serves no protein).</p>

        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-for="prot in proteinsList"
            :key="prot"
            type="button"
            @click="toggleProtein(prot)"
            class="p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between"
            :class="selectedProteins.includes(prot)
              ? 'border-orange-500 bg-orange-500/10 text-slate-900 dark:text-white'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'"
          >
            <div class="flex items-center gap-2">
              <VIcon :name="prot === 'None' ? 'ban' : 'flame'" size="xs" :class="selectedProteins.includes(prot) ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'" />
              <span class="text-xs font-bold">{{ prot }}</span>
            </div>
            <span
              v-if="selectedProteins.includes(prot)"
              class="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center"
            >
              <VIcon name="check" size="xs" />
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sticky Order Summary & Submit Bar -->
    <div class="sticky bottom-16 md:bottom-4 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-600/60 rounded-3xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 rounded bg-yellow-400/25 text-yellow-800 dark:text-yellow-300 font-extrabold">
            {{ orderForm.table }} • {{ orderForm.seat }}
          </span>
          <span class="text-slate-700 dark:text-slate-300 font-semibold truncate">{{ orderForm.guest || 'Guest' }}</span>
        </div>
        <div class="text-sm font-black text-slate-900 dark:text-white">
          {{ activeDishObject ? activeDishObject.name : 'Select an available dish above' }}
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400">
          Sides: <strong class="text-slate-800 dark:text-slate-200">{{ selectedSides.join(', ') }}</strong> •
          Proteins: <strong class="text-slate-800 dark:text-slate-200">{{ selectedProteins.join(', ') }}</strong>
        </div>
        <div v-if="errorBanner" class="text-xs font-bold text-red-600 dark:text-red-400 pt-1 flex items-center gap-1">
          <VIcon name="alert" size="xs" />
          <span>{{ errorBanner }}</span>
        </div>
      </div>

      <button
        type="button"
        :disabled="isSubmitting || !activeDishObject"
        @click="openConfirmation"
        class="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/20 transition flex items-center justify-center gap-2 shrink-0"
      >
        <span>Review &amp; Submit Order</span>
        <VIcon name="arrowRight" size="sm" />
      </button>
    </div>
    </template>

    <!-- =================================================================== -->
    <!-- THANK YOU SCREEN (shown after ordering; blocks re-ordering)         -->
    <!-- =================================================================== -->
    <div
      v-else
      class="bg-white dark:bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-xl overflow-hidden transition-colors"
    >
      <div class="grid grid-cols-1 md:grid-cols-5">
        <!-- Placeholder / Brand Visual -->
        <div class="md:col-span-2 relative h-56 md:h-auto bg-slate-100 dark:bg-[#090d16] flex items-center justify-center">
          <img
            :src="isDark ? '/images/svg/placeholder-gala-dark.svg' : '/images/svg/placeholder-gala-light.svg'"
            alt="Thank you"
            class="w-full h-full object-contain p-4"
          />
          <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
            <VIcon name="checkCircle" size="xs" />
            <span>Order Received</span>
          </div>
        </div>

        <!-- Thank You Message + Summary -->
        <div class="md:col-span-3 p-6 sm:p-8 space-y-5">
          <div>
            <div class="flex items-center gap-1 mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span class="w-2 h-2 rounded-full bg-red-600"></span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Thank you, {{ lastGuestOrder.guest.split(' ')[0] }}!
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Your meal has been sent to the kitchen and will be served at
              <strong class="text-slate-900 dark:text-white">{{ lastGuestOrder.table }} • {{ lastGuestOrder.seat }}</strong>.
              Sit back and enjoy RenGala — End of Year Event.
            </p>
            <p
              v-if="alreadyOrderedNotice"
              class="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5"
            >
              <VIcon name="alert" size="xs" />
              <span>{{ alreadyOrderedNotice }}</span>
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-slate-500 dark:text-slate-400">Order No.</span>
              <strong class="font-mono text-orange-600 dark:text-orange-400">{{ lastGuestOrder.id }}</strong>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-slate-500 dark:text-slate-400">Meal</span>
              <strong class="text-right text-slate-900 dark:text-white">{{ lastGuestOrder.dish }}</strong>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-slate-500 dark:text-slate-400">Sides</span>
              <span class="text-right text-slate-800 dark:text-slate-200">{{ lastGuestOrder.sides.join(', ') }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-slate-500 dark:text-slate-400">Protein</span>
              <span class="text-right text-slate-800 dark:text-slate-200">{{ lastGuestOrder.proteins.join(', ') }}</span>
            </div>
            <div class="flex justify-between gap-3 items-center pt-1 border-t border-slate-200 dark:border-slate-800">
              <span class="text-slate-500 dark:text-slate-400">Status</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold uppercase text-[10px]">
                {{ liveTicketStatus }}
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2.5">
            <button
              @click="showTicketModal = true"
              type="button"
              class="flex-1 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              <VIcon name="ticket" size="sm" />
              <span>View My Meal Pass</span>
            </button>
          </div>

          <p class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <VIcon name="lock" size="xs" />
            <span>One meal per seat — ordering again is disabled for this seat.</span>
          </p>

          <!-- DEV MODE OVERRIDE -->
          <div
            v-if="allowOrderOverride"
            class="pt-4 border-t-2 border-dashed border-yellow-500/50"
          >
            <button
              @click="handleDevOverride"
              type="button"
              class="w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-yellow-500 bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-900 dark:text-yellow-200 font-black text-xs transition flex items-center justify-center gap-2"
            >
              <VIcon name="refresh" size="xs" />
              <span>Dev Override — Order Again</span>
            </button>
            <p class="text-[10px] text-slate-400 mt-1.5 text-center">
              Development only. Disable via <code class="font-mono">allowOrderOverride</code> in nuxt.config.ts before go-live.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- ORDER CONFIRMATION MODAL                                            -->
    <!-- =================================================================== -->
    <Transition name="pop-up">
      <div
        v-if="showConfirmModal && activeDishObject"
        class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="!isSubmitting && (showConfirmModal = false)"
      >
        <div class="w-full sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div class="relative h-36 w-full">
            <MenuVisual
              :src="activeDishObject.image"
              :alt="activeDishObject.name"
              :sub-cat="activeDishObject.subCat"
              :image-mode="activeDishObject.imageMode"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent pointer-events-none"></div>
            <div class="absolute bottom-3 left-4 right-4">
              <div class="text-[11px] font-extrabold uppercase tracking-wider text-yellow-300">Confirm Your Order</div>
              <div class="text-lg font-black text-white leading-tight">{{ activeDishObject.name }}</div>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div class="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs">
              <div class="flex justify-between gap-3">
                <span class="text-slate-500 dark:text-slate-400">Name</span>
                <strong class="text-slate-900 dark:text-white text-right">{{ orderForm.guest }}</strong>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-slate-500 dark:text-slate-400">Table &amp; Seat</span>
                <strong class="px-2 py-0.5 rounded bg-yellow-400/25 text-yellow-800 dark:text-yellow-300">{{ orderForm.table }} • {{ orderForm.seat }}</strong>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-slate-500 dark:text-slate-400">Category</span>
                <span class="text-slate-800 dark:text-slate-200">{{ activeDishObject.cat === 'nigerian' ? 'Nigerian Dishes' : 'Continental Dishes' }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-slate-500 dark:text-slate-400">Sides</span>
                <span class="text-slate-800 dark:text-slate-200 text-right">{{ selectedSides.join(', ') }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-slate-500 dark:text-slate-400">Protein</span>
                <span class="text-slate-800 dark:text-slate-200 text-right">{{ selectedProteins.join(', ') }}</span>
              </div>
            </div>

            <p class="text-[11px] text-orange-700 dark:text-orange-300 font-semibold flex items-start gap-1.5">
              <VIcon name="alert" size="xs" class="mt-0.5 shrink-0" />
              <span>Please check carefully — only one meal can be ordered per seat and it cannot be changed after confirming.</span>
            </p>

            <div v-if="errorBanner" class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <VIcon name="alert" size="xs" />
              <span>{{ errorBanner }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <button
                @click="showConfirmModal = false"
                :disabled="isSubmitting"
                type="button"
                class="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition"
              >
                Go Back &amp; Edit
              </button>
              <button
                @click="handleSubmitOrder"
                :disabled="isSubmitting"
                type="button"
                class="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
              >
                <template v-if="isSubmitting">Placing Order...</template>
                <template v-else>
                  <VIcon name="check" size="xs" />
                  <span>Confirm Order</span>
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Digital Guest Meal Ticket Modal -->
    <Transition name="pop-up">
      <div
        v-if="showTicketModal && lastGuestOrder"
        class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        @click.self="showTicketModal = false"
      >
        <div class="w-full max-w-sm bg-[#fffdf9] text-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-emerald-600">
          <div class="bg-slate-900 text-white p-4 text-center relative">
            <button
              @click="showTicketModal = false"
              type="button"
              class="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
            >
              <VIcon name="x" size="xs" />
            </button>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
              <VIcon name="check" size="xs" />
              <span>Order Sent to Kitchen</span>
            </span>
            <h3 class="text-lg font-black mt-1">Your Meal Order Pass</h3>
            <p class="text-[11px] text-slate-400">Show this QR pass to your waiter upon delivery</p>
          </div>

          <div class="p-5 font-mono text-xs space-y-3">
            <div class="bg-yellow-400/20 border-2 border-yellow-500 rounded-2xl p-3 text-center">
              <div class="text-[10px] font-bold text-orange-800 uppercase">Table &amp; Seat</div>
              <div class="text-xl font-black text-slate-950">
                {{ lastGuestOrder.table }} • {{ lastGuestOrder.seat }}
              </div>
              <div class="text-xs font-bold text-slate-700 mt-0.5">{{ lastGuestOrder.guest }}</div>
            </div>

            <div class="space-y-1.5 border-y border-dashed border-slate-300 py-3">
              <div class="flex justify-between">
                <span class="text-slate-500">ORDER NO:</span>
                <strong class="text-slate-900">{{ lastGuestOrder.id }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">MAIN DISH:</span>
                <strong class="text-slate-900 text-right">{{ lastGuestOrder.dish }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">SIDES:</span>
                <strong class="text-slate-800">{{ lastGuestOrder.sides.join(', ') }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">PROTEINS:</span>
                <strong class="text-slate-800">{{ lastGuestOrder.proteins.join(', ') }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">STATUS:</span>
                <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                  {{ liveTicketStatus }}
                </span>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center pt-1">
              <div class="p-3 bg-white border-2 border-slate-900 rounded-2xl">
                <QrCode :value="lastGuestOrder.qrToken || lastGuestOrder.id" :size="128" />
              </div>
              <div class="text-[11px] font-bold text-slate-600 mt-1.5">{{ lastGuestOrder.qrToken || lastGuestOrder.id }}</div>
            </div>

            <div class="pt-2">
              <button
                @click="showTicketModal = false"
                type="button"
                class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Duplicate Table & Seat Notification Modal -->
    <Transition name="pop-up">
      <div
        v-if="duplicateSeatModal"
        class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="duplicateSeatModal = null"
      >
        <div class="w-full max-w-md p-[2px] rounded-3xl bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 shadow-2xl">
          <div class="bg-white dark:bg-slate-900 rounded-[22px] p-6 text-center space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
              <VIcon name="alert" size="lg" />
            </div>

            <div class="space-y-1.5">
              <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Seat Order Limit Reached
              </h3>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-700 dark:text-orange-300 text-xs font-extrabold">
                <span>{{ duplicateSeatModal.table }} • {{ duplicateSeatModal.seat }}</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                The maximum limit of <strong>2 orders</strong> has already been placed for <strong>{{ duplicateSeatModal.table }}</strong> &amp; <strong>{{ duplicateSeatModal.seat }}</strong>.
                Kindly cross-check your Table Number and Seat Number and try again. Thank you, and enjoy the event!
              </p>
            </div>

            <button
              @click="duplicateSeatModal = null"
              type="button"
              class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-600/20"
            >
              Cross-Check Table &amp; Seat
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem, MenuSubCat } from '~/server/utils/db'
import { QUICK_FLAVOR_TAGS, SUBCAT_META, SUBCAT_OPTIONS } from '~/utils/menuCatalog'

definePageMeta({
  alias: ['/orders', '/menu']
})

const {
  eventState,
  isDark,
  userSession,
  activeGuestContext,
  lastGuestOrder,
  initGuestOrder,
  clearGuestOrderLock,
  submitFoodOrder,
  fetchState
} = useEventSuite()

const isStaffOrAdmin = computed(() => userSession.value.role === 'admin' || userSession.value.role === 'vendor')

const allowOrderOverride = Boolean(useRuntimeConfig().public.allowOrderOverride)
const showConfirmModal = ref(false)
const duplicateSeatModal = ref<{ table: string; seat: string } | null>(null)
const devOverrideActive = ref(false)
const alreadyOrderedNotice = ref('')

// Restore the "already ordered" lock after a page refresh and ensure menu state is fetched
onMounted(async () => {
  initGuestOrder()
  if (!eventState.value || !eventState.value.menuItems || eventState.value.menuItems.length === 0) {
    await fetchState()
  }
})

const orderForm = reactive({
  guest: activeGuestContext.value.name || '',
  table: activeGuestContext.value.table || 'Table 12',
  seat: activeGuestContext.value.seat || 'Seat 4'
})

const selectedCategory = ref<'nigerian' | 'continental'>('nigerian')
const selectedSubCat = ref<'all' | MenuSubCat>('all')
const selectedFlavorTag = ref<string>('All')
const menuViewMode = ref<'grid' | 'list' | 'grouped'>('list')
const selectedDishId = ref<string>('nig_1')
const searchQuery = ref('')
const selectedSides = ref<string[]>(['Moi Moi', 'Plantain'])
const selectedProteins = ref<string[]>(['Chicken', 'Fish'])
const isSubmitting = ref(false)
const errorBanner = ref('')
const showTicketModal = ref(false)

const viewModes = [
  { id: 'grid' as const, short: 'Grid', label: 'Visual Card Grid View', icon: 'grid' },
  { id: 'list' as const, short: 'Form List', label: 'Classic Form Checklist View', icon: 'list' },
  { id: 'grouped' as const, short: 'Grouped', label: 'Grouped by Rice, Swallows & Noodles', icon: 'layers' }
]

const sidesList = ['Moi Moi', 'Plantain', 'Salad', 'None']
const proteinsList = ['Chicken', 'Beef', 'Fish', 'None']

const isDishSoldOut = (dish: MenuItem) => dish.stock <= 0 || Boolean(dish.manualClosed)

const dishCardClasses = (dish: MenuItem) => {
  if (isDishSoldOut(dish)) {
    return 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 opacity-55 grayscale cursor-not-allowed select-none'
  }
  if (selectedDishId.value === dish.id) {
    return 'border-emerald-600 bg-emerald-500/5 dark:bg-slate-950 ring-2 ring-emerald-500/30 cursor-pointer shadow-md'
  }
  return 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
}

const categoryDishes = computed(() => {
  if (!eventState.value) return []
  return eventState.value.menuItems.filter(i => i.cat === selectedCategory.value)
})

const nigerianDishesCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.menuItems.filter(i => i.cat === 'nigerian').length
})

const continentalDishesCount = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.menuItems.filter(i => i.cat === 'continental').length
})

const availableSubCatsForCategory = computed(() => {
  const present = new Set(categoryDishes.value.map(i => i.subCat || 'other'))
  return SUBCAT_OPTIONS.filter(sc => present.has(sc.id))
})

const countSubCat = (subCat: MenuSubCat) => {
  return categoryDishes.value.filter(i => (i.subCat || 'other') === subCat).length
}

const activeFlavorTags = computed(() => QUICK_FLAVOR_TAGS[selectedCategory.value])

const filteredDishes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const tag = selectedFlavorTag.value
  return categoryDishes.value.filter((item) => {
    const matchesSub = selectedSubCat.value === 'all' || (item.subCat || 'other') === selectedSubCat.value
    const matchesTag =
      tag === 'All' ||
      item.name.toLowerCase().includes(tag.toLowerCase()) ||
      item.description.toLowerCase().includes(tag.toLowerCase())
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    return matchesSub && matchesTag && matchesSearch
  })
})

const groupedDishes = computed(() => {
  return SUBCAT_OPTIONS
    .map(sc => ({
      subCat: sc,
      items: filteredDishes.value.filter(d => (d.subCat || 'other') === sc.id)
    }))
    .filter(g => g.items.length > 0)
})

const activeDishObject = computed(() => {
  if (!eventState.value) return null
  const found = eventState.value.menuItems.find(i => i.id === selectedDishId.value)
  if (found && !isDishSoldOut(found)) return found
  return null
})

const liveTicketStatus = computed(() => {
  if (!lastGuestOrder.value || !eventState.value) return 'Queued in Kitchen'
  const live = eventState.value.orders.find(o => o.id === lastGuestOrder.value?.id)
  const st = live ? live.status : lastGuestOrder.value.status
  if (st === 'delivered') return 'Delivered to Seat'
  if (st === 'processed') return 'Printed & In Preparation'
  return 'Queued in Kitchen'
})

const selectCategory = (cat: 'nigerian' | 'continental') => {
  selectedCategory.value = cat
  selectedSubCat.value = 'all'
  selectedFlavorTag.value = 'All'
  if (eventState.value) {
    const firstAvail = eventState.value.menuItems.find(i => i.cat === cat && !isDishSoldOut(i))
    if (firstAvail) selectedDishId.value = firstAvail.id
  }
}

const resetMenuFilters = () => {
  selectedSubCat.value = 'all'
  selectedFlavorTag.value = 'All'
  searchQuery.value = ''
}

const handleDishClick = (dish: MenuItem) => {
  if (isDishSoldOut(dish)) return
  selectedDishId.value = dish.id
  errorBanner.value = ''
}

const toggleSide = (name: string) => {
  if (name === 'None') {
    selectedSides.value = ['None']
    return
  }
  const withoutNone = selectedSides.value.filter(s => s !== 'None')
  if (withoutNone.includes(name)) {
    const next = withoutNone.filter(s => s !== name)
    selectedSides.value = next.length ? next : ['None']
  } else if (withoutNone.length < 2) {
    selectedSides.value = [...withoutNone, name]
  }
}

const toggleProtein = (name: string) => {
  if (name === 'None') {
    selectedProteins.value = ['None']
    return
  }
  const withoutNone = selectedProteins.value.filter(p => p !== 'None')
  if (withoutNone.includes(name)) {
    const next = withoutNone.filter(p => p !== name)
    selectedProteins.value = next.length ? next : ['None']
  } else if (withoutNone.length < 2) {
    selectedProteins.value = [...withoutNone, name]
  }
}

const validateOrder = () => {
  errorBanner.value = ''
  if (!orderForm.guest.trim()) {
    errorBanner.value = 'Please enter your full name.'
    return false
  }
  if (!activeDishObject.value) {
    errorBanner.value = 'Please select an available dish that is not Sold Out.'
    return false
  }
  return true
}

// Step 1: Review -> opens the confirmation modal
const openConfirmation = () => {
  if (!validateOrder()) return
  showConfirmModal.value = true
}

// Step 2: Confirm -> submits to the kitchen, then shows the Thank You screen
const handleSubmitOrder = async () => {
  if (!validateOrder() || !activeDishObject.value) return

  isSubmitting.value = true
  const idempotencyKey = `${orderForm.table}-${orderForm.seat}-${activeDishObject.value.id}-${Math.floor(Date.now() / 5000)}`
  const res = await submitFoodOrder({
    guest: orderForm.guest,
    ticketId: activeGuestContext.value.ticketId || undefined,
    table: orderForm.table,
    seat: orderForm.seat,
    dishId: activeDishObject.value.id,
    sides: selectedSides.value,
    proteins: selectedProteins.value,
    idempotencyKey,
    devOverride: devOverrideActive.value
  })
  isSubmitting.value = false

  if (res.ok) {
    showConfirmModal.value = false
    devOverrideActive.value = false
    alreadyOrderedNotice.value = ''
    duplicateSeatModal.value = null
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  } else if ('alreadyOrdered' in res && res.alreadyOrdered) {
    // Strictly block duplicate Table & Seat orders and show the friendly modal
    showConfirmModal.value = false
    duplicateSeatModal.value = {
      table: orderForm.table,
      seat: orderForm.seat
    }
  } else {
    showConfirmModal.value = false
    errorBanner.value = res.error
  }
}

// DEV MODE ONLY: unlock the form and bypass the one-order-per-seat rule once
const handleDevOverride = () => {
  clearGuestOrderLock()
  devOverrideActive.value = true
  alreadyOrderedNotice.value = ''
  showTicketModal.value = false
  errorBanner.value = ''
}
</script>
