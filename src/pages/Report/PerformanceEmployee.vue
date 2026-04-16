<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="leaderboard" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Performance Employee</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Report</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Performance Employee</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Filter + Actions -->
      <q-card-section class="tw-bg-slate-50">
        <div class="tw-font-bold tw-text-lg tw-mb-4 tw-flex tw-items-center tw-gap-2">
          <q-icon name="filter_alt" size="24px" :color="`${domain()}`" />
          Filter
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.tahun"
              :options="yearOptions"
              label="Tahun"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" :color="`${domain()}`" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.bulan"
              :options="monthOptions"
              label="Bulan"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="event" :color="`${domain()}`" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.employee"
              :options="employeeOptions"
              label="Employee"
              emit-value
              map-options
              clearable
              use-input
              input-debounce="300"
              @filter="filterEmployee"
            >
              <template v-slot:prepend>
                <q-icon name="person" :color="`${domain()}`" />
              </template>
              <template v-slot:no-option>
                <q-item><q-item-section class="tw-text-slate-400">Tidak ada data</q-item-section></q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="tw-flex tw-gap-3 tw-mt-4">
          <q-btn unelevated :color="`${domain()}`" label="Tampilkan" icon="search"
            :loading="loading" @click="searchData"
            class="tw-font-semibold tw-px-6 tw-rounded-lg" />
          <q-btn unelevated color="positive" label="Simpan" icon="save"
            :loading="saving" :disable="tableData.length === 0"
            @click="saveData"
            class="tw-font-semibold tw-px-6 tw-rounded-lg" />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Table -->
      <q-card-section class="tw-bg-white">

        <div v-if="!hasData && !loading"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400">
          <q-icon name="leaderboard" size="64px" class="tw-mb-3 tw-opacity-30" />
          <div class="tw-text-lg tw-font-semibold">Belum ada data</div>
          <div class="tw-text-sm">Pilih filter dan klik Tampilkan</div>
        </div>

        <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
          <q-spinner-dots :color="`${domain()}`" size="48px" />
        </div>

        <div v-if="hasData && !loading" class="tw-overflow-x-auto">
          <table class="tw-w-full tw-text-xs tw-border-collapse">
            <thead>
              <tr>
                <th class="perf-th">Employee</th>
                <th class="perf-th">Jml SPK</th>
                <th class="perf-th">ADH-SPK</th>
                <th class="perf-th">Efisiensi</th>
                <th class="perf-th">Productivity</th>
                <th class="perf-th">Fault-rate</th>
                <th class="perf-th">SPK Urgent</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in tableData" :key="row.perf_id"
                :class="idx % 2 === 0 ? 'tw-bg-white' : 'tw-bg-slate-50'">
                <td class="perf-td tw-font-semibold">{{ row.opt_name }}</td>
                <td class="perf-td tw-text-center">{{ row.jml_spk }}</td>
                <td class="perf-td">
                  <q-input
                    v-model="row.perf_adhspk"
                    dense outlined
                    class="tw-w-24"
                    input-class="tw-text-center"
                  />
                </td>
                <td class="perf-td">
                  <q-input
                    v-model="row.perf_efisiensi"
                    dense outlined
                    class="tw-w-24"
                    input-class="tw-text-center"
                  />
                </td>
                <td class="perf-td tw-text-center">
                  <span :class="getProductivityClass(row.productivity)">
                    {{ row.productivity }}%
                  </span>
                </td>
                <td class="perf-td">
                  <q-input
                    v-model="row.perf_faultrate"
                    dense outlined
                    class="tw-w-24"
                    input-class="tw-text-center"
                  />
                </td>
                <td class="perf-td tw-text-center">{{ row.spk_urgent }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { domain } from "./../../utils";
import { useNotify } from "./../../composables/useNotify";
import dayjs from "dayjs";

const { success, error } = useNotify();

// ── Filter options ────────────────────────────────────────────────────────────
const currentYear = parseInt(dayjs().format('YYYY'));
const yearOptions = Array.from({ length: currentYear - 2017 }, (_, i) => ({
  value: String(2018 + i), label: String(2018 + i),
})).reverse();

const monthOptions = [
  { value: '1',  label: 'Januari' },
  { value: '2',  label: 'Februari' },
  { value: '3',  label: 'Maret' },
  { value: '4',  label: 'April' },
  { value: '5',  label: 'Mei' },
  { value: '6',  label: 'Juni' },
  { value: '7',  label: 'Juli' },
  { value: '8',  label: 'Agustus' },
  { value: '9',  label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'Nopember' },
  { value: '12', label: 'Desember' },
];

const filter = ref({
  tahun:    dayjs().format('YYYY'),
  bulan:    dayjs().format('M'),
  employee: null,
});

// ── State ─────────────────────────────────────────────────────────────────────
const loading         = ref(false);
const saving          = ref(false);
const tableData       = ref([]);
const employeeOptions = ref([]);
const allEmployees    = ref([]);

const hasData = computed(() => tableData.value.length > 0);

// ── Employee filter ───────────────────────────────────────────────────────────
const filterEmployee = (val, update) => {
  update(() => {
    if (!val) {
      employeeOptions.value = allEmployees.value;
    } else {
      const needle = val.toLowerCase();
      employeeOptions.value = allEmployees.value.filter(e =>
        e.label.toLowerCase().includes(needle)
      );
    }
  });
};

// ── Productivity color ────────────────────────────────────────────────────────
const getProductivityClass = (val) => {
  const v = parseFloat(val) || 0;
  if (v >= 85) return 'tw-text-green-600 tw-font-bold';
  if (v >= 70) return 'tw-text-amber-600 tw-font-bold';
  return 'tw-text-red-600 tw-font-bold';
};

// ── Load employees ────────────────────────────────────────────────────────────
const loadEmployees = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getEmployeeListPerf`);
    allEmployees.value    = res.data;
    employeeOptions.value = res.data;
  } catch (err) {
    error('Gagal memuat daftar employee');
  }
};

// ── Search ────────────────────────────────────────────────────────────────────
const searchData = async () => {
  try {
    loading.value   = true;
    tableData.value = [];

    const res = await axios.get(`${import.meta.env.VITE_API}getPerformanceEmployee`, {
      params: {
        tahun:    filter.value.tahun,
        bulan:    filter.value.bulan,
        employee: filter.value.employee || '',
      },
    });

    // Calculate productivity for each row
    // PHP: productivity = (totalJam / tjkn) * 100
    // `total` from tbl_produktivitas_section is already the productivity %
    tableData.value = res.data.map(row => ({
      ...row,
      productivity: row.total != null ? parseFloat(row.total).toFixed(2) : '-',
    }));
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

// ── Save ──────────────────────────────────────────────────────────────────────
const saveData = async () => {
  try {
    saving.value = true;

    await axios.post(`${import.meta.env.VITE_API}savePerformanceEmployee`, {
      tahun:    filter.value.tahun,
      bulan:    filter.value.bulan,
      employee: filter.value.employee || '',
      rows: tableData.value.map(row => ({
        perf_id:        row.perf_id,
        perf_adhspk:    row.perf_adhspk,
        perf_efisiensi: row.perf_efisiensi,
        perf_faultrate: row.perf_faultrate,
      })),
    });

    success('Data berhasil disimpan');
  } catch (err) {
    error(err?.response?.data?.message || 'Gagal menyimpan data');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await loadEmployees();
});
</script>

<style scoped>
.perf-th {
  background-color: #1e40af;
  color: white;
  font-weight: 700;
  padding: 10px 12px;
  border: 1px solid #1e3a8a;
  text-align: center;
  white-space: nowrap;
}
.perf-td {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  vertical-align: middle;
}
</style>
