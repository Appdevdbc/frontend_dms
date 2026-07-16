<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="history" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">
              History Document
            </div>
            <div
              class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs"
            >
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>History Document</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          v-if="tmpPage.view == '1' || tmpPage.admin == '1'"
          :rows="listDocuments"
          :columns="columns"
          row-key="content_id"
          v-model:pagination="pagination"
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
                  :options="[5, 10, 25, 50, 100, 200]"
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
            <div class="tw-flex tw-gap-3 tw-items-center">
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
            </div>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-content_active="props">
            <q-td :props="props" class="tw-py-3">
              <q-badge
                :color="props.row.content_active === 1 ? 'green' : 'grey'"
                :label="props.row.content_active === 1 ? 'Aktif' : 'Non-Aktif'"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-content_file="props">
            <q-td :props="props" class="tw-py-3">
              <span v-if="props.row.content_file">
                {{ props.row.content_file }}
              </span>
              <span v-else class="tw-text-gray-400">-</span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import {
  ParseError,
  domain,
  empid,
  admin,
  spinnerBall,
  decryptMessage,
} from "./../../utils";
import { useQuasar, Loading } from "quasar";
import { useRouter as useVueRouter } from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const router = useVueRouter();
const { success, error } = useNotify();
const columns = [
  {
    name: "content_no",
    required: true,
    label: "No Dokumen",
    align: "left",
    field: "content_no",
    sortable: true,
  },
  {
    name: "content_name",
    align: "left",
    label: "Nama Dokumen",
    field: "content_name",
    sortable: true,
  },
  {
    name: "content_revision",
    label: "Revisi",
    align: "center",
    field: "content_revision",
    sortable: true,
  },
  {
    name: "content_entry_date",
    label: "Tanggal Pengesahan",
    align: "center",
    field: "content_entry_date",
    sortable: true,
    format: (val) => val || "-",
  },
  {
    name: "content_eff_date",
    label: "Tanggal Terbit",
    align: "center",
    field: "content_eff_date",
    sortable: true,
    format: (val) => val || "-",
  },
  {
    name: "divisi_name",
    align: "left",
    label: "Divisi",
    field: "divisi_name",
    sortable: true,
  },
  {
    name: "dept_name",
    label: "Departement",
    align: "left",
    field: "dept_name",
    sortable: true,
  },
  {
    name: "folder_name",
    label: "Folder",
    align: "left",
    field: "folder_name",
    sortable: true,
  },
  {
    name: "content_file",
    label: "File",
    align: "left",
    field: "content_file",
    sortable: true,
  },
  {
    name: "content_active",
    label: "Status",
    align: "center",
    field: "content_active",
    sortable: true,
  },
];
const $q = useQuasar();
const listDocuments = ref([]);

const loading = ref(false);

const pagination = ref({
  sortBy: "content_no",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const tmpPage = reactive({
  add: "0",
  edit: "0",
  delete: "0",
  view: "0",
  admin: "0",
});

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: "history_document",
        domain: domain(),
      },
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    tmpPage.admin = admin();
    Loading.hide();
  } catch (error) {
    console.error("getPageAkses error:", error);
    // TEMPORARY: Set default access untuk testing
    tmpPage.view = "1";
    tmpPage.admin = admin();
    Loading.hide();
    // router.push('/404');  // Comment out untuk testing
  }
};

const getDocuments = async () => {
  loading.value = true;
  try {
    if (pagination.value.rowsPerPage == "All")
      pagination.value.rowsPerPage = pagination.value.rowsNumber;

    pagination.value.domain = domain();

    const res = await axios.get(
      `${import.meta.env.VITE_API}getHistoryDocument`,
      {
        params: pagination.value,
      }
    );

    if (typeof res.data.data === "undefined") {
      listDocuments.value = res.data;
      pagination.value.rowsNumber = res.data.length;
    } else {
      listDocuments.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination?.total || 0;
    }
  } catch (err) {
    console.error('getDocuments error:', err);
    error(ParseError(err));
    listDocuments.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getDocuments();
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

onMounted(() => {
  getPageAkses();
  onRequest({
    pagination: pagination.value,
  });
});
</script>
