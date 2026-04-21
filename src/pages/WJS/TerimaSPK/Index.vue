<template>
  <div class="q-pa-md">
    <q-card class="tw-rounded-2xl tw-shadow-2xl tw-border-2 tw-border-white/50 tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1`" class="tw-relative tw-overflow-hidden">
        <div class="tw-absolute tw-inset-0 tw-opacity-10">
          <div class="tw-absolute tw-top-0 tw-right-0 tw-w-32 tw-h-32 tw-bg-white tw-rounded-full tw-blur-3xl"></div>
          <div class="tw-absolute tw-bottom-0 tw-left-0 tw-w-24 tw-h-24 tw-bg-white tw-rounded-full tw-blur-2xl"></div>
        </div>
        <div class="tw-relative tw-z-10">
          <div class="tw-flex tw-items-center tw-gap-3 tw-mb-2">
            <div class="tw-bg-white/20 tw-p-2 tw-rounded-lg tw-backdrop-blur-sm">
              <q-icon name="assignment_turned_in" size="sm" class="tw-text-white" />
            </div>
            <div class="text-h6 tw-font-bold tw-text-white tw-drop-shadow-lg">Terima SPK</div>
          </div>
          <div class="tw-flex tw-items-center tw-gap-1 tw-text-white/90 tw-text-sm">
            <q-icon name="chevron_right" size="xs" />
            <router-link class="hover:tw-text-white hover:tw-font-semibold tw-transition-all tw-duration-300"
              :to="{ path: '/collection/terima-spk' }">Terima SPK</router-link>
          </div>
        </div>
      </q-card-section>

      <q-separator class="tw-opacity-20" />

      <q-card-section class="tw-bg-gradient-to-br tw-from-green-50 tw-via-gray-50 tw-to-green-100">
        <div class="tw-mt-2">
          <div class="tw-flex tw-justify-end tw-mb-6">
            <q-input v-model="cari" dense outlined @update:modelValue="filterMenu"
              label="Search" class="tw-w-64 search-input-modern">
              <template v-slot:prepend>
                <q-icon name="search" class="tw-text-gray-500" />
              </template>
            </q-input>
          </div>

          <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
            <q-spinner-dots :color="`${domain()}`" size="40px" />
          </div>

          <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-5 tw-gap-6 tw-p-2">
            <div
              v-for="(item, index) in listData" :key="item.id_group"
              class="tw-group tw-relative tw-flex tw-flex-col tw-items-center tw-space-y-3 tw-p-5 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-2xl tw-transition-all tw-duration-500 hover:tw--translate-y-3 tw-cursor-pointer card-hover no-ripple"
              :style="{ background: `linear-gradient(135deg, ${color(index)}30, ${color(index)}15)`, border: `1px solid ${color(index)}50` }"
              @click.stop.prevent="goto(item.id_group)"
            >
              <div class="tw-absolute tw-inset-0 tw-rounded-2xl tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-duration-500"
                :style="{ background: `linear-gradient(135deg, ${color(index)}50, ${color(index)}25)` }"></div>

              <!-- SPK count badge -->
              <div v-if="item.count > 0"
                class="tw-absolute tw-top-2 tw-right-2 tw-z-20 tw-rounded-full tw-text-white tw-text-xs tw-font-bold tw-min-w-[1.5rem] tw-h-6 tw-px-2 tw-flex tw-items-center tw-justify-center tw-shadow-lg badge-pulse"
                :style="{ backgroundColor: color(index), boxShadow: `0 0 0 3px white, 0 0 0 5px ${color(index)}` }">
                {{ item.count }}
              </div>

              <div class="tw-relative tw-z-10">
                <div
                  class="icon-blob tw-relative tw-w-24 tw-h-24 tw-transform tw-transition-all tw-duration-500 tw-ease-out group-hover:tw-scale-125 group-hover:tw-rotate-12 tw-shadow-xl group-hover:tw-shadow-2xl tw-flex tw-items-center tw-justify-center tw-cursor-pointer"
                  :style="{ backgroundColor: hoveredIndex === index ? darkenHex(color(index), 15) : color(index) }"
                  @mouseover="hoveredIndex = index" @mouseleave="hoveredIndex = null"
                >
                  <div class="tw-absolute tw-inset-0 blob-shape tw-opacity-0 group-hover:tw-opacity-60 tw-transition-opacity tw-duration-300 tw-blur-xl"
                    :style="{ backgroundColor: color(index) }"></div>
                  <div class="tw-absolute tw-inset-0 blob-shape tw-overflow-hidden"><div class="shine-effect"></div></div>
                  <q-icon name="folder" size="lg"
                    class="tw-relative tw-z-10 tw-text-white tw-drop-shadow-2xl tw-transform tw-transition-transform tw-duration-300 group-hover:tw-scale-110 group-hover:tw-rotate-[-12deg]" />
                </div>
              </div>

              <div
                class="label-button tw-relative tw-z-10 tw-px-4 tw-py-2 tw-rounded-full tw-text-xs tw-font-bold tw-text-center tw-transition-all tw-duration-300 tw-leading-tight tw-tracking-tight tw-shadow-md group-hover:tw-shadow-xl tw-border-2 tw-w-full tw-min-h-[2.5rem] tw-flex tw-items-center tw-justify-center"
                :style="{
                  background: hoveredIndex === index ? `linear-gradient(135deg, ${color(index)}, ${color(index)}dd)` : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  color: hoveredIndex === index ? 'white' : '#374151',
                  borderColor: hoveredIndex === index ? color(index) : '#e2e8f0',
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)'
                }"
                @mouseover="hoveredIndex = index" @mouseleave="hoveredIndex = null"
              >{{ item.nama }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { domain, spinnerBall } from "../../../utils";
import { Loading } from "quasar";
import { useRouter } from "vue-router";

const router       = useRouter();
const cari         = ref(null);
const hoveredIndex = ref(null);
const loading      = ref(false);
const listData     = ref([]);
const listData1    = ref([]);

// Cycle through distinct colors per group
const COLORS = ['#3eda7d','#33bad0','#7c3aed','#f59e0b','#ec4899','#06b6d4','#10b981','#f97316','#8b5cf6','#14b8a6'];
const color = (index) => COLORS[index % COLORS.length];

const darkenHex = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - percent / 100)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - percent / 100)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - percent / 100)));
  return `rgb(${r},${g},${b})`;
};

const getGroups = async () => {
  try {
    loading.value = true;
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}getGroupMenuWithCount`);
    listData.value  = res.data;
    listData1.value = res.data;
    Loading.hide();
  } catch (error) {
    console.log(error);
    Loading.hide();
  } finally {
    loading.value = false;
  }
};

const goto = (id_group) => {
  // Navigate to TerimaSPK group list page
  router.push({ path: `/wjs/terima-spk/list/${id_group}` });
};

const filterMenu = (val) => {
  if (!val) { listData.value = listData1.value; return; }
  const needle = val.toLowerCase();
  listData.value = listData1.value.filter(o => o.nama.toLowerCase().includes(needle));
};

onMounted(() => getGroups());
</script>

<style scoped>
.search-input-modern :deep(.q-field__control) {
  border-radius: 12px;
  background: white;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}
.search-input-modern :deep(.q-field__control):hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.card-hover { backdrop-filter: blur(10px); overflow: hidden; }
.no-ripple { pointer-events: auto !important; }
.no-ripple * { pointer-events: none !important; }
.icon-blob, .blob-shape {
  border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
  animation: morph 8s ease-in-out infinite;
}
@keyframes morph {
  0%, 100% { border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%; }
  25%       { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  50%       { border-radius: 54% 46% 38% 62% / 49% 70% 30% 51%; }
  75%       { border-radius: 70% 30% 50% 50% / 30% 54% 46% 70%; }
}
.shine-effect {
  position: absolute; top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
  animation: shine 3s infinite;
}
@keyframes shine {
  0%   { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%)  translateY(100%)  rotate(45deg); }
}
.label-button { backdrop-filter: blur(10px); cursor: pointer; position: relative; overflow: hidden; }
.label-button::before {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s ease;
}
.card-hover:hover .label-button::before { left: 100%; }

.badge-pulse {
  animation: badge-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both,
             badge-ring 2s ease-in-out 0.5s infinite;
}

@keyframes badge-pop {
  0%   { transform: scale(0); opacity: 0; }
  80%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes badge-ring {
  0%, 100% { box-shadow: 0 0 0 3px white, 0 0 0 5px currentColor; }
  50%       { box-shadow: 0 0 0 3px white, 0 0 0 8px currentColor, 0 0 12px 6px currentColor; }
}
</style>
