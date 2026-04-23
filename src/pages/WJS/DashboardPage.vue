<template>
  <div class="q-pa-md tw-space-y-6">
    <!-- Header -->
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="dashboard" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Dashboard</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Dashboard</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
      <q-spinner-dots color="primary" size="48px" />
    </div>

    <template v-else>
      <!-- Row 1: Mold Repair + General + Service Level -->
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
        <!-- Mold Repair Monthly -->
        <q-card class="tw-rounded-2xl tw-shadow-md tw-overflow-hidden">
          <q-card-section class="tw-bg-blue-600 tw-py-3 tw-px-4">
            <div class="tw-text-white tw-font-bold tw-text-sm">Mold Repair — Bulan Ini</div>
          </q-card-section>
          <q-card-section class="tw-p-4">
            <apexchart type="radialBar" height="200" :options="radialOpts('Pencapaian')" :series="[moldRepairMonthPct]" />
            <div class="tw-text-center tw-text-xs tw-text-slate-500 tw-mt-1">
              {{ data.moldRepair.closedMonth }} / {{ data.moldRepair.targetMonth }} SPK
            </div>
          </q-card-section>
        </q-card>

        <!-- Mold Repair Yearly -->
        <q-card class="tw-rounded-2xl tw-shadow-md tw-overflow-hidden">
          <q-card-section class="tw-bg-blue-700 tw-py-3 tw-px-4">
            <div class="tw-text-white tw-font-bold tw-text-sm">Mold Repair — Tahun Ini</div>
          </q-card-section>
          <q-card-section class="tw-p-4">
            <apexchart type="radialBar" height="200" :options="radialOpts('Pencapaian')" :series="[moldRepairYearPct]" />
            <div class="tw-text-center tw-text-xs tw-text-slate-500 tw-mt-1">
              {{ data.moldRepair.closedYear }} / {{ data.moldRepair.targetYear }} SPK
            </div>
          </q-card-section>
        </q-card>

        <!-- General Monthly -->
        <q-card class="tw-rounded-2xl tw-shadow-md tw-overflow-hidden">
          <q-card-section class="tw-bg-emerald-600 tw-py-3 tw-px-4">
            <div class="tw-text-white tw-font-bold tw-text-sm">General — Bulan Ini</div>
          </q-card-section>
          <q-card-section class="tw-p-4">
            <apexchart type="radialBar" height="200" :options="radialOpts('Pencapaian', '#10b981')" :series="[generalMonthPct]" />
            <div class="tw-text-center tw-text-xs tw-text-slate-500 tw-mt-1">
              {{ data.general.closedMonth }} / {{ data.general.targetMonth }} SPK
            </div>
          </q-card-section>
        </q-card>

        <!-- General Yearly -->
        <q-card class="tw-rounded-2xl tw-shadow-md tw-overflow-hidden">
          <q-card-section class="tw-bg-emerald-700 tw-py-3 tw-px-4">
            <div class="tw-text-white tw-font-bold tw-text-sm">General — Tahun Ini</div>
          </q-card-section>
          <q-card-section class="tw-p-4">
            <apexchart type="radialBar" height="200" :options="radialOpts('Pencapaian', '#10b981')" :series="[generalYearPct]" />
            <div class="tw-text-center tw-text-xs tw-text-slate-500 tw-mt-1">
              {{ data.general.closedYear }} / {{ data.general.targetYear }} SPK
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Row 2: Service Level -->
      <q-card class="tw-rounded-2xl tw-shadow-md tw-overflow-hidden">
        <q-card-section class="tw-bg-purple-600 tw-py-3 tw-px-4">
          <div class="tw-text-white tw-font-bold tw-text-sm">Service Level — Bulan Ini</div>
        </q-card-section>
        <q-card-section class="tw-p-4">
          <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
            <div v-for="sla in slaItems" :key="sla.label" class="tw-text-center">
              <apexchart type="radialBar" height="180" :options="radialOpts(sla.label, sla.color)" :series="[sla.value]" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Row 3: SPK Mold Progress -->
      <q-card class="tw-rounded-2xl tw-shadow-md tw-overflow-hidden">
        <q-card-section class="tw-bg-orange-600 tw-py-3 tw-px-4">
          <div class="tw-text-white tw-font-bold tw-text-sm">Mold Repair — Progress SPK</div>
        </q-card-section>
        <q-card-section class="tw-p-4">
          <q-table
            :rows="spkMold"
            :columns="spkMoldColumns"
            row-key="id_spk"
            flat dense
            :loading="moldLoading"
            :filter="moldFilter"
            :rows-per-page-options="[]"
            :pagination="moldPagination"
            @update:pagination="onMoldPaginationUpdate"
            @request="onMoldRequest"
            binary-state-sort
            class="tw-rounded-xl tw-overflow-hidden"
          >
            <template v-slot:top-left>
              <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
                <q-icon name="view_headline" color="orange-6" size="20px">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
                </q-icon>
                <q-select
                  borderless
                  dense
                  v-model="moldPagination.rowsPerPage"
                  :options="[10, 25, 50, 100]"
                  @update:modelValue="onMoldRequest({ pagination: moldPagination })"
                  class="tw-min-w-[80px]"
                />
              </div>
            </template>
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="moldFilter"
                placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="orange-6" />
                </template>
              </q-input>
            </template>
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props"
                  class="tw-bg-orange-50 tw-font-bold tw-text-xs tw-uppercase tw-text-orange-700">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body-cell-analyze="props">
              <q-td :props="props" class="text-center">
                <q-badge :color="props.value === '100' ? 'green' : props.value === '-' ? 'grey' : 'orange'"
                  :label="props.value || '-'" />
              </q-td>
            </template>
            <template v-slot:body-cell-drawing="props">
              <q-td :props="props" class="text-center">
                <q-badge :color="props.value === '100' ? 'green' : props.value === '-' ? 'grey' : 'orange'"
                  :label="props.value || '-'" />
              </q-td>
            </template>
            <template v-slot:body-cell-machining="props">
              <q-td :props="props" class="text-center">
                <q-badge :color="props.value === '100' ? 'green' : props.value === '-' ? 'grey' : 'orange'"
                  :label="props.value || '-'" />
              </q-td>
            </template>
            <template v-slot:body-cell-assembly="props">
              <q-td :props="props" class="text-center">
                <q-badge :color="props.value === '100' ? 'green' : props.value === '-' ? 'grey' : 'orange'"
                  :label="props.value || '-'" />
              </q-td>
            </template>
            <template v-slot:body-cell-trial="props">
              <q-td :props="props" class="text-center">
                <q-badge :color="props.value === '100' ? 'green' : props.value === '-' ? 'grey' : 'orange'"
                  :label="props.value || '-'" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Row 4: SPK Monitor Plan vs Actual -->
      <q-card class="tw-rounded-2xl tw-shadow-md tw-overflow-hidden">
        <q-card-section class="tw-bg-teal-600 tw-py-3 tw-px-4">
          <div class="tw-text-white tw-font-bold tw-text-sm">SPK Monitor — Plan vs Actual</div>
        </q-card-section>
        <q-card-section class="tw-p-4">
          <q-table
            :rows="spkMonitor"
            :columns="spkMonitorColumns"
            row-key="id_spk"
            flat dense
            :loading="monitorLoading"
            :filter="monitorFilter"
            :rows-per-page-options="[]"
            :pagination="monitorPagination"
            @update:pagination="onPaginationUpdate"
            @request="onMonitorRequest"
            binary-state-sort
            class="tw-rounded-xl tw-overflow-hidden"
          >
            <template v-slot:top-left>
              <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
                <q-icon name="view_headline" color="teal-6" size="20px">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
                </q-icon>
                <q-select
                  borderless
                  dense
                  v-model="monitorPagination.rowsPerPage"
                  :options="[10, 25, 50, 100]"
                  @update:modelValue="onMonitorRequest({ pagination: monitorPagination })"
                  class="tw-min-w-[80px]"
                />
              </div>
            </template>
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="monitorFilter"
                placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="teal-6" />
                </template>
              </q-input>
            </template>
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props"
                  class="tw-bg-teal-50 tw-font-bold tw-text-xs tw-uppercase tw-text-teal-700">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body-cell-act_finish="props">
              <q-td :props="props" class="text-center">
                <span :class="isLate(props.row) ? 'tw-text-red-600 tw-font-semibold' : ''">
                  {{ formatDate(props.value) }}
                </span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { domain, spinnerBall } from "../../utils";
import { Loading } from "quasar";
import dayjs from "dayjs";

const loading = ref(true);
const moldLoading = ref(false);
const moldFilter = ref("");
const monitorLoading = ref(false);
const monitorFilter = ref("");

const data = ref({
  moldRepair: { closedMonth: 0, targetMonth: 0, closedYear: 0, targetYear: 0 },
  general:    { closedMonth: 0, targetMonth: 0, closedYear: 0, targetYear: 0 },
  sla:        { design: 0, trial: 0, machining: 0, assembly: 0 },
});
const spkMold = ref([]);
const moldPagination = ref({
  sortBy: "id_spk",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const spkMonitor = ref([]);
const monitorPagination = ref({
  sortBy: "id_spk",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// ─── Computed percentages ─────────────────────────────────────────────────────
const pct = (closed, target) => target > 0 ? Math.round((closed / target) * 100) : 0;

const moldRepairMonthPct = computed(() => pct(data.value.moldRepair.closedMonth, data.value.moldRepair.targetMonth));
const moldRepairYearPct  = computed(() => pct(data.value.moldRepair.closedYear,  data.value.moldRepair.targetYear));
const generalMonthPct    = computed(() => pct(data.value.general.closedMonth,    data.value.general.targetMonth));
const generalYearPct     = computed(() => pct(data.value.general.closedYear,     data.value.general.targetYear));

const slaItems = computed(() => [
  { label: "Design",    value: data.value.sla.design,    color: "#8b5cf6" },
  { label: "Machining", value: data.value.sla.machining,  color: "#f59e0b" },
  { label: "Assembly",  value: data.value.sla.assembly,   color: "#06b6d4" },
  { label: "Trial",     value: data.value.sla.trial,      color: "#ef4444" },
]);

// ─── Chart options ────────────────────────────────────────────────────────────
const radialOpts = (label, color = "#3b82f6") => ({
  chart: { type: "radialBar", sparkline: { enabled: true } },
  plotOptions: {
    radialBar: {
      hollow: { size: "55%" },
      dataLabels: {
        name: { show: true, fontSize: "11px", offsetY: 20 },
        value: { show: true, fontSize: "18px", fontWeight: "bold", offsetY: -10,
          formatter: (v) => `${v}%` },
      },
    },
  },
  colors: [color],
  labels: [label],
});

// ─── Table columns ────────────────────────────────────────────────────────────
const spkMoldColumns = [
  { name: "id_spk",    label: "No SPK",   field: "id_spk",    align: "left",   sortable: true },
  { name: "analyze",   label: "Analisa",  field: "analyze",   align: "center" },
  { name: "drawing",   label: "Drawing",  field: "drawing",   align: "center" },
  { name: "machining", label: "Machining",field: "machining", align: "center" },
  { name: "assembly",  label: "Assembly", field: "assembly",  align: "center" },
  { name: "trial",     label: "Trial",    field: "trial",     align: "center" },
];

const spkMonitorColumns = [
  { name: "id_spk",      label: "No SPK",     field: "id_spk",      align: "left",   sortable: true },
  { name: "opt_name",    label: "PIC",         field: "opt_name",    align: "left",   sortable: true },
  { name: "section",     label: "Section",     field: "section",     align: "center", sortable: true },
  { name: "plan_start",  label: "Plan Start",  field: "plan_start",  align: "center",
    format: (v) => formatDate(v) },
  { name: "plan_finish", label: "Plan Finish", field: "plan_finish", align: "center",
    format: (v) => formatDate(v) },
  { name: "act_start",   label: "Actual Start",field: "act_start",   align: "center",
    format: (v) => formatDate(v) },
  { name: "act_finish",  label: "Actual Finish",field: "act_finish", align: "center" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (v) => v ? dayjs(v).format("DD-MM-YYYY") : "-";

const isLate = (row) => {
  if (!row.act_finish || !row.plan_finish) return false;
  return dayjs(row.act_finish).isAfter(dayjs(row.plan_finish));
};

// ─── Fetch ────────────────────────────────────────────────────────────────────
const loadData = async () => {
  loading.value = true;
  try {
    const perfRes = await axios.get(`${import.meta.env.VITE_API}wjs/dashboard/performance`);
    data.value = perfRes.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// ─── SPK Mold remote pagination ──────────────────────────────────────────────
const loadSpkMold = async () => {
  moldLoading.value = true;
  try {
    const p = moldPagination.value;
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/dashboard/spk-mold`, {
      params: {
        page: p.page,
        rowsPerPage: p.rowsPerPage,
        sortBy: p.sortBy,
        descending: p.descending,
        filter: moldFilter.value || undefined,
      },
    });
    spkMold.value = res.data.data ?? [];
    moldPagination.value.rowsNumber = res.data.pagination?.total ?? 0;
  } catch (e) {
    console.error(e);
  } finally {
    moldLoading.value = false;
  }
};

const onMoldRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  moldPagination.value.page = page;
  moldPagination.value.rowsPerPage = rowsPerPage;
  moldPagination.value.sortBy = sortBy;
  moldPagination.value.descending = descending;
  loadSpkMold();
};

const onMoldPaginationUpdate = (newPag) => {
  moldPagination.value = { ...moldPagination.value, ...newPag };
};

// ─── SPK Monitor remote pagination ───────────────────────────────────────────
const loadSpkMonitor = async () => {
  monitorLoading.value = true;
  try {
    const p = monitorPagination.value;
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/dashboard/spk-monitor`, {
      params: {
        page: p.page,
        rowsPerPage: p.rowsPerPage,
        sortBy: p.sortBy,
        descending: p.descending,
        filter: monitorFilter.value || undefined,
      },
    });
    spkMonitor.value = res.data.data ?? [];
    monitorPagination.value.rowsNumber = res.data.pagination?.total ?? 0;
  } catch (e) {
    console.error(e);
  } finally {
    monitorLoading.value = false;
  }
};

const onMonitorRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  monitorPagination.value.page = page;
  monitorPagination.value.rowsPerPage = rowsPerPage;
  monitorPagination.value.sortBy = sortBy;
  monitorPagination.value.descending = descending;
  loadSpkMonitor();
};

const onPaginationUpdate = (newPag) => {
  monitorPagination.value = { ...monitorPagination.value, ...newPag };
};

onMounted(async () => {
  await loadData();
  await Promise.all([loadSpkMold(), loadSpkMonitor()]);
});
</script>
