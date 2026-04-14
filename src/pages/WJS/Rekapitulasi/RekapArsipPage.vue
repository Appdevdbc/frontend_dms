<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="bar_chart" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Grafik Rekap Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Rekapitulasi</span>
              <q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Rekap Arsip</span>
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
        <div v-if="dataKategori.length === 0 && dataBu.length === 0 && !isLoading"
          class="tw-text-center tw-py-10 tw-text-slate-400">
          <q-icon name="bar_chart" size="48px" class="tw-mb-2"/>
          <div>Tidak ada data. Silakan ubah filter dan klik Tampilkan.</div>
        </div>
        <div v-if="dataKategori.length > 0 || dataBu.length > 0"
          class="tw-space-y-6">
          <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4">
            <apexchart v-if="dataKategori.length > 0" :key="'kat-'+chartKey"
              type="bar" :height="dynChartHeight(dataKategori)" :options="chartKategoriOpts" :series="chartKategoriSeries"/>
            <div v-else class="tw-text-center tw-py-8 tw-text-slate-400">Tidak ada data kategori</div>
          </div>
          <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-4">
            <apexchart v-if="dataBu.length > 0" :key="'bu-'+chartKey"
              type="bar" :height="dynChartHeight(dataBu)" :options="chartBuOpts" :series="chartBuSeries"/>
            <div v-else class="tw-text-center tw-py-8 tw-text-slate-400">Tidak ada data BU</div>
          </div>
        </div>
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
const tmpPage = reactive({ add:'0', edit:'0', delete:'0', view:'0', admin:'0' });
const filter = reactive({
  bu_id: null, lokasi_arsip_id: null, kategori: null,
  divisi: null, from: null, to: null, tipe: null,
});
const dataKategori = ref([]);
const dataBu = ref([]);
const chartKey = ref(0);
const isLoading = ref(false);

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/rekapitulasi/rekap-arsip', domain: domain() }
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
  } catch (error) { Loading.hide(); }
};

const cleanParams = (obj) => {
  const cleaned = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v != null && v !== '') cleaned[k] = v;
  }
  return cleaned;
};

const loadData = async () => {
  try {
    isLoading.value = true;
    spinnerBall();
    const params = cleanParams({ ...filter, empid: empid() });
    const [resKat, resBu] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}dms/rekapitulasi/rekap-arsip`, { params: { ...params, tipe_grafik: 'kategori' } }),
      axios.get(`${import.meta.env.VITE_API}dms/rekapitulasi/rekap-arsip`, { params: { ...params, tipe_grafik: 'BU' } }),
    ]);
    dataKategori.value = resKat.data.data || [];
    dataBu.value = resBu.data.data || [];
    Loading.hide();
    isLoading.value = false;
    await nextTick();
    chartKey.value++;
  } catch (e) { Loading.hide(); isLoading.value = false; console.error(e); }
};

const { getColors, chartHeight: calcHeight } = useChartColors();

const dynChartHeight = (data) => calcHeight(data.length);

const chartKategoriOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%', distributed: true } },
  xaxis: { title: { text: 'Jumlah' } },
  yaxis: { labels: { maxWidth: 250 } },
  colors: getColors(dataKategori.value.length),
  dataLabels: { enabled: true, style: { fontWeight: 'bold' } },
  legend: { show: false },
  title: { text: 'Rekap Arsip Legal Perbulan', align: 'center', style: { fontSize: '14px' } },
}));
const chartKategoriSeries = computed(() => [
  { name: 'Jumlah', data: dataKategori.value.map(d => ({ x: d.kategori || '', y: Number(d.jumlah) || 0 })) }
]);

const chartBuOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%', distributed: true } },
  xaxis: { title: { text: 'Jumlah' } },
  yaxis: { labels: { maxWidth: 250 } },
  colors: getColors(dataBu.value.length),
  dataLabels: { enabled: true, style: { fontWeight: 'bold' } },
  legend: { show: false },
  title: { text: 'Rekap Data All BU Perbulan', align: 'center', style: { fontSize: '14px' } },
}));
const chartBuSeries = computed(() => [
  { name: 'Jumlah', data: dataBu.value.map(d => ({ x: d.bu_name || '', y: Number(d.jumlah) || 0 })) }
]);

onMounted(() => { getPageAkses(); loadData(); });
</script>


