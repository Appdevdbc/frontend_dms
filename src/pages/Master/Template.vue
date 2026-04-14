<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="view_list" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Template Master</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Template</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="listTemplates"
          :columns="columns"
          row-key="id_template"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
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
                unelevated
                :color="`${domain()}`"
                label="Add Template"
                icon="add"
                @click="openAddDialog"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" :color="`${domain()}`" />
                </template>
              </q-input>
            </div>
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
                
                <q-btn
                  round
                  dense
                  color="red-6"
                  icon="delete"
                  size="sm"
                  @click="deleteData(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-4xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="view_list" size="32px"/>
            {{ isEdit ? 'Edit' : 'Add' }} Template
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.id_plate"
                :options="listParts"
                option-value="id_part"
                option-label="nama_part"
                emit-value
                map-options
                outlined
                label="Part"
                :rules="[val => !!val || 'Part is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory_2" color="blue-6"/>
                </template>
              </q-select>
            </div>
            
            <div class="col-6">
              <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">Available Processes</div>
              <q-list bordered class="tw-rounded-lg tw-max-h-[400px] tw-overflow-auto">
                <q-item 
                  v-for="proses in availableProses" 
                  :key="proses.id_proses"
                  clickable
                  @click="addProses(proses)"
                  class="hover:tw-bg-blue-50"
                >
                  <q-item-section avatar>
                    <q-icon name="add_circle" color="green-6"/>
                  </q-item-section>
                  <q-item-section>{{ proses.nama }}</q-item-section>
                </q-item>
                <q-item v-if="availableProses.length === 0">
                  <q-item-section class="tw-text-center tw-text-slate-500">
                    No available processes
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div class="col-6">
              <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">Selected Processes (Click arrows to reorder)</div>
              <q-list bordered class="tw-rounded-lg tw-max-h-[400px] tw-overflow-auto">
                <q-item 
                  v-for="(proses, index) in selectedProses" 
                  :key="proses.id_proses"
                >
                  <q-item-section avatar>
                    <div class="tw-flex tw-flex-col tw-gap-1">
                      <q-btn
                        round
                        dense
                        flat
                        size="xs"
                        color="blue-6"
                        icon="arrow_upward"
                        @click="moveUp(index)"
                        :disable="index === 0"
                      />
                      <q-btn
                        round
                        dense
                        flat
                        size="xs"
                        color="blue-6"
                        icon="arrow_downward"
                        @click="moveDown(index)"
                        :disable="index === selectedProses.length - 1"
                      />
                    </div>
                  </q-item-section>
                  <q-item-section>
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <q-badge :color="`${domain()}`" :label="index + 1" />
                      <span>{{ proses.nama }}</span>
                    </div>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      round
                      dense
                      flat
                      color="red-6"
                      icon="remove_circle"
                      @click="removeProses(index)"
                    />
                  </q-item-section>
                </q-item>
                <q-item v-if="selectedProses.length === 0">
                  <q-item-section class="tw-text-center tw-text-slate-500">
                    No processes selected
                  </q-item-section>
                </q-item>
              </q-list>
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
import { ref, onMounted, reactive, watch } from "vue";
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
    name: "nama_part",
    align: "left",
    label: "Part",
    field: "nama_part",
    sortable: true,
  },
  {
    name: "urutan_proses",
    align: "left",
    label: "Process Order",
    field: "urutan_proses",
    sortable: false,
  },
];

const listTemplates = ref([]);
const listParts = ref([]);
const availableProses = ref([]);
const selectedProses = ref([]);
const loading = ref(false);
const dialogForm = ref(false);
const isEdit = ref(false);

const pagination = ref({
  sortBy: "id_template",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const form = reactive({
  id_template: null,
  id_plate: null,
  proses: null,
});

const getData = async () => {
  try {
    loading.value = true;
    
    const res = await axios.get(`${import.meta.env.VITE_API}listTemplates`, {
      params: pagination.value,
    });
    
    if (typeof res.data.data === "undefined") {
      listTemplates.value = res.data;
    } else {
      listTemplates.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || 'Failed to load data');
  }
};

const getParts = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getTemplateParts`);
    listParts.value = res.data;
  } catch (err) {
    error('Failed to load parts');
  }
};

const loadAvailableProses = async () => {
  try {
    const excludeIds = selectedProses.value.map(p => p.id_proses).join(',');
    const res = await axios.get(`${import.meta.env.VITE_API}getTemplateMachiningProses`, {
      params: { excludeIds }
    });
    availableProses.value = res.data;
  } catch (err) {
    error('Failed to load machining processes');
  }
};

const addProses = (proses) => {
  selectedProses.value.push(proses);
  loadAvailableProses();
};

const removeProses = (index) => {
  selectedProses.value.splice(index, 1);
  loadAvailableProses();
};

const moveUp = (index) => {
  if (index > 0) {
    const temp = selectedProses.value[index];
    selectedProses.value[index] = selectedProses.value[index - 1];
    selectedProses.value[index - 1] = temp;
  }
};

const moveDown = (index) => {
  if (index < selectedProses.value.length - 1) {
    const temp = selectedProses.value[index];
    selectedProses.value[index] = selectedProses.value[index + 1];
    selectedProses.value[index + 1] = temp;
  }
};

const openAddDialog = async () => {
  isEdit.value = false;
  resetForm();
  await getParts();
  selectedProses.value = [];
  await loadAvailableProses();
  dialogForm.value = true;
};

const openEditDialog = async (row) => {
  isEdit.value = true;
  form.id_template = row.id_template;
  form.id_plate = row.id_plate;
  form.proses = row.proses;
  
  await getParts();
  
  // Load selected processes
  if (row.proses) {
    const prosesIds = row.proses.split(',').filter(id => id && id !== '0');
    if (prosesIds.length > 0) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API}getTemplateMachiningProses`, {
          params: { excludeIds: '' }
        });
        const allProses = res.data;
        selectedProses.value = prosesIds.map(id => {
          return allProses.find(p => p.id_proses.toString() === id);
        }).filter(p => p);
      } catch (err) {
        error('Failed to load processes');
      }
    }
  }
  
  await loadAvailableProses();
  dialogForm.value = true;
};

const saveData = async () => {
  if (!form.id_plate) {
    error('Part is required');
    return;
  }
  
  if (selectedProses.value.length === 0) {
    error('At least one process must be selected');
    return;
  }
  
  try {
    spinnerBall();
    
    const prosesString = selectedProses.value.map(p => p.id_proses).join(',');
    
    const payload = {
      id_template: form.id_template,
      id_plate: form.id_plate,
      proses: prosesString,
      creator: empid(),
    };
    
    await axios.post(`${import.meta.env.VITE_API}saveTemplate`, payload);
    
    dialogForm.value = false;
    success(isEdit.value ? 'Template updated successfully' : 'Template added successfully');
    onRequest({
      pagination: pagination.value,
    });
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error(err?.response?.data?.message || 'Failed to save template');
  }
};

const deleteData = async (row) => {
  $q.dialog({
    title: "Confirm Delete",
    message: `Are you sure you want to delete this template?`,
    html: true,
    class: `side-${domain()} tw-rounded-2xl`,
    ok: {
      push: true,
      color: "red-7",
      label: "Delete",
      icon: "delete",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'grey-7',
      label: "Cancel",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall();
      await axios.post(`${import.meta.env.VITE_API}deleteTemplate`, {
        id_template: row.id_template_encrypted,
        creator: empid(),
      });
      success('Template deleted successfully');
      onRequest({
        pagination: pagination.value,
      });
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      error(err?.response?.data?.message || 'Failed to delete template');
    }
  });
};

const resetForm = () => {
  form.id_template = null;
  form.id_plate = null;
  form.proses = null;
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

onMounted(() => {
  onRequest({
    pagination: pagination.value,
  });
});
</script>
