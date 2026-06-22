<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-lg tw-rounded-lg tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-py-4" style="background-color: #1e3a4c">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="list_alt" size="24px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-semibold tw-mb-1">List Request Data</div>
            <div class="tw-flex tw-items-center tw-gap-1 tw-text-white tw-text-xs tw-opacity-90">
              <q-icon name="home" size="12px"/>
              <q-icon name="chevron_right" size="12px"/>
              <span>Transaction</span>
              <q-icon name="chevron_right" size="12px"/>
              <span>List Request</span>
            </div>
          </div>
        </div>
      </q-card-section>
      
      <q-separator />
      
      <!-- Filter Section -->
      <q-card-section class="tw-bg-slate-50">
        <div class="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-sm tw-mb-4">
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
            <q-select
              v-model="filters.bu_id"
              :options="buOptions"
              option-value="bu_id"
              option-label="bu_name"
              emit-value
              map-options
              outlined
              dense
              label="Business Unit"
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="blue-6" size="20px"/>
              </template>
            </q-select>
            
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              outlined
              dense
              label="Status"
              clearable
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="filter_list" color="blue-6" size="20px"/>
              </template>
            </q-select>
            
            <q-btn
              unelevated
              color="teal-6"
              label="Input New Request"
              icon="add"
              @click="goToInput"
              class="tw-font-semibold"
            />
          </div>
        </div>
        
        <!-- Table -->
        <q-table
          :rows="requests"
          :columns="columns"
          row-key="temuan_id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          flat
          bordered
          class="tw-shadow-sm"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="tw-font-semibold tw-text-white"
                style="background-color: #1e3a4c"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="temuan_id" :props="props">
                <a
                  @click="viewDetail(props.row.temuan_id)"
                  class="tw-text-teal-600 tw-cursor-pointer hover:tw-underline"
                >
                  {{ props.row.temuan_id }}
                </a>
              </q-td>
              <q-td key="temuan_judul" :props="props">
                {{ props.row.temuan_judul }}
              </q-td>
              <q-td key="bu_name" :props="props">
                {{ props.row.bu_name }}
              </q-td>
              <q-td key="div_nama" :props="props">
                {{ props.row.div_nama }}
              </q-td>
              <q-td key="periode" :props="props">
                {{ formatDate(props.row.temuan_tglawal) }} - {{ formatDate(props.row.temuan_tglakhir) }}
              </q-td>
              <q-td key="total" :props="props" class="tw-text-center">
                {{ props.row.total }}
              </q-td>
              <q-td key="outstanding" :props="props" class="tw-text-center">
                <q-badge :color="props.row.outstanding > 0 ? 'orange-5' : 'grey-5'">
                  {{ props.row.outstanding }}
                </q-badge>
              </q-td>
              <q-td key="closed" :props="props" class="tw-text-center">
                <q-badge color="green-5">
                  {{ props.row.closed }}
                </q-badge>
              </q-td>
              <q-td key="temuan_datecreated" :props="props">
                {{ formatDateTime(props.row.temuan_datecreated) }}
              </q-td>
            </q-tr>
          </template>
          
          <template v-slot:no-data>
            <div class="tw-text-center tw-py-8">
              <q-icon name="inbox" size="48px" class="tw-text-slate-400 tw-mb-2"/>
              <p class="tw-text-slate-500">No requests found</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotify } from '../../composables/useNotify';
import { useAuthStore } from '../../stores/auth';
import dayjs from 'dayjs';

const router = useRouter();
const { error } = useNotify();
const authStore = useAuthStore();

const loading = ref(false);
const requests = ref([]);
const buOptions = ref([]);

const filters = reactive({
  bu_id: '',
  status: null
});

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Open', value: '0' },
  { label: 'Closed', value: '1' }
];

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  {
    name: 'temuan_id',
    label: 'Request ID',
    field: 'temuan_id',
    align: 'left',
    sortable: true
  },
  {
    name: 'temuan_judul',
    label: 'Judul',
    field: 'temuan_judul',
    align: 'left',
    sortable: true
  },
  {
    name: 'bu_name',
    label: 'Business Unit',
    field: 'bu_name',
    align: 'left',
    sortable: true
  },
  {
    name: 'div_nama',
    label: 'Division',
    field: 'div_nama',
    align: 'left',
    sortable: true
  },
  {
    name: 'periode',
    label: 'Periode',
    field: 'periode',
    align: 'left'
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'center',
    sortable: true
  },
  {
    name: 'outstanding',
    label: 'Outstanding',
    field: 'outstanding',
    align: 'center',
    sortable: true
  },
  {
    name: 'closed',
    label: 'Closed',
    field: 'closed',
    align: 'center',
    sortable: true
  },
  {
    name: 'temuan_datecreated',
    label: 'Created',
    field: 'temuan_datecreated',
    align: 'left',
    sortable: true
  }
];

onMounted(async () => {
  // Get BU from user session
  filters.bu_id = authStore.user?.bu_id || '';
  
  if (!filters.bu_id) {
    error('Business Unit tidak ditemukan');
    return;
  }
  
  await loadBU();
  await loadData();
});

const loadBU = async () => {
  try {
    // In real implementation, load from API
    buOptions.value = [
      { bu_id: 'DBC', bu_name: 'DBC' },
      { bu_id: 'WNR', bu_name: 'WNR' },
      { bu_id: 'DFR', bu_name: 'DFR' },
      { bu_id: 'GBC', bu_name: 'GBC' }
    ];
  } catch (err) {
    console.error(err);
  }
};

const loadData = async () => {
  loading.value = true;
  
  try {
    const params = {
      bu_id: filters.bu_id,
      user_type: authStore.user?.account_type || '',
      user_div: authStore.user?.div_id || ''
    };
    
    const res = await axios.get(`${import.meta.env.VITE_API}transaction/getTemuanList`, {
      params
    });
    
    requests.value = res.data;
    pagination.value.rowsNumber = res.data.length;
    
  } catch (err) {
    error('Failed to load requests');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
};

const formatDate = (date) => {
  return dayjs(date).format('DD MMM YYYY');
};

const formatDateTime = (datetime) => {
  return dayjs(datetime).format('DD MMM YYYY HH:mm');
};

const viewDetail = (temuan_id) => {
  router.push(`/transaction/detail-request/${temuan_id}`);
};

const goToInput = () => {
  router.push(`/transaction/input-request?bu=${filters.bu_id}`);
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
