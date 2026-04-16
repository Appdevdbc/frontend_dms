<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="view_timeline" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Laporan Gantt Chart</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Gantt Chart</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Filter -->
      <q-card-section class="tw-bg-slate-50">
        <div class="tw-font-bold tw-text-lg tw-mb-4 tw-flex tw-items-center tw-gap-2">
          <q-icon name="filter_alt" size="24px" :color="`${domain()}`" />
          Filter
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.spk"
              :options="spkOptions"
              label="No SPK"
              emit-value
              map-options
              clearable
              use-input
              input-debounce="300"
              @filter="filterSpk"
            >
              <template v-slot:prepend>
                <q-icon name="tag" :color="`${domain()}`" />
              </template>
              <template v-slot:no-option>
                <q-item><q-item-section class="tw-text-slate-400">Tidak ada data</q-item-section></q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="tw-mt-4">
          <q-btn unelevated :color="`${domain()}`" label="Cari" icon="search"
            :loading="loading" @click="searchData"
            class="tw-font-semibold tw-px-6 tw-rounded-lg" />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Gantt Table -->
      <q-card-section class="tw-bg-white">

        <div v-if="!hasData && !loading"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400">
          <q-icon name="view_timeline" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih No SPK dan klik Cari</div>
        </div>

        <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
          <q-spinner-dots :color="`${domain()}`" size="48px" />
        </div>

        <div v-if="hasData && !loading" class="tw-overflow-x-auto">
          <div class="tw-mb-3 tw-flex tw-items-center tw-gap-4 tw-text-xs tw-font-semibold">
            <div class="tw-flex tw-items-center tw-gap-1">
              <div class="tw-w-4 tw-h-4 tw-rounded tw-bg-green-500"></div>
              <span>Plan</span>
            </div>
            <div class="tw-flex tw-items-center tw-gap-1">
              <div class="tw-w-4 tw-h-4 tw-rounded tw-bg-red-500"></div>
              <span>Aktual</span>
            </div>
          </div>

          <table class="gantt-table tw-border-collapse tw-text-xs tw-w-full">
            <thead>
              <!-- Row 1: No, Aktivitas, Start, Finish, Duration + Month headers -->
              <tr>
                <th rowspan="2" class="gantt-th tw-w-8">No</th>
                <th rowspan="2" class="gantt-th tw-min-w-32">Aktivitas</th>
                <th rowspan="2" class="gantt-th tw-min-w-24">Start</th>
                <th rowspan="2" class="gantt-th tw-min-w-24">Finish</th>
                <th rowspan="2" class="gantt-th tw-w-16">Durasi</th>
                <th
                  v-for="m in months"
                  :key="`${m.year}-${m.month}`"
                  :colspan="m.daysInMonth"
                  class="gantt-th tw-text-center"
                >
                  {{ m.label }}
                </th>
              </tr>
              <!-- Row 2: Day numbers -->
              <tr>
                <template v-for="m in months" :key="`days-${m.year}-${m.month}`">
                  <td v-for="d in m.daysInMonth" :key="d"
                    class="gantt-day-header tw-text-center">
                    {{ d }}
                  </td>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in ganttRows" :key="idx">
                <td class="gantt-td tw-text-center">{{ idx + 1 }}</td>
                <td class="gantt-td tw-font-semibold">{{ row.activity }}</td>
                <td class="gantt-td tw-text-center tw-whitespace-nowrap">{{ formatDate(row.start) }}</td>
                <td class="gantt-td tw-text-center tw-whitespace-nowrap">{{ formatDate(row.finish) }}</td>
                <td class="gantt-td tw-text-center">{{ row.ketJmlHari }}</td>
                <!-- Day cells -->
                <template v-for="m in months" :key="`row-${idx}-${m.year}-${m.month}`">
                  <td
                    v-for="d in m.daysInMonth"
                    :key="d"
                    :class="getCellClass(idx, m.year, m.month, d)"
                    class="gantt-cell"
                  ></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>

      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { domain } from "./../../utils";
import { useNotify } from "./../../composables/useNotify";
import dayjs from "dayjs";

const { error } = useNotify();

const filter      = ref({ spk: null });
const loading     = ref(false);
const ganttRows   = ref([]);
const months      = ref([]);
const spkOptions  = ref([]);
const allSpkOptions = ref([]);

const hasData = computed(() => ganttRows.value.length > 0);

const formatDate = (val) => {
  if (!val) return '';
  const d = dayjs(val);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : val;
};

// ── Load SPK dropdown ─────────────────────────────────────────────────────────
const loadSpkList = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getGanttSpkList`);
    allSpkOptions.value = res.data;
    spkOptions.value    = res.data;
  } catch (err) {
    error('Gagal memuat daftar SPK');
  }
};

const filterSpk = (val, update) => {
  update(() => {
    if (!val) {
      spkOptions.value = allSpkOptions.value;
    } else {
      const needle = val.toLowerCase();
      spkOptions.value = allSpkOptions.value.filter(o =>
        o.label.toLowerCase().includes(needle)
      );
    }
  });
};

// ── Precompute colored cell positions for each row ───────────────────────────
// PHP logic: iterate all days flat across months. When day == startDay of row,
// output ketJmlHari+1 colored cells consecutively from that position.
// We precompute a Set of "year-month-day" keys that should be colored per row.
const buildColoredCells = (row) => {
  if (!row.start) return new Set();

  // SQL Server returns datetime — parse and strip timezone to get local date
  const startDate = dayjs(row.start).startOf('day');
  if (!startDate.isValid()) return new Set();

  const duration = parseInt(row.ketJmlHari) || 0;
  const colored  = new Set();

  for (let k = 0; k <= duration; k++) {
    const d = startDate.add(k, 'day');
    colored.add(`${d.year()}-${d.month() + 1}-${d.date()}`);
  }

  return colored;
};

// Build colored cell map when ganttRows loads
const coloredCellMap = ref([]);

watch(ganttRows, (rows) => {
  coloredCellMap.value = rows.map(row => buildColoredCells(row));
});

const getCellClass = (rowIdx, year, month, day) => {
  const row     = ganttRows.value[rowIdx];
  const colored = coloredCellMap.value[rowIdx];
  if (!colored || !colored.has(`${year}-${month}-${day}`)) return '';
  if (row.type === 'P') return 'gantt-plan';
  if (row.type === 'A') return 'gantt-actual';
  return '';
};

// ── Search ────────────────────────────────────────────────────────────────────
const searchData = async () => {
  if (!filter.value.spk) return;

  try {
    loading.value   = true;
    ganttRows.value = [];
    months.value    = [];

    const res = await axios.get(`${import.meta.env.VITE_API}getGanttChart`, {
      params: { spk: filter.value.spk },
    });

    ganttRows.value = res.data.gantt;
    months.value    = res.data.months;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data gantt');
  } finally {
    loading.value = false;
  }
};

onMounted(loadSpkList);
</script>

<style scoped>
.gantt-table {
  border-collapse: collapse;
  font-size: 11px;
  white-space: nowrap;
}

.gantt-th {
  background-color: #1e40af;
  color: white;
  font-weight: 700;
  padding: 6px 8px;
  border: 1px solid #1e3a8a;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 2;
}

.gantt-day-header {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  padding: 3px 2px;
  border: 1px solid #2563eb;
  min-width: 20px;
  text-align: center;
}

.gantt-td {
  padding: 5px 8px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  vertical-align: middle;
}

tr:nth-child(even) .gantt-td {
  background-color: #f8fafc;
}

.gantt-cell {
  min-width: 20px;
  height: 24px;
  border: 1px solid #e5e7eb;
  padding: 0;
}

.gantt-plan {
  background-color: #22c55e !important;
}

.gantt-actual {
  background-color: #ef4444 !important;
}
</style>
