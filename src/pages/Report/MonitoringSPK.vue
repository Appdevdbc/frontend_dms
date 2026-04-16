<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assessment" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Monitoring SPK</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Report</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Monitoring SPK</span>
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
            <q-input
              outlined
              v-model="filter.spk"
              label="No SPK"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="tag" :color="`${domain()}`"/>
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="filter.dept"
              :options="departmentOptions"
              label="Dept Request"
              emit-value
              map-options
              clearable
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="business" :color="`${domain()}`"/>
              </template>
            </q-select>
          </div>
        </div>
        
        <div class="row q-col-gutter-md tw-mt-2">
          <div class="col-12 col-md-4">
            <q-input
              outlined
              v-model="filter.start"
              label="Tanggal Awal"
              type="date"
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
              v-model="filter.end"
              label="Tanggal Akhir"
              type="date"
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
            @click="searchData"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
          <q-btn
            unelevated
            color="green-7"
            label="Download Excel"
            icon="download"
            @click="downloadExcel"
            :disable="listData.length === 0"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
        </div>
      </q-card-section>
      
      <q-separator />
      
      <!-- Table Section -->
      <q-card-section class="tw-bg-white">
        <div class="tw-overflow-x-auto">
          <q-table
            :rows="listData"
            :columns="columns"
            row-key="no_spk"
            :loading="loading"
            flat
            :rows-per-page-options="[10, 25, 50, 100]"
            class="tw-shadow-md tw-rounded-xl monitoring-spk-table"
          >
            <template v-slot:header="props">
              <!-- First header row with grouped columns -->
              <q-tr>
                <q-th
                  v-for="col in props.cols.filter(c => !c.parentGroup)"
                  :key="col.name"
                  :rowspan="col.rowspan || (col.headerOnly ? 1 : 2)"
                  :colspan="col.colspan || 1"
                  :class="col.groupColor ? `bg-${col.groupColor}` : `bg-${domain()}`"
                  class="tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-3 tw-border-r tw-border-white text-center"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
              <!-- Second header row with Start/Finish -->
              <q-tr>
                <q-th
                  v-for="col in props.cols.filter(c => c.parentGroup)"
                  :key="col.name"
                  :class="col.groupColor ? `bg-${col.groupColor}` : `bg-${domain()}`"
                  class="tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-3 tw-border-r tw-border-white text-center"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td
                  v-for="col in props.cols.filter(c => !c.headerOnly)"
                  :key="col.name"
                  :props="props"
                  class="tw-py-3 tw-text-slate-700 tw-text-xs"
                >
                  {{ col.value }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { domain, spinnerBall } from "./../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../composables/useNotify";
import dayjs from "dayjs";

const $q = useQuasar();
const { success, error } = useNotify();

// Get first and last day of current month
const getMonthRange = () => {
  const now = dayjs();
  return {
    start: now.startOf('month').format('YYYY-MM-DD'),
    end: now.endOf('month').format('YYYY-MM-DD')
  };
};

const monthRange = getMonthRange();

const filter = ref({
  spk: '',
  dept: null,
  start: monthRange.start,
  end: monthRange.end
});

const columns = [
  {
    name: "no_spk",
    required: true,
    label: "No SPK",
    align: "left",
    field: "no_spk",
    sortable: true,
    rowspan: 2,
  },
  {
    name: "tanggal",
    align: "center",
    label: "Tanggal",
    field: "tanggal",
    sortable: true,
    rowspan: 2,
  },
  {
    name: "dept",
    align: "left",
    label: "Dept Request",
    field: "dept",
    sortable: true,
    rowspan: 2,
  },
  {
    name: "duedate",
    align: "center",
    label: "Due Date",
    field: "duedate",
    sortable: true,
    rowspan: 2,
  },
  {
    name: "subject",
    align: "left",
    label: "Subjek",
    field: "subject",
    sortable: true,
    rowspan: 2,
  },
  // Bongkar Analisis group header
  {
    name: "bongkar_group",
    label: "Bongkar Analisis",
    colspan: 2,
    headerOnly: true,
    groupColor: "blue-7",
  },
  {
    name: "bongkar_start",
    align: "center",
    label: "Start",
    field: "bongkar_start",
    parentGroup: "bongkar_group",
    groupColor: "blue-7",
  },
  {
    name: "bongkar_end",
    align: "center",
    label: "Finish",
    field: "bongkar_end",
    parentGroup: "bongkar_group",
    groupColor: "blue-7",
  },
  // Order Part group header
  {
    name: "order_part_group",
    label: "Order Part",
    colspan: 2,
    headerOnly: true,
    groupColor: "green-7",
  },
  {
    name: "order_part_start",
    align: "center",
    label: "Start",
    field: "order_part_start",
    parentGroup: "order_part_group",
    groupColor: "green-7",
  },
  {
    name: "order_part_end",
    align: "center",
    label: "Finish",
    field: "order_part_end",
    parentGroup: "order_part_group",
    groupColor: "green-7",
  },
  // Drawing group header
  {
    name: "drawing_group",
    label: "Drawing",
    colspan: 2,
    headerOnly: true,
    groupColor: "purple-7",
  },
  {
    name: "drawing_start",
    align: "center",
    label: "Start",
    field: "drawing_start",
    parentGroup: "drawing_group",
    groupColor: "purple-7",
  },
  {
    name: "drawing_end",
    align: "center",
    label: "Finish",
    field: "drawing_end",
    parentGroup: "drawing_group",
    groupColor: "purple-7",
  },
  // Machining group header
  {
    name: "machining_group",
    label: "Machining",
    colspan: 2,
    headerOnly: true,
    groupColor: "orange-7",
  },
  {
    name: "machining_start",
    align: "center",
    label: "Start",
    field: "machining_start",
    parentGroup: "machining_group",
    groupColor: "orange-7",
  },
  {
    name: "machining_end",
    align: "center",
    label: "Finish",
    field: "machining_end",
    parentGroup: "machining_group",
    groupColor: "orange-7",
  },
  // Assy group header
  {
    name: "assy_group",
    label: "Assy",
    colspan: 2,
    headerOnly: true,
    groupColor: "teal-7",
  },
  {
    name: "assy_start",
    align: "center",
    label: "Start",
    field: "assy_start",
    parentGroup: "assy_group",
    groupColor: "teal-7",
  },
  {
    name: "assy_end",
    align: "center",
    label: "Finish",
    field: "assy_end",
    parentGroup: "assy_group",
    groupColor: "teal-7",
  },
  // Trial group header
  {
    name: "trial_group",
    label: "Trial",
    colspan: 2,
    headerOnly: true,
    groupColor: "pink-7",
  },
  {
    name: "trial_start",
    align: "center",
    label: "Start",
    field: "trial_start",
    parentGroup: "trial_group",
    groupColor: "pink-7",
  },
  {
    name: "trial_end",
    align: "center",
    label: "Finish",
    field: "trial_end",
    parentGroup: "trial_group",
    groupColor: "pink-7",
  },
];

const listData = ref([]);
const departmentOptions = ref([]);
const loading = ref(false);

const getDepartments = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getDepartmentList`);
    departmentOptions.value = [
      { value: null, label: '-- Pilih Department --' },
      ...res.data.map(dept => ({
        value: dept.value,
        label: `${dept.nama_site} » ${dept.label}`
      }))
    ];
  } catch (err) {
    error('Failed to load departments');
  }
};

const searchData = async () => {
  try {
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}getMonitoringSPK`, {
      params: {
        spk: filter.value.spk,
        dept: filter.value.dept,
        start: filter.value.start,
        end: filter.value.end
      }
    });
    
    listData.value = res.data;
    loading.value = false;
    
    if (res.data.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No data found for the selected criteria',
        position: 'top'
      });
    }
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const downloadExcel = async () => {
  try {
    spinnerBall();
    
    const response = await axios.post(
      `${import.meta.env.VITE_API}exportMonitoringSPK`,
      {
        spk: filter.value.spk,
        dept: filter.value.dept,
        start: filter.value.start,
        end: filter.value.end
      },
      {
        responseType: 'blob'
      }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'laporan_monitoring_spk.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    $q.loading.hide();
    success('Excel file downloaded successfully');
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to download Excel');
  }
};

onMounted(async () => {
  await getDepartments();
  await searchData(); // Load initial data with current month
});
</script>

<style scoped>
.monitoring-spk-table :deep(.q-table__container) {
  min-width: 1800px;
}
</style>
