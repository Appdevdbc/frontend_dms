<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-4`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="task_alt" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">SPK Close</div>
            <div class="tw-text-white/80 tw-text-xs">SPK yang telah selesai</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-4">
        <div class="tw-flex tw-justify-end tw-mb-4">
          <q-input v-model="filter" dense outlined debounce="400" label="Cari..." class="tw-w-64">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>

        <q-table
          :rows="rows"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id_spk"
          flat bordered
          @request="onRequest"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status === 'close' ? 'blue' : 'green'"
                :label="props.row.status"
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round dense icon="folder_open" color="orange" size="sm" @click="onReopen(props.row)">
                <q-tooltip>Reopen SPK</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { useQuasar } from "quasar";

const { error, success } = useNotify();
const $q = useQuasar();

const rows = ref([]);
const loading = ref(false);
const filter = ref("");

const pagination = ref({
  page: 1, rowsPerPage: 10, rowsNumber: 0,
  sortBy: "id_spk", descending: false,
});

const columns = [
  { name: "id_spk", label: "No SPK", field: "id_spk", align: "left", sortable: true },
  { name: "tanggal", label: "Tanggal", field: "tanggal", align: "center", sortable: true },
  { name: "dept", label: "Departemen", field: "dept", align: "left", sortable: true },
  { name: "tipe", label: "Tipe", field: "tipe", align: "center", sortable: true },
  { name: "target_selesai", label: "Target Selesai", field: "target_selesai", align: "center", sortable: true },
  { name: "subject", label: "Subject", field: "subject", align: "left", sortable: true },
  { name: "status", label: "Status", field: "status", align: "center", sortable: false },
  { name: "close_at", label: "Ditutup", field: "close_at", align: "center", sortable: true },
  { name: "actions", label: "Aksi", field: "actions", align: "center", sortable: false },
];

const loadData = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props?.pagination ?? pagination.value;
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/terimaSPK/close/list`, {
      params: {
        page, rowsPerPage, sortBy,
        descending: descending ? "true" : "false",
        filter: filter.value || undefined,
      },
    });
    const data = res.data.data ?? res.data;
    rows.value = data;
    pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending, rowsNumber: res.data.total ?? data.length };
  } catch (e) {
    error("Gagal memuat data SPK Close");
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => loadData(props);

const onReopen = (row) => {
  $q.dialog({
    title: "Reopen SPK",
    message: `Reopen SPK ${row.id_spk} ke status Proses?`,
    cancel: true, persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}wjs/terimaSPK/close/reopen`, { id: row.id_spk });
      success("SPK berhasil di-reopen");
      loadData();
    } catch (e) {
      error("Gagal reopen SPK");
    }
  });
};

watch(filter, () => loadData());
onMounted(() => loadData());
</script>
