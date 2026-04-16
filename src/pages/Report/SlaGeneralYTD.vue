<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="insights" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Service Level SPK General (YTD)</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>SLA General YTD</span>
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

        <!-- Empty state -->
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

          <!-- Chart 1: Service Level YTD (main) -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-cyan-700 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="show_chart" size="20px" />
                Service Level SPK General (YTD)
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <highcharts :options="ytdChartOptions" style="height:320px;" />
            </q-card-section>
          </q-card>

          <!-- Detail table (shown after clicking a month bar) -->
          <q-card v-if="detailData.length > 0" flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section :class="`side-${domain()}-1 tw-py-3 tw-px-5`">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                  <q-icon name="table_chart" size="20px" />
                  Service Level SPK General (YTD) — {{ selectedMonth }}
                </div>
                <q-btn flat round dense icon="close" color="white" @click="clearDetail" />
              </div>
            </q-card-section>
            <q-card-section class="tw-p-0">
              <div v-if="loadingDetail" class="tw-flex tw-justify-center tw-py-8">
                <q-spinner-dots :color="`${domain()}`" size="36px" />
              </div>
              <q-table v-else :rows="detailData" :columns="detailColumns"
                row-key="no_spk" flat :rows-per-page-options="[10,25,50]"
                class="tw-text-xs">
                <template v-slot:body-cell-sla="props">
                  <q-td :props="props" class="tw-text-center">
                    <q-badge :color="props.value === 'Ya' ? 'positive' : 'negative'"
                      :label="props.value" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- Level 1 drill-down charts (shown after clicking detail row) -->
          <template v-if="showLevel1">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
                  <q-card-section class="tw-bg-blue-700 tw-py-3 tw-px-5">
                    <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                      <q-icon name="calendar_view_week" size="20px" />
                      Data Turunan Grafik Level 1 (Hari)
                    </div>
                  </q-card-section>
                  <q-card-section class="tw-p-4">
                    <highcharts :options="hariChartOptions" style="height:300px;" />
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12">
                <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
                  <q-card-section class="tw-bg-indigo-700 tw-py-3 tw-px-5">
                    <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                      <q-icon name="schedule" size="20px" />
                      Data Turunan Grafik Level 1 (Jam)
                    </div>
                  </q-card-section>
                  <q-card-section class="tw-p-4">
                    <highcharts :options="jamChartOptions" style="height:300px;" />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </template>

          <!-- Level 2 drill-down charts (shown after clicking SPK bar) -->
          <template v-if="showLevel2">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
                  <q-card-section class="tw-bg-teal-700 tw-py-3 tw-px-5">
                    <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                      <q-icon name="category" size="20px" />
                      Data Turunan Grafik Level 2 (Jam) — By Section
                    </div>
                  </q-card-section>
                  <q-card-section class="tw-p-4">
                    <highcharts :options="sectionChartOptions" style="height:300px;" />
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-6">
                <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
                  <q-card-section class="tw-bg-orange-700 tw-py-3 tw-px-5">
                    <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                      <q-icon name="engineering" size="20px" />
                      Data Turunan Grafik Level 2 (Jam) — By Operator
                    </div>
                  </q-card-section>
                  <q-card-section class="tw-p-4">
                    <highcharts :options="oprChartOptions" style="height:300px;" />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </template>

          <!-- Bottom row: Target VS Pencapaian + SPK Outstanding -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
                <q-card-section class="tw-bg-slate-600 tw-py-3 tw-px-5">
                  <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                    <q-icon name="compare_arrows" size="20px" />
                    Target VS Pencapaian (YTD)
                  </div>
                </q-card-section>
                <q-card-section class="tw-p-4">
                  <highcharts :options="targetChartOptions" style="height:300px;" />
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
                <q-card-section class="tw-bg-slate-600 tw-py-3 tw-px-5">
                  <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                    <q-icon name="pending_actions" size="20px" />
                    SPK Outstanding
                  </div>
                </q-card-section>
                <q-card-section class="tw-p-4">
                  <highcharts :options="outstandingChartOptions" style="height:300px;" />
                </q-card-section>
              </q-card>
            </div>
          </div>

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
const filter = ref({ year: dayjs().format('YYYY') });

// ── State ─────────────────────────────────────────────────────────────────────
const loading       = ref(false);
const loadingDetail = ref(false);
const chartsReady   = ref(false);
const showLevel1    = ref(false);
const showLevel2    = ref(false);
const selectedMonth = ref('');
const selectedSPK   = ref('');
const detailData    = ref([]);

// ── Chart option refs ─────────────────────────────────────────────────────────
const ytdChartOptions         = ref({});
const targetChartOptions      = ref({});
const outstandingChartOptions = ref({});
const hariChartOptions        = ref({});
const jamChartOptions         = ref({});
const sectionChartOptions     = ref({});
const oprChartOptions         = ref({});

// ── Detail table columns ──────────────────────────────────────────────────────
const detailColumns = [
  { name: 'no_spk',      label: 'No SPK',    field: 'no_spk',      align: 'center', sortable: true },
  { name: 'tanggal_spk', label: 'Tanggal',   field: 'tanggal_spk', align: 'center' },
  { name: 'subject_spk', label: 'Subject',   field: 'subject_spk', align: 'left' },
  { name: 'sla',         label: 'Close on Target', field: 'sla',   align: 'center', sortable: true },
];

// ── Highcharts base helpers ───────────────────────────────────────────────────
const baseHC = () => ({
  credits: { enabled: false },
  exporting: { enabled: false },
});

const columnChart = (title, categories, seriesData, yTitle = 'SPK') => ({
  ...baseHC(),
  chart: { type: 'column' },
  title: { text: title, style: { fontSize: '14px' } },
  xAxis: { categories, crosshair: true },
  yAxis: { min: 0, title: { text: yTitle } },
  legend: { enabled: false },
  tooltip: { pointFormat: '{point.y}' },
  plotOptions: { column: { dataLabels: { enabled: true } } },
  series: [{ data: seriesData }],
});

// ── Month name map (PHP uses Indonesian abbreviations) ────────────────────────
const monthMap = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, Mei: 5, Jun: 6,
  Jul: 7, Ags: 8, Sep: 9, Okt: 10, Nov: 11, Des: 12,
};

// ── Build main YTD chart ──────────────────────────────────────────────────────
function buildYTDChart(data, year) {
  const categories = data.map(d => d.month);
  const slaData    = data.map(d => parseFloat(d.sla) || 0);

  ytdChartOptions.value = {
    ...baseHC(),
    chart: { zoomType: 'xy' },
    title: { text: `Service Level SPK General`, style: { fontSize: '14px' } },
    xAxis: [{ categories, crosshair: true }],
    yAxis: [{
      title: { text: 'Service Level (%)' },
      labels: { format: '{value} %' },
    }],
    tooltip: { shared: true },
    legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    plotOptions: {
      column: { dataLabels: { enabled: true } },
    },
    series: [
      {
        name: 'Service Level',
        type: 'column',
        color: '#33bad0',
        data: slaData,
        tooltip: { valueSuffix: '%' },
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              loadDetail(this.category, year);
            },
          },
        },
      },
      {
        name: 'Target Service Level',
        type: 'spline',
        color: '#ec5252',
        data: Array(categories.length).fill(90),
        tooltip: { valueSuffix: '%' },
      },
    ],
  };
}

// ── Build Target VS Pencapaian chart ─────────────────────────────────────────
function buildTargetChart(target, tercapai) {
  targetChartOptions.value = {
    ...columnChart('Target VS Pencapaian', ['Target', 'Pencapaian'], [
      { y: parseFloat(target) || 0, color: '#ec5252' },
      { y: parseFloat(tercapai) || 0, color: '#33bad0' },
    ]),
  };
}

// ── Build SPK Outstanding chart ───────────────────────────────────────────────
function buildOutstandingChart(open, close, outstanding, year) {
  outstandingChartOptions.value = {
    ...columnChart(`Tipe SPK ${year}`, ['Open', 'Close', 'Outstanding'], [
      { y: parseFloat(open) || 0, color: '#ec5252' },
      { y: parseFloat(close) || 0, color: '#3eda7d' },
      { y: parseFloat(outstanding) || 0, color: '#33bad0' },
    ]),
  };
}

// ── Load detail table when clicking a month bar ───────────────────────────────
async function loadDetail(monthLabel, year) {
  try {
    selectedMonth.value = monthLabel;
    loadingDetail.value = true;
    showLevel1.value    = false;
    showLevel2.value    = false;
    detailData.value    = [];

    const bulan = monthMap[monthLabel] ?? monthLabel;

    const res = await axios.get(`${import.meta.env.VITE_API}getSlaGeneralYTDDetail`, {
      params: { year, bulan, jenis: 'general' },
    });
    detailData.value = res.data;

    // Load level 1 drill-down charts
    await loadLevel1(bulan, year);
  } catch (err) {
    error('Gagal memuat detail');
  } finally {
    loadingDetail.value = false;
  }
}

// ── Level 1: Hari + Jam charts ────────────────────────────────────────────────
async function loadLevel1(bulan, year) {
  try {
    const [hariRes, jamRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}getSlaGeneralYTDHari`, {
        params: { bulan, tahun: year, jenis: 'general' },
      }),
      axios.get(`${import.meta.env.VITE_API}getSlaGeneralYTDJam`, {
        params: { bulan, tahun: year, jenis: 'general' },
      }),
    ]);

    const hariData = hariRes.data;
    const jamData  = jamRes.data;

    hariChartOptions.value = {
      ...baseHC(),
      chart: { zoomType: 'xy' },
      title: { text: `${bulan}-Days`, style: { fontSize: '14px' } },
      xAxis: [{ categories: hariData.map(d => d.id_spk), crosshair: true }],
      yAxis: [{ title: { text: 'Total Hari' }, labels: { format: '{value} Hari' } }],
      tooltip: { shared: true },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
      series: [{
        name: 'SPK', type: 'column', color: '#33bad0',
        data: hariData.map(d => parseInt(d.total_hari) || 0),
        tooltip: { valueSuffix: ' Hari' },
        cursor: 'pointer',
        point: {
          events: {
            click: function () { loadLevel2(this.category); },
          },
        },
      }],
    };

    jamChartOptions.value = {
      ...baseHC(),
      chart: { zoomType: 'xy' },
      title: { text: `${bulan}-Hours`, style: { fontSize: '14px' } },
      xAxis: [{ categories: jamData.map(d => d.id_spk), crosshair: true }],
      yAxis: [{ title: { text: 'Total Jam' }, labels: { format: '{value} Jam' } }],
      tooltip: { shared: true },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
      series: [{
        name: 'SPK', type: 'column', color: '#33bad0',
        data: jamData.map(d => parseInt(d.total_jam) || 0),
        tooltip: { valueSuffix: ' Jam' },
        cursor: 'pointer',
        point: {
          events: {
            click: function () { loadLevel2(this.category); },
          },
        },
      }],
    };

    showLevel1.value = true;
  } catch (err) {
    error('Gagal memuat data level 1');
  }
}

// ── Level 2: Section + Operator charts ───────────────────────────────────────
async function loadLevel2(idSpk) {
  try {
    selectedSPK.value = idSpk;

    const [sectionRes, oprRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}getSlaGeneralYTDSection`, { params: { id_spk: idSpk } }),
      axios.get(`${import.meta.env.VITE_API}getSlaGeneralYTDOpr`,     { params: { id_spk: idSpk } }),
    ]);

    sectionChartOptions.value = {
      ...baseHC(),
      chart: { zoomType: 'xy' },
      title: { text: `SPK ${idSpk} - HOURS BY SECTION`, style: { fontSize: '14px' } },
      xAxis: [{ categories: sectionRes.data.map(d => d.section), crosshair: true }],
      yAxis: [{ title: { text: 'Total Jam' }, labels: { format: '{value} Jam' } }],
      tooltip: { shared: true },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
      series: [{
        name: 'Service Level', type: 'column', color: '#33bad0',
        data: sectionRes.data.map(d => parseFloat(d.total_jam) || 0),
        tooltip: { valueSuffix: ' Jam' },
      }],
    };

    oprChartOptions.value = {
      ...baseHC(),
      chart: { zoomType: 'xy' },
      title: { text: `SPK ${idSpk} - HOURS BY OPR`, style: { fontSize: '14px' } },
      xAxis: [{ categories: oprRes.data.map(d => d.pic), crosshair: true }],
      yAxis: [{ title: { text: 'Total Jam' }, labels: { format: '{value} Jam' } }],
      tooltip: { shared: true },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
      series: [{
        name: 'Total Jam', type: 'column', color: '#33bad0',
        data: oprRes.data.map(d => parseFloat(d.total_jam) || 0),
        tooltip: { valueSuffix: ' Jam' },
      }],
    };

    showLevel2.value = true;
  } catch (err) {
    error('Gagal memuat data level 2');
  }
}

function clearDetail() {
  detailData.value = [];
  showLevel1.value = false;
  showLevel2.value = false;
  selectedMonth.value = '';
}

// ── API ───────────────────────────────────────────────────────────────────────
const searchData = async () => {
  try {
    loading.value     = true;
    chartsReady.value = false;
    clearDetail();

    const year = filter.value.year;

    const [ytdRes, summaryRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}getSlaGeneralYTD`,
        { params: { year, jenis: 'general' } }),
      axios.get(`${import.meta.env.VITE_API}getSlaGeneralYTDSummary`,
        { params: { year, jenis: 'general' } }),
    ]);

    const summary = summaryRes.data;

    buildYTDChart(ytdRes.data, year);
    buildTargetChart(summary.target, summary.tercapai);
    buildOutstandingChart(summary.slaOpen, summary.slaClose, summary.slaOutstanding, year);

    chartsReady.value = true;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

// ── Init ──────────────────────────────────────────────────────────────────────
searchData();
</script>
