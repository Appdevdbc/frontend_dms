<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="admin_panel_settings" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Akses</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Data Akses User</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      
      <q-card-section class="tw-bg-white tw-p-6">
        <!-- User Selection -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12">
            <q-banner rounded class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm">
              <template v-slot:avatar>
                <q-icon name="info" color="blue" size="24px"/>
              </template>
              <span class="tw-text-blue-700 tw-font-medium">
                Pilih user untuk mengatur akses menu dan folder
              </span>
            </q-banner>
          </div>
          
          <div class="col-md-6 col-12">
            <q-select
              v-model="selectedUser"
              :options="listUsers"
              outlined
              emit-value
              map-options
              label="Pilih User"
              :loading="loadingUsers"
              @update:model-value="onUserChange"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="blue-6"/>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Tidak ada data user
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          
          <div class="col-md-6 col-12" v-if="selectedUser">
            <q-btn
              push
              :color="`${domain()}`"
              icon="save"
              label="Simpan Akses"
              @click="saveAkses"
              :loading="saving"
              class="tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
            />
          </div>
        </div>

        <!-- Access Configuration -->
        <div v-if="selectedUser && !loadingAccess" class="q-mt-lg">
          <!-- Main Menu Section -->
          <q-card flat bordered class="tw-mb-4 tw-rounded-xl">
            <q-card-section class="bg-grey-2">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="text-h6 tw-font-bold tw-text-slate-700">
                  <q-icon name="menu" class="q-mr-sm"/>
                  Main Menu
                </div>
                <q-checkbox
                  v-model="selectAllMain"
                  @update:model-value="toggleAllMain"
                  label="Select All"
                  color="primary"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="row q-col-gutter-sm">
                <div 
                  v-for="menu in listMainMenus" 
                  :key="menu.menu_id"
                  class="col-md-3 col-sm-4 col-6"
                >
                  <q-checkbox
                    v-model="selectedMainMenus"
                    :val="menu.menu_id"
                    :label="menu.menu_name"
                    color="primary"
                    @update:model-value="onMainMenuChange(menu.menu_id)"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Sub Menu Section -->
          <q-card flat bordered class="tw-mb-4 tw-rounded-xl">
            <q-card-section class="bg-grey-2">
              <div class="text-h6 tw-font-bold tw-text-slate-700">
                <q-icon name="list" class="q-mr-sm"/>
                Sub Menu
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="row q-col-gutter-sm">
                <div 
                  v-for="menu in listSubMenus" 
                  :key="menu.menu_id"
                  class="col-md-3 col-sm-4 col-6"
                >
                  <q-checkbox
                    v-model="selectedSubMenus"
                    :val="menu.menu_id"
                    :label="menu.menu_name"
                    color="secondary"
                    :disable="!selectedMainMenus.includes(menu.menu_parent)"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Folder Section -->
          <q-card flat bordered class="tw-rounded-xl">
            <q-card-section class="bg-grey-2">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="text-h6 tw-font-bold tw-text-slate-700">
                  <q-icon name="folder" class="q-mr-sm"/>
                  Folder Access
                </div>
                <q-checkbox
                  v-model="selectAllFolders"
                  @update:model-value="toggleAllFolders"
                  label="Select All"
                  color="accent"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="row q-col-gutter-sm">
                <div 
                  v-for="folder in listFolders" 
                  :key="folder.folder_id"
                  class="col-md-3 col-sm-4 col-6"
                >
                  <q-checkbox
                    v-model="selectedFolders"
                    :val="folder.folder_id"
                    :label="`${folder.folder_name} (${folder.divisi_name} - ${folder.dept_name})`"
                    color="accent"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Loading State -->
        <div v-if="selectedUser && loadingAccess" class="tw-flex tw-justify-center tw-items-center tw-py-12">
          <q-spinner color="primary" size="3em" />
        </div>

        <!-- Empty State -->
        <div v-if="!selectedUser" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-gray-400">
          <q-icon name="person_search" size="80px" class="tw-mb-4"/>
          <div class="text-h6 tw-font-medium">Pilih user untuk mulai mengatur akses</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { 
  ParseError, 
  domain, 
  empid,
  admin,
  spinnerBall,
  decryptMessage
} from "./../../utils";
import { useQuasar, Loading } from "quasar";
import { useRouter } from "vue-router";
import { useNotify } from "./../../composables/useNotify";

const router = useRouter();
const { success, error } = useNotify();
const $q = useQuasar();

const selectedUser = ref(null);
const listUsers = ref([]);
const listMainMenus = ref([]);
const listSubMenus = ref([]);
const listFolders = ref([]);

const selectedMainMenus = ref([]);
const selectedSubMenus = ref([]);
const selectedFolders = ref([]);

const loadingUsers = ref(false);
const loadingAccess = ref(false);
const saving = ref(false);

const selectAllMain = ref(false);
const selectAllFolders = ref(false);

const tmpPage = ref({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: 'master_akses',
        domain: domain(),
      }
    });
    tmpPage.value.add = decryptMessage(res.data.add);
    tmpPage.value.edit = decryptMessage(res.data.edit);
    tmpPage.value.delete = decryptMessage(res.data.delete);
    tmpPage.value.view = decryptMessage(res.data.view);
    tmpPage.value.admin = admin();
    Loading.hide();
  } catch (error) {
    console.error('getPageAkses error:', error);
    Loading.hide();
    router.push('/404');
  }
};

const getUsers = async () => {
  try {
    loadingUsers.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}getUsersAkses`, {
      params: { domain: domain() }
    });
    listUsers.value = res.data;
    loadingUsers.value = false;
  } catch (err) {
    loadingUsers.value = false;
    error(ParseError(err));
  }
};

const getMainMenus = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getMainMenusAkses`);
    listMainMenus.value = res.data;
  } catch (err) {
    error(ParseError(err));
  }
};

const getSubMenus = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSubMenusAkses`);
    listSubMenus.value = res.data;
  } catch (err) {
    error(ParseError(err));
  }
};

const getFolders = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getFoldersAkses`, {
      params: { domain: domain() }
    });
    listFolders.value = res.data;
  } catch (err) {
    error(ParseError(err));
  }
};

const onUserChange = async (userId) => {
  if (!userId) return;
  
  try {
    loadingAccess.value = true;
    
    // Get user's current access
    const res = await axios.get(`${import.meta.env.VITE_API}getUserAksesDetail`, {
      params: { userId }
    });
    
    selectedMainMenus.value = res.data.mainMenus || [];
    selectedSubMenus.value = res.data.subMenus || [];
    selectedFolders.value = res.data.folders || [];
    
    // Update select all checkboxes
    updateSelectAllStates();
    
    loadingAccess.value = false;
  } catch (err) {
    loadingAccess.value = false;
    error(ParseError(err));
  }
};

const onMainMenuChange = (menuId) => {
  // If main menu is unchecked, uncheck its sub menus
  if (!selectedMainMenus.value.includes(menuId)) {
    selectedSubMenus.value = selectedSubMenus.value.filter(
      subId => !listSubMenus.value.find(sub => sub.menu_id === subId && sub.menu_parent === menuId)
    );
  }
  updateSelectAllStates();
};

const toggleAllMain = (val) => {
  if (val) {
    selectedMainMenus.value = listMainMenus.value.map(m => m.menu_id);
  } else {
    selectedMainMenus.value = [];
    selectedSubMenus.value = [];
  }
};

const toggleAllFolders = (val) => {
  if (val) {
    selectedFolders.value = listFolders.value.map(f => f.folder_id);
  } else {
    selectedFolders.value = [];
  }
};

const updateSelectAllStates = () => {
  selectAllMain.value = listMainMenus.value.length > 0 && 
    selectedMainMenus.value.length === listMainMenus.value.length;
  selectAllFolders.value = listFolders.value.length > 0 && 
    selectedFolders.value.length === listFolders.value.length;
};

const saveAkses = async () => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda yakin ingin menyimpan konfigurasi akses untuk user ini?`,
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
      saving.value = true;
      
      await axios.post(`${import.meta.env.VITE_API}saveUserAkses`, {
        userId: selectedUser.value,
        mainMenus: selectedMainMenus.value,
        subMenus: selectedSubMenus.value,
        folders: selectedFolders.value,
        creator: empid()
      });
      
      saving.value = false;
      success('Akses berhasil disimpan');
    } catch (err) {
      saving.value = false;
      error(ParseError(err));
    }
  });
};

onMounted(async () => {
  await getPageAkses();
  if (tmpPage.value.view === '1' || tmpPage.value.admin === '1') {
    await Promise.all([
      getUsers(),
      getMainMenus(),
      getSubMenus(),
      getFolders()
    ]);
  }
});
</script>
