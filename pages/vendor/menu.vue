<template>
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Top Header -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm transition-colors">
      <div class="flex items-center gap-3.5">
        <div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shrink-0">
          <VIcon name="upload" size="lg" />
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Vendor Menu Studio &amp; Plate Inventory
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Upload dish photos, switch between Real Photo or Creative Placeholder, categorize Rice / Swallows / Noodles / Proteins / Sauces, and control plate stock
          </p>
        </div>
      </div>

      <NuxtLink
        to="/vendor"
        class="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm shrink-0"
      >
        <VIcon name="printer" size="xs" />
        <span>Back to Orders &amp; Receipt Station</span>
      </NuxtLink>
    </div>

    <!-- Upload New Dish & Picture Studio -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md transition-colors">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Upload New Dish, Photo &amp; Number of Plates
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Saved to SQLite &amp; synced immediately to Guest Ordering views. Choose whether guests see your uploaded picture or the Renaissance vector placeholder.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleAddDish" class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left Fields (8 cols) -->
        <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dish Name *</label>
            <input
              v-model="newDish.name"
              type="text"
              required
              placeholder="e.g. Jambalaya Rice + Garlic Butter Prawns"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Vendor / Caterer</label>
            <input
              v-model="newDish.vendor"
              type="text"
              placeholder="e.g. Lagos Royal Kitchens"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Main Menu Group *</label>
            <select
              v-model="newDish.cat"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            >
              <option value="nigerian">Nigerian Dishes</option>
              <option value="continental">Continental Dishes</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Food Sub-Category *</label>
            <select
              v-model="newDish.subCat"
              class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            >
              <option v-for="sc in SUBCAT_OPTIONS" :key="sc.id" :value="sc.id">
                {{ sc.label }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Plates *</label>
              <input
                v-model.number="newDish.stock"
                type="number"
                min="0"
                required
                class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Low Alert</label>
              <input
                v-model.number="newDish.threshold"
                type="number"
                min="1"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div class="sm:col-span-2 lg:col-span-3">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dish Description</label>
            <input
              v-model="newDish.description"
              type="text"
              placeholder="Short appetizing note for guests..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <!-- Picture Upload + Preset Picker + URL -->
          <div class="sm:col-span-2 lg:col-span-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <VIcon name="image" size="xs" class="text-orange-500" />
                <span>Dish Picture &amp; Display Choice</span>
              </span>

              <!-- Display Mode Choice: Real Photo vs Creative Placeholder -->
              <div class="inline-flex rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  @click="newDish.imageMode = 'photo'"
                  class="px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                  :class="newDish.imageMode === 'photo' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'"
                >
                  <VIcon name="image" size="xs" />
                  <span>Show Picture</span>
                </button>
                <button
                  type="button"
                  @click="newDish.imageMode = 'placeholder'"
                  class="px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                  :class="newDish.imageMode === 'placeholder' ? 'bg-orange-500 text-white shadow' : 'text-slate-600 dark:text-slate-400'"
                >
                  <VIcon name="sparkles" size="xs" />
                  <span>Use Placeholder</span>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Upload From Device (PNG / JPG / WEBP)</label>
                <label class="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer transition">
                  <VIcon name="upload" size="xs" />
                  <span>{{ isUploadingNew ? 'Uploading picture...' : 'Choose Image File' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onNewFileSelected"
                  />
                </label>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Or Select Curated Dish Photo</label>
                <select
                  v-model="newDish.image"
                  @change="newDish.imageMode = 'photo'"
                  class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option v-for="p in CURATED_PHOTO_PRESETS" :key="p.url" :value="p.url">
                    {{ p.label }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Image URL (uploaded path or external URL)</label>
              <input
                v-model="newDish.image"
                type="text"
                placeholder="/images/menu/jollof-rice.jpg or https://..."
                class="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div class="flex flex-wrap items-center gap-4 pt-1">
              <label class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input v-model="newDish.popular" type="checkbox" class="rounded text-emerald-600" />
                <span>Popular Tag</span>
              </label>
              <label class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input v-model="newDish.spicy" type="checkbox" class="rounded text-red-600" />
                <span>Spicy Tag</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Right Live Card Preview + Submit (4 cols) -->
        <div class="lg:col-span-4 flex flex-col justify-between gap-3">
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-inner">
            <div class="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Guest Card Live Preview</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 uppercase text-[10px]">
                {{ newDish.imageMode === 'photo' ? 'Picture' : 'Placeholder' }}
              </span>
            </div>
            <div class="h-36 w-full relative">
              <MenuVisual
                :src="newDish.image"
                :alt="newDish.name || 'Dish Preview'"
                :sub-cat="newDish.subCat"
                :image-mode="newDish.imageMode"
              />
              <span class="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-950/80 text-emerald-400 text-[11px] font-mono font-bold">
                {{ newDish.stock || 0 }} plates
              </span>
            </div>
            <div class="p-3">
              <div class="text-xs font-black text-slate-900 dark:text-white truncate">
                {{ newDish.name || 'New Dish Title' }}
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {{ newDish.vendor || 'Renaissance Caterer' }}
              </div>
            </div>
          </div>

          <div v-if="uploadError" class="text-xs font-bold text-red-600 dark:text-red-400">{{ uploadError }}</div>

          <button
            type="submit"
            :disabled="isUploadingNew"
            class="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <VIcon name="plus" size="sm" />
            <span>Save &amp; Publish Dish</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Live Plate Stock & Visual Mode Manager -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4 transition-colors">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Live Menu Items, Photos &amp; Plate Quotas ({{ filteredAdminItems.length }})
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Toggle any dish between Real Photo and Creative Placeholder, or click Edit Picture to upload a new photo
          </p>
        </div>

        <!-- Global Photo/Placeholder Controls -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="setAllImageMode('photo')"
            type="button"
            class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1"
          >
            <VIcon name="image" size="xs" />
            <span>All: Photos</span>
          </button>
          <button
            @click="setAllImageMode('placeholder')"
            type="button"
            class="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 font-bold text-xs transition flex items-center gap-1"
          >
            <VIcon name="sparkles" size="xs" />
            <span>All: Placeholders</span>
          </button>
        </div>
      </div>

      <!-- Filters Row: Main Category + SubCategory -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            v-for="f in ['all', 'nigerian', 'continental', 'soldout']"
            :key="f"
            @click="stockFilter = f as any"
            type="button"
            class="px-3 py-1.5 rounded-lg font-bold capitalize transition"
            :class="stockFilter === f ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            {{ f === 'soldout' ? 'Low / Sold Out' : f }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            @click="subCatFilter = 'all'"
            type="button"
            class="px-2.5 py-1 rounded-lg font-bold border transition"
            :class="subCatFilter === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'"
          >
            All Courses
          </button>
          <button
            v-for="sc in SUBCAT_OPTIONS"
            :key="sc.id"
            @click="subCatFilter = sc.id"
            type="button"
            class="px-2.5 py-1 rounded-lg font-bold border transition"
            :class="subCatFilter === sc.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'"
          >
            {{ sc.shortLabel }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div
          v-for="item in filteredAdminItems"
          :key="item.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border transition-all flex flex-col justify-between gap-3"
          :class="item.stock <= 0 || item.manualClosed
            ? 'border-red-500/50 bg-red-500/5'
            : item.stock <= item.threshold
              ? 'border-orange-500/50'
              : 'border-slate-200 dark:border-slate-800'"
        >
          <div class="flex items-start gap-3">
            <div class="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
              <MenuVisual
                :src="item.image"
                :alt="item.name"
                :sub-cat="item.subCat"
                :image-mode="item.imageMode"
                compact
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  class="text-[10px] uppercase font-black px-2 py-0.5 rounded"
                  :class="item.cat === 'nigerian' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-orange-500/15 text-orange-700 dark:text-orange-400'"
                >
                  {{ item.cat }}
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded border"
                  :class="SUBCAT_META[item.subCat || 'other'].badgeClass"
                >
                  {{ SUBCAT_META[item.subCat || 'other'].shortLabel }}
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded"
                  :class="item.imageMode === 'placeholder' ? 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
                >
                  {{ item.imageMode === 'placeholder' ? 'Placeholder Active' : 'Photo Active' }}
                </span>
              </div>

              <div class="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{{ item.name }}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ item.vendor }}</div>

              <div class="text-xs mt-1 font-semibold flex items-center gap-1" :class="item.stock <= 0 || item.manualClosed ? 'text-red-600 dark:text-red-400' : item.stock <= item.threshold ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'">
                <VIcon :name="item.stock <= 0 || item.manualClosed ? 'ban' : item.stock <= item.threshold ? 'alert' : 'checkCircle'" size="xs" />
                <template v-if="item.stock <= 0 || item.manualClosed">
                  <span>SOLD OUT — Greyed out on Guest Menu</span>
                </template>
                <template v-else-if="item.stock <= item.threshold">
                  <span>Low Stock: {{ item.stock }} / {{ item.initialStock }} plates</span>
                </template>
                <template v-else>
                  <span>Available: {{ item.stock }} / {{ item.initialStock }} plates</span>
                </template>
              </div>
            </div>
          </div>

          <!-- Actions Row: Picture Mode + Edit + Stock Buttons -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                @click="toggleDishImageMode(item.id)"
                type="button"
                class="px-2.5 py-1.5 rounded-xl border font-bold text-[11px] transition flex items-center gap-1"
                :class="item.imageMode === 'placeholder'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30 hover:bg-orange-500/20'"
              >
                <VIcon :name="item.imageMode === 'placeholder' ? 'image' : 'sparkles'" size="xs" />
                <span>{{ item.imageMode === 'placeholder' ? 'Switch to Photo' : 'Use Placeholder' }}</span>
              </button>

              <button
                @click="openEditModal(item)"
                type="button"
                class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-[11px] transition flex items-center gap-1"
              >
                <VIcon name="edit" size="xs" />
                <span>Upload / Edit Pic</span>
              </button>

              <button
                @click="deleteDish(item)"
                type="button"
                class="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 font-bold text-[11px] transition flex items-center gap-1"
                title="Delete this dish from the menu"
              >
                <VIcon name="trash" size="xs" />
                <span>Delete</span>
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-1.5">
              <button
                @click="adjustItemStock(item.id, 25)"
                type="button"
                class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 font-bold text-xs transition"
              >
                +25
              </button>
              <button
                @click="adjustItemStock(item.id, 50)"
                type="button"
                class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-orange-600 dark:text-orange-400 border border-slate-300 dark:border-slate-700 font-bold text-xs transition"
              >
                +50
              </button>
              <button
                v-if="item.stock > 0"
                @click="forceZeroStock(item.id)"
                type="button"
                class="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-300 border border-red-500/30 font-bold text-xs transition"
              >
                Sold Out (0)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dish / Picture Modal -->
    <Transition name="pop-up">
      <div
        v-if="editingDish"
        class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="editingDish = null"
      >
        <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <VIcon name="edit" size="sm" class="text-emerald-600" />
              <span>Edit Dish Picture &amp; Category</span>
            </h3>
            <button @click="editingDish = null" type="button" class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <VIcon name="x" size="sm" />
            </button>
          </div>

          <div class="h-40 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <MenuVisual
              :src="editingDish.image"
              :alt="editingDish.name"
              :sub-cat="editingDish.subCat"
              :image-mode="editingDish.imageMode"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dish Name</label>
              <input v-model="editingDish.name" type="text" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Category</label>
              <select v-model="editingDish.subCat" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
                <option v-for="sc in SUBCAT_OPTIONS" :key="sc.id" :value="sc.id">{{ sc.label }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Visual Display Mode</label>
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  @click="editingDish.imageMode = 'photo'"
                  class="py-2 rounded-xl text-xs font-bold border transition"
                  :class="editingDish.imageMode === 'photo' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'"
                >
                  Picture
                </button>
                <button
                  type="button"
                  @click="editingDish.imageMode = 'placeholder'"
                  class="py-2 rounded-xl text-xs font-bold border transition"
                  :class="editingDish.imageMode === 'placeholder' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'"
                >
                  Placeholder
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Upload Replacement Picture</label>
              <label class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer">
                <VIcon name="upload" size="xs" />
                <span>{{ isUploadingEdit ? 'Uploading...' : 'Upload File' }}</span>
                <input type="file" accept="image/*" class="hidden" @change="onEditFileSelected" />
              </label>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Or Curated Photo Preset</label>
              <select
                v-model="editingDish.image"
                @change="editingDish.imageMode = 'photo'"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option v-for="p in CURATED_PHOTO_PRESETS" :key="p.url" :value="p.url">{{ p.label }}</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
              <input v-model="editingDish.image" type="text" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono" />
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 pt-2">
            <button
              @click="deleteDishFromModal"
              type="button"
              class="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-bold text-xs transition flex items-center gap-1.5"
            >
              <VIcon name="trash" size="xs" />
              <span>Delete Dish</span>
            </button>

            <div class="flex items-center gap-2">
              <button @click="editingDish = null" type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                Cancel
              </button>
              <button @click="saveEditedDish" type="button" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ImageDisplayMode, MenuItem, MenuSubCat } from '~/server/utils/db'
import { CURATED_PHOTO_PRESETS, SUBCAT_META, SUBCAT_OPTIONS } from '~/utils/menuCatalog'

const router = useRouter()
const { eventState, userSession, updateMenuOrStock, uploadDishImage } = useEventSuite()

onMounted(() => {
  if (userSession.value.role === 'guest') {
    router.replace('/menu')
  }
})

const stockFilter = ref<'all' | 'nigerian' | 'continental' | 'soldout'>('all')
const subCatFilter = ref<'all' | MenuSubCat>('all')
const isUploadingNew = ref(false)
const isUploadingEdit = ref(false)
const uploadError = ref('')

const newDish = reactive({
  name: '',
  cat: 'nigerian' as 'nigerian' | 'continental',
  subCat: 'rice' as MenuSubCat,
  vendor: 'Lagos Royal Kitchens',
  description: '',
  image: '/images/menu/jollof-rice.jpg',
  imageMode: 'photo' as ImageDisplayMode,
  stock: 120,
  threshold: 10,
  popular: false,
  spicy: false
})

const editingDish = ref<{
  id: string
  name: string
  subCat: MenuSubCat
  image: string
  imageMode: ImageDisplayMode
} | null>(null)

const filteredAdminItems = computed(() => {
  if (!eventState.value) return []
  return eventState.value.menuItems.filter((item) => {
    const matchMain =
      stockFilter.value === 'nigerian' ? item.cat === 'nigerian'
      : stockFilter.value === 'continental' ? item.cat === 'continental'
      : stockFilter.value === 'soldout' ? (item.stock <= item.threshold || item.manualClosed)
      : true
    const matchSub = subCatFilter.value === 'all' || item.subCat === subCatFilter.value
    return matchMain && matchSub
  })
})

const onNewFileSelected = async (evt: Event) => {
  const input = evt.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadError.value = ''
  isUploadingNew.value = true
  try {
    const url = await uploadDishImage(file)
    newDish.image = url
    newDish.imageMode = 'photo'
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || err?.message || 'Image upload failed'
  } finally {
    isUploadingNew.value = false
    input.value = ''
  }
}

const onEditFileSelected = async (evt: Event) => {
  const input = evt.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !editingDish.value) return
  isUploadingEdit.value = true
  try {
    const url = await uploadDishImage(file)
    editingDish.value.image = url
    editingDish.value.imageMode = 'photo'
  } finally {
    isUploadingEdit.value = false
    input.value = ''
  }
}

const handleAddDish = async () => {
  if (!newDish.name.trim()) return
  await updateMenuOrStock({
    action: 'add_dish',
    name: newDish.name,
    cat: newDish.cat,
    subCat: newDish.subCat,
    vendor: newDish.vendor,
    description: newDish.description,
    image: newDish.image,
    imageMode: newDish.imageMode,
    stock: newDish.stock,
    threshold: newDish.threshold,
    popular: newDish.popular,
    spicy: newDish.spicy
  })
  newDish.name = ''
  newDish.description = ''
}

const toggleDishImageMode = async (itemId: string) => {
  await updateMenuOrStock({
    action: 'toggle_image_mode',
    itemId
  })
}

const setAllImageMode = async (imageMode: ImageDisplayMode) => {
  await updateMenuOrStock({
    action: 'bulk_image_mode',
    imageMode
  })
}

const openEditModal = (item: MenuItem) => {
  editingDish.value = {
    id: item.id,
    name: item.name,
    subCat: item.subCat || 'other',
    image: item.image,
    imageMode: item.imageMode || 'photo'
  }
}

const saveEditedDish = async () => {
  if (!editingDish.value) return
  await updateMenuOrStock({
    action: 'update_dish',
    itemId: editingDish.value.id,
    name: editingDish.value.name,
    subCat: editingDish.value.subCat,
    image: editingDish.value.image,
    imageMode: editingDish.value.imageMode
  })
  editingDish.value = null
}

const adjustItemStock = async (itemId: string, delta: number) => {
  await updateMenuOrStock({
    action: 'update_stock',
    itemId,
    delta,
    manualClosed: false
  })
}

const forceZeroStock = async (itemId: string) => {
  await updateMenuOrStock({
    action: 'update_stock',
    itemId,
    exactStock: 0
  })
}

const deleteDish = async (item: MenuItem) => {
  const confirmed = window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)
  if (!confirmed) return
  await updateMenuOrStock({
    action: 'delete_dish',
    itemId: item.id
  })
}

const deleteDishFromModal = async () => {
  if (!editingDish.value) return
  const confirmed = window.confirm(`Are you sure you want to delete "${editingDish.value.name}" from the menu?`)
  if (!confirmed) return
  const id = editingDish.value.id
  editingDish.value = null
  await updateMenuOrStock({
    action: 'delete_dish',
    itemId: id
  })
}
</script>
