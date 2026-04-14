<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="manage_search" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Riwayat Pengaduan</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link to="/dms/pengaduan" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">Pengaduan</router-link>
              <q-icon name="chevron_right" size="14px"/>
              <span>Riwayat</span>
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
          <div class="tw-space-y-3">
            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-3">
              <div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="business" color="blue-6" size="18px"/>
                  <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Bisnis Unit</span>
                </div>
                <q-select outlined dense v-model="filter.bu_id" :options="buOptions" option-value="bu_id"
                  option-label="bu_name" emit-value map-options clearable class="tw-bg-white tw-rounded-lg"
                  @update:model-value="onBUChange"/>
              </div>
              <div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="location_on" color="blue-6" size="18px"/>
                  <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Lokasi Arsip</span>
                </div>
                <q-select outlined dense v-model="filter.lokasi_arsip_id" :options="lokasiOptions"
                  option-value="lokasi_arsip_id" option-label="lokasi_arsip_name" emit-value map-options
                  clearable class="tw-bg-white tw-rounded-lg"/>
              </div>
              <div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="event" color="blue-6" size="18px"/>
                  <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Mulai Tanggal</span>
                </div>
                <q-input outlined dense v-model="filter.from" type="date" class="tw-bg-white tw-rounded-lg"/>
              </div>
              <div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="event" color="blue-6" size="18px"/>
                  <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Sampai</span>
                </div>
                <q-input outlined dense v-model="filter.to" type="date" class="tw-bg-white tw-rounded-lg"/>
              </div>
            </div>
            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
              <div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="confirmation_number" color="blue-6" size="18px"/>
                  <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">No. Pengaduan</span>
                </div>
                <q-input outlined dense v-model="filter.no_tiket" class="tw-bg-white tw-rounded-lg"/>
              </div>
              <div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="category" color="blue-6" size="18px"/>
                  <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Kategori Pengaduan</span>
                </div>
                <q-select outlined dense v-model="filter.kategori" :options="['Hilang','Rusak']"
                  clearable class="tw-bg-white tw-rounded-lg"/>
              </div>
              <div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="flag" color="blue-6" size="18px"/>
                  <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Status Pengaduan</span>
                </div>
                <q-select outlined dense v-model="filter.status" :options="statusOptions"
                  clearable class="tw-bg-white tw-rounded-lg"/>
              </div>
            </div>
            <div class="tw-flex tw-gap-3 tw-pt-2">
              <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
                class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="updateTable"/>
              <q-btn unelevated color="green-7" label="Excel" icon="download"
                class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="downloadExcel"/>
              <q-btn unelevated color="blue-8" label="PDF" icon="picture_as_pdf"
                class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="printPDF"/>
            </div>
          </div>
        </div>
        <div class="tw-mt-4 tw-mx-auto tw-w-[90%] tw-h-0.5 tw-bg-gradient-to-r tw-from-transparent tw-via-slate-300 tw-to-transparent"></div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table :rows="items" :columns="columns" row-key="tr_no_adu"
          v-model:pagination="pagination" :loading="loading" :filter="pagination.filter"
          :rows-per-page-options="[]" @request="onRequest" binary-state-sort flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px"/>
              <q-select borderless dense v-model="pagination.rowsPerPage"
                :options="[5,10,25,50,100,'All']" @update:modelValue="updateTable" class="tw-min-w-[80px]"/>
            </div>
          </template>
          <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="pagination.filter" placeholder="Search ..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]">
              <template v-slot:prepend><q-icon name="search" color="blue-6"/></template>
            </q-input>
          </template>
          <template v-slot:body-cell-tr_adu_status="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge :color="getStatusColor(props.row.tr_adu_status)" :label="props.row.tr_adu_status"
                class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"/>
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">{{ props.value }}</q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- PDF Preview Dialog -->
    <q-dialog v-model="showPdfDialog" maximized>
      <q-card>
        <q-card-section :class="`bg-${domain()} tw-text-white tw-py-4`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="picture_as_pdf" size="32px"/>
              <div class="tw-text-xl tw-font-bold">Riwayat Pengaduan - PDF</div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showPdfDialog = false"/>
          </div>
        </q-card-section>
        <q-card-section class="tw-p-0" style="height: calc(100vh - 80px);">
          <iframe :src="pdfUrl" style="width: 100%; height: 100%; border: none;"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { domain, empid, spinnerBall, decryptMessage } from "../../../utils";
import { useRouter } from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import { Loading } from "quasar";
import "../../../assets/styles/table.css";

const router = useRouter();
const { error: showError } = useNotify();
const loading = ref(false);
const items = ref([]);
const buOptions = ref([]);
const lokasiOptions = ref([]);
const showPdfDialog = ref(false);
const pdfUrl = ref('');

const tmpPage = reactive({ add: '0', edit: '0', delete: '0', view: '0', admin: '0' });

const statusOptions = [
  'Masih menunggu persetujuan atasan dokumen owner',
  'Menunggu persetujuan corporate legal SH',
  'Menunggu persetujuan corporate legal DH',
  'Pengaduan diterima dan sedang diproses',
  'Pengaduan ditolak',
  'Selesai'
];

const statusColorMap = {
  'Masih menunggu persetujuan atasan dokumen owner': 'orange-6',
  'Menunggu persetujuan corporate legal SH': 'blue-6',
  'Menunggu persetujuan corporate legal DH': 'blue-8',
  'Pengaduan diterima dan sedang diproses': 'purple-6',
  'Selesai': 'green-6',
  'Pengaduan ditolak': 'red-6'
};
const getStatusColor = (s) => statusColorMap[s] || 'grey-6';

const filter = reactive({
  bu_id: null, lokasi_arsip_id: null, from: '', to: '',
  no_tiket: '', kategori: null, status: null
});

const pagination = ref({
  sortBy: 'tr_tgl_adu', descending: true, page: 1, rowsPerPage: 10, rowsNumber: 0, filter: null
});

const columns = [
  { name: 'tr_no_adu', label: 'No. Pengaduan', field: 'tr_no_adu', align: 'left', sortable: true },
  { name: 'tr_tgl_adu_format', label: 'Tanggal', field: 'tr_tgl_adu_format', align: 'center' },
  { name: 'tr_adu_judul', label: 'Judul Pengaduan', field: 'tr_adu_judul', align: 'left', sortable: true },
  { name: 'tr_adu_kategori', label: 'Kategori', field: 'tr_adu_kategori', align: 'center' },
  { name: 'tr_adu_status', label: 'Status', field: 'tr_adu_status', align: 'left' }
];

const loadBU = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/getBU`);
    buOptions.value = res.data;
  } catch (e) { /* ignore */ }
};

const onBUChange = async (val) => {
  lokasiOptions.value = [];
  filter.lokasi_arsip_id = null;
  if (!val) return;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/getLokasiArsipByBU`, { params: { bu_id: val } });
    lokasiOptions.value = res.data;
  } catch (e) { /* ignore */ }
};

const loadData = async () => {
  try {
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
      pagination.value.rowsPerPage = pagination.value.rowsNumber;

    const res = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/riwayat`, {
      params: {
        ...filter,
        page: pagination.value.page, rowsPerPage: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy, descending: pagination.value.descending
      }, skipErrorInterceptor: true
    });

    if (typeof res.data.data === "undefined") {
      items.value = res.data;
    } else {
      items.value = res.data.data;
    }
    pagination.value.rowsNumber = res.data.pagination?.total || 0;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Terjadi kesalahan');
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter: f } = props.pagination;
  pagination.value.filter = f;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loadData();
};

const updateTable = () => { onRequest({ pagination: pagination.value }); };

const downloadExcel = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/riwayat/export-excel`, {
      params: { ...filter },
      responseType: 'blob',
      skipErrorInterceptor: true
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Riwayat_Pengaduan.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    showError(e?.message || 'Gagal mengunduh Excel');
  }
};

const printPDF = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/riwayat/export-pdf`, {
      params: { ...filter }, skipErrorInterceptor: true
    });
    const filename = res.data.data.filename;
    pdfUrl.value = `${import.meta.env.VITE_API}pdf/${filename}`;
    showPdfDialog.value = true;
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal generate PDF');
  }
};

onMounted(() => {
  getPageAkses();
  loadBU();
  onRequest({ pagination: pagination.value });
});

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/pengaduan/riwayat', domain: domain() }, skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
  } catch (error) { Loading.hide(); router.push('/404'); }
};
</script>


