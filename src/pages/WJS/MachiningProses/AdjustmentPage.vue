<template>
  <div class="q-pa-md tw-space-y-4">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="tune" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Adjustment</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Transaksi</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Adjustment</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Filter Section -->
      <q-card-section class="tw-bg-white tw-p-6">
        <div class="tw-flex tw-items-end tw-gap-4 tw-flex-wrap">
          <q-select
            v-model="filterSection"
            :options="sectionOptions"
            label="Section"
            outlined dense emit-value map-options
            class="tw-min-w-[220px]"
          />
          <q-input v-model="filterStart" type="date" label="Dari Tanggal" outlined dense class="tw-min-w-[160px]" />
          <q-input v-model="filterEnd"   type="date" label="Sampai Tanggal" outlined dense class="tw-min-w-[160px]" />
          <q-btn
            unelevated :color="`${domain()}`" icon="search" label="Cari"
            class="tw-font-semibold tw-px-5 tw-rounded-lg"
            :loading="loading"
            @click="loadList"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabel Adjustment -->
    <q-card class="tw-shadow-md tw-rounded-2xl tw-overflow-hidden">
      <q-card-section class="tw-p-4">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          :rows-per-page-options="[10, 25, 50]"
          class="tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-3 tw-text-slate-700 tw-text-sm">
              {{ props.value }}
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="tw-py-3">
              <q-badge
                :color="props.value === 'tutup' ? 'green' : props.value === 'proses' ? 'blue' : 'grey'"
                :label="props.value"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="tw-py-3">
              <div class="tw-flex tw-gap-2">
                <q-btn
                  round dense color="blue-6" icon="list" size="sm"
                  class="tw-shadow-md hover:tw-scale-110 tw-transition-all"
                  @click="onViewList(props.row)"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Detail per SPK</q-tooltip>
                </q-btn>
                <q-btn
                  round dense color="orange-6" icon="edit" size="sm"
                  class="tw-shadow-md hover:tw-scale-110 tw-transition-all"
                  @click="onEdit(props.row)"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit Adjustment</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog: List by SPK -->
    <q-dialog v-model="showListDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-card-section :class="`bg-${domain()} tw-flex tw-items-center tw-gap-3`">
          <q-icon name="list" size="24px" class="tw-text-white" />
          <span class="text-h6 tw-text-white tw-font-bold">
            Detail — SPK {{ selectedRow?.id_spk }} / PIC {{ selectedRow?.pic }}
          </span>
          <q-space />
          <q-btn flat round icon="close" color="white" @click="showListDialog = false" />
        </q-card-section>
        <q-card-section class="tw-p-4">
          <q-table
            :rows="listBySPK"
            :columns="detailColumns"
            row-key="id"
            :loading="loadingDetail"
            flat
            :rows-per-page-options="[0]"
            class="tw-rounded-xl tw-overflow-hidden"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props"
                  :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3`">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="tw-py-3">
                <q-btn
                  round dense color="orange-6" icon="edit" size="sm"
                  class="tw-shadow-md hover:tw-scale-110 tw-transition-all"
                  @click="onEditFromList(props.row)"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog: Edit Adjustment -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 480px">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="edit" />
            Edit Adjustment
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="tw-p-5 tw-space-y-3" v-if="editData">
          <!-- Info readonly -->
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3 tw-text-sm tw-space-y-1">
            <div><span class="tw-font-semibold">No SPK:</span> {{ editData.id_spk }}</div>
            <div><span class="tw-font-semibold">PIC:</span> {{ editData.pic }}</div>
            <div><span class="tw-font-semibold">Section/Mesin:</span> {{ editData.id_mesin }}</div>
            <div v-if="editData.finish">
              <span class="tw-font-semibold">Finish saat ini:</span>
              {{ formatDt(editData.finish) }}
            </div>
            <div v-else-if="editData.postpone">
              <span class="tw-font-semibold">Postpone saat ini:</span>
              {{ formatDt(editData.postpone) }}
            </div>
          </div>

          <!-- Form edit -->
          <div class="tw-grid tw-grid-cols-3 tw-gap-3">
            <q-input
              v-model="editForm.tanggal"
              type="date" label="Tanggal *"
              outlined dense
              class="tw-col-span-3 md:tw-col-span-1"
            />
            <q-input
              v-model="editForm.jam"
              label="Jam *" placeholder="10"
              outlined dense type="number" min="0" max="23"
            />
            <q-input
              v-model="editForm.menit"
              label="Menit *" placeholder="30"
              outlined dense type="number" min="0" max="59"
            />
          </div>

          <q-select
            v-model="editForm.action"
            :options="[{ label: 'Finish', value: 'finish' }, { label: 'Postpone', value: 'postpone' }]"
            label="Action *"
            outlined dense emit-value map-options
          />
        </q-card-section>

        <q-card-actions align="right" class="tw-px-5 tw-pb-5 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" icon="cancel" class="tw-font-semibold tw-px-5 tw-rounded-lg" @click="showEditDialog = false" />
          <q-btn unelevated :color="`${domain()}`" label="Simpan" icon="save" class="tw-font-semibold tw-px-5 tw-rounded-lg"
            :loading="saving" @click="onSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

dayjs.extend(utc);

const { error, success } = useNotify();

const rows        = ref([]);
const loading     = ref(false);
const filterSection = ref("machining");
const filterStart   = ref(dayjs().format("YYYY-MM-DD"));
const filterEnd     = ref(dayjs().format("YYYY-MM-DD"));

const showListDialog  = ref(false);
const listBySPK       = ref([]);
const loadingDetail   = ref(false);
const selectedRow     = ref(null);

const showEditDialog  = ref(false);
const editData        = ref(null);
const saving          = ref(false);
const editForm        = ref({ tanggal: "", jam: "", menit: "", action: "finish" });

const sectionOptions = [
  { label: "Machining",        value: "machining" },
  { label: "Bongkar Analisis", value: "bongkar_analisis" },
  { label: "Order Part",       value: "order_part" },
  { label: "Drawing",          value: "drawing" },
  { label: "Assy",             value: "assy" },
  { label: "Trial",            value: "trial" },
];

const columns = [
  { name: "actions",   label: "Aksi",       field: "actions",   align: "center", sortable: false },
  { name: "id_spk",    label: "No SPK",     field: "id_spk",    align: "left",   sortable: true },
  { name: "nama_pic",  label: "PIC",        field: "nama_pic",  align: "left",   sortable: true },
  { name: "namaMesin", label: "Machine",    field: "namaMesin", align: "left",   sortable: true },
  { name: "start",     label: "Waktu",      field: "start",     align: "center", sortable: true,
    format: (val) => val ? dayjs.utc(val).format("DD-MM-YYYY HH:mm:ss") : "-" },
  { name: "status",    label: "Status SPK", field: "status",    align: "center" },
];

const detailColumns = [
  { name: "actions",   label: "Aksi",     field: "actions",   align: "center" },
  { name: "id_mesin",  label: "Section",  field: "id_mesin",  align: "left" },
  { name: "start",     label: "Start",    field: "start",     align: "center", format: (v) => formatDt(v) },
  { name: "postpone",  label: "Postpone", field: "postpone",  align: "center", format: (v) => formatDt(v) },
  { name: "finish",    label: "Finish",   field: "finish",    align: "center", format: (v) => formatDt(v) },
];

const formatDt = (v) => v ? dayjs.utc(v).format("DD-MM-YYYY HH:mm") : "-";

// ─── Load list ────────────────────────────────────────────────────────────────
const loadList = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/adjustment/list`, {
      params: { section: filterSection.value, start: filterStart.value, end: filterEnd.value },
    });
    rows.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    error("Gagal memuat data adjustment");
  } finally {
    loading.value = false;
  }
};

// ─── View list by SPK ─────────────────────────────────────────────────────────
const onViewList = async (row) => {
  selectedRow.value = row;
  showListDialog.value = true;
  loadingDetail.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/adjustment/by-spk`, {
      params: { spk: row.id_spk, pic: row.pic },
    });
    listBySPK.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    error("Gagal memuat detail");
  } finally {
    loadingDetail.value = false;
  }
};

// ─── Edit dari tabel utama ────────────────────────────────────────────────────
const onEdit = (row) => {
  editData.value = {
    id: row.id,
    id_spk: row.id_spk,
    id_mesin: row.id_mesin ?? filterSection.value,
    pic: row.pic,
    finish: row.finish,
    postpone: row.postpone,
  };
  const dt = row.finish ?? row.postpone;
  editForm.value = {
    tanggal: dt ? dayjs(dt).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
    jam:     dt ? dayjs.utc(dt).format("HH") : "17",
    menit:   dt ? dayjs.utc(dt).format("mm") : "00",
    action:  row.finish ? "finish" : "postpone",
  };
  showEditDialog.value = true;
};

// ─── Edit dari dialog list ────────────────────────────────────────────────────
const onEditFromList = (row) => {
  editData.value = {
    id: row.id,
    id_spk: row.id_spk,
    id_mesin: row.id_mesin,
    pic: row.pic,
    finish: row.finish,
    postpone: row.postpone,
  };
  const dt = row.finish ?? row.postpone;
  editForm.value = {
    tanggal: dt ? dayjs(dt).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
    jam:     dt ? dayjs(dt).format("HH") : "17",
    menit:   dt ? dayjs(dt).format("mm") : "00",
    action:  row.finish ? "finish" : "postpone",
  };
  showEditDialog.value = true;
};

// ─── Save ─────────────────────────────────────────────────────────────────────
const onSave = async () => {
  if (!editForm.value.tanggal || !editForm.value.jam || !editForm.value.menit)
    return error("Tanggal, jam, dan menit wajib diisi");

  saving.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}dms/adjustment/store`, {
      id:       editData.value.id,
      id_spk:   editData.value.id_spk,
      id_mesin: editData.value.id_mesin,
      pic:      editData.value.pic,
      ...editForm.value,
    });
    success("Adjustment berhasil disimpan");
    showEditDialog.value = false;
    loadList();
    if (showListDialog.value) {
      onViewList(selectedRow.value);
    }
  } catch (e) {
    error(e.response?.data?.message ?? "Gagal menyimpan adjustment");
  } finally {
    saving.value = false;
  }
};

onMounted(() => loadList());
</script>
