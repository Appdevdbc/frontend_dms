<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="speed" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Laporan TJKN (Produktivitas Operator)</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>TJKN</span>
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
            <q-input outlined v-model="filter.start" label="Tahun & Bulan" type="date">
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`" />
              </template>
              <template v-slot:hint>
                <span class="tw-text-xs tw-text-slate-400">Data diambil berdasarkan Tahun dan Bulan</span>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.section"
              :options="sectionOptions"
              label="Section"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="category" :color="`${domain()}`" />
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

      <q-card-section class="tw-bg-white tw-flex tw-flex-col tw-gap-6">

        <div v-if="!chartsReady && !loading"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400">
          <q-icon name="speed" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih filter dan klik Cari</div>
        </div>

        <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
          <q-spinner-dots :color="`${domain()}`" size="48px" />
        </div>

        <template v-if="chartsReady && !loading">

          <!-- Main chart -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-emerald-600 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="bar_chart" size="20px" />
                Laporan Total Jam Kerja Normal
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <highcharts :options="chartOptions" style="height:400px;" />
            </q-card-section>
          </q-card>

          <!-- Detail table (shown after clicking a bar) -->
          <q-card v-if="selectedOperator" flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section :class="`side-${domain()}-1 tw-py-3 tw-px-5`">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                  <q-icon name="person" size="20px" />
                  Detail — {{ selectedOperator }}
                </div>
                <q-btn flat round dense icon="close" color="white" @click="clearDetail" />
              </div>
            </q-card-section>
            <q-card-section class="tw-p-0">
              <div v-if="loadingDetail" class="tw-flex tw-justify-center tw-py-8">
                <q-spinner-dots :color="`${domain()}`" size="36px" />
              </div>
              <template v-else>
                <q-table
                  :rows="detailRows"
                  :columns="detailColumns"
                  row-key="spk"
                  flat
                  :rows-per-page-options="[10, 25, 50]"
                  class="tw-text-xs"
                />
                <!-- Summary footer -->
                <div class="tw-bg-slate-50 tw-p-4 tw-border-t tw-text-xs tw-font-semibold tw-flex tw-flex-wrap tw-gap-6">
                  <span>Total Jam Kerja Normal: <span class="tw-text-cyan-700">{{ summary.normalHours }}</span></span>
                  <span>Total Jam Kerja Lembur: <span class="tw-text-orange-600">{{ summary.overtimeHours }}</span></span>
                  <span>Total Durasi: <span class="tw-text-slate-700">{{ summary.totalDurasi }}</span></span>
                  <span>TJKN: <span class="tw-text-slate-700">{{ summary.tjkn }}</span></span>
                  <span>Nilai Produktivitas: <span :class="summary.produktivitas >= 85 ? 'tw-text-green-600' : 'tw-text-red-600'">{{ summary.produktivitas }}%</span></span>
                </div>
              </template>
            </q-card-section>
          </q-card>

        </template>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { domain } from "./../../utils";
import { useNotify } from "./../../composables/useNotify";
import dayjs from "dayjs";

const { error } = useNotify();

// ── Filter ────────────────────────────────────────────────────────────────────
const filter = ref({
  start:   dayjs().format('YYYY-MM-DD'),
  section: 'all',
});

const sectionOptions = [
  { value: 'all',          label: 'All' },
  { value: 'Design',       label: 'Design' },
  { value: 'Machining',    label: 'Machining' },
  { value: 'New Mould',    label: 'New Mould' },
  { value: 'Repair Mould', label: 'Repair Mould' },
  { value: 'Workplan',     label: 'Workplan' },
];

// ── State ─────────────────────────────────────────────────────────────────────
const loading         = ref(false);
const loadingDetail   = ref(false);
const chartsReady     = ref(false);
const chartOptions    = ref({});
const chartData       = ref([]);
const selectedOperator = ref(null);
const detailRows      = ref([]);
const summary         = ref({});

// ── Detail table columns ──────────────────────────────────────────────────────
const detailColumns = [
  { name: 'spk',      label: 'No SPK',   field: 'spk',      align: 'center', sortable: true },
  { name: 'start',    label: 'Start',    field: r => r.start    ? dayjs(r.start).format('YYYY-MM-DD HH:mm')    : '-', align: 'center' },
  { name: 'finish',   label: 'Finish',   field: r => r.finish   ? dayjs(r.finish).format('YYYY-MM-DD HH:mm')   : '-', align: 'center' },
  { name: 'postpone', label: 'Postpone', field: r => r.postpone ? dayjs(r.postpone).format('YYYY-MM-DD HH:mm') : '-', align: 'center' },
  { name: 'totalJam', label: 'Durasi (jam)', field: 'totalJam', align: 'center' },
];

// ── Build chart ───────────────────────────────────────────────────────────────
function buildChart(data) {
  const categories = data.map(d => `${d.pic}-${d.id_pic}`);
  const values     = data.map(d => parseFloat(d.total) || 0);
  const target     = Array(data.length).fill(85);

  chartOptions.value = {
    credits:   { enabled: false },
    exporting: { enabled: false },
    chart: { type: 'column' },
    title: { text: 'Laporan Total Jam Kerja Normal', style: { fontSize: '14px' } },
    xAxis: { categories, crosshair: true },
    yAxis: { min: 0, title: { text: 'Nilai Produktivity %' } },
    legend: { enabled: true, layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:  '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: { pointPadding: 0.2, borderWidth: 0 },
    },
    series: [
      {
        name: 'Produktivitas',
        type: 'column',
        color: '#3eda7d',
        data: values,
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              const idx = this.index;
              const row = data[idx];
              if (row) loadDetail(`${row.pic}-${row.id_pic}`, row.id_pic);
            },
          },
        },
      },
      {
        name: 'Target (85%)',
        type: 'spline',
        color: 'red',
        data: target,
        marker: { enabled: false },
      },
    ],
  };
}

// ── Load detail ───────────────────────────────────────────────────────────────
async function loadDetail(label, nik) {
  try {
    selectedOperator.value = label;
    loadingDetail.value    = true;
    detailRows.value       = [];
    summary.value          = {};

    const res = await axios.get(`${import.meta.env.VITE_API}getTJKNDetail`, {
      params: { tanggal: filter.value.start, nik },
    });

    detailRows.value = res.data.detail;

    // Calculate summary from detail rows
    const rows = res.data.detail;
    const tjknSabMing = res.data.tjknSabMing || 0;

    let totalMinutes = 0;
    let tjknVal = 0;
    let tjknOver = 0;

    rows.forEach(row => {
      totalMinutes += parseFloat(row.totalJam) || 0;
      tjknVal = parseFloat(row.tjkn) || tjknVal;

      // Overtime: if finish > 17:00, add 3.5 to overtime TJKN
      if (row.finish) {
        const finishTime = dayjs(row.finish);
        const officeEnd  = dayjs(row.finish).hour(17).minute(0).second(0);
        if (finishTime.isAfter(officeEnd)) tjknOver += 3.5;
      }
    });

    const totalHours = (totalMinutes / 60).toFixed(2);
    const tjknTotal  = tjknVal + tjknOver + tjknSabMing;
    const produktivitas = tjknTotal > 0 ? ((totalMinutes / 60) / tjknTotal * 100).toFixed(2) : 0;

    summary.value = {
      normalHours:   `${Math.floor(totalMinutes / 60)} : ${Math.round(totalMinutes % 60)}`,
      overtimeHours: `${Math.floor(tjknOver)} : 0`,
      totalDurasi:   totalHours,
      tjkn:          tjknTotal,
      produktivitas,
    };
  } catch (err) {
    error('Gagal memuat detail operator');
  } finally {
    loadingDetail.value = false;
  }
}

function clearDetail() {
  selectedOperator.value = null;
  detailRows.value       = [];
  summary.value          = {};
}

// ── Search ────────────────────────────────────────────────────────────────────
const searchData = async () => {
  try {
    loading.value     = true;
    chartsReady.value = false;
    clearDetail();

    const res = await axios.get(`${import.meta.env.VITE_API}getTJKNReport`, {
      params: { start: filter.value.start, section: filter.value.section },
    });

    chartData.value = res.data;
    buildChart(res.data);
    chartsReady.value = true;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

searchData();
</script>
