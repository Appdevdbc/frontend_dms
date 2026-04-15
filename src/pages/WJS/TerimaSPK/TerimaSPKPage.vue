<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-4`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assignment" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Terima SPK</div>
            <div class="tw-text-white/80 tw-text-xs">Daftar SPK yang diterima</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-4">
        <!-- Toolbar: Tambah + Bulk Actions + Search -->
        <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
          <q-btn
            v-if="tmpPage.add === '1'"
            color="primary" icon="add" label="Tambah SPK"
            @click="onAdd"
          />
          <q-btn
            v-if="tmpPage.delete === '1'"
            color="negative" icon="delete" label="Hapus"
            :disable="!selected.length"
            @click="onBulkDelete"
          />
          <q-btn
            color="green" icon="play_arrow" label="Proses"
            :disable="!selected.length"
            @click="onBulkProses"
          />
          <q-space />
          <q-input v-model="filter" dense outlined debounce="400" label="Cari..." class="tw-w-64">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>

        <q-table
          :selected="selected"
          :rows="rows"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id_spk"
          selection="multiple"
          flat bordered
          @update:pagination="onRequest"
          @update:selected="selected = $event"
        >
          <template #body-cell-actions="props">
            <q-td :props="props" class="tw-space-x-1 tw-whitespace-nowrap">
              <q-btn v-if="tmpPage.edit === '1'" flat round dense icon="edit" color="primary" size="sm" @click="onEdit(props.row)">
                <q-tooltip>Edit SPK</q-tooltip>
              </q-btn>
              <q-btn v-if="tmpPage.delete === '1'" flat round dense icon="delete" color="negative" size="sm" @click="onDelete(props.row)">
                <q-tooltip>Hapus SPK</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="hourglass_empty" color="orange" size="sm" @click="onDuedate(props.row)">
                <q-tooltip>Due Date Proses</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="settings" color="teal" size="sm" @click="onMachining(props.row)">
                <q-tooltip>Machining Proses</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="print" color="grey-7" size="sm" @click="onCetak(props.row)">
                <q-tooltip>Cetak SPK</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="play_arrow" color="green" size="sm" @click="onSetProses(props.row)">
                <q-tooltip>Set Proses</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Form Tambah/Edit SPK -->
    <FormSPK v-model="showForm" :data="selectedRow" @done="onFormDone" />

    <!-- Form Due Date -->
    <FormDuedate v-model="showDuedate" :data="selectedRow" @done="loadData" />

    <!-- Dialog Machining -->
    <MachiningDialog v-model="showMachining" :spk="selectedRow" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import { domain, empid, spinnerBall, decryptMessage } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { Loading, useQuasar } from "quasar";
import FormSPK from "../../../components/WJS/TerimaSPK/FormSPK.vue";
import FormDuedate from "../../../components/WJS/TerimaSPK/FormDuedate.vue";
import MachiningDialog from "../../../components/WJS/TerimaSPK/MachiningDialog.vue";

const { error, success } = useNotify();
const $q = useQuasar();
const route = useRoute();

const rows = ref([]);
const selected = ref([]);
const loading = ref(false);
const filter = ref("");
const showForm = ref(false);
const showDuedate = ref(false);
const showMachining = ref(false);
const selectedRow = ref(null);

const pagination = ref({
  page: 1, rowsPerPage: 10, rowsNumber: 0,
  sortBy: "id_spk", descending: false,
});

const tmpPage = reactive({ add: "0", edit: "0", delete: "0", view: "0" });

const columns = [
  { name: "id_spk", label: "No SPK", field: "id_spk", align: "left", sortable: true },
  { name: "tanggal", label: "Tanggal", field: "tanggal", align: "center", sortable: true },
  { name: "dept", label: "Dept Request", field: "dept", align: "left", sortable: true },
  { name: "tipe", label: "Tipe SPK", field: "tipe", align: "center", sortable: true },
  { name: "jenis", label: "Jenis", field: "jenis", align: "center", sortable: true },
  { name: "target_selesai", label: "Target Selesai", field: "target_selesai", align: "center", sortable: true },
  { name: "subject", label: "Subjek", field: "subject", align: "left", sortable: true },
  { name: "actions", label: "Aksi", field: "actions", align: "center", sortable: false },
];

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: { role: empid(), page: "/wjs/terima-spk", domain: domain() },
      skipErrorInterceptor: true,
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    Loading.hide();
    loadData();
  } catch (e) {
    Loading.hide();
  }
};

const loadData = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props?.pagination ?? pagination.value;
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/terimaSPK/list`, {
      params: {
        id_group: route.params.id_group ?? undefined,
        page, rowsPerPage, sortBy,
        descending: descending ? "true" : "false",
        filter: filter.value || undefined,
      },
    });
    rows.value = res.data.data ?? res.data;
    pagination.value = {
      ...pagination.value, page, rowsPerPage, sortBy, descending,
      rowsNumber: res.data.total ?? rows.value.length,
    };
    selected.value = [];
  } catch (e) {
    error("Gagal memuat data SPK");
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => loadData(props);

// ─── Single actions ───────────────────────────────────────────────────────────
const onAdd = () => { selectedRow.value = null; showForm.value = true; };
const onEdit = (row) => { selectedRow.value = row; showForm.value = true; };
const onDuedate = (row) => { selectedRow.value = row; showDuedate.value = true; };
const onMachining = (row) => { selectedRow.value = row; showMachining.value = true; };
const onFormDone = () => { showForm.value = false; loadData(); };

const onDelete = (row) => {
  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Hapus SPK ${row.id_spk}?`,
    cancel: true, persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}dms/terimaSPK/delete`, { id: row.id_spk });
      success("SPK berhasil dihapus");
      loadData();
    } catch (e) {
      error("Gagal menghapus SPK");
    }
  });
};

const onSetProses = (row) => {
  $q.dialog({
    title: "Set Proses",
    message: `Set SPK ${row.id_spk} ke status Proses?`,
    cancel: true, persistent: true,
  }).onOk(() => submitProses([row.id_spk]));
};

// ─── Bulk actions ─────────────────────────────────────────────────────────────
const onBulkDelete = () => {
  const ids = selected.value.map((r) => r.id_spk);
  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Hapus ${ids.length} SPK yang dipilih?`,
    cancel: true, persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}dms/terimaSPK/delete`, { ids });
      success(`${ids.length} SPK berhasil dihapus`);
      loadData();
    } catch (e) {
      error("Gagal menghapus SPK");
    }
  });
};

const onBulkProses = () => {
  const ids = selected.value.map((r) => r.id_spk);
  $q.dialog({
    title: "Mulai Proses",
    message: `Set ${ids.length} SPK yang dipilih ke status Proses?`,
    cancel: true, persistent: true,
  }).onOk(() => submitProses(ids));
};

// ─── Submit proses (single & bulk) ───────────────────────────────────────────
const submitProses = async (ids) => {
  try {
    const payload = ids.length === 1
      ? { status: "proses", table_id: ids[0] }
      : { status: "proses", tbl: ids.map((id) => ({ table_id: id })) };

    const res = await axios.post(`${import.meta.env.VITE_API}dms/terimaSPK/prosesStore`, payload);
    if (res.data.status) { success(res.data.message); loadData(); }
    else error(res.data.message);
  } catch (e) {
    error("Gagal mengubah status SPK");
  }
};

const onCetak = async (row) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/terimaSPK/cetak/${row.id_spk}`);
    const filename = res.data?.data?.filename;
    if (filename) {
      window.open(`${import.meta.env.VITE_API}pdf/${filename}`, "_blank");
    }
  } catch (e) {
    error("Gagal generate cetak SPK");
  }
};

watch(filter, () => loadData());
// onMounted(() => getPageAkses());
</script>
