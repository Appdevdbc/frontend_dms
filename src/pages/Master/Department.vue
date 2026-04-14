<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="apartment" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Department Master</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Department</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listDepartments"
          :columns="columns"
          row-key="id_dept"
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
                label="Add Department"
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
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="apartment" size="32px"/>
            {{ isEdit ? 'Edit' : 'Add' }} Department
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.id_site"
                :options="listSites"
                option-value="id_site"
                option-label="nama"
                emit-value
                map-options
                outlined
                label="Site"
                :rules="[val => !!val || 'Site is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" color="blue-6"/>
                </template>
              </q-select>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="form.nama"
                outlined
                label="Department Name"
                :rules="[val => !!val || 'Department name is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="label" color="blue-6"/>
                </template>
              </q-input>
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
import axios from "axios";
import { domain, empid, spinnerBall } from "./../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const $q = useQuasar();
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
    name: "nama",
    align: "left",
    label: "Department Name",
    field: "nama",
    sortable: true,
  },
  {
    name: "nama_site",
    align: "left",
    label: "Site",
    field: "nama_site",
    sortable: true,
  },
];

const listDepartments = ref([]);
const listSites = ref([]);
const loading = ref(false);
const dialogForm = ref(false);
const isEdit = ref(false);

const pagination = ref({
  sortBy: "nama",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const form = reactive({
  id_dept: null,
  nama: null,
  id_site: null,
});

const getData = async () => {
  try {
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}listDepartments`, {
      params: pagination.value,
    });
    
    if (typeof res.data.data === "undefined") {
      listDepartments.value = res.data;
    } else {
      listDepartments.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const getSites = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getDepartmentSites`);
    listSites.value = res.data;
  } catch (err) {
    error('Failed to load sites');
  }
};

const openAddDialog = async () => {
  isEdit.value = false;
  resetForm();
  await getSites();
  dialogForm.value = true;
};

const openEditDialog = async (row) => {
  isEdit.value = true;
  form.id_dept = row.id_dept;
  form.nama = row.nama;
  form.id_site = row.id_site;
  await getSites();
  dialogForm.value = true;
};

const saveData = async () => {
  if (!form.nama) {
    error('Department name is required');
    return;
  }
  
  if (!form.id_site) {
    error('Site is required');
    return;
  }
  
  try {
    spinnerBall();
    
    const payload = {
      id_dept: form.id_dept,
      nama: form.nama,
      id_site: form.id_site,
      creator: empid(),
    };
    
    await axios.post(`${import.meta.env.VITE_API}saveDepartment`, payload);
    
    dialogForm.value = false;
    success(isEdit.value ? 'Department updated successfully' : 'Department added successfully');
    onRequest({
      pagination: pagination.value,
    });
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to save department');
  }
};

const deleteData = async (row) => {
  $q.dialog({
    title: "Confirm Delete",
    message: `Are you sure you want to delete department <strong>${row.nama}</strong>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deleteDepartment`, {
        id_dept: row.id_dept_encrypted,
        creator: empid(),
      });
      success('Department deleted successfully');
      onRequest({
        pagination: pagination.value,
      });
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to delete department');
    }
  });
};

const resetForm = () => {
  form.id_dept = null;
  form.nama = null;
  form.id_site = null;
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
  onRequest({
    pagination: pagination.value,
  });
});
</script>
