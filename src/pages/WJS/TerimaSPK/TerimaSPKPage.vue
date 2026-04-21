<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assignment" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Terima SPK</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>WJS</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Terima SPK</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="tw-bg-white">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id_spk"
          :pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="pagination.filter"
          @request="onRequest"
          @update:pagination="p => { pagination.value = p; getData(); }"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <!-- Custom header -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width :class="`bg-${domain()} tw-py-4 text-center`">
                <q-checkbox
                  :model-value="isAllSelected"
                  @update:model-value="toggleSelectAll"
                  color="black"
                  keep-color
                  class="checkbox-white-outline"
                />
              </q-th>
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Rows per page -->
          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px">
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
              </q-icon>
              <q-select
                borderless dense
                v-model="pagination.rowsPerPage"
                :options="[10, 25, 50, 100]"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>

          <!-- Toolbar kanan: bulk actions + tambah + search -->
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn
                unelevated color="red-6" icon="delete" label="Hapus"
                :disable="!selected.length"
                class="tw-font-semibold tw-px-4 tw-rounded-lg tw-transition-all"
                @click="onBulkDelete"
              />
              <q-btn
                unelevated color="green-7" icon="play_arrow" label="Proses"
                :disable="!selected.length"
                class="tw-font-semibold tw-px-4 tw-rounded-lg tw-transition-all"
                @click="onBulkProses"
              />
              <q-btn
                unelevated :color="`${domain()}`" icon="add" label="Tambah SPK"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
                @click="onAdd"
              />
              <q-input
                outlined dense debounce="300"
                v-model="pagination.filter"
                placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[240px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" :color="`${domain()}`" />
                </template>
              </q-input>
            </div>
          </template>

          <!-- Body slot dengan checkbox manual -->
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width class="text-center">
                <q-checkbox
                  :model-value="isSelected(props.row)"
                  @update:model-value="toggleSelection(props.row)"
                  dense color="blue-6"
                />
              </q-td>
              <q-td v-for="col in props.cols" :key="col.name" :props="props" class="tw-py-4 tw-text-slate-700">
                <template v-if="col.name === 'actions'">
                  <div class="tw-flex tw-gap-2">
                    <q-btn
                      v-if="tmpPage.edit === '1'"
                      round dense color="blue-6" icon="edit" size="sm"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                      @click="onEdit(props.row)"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit SPK</q-tooltip>
                    </q-btn>
                    <q-btn
                      round dense color="red-6" icon="delete" size="sm"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                      @click="onDelete(props.row)"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Hapus SPK</q-tooltip>
                    </q-btn>
                    <q-btn
                      round dense color="orange-6" icon="hourglass_empty" size="sm"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                      @click="onDuedate(props.row)"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Due Date Proses</q-tooltip>
                    </q-btn>
                    <q-btn
                      round dense color="teal-6" icon="settings" size="sm"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                      @click="onMachining(props.row)"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Machining Proses</q-tooltip>
                    </q-btn>
                    <q-btn
                      round dense color="grey-7" icon="print" size="sm"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                      @click="onCetak(props.row)"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Cetak SPK</q-tooltip>
                    </q-btn>
                    <q-btn
                      round dense color="green-6" icon="play_arrow" size="sm"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                      @click="onSetProses(props.row)"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Set Proses</q-tooltip>
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

    <FormSPK v-model="showForm" :data="selectedRow" @done="onFormDone" />
    <FormDuedate v-model="showDuedate" :data="selectedRow" @done="updateTable" />
    <MachiningDialog v-model="showMachining" :spk="selectedRow" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import { useRoute } from "vue-router";
import { domain, empid, spinnerBall, decryptMessage } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { Loading, useQuasar } from "quasar";
import FormSPK from "../../../components/WJS/TerimaSPK/FormSPK.vue";
import FormDuedate from "../../../components/WJS/TerimaSPK/FormDuedate.vue";
import MachiningDialog from "../../../components/WJS/TerimaSPK/MachiningDialog.vue";
import "../../../assets/styles/table.css";

const { error, success } = useNotify();
const $q = useQuasar();
const route = useRoute();

const rows = ref([]);
const selected = ref([]);
const loading = ref(false);
const showForm = ref(false);
const showDuedate = ref(false);
const showMachining = ref(false);
const selectedRow = ref(null);

const pagination = ref({
  sortBy: "id_spk",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const tmpPage = reactive({ add: "0", edit: "0", delete: "0", view: "0" });

const columns = [
  { name: "actions", label: "Aksi", field: "actions", align: "left", sortable: false },
  { name: "id_spk", label: "No SPK", field: "id_spk", align: "left", sortable: true },
  { name: "tanggal", label: "Tanggal", field: "tanggal", align: "center", sortable: true, format: (val) => val ? dayjs(val).format("DD-MM-YYYY") : "-" },
  { name: "dept", label: "Dept Request", field: "dept", align: "left", sortable: true },
  { name: "tipe", label: "Tipe SPK", field: "tipe", align: "center", sortable: true },
  { name: "jenis", label: "Jenis", field: "jenis", align: "center", sortable: true },
  { name: "target_selesai", label: "Target Selesai", field: "target_selesai", align: "center", sortable: true, format: (val) => val ? dayjs(val).format("DD-MM-YYYY") : "-" },
  { name: "subject", label: "Subjek", field: "subject", align: "left", sortable: true },
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
    getData();
  } catch (e) {
    Loading.hide();
    getData();
  }
};

const getData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/terimaSPK/list`, {
      params: {
        id_group: route.params.id_group ?? undefined,
        page: pagination.value.page,
        rowsPerPage: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending ? "true" : "false",
        filter: pagination.value.filter || undefined,
      },
    });
    rows.value = res.data.data ?? res.data;
    pagination.value.rowsNumber = res.data.pagination?.total ?? res.data.total ?? rows.value.length;
    selected.value = [];
  } catch (e) {
    error("Gagal memuat data SPK");
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getData();
};

const updateTable = () => onRequest({ pagination: pagination.value });

// ─── Selection helpers ────────────────────────────────────────────────────────
const isSelected = (row) => selected.value.some((r) => r.id_spk === row.id_spk);

const toggleSelection = (row) => {
  const idx = selected.value.findIndex((r) => r.id_spk === row.id_spk);
  if (idx > -1) selected.value.splice(idx, 1);
  else selected.value.push(row);
};

const isAllSelected = computed(
  () => rows.value.length > 0 && selected.value.length === rows.value.length
);

const toggleSelectAll = (val) => {
  selected.value = val ? [...rows.value] : [];
};

// ─── Single actions ───────────────────────────────────────────────────────────
const onAdd = () => { selectedRow.value = null; showForm.value = true; };
const onEdit = (row) => { selectedRow.value = row; showForm.value = true; };
const onDuedate = (row) => { selectedRow.value = row; showDuedate.value = true; };
const onMachining = (row) => { selectedRow.value = row; showMachining.value = true; };
const onFormDone = () => { showForm.value = false; updateTable(); };

const onDelete = (row) => {
  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Hapus SPK <strong>${row.id_spk}</strong>?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Hapus", icon: "delete", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.post(`${import.meta.env.VITE_API}wjs/terimaSPK/delete`, { id: row.id_spk });
      success("SPK berhasil dihapus");
      updateTable();
      $q.loading.hide();
    } catch (e) {
      $q.loading.hide();
      error("Gagal menghapus SPK");
    }
  });
};

const onSetProses = (row) => {
  $q.dialog({
    title: "Set Proses",
    message: `Set SPK <strong>${row.id_spk}</strong> ke status Proses?`,
    html: true,
    ok: { push: true, color: "green-7", label: "Proses", icon: "play_arrow", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    persistent: true,
  }).onOk(() => submitProses([row.id_spk]));
};

// ─── Bulk actions ─────────────────────────────────────────────────────────────
const onBulkDelete = () => {
  const ids = selected.value.map((r) => r.id_spk);
  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Hapus <strong>${ids.length}</strong> SPK yang dipilih?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Hapus", icon: "delete", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.post(`${import.meta.env.VITE_API}wjs/terimaSPK/delete`, { ids });
      success(`${ids.length} SPK berhasil dihapus`);
      updateTable();
      $q.loading.hide();
    } catch (e) {
      $q.loading.hide();
      error("Gagal menghapus SPK");
    }
  });
};

const onBulkProses = () => {
  const ids = selected.value.map((r) => r.id_spk);
  $q.dialog({
    title: "Mulai Proses",
    message: `Set <strong>${ids.length}</strong> SPK yang dipilih ke status Proses?`,
    html: true,
    ok: { push: true, color: "green-7", label: "Proses", icon: "play_arrow", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel", class: "tw-font-semibold tw-px-6 tw-rounded-lg" },
    persistent: true,
  }).onOk(() => submitProses(ids));
};

const submitProses = async (ids) => {
  try {
    spinnerBall();
    const payload = ids.length === 1
      ? { status: "proses", table_id: ids[0] }
      : { status: "proses", tbl: ids.map((id) => ({ table_id: id })) };
    const res = await axios.post(`${import.meta.env.VITE_API}wjs/terimaSPK/prosesStore`, payload);
    $q.loading.hide();
    if (res.data.status) { success(res.data.message); updateTable(); }
    else error(res.data.message);
  } catch (e) {
    $q.loading.hide();
    error("Gagal mengubah status SPK");
  }
};

const onCetak = async (row) => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/terimaSPK/cetak/${row.id_spk}`);
    $q.loading.hide();
    const filename = res.data?.data?.filename;
    if (filename) window.open(`${import.meta.env.VITE_API}pdf/${filename}`, "_blank");
  } catch (e) {
    $q.loading.hide();
    error("Gagal generate cetak SPK");
  }
};

onMounted(() => getPageAkses());
</script>

<style scoped>
.checkbox-white-outline :deep(.q-checkbox__bg) {
  border-color: white !important;
}
</style>
