<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="verified" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Service Level Section</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>SLA Section</span>
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
            <q-input outlined v-model="filter.start" label="Tanggal Awal" type="date">
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-input outlined v-model="filter.end" label="Tanggal Akhir" type="date">
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`" />
              </template>
            </q-input>
          </div>
        </div>
        <div class="tw-mt-4">
          <q-btn
            unelevated
            :color="`${domain()}`"
            label="Cari"
            icon="search"
            :loading="loadingChart"
            @click="searchData"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Chart -->
      <q-card-section class="tw-bg-white">

        <div v-if="!loadingChart && chartData.length === 0"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400">
          <q-icon name="bar_chart" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih filter dan klik Cari</div>
        </div>

        <div v-else>
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden tw-mb-6">
            <q-card-section class="tw-bg-cyan-600 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="verified" size="20px" />
                Laporan Service Level Section
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <div v-if="loadingChart" class="tw-flex tw-justify-center tw-py-16">
                <q-spinner-dots color="cyan" size="48px" />
              </div>
              <apexchart
                v-else
                type="bar"
                height="320"
                :options="chartOptions"
                :series="chartSeries"
              />
              <div class="tw-text-xs tw-text-slate-400 tw-text-center tw-mt-1">
                Klik pada bar untuk melihat detail SPK per section
              </div>
            </q-card-section>
          </q-card>

          <!-- Detail Table (shown after clicking a bar) -->
          <q-card v-if="selectedCategory" flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section :class="`side-${domain()}-1 tw-py-3 tw-px-5`">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                  <q-icon name="table_chart" size="20px" />
                  Service Level SPK General — {{ selectedCategoryLabel }}
                </div>
                <q-btn flat round dense icon="close" color="white" @click="selectedCategory = null" />
              </div>
            </q-card-section>

            <q-card-section class="tw-p-0">
              <div v-if="loadingDetail" class="tw-flex tw-justify-center tw-py-10">
                <q-spinner-dots :color="`${domain()}`" size="40px" />
              </div>
              <q-table
                v-else
                :rows="detailData"
                :columns="detailColumns"
                row-key="id_spk"
                flat
                :rows-per-page-options="[10, 25, 50]"
                class="tw-text-xs sla-detail-table"
              >
                <!-- Custom grouped header -->
                <template v-slot:header="props">
                  <!-- Row 1: group headers -->
                  <q-tr>
                    <q-th
                      rowspan="2"
                      :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3 tw-border-r tw-border-white text-center`"
                    >
                      No SPK
                    </q-th>
                    <q-th
                      colspan="2"
                      class="bg-blue-7 tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3 tw-border-r tw-border-white text-center"
                    >
                      Plan
                    </q-th>
                    <q-th
                      colspan="2"
                      class="bg-teal-7 tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3 tw-border-r tw-border-white text-center"
                    >
                      Aktual
                    </q-th>
                    <q-th
                      rowspan="2"
                      class="bg-orange-7 tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3 tw-border-r tw-border-white text-center"
                    >
                      Status
                    </q-th>
                    <q-th
                      rowspan="2"
                      class="bg-purple-7 tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3 text-center"
                    >
                      Persentase
                    </q-th>
                  </q-tr>
                  <!-- Row 2: sub-headers -->
                  <q-tr>
                    <q-th class="bg-blue-6 tw-text-white tw-font-bold tw-text-xs tw-py-2 tw-border-r tw-border-white text-center">Start</q-th>
                    <q-th class="bg-blue-6 tw-text-white tw-font-bold tw-text-xs tw-py-2 tw-border-r tw-border-white text-center">Finish</q-th>
                    <q-th class="bg-teal-6 tw-text-white tw-font-bold tw-text-xs tw-py-2 tw-border-r tw-border-white text-center">Start</q-th>
                    <q-th class="bg-teal-6 tw-text-white tw-font-bold tw-text-xs tw-py-2 tw-border-r tw-border-white text-center">Finish</q-th>
                  </q-tr>
                </template>

                <!-- Body rows — only render the 6 data columns (no No column) -->
                <template v-slot:body="props">
                  <q-tr :props="props" class="tw-text-xs">
                    <q-td class="text-center tw-py-2">{{ props.row.id_spk }}</q-td>
                    <q-td class="text-center tw-py-2">{{ props.row.plan_start }}</q-td>
                    <q-td class="text-center tw-py-2">{{ props.row.plan_finish }}</q-td>
                    <q-td class="text-center tw-py-2">{{ props.row.start_aktual }}</q-td>
                    <q-td class="text-center tw-py-2">{{ props.row.finish_aktual }}</q-td>
                    <q-td class="text-center tw-py-2">
                      <q-badge
                        :color="props.row.status === 'OK' ? 'positive' : 'negative'"
                        :label="props.row.status"
                        class="tw-px-2 tw-py-1 tw-rounded-full tw-font-semibold"
                      />
                    </q-td>
                    <q-td class="text-right tw-py-2 tw-font-semibold">
                      {{ props.row.persentase }}%
                    </q-td>
                  </q-tr>
                </template>

                <!-- Summary footer -->
                <template v-slot:bottom-row>
                  <q-tr class="tw-bg-slate-100 tw-font-bold">
                    <q-td colspan="6" class="tw-text-right tw-font-bold tw-text-slate-700">
                      Rata-rata SLA
                    </q-td>
                    <q-td class="tw-text-right tw-font-bold tw-text-cyan-700">
                      {{ detailSummary.avgPersentase }}%
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { domain } from "./../../utils";
import { useNotify } from "./../../composables/useNotify";
import dayjs from "dayjs";

const { error } = useNotify();

// ── Filter ────────────────────────────────────────────────────────────────────
const filter = ref({
  start: '2019-01-01',
  end:   dayjs().format('YYYY-MM-DD'),
});

// ── State ─────────────────────────────────────────────────────────────────────
const chartData        = ref([]);
const detailData       = ref([]);
const detailSummary    = ref({ total: 0, avgPersentase: 0 });
const selectedCategory = ref(null);
const loadingChart     = ref(false);
const loadingDetail    = ref(false);

// ── Category label map ────────────────────────────────────────────────────────
const categoryLabels = {
  bongkar_analisis: 'Bongkar Analisis',
  drawing:          'Drawing',
  order_part:       'Order Part',
  assy:             'Assy',
  trial:            'Trial',
  machining:        'Machining',
};

const selectedCategoryLabel = computed(() =>
  selectedCategory.value ? (categoryLabels[selectedCategory.value] || selectedCategory.value) : ''
);

// ── Detail table columns (used for pagination/sorting only, header+body are custom) ──
const detailColumns = [
  { name: 'id_spk',        label: 'No SPK',        field: 'id_spk',        align: 'center', sortable: true },
  { name: 'plan_start',    label: 'Plan Start',    field: 'plan_start',    align: 'center' },
  { name: 'plan_finish',   label: 'Plan Finish',   field: 'plan_finish',   align: 'center' },
  { name: 'start_aktual',  label: 'Aktual Start',  field: 'start_aktual',  align: 'center' },
  { name: 'finish_aktual', label: 'Aktual Finish', field: 'finish_aktual', align: 'center' },
  { name: 'status',        label: 'Status',        field: 'status',        align: 'center', sortable: true },
  { name: 'persentase',    label: 'Persentase',    field: 'persentase',    align: 'right',  sortable: true },
];

// ── Chart options ─────────────────────────────────────────────────────────────
const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    animations: { enabled: true, speed: 500 },
    fontFamily: 'Calibri, sans-serif',
    events: {
      dataPointSelection: (event, chartCtx, config) => {
        const category = chartData.value[config.dataPointIndex]?.section;
        if (category) loadDetail(category);
      },
    },
  },
  title: {
    text: 'Service Level Section',
    align: 'center',
    style: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  },
  plotOptions: {
    bar: {
      borderRadius: 3,
      columnWidth: '55%',
      distributed: true, // each bar gets its own color
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`,
    style: { fontSize: '11px', fontWeight: '600', colors: ['#fff'] },
  },
  legend: { show: false },
  colors: ['#33bad0', '#3eda7d', '#7c3aed', '#f59e0b', '#06b6d4', '#ec4899'],
  xAxis: {
    type: 'category',
    labels: {
      style: { fontSize: '11px', colors: '#6b7280' },
    },
    axisBorder: { show: true, color: '#d1d5db' },
    axisTicks: { show: true },
  },
  yAxis: {
    title: { text: 'SLA (%)', style: { fontSize: '12px', fontWeight: 600, color: '#6b7280' } },
    min: 0,
    max: 100,
    labels: { formatter: (val) => `${val}%` },
  },
  tooltip: {
    y: { formatter: (val) => `${val.toFixed(2)}%` },
    style: { fontSize: '12px' },
  },
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 3,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  fill: { type: 'solid', opacity: 1 },
  states: {
    hover:  { filter: { type: 'lighten', value: 0.1 } },
    active: { filter: { type: 'darken',  value: 0.2 } },
  },
}));

const chartSeries = computed(() => [{
  name: 'SLA',
  data: chartData.value.map(d => ({
    x: d.section || '',
    y: parseFloat(d.sla) || 0,
  })),
}]);

// ── API ───────────────────────────────────────────────────────────────────────
const searchData = async () => {
  try {
    loadingChart.value  = true;
    selectedCategory.value = null;
    detailData.value    = [];

    const res = await axios.get(`${import.meta.env.VITE_API}getSlaSectionChart`, {
      params: { start: filter.value.start, end: filter.value.end },
    });

    chartData.value = res.data;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data chart');
  } finally {
    loadingChart.value = false;
  }
};

const loadDetail = async (category) => {
  try {
    selectedCategory.value = category;
    loadingDetail.value    = true;
    detailData.value       = [];

    const res = await axios.get(`${import.meta.env.VITE_API}getSlaSectionDetail`, {
      params: {
        category,
        start: filter.value.start,
        end:   filter.value.end,
      },
    });

    detailData.value    = res.data.data;
    detailSummary.value = { total: res.data.total, avgPersentase: res.data.avgPersentase };
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat detail');
  } finally {
    loadingDetail.value = false;
  }
};

// ── Init ──────────────────────────────────────────────────────────────────────
searchData();
</script>
