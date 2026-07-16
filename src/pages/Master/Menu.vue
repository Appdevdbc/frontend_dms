<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="menu_book" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Menu</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Data Menu</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          v-if="tmpPage.view =='1' || tmpPage.admin =='1'"
          :rows="listMenu"
          :columns="columns"
          row-key="menu_id"
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
                placeholder="Search menus..."
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
                label="Tambah Menu"
                @click="addMenu"
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
                  @click="editMenu(props.row)"
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
                  @click="deleteMenu(props.row)"
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
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit_note" size="32px"/>
            {{ updateForm ? 'Edit Menu' : 'Tambah Menu' }}
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
                v-model="tmpForm.menu_name"
                outlined
                counter maxlength="100" 
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="label" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Nama Menu</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpForm.menu_type"
                :options="menuTypeOptions"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Field is required']"
                @update:modelValue="onMenuTypeChange"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tipe Menu</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12" v-if="tmpForm.menu_type === 'sub'">
              <q-select
                v-model="tmpForm.menu_parent"
                :options="listMainMenu"
                outlined
                emit-value
                map-options
                :rules="[val => tmpForm.menu_type === 'main' || !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="account_tree" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Parent Menu</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.menu_link"
                outlined
                counter maxlength="200" 
                label="Link Menu"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="link" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.menu_icon"
                outlined
                counter maxlength="100" 
                label="Icon Menu"
                hint="Contoh: fas fa-home, mdi-home, etc."
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="insert_emoticon" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <!-- <div class="col-12">
              <q-input
                v-model.number="tmpForm.menu_order"
                outlined
                type="number"
                label="Urutan Menu"
                hint="Angka untuk menentukan urutan tampilan menu"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="reorder" color="blue-6"/>
                </template>
              </q-input>
            </div> -->
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
            @click="validateMenu"
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
    name: "menu_name",
    required: true,
    label: "Nama Menu",
    align: "left",
    field: "menu_name",
    sortable: true,
  },
  {
    name: "menu_type",
    align: "left",
    label: "Tipe",
    field: "menu_type",
    sortable: true,
  },
  {
    name: "menu_link",
    label: "Link",
    align: "left",
    field: "menu_link",
    sortable: true,
  },
  {
    name: "menu_order",
    label: "Urutan",
    align: "center",
    field: "menu_order",
    sortable: true,
  }
];
const $q = useQuasar();
const listMenu = ref([]);
const listMainMenu = ref([]);

const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);

const menuTypeOptions = [
  { label: 'Main Menu', value: 'main' },
  { label: 'Sub Menu', value: 'sub' }
];

const pagination = ref({
  sortBy: "menu_id",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const tmpForm = reactive({
  id: null,
  menu_name: null,
  menu_type: 'main',
  menu_parent: null,
  menu_link: null,
  menu_icon: null,
  menu_order: 0,
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
  menu_name: yup.string().required("Nama menu wajib diisi").nullable(),
  menu_type: yup.string().required("Tipe menu wajib diisi").nullable(),
  menu_parent: yup.number().nullable().when('menu_type', {
    is: 'sub',
    then: (schema) => schema.required("Parent menu wajib diisi untuk sub menu"),
  }),
});

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: 'master_menu',
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

const getMenu = async () => {
  loading.value = true;
  try {
    if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    
    const res = await axios.get(`${import.meta.env.VITE_API}listMenu`, {
      params: pagination.value
    });
    
    if (typeof res.data.data === "undefined") {
      listMenu.value = res.data;
      pagination.value.rowsNumber = res.data.length;
    } else {
      listMenu.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination?.total || 0;
    }
  } catch (err) {
    console.error('getMenu error:', err);
    error(ParseError(err));
    listMenu.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const getMainMenus = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getMainMenus`);
    listMainMenu.value = res.data;
  } catch (error) {
    console.error('getMainMenus error:', error);
  }
};

const addMenu = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
  await getMainMenus();
};

const editMenu = async (value) => {
  try {
    reset();
    updateForm.value = true;
    dialogForm.value = true;
    
    tmpForm.id = value.menu_id;
    tmpForm.menu_name = value.menu_name;
    tmpForm.menu_type = value.menu_parent === 0 ? 'main' : 'sub';
    tmpForm.menu_parent = value.menu_parent === 0 ? null : value.menu_parent;
    tmpForm.menu_link = value.menu_link;
    tmpForm.menu_icon = value.menu_icon;
    tmpForm.menu_order = value.menu_order;
    
    await getMainMenus();
  } catch (error) {
    console.log(error)
  }
};

const validateMenu = async () => {
  let validate = {
    menu_name: tmpForm.menu_name,
    menu_type: tmpForm.menu_type,
    menu_parent: tmpForm.menu_parent,
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
      await saveMenu();
    } catch (error) {
      // Error handled in saveMenu
    }
  });
};

const saveMenu = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}saveMenu`, tmpForm);
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

const deleteMenu = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus menu <span class="text-bold">${value.menu_name}</span>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deleteMenu`, {
        id: value.menu_id,
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

const onMenuTypeChange = () => {
  if (tmpForm.menu_type === 'main') {
    tmpForm.menu_parent = null;
  }
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.menu_name = null;
  tmpForm.menu_type = 'main';
  tmpForm.menu_parent = null;
  tmpForm.menu_link = null;
  tmpForm.menu_icon = null;
  tmpForm.menu_order = 0;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getMenu();
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
