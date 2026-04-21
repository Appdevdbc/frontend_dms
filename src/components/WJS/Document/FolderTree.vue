<template>
  <div class="tw-h-full tw-flex tw-flex-col">
    <div class="tw-p-3 tw-border-b tw-border-gray-200">
      <q-input dense outlined v-model="search" placeholder="Cari folder..." clearable class="tw-bg-white tw-rounded-lg">
        <template v-slot:prepend><q-icon name="search" color="blue-6" size="18px" /></template>
      </q-input>
    </div>
    <div class="tw-flex-1 tw-overflow-auto tw-p-2">
      <q-tree :nodes="filteredTree" node-key="folder_id" label-key="folder_name"
        :selected="selectedId" selected-color="blue-6"
        @update:selected="onSelect"
        default-expand-all class="tw-text-sm">
        <template v-slot:default-header="prop">
          <div class="tw-flex tw-items-center tw-gap-2 tw-w-full tw-group">
            <q-icon :name="prop.node.children?.length ? 'folder_open' : 'folder'" color="amber-7" size="18px" />
            <span class="tw-flex-1 tw-truncate">{{ prop.node.folder_name }}</span>
            <div class="tw-hidden group-hover:tw-flex tw-gap-1" v-if="canManage(prop.node)">
              <q-btn flat round dense icon="edit" size="xs" color="blue-6" @click.stop="renameFolder(prop.node)">
                <q-tooltip>Rename</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="create_new_folder" size="xs" color="green-6" @click.stop="addSubFolder(prop.node)">
                <q-tooltip>Tambah Sub Folder</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="lock" size="xs" color="purple-6" @click.stop="openPermission(prop.node)">
                <q-tooltip>Permission</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="delete" size="xs" color="red-6" @click.stop="deleteFolder(prop.node)">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
      </q-tree>
    </div>
    <div class="tw-p-3 tw-border-t tw-border-gray-200">
      <q-btn unelevated color="blue-6" icon="create_new_folder" label="Folder Baru" size="sm" class="tw-w-full tw-rounded-lg" @click="addRootFolder" />
    </div>

    <!-- Dialog Tambah/Rename Folder -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width:360px">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h6">{{ dialogTitle }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="folderName" outlined label="Nama Folder" autofocus @keyup.enter="saveFolder" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="blue-6" label="Simpan" @click="saveFolder" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Permission Folder -->
    <PermissionFolderDialog v-if="showPermDialog" v-model="showPermDialog"
      :folder-id="permFolderId" :folder-name="permFolderName" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { empid, domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import PermissionFolderDialog from "./PermissionFolderDialog.vue";

const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  userType: { type: String, default: 'restricted' },
});
const emit = defineEmits(['update:modelValue', 'folder-selected']);
const { success, error } = useNotify();

const folders = ref([]);
const search = ref('');
const selectedId = ref(props.modelValue);
const showDialog = ref(false);
const dialogTitle = ref('');
const folderName = ref('');
const saving = ref(false);
const editingFolder = ref(null);
const parentFolder = ref(null);

const showPermDialog = ref(false);
const permFolderId = ref(null);
const permFolderName = ref('');

const openPermission = (node) => {
  permFolderId.value = node.folder_id;
  permFolderName.value = node.folder_name;
  showPermDialog.value = true;
};

const folderScope = computed(() => props.userType || 'restricted');

const divId = computed(() => {
  try { return JSON.parse(window.localStorage.getItem('data'))?.data?.div || ''; } catch { return ''; }
});

const buildTree = (list, parentId = null) => {
  // Root node: folder_parent = "#" atau null atau "0" atau 0
  const isRoot = (fp) => fp === '#' || fp === null || fp === undefined || fp === '' || fp === '0' || fp === 0;

  return list
    .filter(f => parentId === null ? isRoot(f.folder_parent) : String(f.folder_parent) === String(parentId))
    .map(f => {
      const children = buildTree(list, f.folder_id);
      return children.length > 0 ? { ...f, children } : { ...f };
    });
};

const filteredTree = computed(() => {
  const tree = buildTree(folders.value);
  if (!search.value) return tree;
  // Filter tree berdasarkan search — tampilkan node yang cocok beserta parent-nya
  const keyword = search.value.toLowerCase();
  const filterNodes = (nodes) => nodes.reduce((acc, node) => {
    const children = filterNodes(node.children || []);
    if (node.folder_name?.toLowerCase().includes(keyword) || children.length > 0) {
      acc.push({ ...node, children });
    }
    return acc;
  }, []);
  return filterNodes(tree);
});

const canManage = (node) => ['full access', 'single bu'].includes(folderScope.value.toLowerCase());

const filterFn = (node, filter) => node.folder_name?.toLowerCase().includes(filter.toLowerCase());

const loadFolders = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/document/folders`, {
      params: { empid: empid(), domain: domain(), type: folderScope.value, div: divId.value }
    });
    folders.value = res.data || [];
  } catch (e) { error('Gagal memuat folder'); }
};

const onSelect = (id) => {
  const folder = folders.value.find(f => f.folder_id == id);
  emit('update:modelValue', id);
  emit('folder-selected', folder);
};

const addRootFolder = () => {
  // Jika ada folder aktif, jadikan sebagai parent
  if (selectedId.value) {
    const activeFolder = folders.value.find(f => f.folder_id == selectedId.value);
    parentFolder.value = activeFolder || null;
    dialogTitle.value = activeFolder
      ? `Tambah Sub Folder di "${activeFolder.folder_name}"`
      : 'Tambah Folder Baru';
  } else {
    parentFolder.value = null;
    dialogTitle.value = 'Tambah Folder Baru';
  }
  editingFolder.value = null;
  folderName.value = '';
  showDialog.value = true;
};

const addSubFolder = (node) => {
  parentFolder.value = node; editingFolder.value = null;
  folderName.value = ''; dialogTitle.value = `Tambah Sub Folder di "${node.folder_name}"`; showDialog.value = true;
};

const renameFolder = (node) => {
  editingFolder.value = node; parentFolder.value = null;
  folderName.value = node.folder_name; dialogTitle.value = 'Rename Folder'; showDialog.value = true;
};

const saveFolder = async () => {
  if (!folderName.value.trim()) return error('Nama folder wajib diisi');
  saving.value = true;
  try {
    if (editingFolder.value) {
      await axios.post(`/wjs/document/folders/rename`, { folder_id: editingFolder.value.folder_id, folder_name: folderName.value });
      success('Folder berhasil direname');
    } else {
      await axios.post(`/wjs/document/folders`, {
        creator: empid(), folder_name: folderName.value,
        folder_parent: parentFolder.value?.folder_id || 0,
        folder_bu: domain(), folder_div: 'all', folder_security: 'private',
      });
      success('Folder berhasil dibuat');
    }
    showDialog.value = false; await loadFolders();
  } catch (e) { error(e.response?.data?.message || 'Gagal menyimpan folder'); } finally { saving.value = false; }
};

const deleteFolder = async (node) => {
  try {
    await axios.post(`/wjs/document/folders/delete`, { folder_id: node.folder_id });
    success('Folder berhasil dihapus'); await loadFolders();
  } catch (e) { error(e.response?.data?.message || 'Gagal menghapus folder'); }
};

watch(() => props.modelValue, (v) => { selectedId.value = v; });
watch(folderScope, () => { loadFolders(); });
onMounted(loadFolders);
</script>

