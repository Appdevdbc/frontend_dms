<template>
  <q-dialog 
    v-model="showDialog" 
    transition-show="slide-up"
    transition-hide="slide-down"
    persistent
  >
    <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width: 900px; max-width: 95vw;">
      <!-- Header -->
      <q-card-section :class="`bg-${domain()}`">
        <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
          <q-icon name="verified" size="32px"/>
          Detail Approval - Prioritas {{ prioritas }} ({{ jenisTransaksiText }})
        </div>
      </q-card-section>

      <q-separator/>

      <!-- Content -->
      <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
        <q-table
          :rows="approvals"
          :columns="columns"
          row-key="app_id"
          :loading="loading"
          flat
          bordered
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
          :rows-per-page-options="[0]"
          hide-pagination
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
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

          <template v-slot:loading>
            <q-inner-loading showing color="blue-6" />
          </template>

          <template v-slot:no-data>
            <div class="tw-w-full tw-text-center tw-py-12">
              <q-icon name="info" size="64px" color="grey-4"/>
              <div class="tw-text-slate-500 tw-mt-3 tw-text-lg tw-font-medium">Tidak ada data approval</div>
              <div class="tw-text-slate-400 tw-text-sm tw-mt-1">Silahkan hubungi administrator untuk setup approval</div>
            </div>
          </template>
        </q-table>
      </q-card-section>

      <q-separator class="tw-bg-slate-200"/>

      <!-- Actions -->
      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn
          label="Tutup"
          color="red-7"
          push
          icon="close"
          class="tw-px-6 tw-font-semibold tw-rounded-lg"
          @click="closeDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { domain } from '../../../utils';
import { useNotify } from '../../../composables/useNotify';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  buId: {
    type: String,
    default: ''
  },
  prioritas: {
    type: Number,
    default: 1
  },
  jenisTransaksi: {
    type: Number,
    default: 7 // 7 = Mutasi
  }
});

const emit = defineEmits(['update:modelValue']);

const { error: showError } = useNotify();

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const approvals = ref([]);

const columns = [
  { name: 'app_kode', label: 'Kode', align: 'center', field: 'app_kode', sortable: true },
  { name: 'app_prioritas', label: 'Prioritas', align: 'center', field: 'app_prioritas', sortable: true },
  { name: 'app_nama', label: 'Nama Approval', align: 'left', field: 'app_nama', sortable: true },
  { name: 'app_jabatan', label: 'Jabatan', align: 'left', field: 'app_jabatan', sortable: true },
  { name: 'app_email', label: 'Email', align: 'left', field: 'app_email', sortable: true }
];

const jenisTransaksiText = computed(() => {
  const types = {
    1: 'Pemusnahan',
    7: 'Mutasi'
  };
  return types[props.jenisTransaksi] || 'Unknown';
});

const loadApprovals = async () => {
  if (!props.buId || !props.prioritas) {
    showError('Bisnis unit dan prioritas approval harus diisi');
    return;
  }

  try {
    loading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/master-approval`, {
      params: {
        rowsPerPage: null,
        bu_id: props.buId,
        app_prioritas: props.prioritas,
        app_jns_trans: props.jenisTransaksi
      },
      skipErrorInterceptor: true
    });

    if (typeof res.data.data === "undefined") {
      approvals.value = res.data;
    } else {
      approvals.value = res.data.data;
    }
  } catch (error) {
    console.error('loadApprovals error:', error);
    showError(error?.response?.data?.message || 'Gagal memuat data approval');
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  showDialog.value = false;
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadApprovals();
  }
});
</script>

