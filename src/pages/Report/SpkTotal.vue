<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="bar_chart" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Laporan Total SPK</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Total SPK</span>
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
            <q-input outlined v-model="filter.year" label="Tahun" type="number"
              :min="2019" :max="2099">
              <template v-slot:prepend>
                <q-icon name="calendar_today" :color="`${domain()}`" />
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

      <q-card-section class="tw-bg-white tw-flex tw-flex-col tw-gap-6">

        <div v-if="!chartsReady && !loading"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400">
          <q-icon name="bar_chart" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih tahun dan klik Cari</div>
        </div>

        <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
          <q-spinner-dots :color="`${domain()}`" size="48px" />
        </div>

        <template v-if="chartsReady && !loading">

          <!-- Chart 1: YTD SPK per Dept -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-cyan-700 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="bar_chart" size="20px" />
                YTD SPK General {{ filter.year }}
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <highcharts :options="ytdChartOptions" style="height:320px;" />
            </q-card-section>
          </q-card>

          <!-- Chart 2: Level 1 — SPK per Bulan for selected dept -->
          <q-card v-if="showLevel1" flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-indigo-700 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                  <q-icon name="calendar_month" size="20px" />
                  Data Turunan Grafik Level 1 (Bulan) — {{ selectedDept }}
                </div>
                <q-btn flat round dense icon="close" color="white" @click="showLevel1 = false" />
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <div v-if="loadingLevel1" class="tw-flex tw-justify-center tw-py-10">
                <q-spinner-dots color="indigo" size="36px" />
              </div>
              <highcharts v-else :options="bulanChartOptions" style="height:300px;" />
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

const filter       = ref({ year: dayjs().format('YYYY') });
const loading      = ref(false);
const loadingLevel1 = ref(false);
const chartsReady  = ref(false);
const showLevel1   = ref(false);
const selectedDept = ref('');

const ytdChartOptions  = ref({});
const bulanChartOptions = ref({});

const baseHC = () => ({ credits: { enabled: false }, exporting: { enabled: false } });

// ── Build main YTD chart ──────────────────────────────────────────────────────
function buildYTDChart(data, year) {
  ytdChartOptions.value = {
    ...baseHC(),
    chart: { zoomType: 'xy' },
    title: { text: 'Total SPK General', style: { fontSize: '14px' } },
    xAxis: [{ categories: data.map(d => d.nama), crosshair: true }],
    yAxis: [{
      title: { text: 'SPK' },
      labels: { format: '{value}' },
    }],
    tooltip: { shared: true },
    legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    plotOptions: {
      column: { dataLabels: { enabled: true } },
    },
    series: [{
      name: 'Total SPK',
      type: 'column',
      color: '#33bad0',
      data: data.map(d => parseInt(d.total_spk) || 0),
      tooltip: { valueSuffix: '' },
      cursor: 'pointer',
      point: {
        events: {
          click: function () {
            loadLevel1(this.category, year);
          },
        },
      },
    }],
  };
}

// ── Load level 1: SPK per month for selected dept ─────────────────────────────
async function loadLevel1(namaDept, tahun) {
  try {
    selectedDept.value  = namaDept;
    showLevel1.value    = true;
    loadingLevel1.value = true;

    const res = await axios.get(`${import.meta.env.VITE_API}getSpkTotalBulan`, {
      params: { tahun, namaDept },
    });

    const data = res.data;

    bulanChartOptions.value = {
      ...baseHC(),
      chart: { zoomType: 'xy' },
      title: { text: namaDept, style: { fontSize: '14px' } },
      xAxis: [{ categories: data.map(d => d.bulan), crosshair: true }],
      yAxis: [{
        title: { text: 'Total Hari' },
        labels: { format: '{value} Hari' },
      }],
      tooltip: { shared: true },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
      plotOptions: {
        column: { dataLabels: { enabled: true } },
      },
      series: [{
        name: 'SPK',
        type: 'column',
        color: '#33bad0',
        data: data.map(d => parseInt(d.total) || 0),
        tooltip: { valueSuffix: '' },
      }],
    };
  } catch (err) {
    error('Gagal memuat data bulan');
  } finally {
    loadingLevel1.value = false;
  }
}

// ── API ───────────────────────────────────────────────────────────────────────
const searchData = async () => {
  try {
    loading.value     = true;
    chartsReady.value = false;
    showLevel1.value  = false;

    const res = await axios.get(`${import.meta.env.VITE_API}getSpkTotal`, {
      params: { year: filter.value.year },
    });

    buildYTDChart(res.data, filter.value.year);
    chartsReady.value = true;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

searchData();
</script>
