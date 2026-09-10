<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="folder_open" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">File Manager</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Department</span>
              <template v-if="deptName">
                <q-icon name="chevron_right" size="14px"/>
                <span>{{ deptName }}</span>
              </template>
              <template v-if="folderName">
                <q-icon name="chevron_right" size="14px"/>
                <span>{{ folderName }}</span>
              </template>
              <template v-if="subfolder1Name">
                <q-icon name="chevron_right" size="14px"/>
                <span>{{ subfolder1Name }}</span>
              </template>
              <template v-if="subfolder2Name">
                <q-icon name="chevron_right" size="14px"/>
                <span>{{ subfolder2Name }}</span>
              </template>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      
      <q-card-section class="tw-bg-white tw-p-0">
        <div class="row">
          <!-- Sidebar - Folders -->
          <div class="col-md-3 col-12 tw-border-r tw-border-gray-200">
            <div class="tw-p-4">
              <div class="text-h6 tw-font-bold tw-mb-4 tw-text-slate-700">
                <q-icon name="folder" class="q-mr-sm"/>
                Folders
              </div>
              
              <q-list>
                <!-- All Link -->
                <q-item 
                  clickable 
                  @click="navigateToAll"
                  class="tw-rounded-lg hover:tw-bg-blue-50"
                >
                  <q-item-section avatar>
                    <q-icon name="folder" color="blue-6"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="tw-font-semibold">ALL</q-item-label>
                  </q-item-section>
                </q-item>
                
                <!-- Folder List -->
                <q-item 
                  v-for="folder in folders" 
                  :key="folder.id"
                  clickable 
                  @click="navigateToFolder(folder)"
                  class="tw-rounded-lg hover:tw-bg-blue-50"
                >
                  <q-item-section avatar>
                    <q-icon name="folder" color="orange-6"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ folder.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
          
          <!-- Main Content - Documents Table -->
          <div class="col-md-9 col-12">
            <div class="tw-p-4">
              <q-table
                :rows="documents"
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
                <template v-slot:top-left>
                  <q-select
                    borderless
                    dense
                    debounce="300"
                    v-model="pagination.rowsPerPage"
                    :options="[5,10,25,50,100]"
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
                </template>
                
                <template v-slot:top-right>
                  <q-input
                    outlined
                    dense
                    debounce="300"
                    v-model="pagination.filter"
                    placeholder="Search documents..."
                    class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="blue-6" />
                    </template>
                  </q-input>
                </template>
                
                <template v-slot:body-cell-content_active="props">
                  <q-td :props="props">
                    <q-badge 
                      :color="props.row.content_active === 1 ? 'green' : 'grey'"
                      :label="props.row.content_active === 1 ? 'Aktif' : 'Non-Aktif'"
                    />
                  </q-td>
                </template>
                
                <template v-slot:body-cell-content_file="props">
                  <q-td :props="props">
                    <q-btn
                      v-if="props.row.content_file"
                      flat
                      dense
                      color="primary"
                      icon="cloud_download"
                      @click="downloadFile(props.row)"
                    >
                      <q-tooltip>Download {{ props.row.content_file }}</q-tooltip>
                    </q-btn>
                    <span v-else class="tw-text-gray-400">-</span>
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { 
  ParseError, 
  domain, 
  empid,
  spinnerBall
} from "./../../utils";
import { Loading } from "quasar";
import { useNotify } from "./../../composables/useNotify";

const route = useRoute();
const router = useRouter();
const { success, error } = useNotify();

const deptSeo = computed(() => route.params.deptSeo || '');
const folderSeo = computed(() => route.params.folderSeo || '');
const subfolder1Seo = computed(() => route.params.subfolder1Seo || '');
const subfolder2Seo = computed(() => route.params.subfolder2Seo || '');

const deptName = ref('');
const folderName = ref('');
const subfolder1Name = ref('');
const subfolder2Name = ref('');

const folders = ref([]);
const documents = ref([]);
const loading = ref(false);

const pagination = ref({
  sortBy: "content_no",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const columns = [
  { name: "content_no", label: "No Dokumen", align: "left", field: "content_no", sortable: true },
  { name: "content_name", label: "Nama Dokumen", align: "left", field: "content_name", sortable: true },
  { name: "content_revision", label: "Revisi", align: "center", field: "content_revision", sortable: true },
  { name: "content_entry_date", label: "Tanggal Pengesahan", align: "center", field: "content_entry_date", sortable: true },
  { name: "content_eff_date", label: "Tanggal Terbit", align: "center", field: "content_eff_date", sortable: true },
  { name: "folder_name", label: "Folder", align: "left", field: "folder_name", sortable: true },
  { name: "content_active", label: "Status", align: "center", field: "content_active", sortable: true },
  { name: "content_file", label: "Download", align: "center", field: "content_file" }
];

const loadData = async () => {
  loading.value = true;
  try {
    // Load department name, folders, and documents
    const res = await axios.get(`${import.meta.env.VITE_API}transaction/getDeptFiles`, {
      params: {
        deptSeo: deptSeo.value,
        folderSeo: folderSeo.value,
        subfolder1Seo: subfolder1Seo.value,
        subfolder2Seo: subfolder2Seo.value,
        userId: empid(),
        ...pagination.value
      }
    });
    
    deptName.value = res.data.deptName || '';
    folderName.value = res.data.folderName || '';
    subfolder1Name.value = res.data.subfolder1Name || '';
    subfolder2Name.value = res.data.subfolder2Name || '';
    folders.value = res.data.folders || [];
    
    if (typeof res.data.documents.data === "undefined") {
      documents.value = res.data.documents;
      pagination.value.rowsNumber = res.data.documents.length;
    } else {
      documents.value = res.data.documents.data;
      pagination.value.rowsNumber = res.data.documents.pagination?.total || 0;
    }
  } catch (err) {
    console.error('loadData error:', err);
    error(ParseError(err));
    documents.value = [];
    folders.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const navigateToAll = () => {
  router.push(`/transaction/dept/${deptSeo.value}`);
};

const navigateToFolder = (folder) => {
  const basePath = `/transaction/dept/${deptSeo.value}`;
  
  if (folder.type === 'folder') {
    router.push(`${basePath}/${folder.seo}`);
  } else if (folder.type === 'subfolder1') {
    router.push(`${basePath}/${folderSeo.value}/${folder.seo}`);
  } else if (folder.type === 'subfolder2') {
    router.push(`${basePath}/${folderSeo.value}/${subfolder1Seo.value}/${folder.seo}`);
  }
};

const downloadFile = (document) => {
  window.open(`${import.meta.env.VITE_FTP}${import.meta.env.VITE_FTP_FOLDER}/${document.content_file}`, '_blank');
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loadData();
};

const updateTable = () => {
  onRequest({ pagination: pagination.value });
};

// Watch route changes
watch([deptSeo, folderSeo, subfolder1Seo, subfolder2Seo], () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>
