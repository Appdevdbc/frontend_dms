<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="schedule" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Waktu Istirahat</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Waktu Istirahat</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listBreakTimes"
          :columns="columns"
          row-key="break_id"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="pagination.filter"
          @request="onRequest"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
          hide-pagination
        >
          <template v-slot:header="props">
            <q-tr :props="props">
                <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="[
                      `bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`,
                      col.name === 'aksi' ? 'sticky-column-left-header' : ''
                    ]"
                >
                        {{ col.label }}
                </q-th>
            </q-tr>
          </template>
          
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
          
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3 sticky-column-left">
              <div class="tw-flex tw-gap-2">
                <q-btn
                  round
                  dense
                  color="blue-6"
                  icon="edit"
                  size="sm"
                  @click="openEditDialog(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Edit Dialog -->
    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="schedule" size="32px"/>
            Edit Waktu Istirahat
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.break_todays"
                outlined
                label="Hari"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6"/>
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="form.break_start"
                outlined
                label="Jam Mulai"
                type="time"
                :rules="[val => !!val || 'Start time is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="green-6"/>
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="form.break_end"
                outlined
                label="Jam Akhir"
                type="time"
                :rules="[val => !!val || 'End time is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="red-6"/>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200"/>
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Cancel"
            color="red-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Save"
            :color="`${domain()}`"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="saveData"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import { domain, empid, spinnerBall } from "./../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const $q = useQuasar();
const { success, error } = useNotify();

const columns = [
  {
    name: "aksi",
    required: true,
    label: "Action",
    align: "left",
    field: "aksi",
    classes: 'sticky-column-left',
    headerClasses: 'sticky-column-left-header'
  },
  {
    name: "break_todays",
    align: "left",
    label: "Hari",
    field: "break_todays",
    sortable: false,
  },
  {
    name: "break_start",
    align: "center",
    label: "Jam Mulai",
    field: "break_start",
    sortable: false,
  },
  {
    name: "break_end",
    align: "center",
    label: "Jam Akhir",
    field: "break_end",
    sortable: false,
  },
];

const listBreakTimes = ref([]);
const loading = ref(false);
const dialogForm = ref(false);

const pagination = ref({
  sortBy: "break_id",
  descending: false,
  page: 1,
  rowsPerPage: 7, // Fixed 7 days
  rowsNumber: 7,
  filter: null,
});

const form = reactive({
  break_id: null,
  break_todays: null,
  break_start: null,
  break_end: null,
});

const getData = async () => {
  try {
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}listBreakTimes`, {
      params: pagination.value,
    });
    
    if (typeof res.data.data === "undefined") {
      listBreakTimes.value = res.data;
    } else {
      listBreakTimes.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const openEditDialog = (row) => {
  form.break_id = row.break_id;
  form.break_todays = row.break_todays;
  form.break_start = row.break_start;
  form.break_end = row.break_end;
  dialogForm.value = true;
};

const saveData = async () => {
  if (!form.break_start || !form.break_end) {
    error('Start time and end time are required');
    return;
  }
  
  try {
    spinnerBall();
    
    const payload = {
      break_id: form.break_id,
      break_start: form.break_start,
      break_end: form.break_end,
      creator: empid(),
    };
    
    await axios.post(`${import.meta.env.VITE_API}updateBreakTime`, payload);
    
    dialogForm.value = false;
    success('Break time updated successfully');
    onRequest({
      pagination: pagination.value,
    });
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to update break time');
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

onMounted(() => {
  onRequest({
    pagination: pagination.value,
  });
});
</script>
