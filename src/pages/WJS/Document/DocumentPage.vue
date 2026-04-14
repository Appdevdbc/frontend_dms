<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="folder_open" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Manajemen Dokumen</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" /><q-icon name="chevron_right" size="14px" /><span>Document</span>
            </div>
          </div>
          <q-space />
          <q-btn flat round icon="search" color="white" @click="activeTab = 'search'">
            <q-tooltip>Cari Dokumen</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-tabs v-model="activeTab" :class="`bg-${domain()} text-white`" align="left" dense>
        <q-tab name="browser" icon="folder" label="Browser" />
        <q-tab name="search" icon="search" label="Pencarian" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <!-- Browser Tab -->
        <q-tab-panel name="browser" class="tw-p-0">
          <div class="tw-flex tw-h-[calc(100vh-220px)]">
            <!-- Folder Tree -->
            <div class="tw-w-72 tw-border-r tw-border-gray-200 tw-flex-shrink-0">
              <FolderTree v-model="selectedFolderId" :user-type="userType()" @folder-selected="onFolderSelected" />
            </div>
            <!-- File List -->
            <div class="tw-flex-1 tw-overflow-auto tw-p-4">
              <div v-if="!selectedFolderId" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-gray-400">
                <q-icon name="folder_open" size="64px" class="tw-opacity-30 tw-mb-3" />
                <div>Pilih folder untuk melihat dokumen</div>
              </div>
              <template v-else>
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4 tw-text-sm tw-text-gray-500">
                  <q-icon name="folder" color="amber-7" />
                  <span class="tw-font-semibold tw-text-slate-700">{{ selectedFolder?.folder_name }}</span>
                  <q-badge v-if="selectedFolder?.folder_security" :color="selectedFolder.folder_security === 'public' ? 'green-6' : 'orange-6'" :label="selectedFolder.folder_security" class="tw-text-xs" />
                </div>
                <FileList :folder-id="selectedFolderId" :files="files" :loading="filesLoading"
                  :can-upload="tmpPage.add === '1'"
                  :is-admin="tmpPage.admin === '1'"
                  @upload="showUpload = true" @view="viewDoc" @edit="editDoc" @permission="permissionFile" @refresh="loadFiles" />
              </template>
            </div>
          </div>
        </q-tab-panel>

        <!-- Search Tab -->
        <q-tab-panel name="search" class="tw-p-6">
          <SearchFilter @view="viewDoc" @download="downloadDoc" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Upload Dialog -->
    <q-dialog v-model="showUpload" maximized transition-show="slide-up" transition-hide="slide-down">
      <UploadForm :folder-id="selectedFolderId" :folder-security="selectedFolder?.folder_security"
        :folder-name="selectedFolder?.folder_name || ''"
        @done="() => { showUpload = false; loadFiles(); }" @cancel="showUpload = false" />
    </q-dialog>

    <!-- View Detail Dialog -->
    <q-dialog v-model="showView" maximized>
      <ViewDetail :content-id="viewContentId" @close="showView = false" />
    </q-dialog>

    <!-- Permission File Dialog -->
    <PermissionFolderDialog v-model="showPermFolder" :folder-id="selectedFolderId" :folder-name="selectedFolder?.folder_name" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from "vue";
import axios from "axios";
import { domain, empid, decryptMessage, spinnerBall } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { useRouter } from "vue-router";
import { Loading } from "quasar";
import FolderTree from "../../../components/WJS/Document/FolderTree.vue";
import FileList from "../../../components/WJS/Document/FileList.vue";
import UploadForm from "../../../components/WJS/Document/UploadForm.vue";
import ViewDetail from "../../../components/WJS/Document/ViewDetail.vue";
import SearchFilter from "../../../components/WJS/Document/SearchFilter.vue";
import PermissionFolderDialog from "../../../components/WJS/Document/PermissionFolderDialog.vue";

const { error } = useNotify();
const router = useRouter();
const activeTab = ref('browser');
const selectedFolderId = ref(null);
const selectedFolder = ref(null);
const files = ref([]);
const filesLoading = ref(false);
const showUpload = ref(false);
const showView = ref(false);
const showPermFolder = ref(false);
const viewContentId = ref(null);

const tmpPage = reactive({
  add: '0',
  edit: '0',
  delete: '0',
  view: '0',
  admin: '0',
  folder_scope: 'Restricted',
});

// userType: jika admin = '1' tampil semua data (full access), selain itu dari folder_scope
const userType = () => tmpPage.admin === '1' ? 'full access' : tmpPage.folder_scope;

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: '/dms/document',
        domain: domain(),
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    tmpPage.admin = decryptMessage(res.data.admin);
    tmpPage.folder_scope = decryptMessage(res.data.folder_scope);
    Loading.hide();
  } catch (e) {
    console.log(e);
    Loading.hide();
    router.push('/404');
  }
};

const onFolderSelected = (folder) => {
  selectedFolder.value = folder;
  loadFiles();
};

const loadFiles = async () => {
  if (!selectedFolderId.value) return;
  filesLoading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/files`, {
      params: { folder_id: selectedFolderId.value, empid: empid(), domain: domain(), type: userType() }
    });
    files.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) { error('Gagal memuat file'); } finally { filesLoading.value = false; }
};

const viewDoc = (row) => { viewContentId.value = row.content_id; showView.value = true; };
const editDoc = (row) => { /* navigasi ke edit form */ };
const permissionFile = (row) => { /* buka permission file dialog */ };
const downloadDoc = (row) => { /* handle download */ };

watch(selectedFolderId, loadFiles);

onMounted(() => {
  getPageAkses();
});
</script>


