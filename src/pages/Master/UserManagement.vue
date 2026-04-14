<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="people" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">User Management</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Users</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listUser"
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
                label="Add User"
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
          
          <template v-slot:body-cell-activated="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge 
                :color="props.row.activated ? 'green-6' : 'red-6'" 
                :label="props.row.activated ? 'Active' : 'Inactive'"
                class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"
              />
            </q-td>
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
                  :color="props.row.activated ? 'red-6' : 'green-6'"
                  :icon="props.row.activated ? 'block' : 'check_circle'"
                  size="sm"
                  @click="toggleActivation(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    {{ props.row.activated ? 'Deactivate' : 'Activate' }}
                  </q-tooltip>
                </q-btn>
                
                <q-btn
                  round
                  dense
                  color="purple-6"
                  icon="admin_panel_settings"
                  size="sm"
                  @click="openGroupDialog(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Setup Group</q-tooltip>
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
            <q-icon name="person_add" size="32px"/>
            {{ isEdit ? 'Edit' : 'Add' }} User
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.nik"
                outlined
                label="NIK"
                :readonly="isEdit"
                :rules="[val => !!val || 'NIK is required']"
                @blur="!isEdit && getHrisByNIK()"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="blue-6"/>
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="form.first_name"
                outlined
                label="Nama"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="form.email"
                outlined
                label="Email"
                type="email"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="blue-6"/>
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

    <!-- Group Assignment Dialog -->
    <q-dialog v-model="dialogGroup" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-3xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="admin_panel_settings" size="32px"/>
            Setup User Group
          </div>
          <div class="tw-text-white tw-text-sm tw-mt-2">
            {{ selectedUser?.first_name }} ({{ selectedUser?.name }})
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="groupForm.bu_id"
                :options="listBU"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                label="Business Unit"
                @update:model-value="loadUserGroups"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6"/>
                </template>
              </q-select>
            </div>
            
            <div class="col-6">
              <q-select
                v-model="groupForm.group_id"
                :options="listGroups"
                option-value="grp_id"
                option-label="grp_name"
                emit-value
                map-options
                outlined
                label="Group"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="group" color="blue-6"/>
                </template>
              </q-select>
            </div>
            
            <div class="col-12">
              <q-btn
                unelevated
                color="green-6"
                label="Add Group"
                icon="add"
                @click="addUserGroup"
                class="tw-font-semibold tw-px-4 tw-rounded-lg"
              />
            </div>
            
            <div class="col-12">
              <q-separator class="tw-my-2"/>
              <div class="tw-font-semibold tw-text-slate-700 tw-mb-3">Assigned Groups:</div>
              <q-list bordered class="tw-rounded-lg">
                <q-item v-for="ug in userGroups" :key="ug.ugrp_id">
                  <q-item-section avatar>
                    <q-icon name="group" color="purple-6"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ ug.grp_name }}</q-item-label>
                    <q-item-label caption>{{ ug.ugrp_bu_id }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      round
                      dense
                      flat
                      color="red-6"
                      icon="delete"
                      @click="removeUserGroup(ug)"
                    />
                  </q-item-section>
                </q-item>
                <q-item v-if="userGroups.length === 0">
                  <q-item-section class="tw-text-center tw-text-slate-500">
                    No groups assigned yet
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200"/>
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Close"
            color="grey-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
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
    name: "name",
    required: true,
    label: "NIK",
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "first_name",
    align: "left",
    label: "Name",
    field: "first_name",
    sortable: true,
  },
  {
    name: "email",
    label: "Email",
    align: "left",
    field: "email",
    sortable: true,
  },
  {
    name: "activated",
    label: "Status",
    align: "left",
    field: "activated",
  },
];

const listUser = ref([]);
const listGroups = ref([]);
const listBU = ref([
  { value: 'WNR', label: 'WNR - Workshop' },
  { value: 'DFR', label: 'DFR - DBC Freight' },
  // Add more BUs as needed
]);
const userGroups = ref([]);
const loading = ref(false);
const dialogForm = ref(false);
const dialogGroup = ref(false);
const isEdit = ref(false);
const selectedUser = ref(null);

const pagination = ref({
  sortBy: "name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const form = reactive({
  id: null,
  nik: null,
  first_name: null,
  email: null,
  emp_id: null,
  activated: true,
});

const groupForm = reactive({
  bu_id: 'WNR',
  group_id: null,
});

const getData = async () => {
  try {
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}getUsers`, {
      params: pagination.value,
    });
    
    if (typeof res.data.data === "undefined") {
      listUser.value = res.data;
    } else {
      listUser.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const getGroups = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getGroups`);
    listGroups.value = res.data;
  } catch (err) {
    error('Failed to load groups');
  }
};

const getHrisByNIK = async () => {
  if (!form.nik) return;
  
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}getHrisByNIK`, {
      params: { nik: form.nik }
    });
    
    form.first_name = res.data.name;
    form.email = res.data.email;
    form.emp_id = res.data.empid;
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'User not found in HRIS');
  }
};

const openAddDialog = async () => {
  isEdit.value = false;
  resetForm();
  dialogForm.value = true;
};

const openEditDialog = async (row) => {
  isEdit.value = true;
  form.id = row.id;
  form.nik = row.name;
  form.first_name = row.first_name;
  form.email = row.email;
  form.emp_id = row.emp_id;
  form.activated = row.activated;
  dialogForm.value = true;
};

const saveData = async () => {
  try {
    spinnerBall();
    
    const payload = {
      ...form,
      creator: empid(),
    };
    
    await axios.post(`${import.meta.env.VITE_API}saveUserData`, payload);
    
    dialogForm.value = false;
    success(isEdit.value ? 'User updated successfully' : 'User added successfully');
    onRequest({
      pagination: pagination.value,
    });
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to save user');
  }
};

const toggleActivation = async (row) => {
  $q.dialog({
    title: "Confirm",
    message: `Are you sure you want to ${row.activated ? 'deactivate' : 'activate'} user <strong>${row.first_name}</strong>?`,
    html: true,
    class: `side-${domain()} tw-rounded-2xl`,
    ok: {
      push: true,
      color: row.activated ? "red-7" : "green-6",
      label: row.activated ? "Deactivate" : "Activate",
      icon: row.activated ? "block" : "check_circle",
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
      await axios.post(`${import.meta.env.VITE_API}toggleUserActivation`, {
        id: row.id,
        activated: !row.activated,
        creator: empid(),
      });
      success(`User ${row.activated ? 'deactivated' : 'activated'} successfully`);
      onRequest({
        pagination: pagination.value,
      });
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to update user status');
    }
  });
};

const openGroupDialog = async (row) => {
  selectedUser.value = row;
  groupForm.bu_id = 'WNR';
  groupForm.group_id = null;
  await getGroups();
  await loadUserGroups();
  dialogGroup.value = true;
};

const loadUserGroups = async () => {
  if (!selectedUser.value) return;
  
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getUserGroupsByUser`, {
      params: {
        user_id: selectedUser.value.emp_id,
        bu_id: groupForm.bu_id,
      }
    });
    userGroups.value = res.data;
  } catch (err) {
    error('Failed to load user groups');
  }
};

const addUserGroup = async () => {
  if (!groupForm.group_id) {
    error('Please select a group');
    return;
  }
  
  try {
    spinnerBall();
    await axios.post(`${import.meta.env.VITE_API}saveUserGroup`, {
      user_id: selectedUser.value.emp_id,
      group_id: groupForm.group_id,
      bu_id: groupForm.bu_id,
      creator: empid(),
    });
    
    success('Group assigned successfully');
    groupForm.group_id = null;
    await loadUserGroups();
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to assign group');
  }
};

const removeUserGroup = async (ug) => {
  $q.dialog({
    title: "Confirm Delete",
    message: `Remove group <strong>${ug.grp_name}</strong> from this user?`,
    html: true,
    class: `side-${domain()} tw-rounded-2xl`,
    ok: {
      push: true,
      color: "red-7",
      label: "Remove",
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
      await axios.post(`${import.meta.env.VITE_API}deleteUserGroup`, {
        id: ug.ugrp_id,
        creator: empid(),
      });
      success('Group removed successfully');
      await loadUserGroups();
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to remove group');
    }
  });
};

const resetForm = () => {
  form.id = null;
  form.nik = null;
  form.first_name = null;
  form.email = null;
  form.emp_id = null;
  form.activated = true;
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

