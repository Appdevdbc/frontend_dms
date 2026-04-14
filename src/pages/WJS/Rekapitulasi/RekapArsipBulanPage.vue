<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="show_chart" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Grafik Rekap Arsip Perbulan</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Rekapitulasi</span><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Rekap Arsip Perbulan</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <RekapFilterSection
          v-model:filter-bu="filter.bu_id" v-model:filter-lokasi-arsip="filter.lokasi_arsip_id"
          v-model:filter-kategori="filter.kategori" v-model:filter-divisi="filter.divisi"
          v-model:filter-from="filter.from" v-model:filter-to="filter.to" v-model:filter-tipe="filter.tipe"
        >
          <template #actions>
            <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData"/>
          </template>
        </RekapFilterSection>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div v-if="tableData.length === 0 && !isLoading" class="tw-text-center tw-py-10 tw-text-slate-400">
          <q-icon name="show_chart" size="48px" class="tw-mb-2"/>
          <div>Tidak ada data. Silakan ubah filter dan klik Tampilkan.</div>
        </div>
        <template v-if="tableData.length > 0">
          <!-- Horizontal Table (3 rows: BULAN, JUMLAH, PERSENTASE) -->
          <div class="tw-overflow-x-auto tw-mb-6">
            <div class="tw-font-bold tw-text-slate-700 tw-mb-2">{{ tableTitle }}</div>
            <table class="tw-w-full tw-border-collapse tw-text-sm">
              <tr>
                <td class="tw-bg-yellow-50 tw-border tw-px-3 tw-py-2 tw-text-center tw-font-bold">BULAN</td>
                <td v-for="d in tableData" :key="'b-'+d.idx"
                  class="tw-bg-yellow-50 tw-border tw-px-2 tw-py-1 tw-text-center tw-font-bold">
                  {{ d.BULANNAMA }} - {{ d.TAHUN }}
                </td>
              </tr>
              <tr>
                <td class="tw-bg-yellow-50 tw-border tw-px-3 tw-py-2 tw-text-center tw-font-bold">JUMLAH ARSIP</td>
                <td v-for="d in tableData" :key="'j-'+d.idx" class="tw-border tw-px-2 tw-py-1 tw-text-center">
                  {{ d.JUMLAH_ARSIP }}
                </td>
              </tr>
              <tr>
                <td class="tw-bg-yellow-50 tw-border tw-px-3 tw-py-2 tw-text-center tw-font-bold">PERSENTASE PERUBAHAN</td>
                <td v-for="d in tableData" :key="'p-'+d.idx" class="tw-border tw-px-2 tw-py-1 tw-text-center">
                  {{ Number(d.PERSENTASE_PERUBAHAN).toFixed(2) }}%
                </td>
              </tr>
            </table>
          </div>
          <!-- Chart: Jumlah + Persentase (horizontal grouped bar) -->
          <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4">
            <apexchart :key="chartKey" type="bar" :height="dynHeight" :options="chartOpts" :series="chartSeries"/>
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
import { useNotify } from '../../../composables/useNotify';
import RekapFilterSection from '../../../components/WJS/Rekapitulasi/RekapFilterSection.vue';
import { useChartColors } from '../../../composables/useChartColors';

const router = useRouter();
const { error: showError } = useNotify();
const tmpPage = reactive({ add:'0', edit:'0', delete:'0', view:'0', admin:'0' });
const filter = reactive({ bu_id:null, lokasi_arsip_id:null, kategori:null, divisi:null, from:null, to:null, tipe:null });
const tableData = ref([]);
const chartKey = ref(0);
const isLoading = ref(false);

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/rekapitulasi/rekap-arsip-bulan', domain: domain() }
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
    const res = await axios.get(`${import.meta.env.VITE_API}dms/rekapitulasi/rekap-arsip-bulan`, {
      params: cleanParams({ ...filter, empid: empid() })
    });
    const raw = res.data.data || [];
    tableData.value = raw.map((r, i) => ({ ...r, idx: i }));
    Loading.hide();
    isLoading.value = false;
    await nextTick();
    chartKey.value++;
  } catch (e) { Loading.hide(); isLoading.value = false; console.error(e); }
};

// Dynamic title like PHP
const tableTitle = computed(() => {
  let buLabel = 'All BU';
  if (filter.bu_id) {
    const firstRow = tableData.value.length > 0 ? tableData.value[0] : null;
    if (firstRow && (firstRow.BU_NAME || firstRow.bu_name)) {
      buLabel = firstRow.BU_NAME || firstRow.bu_name;
    }
  }
  const period = filter.from && filter.to ? ` (Periode ${filter.from} s/d ${filter.to})` : '';
  return `Data Perubahan Jumlah Arsip ${buLabel}${period}`;
});
const chartTitle = computed(() => tableTitle.value.replace('Data', 'Grafik'));

const { getColors, chartHeight: calcHeight } = useChartColors();

const monthLabels = computed(() => tableData.value.map(d => `${d.BULANNAMA} - ${d.TAHUN}`));
const dynHeight = computed(() => calcHeight(tableData.value.length, 50, 150));

const chartOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '70%' } },
  xaxis: { title: { text: '' } },
  yaxis: { labels: { maxWidth: 120 } },
  colors: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 159, 64, 0.8)'],
  dataLabels: { enabled: true, style: { fontSize: '10px' } },
  legend: { position: 'bottom' },
  title: { text: chartTitle.value, align: 'center', style: { fontSize: '14px' } },
  tooltip: {
    y: { formatter: (val, opts) => opts.seriesIndex === 1 ? `${val}%` : val }
  },
}));
const chartSeries = computed(() => [
  { name: 'Jumlah Arsip', data: tableData.value.map((d, i) => ({ x: monthLabels.value[i], y: Number(d.JUMLAH_ARSIP) || 0 })) },
  { name: 'Persentase Perubahan (%)', data: tableData.value.map((d, i) => ({ x: monthLabels.value[i], y: Number(d.PERSENTASE_PERUBAHAN) || 0 })) },
]);

onMounted(() => { getPageAkses(); loadData(); });
</script>


