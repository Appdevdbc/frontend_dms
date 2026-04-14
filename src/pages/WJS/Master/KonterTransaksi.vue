<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assessment" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master No Konter Transaksi</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/master-konter-transaksi' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Master No Konter Transaksi
              </router-link>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-space-y-3">
          <SubKategoriDokumenSelect v-model="filterSubKat" :required="false" :rules="[]" />
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
          :rows="listKonterTransaksi"
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
                @click="addKonter" 
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
                  @click="editKonter(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-ctr_status="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge 
                :color="props.row.ctr_status == 1 ? 'green-6' : 'red-6'" 
                :label="props.row.ctr_status == 1 ? 'Active' : 'Inactive'"
                class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"
              >
                <q-icon 
                  :name="props.row.ctr_status == 1 ? 'check_circle' : 'cancel'" 
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
            <q-icon name="assessment" size="32px"/>
            Form Master No Konter Transaksi
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
                v-model="tmpForm.kode_jenis"
                :disable="updateForm"
                use-input
                emit-value
                map-options
                input-debounce="0"
                :rules="[val => !!val || 'Field is required']"
                :options="listSubKatDocOptions"
                option-value="sub_arsip_id"
                option-label="sub_arsip_kd_id"
                @filter="filterSubKatDocOptions"
                clearable
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="tag" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kode Jenis</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.sub_arsip_kd_id }}</q-item-label>
                      <q-item-label caption>Kategori: {{ scope.opt.sub_arsip_categ }} | Jenis: {{ scope.opt.sub_arsip_jenis }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <div class="tw-flex tw-flex-col">
                    <span class="tw-font-semibold">{{ scope.opt.sub_arsip_kd_id }}</span>
                    <span class="tw-text-xs tw-text-gray-600">Kategori: {{ scope.opt.sub_arsip_categ }} | Jenis: {{ scope.opt.sub_arsip_jenis }}</span>
                  </div>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                outlined
                v-model="tmpForm.bisnis"
                :disable="updateForm"
                use-input
                emit-value
                map-options
                input-debounce="0"
                :rules="[val => !!val || 'Field is required']"
                :options="listMappingBUOptions"
                option-value="map_kd_bu_id"
                option-label="map_desc_kd_bu"
                @filter="filterMappingBUOptions"
                clearable
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Bisnis Unit</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.map_desc_kd_bu }}</q-item-label>
                      <q-item-label caption>Kode BU: {{ scope.opt.map_mstr_bu_id }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <div class="tw-flex tw-flex-col">
                    <span class="tw-font-semibold">{{ scope.opt.map_desc_kd_bu }}</span>
                    <span class="tw-text-xs tw-text-gray-600">Kode BU: {{ scope.opt.map_mstr_bu_id }}</span>
                  </div>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-input 
                v-model="tmpForm.counter" 
                outlined 
                :readonly="updateForm"
                :rules="[val => !!val || 'Field is required']" 
                label-slot
                class="tw-rounded-lg"
                @update:model-value="handleCounterInput"
                @keypress="onlyNumber"
              >
                <template v-slot:prepend>
                  <q-icon name="pin" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Counter</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input 
                v-model="tmpForm.counter_terakhir" 
                outlined 
                :readonly="true"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="history" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Counter Terakhir</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <div class="tw-border tw-border-gray-300 tw-rounded-lg tw-p-4 tw-space-y-3">
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <q-icon name="checklist" color="blue-6" size="24px"/>
                  <span class="tw-font-semibold tw-text-slate-700">Opsi Tambahan</span>
                </div>
                <div class="tw-flex tw-items-center tw-gap-4">
                  <span class="tw-text-slate-700 tw-font-semibold tw-min-w-[180px]">Kode Divisi?</span>
                  <q-option-group
                    v-model="tmpForm.kode_divisi"
                    :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]"
                    color="blue-6"
                    inline
                  />
                </div>
                <div class="tw-flex tw-items-center tw-gap-4">
                  <span class="tw-text-slate-700 tw-font-semibold tw-min-w-[180px]">Kode BU?</span>
                  <q-option-group
                    v-model="tmpForm.kode_bu_flag"
                    :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]"
                    color="blue-6"
                    inline
                  />
                </div>
                <div class="tw-flex tw-items-center tw-gap-4">
                  <span class="tw-text-slate-700 tw-font-semibold tw-min-w-[180px]">Kode Worklocation?</span>
                  <q-option-group
                    v-model="tmpForm.kode_worklocation"
                    :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]"
                    color="blue-6"
                    inline
                  />
                </div>
                <div class="tw-flex tw-items-center tw-gap-4">
                  <span class="tw-text-slate-700 tw-font-semibold tw-min-w-[180px]">Tahun & Bulan?</span>
                  <q-option-group
                    v-model="tmpForm.tahun_bulan"
                    :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]"
                    color="blue-6"
                    inline
                  />
                </div>
                <div class="tw-flex tw-items-center tw-gap-4">
                  <span class="tw-text-slate-700 tw-font-semibold tw-min-w-[180px]">Reset ke-1 Per Tahun?</span>
                  <q-option-group
                    v-model="tmpForm.reset_per_tahun"
                    :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]"
                    color="blue-6"
                    inline
                  />
                </div>
              </div>
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
import { ref, onMounted, reactive, watch, nextTick } from "vue";
import axios, { HttpStatusCode } from "axios"
import { ParseError, excelDownload, domain, 
role, empid,
encrypt,
decrypt,
decryptMessage,
spinnerBall} from "../../../utils";
import { Loading, useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import { useNumeral } from "../../../helpers/useNumeral";
import SubKategoriDokumenSelect from "../../../components/WJS/master/SubKategoriDokumenSelect.vue";
import "./../../../assets/styles/table.css";

const router = useRouter();
const { success, error: showError } = useNotify();
const { formatInteger, unformatNumber, onlyNumber } = useNumeral();
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
    name: "sub_arsip_kd_id",
    required: true,
    label: "Kode Jenis",
    align: "left",
    field: "sub_arsip_kd_id",
    sortable: true,
  },
  {
    name: "sub_arsip_jenis",
    required: true,
    label: "Jenis Dokumen",
    align: "left",
    field: "sub_arsip_jenis",
    sortable: true,
   
  },
  {
    name: "ctr_count",
    required: true,
    label: "Counter",
    align: "right",
    field: "ctr_count",
    sortable: true,
    headerAlign: "left",
    format: (val) => formatInteger(val),
  },
  {
    name: "ctr_kode_divisi",
    required: true,
    label: "Kode Divisi?",
    align: "left",
    field: "ctr_kode_divisi",
    sortable: true,
   
  },
  {
    name: "ctr_kode_bu_flag",
    required: true,
    label: "Kode BU?",
    align: "left",
    field: "ctr_kode_bu_flag",
    sortable: true,
   
  },
  {
    name: "map_desc_kd_bu",
    required: true,
    label: "Kode BU",
    align: "left",
    field: "map_desc_kd_bu",
    sortable: true,
   
  },
  {
    name: "ctr_work_loc",
    required: true,
    label: "Kode Worklocation?",
    align: "left",
    field: "ctr_work_loc",
    sortable: true,
   
  },
  {
    name: "ctr_prd_yr_mont",
    required: true,
    label: "Tahun & Bulan?",
    align: "left",
    field: "ctr_prd_yr_mont",
    sortable: true,
   
  },
  {
    name: "ctr_reset_year",
    required: true,
    label: "Reset ke-1 Per Tahun?",
    align: "left",
    field: "ctr_reset_year",
    sortable: true,
   
  },
  {
    name: "ctr_status",
    required: true,
    label: "Status",
    align: "left",
    field: "ctr_status",
  },
];
const $q = useQuasar();
const listKonterTransaksi = ref([]);
const listSubKatDocOptions = ref([]);
const listMappingBUOptions = ref([]);
const filterSubKat = ref(null);
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
  kode_jenis:null,
  bisnis:null,
  counter:null,
  counter_terakhir:null,
  kode_divisi:'yes',
  kode_bu_flag:'yes',
  kode_worklocation:'yes',
  tahun_bulan:'yes',
  reset_per_tahun:'yes',
  status: 1,
  creator:empid(),
});

const tmpDokumen = reactive({
  code: null,
  needle: null,
  selection:'1',
  limit:10
});

const tmpMappingBU = reactive({
  code: null,
  needle: null,
  limit:10
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const schema = yup.object({
  kode_jenis: yup.string().required("Kode Jenis wajib diisi").nullable(),
  bisnis: yup.string().required("Bisnis Unit wajib diisi").nullable(),
  counter: yup.string().required("Counter wajib diisi").nullable(),
});

const getKonterTrans = async () => {
  try {
    loading.value = true;
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listKonterTrans`, {
      params: {
        ...pagination.value,
        kategori: filterSubKat.value
      },
      skipErrorInterceptor: true
    });
    // listKonterTransaksi.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listKonterTransaksi.value = res.data;
    } else {
      listKonterTransaksi.value = res.data.data;
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

const addKonter = async () => {
  updateForm.value = false;
  reset();
  tmpForm.status = 1;
  await Promise.all([getSubKatDocOptions(), getMappingBUOptions()]);
  dialogForm.value = true;
};

const editKonter = async (value) => {
  try {
    reset();
    updateForm.value = true;
    tmpDokumen.code = value.ctr_kateg_doc;
    tmpMappingBU.code = value.ctr_kode_bu;
    await getMappingBUOptions();
    await getSubKatDocOptions();
    
    setTimeout(() => {
      tmpForm.id = value.ctr_id;
      tmpForm.kode_jenis = parseInt(value.ctr_kateg_doc);
      tmpForm.bisnis = parseInt(value.ctr_kode_bu);
      tmpForm.counter = formatInteger(value.ctr_count);
      tmpForm.counter_terakhir = formatInteger(value.ctr_digit_count || 0);
      tmpForm.kode_divisi = value.ctr_kode_divisi || 'yes';
      tmpForm.kode_bu_flag = value.ctr_kode_bu_flag || 'yes';
      tmpForm.kode_worklocation = value.ctr_work_loc || 'yes';
      tmpForm.tahun_bulan = value.ctr_prd_yr_mont || 'yes';
      tmpForm.reset_per_tahun = value.ctr_reset_year || 'yes';
      tmpForm.status = value.ctr_status;
    }, 100);
    
    dialogForm.value = true;
  } catch (err) {
    console.log(err)
    showError('Gagal memuat data untuk edit');
  }
};

const validateApp = async () => {
  let validate = {
    kode_jenis: tmpForm.kode_jenis,
    bisnis: tmpForm.bisnis,
    counter: tmpForm.counter,
  }
  schema.validate(validate, { abortEarly: false })
  .then(() => {
      saveSubKatDoc();
    })
    .catch(err => {
      err.inner.forEach(e => {
        showError(e.message);
      });
    });
};

const saveSubKatDoc = async () => {
  const payload = {
    ...tmpForm,
    counter: unformatNumber(tmpForm.counter),
  };
  
  if (updateForm.value) {
    try {
      await axios.post(`${import.meta.env.VITE_API}dms/saveKonterTrans`, {
        ...payload,
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
      await axios.post(`${import.meta.env.VITE_API}dms/saveKonterTrans`, payload, {
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

const reset = () => {
  tmpForm.id = null;
  tmpForm.kode_jenis = null;
  tmpForm.bisnis = null;
  tmpForm.counter = null;
  tmpForm.counter_terakhir = '0';
  tmpForm.kode_divisi = 'yes';
  tmpForm.kode_bu_flag = 'yes';
  tmpForm.kode_worklocation = 'yes';
  tmpForm.tahun_bulan = 'yes';
  tmpForm.reset_per_tahun = 'yes';
  tmpForm.status = null;
  tmpForm.creator = empid();
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getKonterTrans();
  
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const downloadExcel = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listKonterTrans`, {
      params: {
        ...pagination.value,
        kategori: filterSubKat.value,
        excel: true
      },
      responseType: 'blob',
      skipErrorInterceptor: true
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Master_No_Konter_Transaksi.xlsx');
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
        page:'/dms/master-konter-transaksi',
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

const handleCounterInput = (val) => {
  const numericValue = unformatNumber(val);
  if (numericValue !== null) {
    tmpForm.counter = formatInteger(numericValue);
  }
};

const getSubKatDocOptions = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listSubKategoriDokumen`, {
      params: {
        ...tmpDokumen,
      },
      skipErrorInterceptor: true
    });
    listSubKatDocOptions.value = res.data;
  } catch (error) {
    console.error('getSubKatDocOptions error:', error);
  } 
};

const filterSubKatDocOptions = async (val, update) => {
  if (val === '') {
    update(() => {
      tmpDokumen.needle = null;
      tmpDokumen.code = null;
      getSubKatDocOptions();
    })
  } else {
    update(() => {
      tmpDokumen.needle = val.toLowerCase();
      getSubKatDocOptions();
    })
  }
};

const getMappingBUOptions = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listMappingBisnisUnit`, {
      params: {
        ...tmpMappingBU,
      },
      skipErrorInterceptor: true
    });
    listMappingBUOptions.value = res.data;
  } catch (error) {
    console.error('getMappingBUOptions error:', error);
  } 
};

const filterMappingBUOptions = async (val, update) => {
  if (val === '') {
    update(() => {
      tmpMappingBU.needle = null;
      tmpMappingBU.code = null;
      getMappingBUOptions();
    })
  } else {
    update(() => {
      tmpMappingBU.needle = val.toLowerCase();
      getMappingBUOptions();
    })
  }
};

</script>

