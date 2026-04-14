<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-green-500 tw-to-green-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="check_circle" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Approve Tiket {{ props.module === 'mutasi' ? 'Mutasi' : 'Pemusnahan' }}</div>
              <div class="tw-text-sm tw-opacity-90">{{ ticketData?.tr_no_tiket }}</div>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            @click="closeDialog"
          />
        </div>
      </q-card-section>

      <!-- Content -->
      <q-card-section class="tw-p-6">
        <!-- Ticket Info -->
        <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
            <div>
              <span class="tw-text-slate-600">Tanggal Pengajuan:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ formatDate(ticketData?.tr_tgl_pengajuan) }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">{{ props.module === 'mutasi' ? 'Tanggal Mutasi:' : 'Tanggal Pemusnahan:' }}</span>
              <span class="tw-ml-2 tw-font-semibold">{{ formatDate(props.module === 'mutasi' ? ticketData?.tr_tgl_mutasi : ticketData?.tr_tgl_pemusnahan) }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">Lokasi Arsip:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.lokasi_arsip_name }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">Status Saat Ini:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.status_text }}</span>
            </div>
          </div>
        </div>

        <!-- Catatan -->
        <div class="tw-mb-4">
          <q-input
            v-model="tmpForm.catatan"
            outlined
            type="textarea"
            rows="4"
            label-slot
            counter
            maxlength="500"
            class="tw-rounded-lg"
          >
            <template v-slot:prepend>
              <q-icon name="note" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Catatan</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </div>

        <!-- Confirmation -->
        <div class="tw-p-4 tw-bg-yellow-50 tw-rounded-lg tw-border tw-border-yellow-200">
          <div class="tw-flex tw-items-start tw-gap-3">
            <q-icon name="info" color="yellow-700" size="24px" />
            <div class="tw-text-sm tw-text-yellow-800">
              <div class="tw-font-semibold tw-mb-1">Konfirmasi Approval</div>
              <div>Dengan menyetujui tiket ini, proses akan dilanjutkan ke tahap berikutnya dalam workflow {{ props.module === 'mutasi' ? 'mutasi' : 'pemusnahan' }} arsip.</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
        <q-btn
          unelevated
          color="grey-6"
          label="Batal"
          icon="close"
          class="tw-font-semibold tw-px-6 tw-rounded-lg"
          @click="closeDialog"
          :disable="loading"
        />
        <q-btn
          unelevated
          color="green-6"
          label="Approve"
          icon="check"
          class="tw-font-semibold tw-px-6 tw-rounded-lg"
          @click="handleApprove"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';
import { empid } from '../../../utils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  ticketData: {
    type: Object,
    default: null
  },
  module: {
    type: String,
    default: 'pemusnahan' // 'pemusnahan' or 'mutasi'
  }
});

const emit = defineEmits(['update:modelValue', 'approved']);

const { success, error: showError } = useNotify();

const showDialog = ref(false);
const loading = ref(false);

const tmpForm = reactive({
  catatan: ''
});

watch(() => props.modelValue, (val) => {
  showDialog.value = val;
  if (val) {
    tmpForm.catatan = '';
  }
});

watch(showDialog, (val) => {
  if (!val) {
    emit('update:modelValue', false);
  }
});

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const handleApprove = async () => {
  if (!tmpForm.catatan || tmpForm.catatan.trim() === '') {
    showError('Catatan wajib diisi');
    return;
  }
  
  try {
    loading.value = true;
    await axios.post(
      `${import.meta.env.VITE_API}dms/${props.module}/${props.ticketData.tr_arsip_id}/approve`,
      {
        creator: empid(),
        catatan: tmpForm.catatan
      },
      { skipErrorInterceptor: true }
    );
    loading.value = false;
    success('Tiket berhasil diapprove');
    emit('approved');
    closeDialog();
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal approve tiket');
  }
};

const closeDialog = () => {
  showDialog.value = false;
};
</script>

