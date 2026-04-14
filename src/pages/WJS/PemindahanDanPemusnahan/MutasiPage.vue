<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="swap_horiz" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Mutasi Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/mutasi' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Mutasi Arsip
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
            <q-btn
              unelevated
              color="blue-6"
              label="Tampilkan"
              icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg"
              @click="updateTable"
            />
            <q-btn
              unelevated
              color="green-6"
              label="Excel"
              icon="download"
              class="tw-font-semibold tw-px-4 tw-rounded-lg"
              @click="downloadExcel"
            />
          </template>
        </FilterSection>
        <div class="tw-mt-4 tw-mx-auto tw-w-[90%] tw-h-0.5 tw-bg-gradient-to-r tw-from-transparent tw-via-slate-300 tw-to-transparent"></div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          v-if="tmpPage.view=='1'"
          :rows="mutasiList"
          :columns="columns"
          row-key="tr_arsip_id"
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
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="[
                  `bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`,
                  col.name === 'aksi' ? 'sticky-column-left-header' : ''
                ]"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px">
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
              </q-icon>
              <q-select
                borderless
                dense
                v-model="pagination.rowsPerPage"
                :options="[5,10,25,50,100,'All']"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn 
                v-if="tmpPage.add=='1'"
                unelevated
                color="blue-6"
                label="Tambah Data" 
                icon="add"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
                @click="createTicket" 
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search ..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>
          <template v-slot:body-cell-tr_status="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge 
                :color="getStatusColor(props.row.tr_status)" 
                :label="props.row.status_text"
                class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3 sticky-column-left">
              <div class="tw-flex tw-gap-2">
                <q-btn
                  v-if="props.row.can_view"
                  round
                  dense
                  color="blue-6"
                  icon="visibility"
                  size="sm"
                  @click="viewTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Lihat</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.can_approve"
                  round
                  dense
                  color="green-6"
                  icon="check_circle"
                  size="sm"
                  @click="approveTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Approve</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.can_approve"
                  round
                  dense
                  color="red-6"
                  icon="cancel"
                  size="sm"
                  @click="rejectTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Reject</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.can_revisi_approval"
                  round
                  dense
                  color="orange-7"
                  icon="edit_note"
                  size="sm"
                  @click="revisiApprovalTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Revisi Approval</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.can_revise"
                  round
                  dense
                  color="orange-6"
                  icon="edit"
                  size="sm"
                  @click="reviseTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Revisi</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.can_execute"
                  round
                  dense
                  color="purple-6"
                  icon="swap_horiz"
                  size="sm"
                  @click="executeTicket(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Eksekusi</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialogs -->
    <ApprovalDialog
      v-model="showApprovalDialog"
      :ticket-data="selectedTicket"
      module="mutasi"
      @approved="onApproved"
    />
    <RejectionDialog
      v-model="showRejectionDialog"
      :ticket-data="selectedTicket"
      module="mutasi"
      @rejected="onRejected"
    />
    <ExecutionDialog
      v-model="showExecutionDialog"
      :ticket-data="selectedTicket"
      module="mutasi"
      @executed="onExecuted"
    />

    <!-- Revisi Approval Dialog -->
    <q-dialog v-model="showRevisiApprovalDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-orange-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="edit_note" size="24px"/>
            Konfirmasi Revisi
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg tw-mb-4">Apakah Anda yakin ingin mengembalikan mutasi arsip ini untuk direvisi?</p>
          <q-input
            v-model="alasanRevisiApproval"
            outlined
            type="textarea"
            rows="3"
            label-slot
            counter
            maxlength="500"
            bg-color="white"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Revisi</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="revisiLoading" />
          <q-btn unelevated label="Ya, Revisi" color="orange-7" @click="handleRevisiApproval" :loading="revisiLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import { domain, empid, decryptMessage, spinnerBall } from "../../../utils";
import { Loading } from "quasar";
import { useRouter } from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import FilterSection from "../../../components/WJS/FilterSection.vue";
import ApprovalDialog from "../../../components/WJS/Pemusnahan/ApprovalDialog.vue";
import RejectionDialog from "../../../components/WJS/Pemusnahan/RejectionDialog.vue";
import ExecutionDialog from "../../../components/WJS/Pemusnahan/ExecutionDialog.vue";
import "../../../assets/styles/table.css";

const router = useRouter();
const { success, error: showError } = useNotify();

const columns = [
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi",
    classes: 'sticky-column-left',
    headerClasses: 'sticky-column-left-header'
  },
  {
    name: "tr_no_tiket",
    required: true,
    label: "Nomor Tiket",
    align: "left",
    field: "tr_no_tiket",
    sortable: true,
  },
  {
    name: "tr_tgl_pengajuan",
    required: true,
    label: "Tanggal Pengajuan",
    align: "left",
    field: "tr_tgl_pengajuan",
    sortable: true,
    format: (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-'
  },
  {
    name: "tr_tgl_mutasi",
    required: true,
    label: "Tanggal Mutasi",
    align: "left",
    field: "tr_tgl_mutasi",
    sortable: true,
    format: (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-'
  },
  {
    name: "content_name",
    required: true,
    label: "Nama Arsip",
    align: "left",
    field: "content_name",
    sortable: true,
  },
  {
    name: "arsip_no",
    required: true,
    label: "Kode Arsip",
    align: "left",
    field: "arsip_no",
    sortable: true,
  },
  {
    name: "lokasi_lama_name",
    required: true,
    label: "Lokasi Lama",
    align: "left",
    field: "lokasi_lama_name",
    sortable: true,
  },
  {
    name: "lokasi_baru_name",
    required: true,
    label: "Lokasi Baru",
    align: "left",
    field: "lokasi_baru_name",
    sortable: true,
  },
  {
    name: "nama_arsiparis_lama",
    required: true,
    label: "Arsiparis Lama",
    align: "left",
    field: "nama_arsiparis_lama",
    sortable: true,
  },
  {
    name: "nama_arsiparis_baru",
    required: true,
    label: "Arsiparis Baru",
    align: "left",
    field: "nama_arsiparis_baru",
    sortable: true,
  },
  {
    name: "bu_name",
    required: true,
    label: "Bisnis Unit",
    align: "left",
    field: "bu_name",
    sortable: true,
  },
  {
    name: "tr_status",
    required: true,
    label: "Status",
    align: "left",
    field: "tr_status",
  },
];

const mutasiList = ref([]);
const filterBu = ref(null);
const filterLokasiArsip = ref(null);
const filterTglAwal = ref(null);
const filterTglAkhir = ref(null);
const loading = ref(false);

const showApprovalDialog = ref(false);
const showRejectionDialog = ref(false);
const showExecutionDialog = ref(false);
const showRevisiApprovalDialog = ref(false);
const alasanRevisiApproval = ref('');
const revisiLoading = ref(false);
const selectedTicket = ref(null);

const pagination = ref({
  sortBy: "tr_tgl_pengajuan",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
  filter: null,
  domain: domain(),
  empid: empid(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const getStatusColor = (status) => {
  const colorMap = {
    1: 'orange-6',
    2: 'yellow-6',
    3: 'red-6',
    4: 'blue-6',
    5: 'blue-7',
    6: 'cyan-6',
    7: 'cyan-7',
    8: 'green-6',
    9: 'purple-7'
  };
  return colorMap[status] || 'grey-6';
};

const getMutasiList = async () => {
  try {
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
      pagination.value.rowsPerPage = pagination.value.rowsNumber;
    
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi`, {
      params: {
        ...pagination.value,
        bu_id: filterBu.value,
        lokasi_arsip_id: filterLokasiArsip.value,
        tgl_awal: filterTglAwal.value,
        tgl_akhir: filterTglAkhir.value
      },
      skipErrorInterceptor: true
    });

    if (typeof res.data.data === "undefined") {
      mutasiList.value = res.data;
    } else {
      mutasiList.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination?.total || 0;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Terjadi kesalahan');
  }
};

const createTicket = () => {
  router.push('/dms/mutasi/create');
};

const viewTicket = (row) => {
  router.push(`/dms/mutasi/${row.tr_arsip_id}`);
};

const approveTicket = (row) => {
  selectedTicket.value = row;
  showApprovalDialog.value = true;
};

const rejectTicket = (row) => {
  selectedTicket.value = row;
  showRejectionDialog.value = true;
};

const reviseTicket = (row) => {
  router.push(`/dms/mutasi/${row.tr_arsip_id}/revise`);
};

const executeTicket = (row) => {
  selectedTicket.value = row;
  showExecutionDialog.value = true;
};

const revisiApprovalTicket = (row) => {
  selectedTicket.value = row;
  alasanRevisiApproval.value = '';
  showRevisiApprovalDialog.value = true;
};

const handleRevisiApproval = async () => {
  if (!alasanRevisiApproval.value || alasanRevisiApproval.value.trim() === '') {
    showError('Alasan revisi wajib diisi');
    return;
  }
  
  try {
    revisiLoading.value = true;
    await axios.post(
      `${import.meta.env.VITE_API}dms/mutasi/${selectedTicket.value.tr_arsip_id}/revisi-approval`,
      {
        creator: empid(),
        alasan: alasanRevisiApproval.value
      },
      { skipErrorInterceptor: true }
    );
    revisiLoading.value = false;
    showRevisiApprovalDialog.value = false;
    success('Tiket berhasil dikembalikan untuk direvisi');
    getMutasiList();
  } catch (error) {
    revisiLoading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal merevisi tiket');
  }
};

const onApproved = () => {
  getMutasiList();
};

const onRejected = () => {
  getMutasiList();
};

const onExecuted = () => {
  getMutasiList();
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getMutasiList();
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const downloadExcel = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/export`, {
      params: {
        empid: empid(),
        domain: domain(),
        bu_id: filterBu.value,
        lokasi_arsip_id: filterLokasiArsip.value,
        tgl_awal: filterTglAwal.value,
        tgl_akhir: filterTglAkhir.value,
        filter: pagination.value.filter
      },
      responseType: 'blob',
      skipErrorInterceptor: true
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mutasi_Arsip.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    success('File Excel berhasil didownload');
  } catch (error) {
    showError(error?.message || 'Gagal mengunduh Excel');
  }
};

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: '/dms/mutasi',
        domain: domain(),
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
  } catch (error) {
    console.log(error);
    Loading.hide();
    router.push('/404');
  }
};

onMounted(() => {
  getPageAkses();
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  filterTglAwal.value = firstDay.toISOString().split('T')[0];
  filterTglAkhir.value = lastDay.toISOString().split('T')[0];
  
  onRequest({
    pagination: pagination.value,
  });
});
</script>


