<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="description" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Content</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Data Content</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          v-if="tmpPage.view =='1' || tmpPage.admin =='1'"
          :rows="listContent"
          :columns="columns"
          row-key="content_id"
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
                placeholder="Search content..."
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
                label="Tambah Content"
                @click="addContent"
                class="tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
              />
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
                  v-if="tmpPage.edit == '1' || tmpPage.admin == '1'"
                  round
                  dense
                  color="orange-7"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="editContent(props.row)"
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
                  @click="deleteContent(props.row)"
                  icon="delete"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Delete
                  </q-tooltip>
                </q-btn>
            </q-td>
          </template>
          <template v-slot:body-cell-content_active="props">
            <q-td :props="props" class="tw-py-3">
              <q-toggle
                :model-value="props.row.content_active === 1"
                @update:model-value="(val) => toggleStatus(props.row, val)"
                color="green"
                :disable="tmpPage.edit !== '1' && tmpPage.admin !== '1'"
              />
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
            {{ updateForm ? 'Edit Content' : 'Tambah Content' }}
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
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.content_no"
                outlined
                counter maxlength="50" 
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="tag" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">No Dokumen</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.content_name"
                outlined
                counter maxlength="200" 
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Nama Dokumen</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.content_iddiv"
                :options="listDivisi"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                @update:model-value="onDivisiChange"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Plant</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.content_iddept"
                :options="listDept"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpForm.content_iddiv"
                @update:model-value="onDeptChange"
              >
                <template v-slot:prepend>
                  <q-icon name="corporate_fare" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Departement</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.content_idfolder"
                :options="listFolder"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpForm.content_iddept"
                @update:model-value="onFolderChange"
              >
                <template v-slot:prepend>
                  <q-icon name="folder" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Folder</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.content_idsubfolder1"
                :options="listSubFolder1"
                outlined
                emit-value
                map-options
                label="Sub Folder 1"
                class="tw-rounded-lg"
                :disable="!tmpForm.content_idfolder"
                @update:model-value="onSubFolder1Change"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="folder_open" color="blue-6"/>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.content_idsubfolder2"
                :options="listSubFolder2"
                outlined
                emit-value
                map-options
                label="Sub Folder 2"
                class="tw-rounded-lg"
                :disable="!tmpForm.content_idsubfolder1"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="folder_special" color="blue-6"/>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-12">
              <q-select
                v-model="tmpForm.content_klasifikasi"
                :options="listKlasifikasi"
                outlined
                emit-value
                map-options
                label="Klasifikasi"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="security" color="blue-6"/>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.content_revision"
                outlined
                type="number"
                label="Revisi"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="history" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.content_entry_date"
                outlined
                label="Tanggal Entry"
                class="tw-rounded-lg"
                mask="####-##-##"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="tmpForm.content_entry_date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.content_eff_date"
                outlined
                label="Tanggal Efektif"
                class="tw-rounded-lg"
                mask="####-##-##"
              >
                <template v-slot:prepend>
                  <q-icon name="event_available" color="blue-6" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="tmpForm.content_eff_date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.content_file"
                outlined
                counter maxlength="200" 
                label="File Name"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="insert_drive_file" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-12">
              <q-input
                v-model="tmpForm.content_file1"
                outlined
                counter maxlength="200" 
                label="File Name 1"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="attachment" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.content_note_revision"
                outlined
                type="textarea"
                rows="3"
                counter maxlength="500" 
                label="Catatan Revisi"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6"/>
                </template>
              </q-input>
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
            @click="validateContent"
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
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi",
    classes: 'sticky-column-left',
    headerClasses: 'sticky-column-left-header'
  },
  {
    name: "content_no",
    required: true,
    label: "No Dokumen",
    align: "left",
    field: "content_no",
    sortable: true,
  },
  {
    name: "content_name",
    align: "left",
    label: "Nama Dokumen",
    field: "content_name",
    sortable: true,
  },
  {
    name: "divisi_name",
    align: "left",
    label: "Plant",
    field: "divisi_name",
    sortable: true,
  },
  {
    name: "dept_name",
    label: "Departement",
    align: "left",
    field: "dept_name",
    sortable: true,
  },
  {
    name: "folder_name",
    label: "Folder",
    align: "left",
    field: "folder_name",
    sortable: true,
  },
  {
    name: "content_revision",
    label: "Revisi",
    align: "center",
    field: "content_revision",
    sortable: true,
  },
  {
    name: "content_active",
    label: "Status",
    align: "center",
    field: "content_active",
    sortable: true,
  }
];
const $q = useQuasar();
const listContent = ref([]);
const listDivisi = ref([]);
const listDept = ref([]);
const listFolder = ref([]);
const listSubFolder1 = ref([]);
const listSubFolder2 = ref([]);
const listKlasifikasi = ref([]);

const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);

const pagination = ref({
  sortBy: "content_id",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const tmpForm = reactive({
  id: null,
  content_no: null,
  content_name: null,
  content_revision: 0,
  content_note_revision: null,
  content_entry_date: null,
  content_eff_date: null,
  content_iddiv: null,
  content_iddept: null,
  content_idfolder: null,
  content_idsubfolder1: null,
  content_idsubfolder2: null,
  content_file: null,
  content_file1: null,
  content_active: 1,
  content_klasifikasi: null,
  creator: empid(),
  domain: domain(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const schema = yup.object({
  content_no: yup.string().required("No dokumen wajib diisi").nullable(),
  content_name: yup.string().required("Nama dokumen wajib diisi").nullable(),
  content_iddiv: yup.number().required("Plant wajib dipilih").nullable(),
  content_iddept: yup.number().required("Departement wajib dipilih").nullable(),
  content_idfolder: yup.number().required("Folder wajib dipilih").nullable(),
});

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: 'master_content',
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

const getContent = async () => {
  try {
    spinnerBall()
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    
    const res = await axios.get(`${import.meta.env.VITE_API}listContent`, {
      params: pagination.value
    });
    
    if (typeof res.data.data === "undefined") {
      listContent.value = res.data;
    } else {
      listContent.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination?.total || res.data.length;
    loading.value = false;
    Loading.hide()
  } catch (error) {
    loading.value = false;
    Loading.hide()
  }
};

const getDivisi = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDivisi`);
    listDivisi.value = res.data;
  } catch (error) {
    console.error('getDivisi error:', error);
  }
};

const getDept = async (iddiv) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDept`, {
      params: { iddiv }
    });
    listDept.value = res.data;
  } catch (error) {
    console.error('getDept error:', error);
  }
};

const getFolder = async (iddept) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectFolder`, {
      params: { iddept }
    });
    listFolder.value = res.data;
  } catch (error) {
    console.error('getFolder error:', error);
  }
};

const getSubFolder1 = async (idfolder) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectSubFolder1Content`, {
      params: { idfolder }
    });
    listSubFolder1.value = res.data;
  } catch (error) {
    console.error('getSubFolder1 error:', error);
  }
};

const getSubFolder2 = async (idsubfolder1) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectSubFolder2`, {
      params: { idsubfolder1 }
    });
    listSubFolder2.value = res.data;
  } catch (error) {
    console.error('getSubFolder2 error:', error);
  }
};

const getKlasifikasi = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectKlasifikasi`);
    listKlasifikasi.value = res.data;
  } catch (error) {
    console.error('getKlasifikasi error:', error);
  }
};

const onDivisiChange = async (value) => {
  tmpForm.content_iddept = null;
  tmpForm.content_idfolder = null;
  tmpForm.content_idsubfolder1 = null;
  tmpForm.content_idsubfolder2 = null;
  listDept.value = [];
  listFolder.value = [];
  listSubFolder1.value = [];
  listSubFolder2.value = [];
  if (value) {
    await getDept(value);
  }
};

const onDeptChange = async (value) => {
  tmpForm.content_idfolder = null;
  tmpForm.content_idsubfolder1 = null;
  tmpForm.content_idsubfolder2 = null;
  listFolder.value = [];
  listSubFolder1.value = [];
  listSubFolder2.value = [];
  if (value) {
    await getFolder(value);
  }
};

const onFolderChange = async (value) => {
  tmpForm.content_idsubfolder1 = null;
  tmpForm.content_idsubfolder2 = null;
  listSubFolder1.value = [];
  listSubFolder2.value = [];
  if (value) {
    await getSubFolder1(value);
  }
};

const onSubFolder1Change = async (value) => {
  tmpForm.content_idsubfolder2 = null;
  listSubFolder2.value = [];
  if (value) {
    await getSubFolder2(value);
  }
};

const addContent = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
  await getDivisi();
  await getKlasifikasi();
};

const editContent = async (value) => {
  try {
    reset();
    updateForm.value = true;
    dialogForm.value = true;
    
    tmpForm.id = value.content_id;
    tmpForm.content_no = value.content_no;
    tmpForm.content_name = value.content_name;
    tmpForm.content_revision = value.content_revision;
    tmpForm.content_note_revision = value.content_note_revision;
    tmpForm.content_entry_date = value.content_entry_date;
    tmpForm.content_eff_date = value.content_eff_date;
    tmpForm.content_iddiv = value.content_iddiv;
    tmpForm.content_iddept = value.content_iddept;
    tmpForm.content_idfolder = value.content_idfolder;
    tmpForm.content_idsubfolder1 = value.content_idsubfolder1;
    tmpForm.content_idsubfolder2 = value.content_idsubfolder2;
    tmpForm.content_file = value.content_file;
    tmpForm.content_file1 = value.content_file1;
    tmpForm.content_active = value.content_active;
    tmpForm.content_klasifikasi = value.content_klasifikasi;
    
    await getDivisi();
    await getKlasifikasi();
    if (value.content_iddiv) {
      await getDept(value.content_iddiv);
    }
    if (value.content_iddept) {
      await getFolder(value.content_iddept);
    }
    if (value.content_idfolder) {
      await getSubFolder1(value.content_idfolder);
    }
    if (value.content_idsubfolder1) {
      await getSubFolder2(value.content_idsubfolder1);
    }
  } catch (error) {
    console.log(error)
  }
};

const validateContent = async () => {
  let validate = {
    content_no: tmpForm.content_no,
    content_name: tmpForm.content_name,
    content_iddiv: tmpForm.content_iddiv,
    content_iddept: tmpForm.content_iddept,
    content_idfolder: tmpForm.content_idfolder,
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
      await saveContent();
    } catch (error) {
      // Error handled in saveContent
    }
  });
};

const saveContent = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}saveContent`, tmpForm);
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

const deleteContent = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus content <span class="text-bold">${value.content_name}</span>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deleteContent`, {
        id: value.content_id,
        creator: empid(),
      });
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

const toggleStatus = async (row, value) => {
  try {
    await axios.post(`${import.meta.env.VITE_API}toggleContentStatus`, {
      id: row.content_id,
      content_active: value ? 1 : 0,
      creator: empid(),
    });
    success('Status berhasil diubah');
    await onRequest({
      pagination: pagination.value,
    });
  } catch (error) {
    error(ParseError(error));
  }
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.content_no = null;
  tmpForm.content_name = null;
  tmpForm.content_revision = 0;
  tmpForm.content_note_revision = null;
  tmpForm.content_entry_date = null;
  tmpForm.content_eff_date = null;
  tmpForm.content_iddiv = null;
  tmpForm.content_iddept = null;
  tmpForm.content_idfolder = null;
  tmpForm.content_idsubfolder1 = null;
  tmpForm.content_idsubfolder2 = null;
  tmpForm.content_file = null;
  tmpForm.content_file1 = null;
  tmpForm.content_active = 1;
  tmpForm.content_klasifikasi = null;
  listDept.value = [];
  listFolder.value = [];
  listSubFolder1.value = [];
  listSubFolder2.value = [];
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getContent();
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
