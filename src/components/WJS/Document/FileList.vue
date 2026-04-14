<template>
  <div>
    <!-- Header widget seperti PHP -->
    <div class="tw-flex tw-items-center tw-justify-between tw-mb-3 tw-pb-3 tw-border-b tw-border-gray-200">
      <div class="tw-flex tw-items-center tw-gap-2">
        <q-icon name="insert_drive_file" color="blue-6" size="20px" />
        <span class="tw-font-bold tw-text-slate-700 tw-text-sm">FILE</span>
      </div>
      <q-btn v-if="folderId && props.canUpload" unelevated color="blue-6" icon="upload_file" label="Add File" size="sm" class="tw-rounded-lg" @click="emit('upload')" />
    </div>

    <div class="tw-flex tw-gap-2 tw-items-center tw-mb-3">
      <q-select borderless dense v-model="pagination.rowsPerPage" :options="[10,25,50,100]" class="tw-min-w-[80px]" />
      <q-input outlined dense debounce="300" v-model="search" placeholder="Cari file..." class="tw-min-w-[240px] tw-bg-white tw-rounded-lg">
        <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
      </q-input>
    </div>

    <q-table :rows="filteredFiles" :columns="columns" row-key="content_id" :loading="loading"
      :pagination="pagination" flat class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props"
            :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- Nama File -->
      <template v-slot:body-cell-content_name="props">
        <q-td :props="props">
          <div class="tw-flex tw-items-center tw-gap-2">
            <q-icon name="picture_as_pdf" color="red-6" size="18px" />
            <span class="tw-font-medium tw-text-blue-700 tw-cursor-pointer hover:tw-underline" @click="emit('view', props.row)">
              {{ props.row.content_name }}
            </span>
          </div>
        </q-td>
      </template>

      <!-- Upload Date -->
      <template v-slot:body-cell-content_entrydate="props">
        <q-td :props="props" class="tw-text-center tw-text-sm tw-text-slate-600">
          {{ props.row.content_entrydate ? formatDateDMY(props.row.content_entrydate) : '-' }}
        </q-td>
      </template>

      <!-- Keywords (Nomor Dokumen) -->
      <template v-slot:body-cell-content_doc="props">
        <q-td :props="props" class="tw-text-sm tw-text-slate-600">
          {{ props.row.content_doc || '-' }}
        </q-td>
      </template>

      <!-- Tipe -->
      <template v-slot:body-cell-content_type="props">
        <q-td :props="props" class="tw-text-center">
          <q-badge :color="props.row.content_type === 'renewable' ? 'orange-6' : 'blue-6'"
            :label="props.row.content_type || '-'" class="tw-text-xs" />
        </q-td>
      </template>

      <!-- Aksi (View, Download, Delete, Edit, Permission, Properties) -->
      <template v-slot:body-cell-aksi="props">
        <q-td :props="props" class="tw-py-3">
          <div class="tw-flex tw-gap-1 tw-flex-wrap">
            <q-btn round dense color="blue-6" icon="visibility" size="sm" @click="emit('view', props.row)"
              class="tw-shadow-sm hover:tw-scale-110 tw-transition-all">
              <q-tooltip>View</q-tooltip>
            </q-btn>
            <q-btn round dense color="green-6" icon="download" size="sm" @click="handleDownload(props.row)"
              class="tw-shadow-sm hover:tw-scale-110 tw-transition-all">
              <q-tooltip>Download</q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.content_owner === currentEmpid || isAdmin" round dense color="red-6" icon="delete" size="sm" @click="handleDelete(props.row)"
              class="tw-shadow-sm hover:tw-scale-110 tw-transition-all">
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.content_owner === currentEmpid || isAdmin" round dense color="orange-6" icon="edit" size="sm" @click="emit('edit', props.row)"
              class="tw-shadow-sm hover:tw-scale-110 tw-transition-all">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn v-if="isAdmin" round dense color="purple-6" icon="lock" size="sm" @click="emit('permission', props.row)"
              class="tw-shadow-sm hover:tw-scale-110 tw-transition-all">
              <q-tooltip>Permission</q-tooltip>
            </q-btn>
            <q-btn round dense color="grey-6" icon="info" size="sm" @click="emit('view', props.row)"
              class="tw-shadow-sm hover:tw-scale-110 tw-transition-all">
              <q-tooltip>Properties</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell="props">
        <q-td :props="props" class="tw-py-3 tw-text-slate-700 tw-text-sm">{{ props.value }}</q-td>
      </template>
    </q-table>

    <!-- Download Dialog untuk restricted -->
    <DownloadDialog v-model="showDownloadDialog" :content-id="downloadTarget?.content_id"
      :content-file="downloadTarget?.content_file" :content-name="downloadTarget?.content_name" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import { empid, domain, formatDateDMY } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import DownloadDialog from "./DownloadDialog.vue";

const props = defineProps({
  folderId: [Number, String],
  files: { type: Array, default: () => [] },
  loading: Boolean,
  canUpload: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false }
});
const emit = defineEmits(['upload', 'edit', 'delete', 'view', 'permission', 'refresh']);
const { success, error } = useNotify();

const search = ref('');
const showDownloadDialog = ref(false);
const downloadTarget = ref(null);
const pagination = ref({ rowsPerPage: 10 });

const currentEmpid = computed(() => {
  try { return JSON.parse(window.localStorage.getItem('data'))?.data?.id || ''; } catch { return ''; }
});
const isAdmin = computed(() => props.isAdmin || false);

const filteredFiles = computed(() =>
  search.value
    ? props.files.filter(f =>
        f.content_name?.toLowerCase().includes(search.value.toLowerCase()) ||
        f.content_doc?.toLowerCase().includes(search.value.toLowerCase()))
    : props.files
);

const columns = [
  { name: 'aksi', label: 'Aksi', align: 'left', field: 'aksi' },
  { name: 'content_name', label: 'Nama File', align: 'left', field: 'content_name', sortable: true },
  { name: 'content_entrydate', label: 'Upload Date', align: 'center', field: 'content_entrydate', sortable: true },
  { name: 'content_doc', label: 'Keywords', align: 'left', field: 'content_doc' },
  { name: 'content_type', label: 'Tipe', align: 'center', field: 'content_type' },
];

const isExpired = (d) => d && d !== '1900-01-01' && dayjs(d).isBefore(dayjs(), 'day');

const handleDownload = (row) => {
  if (row.content_security !== 'non-restricted') {
    downloadTarget.value = row;
    showDownloadDialog.value = true;
  } else {
    axios.post(`${import.meta.env.VITE_API}dms/document/download-log`, { content_id: row.content_id, empid: empid() }).catch(() => {});
    const base = import.meta.env.VITE_FTP || '';
    const dir = import.meta.env.VITE_FTP_DIR || 'dmslegal';
    window.open(`${base}${dir}/content/${row.content_file}`, '_blank');
  }
};

const handleDelete = async (row) => {
  try {
    await axios.post(`${import.meta.env.VITE_API}dms/document/files/${row.content_id}/delete`, { content_id: row.content_id });
    success('Dokumen berhasil dihapus');
    emit('refresh');
  } catch (e) { error(e.response?.data?.message || 'Gagal menghapus dokumen'); }
};
</script>

