<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="verified" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Approval</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master Approval</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Filter Section -->
      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-space-y-3">
          <BisnisUnitSelect v-model="filterBu" :required="false" :rules="[]" />
          <div class="tw-flex tw-gap-3">
            <q-btn
              unelevated
              color="blue-6"
              label="Tampilkan"
              icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg"
              @click="updateTable"
            />
          </div>
        </div>
        <div class="tw-mt-4 tw-mx-auto tw-w-[90%] tw-h-0.5 tw-bg-gradient-to-r tw-from-transparent tw-via-slate-300 tw-to-transparent"></div>
      </q-card-section>

      <!-- Table -->
      <q-card-section class="tw-p-6">
        <q-table
          v-if="tmpPage.view=='1'"
          :rows="approvals"
          :columns="columns"
          row-key="app_id"
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
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
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
                :options="[5,10,25,50,100]"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>
          
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center tw-flex-wrap">
              <q-btn
                v-if="tmpPage.add=='1'"
                unelevated
                color="blue-6"
                label="Tambah Data"
                icon="add"
                @click="openAddDialog"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6"/>
                </template>
              </q-input>
            </div>
          </template>

          <!-- Action Column -->
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3">
              <div class="tw-flex tw-gap-2">
                <q-btn
                  round
                  dense
                  color="light-green-9"
                  icon="visibility"
                  size="sm"
                  @click="viewApproval(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">View</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tmpPage.edit=='1'"
                  round
                  dense
                  color="light-blue-9"
                  icon="edit"
                  size="sm"
                  @click="editApproval(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="tmpPage.delete=='1'"
                  round
                  dense
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteApproval(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Delete</q-tooltip>
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

    <!-- Add/Edit/View Dialog -->
    <ApprovalFormDialog
      v-model="dialogForm"
      :approval-data="selectedApproval"
      :is-edit="isEdit"
      :is-view="false"
      @saved="onSaved"
    />

    <!-- View Dialog -->
    <ApprovalFormDialog
      v-model="dialogView"
      :approval-data="selectedApproval"
      :is-edit="true"
      :is-view="true"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useQuasar, Loading } from 'quasar';
import { useRouter } from 'vue-router';
import { domain, spinnerBall, empid, decryptMessage } from '../../../utils';
import { useNotify } from '../../../composables/useNotify';
import { useNumeral } from '../../../helpers/useNumeral';
import ApprovalFormDialog from '../../../components/WJS/Master/ApprovalFormDialog.vue';
import BisnisUnitSelect from '../../../components/WJS/master/BusinessUnitSelect.vue';
import axios from 'axios';

const { formatInteger } = useNumeral();

const $q = useQuasar();
const router = useRouter();
const { success, error: showError } = useNotify();

const columns = [
  { name: 'aksi', label: 'Aksi', align: 'left', field: 'aksi' },
  { name: 'app_kode', label: 'Kode', align: 'center', field: 'app_kode', sortable: true },
  { 
    name: 'app_prioritas', 
    label: 'Prioritas', 
    align: 'right', 
    field: 'app_prioritas', 
    sortable: true,
    format: (val) => formatInteger(val)
  },
  { name: 'bu_name', label: 'Business Unit', align: 'left', field: 'bu_name', sortable: true },
  { name: 'app_jns_desc', label: 'Jenis Transaksi', align: 'left', field: 'app_jns_desc', sortable: true },
  { name: 'app_bag1_text', label: 'Approver #1', align: 'left', field: 'app_bag1_text' },
  { name: 'app_bag2_text', label: 'Approver #2', align: 'left', field: 'app_bag2_text' },
  { name: 'app_bag3_text', label: 'Approver #3', align: 'left', field: 'app_bag3_text' },
];

const approvals = ref([]);
const loading = ref(false);
const dialogForm = ref(false);
const dialogView = ref(false);
const isEdit = ref(false);
const selectedApproval = ref(null);
const filterBu = ref(null);

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'app_kode',
  descending: false,
  filter: null
});

const tmpPage = reactive({
  add: '0',
  edit: '0',
  delete: '0',
  view: '0',
  admin: '0'
});

const getApprovals = async () => {
  try {
    loading.value = true;
    
    // Handle 'All' option
    if (pagination.value.rowsPerPage == 'All') {
      pagination.value.rowsPerPage = pagination.value.rowsNumber;
    }
    
    const params = {
      ...pagination.value,
      bu_id: filterBu.value
    };
    
    const res = await axios.get(`${import.meta.env.VITE_API}dms/approvals`, {
      params,
      skipErrorInterceptor: true
    });
    
    // Handle response format
    if (typeof res.data.data === "undefined") {
      approvals.value = res.data;
    } else {
      approvals.value = res.data.data;
    }
    
    pagination.value.rowsNumber = res.data.pagination.total;
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  selectedApproval.value = null;
  dialogForm.value = true;
};

const editApproval = (row) => {
  isEdit.value = true;
  selectedApproval.value = row;
  dialogForm.value = true;
};

const viewApproval = (row) => {
  selectedApproval.value = row;
  dialogView.value = true;
};

const deleteApproval = (row) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Apakah anda yakin ingin menghapus approval <strong>${row.app_kode || 'ini'}</strong>?`,
    html: true,
    class: `side-${domain()} tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color: 'blue-6',
      label: 'Ya, Hapus',
      icon: 'check_circle',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: 'Batal',
      icon: 'cancel',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    persistent: true
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.delete(`${import.meta.env.VITE_API}dms/approvals/${row.app_id}`, {
        skipErrorInterceptor: true
      });
      Loading.hide();
      success('Master approval berhasil dihapus');
      onRequest({ pagination: pagination.value });
    } catch (err) {
      Loading.hide();
      showError(err?.response?.data?.message || 'Gagal menghapus data');
    }
  });
};

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: '/dms/master-approval',
        domain: domain()
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
  } catch (error) {
    Loading.hide();
    router.push('/404');
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending, filter };
  getApprovals();
};

const updateTable = () => {
  onRequest({ pagination: pagination.value });
};

const onSaved = () => {
  dialogForm.value = false;
  onRequest({ pagination: pagination.value });
};

onMounted(() => {
  getPageAkses();
  onRequest({ pagination: pagination.value });
});
</script>


