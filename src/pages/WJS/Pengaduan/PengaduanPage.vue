<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="report_problem" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Pengaduan</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link to="/dms/pengaduan" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Pengaduan
              </router-link>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <FilterSection
          v-model:filter-bu="filterBu"
          v-model:filter-lokasi-arsip="filterLokasiArsip"
          v-model:filter-tgl-awal="filterTglAwal"
          v-model:filter-tgl-akhir="filterTglAkhir"
        >
          <template #actions>
            <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="updateTable"/>
          </template>
        </FilterSection>
        <div class="tw-mt-4 tw-mx-auto tw-w-[90%] tw-h-0.5 tw-bg-gradient-to-r tw-from-transparent tw-via-slate-300 tw-to-transparent"></div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          v-if="tmpPage.view=='1'"
          :rows="items"
          :columns="columns"
          row-key="tr_no_adu"
          v-model:pagination="pagination"
          :loading="loading"
          :filter="pagination.filter"
          :rows-per-page-options="[]"
          @request="onRequest"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="[`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`,
                  col.name === 'aksi' ? 'sticky-column-left-header' : '']">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px">
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
              </q-icon>
              <q-select borderless dense v-model="pagination.rowsPerPage"
                :options="[5,10,25,50,100,'All']" @update:modelValue="updateTable" class="tw-min-w-[80px]"/>
            </div>
          </template>
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn v-if="tmpPage.add=='1'" unelevated color="blue-6" label="Buat Tiket" icon="add"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
                @click="openCreateDialog"/>
              <q-input outlined dense debounce="300" v-model="pagination.filter" placeholder="Search ..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]">
                <template v-slot:prepend><q-icon name="search" color="blue-6"/></template>
              </q-input>
            </div>
          </template>
          <template v-slot:body-cell-tr_adu_status="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge :color="getStatusColor(props.row.tr_adu_status)" :label="props.row.tr_adu_status"
                class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"/>
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3 sticky-column-left">
              <div class="tw-flex tw-gap-2">
                <q-btn round dense color="blue-6" icon="visibility" size="sm" @click="viewDetail(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Lihat</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_approve_atasan || props.row.can_approve_legal_sh || props.row.can_approve_legal_dh"
                  round dense color="green-6" icon="check_circle" size="sm" @click="approveTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Approve</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_approve_atasan || props.row.can_approve_legal_sh || props.row.can_approve_legal_dh"
                  round dense color="red-6" icon="cancel" size="sm" @click="rejectTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">{{ props.row.can_approve_atasan ? 'Revisi' : 'Tolak' }}</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_selesai"
                  round dense color="purple-6" icon="task_alt" size="sm" @click="viewDetail(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Selesai</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_revise"
                  round dense color="orange-6" icon="edit" size="sm" @click="viewDetail(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Revisi</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">{{ props.value }}</q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <PengaduanFormDialog v-model="showCreateDialog" @saved="updateTable"/>

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
        <q-card-section class="tw-bg-gradient-to-r tw-from-green-500 tw-to-green-600 tw-text-white tw-py-4">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="check_circle" size="32px"/>
              <div>
                <div class="tw-text-xl tw-font-bold">Approve Pengaduan</div>
                <div class="tw-text-sm tw-opacity-90">{{ selectedTicket?.tr_no_adu }}</div>
              </div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showApproveDialog = false" :disable="dialogLoading"/>
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
            <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
              <div><span class="tw-text-slate-600">Judul:</span> <span class="tw-ml-2 tw-font-semibold">{{ selectedTicket?.tr_adu_judul }}</span></div>
              <div><span class="tw-text-slate-600">Kategori:</span> <span class="tw-ml-2 tw-font-semibold">{{ selectedTicket?.tr_adu_kategori }}</span></div>
              <div><span class="tw-text-slate-600">Status:</span> <span class="tw-ml-2 tw-font-semibold">{{ selectedTicket?.tr_adu_status }}</span></div>
            </div>
          </div>
          <div class="tw-p-4 tw-bg-yellow-50 tw-rounded-lg tw-border tw-border-yellow-200">
            <div class="tw-flex tw-items-start tw-gap-3">
              <q-icon name="info" color="yellow-700" size="24px"/>
              <div class="tw-text-sm tw-text-yellow-800">
                <div class="tw-font-semibold tw-mb-1">Konfirmasi Approval</div>
                <div>Apakah Anda yakin ingin menyetujui pengaduan ini?</div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
          <q-btn unelevated color="grey-6" label="Batal" icon="close" @click="showApproveDialog = false" :disable="dialogLoading"/>
          <q-btn unelevated color="green-6" label="Konfirmasi" icon="check" @click="handleDialogApprove" :loading="dialogLoading"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
        <q-card-section class="tw-bg-gradient-to-r tw-from-red-500 tw-to-red-600 tw-text-white tw-py-4">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="cancel" size="32px"/>
              <div>
                <div class="tw-text-xl tw-font-bold">{{ selectedTicket?.can_approve_atasan ? 'Revisi' : 'Tolak' }} Pengaduan</div>
                <div class="tw-text-sm tw-opacity-90">{{ selectedTicket?.tr_no_adu }}</div>
              </div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showRejectDialog = false" :disable="dialogLoading"/>
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <q-input v-model="dialogReason" outlined type="textarea" rows="4" label-slot counter maxlength="300">
            <template v-slot:prepend><q-icon name="note" color="red-6"/></template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
          <q-btn unelevated color="grey-6" label="Batal" icon="close" @click="showRejectDialog = false" :disable="dialogLoading"/>
          <q-btn unelevated color="red-6" :label="selectedTicket?.can_approve_atasan ? 'Revisi' : 'Tolak'" icon="cancel" @click="handleDialogReject" :loading="dialogLoading"/>
        </q-card-actions>
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
import FilterSection from "../../../components/WJS/FilterSection.vue";
import PengaduanFormDialog from "../../../components/WJS/Pengaduan/PengaduanFormDialog.vue";
import "../../../assets/styles/table.css";

const router = useRouter();
const { success, error: showError } = useNotify();
const loading = ref(false);
const items = ref([]);
const showCreateDialog = ref(false);
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const selectedTicket = ref(null);
const dialogCatatan = ref('');
const dialogReason = ref('');
const dialogLoading = ref(false);

const filterBu = ref(null);
const filterLokasiArsip = ref(null);
const filterTglAwal = ref(null);
const filterTglAkhir = ref(null);

const tmpPage = reactive({ add: '0', edit: '0', delete: '0', view: '0', admin: '0' });

const pagination = ref({
  sortBy: 'tr_tgl_adu', descending: true, page: 1, rowsPerPage: 10, rowsNumber: 0, filter: null,
  domain: domain(), empid: empid()
});

const statusColorMap = {
  'Masih menunggu persetujuan atasan dokumen owner': 'orange-6',
  'Menunggu persetujuan corporate legal SH': 'blue-6',
  'Menunggu persetujuan corporate legal DH': 'blue-8',
  'Pengaduan diterima dan sedang diproses': 'purple-6',
  'Selesai': 'green-6',
  'Pengaduan ditolak': 'red-6'
};
const getStatusColor = (s) => statusColorMap[s] || 'grey-6';

const columns = [
  { name: 'aksi', label: 'Aksi', align: 'left', field: 'aksi', classes: 'sticky-column-left', headerClasses: 'sticky-column-left-header' },
  { name: 'tr_no_adu', label: 'Nomor Tiket', field: 'tr_no_adu', align: 'left', sortable: true },
  { name: 'tr_tgl_adu', label: 'Tanggal Pengaduan', field: 'tr_tgl_adu', align: 'left', sortable: true,
    format: v => {
      if (!v) return '-';
      const d = new Date(v);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}/${d.getFullYear()}`;
    } },
  { name: 'tr_adu_kategori', label: 'Kategori Pengaduan', field: 'tr_adu_kategori', align: 'left', sortable: true },
  { name: 'tr_adu_judul', label: 'Judul Pengaduan', field: 'tr_adu_judul', align: 'left', sortable: true },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left', sortable: true },
  { name: 'arsip_no', label: 'Kode Arsip', field: 'arsip_no', align: 'left', sortable: true },
  { name: 'tr_adu_no_doc', label: 'Nomor Dokumen', field: 'tr_adu_no_doc', align: 'left', sortable: true },
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', field: 'lokasi_arsip_name', align: 'left', sortable: true },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left', sortable: true },
  { name: 'arsip_kat', label: 'Kategori Dokumen', field: 'arsip_kat', align: 'left', sortable: true },
  { name: 'tr_adu_status', label: 'Status', field: 'tr_adu_status', align: 'left' }
];

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: '/dms/pengaduan', domain: domain() }, skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
  } catch (error) { Loading.hide(); router.push('/404'); }
};

const loadData = async () => {
  try {
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
      pagination.value.rowsPerPage = pagination.value.rowsNumber;

    const res = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan`, {
      params: {
        ...pagination.value,
        creator: empid(),
        bu_id: filterBu.value,
        lokasi_arsip_id: filterLokasiArsip.value,
        from: filterTglAwal.value,
        to: filterTglAkhir.value
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
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loadData();
};

const updateTable = () => { onRequest({ pagination: pagination.value }); };
const viewDetail = (row) => { router.push(`/dms/pengaduan/${row.tr_adu_id}`); };
const openCreateDialog = () => { showCreateDialog.value = true; };

const approveTicket = (row) => {
  selectedTicket.value = row;
  dialogCatatan.value = '';
  showApproveDialog.value = true;
};

const rejectTicket = (row) => {
  selectedTicket.value = row;
  dialogReason.value = '';
  showRejectDialog.value = true;
};

const getApproveUrl = (row) => {
  const base = `${import.meta.env.VITE_API}dms/pengaduan/${row.tr_adu_id}`;
  if (row.can_approve_atasan) return `${base}/approve-atasan`;
  if (row.can_approve_legal_sh) return `${base}/approve-legal-sh`;
  if (row.can_approve_legal_dh) return `${base}/approve-legal-dh`;
  return '';
};

const getRejectUrl = (row) => {
  const base = `${import.meta.env.VITE_API}dms/pengaduan/${row.tr_adu_id}`;
  if (row.can_approve_atasan) return `${base}/reject-atasan`;
  if (row.can_approve_legal_sh) return `${base}/reject-legal-sh`;
  if (row.can_approve_legal_dh) return `${base}/reject-legal-dh`;
  return '';
};

const handleDialogApprove = async () => {
  dialogLoading.value = true;
  try {
    await axios.post(getApproveUrl(selectedTicket.value), {
      creator: empid(), catatan: dialogCatatan.value
    }, { skipErrorInterceptor: true });
    showApproveDialog.value = false;
    success('Pengaduan berhasil diproses');
    updateTable();
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal memproses');
  }
  dialogLoading.value = false;
};

const handleDialogReject = async () => {
  if (!dialogReason.value?.trim()) { showError('Alasan wajib diisi'); return; }
  dialogLoading.value = true;
  try {
    await axios.post(getRejectUrl(selectedTicket.value), {
      creator: empid(), reason: dialogReason.value
    }, { skipErrorInterceptor: true });
    showRejectDialog.value = false;
    success('Pengaduan berhasil diproses');
    updateTable();
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal memproses');
  }
  dialogLoading.value = false;
};

onMounted(() => {
  getPageAkses();
  const now = new Date();
  filterTglAwal.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  filterTglAkhir.value = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  onRequest({ pagination: pagination.value });
});
</script>


