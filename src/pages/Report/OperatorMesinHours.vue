<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="schedule" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Laporan Operator & Mesin</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Operator & Mesin Hours</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Filter Section -->
      <q-card-section class="tw-bg-slate-50">
        <div class="tw-font-bold tw-text-lg tw-mb-4 tw-flex tw-items-center tw-gap-2">
          <q-icon name="filter_alt" size="24px" :color="`${domain()}`" />
          Filter
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              outlined
              v-model="filter.start"
              label="Tanggal Awal"
              type="date"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-input
              outlined
              v-model="filter.end"
              label="Tanggal Akhir"
              type="date"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.id_job"
              :options="jobTypeOptions"
              label="Job Type"
              emit-value
              map-options
              clearable
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="work" :color="`${domain()}`" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="tw-flex tw-gap-3 tw-mt-4">
          <q-btn
            unelevated
            :color="`${domain()}`"
            label="Cari"
            icon="search"
            :loading="loading"
            @click="searchData"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Charts Section -->
      <q-card-section class="tw-bg-white">

        <!-- Empty state -->
        <div
          v-if="!loading && mesinData.length === 0 && operatorData.length === 0"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400"
        >
          <q-icon name="bar_chart" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih filter dan klik Cari untuk menampilkan laporan</div>
        </div>

        <div v-else class="tw-flex tw-flex-col tw-gap-6">

          <!-- Machine Hours Chart -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-cyan-600 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="precision_manufacturing" size="20px" />
                Laporan Total Waktu Mesin
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
                <q-spinner-dots color="cyan" size="48px" />
              </div>
              <div v-else-if="mesinData.length === 0" class="tw-text-center tw-py-12 tw-text-slate-400">
                <q-icon name="info" size="32px" class="tw-mb-2" />
                <div>Tidak ada data mesin untuk filter ini</div>
              </div>
              <apexchart
                v-else
                type="bar"
                height="420"
                :options="mesinChartOptions"
                :series="mesinSeries"
              />
            </q-card-section>
          </q-card>

          <!-- Operator Hours Chart -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-emerald-600 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="engineering" size="20px" />
                Laporan Total Waktu Operator
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
                <q-spinner-dots color="green" size="48px" />
              </div>
              <div v-else-if="operatorData.length === 0" class="tw-text-center tw-py-12 tw-text-slate-400">
                <q-icon name="info" size="32px" class="tw-mb-2" />
                <div>Tidak ada data operator untuk filter ini</div>
              </div>
              <apexchart
                v-else
                type="bar"
                height="420"
                :options="operatorChartOptions"
                :series="operatorSeries"
              />
            </q-card-section>
          </q-card>

        </div>
      </q-card-section>

    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { domain } from "./../../utils";
import { useNotify } from "./../../composables/useNotify";
import dayjs from "dayjs";

const { error } = useNotify();

// ── Filter ────────────────────────────────────────────────────────────────────
// Match PHP behavior: default start = 2019-01-01, end = today (show all data on first load)
const filter = ref({
  start:  '2019-01-01',
  end:    dayjs().format('YYYY-MM-DD'),
  id_job: null,
});

// ── State ─────────────────────────────────────────────────────────────────────
const jobTypeOptions = ref([]);
const mesinData      = ref([]);
const operatorData   = ref([]);
const loading        = ref(false);

// ── Chart base options ────────────────────────────────────────────────────────
const baseChartOptions = (color, title) => ({
  chart: {
    toolbar: { show: false },
    animations: { enabled: true, speed: 600 },
    fontFamily: 'Calibri, sans-serif',
  },
  title: {
    text: title,
    align: 'center',
    style: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  },
  plotOptions: {
    bar: {
      borderRadius: 2,
      columnWidth: '70%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  colors: [color],
  xAxis: {
    type: 'category',
    labels: {
      rotate: -45,
      rotateAlways: true,
      style: { fontSize: '11px', colors: '#6b7280' },
      trim: false,
    },
    axisBorder: { show: true, color: '#d1d5db' },
    axisTicks: { show: true, color: '#d1d5db' },
    crosshairs: { show: true },
    tooltip: { enabled: false },
  },
  yAxis: {
    title: { text: 'Hours', style: { fontSize: '12px', fontWeight: 600, color: '#6b7280' } },
    labels: {
      formatter: (val) => {
        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
        return val.toFixed(0);
      },
    },
    min: 0,
  },
  tooltip: {
    y: { formatter: (val) => `${val.toFixed(1)} hours` },
    style: { fontSize: '12px' },
  },
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  fill: { type: 'solid', opacity: 1 },
});

// ── Computed chart options & series ───────────────────────────────────────────
// Use { x, y } format so labels are embedded in data — avoids ApexCharts
// reactivity issue where xaxis.categories updates after series renders
const mesinChartOptions = computed(() => baseChartOptions('#33bad0', 'Total Waktu Mesin'));

const mesinSeries = computed(() => [{
  name: 'Total Jam Mesin',
  data: mesinData.value.map(d => ({
    x: d.nama_mesin || '',
    y: parseFloat(d.total) || 0,
  })),
}]);

const operatorChartOptions = computed(() => baseChartOptions('#3eda7d', 'Total Waktu Operator'));

const operatorSeries = computed(() => [{
  name: 'Total Jam Operator',
  data: operatorData.value.map(d => ({
    x: d.id_pic || d.operator || '',
    y: parseFloat(d.total) || 0,
  })),
}]);

// ── API calls ─────────────────────────────────────────────────────────────────
const getJobTypes = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getJobTypeList`);
    jobTypeOptions.value = res.data.map(j => ({ value: j.value, label: j.label }));
  } catch (err) {
    error('Gagal memuat job type');
  }
};

const searchData = async () => {
  try {
    loading.value = true;
    mesinData.value    = [];
    operatorData.value = [];

    const params = {
      start:  filter.value.start  || '',
      end:    filter.value.end    || '',
      id_job: filter.value.id_job || '',
    };

    const [mesinRes, operatorRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}getMesinHours`,    { params }),
      axios.get(`${import.meta.env.VITE_API}getOperatorHours`, { params }),
    ]);

    mesinData.value    = mesinRes.data;
    operatorData.value = operatorRes.data;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await getJobTypes();
  await searchData();
});
</script>
