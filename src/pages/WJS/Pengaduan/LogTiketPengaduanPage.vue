<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="history" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Log Tiket Pengaduan</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link to="/dms/pengaduan" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">Pengaduan</router-link>
              <q-icon name="chevron_right" size="14px"/>
              <span>Log Tiket</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4 tw-bg-blue-50 tw-shadow-sm">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
            <q-icon name="filter_alt" color="blue-6" size="24px"/>
            <span class="tw-font-bold tw-text-blue-900 tw-text-base">Filter Data</span>
          </div>
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
            <div>
              <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <q-icon name="confirmation_number" color="blue-6" size="18px"/>
                <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">No Tiket</span>
              </div>
              <q-input outlined dense v-model="noTiket" class="tw-bg-white tw-rounded-lg" @keyup.enter="loadData">
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Masukkan No Tiket</span></template>
              </q-input>
            </div>
          </div>
          <div class="tw-flex tw-gap-3 tw-pt-3">
            <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData"/>
          </div>
        </div>
        <div class="tw-mt-4 tw-mx-auto tw-w-[90%] tw-h-0.5 tw-bg-gradient-to-r tw-from-transparent tw-via-slate-300 tw-to-transparent"></div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table :rows="items" :columns="columns" row-key="trs_log_tgl" flat
          :loading="loading" :pagination="{ rowsPerPage: 0 }"
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">{{ props.value }}</q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { domain, empid, spinnerBall, decryptMessage } from "../../../utils";
import { Loading } from "quasar";
import { useRouter } from "vue-router";
import "../../../assets/styles/table.css";

const router = useRouter();
const loading = ref(false);
const items = ref([]);
const noTiket = ref('');

const tmpPage = reactive({ add: '0', edit: '0', delete: '0', view: '0', admin: '0' });

const columns = [
  { name: 'trs_log_no_tiket', label: 'Nomor Tiket', field: 'trs_log_no_tiket', align: 'left' },
  { name: 'trs_log_proses', label: 'Proses', field: 'trs_log_proses', align: 'left' },
  { name: 'trs_log_hasil', label: 'Hasil Proses', field: 'trs_log_hasil', align: 'left' },
  { name: 'account_name', label: 'PIC', field: 'account_name', align: 'left' },
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'center' }
];

const loadData = async () => {
  if (!noTiket.value) { items.value = []; return; }
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/log-tiket`, {
      params: { no_tiket: noTiket.value }, skipErrorInterceptor: true
    });
    items.value = res.data.data || res.data || [];
  } catch (e) { items.value = []; }
  loading.value = false;
};

onMounted(() => {
  getPageAkses();
});

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/pengaduan/log-tiket', domain: domain() }, skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
  } catch (error) { Loading.hide(); router.push('/404'); }
};
</script>


