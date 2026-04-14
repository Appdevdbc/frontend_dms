<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="compare_arrows" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Perbandingan Arsip Per BU Pertahun</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Rekapitulasi</span><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Perbandingan</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <RekapFilterSection
          v-model:filter-bu="filter.bu_id" v-model:filter-lokasi-arsip="filter.lokasi_arsip_id"
          v-model:filter-kategori="filter.kategori" v-model:filter-divisi="filter.divisi"
          v-model:filter-from="filter.from" v-model:filter-to="filter.to" v-model:filter-tipe="filter.tipe"
          period-type="number" period-label="Tahun"
        >
          <template #actions>
            <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData"/>
          </template>
        </RekapFilterSection>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div v-if="detailData.length === 0 && !isLoading" class="tw-text-center tw-py-10 tw-text-slate-400">
          <q-icon name="compare_arrows" size="48px" class="tw-mb-2"/>
          <div>Tidak ada data. Silakan ubah filter dan klik Tampilkan.</div>
        </div>
        <template v-if="detailData.length > 0">
          <!-- Table 1: Tahun rows × BU columns (I/P) -->
          <div class="tw-overflow-x-auto tw-mb-6">
            <div class="tw-font-bold tw-text-slate-700 tw-mb-2">Perbandingan Arsip Per-BU Pertahun</div>
            <table class="tw-w-full tw-border-collapse tw-text-sm">
              <thead>
                <tr>
                  <th rowspan="2" class="tw-bg-green-100 tw-border tw-px-3 tw-py-2 tw-text-center tw-font-bold">Tahun</th>
                  <th v-for="bu in buNames" :key="bu" colspan="2" class="tw-bg-green-100 tw-border tw-px-3 tw-py-1 tw-text-center">{{ bu }}</th>
                  <th colspan="2" class="tw-bg-green-100 tw-border tw-px-3 tw-py-1 tw-text-center">DBC</th>
                </tr>
                <tr>
                  <template v-for="bu in buNames" :key="'h2-'+bu">
                    <th class="tw-bg-green-100 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs">(I)</th>
                    <th class="tw-bg-green-100 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs">(P)</th>
                  </template>
                  <th class="tw-bg-green-100 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs">(I)</th>
                  <th class="tw-bg-green-100 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs">(P)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="y in years" :key="y">
                  <td class="tw-bg-amber-50 tw-border tw-px-3 tw-py-1 tw-text-center tw-font-bold">{{ y }}</td>
                  <template v-for="bu in buNames" :key="'d-'+y+bu">
                    <td class="tw-border tw-px-2 tw-py-1 tw-text-center">{{ tipeVal(y, bu, 'I') }}</td>
                    <td class="tw-border tw-px-2 tw-py-1 tw-text-center">{{ tipeVal(y, bu, 'P') }}</td>
                  </template>
                  <td class="tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ tipeVal(y, null, 'I') }}</td>
                  <td class="tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ tipeVal(y, null, 'P') }}</td>
                </tr>
                <!-- Total row -->
                <tr>
                  <td class="tw-bg-cyan-50 tw-border tw-px-3 tw-py-1 tw-text-center tw-font-bold">Total</td>
                  <template v-for="bu in buNames" :key="'t-'+bu">
                    <td class="tw-bg-amber-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ buTotal(bu, 'I') }}</td>
                    <td class="tw-bg-amber-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ buTotal(bu, 'P') }}</td>
                  </template>
                  <td class="tw-bg-amber-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ grandTotal('I') }}</td>
                  <td class="tw-bg-amber-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ grandTotal('P') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Table 2: BU rows × Year columns (Jumlah / %) -->
          <div class="tw-overflow-x-auto tw-mb-6">
            <div class="tw-font-bold tw-text-slate-700 tw-mb-2">Grafik Perbandingan Arsip Per-BU Pertahun</div>
            <table class="tw-w-full tw-border-collapse tw-text-sm">
              <thead>
                <tr>
                  <th class="tw-bg-cyan-100 tw-border tw-px-3 tw-py-2 tw-text-center tw-font-bold">Tahun</th>
                  <th v-for="y in years" :key="y" colspan="2" class="tw-bg-amber-50 tw-border tw-px-3 tw-py-1 tw-text-center tw-font-bold">{{ y }}</th>
                </tr>
                <tr>
                  <th class="tw-bg-cyan-100 tw-border tw-px-3 tw-py-1 tw-text-center tw-font-bold">BU</th>
                  <template v-for="y in years" :key="'bh-'+y">
                    <th class="tw-bg-amber-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs tw-font-bold">Jumlah</th>
                    <th class="tw-bg-amber-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs tw-font-bold">%</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bu in buNames" :key="'r2-'+bu" class="tw-bg-green-50">
                  <td class="tw-border tw-px-3 tw-py-1 tw-text-center">{{ bu }}</td>
                  <template v-for="y in years" :key="'v2-'+y+bu">
                    <td class="tw-border tw-px-2 tw-py-1 tw-text-center">{{ getVal(y, bu) }}</td>
                    <td class="tw-border tw-px-2 tw-py-1 tw-text-center">{{ getPct(y, bu) }}</td>
                  </template>
                </tr>
                <tr>
                  <td class="tw-bg-cyan-100 tw-border tw-px-3 tw-py-1 tw-text-center tw-font-bold">DBC</td>
                  <template v-for="y in years" :key="'dbc-'+y">
                    <td class="tw-bg-cyan-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ yearTotal(y) }}</td>
                    <td class="tw-bg-cyan-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">100</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Charts -->
          <div class="tw-space-y-6">
            <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4">
              <apexchart :key="'j-'+chartKey" type="bar" :height="dynChartHeight(years)" :options="chartJumlahOpts" :series="chartJumlahSeries"/>
            </div>
            <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4">
              <apexchart :key="'p-'+chartKey" type="bar" :height="dynChartHeight(years)" :options="chartPctOpts" :series="chartPctSeries"/>
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Loading } from 'quasar';
import { spinnerBall, decryptMessage, empid, domain } from '../../../utils';
import RekapFilterSection from '../../../components/WJS/Rekapitulasi/RekapFilterSection.vue';
import { useChartColors } from '../../../composables/useChartColors';

const router = useRouter();
const { getColors, chartHeight: calcHeight } = useChartColors();
const tmpPage = reactive({ add:'0', edit:'0', delete:'0', view:'0', admin:'0' });
const filter = reactive({ bu_id:null, lokasi_arsip_id:null, kategori:null, divisi:null, from:null, to:null, tipe:null });
const detailData = ref([]);
const totalData = ref([]);
const totalBuData = ref([]);
const chartKey = ref(0);
const isLoading = ref(false);

const dynChartHeight = (arr) => calcHeight(arr.length, 60, 150);

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/rekapitulasi/perbandingan', domain: domain() }
    });
    tmpPage.add = decryptMessage(res.data.add); tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete); tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
  } catch (error) { Loading.hide(); }
};

const cleanParams = (obj) => {
  const cleaned = {};
  for (const [k, v] of Object.entries(obj)) { if (v != null && v !== '') cleaned[k] = v; }
  return cleaned;
};

const loadData = async () => {
  try {
    isLoading.value = true;
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}dms/rekapitulasi/perbandingan`, {
      params: cleanParams({ ...filter, empid: empid() })
    });
    const d = res.data.data || {};
    detailData.value = d.detail || [];
    totalData.value = d.total || [];
    totalBuData.value = d.totalBu || [];
    Loading.hide();
    isLoading.value = false;
    await nextTick();
    chartKey.value++;
  } catch (e) { Loading.hide(); isLoading.value = false; console.error(e); }
};

const years = computed(() => [...new Set(detailData.value.map(r => r.tahun))].sort());
const buNames = computed(() => [...new Set(detailData.value.map(r => r.bu_name).filter(Boolean))].sort());

// Helper: find detail row
const findRow = (y, bu) => detailData.value.find(r => r.tahun === y && r.bu_name === bu);

// Table 1 helpers: tipeVal for I/P per year+bu
const tipeVal = (y, bu, ip) => {
  const t = filter.tipe;
  if (bu) {
    const r = findRow(y, bu);
    if (!r) return ip === 'I' && t === 'Dokumen Pendukung' ? '-' : ip === 'P' && t === 'Dokumen Induk' ? '-' : 0;
    if (ip === 'I') return t === 'Dokumen Pendukung' ? '-' : Number(r.jumlah) || 0;
    return t === 'Dokumen Induk' ? '-' : Number(r.jumlah_pendukung) || 0;
  }
  // DBC total for year
  let sum = 0;
  buNames.value.forEach(b => {
    const r = findRow(y, b);
    if (r) sum += ip === 'I' ? (Number(r.jumlah) || 0) : (Number(r.jumlah_pendukung) || 0);
  });
  const t2 = filter.tipe;
  if (ip === 'I' && t2 === 'Dokumen Pendukung') return '-';
  if (ip === 'P' && t2 === 'Dokumen Induk') return '-';
  return sum;
};

const buTotal = (bu, ip) => {
  const t = filter.tipe;
  if (ip === 'I' && t === 'Dokumen Pendukung') return '-';
  if (ip === 'P' && t === 'Dokumen Induk') return '-';
  let sum = 0;
  years.value.forEach(y => { const r = findRow(y, bu); if (r) sum += ip === 'I' ? (Number(r.jumlah) || 0) : (Number(r.jumlah_pendukung) || 0); });
  return sum;
};
const grandTotal = (ip) => {
  const t = filter.tipe;
  if (ip === 'I' && t === 'Dokumen Pendukung') return '-';
  if (ip === 'P' && t === 'Dokumen Induk') return '-';
  let sum = 0;
  detailData.value.forEach(r => { sum += ip === 'I' ? (Number(r.jumlah) || 0) : (Number(r.jumlah_pendukung) || 0); });
  return sum;
};

// Table 2 helpers: value based on tipe
const getVal = (y, bu) => {
  const r = findRow(y, bu);
  if (!r) return 0;
  const t = filter.tipe;
  if (t === 'Dokumen Induk') return Number(r.jumlah) || 0;
  if (t === 'Dokumen Pendukung') return Number(r.jumlah_pendukung) || 0;
  return (Number(r.jumlah) || 0) + (Number(r.jumlah_pendukung) || 0);
};
const yearTotal = (y) => {
  const t = totalData.value.find(r => r.tahun === y);
  return t ? Number(t.total) || 0 : 0;
};
const getPct = (y, bu) => {
  const val = getVal(y, bu);
  const tot = yearTotal(y);
  if (tot === 0) return 0;
  return Math.ceil((val / tot) * 100 * 100) / 100;
};

// Charts: X-axis = years, each BU is a series (like PHP)
const chartJumlahOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '70%' } },
  xaxis: { title: { text: 'Jumlah Arsip' } },
  yaxis: { labels: { maxWidth: 80 } },
  colors: getColors(buNames.value.length),
  dataLabels: { enabled: true, style: { fontSize: '10px' } },
  legend: { position: 'bottom' },
  title: { text: 'Grafik Perbandingan Arsip Per BU Pertahun', align: 'center', style: { fontSize: '14px' } },
}));
const chartJumlahSeries = computed(() =>
  buNames.value.map(bu => ({
    name: bu,
    data: years.value.map(y => ({ x: String(y), y: getVal(y, bu) }))
  }))
);

const chartPctOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '70%' } },
  xaxis: { title: { text: 'Persentase (%)' } },
  yaxis: { labels: { maxWidth: 80 } },
  colors: getColors(buNames.value.length),
  dataLabels: { enabled: true, style: { fontSize: '10px' }, formatter: (v) => `${v.toFixed(1)}%` },
  legend: { position: 'bottom' },
  title: { text: 'Grafik Persentase Perbandingan Arsip Per BU Pertahun', align: 'center', style: { fontSize: '14px' } },
}));
const chartPctSeries = computed(() =>
  buNames.value.map(bu => ({
    name: bu,
    data: years.value.map(y => ({ x: String(y), y: getPct(y, bu) }))
  }))
);

onMounted(() => { getPageAkses(); loadData(); });
</script>


