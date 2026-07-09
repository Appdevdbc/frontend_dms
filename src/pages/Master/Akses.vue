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
              :options="filteredUsers"
              outlined
              emit-value
              map-options
              label="Pilih User"
              :loading="loadingUsers"
              @update:model-value="onUserChange"
              use-input
              input-debounce="300"
              @filter="filterUsers"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="blue-6"/>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Tidak ada data user yang cocok
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
          <!-- Folder Section - Grouped by Department -->
          <q-card flat bordered class="tw-rounded-xl tw-mb-4">
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
          </q-card>

          <!-- Department Groups -->
          <div v-for="deptGroup in listFoldersByDept" :key="deptGroup.dept_id" class="q-mb-md">
            <q-card flat bordered class="tw-rounded-xl">
              <q-card-section class="bg-grey-3">
                <div class="tw-flex tw-items-center tw-justify-between">
                  <div class="text-subtitle1 tw-font-bold tw-text-slate-700">
                    <q-icon name="corporate_fare" class="q-mr-sm" size="20px"/>
                    {{ deptGroup.dept_name }}
                  </div>
                  <q-checkbox
                    :model-value="isDeptAllSelected(deptGroup)"
                    @update:model-value="toggleDeptFolders(deptGroup, $event)"
                    label="Select All"
                    color="accent"
                    dense
                  />
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div class="row q-col-gutter-sm">
                  <div 
                    v-for="folder in deptGroup.folders" 
                    :key="folder.folder_id"
                    class="col-md-3 col-sm-4 col-6"
                  >
                    <q-checkbox
                      v-model="selectedFolders"
                      :val="folder.folder_id"
                      :label="folder.folder_name"
                      color="accent"
                      @update:model-value="updateSelectAllStates"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
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
const filteredUsers = ref([]);
const listFoldersByDept = ref([]); // Changed: grouped by department
const listFolders = ref([]); // Flat list for compatibility

const selectedFolders = ref([]);

const loadingUsers = ref(false);
const loadingAccess = ref(false);
const saving = ref(false);

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
    filteredUsers.value = res.data;
    loadingUsers.value = false;
  } catch (err) {
    loadingUsers.value = false;
    error(ParseError(err));
  }
};

const getFolders = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getFoldersAkses`, {
      params: { domain: domain() }
    });
    listFoldersByDept.value = res.data;
    
    // Create flat list for compatibility with existing logic
    listFolders.value = res.data.flatMap(dept => dept.folders);
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
    
    selectedFolders.value = res.data.folders || [];
    
    // Update select all checkboxes
    updateSelectAllStates();
    
    loadingAccess.value = false;
  } catch (err) {
    loadingAccess.value = false;
    error(ParseError(err));
  }
};

const toggleAllFolders = (val) => {
  if (val) {
    selectedFolders.value = listFolders.value.map(f => f.folder_id);
  } else {
    selectedFolders.value = [];
  }
};

const isDeptAllSelected = (deptGroup) => {
  if (!deptGroup.folders || deptGroup.folders.length === 0) return false;
  return deptGroup.folders.every(folder => 
    selectedFolders.value.includes(folder.folder_id)
  );
};

const toggleDeptFolders = (deptGroup, val) => {
  if (val) {
    // Select all folders in this department
    const folderIds = deptGroup.folders.map(f => f.folder_id);
    selectedFolders.value = [
      ...new Set([...selectedFolders.value, ...folderIds])
    ];
  } else {
    // Deselect all folders in this department
    const folderIds = deptGroup.folders.map(f => f.folder_id);
    selectedFolders.value = selectedFolders.value.filter(
      id => !folderIds.includes(id)
    );
  }
  updateSelectAllStates();
};

const updateSelectAllStates = () => {
  selectAllFolders.value = listFolders.value.length > 0 && 
    selectedFolders.value.length === listFolders.value.length;
};

const filterUsers = (val, update) => {
  if (val === '') {
    update(() => {
      filteredUsers.value = listUsers.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredUsers.value = listUsers.value.filter(user => 
      user.label.toLowerCase().includes(needle)
    );
  });
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
      getFolders()
    ]);
  }
});
</script>
