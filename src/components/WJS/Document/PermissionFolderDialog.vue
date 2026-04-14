<template>
  <q-dialog v-model="show" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="tw-rounded-none">
      <q-card-section :class="`bg-${domain()} tw-py-4`">
        <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-2">
          <q-icon name="lock" size="22px" />Permission Folder — {{ folderName }}
          <q-space />
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </div>
      </q-card-section>

      <!-- Tabel list permission -->
      <q-card-section class="tw-p-4">
        <div class="tw-font-semibold tw-text-slate-700 tw-mb-3">Daftar Akses</div>
        <q-table :rows="permissions" :columns="columns" row-key="aksesfolder_id"
          :loading="loading" flat bordered dense class="tw-rounded-xl">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-py-3`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body-cell-aksesfolder_view="props">
            <q-td :props="props" class="tw-text-center">
              <q-icon :name="props.row.aksesfolder_view ? 'check_circle' : 'cancel'"
                :color="props.row.aksesfolder_view ? 'green-6' : 'grey-4'" size="18px" />
            </q-td>
          </template>
          <template v-slot:body-cell-aksesfolder_upload="props">
            <q-td :props="props" class="tw-text-center">
              <q-icon :name="props.row.aksesfolder_upload ? 'check_circle' : 'cancel'"
                :color="props.row.aksesfolder_upload ? 'green-6' : 'grey-4'" size="18px" />
            </q-td>
          </template>
          <template v-slot:body-cell-aksesfolder_manage="props">
            <q-td :props="props" class="tw-text-center">
              <q-icon :name="props.row.aksesfolder_manage ? 'check_circle' : 'cancel'"
                :color="props.row.aksesfolder_manage ? 'green-6' : 'grey-4'" size="18px" />
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props">
              <div class="tw-flex tw-gap-1">
                <q-btn flat round dense icon="edit" size="xs" color="blue-6" @click="openEdit(props.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round dense icon="delete" size="xs" color="red-6" @click="hapus(props.row)">
                  <q-tooltip>Hapus</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-text-sm tw-text-slate-700">{{ props.value }}</q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-separator />

      <!-- Form Add/Edit Permission -->
      <q-card-section class="tw-p-4">
        <div class="tw-font-semibold tw-text-slate-700 tw-mb-3">
          {{ editingId ? 'Edit Permission' : 'Tambah Permission' }}
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select v-model="form.jenismapping" outlined dense label="Jenis Mapping"
              :options="[{label:'Business Unit',value:'bu'},{label:'Divisi',value:'div'},{label:'User',value:'user'}]"
              emit-value map-options class="tw-rounded-lg" @update:model-value="onJenisChange" />
          </div>
          <div class="col-12 col-md-4" v-if="form.jenismapping === 'bu' || form.jenismapping === 'div'">
            <q-select v-model="form.mapbu" outlined dense label="Business Unit"
              :options="listBU" option-label="bu_name" option-value="bu_id"
              emit-value map-options class="tw-rounded-lg" />
          </div>
          <div class="col-12 col-md-4" v-if="form.jenismapping === 'div'">
            <q-select v-model="form.mapdiv" outlined dense label="Divisi"
              :options="listDiv" option-label="div_nama" option-value="div_id"
              emit-value map-options class="tw-rounded-lg" />
          </div>
          <div class="col-12 col-md-4" v-if="form.jenismapping === 'user'">
            <q-select v-model="form.user" outlined dense label="User"
              :options="listUser" option-label="account_name" option-value="account_username"
              emit-value map-options use-input input-debounce="300"
              @filter="filterUser" class="tw-rounded-lg" />
          </div>
          <div class="col-12 col-md-4">
            <div class="tw-flex tw-gap-4 tw-items-center tw-pt-2">
              <q-checkbox v-model="form.view" label="View" color="blue-6" />
              <q-checkbox v-model="form.upload" label="Upload" color="blue-6" />
              <q-checkbox v-model="form.manage" label="Manage" color="blue-6" />
            </div>
          </div>
        </div>
        <div class="tw-flex tw-gap-2 tw-mt-4">
          <q-btn v-if="editingId" flat label="Batal Edit" color="grey-6" @click="resetForm" />
          <q-btn unelevated :label="editingId ? 'Update' : 'Simpan'" color="blue-6" icon="save"
            @click="simpan" :loading="saving" class="tw-rounded-lg" />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
        <q-btn label="Tutup" color="grey-6" push icon="close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import axios from "axios";
import { domain, empid } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({
  modelValue: Boolean,
  folderId: [Number, String],
  folderName: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);
const { success, error } = useNotify();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const loading = ref(false);
const saving = ref(false);
const permissions = ref([]);
const listBU = ref([]);
const listDiv = ref([]);
const listUserAll = ref([]);
const listUser = ref([]);
const editingId = ref(null);

const form = reactive({ jenismapping: 'bu', mapbu: '', mapdiv: '', user: '', view: true, upload: false, manage: false });

const columns = [
  { name: 'aksesfolder_nik', label: 'User/NIK', field: 'aksesfolder_nik', align: 'left' },
  { name: 'aksesfolder_bu', label: 'Business Unit', field: 'aksesfolder_bu', align: 'left' },
  { name: 'aksesfolder_div', label: 'Divisi', field: 'aksesfolder_div', align: 'left' },
  { name: 'aksesfolder_view', label: 'View', field: 'aksesfolder_view', align: 'center' },
  { name: 'aksesfolder_upload', label: 'Upload', field: 'aksesfolder_upload', align: 'center' },
  { name: 'aksesfolder_manage', label: 'Manage', field: 'aksesfolder_manage', align: 'center' },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'left' },
];

const loadPermissions = async () => {
  if (!props.folderId) return;
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/folders/${props.folderId}/permissions`);
    permissions.value = res.data || [];
  } catch {} finally { loading.value = false; }
};

const loadMaster = async () => {
  try {
    const [bu, user] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}dms/getBU`),
      axios.get(`${import.meta.env.VITE_API}master/users`, { params: { domain: domain() } }),
    ]);
    listBU.value = bu.data || [];
    listUserAll.value = user.data || [];
    listUser.value = listUserAll.value.slice(0, 20);
  } catch {}
};

const onJenisChange = async () => {
  form.mapbu = ''; form.mapdiv = ''; form.user = '';
  if (form.jenismapping === 'div' && form.mapbu) {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/getDiv`, { params: { bu: form.mapbu } });
    listDiv.value = res.data || [];
  }
};

watch(() => form.mapbu, async (bu) => {
  if (form.jenismapping === 'div' && bu) {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}dms/getDiv`, { params: { bu } });
      listDiv.value = res.data || [];
    } catch {}
  }
});

const filterUser = (val, update) => {
  update(() => {
    const q = val.toLowerCase();
    listUser.value = q ? listUserAll.value.filter(u =>
      (u.account_name || '').toLowerCase().includes(q) ||
      (u.account_username || '').toLowerCase().includes(q)
    ).slice(0, 20) : listUserAll.value.slice(0, 20);
  });
};

const resetForm = () => {
  editingId.value = null;
  Object.assign(form, { jenismapping: 'bu', mapbu: '', mapdiv: '', user: '', view: true, upload: false, manage: false });
};

const openEdit = (row) => {
  editingId.value = row.aksesfolder_id;
  form.jenismapping = row.aksesfolder_nik ? 'user' : row.aksesfolder_div ? 'div' : 'bu';
  form.mapbu = row.aksesfolder_bu || '';
  form.mapdiv = row.aksesfolder_div || '';
  form.user = row.aksesfolder_nik || '';
  form.view = !!row.aksesfolder_view;
  form.upload = !!row.aksesfolder_upload;
  form.manage = !!row.aksesfolder_manage;
};

const simpan = async () => {
  if (!props.folderId) return;
  saving.value = true;
  try {
    const payload = {
      aksesfolder_nik: form.jenismapping === 'user' ? form.user : null,
      aksesfolder_bu: form.jenismapping !== 'user' ? form.mapbu : null,
      aksesfolder_div: form.jenismapping === 'div' ? form.mapdiv : null,
      aksesfolder_view: form.view ? 1 : 0,
      aksesfolder_upload: form.upload ? 1 : 0,
      aksesfolder_manage: form.manage ? 1 : 0,
    };
    if (editingId.value) {
      await axios.put(`${import.meta.env.VITE_API}dms/document/folders/permissions/${editingId.value}`, payload);
      success('Permission berhasil diupdate');
    } else {
      await axios.post(`${import.meta.env.VITE_API}dms/document/folders/${props.folderId}/permissions`, payload);
      success('Permission berhasil ditambahkan');
    }
    resetForm();
    await loadPermissions();
  } catch (e) { error(e.response?.data?.message || 'Gagal menyimpan permission'); } finally { saving.value = false; }
};

const hapus = async (row) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API}dms/document/folders/permissions/${row.aksesfolder_id}`);
    success('Permission berhasil dihapus');
    await loadPermissions();
  } catch (e) { error(e.response?.data?.message || 'Gagal menghapus permission'); }
};

watch(() => props.modelValue, async (v) => {
  if (v) {
    // Reset data dulu agar tidak tampil data lama
    permissions.value = [];
    // Load data secara paralel, tidak memblokir tampilnya dialog
    loadPermissions();
    loadMaster();
  }
}, { immediate: false });
watch(() => props.folderId, () => { if (props.modelValue) loadPermissions(); });

// Karena komponen di-mount dengan v-if, langsung load saat mounted
onMounted(() => {
  loadPermissions();
  loadMaster();
});
</script>

