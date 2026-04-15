<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="task_alt" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">SPK Proses</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>SPK</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Proses</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listSPK"
          :columns="columns"
          row-key="id_spk"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 100]"
          :loading="loading"
          :filter="pagination.filter"
          @request="onRequest"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
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
                :style="col.name === 'aksi' ? 'min-width: 220px;' : ''"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          
          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px">
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
              </q-icon>
              <q-select
                borderless
                dense
                v-model="pagination.rowsPerPage"
                :options="[10,25,50,100]"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>
          
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn
                v-if="listSPK.length > 0"
                outline
                :color="`${domain()}`"
                :label="isAllSelected ? 'Deselect All' : 'Select All'"
                :icon="isAllSelected ? 'check_box_outline_blank' : 'check_box'"
                @click="toggleSelectAll(!isAllSelected)"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-btn
                v-if="selected.length > 0"
                unelevated
                color="red-7"
                :label="`Tutup (${selected.length})`"
                icon="close"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
                @click="closeMultipleSPK"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search SPK..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>
          
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="aksi" class="tw-py-3 sticky-column-left" style="min-width: 220px;">
                <div class="tw-flex tw-items-center tw-gap-3">
                  <q-checkbox 
                    :model-value="isSelected(props.row)" 
                    @update:model-value="toggleSelection(props.row)"
                    dense 
                    color="blue-6" 
                  />
                  <div class="tw-flex tw-gap-2">
                    <q-btn
                      round
                      dense
                      color="blue-6"
                      icon="info"
                      size="sm"
                      @click="showDetail(props.row)"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Detail Status</q-tooltip>
                    </q-btn>
                    <q-btn
                      round
                      dense
                      color="orange-6"
                      icon="edit_calendar"
                      size="sm"
                      @click="editTarget(props.row)"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit Target</q-tooltip>
                    </q-btn>
                    <q-btn
                      round
                      dense
                      color="red-7"
                      icon="close"
                      size="sm"
                      @click="closeSingleSPK(props.row)"
                      class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    >
                      <q-tooltip class="tw-bg-slate-800 tw-text-xs">Tutup</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-td>
              <q-td
                v-for="col in props.cols.filter(c => c.name !== 'aksi')"
                :key="col.name"
                :props="props"
                :class="col.name === 'subject' ? 'tw-py-4 tw-text-slate-700' : 'tw-py-4 tw-text-slate-700'"
                :style="col.name === 'subject' ? 'max-width: 300px; width: 300px;' : ''"
              >
                <span v-if="col.name === 'process_status'">
                  <q-badge
                    :color="col.value === 'Open' ? 'blue-6' : col.value === 'Progress' ? 'orange-6' : 'green-6'"
                    :label="col.value"
                    class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"
                  />
                </span>
                <div v-else-if="col.name === 'subject'" class="tw-w-full">
                  <div 
                    :class="props.row.showFullSubject ? 'tw-whitespace-normal tw-break-words' : 'tw-line-clamp-2'"
                    class="tw-text-sm"
                  >
                    {{ col.value }}
                  </div>
                  <q-btn
                    v-if="col.value && col.value.length > 80"
                    flat
                    dense
                    size="xs"
                    :color="`${domain()}`"
                    :label="props.row.showFullSubject ? 'Show Less' : 'Show More'"
                    @click="props.row.showFullSubject = !props.row.showFullSubject"
                    class="tw-mt-1 tw-text-xs tw-font-semibold tw-underline hover:tw-no-underline tw-transition-all"
                  />
                </div>
                <span v-else>{{ col.value }}</span>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Detail Status Dialog -->
    <q-dialog v-model="dialogDetail" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-4xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="info" size="32px"/>
            Informasi Proses - {{ currentSPK }}
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <q-table
            :rows="detailData"
            :columns="detailColumns"
            row-key="id"
            :loading="loadingDetail"
            flat
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.finish ? 'green' : props.row.postpone ? 'orange' : 'blue'"
                  :label="props.row.finish ? 'Selesai' : props.row.postpone ? 'Postpone' : 'Proses'"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
        <q-separator class="tw-bg-slate-200"/>
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Close"
            color="blue-6"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Target Dialog -->
    <q-dialog v-model="dialogEditTarget" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-md tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit_calendar" size="32px"/>
            Edit Target Selesai
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="tw-space-y-4">
            <q-input
              v-model="editForm.id_spk"
              outlined
              label="No SPK"
              readonly
              class="tw-rounded-lg tw-bg-slate-50"
            >
              <template v-slot:prepend>
                <q-icon name="tag" color="blue-6"/>
              </template>
            </q-input>
            
            <q-input
              v-model="editForm.target_selesai"
              outlined
              label="Target Selesai"
              type="date"
              :rules="[val => !!val || 'Target selesai is required']"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="blue-6"/>
              </template>
            </q-input>
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
            @click="saveEditTarget"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
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
    headerClasses: 'sticky-column-left-header',
    style: 'min-width: 200px; width: 200px;'
  },
  {
    name: "id_spk",
    align: "left",
    label: "No SPK",
    field: "id_spk",
    sortable: true,
  },
  {
    name: "tanggal",
    align: "center",
    label: "Tanggal",
    field: "tanggal",
    sortable: true,
  },
  {
    name: "dept_name",
    align: "left",
    label: "Dept Request",
    field: "dept_name",
    sortable: true,
  },
  {
    name: "tipe",
    align: "center",
    label: "Tipe SPK",
    field: "tipe",
    sortable: true,
  },
  {
    name: "target_selesai",
    align: "center",
    label: "Target Selesai",
    field: "target_selesai",
    sortable: true,
  },
  {
    name: "subject",
    align: "left",
    label: "Subjek",
    field: "subject",
    sortable: true,
    style: 'max-width: 300px; width: 300px;',
    headerStyle: 'max-width: 300px; width: 300px;'
  },
  {
    name: "process_status",
    align: "center",
    label: "Status",
    field: "process_status",
    sortable: true,
  },
];

const detailColumns = [
  {
    name: "pic",
    align: "left",
    label: "PIC",
    field: "pic",
  },
  {
    name: "mesin",
    align: "left",
    label: "Mesin",
    field: "mesin",
  },
  {
    name: "total_jam",
    align: "center",
    label: "Total Proses (Jam)",
    field: "total_jam",
  },
  {
    name: "status",
    align: "center",
    label: "Status",
    field: "status",
  },
];

const listSPK = ref([]);
const selected = ref([]);
const loading = ref(false);
const dialogDetail = ref(false);
const dialogEditTarget = ref(false);
const detailData = ref([]);
const loadingDetail = ref(false);
const currentSPK = ref('');

const pagination = ref({
  sortBy: "id_spk",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
  filter: null,
});

const editForm = reactive({
  id_spk: null,
  target_selesai: null,
});

const getData = async () => {
  try {
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}listSPKProses`, {
      params: pagination.value,
    });
    
    if (typeof res.data.data === "undefined") {
      listSPK.value = res.data.map(item => ({ ...item, showFullSubject: false }));
    } else {
      listSPK.value = res.data.data.map(item => ({ ...item, showFullSubject: false }));
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const showDetail = async (row) => {
  try {
    loadingDetail.value = true;
    currentSPK.value = row.id_spk;
    dialogDetail.value = true;
    
    const res = await axios.post(`${import.meta.env.VITE_API}getSPKDetailStatus`, {
      id_spk: row.id_spk
    });
    
    detailData.value = res.data;
    loadingDetail.value = false;
  } catch (err) {
    loadingDetail.value = false;
    error(err?.response?.data?.message || 'Failed to load detail');
  }
};

const editTarget = (row) => {
  editForm.id_spk = row.id_spk;
  // Convert DD/MM/YYYY back to YYYY-MM-DD for date input
  if (row.target_selesai) {
    const parts = row.target_selesai.split('/');
    if (parts.length === 3) {
      editForm.target_selesai = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
      editForm.target_selesai = row.target_selesai;
    }
  }
  dialogEditTarget.value = true;
};

const saveEditTarget = async () => {
  if (!editForm.target_selesai) {
    error('Target selesai is required');
    return;
  }
  
  try {
    spinnerBall();
    
    await axios.post(`${import.meta.env.VITE_API}editTargetSelesai`, {
      id_spk: editForm.id_spk,
      target_selesai: editForm.target_selesai,
      creator: empid(),
    });
    
    dialogEditTarget.value = false;
    success('Target selesai updated successfully');
    onRequest({
      pagination: pagination.value,
    });
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to update target selesai');
  }
};

const closeSingleSPK = (row) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda yakin akan menutup SPK <span class="text-bold">${row.id_spk}</span>?`,
    html: true,
    class:`side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color:"red-7",
      label: "Ya, Tutup",
      icon: "close",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'blue-6',
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.post(`${import.meta.env.VITE_API}closeSPK`, {
        id_spk: row.id_spk,
        creator: empid()
      });
      success('SPK closed successfully');
      onRequest({
        pagination: pagination.value,
      });
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to close SPK');
    }
  });
};

const closeMultipleSPK = () => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda yakin akan menutup <span class="text-bold">${selected.value.length}</span> SPK yang dipilih?`,
    html: true,
    class:`side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color:"red-7",
      label: "Ya, Tutup",
      icon: "close",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'blue-6',
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      
      for (const spk of selected.value) {
        await axios.post(`${import.meta.env.VITE_API}closeSPK`, {
          id_spk: spk.id_spk,
          creator: empid()
        });
      }
      
      selected.value = [];
      success('SPK closed successfully');
      onRequest({
        pagination: pagination.value,
      });
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to close SPK');
    }
  });
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

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const isSelected = (row) => {
  return selected.value.some(item => item.id_spk === row.id_spk);
};

const toggleSelection = (row) => {
  const index = selected.value.findIndex(item => item.id_spk === row.id_spk);
  if (index > -1) {
    selected.value.splice(index, 1);
  } else {
    selected.value.push(row);
  }
};

const isAllSelected = computed(() => {
  return listSPK.value.length > 0 && selected.value.length === listSPK.value.length;
});

const toggleSelectAll = (value) => {
  if (value) {
    selected.value = [...listSPK.value];
  } else {
    selected.value = [];
  }
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
  });
});
</script>
