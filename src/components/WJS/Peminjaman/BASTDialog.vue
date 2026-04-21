<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-purple-500 tw-to-purple-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="assignment" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Proses BAST</div>
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
          </div>
        </div>

        <!-- Kondisi Dokumen -->
        <div class="tw-mb-4">
          <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">
            Kondisi Dokumen <span class="tw-text-red-500">*</span>
          </label>
          <q-select
            v-model="tmpForm.kondisi_dokumen"
            :options="kondisiOptions"
            emit-value map-options
            outlined
            class="tw-rounded-lg"
          >
            <template v-slot:prepend>
              <q-icon name="fact_check" color="purple-6" />
            </template>
          </q-select>
        </div>

        <!-- Catatan BAST -->
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
              <q-icon name="note" color="purple-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Catatan BAST</span>
            </template>
          </q-input>
        </div>

        <!-- Info -->
        <div class="tw-p-4 tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-200">
          <div class="tw-flex tw-items-start tw-gap-3">
            <q-icon name="info" color="purple-700" size="24px" />
            <div class="tw-text-sm tw-text-purple-800">
              Setelah proses BAST, status tiket akan berubah menjadi "Selesai BAST" dan peminjam akan diminta untuk konfirmasi penerimaan dokumen.
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
          unelevated color="purple-6" label="Proses BAST" icon="assignment_turned_in"
          class="tw-font-semibold tw-px-6 tw-rounded-lg"
          @click="handleBAST" :loading="loading"
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

const kondisiOptions = [
  { label: 'Baik', value: 'Baik' },
  { label: 'Rusak', value: 'Rusak' }
];

const tmpForm = reactive({ kondisi_dokumen: 'Baik', catatan: '' });

watch(() => props.modelValue, (val) => {
  showDialog.value = val;
  if (val) {
    tmpForm.kondisi_dokumen = 'Baik';
    tmpForm.catatan = '';
  }
});

watch(showDialog, (val) => {
  if (!val) emit('update:modelValue', false);
});

const handleBAST = async () => {
  if (!tmpForm.kondisi_dokumen) {
    showError('Kondisi dokumen wajib dipilih');
    return;
  }
  try {
    loading.value = true;
    const row = props.ticketData;
    const appJnsTrans = row.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3;
    await axios.post('/wjs/approvePermintaan', {
      creator: empid(),
      id: row.id,
      nomor_tiket: row.pinjam_no_tiket,
      pinjam_status: 'Selesai BAST',
      notes: tmpForm.catatan,
      jabatan: 'Arsiparis',
      app_jns_trans: appJnsTrans,
      kondisi_dokumen: tmpForm.kondisi_dokumen
    });
    success('BAST berhasil diproses');
    emit('done');
    closeDialog();
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal memproses BAST');
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => { showDialog.value = false; };
</script>

