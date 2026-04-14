<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="groups" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Group Management</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Group Management</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listGroups"
          :columns="columns"
          row-key="grp_id"
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
                label="Add Group"
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
                  @click="confirmDelete(props.row)"
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

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showDialog" transition-show="slide-up" transition-hide="slide-down">
      <q-card style="width: 600px; max-width: 90vw" class="tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon :name="isEdit ? 'edit' : 'add'" size="28px" class="tw-text-white"/>
              <div class="text-h6 tw-text-white tw-font-bold">
                {{ isEdit ? 'Edit Group' : 'Add New Group' }}
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="white"
              @click="showDialog = false"
              class="tw-shadow-md hover:tw-bg-white/20 tw-transition-all"
            >
              <q-tooltip class="tw-bg-slate-800 tw-text-xs">Close</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section class="tw-p-6">
          <div class="tw-space-y-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">
                Group Name <span class="tw-text-red-500">*</span>
              </label>
              <q-input
                v-model="formData.grp_name"
                outlined
                dense
                placeholder="Enter group name"
                :rules="[val => !!val || 'Group name is required']"
                class="tw-bg-white"
              >
                <template v-slot:prepend>
                  <q-icon name="label" color="blue-6" />
                </template>
              </q-input>
            </div>

            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">
                Group Code <span class="tw-text-red-500">*</span>
              </label>
              <q-input
                v-model="formData.grp_code"
                outlined
                dense
                placeholder="Enter group code (e.g., ADMIN, USER)"
                :rules="[val => !!val || 'Group code is required']"
                class="tw-bg-white"
              >
                <template v-slot:prepend>
                  <q-icon name="tag" color="blue-6" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-actions class="tw-p-4 tw-bg-slate-50">
          <q-space/>
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            @click="showDialog = false"
            class="tw-px-6 tw-rounded-full"
          />
          <q-btn
            unelevated
            label="Save"
            :color="domain()"
            @click="saveGroup"
            :loading="saving"
            class="tw-px-6 tw-rounded-full tw-shadow-md hover:tw-shadow-lg tw-transition-all"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import "./../../assets/styles/table.css";
import { ref, onMounted } from "vue";
import axios from "axios";
import { domain, empid, spinnerBall } from "./../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../composables/useNotify";

const $q = useQuasar();
const { success, error } = useNotify();

const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const isEdit = ref(false);
const listGroups = ref([]);

const columns = [
  {
    name: "aksi",
    required: true,
    label: "Action",
    align: "center",
    field: "aksi",
    style: "width: 120px"
  },
  {
    name: "grp_name",
    required: true,
    label: "Group Name",
    align: "left",
    field: "grp_name",
    sortable: true,
  },
  {
    name: "grp_code",
    required: true,
    label: "Group Code",
    align: "left",
    field: "grp_code",
    sortable: true,
  },
];

const pagination = ref({
  sortBy: "grp_name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const formData = ref({
  grp_id: null,
  grp_name: '',
  grp_code: '',
  grp_app_id: 8,
});

const getGroups = async () => {
  try {
    spinnerBall();
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}getGroups`, {
      params: pagination.value
    });
    
    listGroups.value = res.data.data || res.data;
    
    if (res.data.pagination) {
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
    $q.loading.hide();
  } catch (err) {
    loading.value = false;
    $q.loading.hide();
    error('Failed to load groups');
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getGroups();
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const openAddDialog = () => {
  isEdit.value = false;
  formData.value = {
    grp_id: null,
    grp_name: '',
    grp_code: '',
    grp_app_id: 8,
  };
  showDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  formData.value = {
    grp_id: row.grp_id,
    grp_name: row.grp_name,
    grp_code: row.grp_code,
    grp_app_id: row.grp_app_id || 8,
  };
  showDialog.value = true;
};

const saveGroup = async () => {
  if (!formData.value.grp_name || !formData.value.grp_code) {
    error('Please fill in all required fields');
    return;
  }
  
  $q.dialog({
    title: isEdit.value ? 'Confirm Update' : 'Confirm Save',
    message: isEdit.value 
      ? `Are you sure you want to update group <strong>${formData.value.grp_name}</strong>?`
      : `Are you sure you want to create group <strong>${formData.value.grp_name}</strong>?`,
    html: true,
    class: `side-${domain()} tw-rounded-2xl`,
    ok: {
      push: true,
      color: 'green-6',
      label: isEdit.value ? 'Update' : 'Save',
      icon: isEdit.value ? 'edit' : 'save',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    cancel: {
      push: true,
      color: 'grey-7',
      label: 'Cancel',
      icon: 'cancel',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    persistent: true,
  }).onOk(async () => {
    try {
      saving.value = true;
      
      await axios.post(`${import.meta.env.VITE_API}saveGroup`, {
        ...formData.value,
        creator: empid(),
      });
      
      success(`Group ${isEdit.value ? 'updated' : 'created'} successfully`);
      showDialog.value = false;
      saving.value = false;
      getGroups();
    } catch (err) {
      saving.value = false;
      error(err.response?.data?.message || 'Failed to save group');
    }
  });
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete group <strong>${row.grp_name}</strong>?`,
    html: true,
    class: `side-${domain()} tw-rounded-2xl`,
    ok: {
      push: true,
      color: 'red-7',
      label: 'Delete',
      icon: 'delete',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    cancel: {
      push: true,
      color: 'grey-7',
      label: 'Cancel',
      icon: 'cancel',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      
      await axios.post(`${import.meta.env.VITE_API}deleteGroup`, {
        grp_id: row.grp_id,
        creator: empid(),
      });
      
      $q.loading.hide();
      success('Group deleted successfully');
      getGroups();
    } catch (err) {
      $q.loading.hide();
      error(err.response?.data?.message || 'Failed to delete group');
    }
  });
};

onMounted(() => {
  getGroups();
});
</script>

