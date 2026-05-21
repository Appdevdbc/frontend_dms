<template>
  <div class="q-pa-md tw-space-y-4">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="qr_code_scanner" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Machining Proses</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Transaksi</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Machining Proses</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Form Scan -->
      <q-card-section class="tw-bg-white">
        <div class="tw-font-bold tw-text-lg tw-mb-4 tw-flex tw-items-center tw-gap-2">
          <q-icon name="swap_horiz" size="24px" :color="`${domain()}`"/>
          Machining Proses
        </div>

        <!-- Alert jika perlu isi last fields -->
        <q-banner v-if="showLastFields" class="bg-red-1 tw-rounded-lg tw-mb-4">
          <template v-slot:avatar>
            <q-icon name="warning" color="red" />
          </template>
          <div class="tw-font-semibold">Mohon dilakukan Postpone / Finish dan input Tipe Proses & Alasan</div>
          <div class="tw-mt-2 tw-space-y-1">
            <div><strong>No. SPK:</strong> {{ lastFieldsInfo.id_spk }}</div>
            <div><strong>PIC:</strong> {{ lastFieldsInfo.opt_name }}</div>
            <div><strong>Job Type:</strong> {{ lastFieldsInfo.nama_job }}</div>
          </div>
        </q-banner>
        
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              outlined
              v-model="form.pic"
              label="ID Card"
              placeholder="ID Card"
              class="tw-rounded-lg"
              :readonly="showLastFields"
            >
              <template v-slot:prepend>
                <q-icon name="badge" :color="`${domain()}`"/>
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-6">
            <q-input
              outlined
              v-model="form.id_mesin"
              label="ID Machine"
              placeholder="ID Machine"
              class="tw-rounded-lg"
              :readonly="showLastFields"
            >
              <template v-slot:prepend>
                <q-icon name="precision_manufacturing" :color="`${domain()}`"/>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              outlined
              v-model="form.id_spk"
              label="No SPK"
              placeholder="No SPK"
              class="tw-rounded-lg"
              :readonly="showLastFields"
            >
              <template v-slot:prepend>
                <q-icon name="qr_code" :color="`${domain()}`"/>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              outlined
              v-model="form.id_job"
              :options="jobTypeOptions"
              label="Job Type"
              emit-value
              map-options
              class="tw-rounded-lg"
              :readonly="showLastFields"
            >
              <template v-slot:prepend>
                <q-icon name="work" :color="`${domain()}`"/>
              </template>
            </q-select>
          </div>
        </div>

        <!-- Conditional Fields untuk Last Type -->
        <div v-if="showLastFields" class="row q-col-gutter-md tw-mt-2">
          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="form.last_type"
              :options="lastTypeOptions"
              label="Tipe Process"
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
            <q-select
              outlined
              v-model="form.last_reason"
              :options="lastReasonOptions"
              label="Alasan"
              emit-value
              map-options
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="comment" :color="`${domain()}`"/>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              outlined
              v-model="form.last_moment"
              :options="lastMomentOptions"
              label="Waktu"
              emit-value
              map-options
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="schedule" :color="`${domain()}`"/>
              </template>
            </q-select>
          </div>
        </div>

        <div class="tw-flex tw-gap-3 tw-mt-4">
          <q-btn
            unelevated
            :color="`${domain()}`"
            label="Start"
            icon="play_circle"
            @click="submitScan('start')"
            :loading="submitting === 'start'"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
          <q-btn
            unelevated
            :color="`${domain()}`"
            label="Postpone"
            icon="pause_circle"
            @click="submitScan('postpone')"
            :loading="submitting === 'postpone'"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
          <q-btn
            unelevated
            :color="`${domain()}`"
            label="Finish"
            icon="check_circle"
            @click="submitScan('finish')"
            :loading="submitting === 'finish'"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
          <q-btn
            v-if="showLastFields"
            flat
            color="grey-7"
            label="Reset"
            icon="refresh"
            @click="resetForm"
            class="tw-font-semibold tw-px-6 tw-rounded-lg"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabel Daftar SPK -->
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden tw-mt-4">
      <q-card-section class="tw-bg-white">
        <div class="tw-font-bold tw-text-lg tw-mb-4 tw-flex tw-items-center tw-gap-2">
          <q-icon name="list" size="24px" :color="`${domain()}`"/>
          Daftar SPK
        </div>

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

          <template v-slot:body-cell-namaMesin="props">
            <q-td :props="props" class="tw-py-3 tw-text-slate-700 tw-text-sm">
              {{ props.row.namaMesin || props.row.nama || props.row.id_mesin || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="tw-py-3">
              <q-badge
                :color="getStatusColor(props.value)"
                :label="props.value"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
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

const rows = ref([]);
const loading = ref(false);
const submitting = ref(null);
const searchText = ref("");
const pagination = ref({
  rowsPerPage: 10
});

const form = ref({
  pic: "",
  id_spk: "",
  id_mesin: "",
  id_job: null,
  last_type: null,
  last_reason: null,
  last_moment: null,
});

const jobTypeOptions = ref([]);
const showLastFields = ref(false);
const lastFieldsInfo = ref({
  id_spk: "",
  opt_name: "",
  nama_job: "",
});

const lastTypeOptions = [
  { label: "Postpone", value: "Postpone" },
  { label: "Finish", value: "Finish" },
];

const lastReasonOptions = [
  { label: "Kendala Sistem", value: "Kendala Sistem" },
  { label: "Lupa Finish", value: "Lupa Finish" },
];

const lastMomentOptions = [
  { label: "Normal (17.00)", value: "Normal" },
  { label: "Lembur (20.30)", value: "Lembur" },
];

const columns = [
  { name: "id_spk", label: "No SPK", field: "id_spk", align: "left", sortable: true },
  { 
    name: "pic_name", 
    label: "PIC", 
    field: (row) => row.nama_pic ? `${row.nama_pic} - ${row.pic}` : row.pic, 
    align: "left", 
    sortable: true 
  },
  { name: "namaMesin", label: "Mesin", field: "namaMesin", align: "left", sortable: true },
  { name: "start", label: "Start", field: "start", align: "center", sortable: true, format: (v) => formatDt(v) },
  { name: "finish", label: "Finish", field: "finish", align: "center", format: (v) => formatDt(v) },
  { name: "jamTotal", label: "Total Hour", field: "jamTotal", align: "center", sortable: true },
  { name: "status", label: "Status", field: "status", align: "center" },
];

const formatDt = (v) => v ? dayjs.utc(v).format("DD-MM-YYYY HH:mm:ss") : "-";

const getStatusColor = (status) => {
  if (status === "tutup") return "green";
  if (status === "proses") return "blue";
  return "grey";
};

const loadList = async () => {
  loading.value = true;
  try {
    // Gunakan range tanggal yang lebih luas seperti di PHP (dari 2023-06-01 sampai hari ini)
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/machining/proses/list`, {
      params: { 
        start: "2023-06-01", 
        end: dayjs().format("YYYY-MM-DD") 
      },
    });
    console.log("Response data:", res.data);
    console.log("First row:", res.data[0]);
    rows.value = Array.isArray(res.data) ? res.data : [];
    console.log("Rows:", rows.value);
  } catch (e) {
    console.error("Error loading data:", e);
    error("Gagal memuat data machining proses");
  } finally {
    loading.value = false;
  }
};

const loadJobTypes = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/orderPart/job-types`);
    const jobs = Array.isArray(res.data) ? res.data : [];
    jobTypeOptions.value = [
      { label: "-- Pilih Job Type --", value: null },
      ...jobs.map(j => ({ label: j.nama_job, value: j.id_job }))
    ];
  } catch (e) {
    error("Gagal memuat data job type");
  }
};

const submitScan = async (action) => {
  if (!form.value.pic || !form.value.id_spk || !form.value.id_mesin || !form.value.id_job) {
    return error("Semua field wajib diisi");
  }

  submitting.value = action;
  try {
    const res = await axios.post(`${import.meta.env.VITE_API}wjs/machining/proses/scan`, {
      ...form.value,
      action,
    });
    
    if (res.data.requiresLastFields) {
      showLastFields.value = true;
      // Get employee and job info for display
      try {
        const empRes = await axios.get(`${import.meta.env.VITE_API}wjs/machining/proses/check-log/${form.value.pic}`);
        const jobRes = jobTypeOptions.value.find(j => j.value === form.value.id_job);
        lastFieldsInfo.value = {
          id_spk: form.value.id_spk,
          opt_name: empRes.data.scan?.nama_pic || form.value.pic,
          nama_job: jobRes?.label || form.value.id_job,
        };
      } catch (e) {
        console.error("Failed to get info", e);
      }
      return error(res.data.message);
    }

    success(res.data.message);
    resetForm();
    await loadList();
  } catch (e) {
    if (e.response?.data?.requiresLastFields) {
      showLastFields.value = true;
      // Get employee and job info for display
      try {
        const empRes = await axios.get(`${import.meta.env.VITE_API}wjs/machining/proses/check-log/${form.value.pic}`);
        const jobRes = jobTypeOptions.value.find(j => j.value === form.value.id_job);
        lastFieldsInfo.value = {
          id_spk: form.value.id_spk,
          opt_name: empRes.data.scan?.nama_pic || form.value.pic,
          nama_job: jobRes?.label || form.value.id_job,
        };
      } catch (err) {
        console.error("Failed to get info", err);
      }
    }
    error(e.response?.data?.message ?? "Gagal melakukan scan");
  } finally {
    submitting.value = null;
  }
};

const resetForm = () => {
  form.value = {
    pic: "",
    id_spk: "",
    id_mesin: "",
    id_job: null,
    last_type: null,
    last_reason: null,
    last_moment: null,
  };
  showLastFields.value = false;
  lastFieldsInfo.value = {
    id_spk: "",
    opt_name: "",
    nama_job: "",
  };
};

onMounted(() => {
  loadList();
  loadJobTypes();
});
</script>
