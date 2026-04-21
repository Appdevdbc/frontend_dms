<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="tw-w-full tw-max-w-2xl tw-rounded-xl tw-shadow-2xl">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-red-500 tw-to-red-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="cancel" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Tolak Tiket {{ props.module === 'mutasi' ? 'Mutasi' : 'Pemusnahan' }}</div>
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

        <!-- Alasan Penolakan (Required) -->
        <div class="tw-mb-4">
          <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">
            Alasan Penolakan <span class="tw-text-red-500">*</span>
          </label>
          <q-input
            v-model="tmpForm.alasan"
            outlined
            type="textarea"
            rows="5"
            placeholder="Masukkan alasan penolakan (wajib diisi)"
            class="tw-rounded-lg"
            maxlength="500"
            counter
          >
            <template v-slot:prepend>
              <q-icon name="report_problem" color="red-6" />
            </template>
          </q-input>
        </div>

        <!-- Warning -->
        <div class="tw-p-4 tw-bg-red-50 tw-rounded-lg tw-border tw-border-red-200">
          <div class="tw-flex tw-items-start tw-gap-3">
            <q-icon name="warning" color="red-700" size="24px" />
            <div class="tw-text-sm tw-text-red-800">
              <div class="tw-font-semibold tw-mb-1">Peringatan</div>
              <div>Dengan menolak tiket ini, status akan berubah menjadi "Ditolak" dan pembuat tiket harus melakukan revisi sebelum dapat diajukan kembali.</div>
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
          color="red-6"
          label="Tolak"
          icon="cancel"
          class="tw-font-semibold tw-px-6 tw-rounded-lg"
          @click="handleReject"
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
import * as yup from 'yup';

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

const emit = defineEmits(['update:modelValue', 'rejected']);

const { success, error: showError } = useNotify();

const showDialog = ref(false);
const loading = ref(false);

const tmpForm = reactive({
  alasan: ''
});

const schema = yup.object({
  alasan: yup.string().required("Alasan penolakan wajib diisi")
});

watch(() => props.modelValue, (val) => {
  showDialog.value = val;
  if (val) {
    tmpForm.alasan = '';
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

const validate = async () => {
  schema.validate(tmpForm, { abortEarly: false })
    .then(() => submitReject())
    .catch(err => {
      err.inner.forEach(e => showError(e.message));
    });
};

const submitReject = async () => {
  try {
    loading.value = true;
    await axios.post(
      `${import.meta.env.VITE_API}wjs/${props.module}/${props.ticketData.tr_arsip_id}/reject`,
      {
        creator: empid(),
        alasan: tmpForm.alasan
      },
      { skipErrorInterceptor: true }
    );
    loading.value = false;
    success('Tiket berhasil ditolak');
    emit('rejected');
    closeDialog();
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal menolak tiket');
  }
};

const handleReject = () => {
  validate();
};

const closeDialog = () => {
  showDialog.value = false;
};
</script>

