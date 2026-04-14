<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="handyman" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">General Code</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>General Code</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          v-if="tmpPage.view=='1'"
          :rows="listGencode"
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
                @click="addGencode"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search gencodes..."
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
                  color="light-blue-9"
                  icon="edit"
                  size="sm"
                  @click="editGencode(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
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

    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="handyman" size="32px"/>
            Form General Code
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
                v-model="tmpForm.field"
                outlined
                counter maxlength="50"
                :rules="[val => !!val || 'Field is required']"
                :readonly="updateForm == true"
                label-slot
                class="tw-rounded-lg"
                :class="updateForm ? 'tw-bg-slate-50' : ''"
              >
                <template v-slot:prepend>
                  <q-icon name="label" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Field</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.values"
                outlined
                counter maxlength="100"
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="data_object" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Value</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
             <div class="col-12">
              <div class="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-slate-50 tw-rounded-lg">
                <q-icon name="toggle_on" color="blue-6" size="24px"/>
                <span class="tw-font-semibold tw-text-slate-700">Using Domain</span>
                <q-toggle
                  v-model="tmpForm.bydomain"
                  color="green-6"
                  :disable=updateForm
                  :true-value="true"
                  :false-value="false"
                  :label="tmpForm.bydomain === true ? 'True' : 'False'"
                  size="lg"
                />
              </div>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.exchar1"
                outlined
                autogrow
                counter maxlength="500"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Extra Char 1</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.exchar2"
                outlined
                autogrow
                counter maxlength="500"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Extra Char 2</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <div class="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-slate-50 tw-rounded-lg">
                <q-icon name="toggle_on" color="blue-6" size="24px"/>
                <span class="tw-font-semibold tw-text-slate-700">Extra Boolean 1</span>
                <q-toggle
                  v-model="tmpForm.exbool1"
                  color="green-6"
                  :true-value="true"
                  :false-value="false"
                  :label="tmpForm.exbool1 === true ? 'True' : 'False'"
                  size="lg"
                />
              </div>
            </div>
            <div class="col-12">
              <div class="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-slate-50 tw-rounded-lg">
                <q-icon name="toggle_on" color="blue-6" size="24px"/>
                <span class="tw-font-semibold tw-text-slate-700">Extra Boolean 2</span>
                <q-toggle
                  v-model="tmpForm.exbool2"
                  color="green-6"
                  :true-value="true"
                  :false-value="false"
                  :label="tmpForm.exbool2 === true ? 'True' : 'False'"
                  size="lg"
                />
              </div>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.exint1"
                outlined
                label-slot
                class="tw-rounded-lg"
                input-class="text-right"
                @update:modelValue="(event)=>handleNumber(event,'exint1')"
                @focus="readNumber('exint1')"
                @blur="finalizeNumber('exint1')"
              >
                <template v-slot:prepend>
                  <q-icon name="text_fields" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Extra Int 1</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.exint2"
                outlined
                label-slot
                class="tw-rounded-lg"
                input-class="text-right"
                @update:modelValue="(event)=>handleNumber(event,'exint2')"
                @focus="readNumber('exint2')"
                @blur="finalizeNumber('exint2')"
              >
                <template v-slot:prepend>
                  <q-icon name="text_fields" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Extra Int 2</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.exdec1"
                outlined
                label-slot
                class="tw-rounded-lg"
                input-class="text-right"
                @update:modelValue="(event)=>handleNumber(event,'exdec1')"
                @focus="readNumber('exdec1')"
                @blur="finalizeNumber('exdec1')"
              >
                <template v-slot:prepend>
                  <q-icon name="text_fields" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Extra Dec 1</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.exdec2"
                outlined
                label-slot
                class="tw-rounded-lg"
                input-class="text-right"
                @update:modelValue="(event)=>handleNumber(event,'exdec2')"
                @focus="readNumber('exdec2')"
                @blur="finalizeNumber('exdec2')"
              >
                <template v-slot:prepend>
                  <q-icon name="text_fields" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Extra Dec 2</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <div class="tw-flex tw-items-center tw-gap-4 tw-p-4 tw-bg-slate-50 tw-rounded-lg">
                <q-icon name="toggle_on" color="blue-6" size="24px"/>
                <span class="tw-font-semibold tw-text-slate-700">Status</span>
                <q-toggle
                  v-model="tmpForm.status"
                  color="green-6"
                  :true-value="'Active'"
                  :false-value="'Not Active'"
                  :label="tmpForm.status"
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
            @click="validateGencode"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"
import { domain, 
role, 
admin,
decryptMessage,
empid,
spinnerBall,
formatDateDMYHM,} from "./../../utils";
import { useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import numeral from "numeral";
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
    name: "code_field",
    required: true,
    label: "field",
    align: "left",
    field: "code_field",
    sortable: true,
  },
  {
    name: "code_value",
    required: true,
    label: "value",
    align: "left",
    field: "code_value",
    sortable: true,
  },
];
const $q = useQuasar();
const listGencode = ref([]);
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
  id: null,
  bydomain:false,
  domain:domain(),
  field: null,
  values: null,
  exchar1: null,
  exchar2: null,
  exbool1: false,
  exbool2: false,
  exint1: null,
  exint1_raw: null,
  exint2: null,
  exint2_raw: null,
  exdec1: null,
  exdec1_raw: null,
  exdec2: null,
  exdec2_raw: null,
  status:'Active',
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
  field:yup.string().required("Field wajib diisi").nullable(),
  values: yup.string().required("Value wajib diisi").nullable(),
});


const getGencode = async () => {
  try {
    loading.value = true;
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}listCodeMaster`, {
      params: pagination.value,
      skipErrorInterceptor: true
    });
    // listGencode.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listGencode.value = res.data;
    } else {
      listGencode.value = res.data.data;
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
        page:'/general-code',
        domain:domain()
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    tmpPage.admin=decryptMessage(admin());
    $q.loading.hide()
  } catch (err) {
    $q.loading.hide()
    router.push('/404');
  }
};

const addGencode = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
};

const editGencode = (value) => {
  updateForm.value = true;
  dialogForm.value = true;
  reset();
  tmpForm.id = value.code_id;
  tmpForm.bydomain = value.code_domain?true:false;
  tmpForm.domain = value.code_domain;
  tmpForm.field = value.code_field;
  tmpForm.values = value.code_value;
  tmpForm.exchar1 = value.code_varchar01;
  tmpForm.exchar2 = value.code_varchar02;
  tmpForm.exbool1 = value.code_boolean01;
  tmpForm.exbool2 = value.code_boolean02;
  tmpForm.exint1 = numeral(value.code_int01).format('0,0');
  tmpForm.exint1_raw = value.code_int01;
  tmpForm.exint2 = numeral(value.code_int02).format('0,0');
  tmpForm.exint2_raw = value.code_int02;
  tmpForm.exdec1 = numeral(value.code_dec01).format('0,0.00');
  tmpForm.exdec1_raw = value.code_dec01;
  tmpForm.exdec2 = numeral(value.code_dec02).format('0,0.00');
  tmpForm.exdec2_raw = value.code_dec02;
  tmpForm.status = value.code_status;
};

const validateGencode = async () => {
  let validate = {
    field: tmpForm.field,
    values: tmpForm.values,
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
       await saveGencode();
    } catch (error) {
      /* $q.notify({
        type: "negative",
        message: ParseError(error),
      }); */
    }
  });
};

const saveGencode = async () => {
  // Encode special characters to prevent loss during transmission
  const encodedForm = {
    ...tmpForm,
    exchar1: tmpForm.exchar1 ? encodeURIComponent(tmpForm.exchar1) : null,
    exchar2: tmpForm.exchar2 ? encodeURIComponent(tmpForm.exchar2) : null,
  };
  
  if (updateForm.value) {
    try {
      await axios.post(`${import.meta.env.VITE_API}saveCodeMaster`, encodedForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil diubah');
      onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      error(err?.response?.data?.message || err?.message || 'Gagal mengubah data');
    }
  } else {
    try {
      await axios.post(`${import.meta.env.VITE_API}saveCodeMaster`, encodedForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil disimpan');
      onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      error(err?.response?.data?.message || err?.message || 'Gagal menyimpan data');
    }
  }
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.bydomain = false;
  tmpForm.domain = domain();
  tmpForm.fldinitial = null;
  tmpForm.field= null
  tmpForm.values = null;
  tmpForm.exchar1 = null
  tmpForm.exchar2 = null
  tmpForm.exbool1 = false
  tmpForm.exbool2 = false
  tmpForm.exint1 = null
  tmpForm.exint1_raw = null
  tmpForm.exint2 = null
  tmpForm.exint2_raw = null
  tmpForm.exdec1 = null
  tmpForm.exdec1_raw = null
  tmpForm.exdec2 = null
  tmpForm.exdec2_raw=null 
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getGencode();
  
};


const handleNumber = (event, field) => {
    let value = event.replace(/[^0-9.]/g, '');
    
    if (field === 'exint1' || field === 'exint2') {
        value = value.replace(/\./g, '');
        tmpForm[field] = value ? parseInt(value) : 0;
        tmpForm[`${field}_raw`] = value ? parseInt(value) : 0;
    } else if (field === 'exdec1' || field === 'exdec2') {
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        tmpForm[field] = value;
        tmpForm[`${field}_raw`] = value;
    }
}

const readNumber = (field) => {
    if (field === 'exint1' || field === 'exint2') {
        tmpForm[field] = tmpForm[`${field}_raw`] != null ? numeral(tmpForm[`${field}_raw`]).value() : '';
       // tmpForm[field] != null ? tmpForm[field] : 0;
    } else if (field === 'exdec1' || field === 'exdec2') {
        tmpForm[field] = tmpForm[field] != null ? tmpForm[field] : '0.00';
    }
};

const finalizeNumber = (field) => {
    if (field === 'exint1' || field === 'exint2') {
        //tmpForm[field] = tmpForm[field] != null ? parseInt(tmpForm[field]) || 0 : 0;
        tmpForm[field] = tmpForm[`${field}_raw`] != null ? numeral(tmpForm[`${field}_raw`]).format('0,0') : '';
    } else if (field === 'exdec1' || field === 'exdec2') {
        //tmpForm[field] = tmpForm[field] != null ? parseFloat(tmpForm[field]).toFixed(2) : '0.00';
        tmpForm[field] = tmpForm[`${field}_raw`] != null ? numeral(tmpForm[`${field}_raw`]).format('0,0.00') : '';
    }
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
