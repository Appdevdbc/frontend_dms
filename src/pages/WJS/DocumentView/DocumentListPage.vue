<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="description" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Lihat Nomor Dokumen</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>DMS</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Lihat Nomor Dokumen</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="documents"
          :columns="columns"
          row-key="no"
          :pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="pagination.filter"
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
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select
                  borderless
                  dense
                  debounce="300"
                  v-model="pagination.rowsPerPage"
                  :options="[5,10,25,50,100,200]"
                  @update:modelValue="updateTable"
                >
                  <template v-slot:before>
                    <q-icon name="reorder">
                      <q-tooltip :class="'tw-bg-black/90'">
                        Rows per page
                      </q-tooltip>
                    </q-icon>
                  </template>
                </q-select>
              </div>
            </div>
          </template>
          <template v-slot:top-right>
            <q-input
              outlined
              dense
              debounce="300"
              v-model="pagination.filter"
              placeholder="Search documents..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="blue-6" />
              </template>
            </q-input>
          </template>

          <!-- Body cell styling -->
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>

          <!-- Row number -->
          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700 tw-text-center tw-font-medium">
              {{ props.row.no }}
            </q-td>
          </template>

          <!-- PIC column (name + NIK) -->
          <template v-slot:body-cell-pic="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.row.account_name }} {{ props.row.account_nik }}
            </q-td>
          </template>

          <!-- Status badge -->
          <template v-slot:body-cell-doc_nmr_status="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge
                :color="getStatusColor(props.row.doc_nmr_status)"
                class="tw-px-3 tw-py-1 tw-rounded-full tw-font-semibold tw-cursor-pointer"
                @click="showCancelDetails(props.row)"
              >
                {{ props.row.doc_nmr_status }}
              </q-badge>
            </q-td>
          </template>

          <!-- Action column (approve button) -->
          <template v-slot:body-cell-action="props">
            <q-td :props="props" class="tw-py-4 tw-text-center">
              <a
                v-if="props.row.can_approve"
                :href="props.row.approve_url"
                target="_blank"
                class="tw-text-blue-600 tw-underline hover:tw-text-blue-800 tw-font-semibold"
              >
                Approve
              </a>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { domain, empid } from '../../../utils.js';
import * as documentViewApi from '../../../helpers/document-view.js';

const $q = useQuasar();

// State
const documents = ref([]);
const loading = ref(false);
const pagination = ref({
  sortBy: 'created_date',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null
});

// Table columns
const columns = [
  {
    name: 'no',
    label: 'No',
    field: 'no',
    align: 'center',
    sortable: false,
    style: 'width: 60px'
  },
  {
    name: 'doc_id',
    label: 'Nomor Dokumen',
    field: 'doc_id',
    align: 'center',
    sortable: true,
    style: 'min-width: 200px'
  },
  {
    name: 'created_date',
    label: 'Tanggal Generate Nomor',
    field: 'created_date',
    align: 'center',
    sortable: true,
    style: 'width: 150px'
  },
  {
    name: 'doc_hds_id',
    label: 'Nomor HDS Legal',
    field: 'doc_hds_id',
    align: 'center',
    sortable: true,
    style: 'width: 150px'
  },
  {
    name: 'doc_judul',
    label: 'Judul Dokumen',
    field: 'doc_judul',
    align: 'left',
    sortable: true,
    style: 'min-width: 250px'
  },
  {
    name: 'pic',
    label: 'PIC',
    field: 'pic',
    align: 'center',
    sortable: false,
    style: 'min-width: 180px'
  },
  {
    name: 'div_nama',
    label: 'Divisi',
    field: 'div_nama',
    align: 'left',
    sortable: true,
    style: 'min-width: 150px'
  },
  {
    name: 'dept_name',
    label: 'Dept',
    field: 'dept_name',
    align: 'left',
    sortable: true,
    style: 'min-width: 150px'
  },
  {
    name: 'doc_nmr_status',
    label: 'Status',
    field: 'doc_nmr_status',
    align: 'center',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'content_entrydate',
    label: 'Tanggal Upload Dokumen',
    field: 'content_entrydate',
    align: 'center',
    sortable: true,
    style: 'width: 150px'
  },
  {
    name: 'bu_name',
    label: 'Business Unit',
    field: 'bu_name',
    align: 'left',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'doc_alasan_batal',
    label: 'Keterangan',
    field: 'doc_alasan_batal',
    align: 'left',
    sortable: false,
    style: 'min-width: 200px'
  },
  {
    name: 'action',
    label: 'Action',
    field: 'action',
    align: 'center',
    sortable: false,
    style: 'width: 100px'
  }
];

// Methods
const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  
  loading.value = true;
  try {
    const response = await documentViewApi.fetchDocuments({
      page,
      rowsPerPage,
      sortBy,
      descending,
      filter,
      empid: empid()
    });
    
    documents.value = response.data;
    pagination.value.rowsNumber = response.pagination.rowsNumber;
  } catch (error) {
    const errorMessage = error?.response?.data?.message 
      || error?.message 
      || 'Gagal memuat data dokumen';
    
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'bottom',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Approval 1':
      return 'orange';
    case 'Approval 2':
      return 'blue';
    case 'Open':
      return 'green';
    case 'Cancel':
      return 'red';
    default:
      return 'grey';
  }
};

const showCancelDetails = (row) => {
  if (row.doc_nmr_status === 'Cancel') {
    $q.dialog({
      title: 'Detail Pembatalan',
      message: `
        <div class="tw-space-y-2">
          <div><strong>Nomor Dokumen:</strong> ${row.doc_id || '-'}</div>
          <div><strong>Alasan Cancel:</strong> ${row.doc_alasan_batal || '-'}</div>
          <div><strong>Tanggal Cancel:</strong> ${row.modified_date || '-'}</div>
        </div>
      `,
      html: true,
      class: `side-${domain()} text-semibold tw-rounded-2xl`,
      style: 'border-radius: 16px;',
      ok: {
        push: true,
        color: 'blue-6',
        label: 'Tutup',
        class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
      }
    });
  }
};

// Load data on mount
onMounted(() => {
  onRequest({ pagination: pagination.value });
});
</script>

<style scoped>
/* Additional custom styles if needed */
</style>


