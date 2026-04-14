<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="badge" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Employee</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Employee</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listEmployees"
          :columns="columns"
          row-key="id"
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
                :options="[10,25,50,100]"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>
          
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn
                unelevated
                :color="`${domain()}`"
                label="Add Employee"
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
                  <q-icon name="search" :color="`${domain()}`" />
                </template>
              </q-input>
            </div>
          </template>
          
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
          
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3 sticky-column-left">
              <div class="tw-flex tw-gap-2">
                <q-btn
                  round
                  dense
                  color="blue-6"
                  icon="edit"
                  size="sm"
                  @click="openEditDialog(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
                
                <q-btn
                  round
                  dense
                  color="red-6"
                  icon="delete"
                  size="sm"
                  @click="deleteData(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Delete</q-tooltip>
                </q-btn>
                
                <q-btn
                  round
                  dense
                  color="green-6"
                  icon="calendar_month"
                  size="sm"
                  @click="goToTJKN(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">TJKN Employee</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="badge" size="32px"/>
            {{ isEdit ? 'Edit' : 'Add' }} Employee
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12" v-if="!isEdit">
              <q-input
                v-model="form.opt_nik"
                outlined
                label="NIK (Search from Portal)"
                :rules="[val => !!val || 'NIK is required']"
                class="tw-rounded-lg"
                @blur="searchEmployeeByNIK"
                :loading="nikSearchLoading"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6"/>
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    round
                    icon="refresh"
                    @click="searchEmployeeByNIK"
                    :loading="nikSearchLoading"
                    color="blue-6"
                  >
                    <q-tooltip>Search in Portal</q-tooltip>
                  </q-btn>
                </template>
                <template v-slot:hint>
                  Enter NIK and press Tab or click refresh to search in Portal
                </template>
              </q-input>
            </div>
            
            <div class="col-12" v-if="isEdit">
              <q-input
                v-model="form.opt_nik"
                outlined
                label="NIK (Can be updated)"
                :rules="[val => !!val || 'NIK is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="blue-6"/>
                </template>
                <template v-slot:hint>
                  NIK can be updated if it changed in Portal
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="form.opt_name"
                outlined
                label="Name"
                :rules="[val => !!val || 'Name is required']"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:hint>
                  Auto-filled from Portal
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-select
                v-model="form.opt_section"
                :options="sections"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                label="Section"
                :rules="[val => !!val || 'Section is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6"/>
                </template>
              </q-select>
            </div>
            
            <div class="col-12">
              <q-select
                v-model="form.opt_jabatan"
                :options="positions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                label="Jabatan"
                :rules="[val => !!val || 'Jabatan is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="blue-6"/>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200"/>
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Cancel"
            color="red-7"
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
            @click="saveData"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { domain, empid, spinnerBall } from "./../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const $q = useQuasar();
const router = useRouter();
const { success, error } = useNotify();

const columns = [
  {
    name: "aksi",
    required: true,
    label: "Action",
    align: "left",
    field: "aksi",
    classes: 'sticky-column-left',
    headerClasses: 'sticky-column-left-header'
  },
  {
    name: "opt_nik",
    align: "left",
    label: "NIK",
    field: "opt_nik",
    sortable: true,
  },
  {
    name: "opt_name",
    align: "left",
    label: "Name",
    field: "opt_name",
    sortable: true,
  },
  {
    name: "opt_section",
    align: "left",
    label: "Section",
    field: "opt_section",
    sortable: true,
  },
  {
    name: "opt_jabatan",
    align: "center",
    label: "Jabatan",
    field: "opt_jabatan",
    sortable: true,
  },
];

const listEmployees = ref([]);
const sections = ref([]);
const positions = ref([]);
const loading = ref(false);
const dialogForm = ref(false);
const isEdit = ref(false);

const pagination = ref({
  sortBy: "opt_name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const form = reactive({
  id: null,
  emp_id: null,
  opt_nik: null,
  opt_name: null,
  opt_section: null,
  opt_jabatan: null,
});

const nikSearchLoading = ref(false);

const getData = async () => {
  try {
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}listEmployees`, {
      params: pagination.value,
    });
    
    if (typeof res.data.data === "undefined") {
      listEmployees.value = res.data;
    } else {
      listEmployees.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const loadSections = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSections`);
    sections.value = res.data;
  } catch (err) {
    error('Failed to load sections');
  }
};

const loadPositions = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getPositions`);
    positions.value = res.data;
  } catch (err) {
    error('Failed to load positions');
  }
};

const searchEmployeeByNIK = async () => {
  if (!form.opt_nik || form.opt_nik.length < 3) {
    return;
  }
  
  try {
    nikSearchLoading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}searchEmployeeByNIK`, {
      params: { nik: form.opt_nik }
    });
    
    // Auto-fill from Portal
    form.emp_id = res.data.emp_id;
    form.opt_name = res.data.name;
    
    success('Employee found in Portal');
    nikSearchLoading.value = false;
  } catch (err) {
    nikSearchLoading.value = false;
    if (err?.response?.status === 404) {
      error('Employee not found in Portal. Please enter manually.');
    } else {
      error(err?.response?.data?.message || 'Failed to search employee');
    }
  }
};

const openAddDialog = async () => {
  isEdit.value = false;
  resetForm();
  dialogForm.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  form.id = row.id;
  form.emp_id = row.emp_id;
  form.opt_nik = row.opt_nik;
  form.opt_name = row.opt_name;
  form.opt_section = row.opt_section;
  form.opt_jabatan = row.opt_jabatan;
  dialogForm.value = true;
};

const saveData = async () => {
  // Validate that Portal lookup was done (emp_id must exist)
  if (!isEdit.value && !form.emp_id) {
    error('Please search employee from Portal first');
    return;
  }
  
  if (!form.emp_id || !form.opt_nik || !form.opt_name || !form.opt_section || !form.opt_jabatan) {
    error('All fields are required');
    return;
  }
  
  try {
    spinnerBall();
    
    const payload = {
      id: form.id,
      emp_id: form.emp_id,
      opt_nik: form.opt_nik,
      opt_name: form.opt_name,
      opt_section: form.opt_section,
      opt_jabatan: form.opt_jabatan,
      creator: empid(),
    };
    
    await axios.post(`${import.meta.env.VITE_API}saveEmployee`, payload);
    
    dialogForm.value = false;
    success(isEdit.value ? 'Employee updated successfully' : 'Employee added successfully');
    onRequest({
      pagination: pagination.value,
    });
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to save employee');
  }
};

const deleteData = async (row) => {
  $q.dialog({
    title: "Confirm Delete",
    message: `Are you sure you want to delete employee <strong>${row.opt_name} (${row.opt_nik})</strong>?`,
    html: true,
    class: `side-${domain()} tw-rounded-2xl`,
    ok: {
      push: true,
      color: "red-7",
      label: "Delete",
      icon: "delete",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'grey-7',
      label: "Cancel",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.post(`${import.meta.env.VITE_API}deleteEmployee`, {
        id: row.id_encrypted,
        creator: empid(),
      });
      success('Employee deleted successfully');
      onRequest({
        pagination: pagination.value,
      });
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to delete employee');
    }
  });
};

const goToTJKN = (row) => {
  // Navigate to TJKN Employee page with NIK filter
  router.push({
    path: '/master/tjkn-employee',
    query: { nik: row.opt_nik, name: row.opt_name }
  });
};

const resetForm = () => {
  form.id = null;
  form.emp_id = null;
  form.opt_nik = null;
  form.opt_name = null;
  form.opt_section = null;
  form.opt_jabatan = null;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getData();
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

onMounted(() => {
  loadSections();
  loadPositions();
  onRequest({
    pagination: pagination.value,
  });
});
</script>
