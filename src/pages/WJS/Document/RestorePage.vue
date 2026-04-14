<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="restore" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Restore Document & Folder</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Document</span><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Restore</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Restore Document -->
      <q-card-section class="tw-p-6 tw-pb-2">
        <div class="tw-font-bold tw-text-slate-700 tw-text-base tw-mb-3">
          <q-icon name="description" class="tw-mr-1"/> Restore Document
        </div>
        <q-table flat :rows="deletedDocs" :columns="docColumns" row-key="content_id"
          :loading="loadingDocs" :filter="searchDoc" hide-pagination :rows-per-page-options="[0]"
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="[
                  `bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-3`,
                  col.name === 'aksi' ? 'sticky-column-left-header' : ''
                ]">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="searchDoc" placeholder="Search ..."
              class="tw-bg-white tw-rounded-lg tw-min-w-[250px]">
              <template v-slot:prepend><q-icon name="search" color="blue-6"/></template>
            </q-input>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-2 sticky-column-left">
              <div class="tw-flex tw-gap-1">
                <q-btn dense round color="blue-6" icon="visibility" size="sm"
                  @click="openFile(props.row.content_file)"
                  class="tw-shadow-md">
                  <q-tooltip>View</q-tooltip>
                </q-btn>
                <q-btn dense round color="indigo-6" icon="download" size="sm"
                  @click="downloadFile(props.row.content_file)"
                  class="tw-shadow-md">
                  <q-tooltip>Download</q-tooltip>
                </q-btn>
                <q-btn dense round color="amber-8" icon="info" size="sm"
                  @click="showDetail(props.row.content_id)"
                  class="tw-shadow-md">
                  <q-tooltip>Detail</q-tooltip>
                </q-btn>
                <q-btn dense round color="green-6" icon="restore" size="sm"
                  @click="doRestoreDoc(props.row.content_id)" class="tw-shadow-md">
                  <q-tooltip>Restore</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <!-- Restore Folder -->
      <q-card-section class="tw-p-6 tw-pt-2">
        <div class="tw-font-bold tw-text-slate-700 tw-text-base tw-mb-3">
          <q-icon name="folder_open" class="tw-mr-1"/> Restore Folder
        </div>
        <q-table flat :rows="deletedFolders" :columns="folderColumns" row-key="folder_id"
          :loading="loadingFolders" :filter="searchFolder" hide-pagination :rows-per-page-options="[0]"
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="[
                  `bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-3`,
                  col.name === 'aksi' ? 'sticky-column-left-header' : ''
                ]">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="searchFolder" placeholder="Search ..."
              class="tw-bg-white tw-rounded-lg tw-min-w-[250px]">
              <template v-slot:prepend><q-icon name="search" color="blue-6"/></template>
            </q-input>
          </template>
          <template v-slot:body-cell-folder_security="props">
            <q-td :props="props">
              <q-badge :color="props.row.folder_security === 'restricted' ? 'orange' : 'blue'" :label="props.row.folder_security === 'restricted' ? 'Limited' : 'Shared Folder'"/>
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-2 sticky-column-left">
              <q-btn dense round color="green-6" icon="restore" size="sm"
                @click="doRestoreFolder(props.row.folder_id)" class="tw-shadow-md">
                <q-tooltip>Restore</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetailDialog" position="right" full-height>
      <q-card style="width: 600px; max-width: 95vw;">
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-2">
              <q-icon name="info" size="24px"/>
              <span class="tw-font-bold tw-text-lg">Detail Document</span>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showDetailDialog = false"/>
          </div>
        </q-card-section>
        <q-card-section v-if="detailLoading" class="tw-text-center tw-py-10">
          <q-spinner size="40px" color="blue-6"/>
        </q-card-section>
        <template v-else-if="detailData">
          <q-tabs v-model="detailTab" dense align="left"
            active-color="blue-6" indicator-color="blue-6" active-bg-color="white"
            class="tw-bg-slate-100 tw-shadow-sm">
            <q-tab name="properties" label="Properties Content" icon="description" class="tw-transition-all tw-duration-200"/>
            <q-tab name="log" label="History Log" icon="history" class="tw-transition-all tw-duration-200"/>
          </q-tabs>
          <q-separator/>
          <q-tab-panels v-model="detailTab" animated transition-prev="slide-right" transition-next="slide-left" class="tw-bg-white">
            <q-tab-panel name="properties" class="tw-p-4">
              <div class="tw-space-y-4">
                <div v-for="field in detailFields" :key="field.label"
                  class="tw-p-3 tw-bg-gradient-to-r tw-from-slate-50 tw-to-white tw-rounded-lg tw-border tw-border-slate-200">
                  <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                    <q-icon name="label" size="14px" color="blue-6"/>
                    <div class="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wide">{{ field.label }}</div>
                  </div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-800 tw-pl-6">{{ field.value || '-' }}</div>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="log" class="tw-p-0">
              <div v-if="logData.length === 0" class="tw-text-center tw-py-10">
                <q-icon name="history" size="48px" class="tw-text-slate-300 tw-mb-2"/>
                <div class="tw-text-slate-400 tw-font-medium">Tidak ada riwayat log</div>
              </div>
              <div v-else class="tw-max-h-[500px] tw-overflow-y-auto tw-overflow-x-hidden tw-px-4 tw-py-4">
                <q-timeline color="blue-6">
                  <q-timeline-entry v-for="(log, i) in logData" :key="i"
                    :icon="log.log_action?.includes('delete') ? 'delete' : log.log_action?.includes('upload') ? 'upload' : log.log_action?.includes('edit') ? 'edit' : 'history'"
                    :color="log.log_action?.includes('delete') ? 'red-6' : log.log_action?.includes('upload') ? 'green-6' : 'blue-6'"
                    :title="log.account_name || log.employee_name || log.log_nik"
                    :subtitle="fmtDate(log.log_date)">
                    <div class="tw-bg-slate-50 tw-p-3 tw-rounded-lg tw-border tw-border-slate-200">
                      <div class="tw-text-sm tw-font-semibold tw-text-slate-700">{{ log.log_action }}</div>
                      <div v-if="log.log_note" class="tw-text-xs tw-text-slate-500 tw-mt-1">{{ log.log_note }}</div>
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-card>
    </q-dialog>

    <!-- File Preview Dialog -->
    <q-dialog v-model="showFileDialog" maximized>
      <q-card>
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="visibility" size="32px" />
              <div class="tw-text-xl tw-font-bold">Preview File</div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showFileDialog = false" />
          </div>
        </q-card-section>
        <q-card-section class="tw-p-0" style="height: calc(100vh - 80px);">
          <iframe :src="fileUrl" style="width: 100%; height: 100%; border: none;"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Loading, Dialog } from 'quasar';
import { spinnerBall, empid, domain } from '../../../utils';
import { useNotify } from '../../../composables/useNotify';
import dayjs from 'dayjs';

const { success, error: showError } = useNotify();
const deletedDocs = ref([]);
const deletedFolders = ref([]);
const loadingDocs = ref(false);
const loadingFolders = ref(false);
const searchDoc = ref('');
const searchFolder = ref('');
const showFileDialog = ref(false);
const fileUrl = ref('');
const showDetailDialog = ref(false);
const detailData = ref(null);
const detailLoading = ref(false);
const detailFields = ref([]);
const detailTab = ref('properties');
const logData = ref([]);

const fmtDate = (v) => v ? dayjs(String(v).replace('Z', '')).format('YYYY-MM-DD HH:mm:ss') : '-';

const apiUrl = import.meta.env.VITE_API;
const fileBaseUrl = import.meta.env.VITE_FTP || apiUrl;
const env = import.meta.env.VITE_ENV;

const getFilePath = (filename) => {
  const basePath = env === 'LOCAL' ? `${fileBaseUrl}dmslegal/dev/` : `${fileBaseUrl}dmslegal/`;
  return `${basePath}${filename}`;
};

const openFile = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  
  if (isPdf || isImage) {
    fileUrl.value = getFilePath(filename);
    showFileDialog.value = true;
  } else {
    downloadFile(filename);
  }
};

const downloadFile = async (filename) => {
  try {
    const response = await fetch(getFilePath(filename));
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    showError('Gagal mengunduh file');
  }
};

const docColumns = [
  { name:'aksi', label:'Aksi', field:'aksi', align:'left', classes: 'sticky-column-left', headerClasses: 'sticky-column-left-header' },
  { name:'content_name', label:'Nama Document', field:'content_name', align:'left', sortable:true },
  { name:'folder_name', label:'Folder', field:'folder_name', align:'left' },
  { name:'content_keywords', label:'Keywords', field:'keywords_name', align:'left' },
  { name:'content_type', label:'Type', field:'content_type', align:'center' },
  { name:'content_owner', label:'Owner', field:'owner_name', align:'left' },
  { name:'content_keeper', label:'Keeper', field:'keeper_name', align:'left' },
  { name:'content_lastmodified', label:'Last Modified', field:'content_lastmodified', align:'center',
    format: v => v ? dayjs(v.replace('Z', '')).format('DD-MM-YYYY HH:mm:ss') : '-' },
];

const folderColumns = [
  { name:'aksi', label:'Aksi', field:'aksi', align:'left', classes: 'sticky-column-left', headerClasses: 'sticky-column-left-header' },
  { name:'folder_name', label:'Nama Folder', field:'folder_name', align:'left', sortable:true },
  { name:'folder_pathid', label:'Path', field:'folder_pathid', align:'left' },
  { name:'folder_tingkat', label:'Tingkat', field:'folder_tingkat', align:'center' },
  { name:'folder_security', label:'Akses', field:'folder_security', align:'center' },
  { name:'folder_lastmodified', label:'Last Modified', field:'folder_lastmodified', align:'center',
    format: v => v ? dayjs(v.replace('Z', '')).format('DD-MM-YYYY HH:mm:ss') : '-' },
];

const showDetail = async (content_id) => {
  showDetailDialog.value = true;
  detailLoading.value = true;
  detailData.value = null;
  detailTab.value = 'properties';
  logData.value = [];
  try {
    const [resDoc, resLog] = await Promise.all([
      axios.get(`${apiUrl}dms/document/files/${content_id}`),
      axios.get(`${apiUrl}dms/document/files/${content_id}/log`),
    ]);
    const d = resDoc.data.data || resDoc.data;
    detailData.value = d;
    // Find resolved keywords name from deleted docs list
    const docRow = deletedDocs.value.find(r => r.content_id === content_id);
    const keywordsName = docRow?.keywords_name || d.content_keywords;
    detailFields.value = [
      { label: 'File Name', value: d.content_name },
      { label: 'Folder', value: d.folder_name },
      { label: 'Keywords', value: keywordsName },
      { label: 'Description', value: d.content_desc },
      { label: 'Owner', value: d.owner_name || d.content_owner },
      { label: 'Keeper', value: d.keeper_name || d.content_keeper },
      { label: 'Keeper Status', value: d.content_statuskeeper == 1 ? 'Confirmed' : d.content_statuskeeper == 2 ? 'Rejected' : 'Not Confirmed' },
      { label: 'Business Unit', value: d.content_bu },
      { label: 'Type', value: d.content_type },
      { label: 'Due Date', value: d.content_duedate && d.content_duedate !== '1900-01-01' ? fmtDate(d.content_duedate) : '-' },
      { label: 'Security', value: d.content_security || d.folder_security },
      { label: 'Entry Date', value: fmtDate(d.content_entrydate) },
      { label: 'Last Modified', value: fmtDate(d.content_lastmodified) },
      { label: 'Version', value: d.content_ver },
    ];
    logData.value = resLog.data.data || resLog.data || [];
    detailLoading.value = false;
  } catch (e) { detailLoading.value = false; showError('Gagal memuat detail'); showDetailDialog.value = false; }
};

const loadDeletedDocs = async () => {
  try {
    loadingDocs.value = true;
    const res = await axios.get(`${apiUrl}dms/document/deleted-files`, {
      params: { empid: empid(), domain: domain() }
    });
    deletedDocs.value = res.data.data || res.data || [];
    loadingDocs.value = false;
  } catch (e) { loadingDocs.value = false; console.error(e); }
};

const loadDeletedFolders = async () => {
  try {
    loadingFolders.value = true;
    const res = await axios.get(`${apiUrl}dms/document/deleted-folders`, {
      params: { empid: empid(), domain: domain() }
    });
    deletedFolders.value = res.data.data || res.data || [];
    loadingFolders.value = false;
  } catch (e) { loadingFolders.value = false; console.error(e); }
};

const doRestoreDoc = (content_id) => {
  const doc = deletedDocs.value.find(d => d.content_id === content_id);
  const docName = doc?.content_name || 'dokumen ini';
  
  Dialog.create({
    title: 'Konfirmasi Restore Document',
    message: `Apakah Anda yakin ingin me-restore dokumen "${docName}"?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color: 'green-6',
      label: 'Ya, Restore',
      icon: 'check_circle',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: 'Batal',
      icon: 'cancel',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.post(`${apiUrl}dms/document/files/${content_id}/restore`, { content_id });
      success('Dokumen berhasil di-restore');
      Loading.hide();
      loadDeletedDocs();
    } catch (e) { Loading.hide(); showError('Gagal restore dokumen'); }
  });
};

const doRestoreFolder = (folder_id) => {
  const folder = deletedFolders.value.find(f => f.folder_id === folder_id);
  const folderName = folder?.folder_name || 'folder ini';
  
  Dialog.create({
    title: 'Konfirmasi Restore Folder',
    message: `Apakah Anda yakin ingin me-restore folder "${folderName}"?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color: 'green-6',
      label: 'Ya, Restore',
      icon: 'check_circle',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: 'Batal',
      icon: 'cancel',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.post(`${apiUrl}dms/document/folders/${folder_id}/restore`);
      success('Folder berhasil di-restore');
      Loading.hide();
      loadDeletedFolders();
    } catch (e) { Loading.hide(); showError('Gagal restore folder'); }
  });
};

onMounted(() => { loadDeletedDocs(); loadDeletedFolders(); });
</script>


