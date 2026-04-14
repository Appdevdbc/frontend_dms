<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-orange-500 tw-to-orange-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Revisi Permintaan</div>
              <div class="tw-text-sm tw-opacity-90">{{ ticketData?.pinjam_no_tiket }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="closeDialog" />
        </div>
      </q-card-section>

      <!-- Content -->
      <q-card-section class="tw-p-6">
        <!-- Ticket Info -->
        <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
            <div>
              <span class="tw-text-slate-600">Nama Dokumen:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_nama_doc }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">Aktivitas:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_aktivitas }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">Status:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_status }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">Nomor Dokumen:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_nomor_doc }}</span>
            </div>
          </div>
        </div>

        <!-- Alasan Revisi -->
        <div class="tw-mb-4">
          <q-input
            v-model="tmpForm.alasan"
            outlined
            type="textarea"
            rows="4"
            counter
            maxlength="500"
            class="tw-rounded-lg"
          >
            <template v-slot:prepend>
              <q-icon name="edit_note" color="orange-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Revisi</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </div>

        <!-- Info -->
        <div class="tw-p-4 tw-bg-orange-50 tw-rounded-lg tw-border tw-border-orange-200">
          <div class="tw-flex tw-items-start tw-gap-3">
            <q-icon name="info" color="orange-700" size="24px" />
            <div class="tw-text-sm tw-text-orange-800">
              Permintaan akan dikembalikan ke pembuat untuk dilakukan revisi sesuai alasan yang diberikan.
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
        <q-btn
          unelevated color="grey-6" label="Batal" icon="close"
          class="tw-font-semibold tw-px-6 tw-rounded-lg"
          @click="closeDialog" :disable="loading"
        />
        <q-btn
          unelevated color="orange-6" label="Kirim Revisi" icon="send"
          class="tw-font-semibold tw-px-6 tw-rounded-lg"
          @click="handleRevisi" :loading="loading"
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
  modelValue: { type: Boolean, default: false },
  ticketData: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'done']);
const { success, error: showError } = useNotify();

const showDialog = ref(false);
const loading = ref(false);
const tmpForm = reactive({ alasan: '' });

watch(() => props.modelValue, (val) => {
  showDialog.value = val;
  if (val) tmpForm.alasan = '';
});

watch(showDialog, (val) => {
  if (!val) emit('update:modelValue', false);
});

const handleRevisi = async () => {
  if (!tmpForm.alasan?.trim()) {
    showError('Alasan revisi wajib diisi');
    return;
  }
  try {
    loading.value = true;
    const row = props.ticketData;
    const appJnsTrans = row.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3;
    await axios.post('/dms/approvePermintaan', {
      creator: empid(),
      id: row.id,
      nomor_tiket: row.pinjam_no_tiket,
      pinjam_status: 'Kirim Revisi',
      pinjam_user_approve: '',
      pinjam_approve_ke: 0,
      notes: tmpForm.alasan,
      revisi_reason: tmpForm.alasan,
      jabatan: 'Approver',
      app_jns_trans: appJnsTrans
    });
    success('Permintaan revisi berhasil dikirim');
    emit('done');
    closeDialog();
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal mengirim revisi');
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => { showDialog.value = false; };
</script>

