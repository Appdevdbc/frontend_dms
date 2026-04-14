<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
      <q-card-section class="tw-bg-gradient-to-r tw-from-green-500 tw-to-green-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="check_circle" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Approve Permintaan Dokumen</div>
              <div class="tw-text-sm tw-opacity-90">{{ ticketData?.pinjam_no_tiket }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="closeDialog" />
        </div>
      </q-card-section>
      <q-card-section class="tw-p-6">
        <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
            <div><span class="tw-text-slate-600">Aktivitas:</span><span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_aktivitas }}</span></div>
            <div><span class="tw-text-slate-600">Nama Dokumen:</span><span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_nama_doc }}</span></div>
            <div><span class="tw-text-slate-600">Nomor Dokumen:</span><span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_nomor_doc }}</span></div>
            <div><span class="tw-text-slate-600">Status:</span><span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_status }}</span></div>
          </div>
        </div>
        <q-input v-model="catatan" outlined type="textarea" rows="4" counter maxlength="500" class="tw-rounded-lg" label-slot>
          <template v-slot:prepend><q-icon name="note" color="blue-6" /></template>
          <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Catatan</span><span class="tw-text-red-500 tw-font-bold">*</span></template>
        </q-input>
      </q-card-section>
      <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
        <q-btn unelevated color="grey-6" label="Batal" icon="close" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="closeDialog" :disable="loading" />
        <q-btn unelevated color="green-6" label="Approve" icon="check" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="handleApprove" :loading="loading" />
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
const catatan = ref('');

watch(() => props.modelValue, (val) => { showDialog.value = val; if (val) catatan.value = ''; });
watch(showDialog, (val) => { if (!val) emit('update:modelValue', false); });

const handleApprove = async () => {
  if (!catatan.value?.trim()) { showError('Catatan wajib diisi'); return; }
  try {
    loading.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/approvePermintaan`, {
      creator: empid(),
      id: props.ticketData.id,
      nomor_tiket: props.ticketData.pinjam_no_tiket,
      pinjam_status: props.ticketData.pinjam_status,
      notes: catatan.value,
      jabatan: 'Approver',
      app_jns_trans: props.ticketData.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3,
    }, { skipErrorInterceptor: true });
    loading.value = false;
    success('Permintaan berhasil disetujui');
    emit('done');
    closeDialog();
  } catch (err) {
    loading.value = false;
    showError(err?.response?.data?.message || 'Gagal approve');
  }
};
const closeDialog = () => { showDialog.value = false; };
</script>

