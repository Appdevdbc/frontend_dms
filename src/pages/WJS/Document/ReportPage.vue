<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assessment" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">DMS Report</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Document</span><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Report</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div v-if="reportData.length === 0 && !isLoading" class="tw-text-center tw-py-16 tw-px-6">
          <div class="tw-bg-gradient-to-br tw-from-slate-50 tw-to-slate-100 tw-rounded-2xl tw-p-12 tw-shadow-inner">
            <div class="tw-bg-slate-200 tw-rounded-full tw-w-24 tw-h-24 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <q-icon name="assessment" size="48px" class="tw-text-slate-400"/>
            </div>
            <div class="tw-text-slate-500 tw-font-semibold tw-text-lg">Tidak ada data tersedia</div>
            <div class="tw-text-slate-400 tw-text-sm tw-mt-2">Data report akan muncul di sini</div>
          </div>
        </div>
        <template v-if="reportData.length > 0">
          <div class="tw-flex tw-gap-6">
            <!-- Chart -->
            <div class="tw-flex-1 tw-bg-gradient-to-br tw-from-white tw-to-blue-50 tw-rounded-xl tw-shadow-lg tw-p-6 tw-border tw-border-blue-100">
              <div class="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                <div class="tw-bg-blue-500 tw-rounded-lg tw-p-2">
                  <q-icon name="bar_chart" size="24px" class="tw-text-white"/>
                </div>
                <div class="tw-font-bold tw-text-xl tw-text-slate-800">Grafik Status DMS Compliance</div>
              </div>
              <apexchart :key="chartKey" type="bar" :height="dynHeight" :options="chartOpts" :series="chartSeries"/>
              <div class="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-xs tw-text-slate-500 tw-mt-4 tw-pt-3 tw-border-t tw-border-blue-100">
                <q-icon name="print" size="14px"/>
                <span>Printed on {{ new Date().toLocaleString('id-ID') }}</span>
              </div>
            </div>
            <!-- Target Form -->
            <div v-if="tmpPage.edit === '1'" class="tw-w-[420px] tw-shrink-0">
              <div class="tw-bg-gradient-to-br tw-from-green-50 tw-to-emerald-50 tw-rounded-xl tw-shadow-lg tw-p-6 tw-h-full tw-flex tw-flex-col tw-border tw-border-green-200">
                <div class="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                  <div class="tw-bg-green-500 tw-rounded-lg tw-p-2">
                    <q-icon name="flag" size="20px" class="tw-text-white"/>
                  </div>
                  <div class="tw-font-bold tw-text-lg tw-text-slate-800">Set Target per BU</div>
                </div>
                <div class="tw-flex-1 tw-overflow-y-auto tw-max-h-[600px] tw-bg-white tw-rounded-lg tw-p-3 tw-shadow-inner">
                  <table class="tw-w-full tw-text-sm">
                    <thead>
                      <tr class="tw-bg-gradient-to-r tw-from-green-100 tw-to-emerald-100">
                        <th class="tw-text-left tw-py-3 tw-px-3 tw-text-xs tw-text-green-800 tw-font-bold tw-rounded-tl-lg">Bisnis Unit</th>
                        <th class="tw-text-right tw-py-3 tw-px-3 tw-text-xs tw-text-green-800 tw-font-bold tw-w-24 tw-rounded-tr-lg">Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in reportData" :key="item.bu_id" class="tw-border-b tw-border-slate-100 hover:tw-bg-green-50 tw-transition-colors">
                        <td class="tw-py-2 tw-px-3 tw-text-xs tw-font-medium tw-text-slate-700">{{ item.bu_name }}</td>
                        <td class="tw-py-2 tw-px-3">
                          <q-input outlined dense v-model.number="targetForm[item.bu_id]" type="number"
                            input-class="tw-text-right tw-text-xs tw-font-semibold" class="tw-w-24"/>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <q-btn unelevated color="green-6" label="Submit Target" icon="save"
                  class="tw-font-semibold tw-mt-4 tw-w-full tw-rounded-lg tw-shadow-md hover:tw-shadow-lg tw-transition-shadow" @click="saveTargets"/>
              </div>
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import { Loading } from 'quasar';
import { spinnerBall, decryptMessage, empid, domain } from '../../../utils';
import { useNotify } from '../../../composables/useNotify';
import { useChartColors } from '../../../composables/useChartColors';

const { success, error: showError } = useNotify();
const { chartHeight: calcHeight } = useChartColors();
const reportData = ref([]);
const targetForm = reactive({});
const chartKey = ref(0);
const isLoading = ref(false);
const tmpPage = reactive({ add:'0', edit:'0', delete:'0', view:'0', admin:'0' });
const showTargetPanel = ref(true);

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/document/report', domain: domain() }
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    tmpPage.admin = decryptMessage(res.data.admin);
    console.log(tmpPage)
    Loading.hide();
  } catch (error) { Loading.hide(); }
};

const loadData = async () => {
  try {
    isLoading.value = true;
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/report-compliance`);
    const raw = res.data.data || res.data || [];
    reportData.value = raw.filter(r => r.bu_name && r.bu_name.trim() !== '');
    reportData.value.forEach(r => { targetForm[r.bu_id] = Number(r.target) || 0; });
    Loading.hide();
    isLoading.value = false;
    await nextTick();
    chartKey.value++;
  } catch (e) { Loading.hide(); isLoading.value = false; console.error(e); }
};

const saveTargets = async () => {
  try {
    spinnerBall();
    await axios.post(`${import.meta.env.VITE_API}dms/document/report-compliance/target`, { targets: targetForm });
    success('Data berhasil diubah');
    Loading.hide();
    loadData();
  } catch (e) { Loading.hide(); showError('Gagal mengubah data'); console.error(e); }
};

const dynHeight = computed(() => calcHeight(reportData.value.length, 40, 120));

const chartOpts = computed(() => ({
  chart: { type: 'bar', toolbar: { show: true } },
  plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '70%' } },
  xaxis: { title: { text: '' } },
  yaxis: { labels: { maxWidth: 250 } },
  colors: ['orange', 'blue'],
  dataLabels: { enabled: true, style: { fontSize: '10px' } },
  legend: { position: 'bottom' },
}));

const chartSeries = computed(() => {
  const labels = reportData.value.map(r => {
    const target = Number(r.target) || 0;
    const actual = Number(r.actual) || 0;
    const pct = target > 0 ? ((actual / target) * 100).toFixed(2) : '0';
    return `${r.bu_name} (${pct}%)`;
  });
  return [
    { name: 'Actual', data: reportData.value.map((r, i) => ({ x: labels[i], y: Number(r.actual) || 0 })) },
    { name: 'Expected', data: reportData.value.map((r, i) => ({ x: labels[i], y: Number(r.target) || 0 })) },
  ];
});

onMounted(() => { getPageAkses(); loadData(); });
</script>


