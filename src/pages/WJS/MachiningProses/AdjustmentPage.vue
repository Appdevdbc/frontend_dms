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
      <q-card-section class="tw-bg-slate-50">
        <div class="tw-font-bold tw-text-lg tw-mb-4 tw-flex tw-items-center tw-gap-2">
          <q-icon name="filter_alt" size="24px" :color="`${domain()}`"/>
          Filter
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filterSection"
              :options="sectionOptions"
              label="Section"
              emit-value
              map-options
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="category" :color="`${domain()}`"/>
              </template>
            </q-select>
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              outlined
              v-model="filterStart"
              type="date"
              label="Dari Tanggal"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`"/>
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              outlined
              v-model="filterEnd"
              type="date"
              label="Sampai Tanggal"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`"/>
              </template>
            </q-input>
          </div>
        </div>
        
        <div class="tw-flex tw-gap-3 tw-mt-4">
          <q-btn
            unelevated
            :color="`${domain()}`"
            label="Cari"
            icon="search"
            @click="loadList"
            :loading="loading"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabel Adjustment -->
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden tw-mt-4">
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :filter="searchText"
          :pagination.sync="pagination"
          flat
          :rows-per-page-options="[10, 25, 50, 100]"
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px">
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
              </q-icon>
              <q-select
                borderless
                dense
                v-model="pagination.rowsPerPage"
                :options="[10, 25, 50, 100]"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>
          
          <template v-slot:top-right>
            <q-input
              outlined
              dense
              debounce="300"
              v-model="searchText"
              placeholder="Search..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
            >
              <template v-slot:prepend>
                <q-icon name="search" :color="`${domain()}`" />
              </template>
            </q-input>
          </template>
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
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog: List by SPK (PHP Style - Inline Edit Forms) -->
    <q-dialog v-model="showListDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-card-section :class="`bg-${domain()} tw-flex tw-items-center tw-gap-3`">
          <q-icon name="list" size="24px" class="tw-text-white" />
          <span class="text-h6 tw-text-white tw-font-bold">
            Edit Adjustment — SPK {{ selectedRow?.id_spk }} / PIC {{ selectedRow?.pic }}
          </span>
          <q-space />
          <q-btn flat round icon="close" color="white" @click="showListDialog = false" />
        </q-card-section>
        <q-card-section class="tw-p-6">
          <div v-if="loadingDetail" class="tw-text-center tw-py-8">
            <q-spinner color="primary" size="3em" />
          </div>
          <div v-else class="tw-space-y-4">
            <!-- Loop through each record with inline edit form -->
            <q-card v-for="(row, idx) in listBySPK" :key="row.id" class="tw-border tw-border-slate-200">
              <q-card-section class="tw-bg-slate-50 tw-border-b tw-border-slate-200">
                <div class="tw-font-bold tw-text-slate-700">
                  Record #{{ idx + 1 }} - Section: {{ row.id_mesin }}
                </div>
              </q-card-section>
              <q-card-section class="tw-p-4">
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mb-4">
                  <div class="tw-text-sm">
                    <span class="tw-font-semibold">Start:</span> {{ formatDt(row.start) }}
                  </div>
                  <div class="tw-text-sm">
                    <span class="tw-font-semibold">Postpone:</span> {{ formatDt(row.postpone) }}
                  </div>
                  <div class="tw-text-sm">
                    <span class="tw-font-semibold">Finish:</span> {{ formatDt(row.finish) }}
                  </div>
                </div>

                <!-- Inline Edit Form -->
                <div class="tw-bg-blue-50 tw-p-4 tw-rounded-lg">
                  <div class="tw-font-semibold tw-mb-3 tw-text-slate-700">
                    {{ row.finish ? 'Edit Finish' : 'Edit Postpone' }}
                  </div>
                  <div class="tw-text-sm tw-mb-3 tw-font-bold">
                    Current: {{ row.finish ? formatDt(row.finish) : formatDt(row.postpone) }}
                  </div>
                  <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-7 tw-gap-3 tw-items-end">
                    <q-input
                      v-model="row.editForm.tanggal"
                      type="date"
                      label="Tanggal"
                      outlined dense
                      class="md:tw-col-span-3"
                    />
                    <q-input
                      v-model="row.editForm.jam"
                      label="Jam" placeholder="10"
                      outlined dense type="number" min="0" max="23"
                      class="md:tw-col-span-2"
                    />
                    <q-input
                      v-model="row.editForm.menit"
                      label="Menit" placeholder="30"
                      outlined dense type="number" min="0" max="59"
                      class="md:tw-col-span-2"
                    />
                  </div>
                  <div class="tw-mt-3">
                    <q-btn
                      unelevated :color="`${domain()}`" icon="save" label="Simpan"
                      class="tw-font-semibold tw-px-5 tw-rounded-lg"
                      :loading="row.saving"
                      @click="onSaveInline(row)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <div class="tw-mt-4">
              <q-btn
                flat color="grey-7" icon="arrow_back" label="Kembali"
                class="tw-font-semibold tw-px-5 tw-rounded-lg"
                @click="showListDialog = false"
              />
            </div>
          </div>
        </q-card-section>
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
const searchText    = ref("");
const pagination    = ref({
  rowsPerPage: 10
});

const showListDialog  = ref(false);
const listBySPK       = ref([]);
const loadingDetail   = ref(false);
const selectedRow     = ref(null);

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

// ─── View list by SPK (PHP Style) ─────────────────────────────────────────────
const onViewList = async (row) => {
  selectedRow.value = row;
  showListDialog.value = true;
  loadingDetail.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/adjusment/list/${row.id_spk}/${row.pic}`);
    const data = Array.isArray(res.data) ? res.data : [];
    
    // Initialize edit form for each row (PHP style)
    listBySPK.value = data.map(item => {
      const dt = item.finish ?? item.postpone;
      return {
        ...item,
        saving: false,
        editForm: {
          tanggal: dt ? dayjs(dt).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
          jam:     dt ? dayjs(dt).format("HH") : dayjs().format("HH"),
          menit:   dt ? dayjs(dt).format("mm") : dayjs().format("mm"),
        }
      };
    });
  } catch (e) {
    error("Gagal memuat detail");
  } finally {
    loadingDetail.value = false;
  }
};

// ─── Save inline (PHP Style) ──────────────────────────────────────────────────
const onSaveInline = async (row) => {
  if (!row.editForm.tanggal || !row.editForm.jam || !row.editForm.menit) {
    return error("Tanggal, jam, dan menit wajib diisi");
  }

  row.saving = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}dms/adjustment/store`, {
      id:       row.id,
      id_spk:   row.id_spk,
      id_mesin: row.id_mesin,
      pic:      row.pic,
      tanggal:  row.editForm.tanggal,
      jam:      row.editForm.jam,
      menit:    row.editForm.menit,
      action:   row.finish ? "finish" : "postpone",
    });
    success("Adjustment berhasil disimpan");
    // Reload the list
    await onViewList(selectedRow.value);
    loadList();
  } catch (e) {
    error(e.response?.data?.message ?? "Gagal menyimpan adjustment");
  } finally {
    row.saving = false;
  }
};

onMounted(() => loadList());
</script>
