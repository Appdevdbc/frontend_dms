<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="more_time" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Laporan Overtime</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Overtime</span>
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
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.id_job"
              :options="jobTypeOptions"
              label="Job Type"
              emit-value
              map-options
              multiple
              clearable
              use-chips
            >
              <template v-slot:prepend>
                <q-icon name="work" :color="`${domain()}`" />
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

      <!-- Charts -->
      <q-card-section class="tw-bg-white">

        <div v-if="!chartsReady && !loading"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400">
          <q-icon name="bar_chart" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih filter dan klik Cari</div>
        </div>

        <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
          <q-spinner-dots :color="`${domain()}`" size="48px" />
        </div>

        <div v-if="chartsReady && !loading" class="row q-col-gutter-md">

          <!-- Overtime Workshop (by job type) -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-red-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="more_time" size="18px" /> Overtime Workshop
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.all" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Overtime Workshop by Month -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-emerald-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="calendar_month" size="18px" /> Overtime Workshop by Month
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.month" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Overtime Machining -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-cyan-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="precision_manufacturing" size="18px" /> Overtime Machining
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.machining" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Overtime Bongkar Analisa -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-amber-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="build" size="18px" /> Overtime Bongkar Analisa
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.bongkar" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Overtime Order Part -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-pink-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="inventory" size="18px" /> Overtime Order Part
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.orderPart" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Overtime Assy -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-slate-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="settings" size="18px" /> Overtime Assy
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.assy" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Overtime Drawing -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-violet-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="draw" size="18px" /> Overtime Drawing
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.drawing" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Overtime Trial -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="tw-rounded-xl tw-overflow-hidden">
              <q-card-section class="tw-bg-teal-600 tw-py-3 tw-px-5">
                <div class="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                  <q-icon name="science" size="18px" /> Overtime Trial
                </div>
              </q-card-section>
              <q-card-section class="tw-p-3">
                <highcharts :options="charts.trial" style="height:250px;" />
              </q-card-section>
            </q-card>
          </div>

        </div>
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

// ── Filter ────────────────────────────────────────────────────────────────────
const filter = ref({
  start:  '2019-01-01',
  end:    dayjs().format('YYYY-MM-DD'),
  id_job: [],
});

const jobTypeOptions = ref([]);
const loading        = ref(false);
const chartsReady    = ref(false);

// ── Chart option refs ─────────────────────────────────────────────────────────
const charts = ref({
  all: {}, month: {}, machining: {}, bongkar: {},
  orderPart: {}, assy: {}, drawing: {}, trial: {},
});

// ── Highcharts base ───────────────────────────────────────────────────────────
const baseHC = () => ({
  credits: { enabled: false },
  exporting: { enabled: false },
});

const makeColumnChart = (title, categories, data, color) => ({
  ...baseHC(),
  chart: { type: 'column' },
  title: { text: title, style: { fontSize: '14px' } },
  xAxis: [{ categories, crosshair: true }],
  yAxis: [{ min: 0, title: { text: '' } }],
  legend: { enabled: false },
  tooltip: {
    headerFormat: '<b>{point.key}</b><br/>',
    pointFormat: '{series.name}: {point.y}',
  },
  plotOptions: {
    column: { dataLabels: { enabled: true } },
  },
  series: [{
    name: 'Actual',
    type: 'column',
    color,
    data: data.map(d => parseFloat(d.total) || 0),
  }],
});

// ── Load job types ────────────────────────────────────────────────────────────
const loadJobTypes = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getJobTypeList`);
    jobTypeOptions.value = res.data.map(j => ({ value: j.value, label: j.label }));
  } catch (err) {
    error('Gagal memuat job type');
  }
};

// ── Search ────────────────────────────────────────────────────────────────────
const searchData = async () => {
  try {
    loading.value     = true;
    chartsReady.value = false;

    const year   = dayjs(filter.value.end || undefined).format('YYYY');
    const id_job = filter.value.id_job?.join(',') || '0';
    const params = { start: filter.value.start, end: filter.value.end, id_job };

    const [
      allRes, monthRes,
      machiningRes, bongkarRes, orderPartRes,
      assyRes, drawingRes, trialRes,
    ] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}getOvertimeJobType`,  { params }),
      axios.get(`${import.meta.env.VITE_API}getOvertimeMonthly`,  { params: { year, id_job } }),
      axios.get(`${import.meta.env.VITE_API}getOvertimeSection`,  { params: { year, section: 'machining',        id_job } }),
      axios.get(`${import.meta.env.VITE_API}getOvertimeSection`,  { params: { year, section: 'bongkar_analisis', id_job } }),
      axios.get(`${import.meta.env.VITE_API}getOvertimeSection`,  { params: { year, section: 'order_part',       id_job } }),
      axios.get(`${import.meta.env.VITE_API}getOvertimeSection`,  { params: { year, section: 'assy',             id_job } }),
      axios.get(`${import.meta.env.VITE_API}getOvertimeSection`,  { params: { year, section: 'drawing',          id_job } }),
      axios.get(`${import.meta.env.VITE_API}getOvertimeSection`,  { params: { year, section: 'trial',            id_job } }),
    ]);

    charts.value = {
      all:       makeColumnChart('Overtime Workshop',        allRes.data.map(d => d.jobtype),      allRes.data,       '#ec5252'),
      month:     makeColumnChart('Overtime Workshop - Month', monthRes.data.map(d => d.month),     monthRes.data,     '#3eda7d'),
      machining: makeColumnChart('Overtime Machining',        machiningRes.data.map(d => d.month), machiningRes.data, '#33bad0'),
      bongkar:   makeColumnChart('Overtime Bongkar Analisa',  bongkarRes.data.map(d => d.month),   bongkarRes.data,   '#f3ac3b'),
      orderPart: makeColumnChart('Overtime Order Part',       orderPartRes.data.map(d => d.month), orderPartRes.data, '#e98edb'),
      assy:      makeColumnChart('Overtime Assy',             assyRes.data.map(d => d.month),      assyRes.data,      '#7c3aed'),
      drawing:   makeColumnChart('Overtime Drawing',          drawingRes.data.map(d => d.month),   drawingRes.data,   '#8b5cf6'),
      trial:     makeColumnChart('Overtime Trial',            trialRes.data.map(d => d.month),     trialRes.data,     '#14b8a6'),
    };

    chartsReady.value = true;
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadJobTypes();
  await searchData();
});
</script>
