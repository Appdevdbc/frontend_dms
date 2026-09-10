<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="corporate_fare" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">
              Master Departement
            </div>
            <div
              class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs"
            >
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Master</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Data Departement</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          v-if="tmpPage.view == '1' || tmpPage.admin == '1'"
          :rows="listDept"
          :columns="columns"
          row-key="dept_id"
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
                :class="[
                  `bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`,
                  col.name === 'aksi' ? 'sticky-column-left-header' : '',
                ]"
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
                placeholder="Search departments..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
              <q-btn
                v-if="tmpPage.add == '1' || tmpPage.admin == '1'"
                push
                :color="`${domain()}`"
                icon="add"
                label="Tambah Dept"
                @click="addDept"
                class="tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
              />
            </div>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3 sticky-column-left">
              <q-btn
                v-if="tmpPage.edit == '1' || tmpPage.admin == '1'"
                round
                dense
                color="orange-7"
                size="sm"
                class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                @click="editDept(props.row)"
                icon="edit"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs"> Edit </q-tooltip>
              </q-btn>

              <q-btn
                v-if="tmpPage.delete == '1' || tmpPage.admin == '1'"
                round
                dense
                color="red-7"
                size="sm"
                class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                @click="deleteDept(props.row)"
                icon="delete"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                  Delete
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Form -->
    <q-dialog
      v-model="dialogForm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div
            class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3"
          >
            <q-icon name="edit_note" size="32px" />
            {{ updateForm ? "Edit Departement" : "Tambah Departement" }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner
                rounded
                class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm"
              >
                <template v-slot:avatar>
                  <q-icon name="info" color="red" size="24px" />
                </template>
                <span class="tw-text-red-700 tw-font-medium"
                  >Field bertanda bintang (*) wajib diisi</span
                >
              </q-banner>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.dept_name"
                outlined
                counter
                maxlength="100"
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="corporate_fare" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Nama Departement</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpForm.dept_divisi"
                :options="listDivisi"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Divisi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.dept_note"
                outlined
                type="textarea"
                rows="3"
                counter
                maxlength="200"
                label="Keterangan"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200" />
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Close"
            color="grey-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Save"
            :color="`${domain()}`"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validateDept"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  decrypt,
  decryptMessage,
} from "./../../utils";
import { useQuasar, Loading } from "quasar";
import * as yup from "yup";
import { useRouter as useVueRouter } from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const router = useVueRouter();
const { success, error } = useNotify();
const columns = [
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi",
    classes: "sticky-column-left",
    headerClasses: "sticky-column-left-header",
  },
  {
    name: "dept_name",
    required: true,
    label: "Departement",
    align: "left",
    field: "dept_name",
    sortable: true,
  },
  {
    name: "divisi_name",
    align: "left",
    label: "Divisi",
    field: "divisi_name",
    sortable: true,
  },
  {
    name: "dept_note",
    label: "Keterangan",
    align: "left",
    field: "dept_note",
    sortable: true,
  },
];
const $q = useQuasar();
const listDept = ref([]);
const listDivisi = ref([]);

const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);

const pagination = ref({
  sortBy: "dept_id",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const tmpForm = reactive({
  id: null,
  dept_name: null,
  dept_divisi: null,
  dept_note: null,
  creator: empid(),
  domain: domain(),
});

const tmpPage = reactive({
  add: "0",
  edit: "0",
  delete: "0",
  view: "0",
  admin: "0",
});

const schema = yup.object({
  dept_name: yup.string().required("Nama departement wajib diisi").nullable(),
  dept_divisi: yup.number().required("Divisi wajib dipilih").nullable(),
});

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: "master_dept",
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
    Loading.hide();
    router.push("/404");
  }
};

const getDept = async () => {
  loading.value = true;
  try {
    if (pagination.value.rowsPerPage == "All")
      pagination.value.rowsPerPage = pagination.value.rowsNumber;

    pagination.value.domain = domain();

    const res = await axios.get(`${import.meta.env.VITE_API}listDept`, {
      params: pagination.value,
    });

    if (typeof res.data.data === "undefined") {
      listDept.value = res.data;
      pagination.value.rowsNumber = res.data.length;
    } else {
      listDept.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination?.total || 0;
    }
  } catch (err) {
    console.error('getDept error:', err);
    error(ParseError(err));
    listDept.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const getDivisi = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDivisi`);
    listDivisi.value = res.data;
  } catch (error) {
    console.error("getDivisi error:", error);
  }
};

const addDept = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
  await getDivisi();
};

const editDept = async (value) => {
  try {
    reset();
    updateForm.value = true;
    dialogForm.value = true;

    tmpForm.id = value.dept_id;
    tmpForm.dept_name = value.dept_name;
    tmpForm.dept_divisi = value.dept_divisi;
    tmpForm.dept_note = value.dept_note;

    await getDivisi();
  } catch (error) {
    console.log(error);
  }
};

const validateDept = async () => {
  let validate = {
    dept_name: tmpForm.dept_name,
    dept_divisi: tmpForm.dept_divisi,
  };
  schema
    .validate(validate, { abortEarly: false })
    .then(() => {
      saveDialog();
    })
    .catch((err) => {
      err.inner.forEach((e) => {
        error(e.message);
      });
    });
};

const saveDialog = async () => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah data sudah sesuai ?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Simpan",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await saveDept();
    } catch (error) {
      // Error handled in saveDept
    }
  });
};

const saveDept = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}saveDept`, tmpForm);
    dialogForm.value = false;
    reset();
    success(
      updateForm.value ? "Data berhasil diubah" : "Data berhasil disimpan"
    );
    await onRequest({
      pagination: pagination.value,
    });
  } catch (error) {
    error(ParseError(error));
  }
};

const deleteDept = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus departement <span class="text-bold">${value.dept_name}</span>?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Hapus",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}deleteDept`, {
        id: value.dept_id,
        creator: empid(),
      });
      dialogForm.value = false;
      reset();
      success("Data berhasil dihapus");
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      error(ParseError(error));
    }
  });
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.dept_name = null;
  tmpForm.dept_divisi = null;
  tmpForm.dept_note = null;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getDept();
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
