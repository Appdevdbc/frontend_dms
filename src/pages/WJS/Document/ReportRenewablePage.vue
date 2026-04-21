<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="autorenew" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Report Renewable Documents</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Document</span><q-icon name="chevron_right" size="14px"/>
              <span class="tw-text-white">Report Renewable</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4 tw-bg-blue-50 tw-shadow-sm">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
            <q-icon name="filter_alt" color="blue-6" size="24px"/>
            <span class="tw-font-bold tw-text-blue-900 tw-text-base">Filter</span>
          </div>
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
            <q-select outlined dense v-model="filterBu" :options="buList" option-value="bu_id"
              option-label="bu_name" emit-value map-options clearable label="Bisnis Unit"
              class="tw-bg-white tw-rounded-lg"/>
          </div>
          <div class="tw-mt-3 tw-flex tw-gap-2">
            <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData"/>
            <q-btn outline color="green-7" label="Excel" icon="table_chart"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="exportExcel"/>
            <q-btn outline color="teal-7" label="CSV" icon="description"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="exportCsv"/>
            <q-btn outline color="red-7" label="PDF" icon="picture_as_pdf"
              class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="exportPdf"/>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table flat :rows="items" :columns="columns" row-key="content_id"
          :loading="isLoading" :filter="search" hide-pagination :rows-per-page-options="[0]"
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
            <q-input outlined dense debounce="300" v-model="search" placeholder="Search ..."
              class="tw-bg-white tw-rounded-lg tw-min-w-[250px]">
              <template v-slot:prepend><q-icon name="search" color="blue-6"/></template>
            </q-input>
          </template>
          <!-- Row with status background color -->
          <template v-slot:body="props">
            <q-tr :props="props" :style="rowStyle(props.row)">
              <q-td v-for="col in props.cols" :key="col.name" :props="props"
                :class="col.name === 'aksi' ? 'sticky-column-left' : ''">
                <template v-if="col.name === 'status'">
                  <q-badge :color="statusColor(props.row)" :label="statusLabel(props.row)"
                    class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"/>
                </template>
                <template v-else-if="col.name === 'aksi'">
                  <div class="tw-flex tw-gap-1">
                    <q-btn dense round color="teal-6" icon="update" size="sm"
                      @click="openUpdateDialog(props.row)"
                      class="tw-shadow-md">
                      <q-tooltip>Update</q-tooltip>
                    </q-btn>
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Update Progress Dialog -->
    <q-dialog v-model="showUpdateDialog" position="right" full-height>
      <q-card style="width: 550px; max-width: 95vw;">
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-2">
              <q-icon name="update" size="24px"/>
              <span class="tw-font-bold tw-text-lg">Update Progress</span>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showUpdateDialog = false"/>
          </div>
        </q-card-section>
        <q-card-section class="tw-p-4">
          <div class="tw-text-sm tw-font-semibold tw-text-slate-600 tw-mb-3">{{ updateDocName }}</div>
          <q-input outlined v-model="updateText" type="textarea" rows="3" label="Update *"
            placeholder="Tulis update..." :rules="[v => !!v || 'Update wajib diisi']" class="tw-mb-3"/>
          <q-file outlined dense v-model="updateFile" label="Attach File" multiple class="tw-mb-3">
            <template v-slot:prepend><q-icon name="attach_file"/></template>
          </q-file>
          <q-btn unelevated color="red-6" label="SEND" icon="send" class="tw-w-full tw-font-semibold tw-rounded-lg"
            :disable="!updateText" @click="sendUpdate"/>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-4 tw-max-h-[400px] tw-overflow-y-auto">
          <div v-if="updateHistory.length === 0" class="tw-text-center tw-py-4 tw-text-slate-400">Belum ada update</div>
          <div v-for="(u, i) in updateHistory" :key="i" class="tw-flex tw-gap-3 tw-p-3 tw-bg-slate-50 tw-rounded-lg tw-mb-2">
            <q-avatar size="36px" color="blue-2" text-color="blue-8" icon="person"/>
            <div class="tw-flex-1">
              <div class="tw-flex tw-items-center tw-justify-between">
                <span class="tw-font-semibold tw-text-sm">{{ u.account_name || u.employee_name || u.update_createdby }}</span>
                <span class="tw-text-xs tw-text-slate-400">{{ fmtDate(u.update_date) }}</span>
              </div>
              <div class="tw-text-sm tw-text-slate-600 tw-mt-1">{{ u.update_isi }}</div>
              <div v-if="u.update_attach" class="tw-text-xs tw-text-blue-600 tw-mt-1">
                <span v-for="(f, fi) in u.update_attach.split(',')" :key="fi">
                  <a href="javascript:void(0)" @click="openFile(f.trim())" class="tw-mr-2 tw-underline">{{ f.trim() }}</a>
                </span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- File Preview Dialog -->
    <q-dialog v-model="showFileDialog" maximized>
      <q-card>
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="visibility" size="32px"/>
              <div class="tw-text-xl tw-font-bold">Preview File</div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showFileDialog = false"/>
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
import { Loading } from 'quasar';
import { spinnerBall, empid, domain } from '../../../utils';
import dayjs from 'dayjs';
import '../../../assets/styles/table.css';

const filterBu = ref(null);
const buList = ref([]);
const items = ref([]);
const search = ref('');
const isLoading = ref(false);
const showUpdateDialog = ref(false);
const showFileDialog = ref(false);
const fileUrl = ref('');
const updateDocId = ref(null);
const updateDocName = ref('');
const updateText = ref('');
const updateFile = ref(null);
const updateHistory = ref([]);

const fmtDate = (v) => v ? dayjs(String(v).replace('Z', '')).format('DD-MM-YYYY HH:mm:ss') : '-';

const columns = [
  { name:'aksi', label:'Aksi', field:'aksi', align:'left', classes:'sticky-column-left', headerClasses:'sticky-column-left-header' },
  { name:'content_name', label:'Nama Document', field:'content_name', align:'left', sortable:true },
  { name:'folder_name', label:'Folder', field:'folder_name', align:'left' },
  { name:'bu_name', label:'Business Unit', field:'bu_name', align:'left' },
  { name:'div_nama', label:'Divisi', field:'div_nama', align:'left' },
  { name:'content_desc', label:'Description', field:'content_desc', align:'left' },
  { name:'owner_name', label:'Owner', field: r => r.owner_name || r.content_owner, align:'left' },
  { name:'keeper_name', label:'Keeper', field: r => r.keeper_name || r.content_keeper, align:'left' },
  { name:'content_entrydate', label:'Date Created', field:'content_entrydate', align:'center', format: v => fmtDate(v) },
  { name:'content_lastmodified', label:'Last Modified', field:'content_lastmodified', align:'center', format: v => fmtDate(v) },
  { name:'last_update', label:'Last Update', field:'last_update', align:'center', format: v => v ? fmtDate(v) : 'Belum ada update' },
  { name:'content_duedate', label:'Due Date', field:'content_duedate', align:'center', format: v => v ? dayjs(v).format('DD-MM-YYYY') : '-' },
  { name:'status', label:'Status', field:'status', align:'center' },
];

const statusLabel = (row) => {
  if (!row.content_duedate) return 'Putih';
  const days = dayjs(row.content_duedate).diff(dayjs(), 'day');
  if (days <= 30) return 'Merah';
  if (days <= 60) return 'Kuning';
  if (days <= 90) return 'Hijau';
  return 'Putih';
};
const statusColor = (row) => {
  if (!row.content_duedate) return 'grey-4';
  const days = dayjs(row.content_duedate).diff(dayjs(), 'day');
  if (days <= 30) return 'red';
  if (days <= 60) return 'amber';
  if (days <= 90) return 'green';
  return 'grey-4';
};
const rowStyle = (row) => {
  if (!row.content_duedate) return {};
  const days = dayjs(row.content_duedate).diff(dayjs(), 'day');
  if (days <= 30) return { backgroundColor: '#ffcdd2' };
  if (days <= 60) return { backgroundColor: '#fff9c4' };
  if (days <= 90) return { backgroundColor: '#c8e6c9' };
  return {};
};

const getBuList = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}domains`, { skipErrorInterceptor: true });
    buList.value = res.data;
  } catch (e) { console.error(e); }
};

const loadData = async () => {
  try {
    isLoading.value = true;
    spinnerBall();
    const params = { empid: empid(), domain: domain() };
    if (filterBu.value) params.bu_id = filterBu.value;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/report-renewable`, { params });
    items.value = res.data.data || res.data || [];
    Loading.hide();
    isLoading.value = false;
  } catch (e) { Loading.hide(); isLoading.value = false; console.error(e); }
};

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
  const isImage = ['jpg','jpeg','png','gif','bmp','webp'].includes(ext);
  if (isPdf || isImage) {
    fileUrl.value = getFilePath(filename);
    showFileDialog.value = true;
  } else {
    window.open(getFilePath(filename), '_blank');
  }
};

const openUpdateDialog = async (row) => {
  updateDocId.value = row.content_id;
  updateDocName.value = row.content_name;
  updateText.value = '';
  updateFile.value = null;
  showUpdateDialog.value = true;
  try {
    const res = await axios.get(`${apiUrl}dms/document/files/${row.content_id}/updates`);
    updateHistory.value = res.data.data || [];
  } catch (e) { updateHistory.value = []; }
};

const sendUpdate = async () => {
  try {
    spinnerBall();
    const formData = new FormData();
    formData.append('update', updateText.value);
    formData.append('empid', empid());
    if (updateFile.value && updateFile.value.length > 0) {
      formData.append('filedoc', updateFile.value[0]);
    }
    await axios.post(`${apiUrl}dms/document/files/${updateDocId.value}/updates`, formData);
    updateText.value = '';
    updateFile.value = null;
    const res = await axios.get(`${apiUrl}dms/document/files/${updateDocId.value}/updates`);
    updateHistory.value = res.data.data || [];
    Loading.hide();
    loadData();
  } catch (e) { Loading.hide(); console.error(e); }
};

onMounted(() => { getBuList(); loadData(); });

const exportExcel = async () => {
  try {
    spinnerBall();
    const params = { empid: empid(), domain: domain() };
    if (filterBu.value) params.bu_id = filterBu.value;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/report-renewable/export-excel`, {
      params, responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_Renewable_${dayjs().format('YYYYMMDD')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    Loading.hide();
  } catch (e) { Loading.hide(); console.error(e); }
};

const exportCsv = async () => {
  try {
    spinnerBall();
    const params = { empid: empid(), domain: domain() };
    if (filterBu.value) params.bu_id = filterBu.value;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/report-renewable/export-csv`, {
      params, responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_Renewable_${dayjs().format('YYYYMMDD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    Loading.hide();
  } catch (e) { Loading.hide(); console.error(e); }
};

const exportPdf = async () => {
  try {
    spinnerBall();
    const params = { empid: empid(), domain: domain() };
    if (filterBu.value) params.bu_id = filterBu.value;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/report-renewable/export-pdf`, { params });
    const filename = res.data.data?.filename;
    if (filename) window.open(`${import.meta.env.VITE_API}pdf/${filename}`, '_blank');
    Loading.hide();
  } catch (e) { Loading.hide(); console.error(e); }
};
</script>


