<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-teal-500 tw-to-teal-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="assignment_turned_in" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Konfirmasi Penerimaan BAST</div>
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
              <span class="tw-text-slate-600">Nomor Dokumen:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.pinjam_nomor_doc }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">Lokasi Arsip:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ ticketData?.lokasi_arsip_name }}</span>
            </div>
            <div>
              <span class="tw-text-slate-600">Est. Pengambilan:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ formatDate(ticketData?.pinjam_tgl_est_ambil_to) }}</span>
            </div>
            <div v-if="ticketData?.pinjam_aktivitas === 'Pinjam Asli'">
              <span class="tw-text-slate-600">Est. Pengembalian:</span>
              <span class="tw-ml-2 tw-font-semibold">{{ formatDate(ticketData?.pinjam_tgl_est_kembali_to) }}</span>
            </div>
          </div>
        </div>

        <!-- Catatan Konfirmasi -->
        <div class="tw-mb-4">
          <q-input
            v-model="tmpForm.catatan"
            outlined
            type="textarea"
            rows="4"
            counter
            maxlength="500"
            class="tw-rounded-lg"
          >
            <template v-slot:prepend>
              <q-icon name="note" color="teal-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Catatan Konfirmasi</span>
            </template>
          </q-input>
        </div>

        <!-- Confirmation -->
        <div class="tw-p-4 tw-bg-teal-50 tw-rounded-lg tw-border tw-border-teal-200">
          <div class="tw-flex tw-items-start tw-gap-3">
            <q-icon name="info" color="teal-700" size="24px" />
            <div class="tw-text-sm tw-text-teal-800">
              Dengan mengkonfirmasi, Anda menyatakan telah menerima dokumen sesuai BAST. Status tiket akan berubah menjadi "Peminjaman Berhasil".
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
          unelevated color="teal-6" label="Konfirmasi Terima" icon="check_circle"
          class="tw-font-semibold tw-px-6 tw-rounded-lg"
          @click="handleKonfirmasi" :loading="loading"
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
const tmpForm = reactive({ catatan: '' });

watch(() => props.modelValue, (val) => {
  showDialog.value = val;
  if (val) tmpForm.catatan = '';
});

watch(showDialog, (val) => {
  if (!val) emit('update:modelValue', false);
});

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const handleKonfirmasi = async () => {
  try {
    loading.value = true;
    const row = props.ticketData;
    const appJnsTrans = row.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3;
    await axios.post('/dms/approvePermintaan', {
      creator: empid(),
      id: row.id,
      nomor_tiket: row.pinjam_no_tiket,
      pinjam_status: 'Peminjaman Berhasil',
      notes: tmpForm.catatan,
      jabatan: 'User',
      app_jns_trans: appJnsTrans
    });
    success('Penerimaan dokumen berhasil dikonfirmasi');
    emit('done');
    closeDialog();
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal konfirmasi penerimaan');
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => { showDialog.value = false; };
</script>

