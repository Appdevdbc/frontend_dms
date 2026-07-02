<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="people" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master User</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Data User</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          v-if="tmpPage.view =='1' || tmpPage.admin =='1'"
          :rows="listUser"
          :columns="columns"
          row-key="emp_id"
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
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search users..."
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
                label="Tambah User"
                @click="addUser"
                class="tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
              />
            </div>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
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
                  @click="editUser(props.row)"
                  icon="edit"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Edit
                  </q-tooltip>
                </q-btn>

                <q-btn 
                  v-if="tmpPage.delete == '1' || tmpPage.admin == '1'"
                  round
                  dense
                  color="red-7"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
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
    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-4xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit_note" size="32px"/>
            {{ updateForm ? 'Edit User' : 'Tambah User' }}
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
            
            <!-- Left Column -->
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.nik"
                outlined
                counter maxlength="50" 
                :readonly="updateForm"
                :rules="[val => !!val || 'Field is required']"
                @blur="getHrisByNIK"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">NIK</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>

            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.nama"
                outlined
                label="Nama"
                counter maxlength="100" 
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
              </q-input>
            </div>

            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.email" 
                outlined 
                type="email"
                counter maxlength="100" 
                readonly
                label="Email"
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="blue-6"/>
                </template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.divisi"
                :options="listDivisi"
                outlined
                emit-value
                map-options
                option-value="value"
                option-label="label"
                @update:modelValue="onDivisiChange"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Divisi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>

            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.dept"
                :options="listDept"
                outlined
                emit-value
                map-options
                option-value="value"
                option-label="label"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Departemen</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>

            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.role"
                :options="listRole"
                outlined
                emit-value
                map-options
                option-value="value"
                option-label="label"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="admin_panel_settings" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Role</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
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
          <q-btn
            label="Save"
            :color="`${domain()}`"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validateUser"
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
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDivisi`);
    listDivisi.value = res.data;
  } catch (error) {
    console.error('getDivisi error:', error);
  }
};

const getDept = async (divisiId, selectedId = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDept`, {
      params: { 
        iddiv: divisiId
      }
    });
    listDept.value = res.data;
  } catch (error) {
    console.error('getDept error:', error);
  }
};

const getRole = async (selectedId = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getRoles`);
    listRole.value = res.data.map(r => ({
      value: r.role_id,
      label: r.role_name
    }));
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
    tmpForm.nama = value.account_name;
    tmpForm.email = value.account_email;
    tmpForm.empid = value.emp_id;
    
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
  }
  schema.validate(validate, { abortEarly: false })
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
    await axios.post(`${import.meta.env.VITE_API}users`, tmpForm);
    dialogForm.value = false;
    reset();
    success(updateForm.value ? 'Data berhasil diubah' : 'Data berhasil disimpan');
    onRequest({
      pagination: pagination.value,
    });
  } catch (error) {
    error(ParseError(error));
  }
};

const deleteUser = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus user <span class="text-bold">${value.account_name}</span>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deleteusers`, {
        id: value.user_id,
        creator: empid(),
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil dihapus');
      onRequest({
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
