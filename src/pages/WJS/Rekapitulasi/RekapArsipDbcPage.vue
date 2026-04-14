<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="stacked_bar_chart" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Grafik Arsip DBC</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Rekapitulasi</span><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Arsip DBC</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <RekapFilterSection
          v-model:filter-bu="filter.bu_id" v-model:filter-lokasi-arsip="filter.lokasi_arsip_id"
          v-model:filter-kategori="filter.kategori" v-model:filter-divisi="filter.divisi"
          v-model:filter-from="filter.from" v-model:filter-to="filter.to" v-model:filter-tipe="filter.tipe"
          :show-bu="false" :show-lokasi-arsip="false"
        >
          <template #actions>
            <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData"/>
          </template>
        </RekapFilterSection>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div v-if="rawData.length === 0 && !isLoading" class="tw-text-center tw-py-10 tw-text-slate-400">
          <q-icon name="stacked_bar_chart" size="48px" class="tw-mb-2"/>
          <div>Tidak ada data. Silakan ubah filter dan klik Tampilkan.</div>
        </div>
        <template v-if="rawData.length > 0">
          <!-- Cross-tab Table: BU rows × Month columns (Jumlah / %) -->
          <div class="tw-overflow-x-auto tw-mb-6">
            <div class="tw-font-bold tw-text-slate-700 tw-mb-2">
              Data Grafik Arsip DBC{{ filter.from && filter.to ? ` (Periode ${filter.from} s/d ${filter.to})` : '' }}
            </div>
            <table class="tw-w-full tw-border-collapse tw-text-sm">
              <thead>
                <tr>
                  <th rowspan="2" class="tw-bg-yellow-50 tw-border tw-px-3 tw-py-2 tw-text-center tw-font-bold">BU</th>
                  <th v-for="m in monthLabels" :key="m" colspan="2" class="tw-bg-yellow-50 tw-border tw-px-2 tw-py-1 tw-text-center">{{ m }}</th>
                </tr>
                <tr>
                  <template v-for="m in monthLabels" :key="'h2-'+m">
                    <th class="tw-bg-yellow-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs">JUMLAH</th>
                    <th class="tw-bg-yellow-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-text-xs">%</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bu in buNames" :key="bu">
                  <td class="tw-bg-yellow-50 tw-border tw-px-3 tw-py-1 tw-text-center">{{ bu }}</td>
                  <template v-for="m in months" :key="'v-'+bu+m">
                    <td class="tw-border tw-px-2 tw-py-1 tw-text-center">{{ getJumlah(bu, m) }}</td>
                    <td class="tw-border tw-px-2 tw-py-1 tw-text-center">{{ getPct(bu, m) }}</td>
                  </template>
                </tr>
                <!-- DBC total row -->
                <tr>
                  <td class="tw-bg-yellow-50 tw-border tw-px-3 tw-py-1 tw-text-center tw-font-bold">DBC</td>
                  <template v-for="m in months" :key="'dbc-'+m">
                    <td class="tw-bg-yellow-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ getMonthTotal(m) }}</td>
                    <td class="tw-bg-yellow-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">{{ getMonthTotalPct(m) }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Charts -->
          <div class="tw-space-y-6">
            <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4">
              <div class="tw-font-bold tw-text-slate-700 tw-mb-2">
                Grafik Data (Jumlah) Arsip DBC{{ filter.from && filter.to ? ` (Periode ${filter.from} s/d ${filter.to})` : '' }}
              </div>
              <apexchart :key="'j-'+chartKey" type="bar" :height="dynHeight" :options="chartJumlahOpts" :series="chartJumlahSeries"/>
            </div>
            <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4">
              <div class="tw-font-bold tw-text-slate-700 tw-mb-2">
                Grafik Data (Persen) Arsip DBC{{ filter.from && filter.to ? ` (Periode ${filter.from} s/d ${filter.to})` : '' }}
              </div>
              <apexchart :key="'p-'+chartKey" type="bar" :height="dynHeight" :options="chartPctOpts" :series="chartPctSeries"/>
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
const rawData = ref([]);
const chartKey = ref(0);
const isLoading = ref(false);

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/rekapitulasi/rekap-arsip-dbc', domain: domain() }
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
    const res = await axios.get(`${import.meta.env.VITE_API}dms/rekapitulasi/rekap-arsip-dbc`, {
      params: cleanParams({ ...filter, empid: empid() })
    });
    rawData.value = res.data.data || [];
    Loading.hide();
    isLoading.value = false;
    await nextTick();
    chartKey.value++;
  } catch (e) { Loading.hide(); isLoading.value = false; console.error(e); }
};

// Derive months (sorted) and BU names
const months = computed(() => {
  const seen = new Map();
  rawData.value.forEach(r => {
    const key = r.Month;
    if (key && !seen.has(key)) seen.set(key, r.MonthNum + (r.YearNum * 100));
  });
  return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(e => e[0]);
});
const monthLabels = computed(() =>
  months.value.map(m => {
    const row = rawData.value.find(r => r.Month === m);
    return row ? `${m} - ${row.YearNum}` : m;
  })
);
const buNames = computed(() => [...new Set(rawData.value.map(r => r.BUName).filter(Boolean))].sort());

// Table helpers
const findRow = (bu, m) => rawData.value.find(r => r.BUName === bu && r.Month === m);
const getJumlah = (bu, m) => { const r = findRow(bu, m); return r ? Number(r.Jumlah) || 0 : 0; };
const getPct = (bu, m) => { const r = findRow(bu, m); return r ? Number(Number(r.Percentage).toFixed(2)) : 0; };
const getMonthTotal = (m) => { const r = rawData.value.find(r2 => r2.Month === m); return r ? Number(r.TotalJumlah) || 0 : 0; };
const getMonthTotalPct = (m) => {
  const total = getMonthTotal(m);
  return total > 0 ? Number((buNames.value.reduce((s, bu) => s + getPct(bu, m), 0)).toFixed(2)) : 0;
};

// Chart height dynamic
const dynHeight = computed(() => calcHeight(monthLabels.value.length, 50, 150));

// Chart 1: Grouped bar — months on axis, each BU is a series (jumlah)
const chartJumlahOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '70%' } },
  xaxis: { title: { text: 'Jumlah' } },
  yaxis: { labels: { maxWidth: 120 } },
  colors: getColors(buNames.value.length),
  dataLabels: { enabled: false },
  legend: { position: 'bottom' },
  title: { text: 'Grafik Data (Jumlah) Arsip DBC', align: 'center', style: { fontSize: '14px' } },
}));
const chartJumlahSeries = computed(() =>
  buNames.value.map(bu => ({
    name: bu,
    data: monthLabels.value.map((label, i) => ({ x: label, y: getJumlah(bu, months.value[i]) }))
  }))
);

// Chart 2: Grouped bar — months on axis, each BU is a series (percentage)
const chartPctOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '70%' } },
  xaxis: { title: { text: 'Persentase (%)' } },
  yaxis: { labels: { maxWidth: 120 } },
  colors: getColors(buNames.value.length),
  dataLabels: { enabled: false },
  legend: { position: 'bottom' },
  title: { text: 'Grafik Data (Persen) Arsip DBC', align: 'center', style: { fontSize: '14px' } },
  tooltip: { y: { formatter: (v) => `${v.toFixed(2)}%` } },
}));
const chartPctSeries = computed(() =>
  buNames.value.map(bu => ({
    name: bu,
    data: monthLabels.value.map((label, i) => ({ x: label, y: getPct(bu, months.value[i]) }))
  }))
);

onMounted(() => { getPageAkses(); loadData(); });
</script>


