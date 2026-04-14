<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="archive" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Arsip Lokasi</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/master-arsip-lokasi' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Master Arsip Lokasi
              </router-link>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-space-y-3">
          <BusinessUnitSelect v-model="filterBu" :required="false" :rules="[]" />
          <div class="tw-flex tw-gap-3">
            <q-btn
              unelevated
              color="blue-6"
              label="Tampilkan"
              icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg"
              @click="updateTable"
            />
            <q-btn
              unelevated
              color="green-6"
              label="Excel"
              icon="download"
              class="tw-font-semibold tw-px-4 tw-rounded-lg"
              @click="downloadExcel"
            />
          </div>
        </div>
        <div class="tw-mt-4 tw-mx-auto tw-w-[90%] tw-h-0.5 tw-bg-gradient-to-r tw-from-transparent tw-via-slate-300 tw-to-transparent"></div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          v-if="tmpPage.view=='1'"
          :rows="listLokasiArsip"
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
                v-if="tmpPage.add=='1'"
                unelevated
                color="blue-6"
                label="Tambah Data" 
                icon="add"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
                @click="addLokasiArsip" 
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search ..."
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
                  v-if="tmpPage.edit=='1'"
                  round
                  dense
                  color="light-blue-9"
                  icon="edit"
                  size="sm"
                  @click="editLokasiArsip(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-lokasi_arsip_status="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge 
                :color="props.row.lokasi_arsip_status == 1 ? 'green-6' : 'red-6'" 
                :label="props.row.lokasi_arsip_status == 1 ? 'Active' : 'Inactive'"
                class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"
              >
                <q-icon 
                  :name="props.row.lokasi_arsip_status == 1 ? 'check_circle' : 'cancel'" 
                  size="14px" 
                  class="tw-mr-1"
                />
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-col_name="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              <div class="tw-flex tw-items-center tw-gap-2">
                <q-icon :name="props.row.col_icon" color="blue-6" size="20px" />
                <span>{{ props.value }}</span>
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
      <q-card class="tw-w-full tw-max-w-lg tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="archive" size="32px"/>
            Form Arsip Lokasi
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
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
              <q-select
                outlined
                :disable="updateForm"
                v-model="tmpForm.user"
                use-input
                emit-value
                map-options
                input-debounce="0"
                :rules="[val => !!val || 'Field is required']"
                :options="listUser"
                option-value="account_username"
                :option-label="opt => `${opt.account_nik} - ${opt.account_name}`"
                @filter="filterUser"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">User</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12" v-if="tmpForm.user">
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4 tw-space-y-3">
                <div class="tw-flex tw-items-center tw-gap-3">
                  <span class="tw-text-slate-600 tw-font-medium tw-w-32">Bisnis Unit</span>
                  <q-badge color="blue-3" text-color="blue-9" class="tw-px-4 tw-py-2 tw-rounded-full">
                    <q-icon name="business" size="14px" class="tw-mr-1"/>
                    {{ tmpForm.bu }}
                  </q-badge>
                </div>
                <div class="tw-flex tw-items-center tw-gap-3">
                  <span class="tw-text-slate-600 tw-font-medium tw-w-32">Departemen</span>
                  <q-badge color="purple-3" text-color="purple-9" class="tw-px-4 tw-py-2 tw-rounded-full">
                    <q-icon name="apartment" size="14px" class="tw-mr-1"/>
                    {{ tmpForm.dept }}
                  </q-badge>
                </div>
                <div class="tw-flex tw-items-center tw-gap-3">
                  <span class="tw-text-slate-600 tw-font-medium tw-w-32">Divisi</span>
                  <q-badge color="teal-3" text-color="teal-9" class="tw-px-4 tw-py-2 tw-rounded-full">
                    <q-icon name="domain" size="14px" class="tw-mr-1"/>
                    {{ tmpForm.div }}
                  </q-badge>
                </div>
              </div>
            </div>
            <div class="col-12">
              <q-select
                outlined
                :disable="!tmpForm.user"
                v-model="tmpForm.lokasi"
                use-input
                emit-value
                map-options
                input-debounce="0"
                :rules="[val => !!val || 'Field is required']"
                :options="listLokasi"
                option-value="lokasi_arsip_id"
                option-label="lokasi_arsip_name"
                @filter="filterLokasi"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Lokasi Arsip</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <div class="tw-border tw-border-gray-300 tw-rounded-lg tw-p-4">
                <div class="tw-flex tw-items-center tw-justify-between">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <q-icon name="toggle_on" color="blue-6" size="24px"/>
                    <span class="tw-font-semibold tw-text-slate-700">Status</span>
                  </div>
                  <q-toggle
                    v-model="tmpForm.status"
                    :true-value="1"
                    :false-value="0"
                    color="green-6"
                    :label="tmpForm.status === 1 ? 'Active' : 'Inactive'"
                    class="tw-font-semibold"
                  />
                </div>
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
            @click="validateApp" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from "vue";
import axios, { HttpStatusCode } from "axios"
import { ParseError, excelDownload, domain, 
role, empid,table,card,
header,
encrypt,
decrypt,
decryptMessage,
spinnerBall} from "../../../utils";
import { Loading, useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import BusinessUnitSelect from "../../../components/WJS/master/BusinessUnitSelect.vue";
import "./../../../assets/styles/table.css";

const router = useRouter();
const { success, error: showError } = useNotify();
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
    name: "account_nik",
    required: true,
    label: "NIK",
    align: "left",
    field: "account_nik",
    sortable: true,
    classes: 'sticky-column-left-2',
    headerClasses: 'sticky-column-left-2-header'
  },
  {
    name: "account_name",
    required: true,
    label: "Nama",
    align: "left",
    field: "account_name",
    sortable: true,
  },
  {
    name: "account_bu",
    required: true,
    label: "Bisnis Unit",
    align: "left",
    field: "account_bu",
    sortable: true,
  },
  {
    name: "account_dept_name",
    required: true,
    label: "Departemen",
    align: "left",
    field: "account_dept_name",
    sortable: true,
  },
  {
    name: "account_div_name",
    required: true,
    label: "Divisi",
    align: "left",
    field: "account_div_name",
    sortable: true,
  },
  {
    name: "lokasi_arsip_name",
    required: true,
    label: "Nama Lokasi Arsip",
    align: "left",
    field: "lokasi_arsip_name",
    sortable: true,
  },
  {
    name: "lokasi_arsip_status",
    required: true,
    label: "Status",
    align: "left",
    field: "lokasi_arsip_status",
  },
];
const $q = useQuasar();
const listLokasiArsip = ref([]);
const listUser = ref([]);
const listLokasi = ref([]);
const listDomains = ref([]);
const listDomainsFull = ref([]);
const filterBu = ref(null);
const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
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
  id:null,
  user:null,
  bu: null,
  dept:null,
  div:null,
  lokasi: null,
  status: 1,
  creator:empid(),
});

const tmpUser = reactive({
  code: null,
  needle: null,
  limit:10,
});

const tmpLokasi = reactive({
  code: null,
  needle: null,
  bu_id:null,
  limit:10,
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const schema = yup.object({
  user: yup.string().required("User wajib diisi").nullable(),
  lokasi: yup.string().required("Nama Lokasi Arsip wajib diisi").nullable(),
});

const getLokasiArsip = async () => {
  try {
    loading.value = true;
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listArsipLokasi`, {
      params: {
        ...pagination.value,
        bu_id: filterBu.value
      },
      skipErrorInterceptor: true
    });
    // listLokasiArsip.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listLokasiArsip.value = res.data;
    } else {
      listLokasiArsip.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    showError(error?.message || error || 'Terjadi kesalahan');
  }
  //tableColor.value = table();
  //cardColor.value = card();
  //headerColor.value = header();
};

const addLokasiArsip = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
  tmpForm.status = 1
};

const editLokasiArsip = async (value) => {
  try {
    console.log(value)
    reset();
    updateForm.value = true;
    tmpUser.code = value.arsiparis_emp_id;
    tmpLokasi.code = value.arsiparis_lokasi_arsip_id;
    tmpLokasi.bu_id = value.account_bu;
    await Promise.all([getListUser(), getListLokasi()]);
    tmpForm.id = value.arsiparis_id;
    tmpForm.bu = value.account_bu;
    tmpForm.dept = value.account_dept_name;
    tmpForm.div = value.account_div_name;
    tmpForm.user = value.arsiparis_emp_id;
    tmpForm.lokasi = value.arsiparis_lokasi_arsip_id;
    tmpForm.status = value.lokasi_arsip_status;
    dialogForm.value = true;
  } catch (err) {
    console.log(err)
    showError('Gagal memuat data untuk edit');
  }
};

const validateApp = async () => {
  let validate = {
    user: tmpForm.user,
    lokasi: tmpForm.lokasi,
  }
  schema.validate(validate, { abortEarly: false })
  .then(() => {
      saveLokasiArsip();
    })
    .catch(err => {
      err.inner.forEach(e => {
        showError(e.message);
      });
    });
};

const saveLokasiArsip = async () => {
  if (updateForm.value) {
    try {
      await axios.post(`${import.meta.env.VITE_API}dms/saveArsipLokasi`, {
        ...tmpForm,
        update: true
      }, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil diubah');
      onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || 'Gagal mengubah data');
    }
  } else {
    try {
      await axios.post(`${import.meta.env.VITE_API}dms/saveArsipLokasi`, tmpForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil disimpan');
      onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      console.log(error)
      showError(error?.response?.data?.message || error?.message || 'Gagal menyimpan data');
    }
  }
};

const getDomains = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}domains`, {
      skipErrorInterceptor: true
    });
    listDomainsFull.value = res.data;
    listDomains.value = res.data;
  } catch (error) {
    console.error('getDomains error:', error);
  }
};

const filterDomains = (val, update) => {
  update(() => {
    if (val === '') {
      listDomains.value = listDomainsFull.value;
    } else {
      const needle = val.toLowerCase();
      listDomains.value = listDomainsFull.value.filter(v => 
        v.bu_id.toLowerCase().indexOf(needle) > -1 || 
        v.bu_name.toLowerCase().indexOf(needle) > -1
      );
    }
  })
}

const getListUser = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}users`, {
      params: {
        ...tmpUser,
      },
      skipErrorInterceptor: true
    });
    listUser.value = res.data;
  } catch (error) {
    console.error('getListUser error:', error);
  } 
};

const filterUser = async (val, update) => {
  if (val === '') {
    update(() => {
      tmpUser.needle = null;
      tmpUser.code = null;
      getListUser();
    })
  } else {
    update(() => {
      tmpUser.needle = val.toLowerCase();
      getListUser();
    })
  }
}

const getListLokasi = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listLokasiArsip`, {
      params: {
        ...tmpLokasi,
      },
      skipErrorInterceptor: true
    });
    listLokasi.value = res.data
  } catch (error) {
    console.error('getLokasi error:', error);
  } 
};

const filterLokasi = async (val, update) => {
  if (val === '') {
    update(() => {
      tmpLokasi.needle = null;
      tmpLokasi.code = null;
      getListLokasi();
    })
  } else {
    update(() => {
      tmpLokasi.needle = val.toLowerCase();
      getListLokasi();
    })
  }
}

const reset = () => {
  tmpForm.id = null;
  tmpForm.user = null;
  tmpForm.bu = null;
  tmpForm.dept = null;
  tmpForm.div = null;
  tmpForm.lokasi = null;
  tmpForm.status = null;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getLokasiArsip();
  
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const downloadExcel = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listArsipLokasi`, {
      params: {
        ...pagination.value,
        bu_id: filterBu.value,
        excel: true
      },
      responseType: 'blob',
      skipErrorInterceptor: true
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Master_Lokasi_Arsip.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    showError(error?.message || 'Gagal mengunduh Excel');
  }
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:empid(),
        page:'/dms/master-arsip-lokasi',
        domain:domain(),
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    Loading.hide()
  } catch (error) {
    console.log(error)
    Loading.hide()
    router.push('/404');
  }
};


onMounted(() => {
  getPageAkses();
  onRequest({
    pagination: pagination.value,
  });
});

// Watch dialog close to reset
watch(dialogForm, (newVal) => {
  if (!newVal) {
    // Dialog closed, reset after a short delay
    setTimeout(() => {
      reset();
    }, 100);
  }
});

// Watch user selection to set bu_id for lokasi filter
watch(() => tmpForm.user, (newVal, oldVal) => {
  if (!updateForm.value) {
    tmpForm.lokasi = null;
  }
  if (newVal) {
    const user = listUser.value.find(u => u.account_username === newVal);
    if (user) {
      tmpForm.bu = user.account_bu;
      tmpForm.dept = user.account_dept_name;
      tmpForm.div = user.account_div_name;
      tmpLokasi.bu_id = user.account_bu;
    }
  } else {
    tmpForm.bu = null;
    tmpForm.dept = null;
    tmpForm.div = null;
  }
});

</script>

