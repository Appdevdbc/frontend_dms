<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-4`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="pending_actions" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">SPK Proses</div>
            <div class="tw-text-white/80 tw-text-xs">SPK yang sedang dikerjakan</div>
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
                :color="statusColor(props.row)"
                :label="props.row._status"
                class="tw-cursor-pointer"
                @click="onDetailStatus(props.row)"
              />
            </q-td>
          </template>

          <template #body-cell-target_selesai="props">
            <q-td :props="props">
              <span
                class="tw-cursor-pointer tw-underline tw-text-blue-600"
                @click="onEditTarget(props.row)"
              >{{ props.row.target_selesai }}</span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="tw-space-x-1">
              <q-btn flat round dense icon="settings" color="teal" size="sm" @click="onMachining(props.row)">
                <q-tooltip>Machining Proses</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="close" color="negative" size="sm" @click="onTutup(props.row)">
                <q-tooltip>Tutup SPK</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Edit Target -->
    <q-dialog v-model="showEditTarget" persistent>
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">Edit Target Selesai</q-card-section>
        <q-card-section>
          <q-input v-model="editTargetForm.target_selesai" type="date" label="Target Selesai" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Batal" @click="showEditTarget = false" />
          <q-btn color="primary" label="Simpan" @click="submitEditTarget" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Detail Status -->
    <DetailStatusDialog v-model="showDetailStatus" :spk="selectedRow" />

    <!-- Dialog Machining -->
    <MachiningDialog v-model="showMachining" :spk="selectedRow" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import { domain, empid, spinnerBall, decryptMessage } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { Loading, useQuasar } from "quasar";
import DetailStatusDialog from "../../../components/WJS/TerimaSPK/DetailStatusDialog.vue";
import MachiningDialog from "../../../components/WJS/TerimaSPK/MachiningDialog.vue";

const { error, success } = useNotify();
const $q = useQuasar();

const rows = ref([]);
const loading = ref(false);
const filter = ref("");
const showEditTarget = ref(false);
const showDetailStatus = ref(false);
const showMachining = ref(false);
const selectedRow = ref(null);
const editTargetForm = reactive({ id_spk: null, target_selesai: "" });

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
  { name: "status", label: "Status", field: "_status", align: "center", sortable: false },
  { name: "actions", label: "Aksi", field: "actions", align: "center", sortable: false },
];

const statusColor = (row) => {
  if (row._status === "Progress") return "orange";
  if (row._status === "Close") return "green";
  return "grey";
};

const loadData = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props?.pagination ?? pagination.value;
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/terimaSPK/proses/list`, {
      params: {
        page, rowsPerPage, sortBy,
        descending: descending ? "true" : "false",
        filter: filter.value || undefined,
      },
    });
    // Hitung status dari data scan
    const data = res.data.data ?? res.data;
    rows.value = data;
    pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending, rowsNumber: res.data.total ?? data.length };
  } catch (e) {
    error("Gagal memuat data SPK Proses");
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => loadData(props);

const onEditTarget = (row) => {
  editTargetForm.id_spk = row.id_spk;
  editTargetForm.target_selesai = row.target_selesai;
  showEditTarget.value = true;
};

const submitEditTarget = async () => {
  try {
    await axios.put(`${import.meta.env.VITE_API}wjs/terimaSPK/proses/target`, editTargetForm);
    success("Target selesai berhasil diupdate");
    showEditTarget.value = false;
    loadData();
  } catch (e) {
    error("Gagal update target selesai");
  }
};

const onDetailStatus = (row) => { selectedRow.value = row; showDetailStatus.value = true; };
const onMachining = (row) => { selectedRow.value = row; showMachining.value = true; };

const onTutup = (row) => {
  $q.dialog({
    title: "Tutup SPK",
    message: `Tutup SPK ${row.id_spk}?`,
    cancel: true, persistent: true,
  }).onOk(async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API}wjs/terimaSPK/prosesStore`, {
        status: "tutup", table_id: row.id_spk,
      });
      if (res.data.status) { success(res.data.message); loadData(); }
      else error(res.data.message);
    } catch (e) {
      error("Gagal menutup SPK");
    }
  });
};

watch(filter, () => loadData());
onMounted(() => loadData());
</script>
