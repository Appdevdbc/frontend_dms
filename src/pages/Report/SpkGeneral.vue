<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="bar_chart" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Laporan SPK General</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>SPK General</span>
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
            <q-select outlined v-model="filter.year" :options="yearOptions"
              label="Tahun" emit-value map-options>
              <template v-slot:prepend>
                <q-icon name="calendar_today" :color="`${domain()}`" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select outlined v-model="filter.month" :options="monthOptions"
              label="Bulan" emit-value map-options>
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select outlined v-model="filter.dept" :options="deptOptions"
              label="Department" emit-value map-options clearable>
              <template v-slot:prepend>
                <q-icon name="business" :color="`${domain()}`" />
              </template>
            </q-select>
          </div>
        </div>
        <div class="tw-mt-4">
          <q-btn unelevated :color="`${domain()}`" label="Tampilkan" icon="search"
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
          <div class="tw-text-sm">Pilih filter dan klik Tampilkan</div>
        </div>

        <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
          <q-spinner-dots :color="`${domain()}`" size="48px" />
        </div>

        <template v-if="chartsReady && !loading">

          <!-- Chart 1: SPK per Dept -->
          <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-cyan-700 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                <q-icon name="bar_chart" size="20px" />
                Data Total SPK Per Departemen
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <highcharts :options="mainChartOptions" style="height:320px;" />
            </q-card-section>
          </q-card>

          <!-- Chart 2: Daily drill-down -->
          <q-card v-if="showDaily" flat bordered class="tw-rounded-xl tw-overflow-hidden">
            <q-card-section class="tw-bg-indigo-700 tw-py-3 tw-px-5">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-font-semibold">
                  <q-icon name="calendar_month" size="20px" />
                  Data Total SPK Per Tanggal — {{ selectedDept }}
                </div>
                <q-btn flat round dense icon="close" color="white" @click="showDaily = false" />
              </div>
            </q-card-section>
            <q-card-section class="tw-p-4">
              <div v-if="loadingDaily" class="tw-flex tw-justify-center tw-py-10">
                <q-spinner-dots color="indigo" size="36px" />
              </div>
              <highcharts v-else :options="dailyChartOptions" style="height:300px;" />
            </q-card-section>
          </q-card>

        </template>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { domain } from "./../../utils";
import { useNotify } from "./../../composables/useNotify";
import dayjs from "dayjs";

const { error } = useNotify();

const currentYear = parseInt(dayjs().format('YYYY'));
const yearOptions = Array.from({ length: currentYear - 2017 }, (_, i) => ({
  value: String(2018 + i), label: String(2018 + i),
})).reverse();

const monthOptions = [
  { value: '1',  label: 'Januari' },  { value: '2',  label: 'Februari' },
  { value: '3',  label: 'Maret' },    { value: '4',  label: 'April' },
  { value: '5',  label: 'Mei' },      { value: '6',  label: 'Juni' },
  { value: '7',  label: 'Juli' },     { value: '8',  label: 'Agustus' },
  { value: '9',  label: 'September' },{ value: '10', label: 'Oktober' },
  { value: '11', label: 'Nopember' }, { value: '12', label: 'Desember' },
];

const filter = ref({
  year:  dayjs().format('YYYY'),
  month: dayjs().format('M'),
  dept:  null,
});

const loading           = ref(false);
const loadingDaily      = ref(false);
const chartsReady       = ref(false);
const showDaily         = ref(false);
const selectedDept      = ref('');
const deptOptions       = ref([{ value: null, label: 'All Department' }]);
const mainChartOptions  = ref({});
const dailyChartOptions = ref({});

const baseHC = () => ({ credits: { enabled: false }, exporting: { enabled: false } });

const loadDepts = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getDeptListGeneral`);
    deptOptions.value = [
      { value: null, label: 'All Department' },
      ...res.data.map(d => ({ value: d.value, label: d.label })),
    ];
  } catch (err) {
    error('Gagal memuat department');
  }
};

function buildMainChart(data, year, month) {
  mainChartOptions.value = {
    ...baseHC(),
    chart: { zoomType: 'xy' },
    title: { text: 'Total SPK General', style: { fontSize: '14px' } },
    xAxis: [{ categories: data.map(d => d.nama), crosshair: true }],
    yAxis: [{ title: { text: 'SPK' }, labels: { format: '{value}' } }],
    tooltip: { shared: true },
    legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    plotOptions: { column: { dataLabels: { enabled: true } } },
    series: [{
      name: 'Total SPK',
      type: 'column',
      color: '#33bad0',
      data: data.map(d => parseInt(d.total_spk) || 0),
      cursor: 'pointer',
      point: {
        events: {
          click: function () {
            loadDaily(this.category, year, month);
          },
        },
      },
    }],
  };
}

async function loadDaily(namaDept, year, month) {
  try {
    selectedDept.value = namaDept;
    showDaily.value    = true;
    loadingDaily.value = true;

    const res = await axios.get(`${import.meta.env.VITE_API}getSpkTotalDaily`, {
      params: { year, month, namaDept },
    });

    dailyChartOptions.value = {
      ...baseHC(),
      chart: { zoomType: 'xy' },
      title: { text: namaDept, style: { fontSize: '14px' } },
      xAxis: [{ categories: res.data.map(d => d.bulan), crosshair: true, title: { text: 'Tanggal' } }],
      yAxis: [{ title: { text: 'Total SPK' }, labels: { format: '{value}' }, allowDecimals: false }],
      tooltip: { shared: true },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
      plotOptions: { column: { dataLabels: { enabled: true } } },
      series: [{
        name: 'Total SPK',
        type: 'column',
        color: '#33bad0',
        data: res.data.map(d => parseInt(d.total) || 0),
      }],
    };
  } catch (err) {
    error('Gagal memuat data harian');
  } finally {
    loadingDaily.value = false;
  }
}

const searchData = async () => {
  try {
    loading.value     = true;
    chartsReady.value = false;
    showDaily.value   = false;

    const res = await axios.get(`${import.meta.env.VITE_API}getSpkGeneral`, {
      params: {
        year:  filter.value.year,
        month: filter.value.month,
        dept:  filter.value.dept || '',
      },
    });

    buildMainChart(res.data, filter.value.year, filter.value.month);
    chartsReady.value = true;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadDepts();
  await searchData();
});
</script>
