<template>
  <div class="q-pa-md">
    <!-- Header Section -->
    <div class="tw-bg-gradient-to-r tw-from-green-600 tw-to-green-500 tw-px-6 tw-py-4 tw-mb-4 tw-rounded-lg tw-shadow-md">
      <div class="tw-flex tw-justify-between tw-items-center">
        <div>
          <h5 class="tw-text-white tw-text-xl tw-font-semibold tw-mb-1">Data Master User</h5>
          <div class="tw-flex tw-items-center tw-gap-2 tw-text-white/90 tw-text-sm">
            <span>Master</span>
            <q-icon name="chevron_right" size="12px"/>
            <span>Data User</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <q-card class="tw-shadow-lg">
      <q-card-section class="tw-bg-white tw-p-6">
        <!-- Action Button -->
        <div class="tw-mb-4">
          <q-btn 
            v-if="tmpPage.add == '1' || tmpPage.admin == '1'"
            :color="'red-7'"
            icon="add"
            label="Tambah User"
            @click="addUser"
            class="tw-font-semibold"
            no-caps
          />
        </div>

        <!-- Table -->
        <q-table
          v-if="tmpPage.view == '1' || tmpPage.admin == '1'"
          :rows="listUser"
          :columns="columns"
          row-key="emp_id"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 100]"
          :loading="loading"
          :filter="pagination.filter"
          @request="onRequest"
          binary-state-sort
          flat
          bordered
          class="tw-border tw-border-gray-200"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
                <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="tw-bg-gray-700 tw-text-white tw-font-semibold tw-text-xs tw-uppercase"
                >
                        {{ col.label }}
                </q-th>
            </q-tr>
          </template>
          <template v-slot:top-left>
             <div class="row q-col-gutter-sm tw-items-center">
               <div class="col-auto tw-text-sm tw-text-gray-600">
                 Show
               </div>
               <div class="col-auto">
                  <q-select
                  outlined
                  dense
                  debounce="300"
                  v-model="pagination.rowsPerPage"
                  :options="[10, 25, 50, 100]"
                  @update:modelValue="updateTable"
                  style="min-width: 70px"
                  class="tw-text-sm"
                >
                </q-select>  
                </div>
                <div class="col-auto tw-text-sm tw-text-gray-600">
                  entries
                </div>
             </div>    
          </template>
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-2 tw-items-center">
              <span class="tw-text-sm tw-text-gray-600">Search:</span>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                class="tw-bg-white"
                style="min-width: 200px"
              >
              </q-input>
            </div>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-3 tw-px-4 tw-text-sm tw-text-gray-700">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-py-3 tw-px-4 tw-text-sm tw-text-gray-700">
              {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3 tw-px-4">
                <q-btn 
                  v-if="tmpPage.edit == '1' || tmpPage.admin == '1'"
                  flat
                  dense
                  color="orange-7"
                  size="sm"
                  class="tw-mr-1"
                  @click="editUser(props.row)"
                  icon="edit"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Edit
                  </q-tooltip>
                </q-btn>

                <q-btn 
                  v-if="tmpPage.delete == '1' || tmpPage.admin == '1'"
                  flat
                  dense
                  color="pink-7"
                  size="sm"
                  @click="deleteUser(props.row)"
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
    <q-dialog v-model="dialogForm" transition-show="scale" transition-hide="scale">
      <q-card class="tw-w-full tw-max-w-3xl">
        <q-card-section class="tw-bg-blue-600 tw-text-white">
          <div class="text-h6 tw-font-semibold">
            {{ updateForm ? 'Edit User' : 'Tambah User' }}
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12 tw-mb-3">
              <div class="tw-bg-yellow-50 tw-border-l-4 tw-border-yellow-400 tw-p-3">
                <span class="tw-text-yellow-700 tw-text-sm">Field bertanda bintang (*) wajib diisi</span>
              </div>
            </div>
            
            <!-- NIK -->
            <div class="col-md-6 col-12">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                NIK <span class="tw-text-red-500">*</span>
              </label>
              <q-input
                v-model="tmpForm.nik"
                outlined
                dense
                counter maxlength="50" 
                :readonly="updateForm"
                :rules="[val => !!val || 'Field is required']"
                @blur="getHrisByNIK"
              />
            </div>

            <!-- Nama -->
            <div class="col-md-6 col-12">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Nama
              </label>
              <q-input
                v-model="tmpForm.nama"
                outlined
                dense
                counter maxlength="100" 
                readonly
                class="tw-bg-slate-50"
              />
            </div>

            <!-- Email -->
            <div class="col-md-6 col-12">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Email
              </label>
              <q-input
                v-model="tmpForm.email" 
                outlined
                dense
                type="email"
                counter maxlength="100" 
                readonly
                class="tw-bg-slate-50"
              />
            </div>

            <!-- Password -->
            <div class="col-md-6 col-12" v-if="!updateForm">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Password <span class="tw-text-red-500" v-if="!updateForm">*</span>
              </label>
              <q-input
                v-model="tmpForm.password"
                outlined
                dense
                type="password"
                counter maxlength="100"
                :rules="[val => updateForm || !!val || 'Field is required']"
              />
            </div>

            <!-- Divisi -->
            <div class="col-md-6 col-12">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Divisi <span class="tw-text-red-500">*</span>
              </label>
              <q-select
                v-model="tmpForm.divisi"
                :options="listDivisi"
                outlined
                dense
                emit-value
                map-options
                option-value="value"
                option-label="description"
                @update:modelValue="onDivisiChange"
              />
            </div>

            <!-- Departemen -->
            <div class="col-md-6 col-12">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Departemen <span class="tw-text-red-500">*</span>
              </label>
              <q-select
                v-model="tmpForm.dept"
                :options="listDept"
                outlined
                dense
                emit-value
                map-options
                option-value="value"
                option-label="description"
              />
            </div>

            <!-- Role -->
            <div class="col-md-6 col-12">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                Role <span class="tw-text-red-500">*</span>
              </label>
              <q-select
                v-model="tmpForm.role"
                :options="listRole"
                outlined
                dense
                emit-value
                map-options
                option-value="value"
                option-label="label"
              />
            </div>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right" class="tw-p-4 tw-bg-gray-50">
          <q-btn
            label="Close"
            color="grey-7"
            flat
            @click="dialogForm = false"
            class="tw-px-4"
          />
          <q-btn
            label="Save changes"
            color="red-7"
            unelevated
            @click="validateUser"
            class="tw-px-4"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"
import { ParseError, 
        domain, 
        empid,
        admin,
        spinnerBall,
        decrypt,
        decryptMessage} from "./../../utils";
import { useQuasar, Loading } from "quasar";
import * as yup from "yup";
import { useRouter as useVueRouter } from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const router = useVueRouter();
const { success, error } = useNotify();
const columns = [
  {
    name: "no",
    required: true,
    label: "No",
    align: "left",
    field: "no",
  },
  {
    name: "account_name",
    align: "left",
    label: "Nama",
    field: "account_name",
    sortable: true,
  },
  {
    name: "account_email",
    label: "Email",
    align: "left",
    field: "account_email",
    sortable: true,
  },
  {
    name: "divisi_name",
    label: "Divisi",
    align: "left",
    field: "divisi_name",
    sortable: true,
  },
  {
    name: "dept_name",
    label: "Departemen",
    align: "left",
    field: "dept_name",
    sortable: true,
  },
  {
    name: "role_name",
    label: "Akses",
    align: "left",
    field: "role_name",
    sortable: true,
  },
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "center",
    field: "aksi",
  }
];
const $q = useQuasar();
const listUser = ref([]);
const listDivisi = ref([]);
const listDept = ref([]);
const listRole = ref([]);

const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);

const pagination = ref({
  sortBy: "account_name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const tmpForm = reactive({
  id: null,
  nik: null,
  nama: null,
  email: null,
  password: null,
  divisi: null,
  dept: null,
  role: null,
  empid: null,
  creator: empid(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const schema = yup.object({
  nik: yup.string().required("NIK wajib diisi").nullable(),
  email: yup.string().required("Email wajib diisi").email('Format email tidak sesuai').nullable(),
  divisi: yup.string().required("Divisi wajib diisi").nullable(),
  dept: yup.string().required("Departemen wajib diisi").nullable(),
  role: yup.string().required("Role wajib diisi").nullable(),
  password: yup.string().when('$updateForm', {
    is: false,
    then: (schema) => schema.required("Password wajib diisi untuk user baru"),
  }),
});

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: 'master_user',
        domain: domain(),
      }
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    tmpPage.admin = admin();
    Loading.hide()
  } catch (error) {
    console.error('getPageAkses error:', error);
    Loading.hide()
    router.push('/404');
  }
};

const getUser = async () => {
  try {
    spinnerBall()
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    
    const res = await axios.get(`${import.meta.env.VITE_API}users`, {
      params: pagination.value
    });
    
    if (typeof res.data.data === "undefined") {
      listUser.value = res.data;
    } else {
      listUser.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination?.total || res.data.length;
    loading.value = false;
    Loading.hide()
  } catch (error) {
    loading.value = false;
    Loading.hide()
  }
};

const getDivisi = async (selectedId = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}User_Action/get_select_divisi`, {
      params: { id: selectedId }
    });
    listDivisi.value = res.data;
  } catch (error) {
    console.error('getDivisi error:', error);
  }
};

const getDept = async (divisiId, selectedId = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}User_Action/get_select_dept`, {
      params: { 
        iddiv: divisiId,
        iddept: selectedId 
      }
    });
    listDept.value = res.data;
  } catch (error) {
    console.error('getDept error:', error);
  }
};

const getRole = async (selectedId = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}User_Action/get_select_role`, {
      params: { id: selectedId }
    });
    listRole.value = res.data;
  } catch (error) {
    console.error('getRole error:', error);
  }
};

const addUser = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
  await getDivisi();
  await getRole();
};

const editUser = async (value) => {
  try {
    reset();
    updateForm.value = true;
    dialogForm.value = true;
    
    tmpForm.id = value.user_id;
    tmpForm.nik = value.user_nik;
    tmpForm.nama = value.user_name;
    tmpForm.email = value.user_email;
    tmpForm.empid = value.account_username;
    
    await getDivisi(value.user_iddiv);
    tmpForm.divisi = value.user_iddiv;
    
    await getDept(value.user_iddiv, value.user_iddept);
    tmpForm.dept = value.user_iddept;
    
    await getRole(value.user_role);
    tmpForm.role = value.user_role;
  } catch (error) {
    console.log(error)
  }
};

const validateUser = async () => {
  let validate = {
    nik: tmpForm.nik,
    email: tmpForm.email,
    divisi: tmpForm.divisi,
    dept: tmpForm.dept,
    role: tmpForm.role,
    password: tmpForm.password,
  }
  schema.validate(validate, { abortEarly: false, context: { updateForm: updateForm.value } })
    .then(() => {
      saveDialog();
    })
    .catch(err => {
      err.inner.forEach(e => {
        error(e.message);
      });
    });
};

const saveDialog = async () => {
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
      await saveUser();
    } catch (error) {
      // Error handled in saveUser
    }
  });
};

const saveUser = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}User_Action/save_user`, {
      id: tmpForm.id || 0,
      nik: tmpForm.nik,
      name: tmpForm.nama,
      email: tmpForm.email,
      pass: tmpForm.password,
      divisi: tmpForm.divisi,
      dept: tmpForm.dept,
      role: tmpForm.role,
    });
    dialogForm.value = false;
    reset();
    success(updateForm.value ? 'Data berhasil diubah' : 'Data berhasil disimpan');
    await onRequest({
      pagination: pagination.value,
    });
  } catch (error) {
    error(ParseError(error));
  }
};

const deleteUser = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus user <span class="text-bold">${value.user_name}</span>?`,
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
      await axios.get(`${import.meta.env.VITE_API}User_Action/delete_user/${value.user_id}`);
      dialogForm.value = false;
      reset();
      success('Data berhasil dihapus');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      error(ParseError(error));
    }
  });
};

const getHrisByNIK = async () => {
  if (!tmpForm.nik || updateForm.value) return;
  
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}getHrisByNIK`, {
      params: {
        nik: tmpForm.nik,
      },
    });
    
    if (res.data.type === 'success') {
      tmpForm.nama = res.data.name;
      tmpForm.email = res.data.email;
      tmpForm.empid = res.data.empid;
    }
    Loading.hide();
  } catch (error) {
    Loading.hide();
    // Error already shown by API
  }
};

const onDivisiChange = async () => {
  tmpForm.dept = null;
  if (tmpForm.divisi) {
    await getDept(tmpForm.divisi);
  }
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.nik = null;
  tmpForm.nama = null;
  tmpForm.email = null;
  tmpForm.password = null;
  tmpForm.divisi = null;
  tmpForm.dept = null;
  tmpForm.role = null;
  tmpForm.empid = null;
  listDept.value = [];
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getUser();
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
