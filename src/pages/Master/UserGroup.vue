<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="group" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">User Group Assignment</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>User Group</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listUserGroup"
          :columns="columns"
          row-key="ugrp_id"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 100]"
          :loading="loading"
          :filter="filter"
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
            <q-select
              borderless
              dense
              v-model="pagination.rowsPerPage"
              :options="[10,25,50,100]"
              @update:modelValue="getData"
            >
              <template v-slot:before>
                <q-icon name="reorder">
                  <q-tooltip class="tw-bg-black/90">Rows per page</q-tooltip>
                </q-icon>
              </template>
            </q-select>  
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
                v-model="filter"
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
                <q-btn 
                  round
                  dense
                  color="blue-6"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="openEditDialog(props.row)"
                  icon="edit"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
                
                <q-btn 
                  round
                  dense
                  color="red-7"
                  size="sm"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="confirmDelete(props.row)"
                  icon="delete"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Delete</q-tooltip>
                </q-btn>
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
            <q-icon name="group_add" size="32px"/>
            {{ isEdit ? 'Edit' : 'Add' }} User Group
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.user_id"
                :options="listUsers"
                option-value="id"
                option-label="label"
                emit-value
                map-options
                outlined
                label="User"
                :readonly="isEdit"
                :rules="[val => !!val || 'User is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
              </q-select>
            </div>
            
            <div class="col-12">
              <q-select
                v-model="form.group_id"
                :options="listGroups"
                option-value="grp_id"
                option-label="grp_name"
                emit-value
                map-options
                outlined
                label="Group"
                :rules="[val => !!val || 'Group is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="group" color="blue-6"/>
                </template>
              </q-select>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="form.bu_id"
                outlined
                label="Business Unit"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6"/>
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
    name: "no",
    required: true,
    label: "No",
    align: "left",
    field: (row, index) => index + 1,
  },
  {
    name: "name",
    required: true,
    label: "Username",
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "email",
    align: "left",
    label: "Email",
    field: "email",
    sortable: true,
  },
  {
    name: "grp_name",
    label: "Group",
    align: "left",
    field: "grp_name",
    sortable: true,
  },
  {
    name: "ugrp_bu_id",
    label: "BU",
    align: "left",
    field: "ugrp_bu_id",
    sortable: true,
  },
];

const listUserGroup = ref([]);
const listUsers = ref([]);
const listGroups = ref([]);
const loading = ref(false);
const dialogForm = ref(false);
const isEdit = ref(false);
const filter = ref('');

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const form = reactive({
  id: null,
  user_id: null,
  group_id: null,
  bu_id: domain(),
});

const getData = async () => {
  try {
    spinnerBall();
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}getUserGroup`, {
      params: {
        bu_id: domain(),
      }
    });
    
    listUserGroup.value = res.data;
    loading.value = false;
    $q.loading.hide();
  } catch (err) {
    loading.value = false;
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const getUsers = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getActiveUsers`);
    listUsers.value = res.data.map(u => ({
      id: u.id,
      label: `${u.name} (${u.email})`
    }));
  } catch (err) {
    error('Failed to load users');
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

const openAddDialog = async () => {
  isEdit.value = false;
  resetForm();
  await getUsers();
  await getGroups();
  dialogForm.value = true;
};

const openEditDialog = async (row) => {
  isEdit.value = true;
  form.id = row.ugrp_id;
  form.user_id = row.ugrp_user_id;
  form.group_id = row.ugrp_group_id;
  form.bu_id = row.ugrp_bu_id;
  await getUsers();
  await getGroups();
  dialogForm.value = true;
};

const saveData = async () => {
  try {
    spinnerBall();
    
    const payload = {
      ...form,
      creator: empid(),
    };
    
    await axios.post(`${import.meta.env.VITE_API}saveUserGroup`, payload);
    
    dialogForm.value = false;
    success(isEdit.value ? 'Data updated successfully' : 'Data saved successfully');
    await getData();
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to save data');
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: "Confirm Delete",
    message: `Are you sure you want to delete user <strong>${row.name}</strong> from group <strong>${row.grp_name}</strong>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deleteUserGroup`, {
        id: row.ugrp_id,
        creator: empid(),
      });
      success('Data deleted successfully');
      await getData();
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to delete data');
    }
  });
};

const resetForm = () => {
  form.id = null;
  form.user_id = null;
  form.group_id = null;
  form.bu_id = domain();
};

onMounted(() => {
  getData();
});
</script>

