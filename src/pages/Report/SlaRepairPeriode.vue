<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="insights" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Service Level Dept Repair by Periode</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>SLA Repair Periode</span>
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
          <q-btn unelevated :color="`${domain()}`" label="Cari" icon="search"
            :loading="loading" @click="searchData"
            class="tw-font-semibold tw-px-6 tw-rounded-lg" />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Charts -->
      <q-card-section class="tw-bg-white tw-flex tw-flex-col tw-gap-6">

        <div v-if="!chartsReady && !loading"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400">
          <q-icon name="bar_chart" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih filter dan klik Cari</div>
        </div>

        <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
          <q-spinner-dots :color="`${domain()}`" size="48px" />
        </div>

        <template v-if="chartsReady && !loading">

          <!-- Chart 1: Weekly Achievement — Highcharts -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-cyan-700 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="show_chart" size="20px" />
                Weekly Achievement SPK Repair
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <highcharts :options="weeklyChartOptions" style="height: 400px;" />
            </q-card-section>
          </q-card>

          <!-- Chart 2: Total Penyelesaian — ApexCharts -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-emerald-700 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="stacked_bar_chart" size="20px" />
                Total Penyelesaian (SPK)
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <apexchart type="line" height="320"
                :options="penyelesaianOptions"
                :series="penyelesaianSeries" />
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

const JENIS = 'repair'; // only difference from SlaGeneralPeriode

const filter = ref({
  start: '2019-01-01',
  end:   dayjs().format('YYYY-MM-DD'),
});

const loading          = ref(false);
const chartsReady      = ref(false);
const weeklyChartOptions  = ref({});
const penyelesaianOptions = ref({});
const penyelesaianSeries  = ref([]);

// ── Build Chart 1: Weekly Achievement (Highcharts) ────────────────────────────
function buildWeeklyChart(data) {
  weeklyChartOptions.value = {
    credits: { enabled: false },
    exporting: { enabled: false },
    chart: { zoomType: 'xy' },
    title: { text: 'Weekly Achievement SPK Repair', style: { fontSize: '14px' } },
    xAxis: [{ categories: data.map(d => d.week_month), crosshair: true }],
    yAxis: [
      { title: { text: 'SPK' } },
      { title: { text: 'Service Level (%)' }, labels: { format: '{value} %' }, opposite: true },
    ],
    tooltip: { shared: true },
    legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    plotOptions: { column: { dataLabels: { enabled: false } } },
    series: [
      {
        name: 'Target SPK', type: 'column', color: '#33bad0',
        data: data.map(d => parseFloat(d.target) || 0),
        tooltip: { valueSuffix: '' },
      },
      {
        name: 'Actual SPK', type: 'column', color: '#3eda7d',
        data: data.map(d => parseFloat(d.actual) || 0),
        tooltip: { valueSuffix: '' },
      },
      {
        name: 'Target Service Level', type: 'spline', color: '#ec5252', yAxis: 1,
        data: data.map(d => parseFloat(d.target_sla) || 0),
        tooltip: { valueSuffix: '%' },
      },
      {
        name: 'Actual Service Level', type: 'spline', color: '#1e55e1', yAxis: 1,
        data: data.map(d => parseFloat(d.actual_sla) || 0),
        tooltip: { valueSuffix: '%' },
      },
    ],
  };
}

// ── Build Chart 2: Total Penyelesaian (ApexCharts) ────────────────────────────
function buildPenyelesaianChart(data) {
  penyelesaianOptions.value = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
      fontFamily: 'Calibri, sans-serif',
      stacked: true,
    },
    title: {
      text: 'Total Penyelesaian SPK',
      align: 'center',
      style: { fontSize: '13px', fontWeight: '600', color: '#374151' },
    },
    plotOptions: { bar: { columnWidth: '60%', borderRadius: 2 } },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0, 1],
      style: { fontSize: '10px', colors: ['#fff'] },
    },
    legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px' },
    colors: ['#ec5252', '#3eda7d', '#1e55e1'],
    stroke: { width: [0, 0, 2], curve: 'smooth' },
    xAxis: {
      categories: data.map(d => d.month || ''),
      labels: { style: { fontSize: '11px' } },
    },
    yAxis: [
      { title: { text: 'SPK', style: { fontSize: '11px', color: '#6b7280' } } },
      { show: false },
      { show: false },
    ],
    tooltip: { shared: true },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 3 },
  };

  penyelesaianSeries.value = [
    { name: 'Urgent',          type: 'bar',  data: data.map(d => parseFloat(d.spk_urgent) || 0) },
    { name: 'Normal',          type: 'bar',  data: data.map(d => parseFloat(d.spk_normal) || 0) },
    { name: 'Total SPK Selesai', type: 'line', data: data.map(d => parseFloat(d.spk_total) || 0) },
  ];
}

// ── API ───────────────────────────────────────────────────────────────────────
const searchData = async () => {
  try {
    loading.value     = true;
    chartsReady.value = false;

    const year = dayjs(filter.value.end || undefined).format('YYYY');

    const [periodeRes, penyelesaianRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}getSlaPeriode`, {
        params: { start: filter.value.start, end: filter.value.end, jenis: JENIS },
      }),
      axios.get(`${import.meta.env.VITE_API}getPenyelesaianSPK`, {
        params: { year, jenis: JENIS },
      }),
    ]);

    buildWeeklyChart(periodeRes.data);
    buildPenyelesaianChart(penyelesaianRes.data);
    chartsReady.value = true;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

searchData();
</script>
