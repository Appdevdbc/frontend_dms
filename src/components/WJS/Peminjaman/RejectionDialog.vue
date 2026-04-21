<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
      <q-card-section class="tw-bg-gradient-to-r tw-from-red-500 tw-to-red-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="cancel" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Tolak Permintaan Dokumen</div>
              <div class="tw-text-sm tw-opacity-90">{{ ticketData?.pinjam_no_tiket }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="closeDialog" />
        </div>
      </q-card-section>
      <q-card-section class="tw-p-6">
        <q-input v-model="reason" outlined type="textarea" rows="4" counter maxlength="500" class="tw-rounded-lg" label-slot>
          <template v-slot:prepend><q-icon name="report_problem" color="red-6" /></template>
          <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Alasan Penolakan</span><span class="tw-text-red-500 tw-font-bold">*</span></template>
        </q-input>
      </q-card-section>
      <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
        <q-btn unelevated color="grey-6" label="Batal" icon="close" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="closeDialog" :disable="loading" />
        <q-btn unelevated color="red-6" label="Tolak" icon="cancel" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="handleReject" :loading="loading" :disable="!reason.trim()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';
import { empid } from '../../../utils';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ticketData: { type: Object, default: null },
});
const emit = defineEmits(['update:modelValue', 'done']);
const { success, error: showError } = useNotify();
const showDialog = ref(false);
const loading = ref(false);
const reason = ref('');

watch(() => props.modelValue, (val) => { showDialog.value = val; if (val) reason.value = ''; });
watch(showDialog, (val) => { if (!val) emit('update:modelValue', false); });

const handleReject = async () => {
  if (!reason.value?.trim()) { showError('Alasan penolakan wajib diisi'); return; }
  try {
    loading.value = true;
    await axios.post(`${import.meta.env.VITE_API}wjs/approvePermintaan`, {
      creator: empid(),
      id: props.ticketData.id,
      nomor_tiket: props.ticketData.pinjam_no_tiket,
      pinjam_status: 'Kirim Tolak',
      notes: reason.value,
      revisi_reason: reason.value,
      jabatan: 'Approver',
      app_jns_trans: props.ticketData.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3,
    }, { skipErrorInterceptor: true });
    loading.value = false;
    success('Permintaan berhasil ditolak');
    emit('done');
    closeDialog();
  } catch (err) {
    loading.value = false;
    showError(err?.response?.data?.message || 'Gagal menolak');
  }
};
const closeDialog = () => { showDialog.value = false; };
</script>

