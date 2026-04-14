<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="admin_panel_settings" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Role</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/role' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Master Role
              </router-link>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          :rows="listRole"
          :columns="columns"
          row-key="id"
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
                :options="[5,10,25,50,100,200]"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn
                unelevated
                color="blue-6"
                label="Tambah Data"
                icon="add"
                @click="addMenu"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search roles..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
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
                  color="light-green-9"
                  icon="visibility"
                  size="sm"
                  @click="detailRole(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Role Akses</q-tooltip>
                </q-btn>
                <q-btn
                  round
                  dense
                  color="light-blue-9"
                  icon="edit"
                  size="sm"
                  @click="editRole(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
                <q-btn
                  round
                  dense
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteRole(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-role_name="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              <div class="tw-flex tw-items-center tw-gap-2">
                <span>{{ props.row.role_name }}</span>
                <q-badge 
                  v-if="props.row.role_admin == 1"
                  color="red-6" 
                  label="ADMIN"
                  class="tw-px-2 tw-py-0.5 tw-font-bold tw-text-xs tw-rounded-full"
                >
                </q-badge>
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

    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit_note" size="32px"/>
            Form Role
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
                <template v-slot:avatar>
                  <q-icon name="info" color="red" size="24px"/>
                </template>
                <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
              </q-banner>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.name"
                outlined
                counter maxlength="50"
                :rules="[val => !!val || 'Field is required']"
                :readonly="updateForm==true"
                label-slot
                class="tw-rounded-lg"
                :class="updateForm ? 'tw-bg-slate-50' : ''"
              >
                <template v-slot:prepend>
                  <q-icon name="admin_panel_settings" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Role Name</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.longname"
                outlined
                counter maxlength="100"
                label="Deskripsi"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                outlined
                v-model="tmpForm.folder_scope"
                use-input
                emit-value
                map-options
                input-debounce="0"
                :options="listFolderScope"
                option-value="code_value"
                option-label="code_value"
                @filter="filterFolderScope"
                clearable
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="folder_open" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Folder Scope</span>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <div class="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-bg-red-50 tw-rounded-lg tw-border tw-border-red-200">
                <q-icon name="warning" color="red-6" size="24px"/>
                <div class="tw-flex-1">
                  <div class="tw-font-semibold tw-text-slate-700">Role Admin</div>
                  <div class="tw-text-xs tw-text-slate-500">Aktifkan untuk memberikan akses admin penuh</div>
                </div>
                <q-toggle
                  v-model="tmpForm.admin"
                  color="red-6"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200"/>
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Batal"
            color="red-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Simpan"
            color="blue-6"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validatRole"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <RoleAksesDialog v-model="dialogRoleAkses" :roleData="selectedRole" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"
import {domain, 
role, 
empid,
admin,
encrypt,
formatDateDMYHM,
decryptMessage,
spinnerBall} from "./../../utils";
import { useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import RoleAksesDialog from "./../../components/master/RoleAksesDialog.vue";
import "./../../assets/styles/table.css";

const router = useRouter();
const { success, error } = useNotify();
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
    name: "role_name",
    required: true,
    label: "Role",
    align: "left",
    field: "role_name",
    sortable: true,
  },
  {
    name: "role_desc",
    required: true,
    label: "Deskripsi",
    align: "left",
    field: "role_desc",
    sortable: true,
  },
  {
    name: "role_folder_scope",
    required: false,
    label: "Folder Scope",
    align: "left",
    field: "role_folder_scope",
    sortable: true,
  },
];
const $q = useQuasar();
const listRole = ref([]);
const listFolderScope = ref([]);
const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
const dialogRoleAkses = ref(false);
const selectedRole = ref(null);
const pagination = ref({
  sortBy: "asc",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
  filter: null,
  domain: domain(),
});

const tmpForm = reactive({
  id: null,
  name: null,
  longname:null,
  admin: false,
  folder_scope: null,
  creator:empid(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const schema = yup.object({
  name:yup.string().required("Role wajib diisi").nullable(),
});

const tmpCodeMaster = reactive({
  needle: null,
  field: 'dms_folder_scope',
  limit: 10
});

const getFolderScopeOptions = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}listCodeMaster`, {
      params: { ...tmpCodeMaster },
      skipErrorInterceptor: true
    });
    listFolderScope.value = res.data;
  } catch (err) {
    console.error('getFolderScopeOptions error:', err);
  }
};

const filterFolderScope = async (val, update) => {
  if (val === '') {
    update(() => {
      tmpCodeMaster.needle = null;
      getFolderScopeOptions();
    });
  } else {
    update(() => {
      tmpCodeMaster.needle = val.toLowerCase();
      getFolderScopeOptions();
    });
  }
};


const getMasterRole = async () => {
  try {
    loading.value = true;
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}role`, {
      params: pagination.value,
      skipErrorInterceptor: true
    });
    // listRole.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listRole.value = res.data;
    } else {
      listRole.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || err?.message || 'Gagal memuat data');
  }
  //tableColor.value = table();
  //cardColor.value = card();
  //headerColor.value = header();
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:empid(),
        page:'/role',
        domain:domain(),
      },
      skipErrorInterceptor: true
    });
    tmpPage.admin=decryptMessage(admin());
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    $q.loading.hide()
  } catch (err) {
    $q.loading.hide()
    router.push('/404');
  }
};

const addMenu = async () => {
  updateForm.value = false;
  reset();
  await getFolderScopeOptions();
  dialogForm.value = true;
};

const detailRole = (value) => {
  console.log(value)
  selectedRole.value = value;
  dialogRoleAkses.value = true;
};

const editRole = async (value) => {
  updateForm.value = true;
  await getFolderScopeOptions();
  tmpForm.name = value.role_name;
  tmpForm.longname = value.role_desc;
  tmpForm.id = value.role_id;
  tmpForm.admin = value.role_admin == 1;
  tmpForm.folder_scope = value.role_folder_scope;
  dialogForm.value = true;
};

const deleteRole = async (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus data <span class="text-bold">${value.role_name}</span>?`,
    html: true,
    class:`side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color:"blue-6",
      label: "Ya, Hapus",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
      // await api.post("deleteRole", value);
      // const res = await api.delete("domains/" + value.id);
      // console.log(res.data);
      spinnerBall()
      await axios.post(`${import.meta.env.VITE_API}deleterole`, {
          id:value.role_id,
          creator:empid()}, {
          skipErrorInterceptor: true
        });
      dialogForm.value = false;
      reset();
      success('Data berhasil dihapus');
      $q.loading.hide();
      // await getMasterRole();
      onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      $q.loading.hide()
      error(err?.response?.data?.message || err?.message || 'Gagal menghapus data');
    }
  });
};

const validatRole = async () => {
  let validate = {
    name : tmpForm.name,
  }
  schema.validate(validate,{ abortEarly: false })
  .then(() => {
         // success process
          saveDialog();
    })
    .catch(err => {
      err.inner.forEach(e => {
        error(e.message);
      });
    });
};


const saveDialog = async (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah data sudah sesuai ?`,
    html: true,
    class:`side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color:"blue-6",
      label: "Ya, Simpan",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
       await saveRole();
    } catch (error) {
      /* $q.notify({
        type: "negative",
        message: ParseError(error),
      }); */
    }
  });
};

const saveRole = async () => {
  const formData = {
    ...tmpForm,
    admin: tmpForm.admin ? 1 : 0
  };
  
  if (updateForm.value) {
    try {
      spinnerBall();
      await axios.post(`${import.meta.env.VITE_API}role`, formData, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      $q.loading.hide()
      success('Data berhasil diubah');
      onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      $q.loading.hide()
      error(err?.response?.data?.message || err?.message || 'Gagal mengubah data');
    }
  } else {
    try {
      spinnerBall()
      await axios.post(`${import.meta.env.VITE_API}role`, formData, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      $q.loading.hide()
      success('Data berhasil disimpan');
      onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      $q.loading.hide()
      error(err?.response?.data?.message || err?.message || 'Gagal menyimpan data');
    }
  }
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.name = null;
  tmpForm.longname = null;
  tmpForm.admin = false;
  tmpForm.folder_scope = null;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getMasterRole();
  
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
