<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="cancel" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">
              Pembatalan Nomor Dokumen
            </div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>DMS</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Pembatalan Nomor Dokumen</span>
            </div>
          </div>
        </div>
      </q-card-section>
      
      <q-separator />
      
      <!-- Form -->
      <q-card-section class="tw-bg-white tw-p-6">
        <div class="row q-col-gutter-md">
          <!-- Required field banner -->
          <div class="col-12">
            <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
              <template v-slot:avatar>
                <q-icon name="info" color="red" size="24px"/>
              </template>
              <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
            </q-banner>
          </div>

          <!-- Document Number -->
          <div class="col-12">
            <q-input
              v-model="form.doc_id"
              outlined
              counter
              maxlength="50"
              label-slot
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="blue-6"/>
              </template>
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">
                  Nomor Dokumen Perjanjian
                </span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </template>
            </q-input>
          </div>
          
          <!-- Cancellation Reason -->
          <div class="col-12">
            <q-input
              v-model="form.doc_alasan_batal"
              outlined
              type="textarea"
              rows="3"
              counter
              maxlength="500"
              label-slot
              class="tw-rounded-lg"
            >
              <template v-slot:prepend>
                <q-icon name="comment" color="blue-6"/>
              </template>
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">
                  Alasan Pembatalan
                </span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </template>
            </q-input>
          </div>
          
          <!-- Buttons -->
          <div class="col-12 tw-flex tw-justify-end tw-gap-3">
            <q-btn
              label="Batal"
              color="grey-7"
              push
              icon="close"
              @click="handleCancel"
              class="tw-px-6 tw-font-semibold"
            />
            <q-btn
              label="Batalkan Dokumen"
              color="red-7"
              push
              icon="cancel"
              @click="handleSubmit"
              :loading="loading"
              class="tw-px-6 tw-font-semibold"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { domain } from '../../../utils.js';
import * as documentCancelApi from '../../../helpers/document-cancel.js';

const $q = useQuasar();
const router = useRouter();

// Form state
const form = ref({
  doc_id: '',
  doc_alasan_batal: ''
});

const loading = ref(false);

// Methods
const handleSubmit = () => {
  // Validation
  if (!form.value.doc_id || !form.value.doc_alasan_batal) {
    $q.notify({
      type: 'negative',
      message: 'Nomor dokumen dan alasan pembatalan wajib diisi',
      position: 'bottom'
    });
    return;
  }
  
  // Confirmation dialog
  $q.dialog({
    title: 'Konfirmasi',
    message: `Apakah Anda yakin ingin membatalkan dokumen <strong>${form.value.doc_id}</strong>?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color: 'red-7',
      label: 'Ya, Batalkan',
      icon: 'check_circle',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    cancel: {
      push: true,
      color: 'grey-7',
      label: 'Tidak',
      icon: 'close',
      class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
    },
    persistent: true
  }).onOk(async () => {
    await submitCancellation();
  });
};

const submitCancellation = async () => {
  loading.value = true;
  try {
    const response = await documentCancelApi.cancelDocument(form.value);
    
    $q.notify({
      type: 'positive',
      message: response.message || 'Nomor dokumen berhasil dibatalkan!',
      position: 'bottom'
    });
    
    // Reset form
    form.value = {
      doc_id: '',
      doc_alasan_batal: ''
    };
    
  } catch (error) {
    const errorMessage = error?.response?.data?.message 
      || error?.message 
      || 'Nomor dokumen gagal dibatalkan!';
    
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'bottom'
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/dashboard');
};
</script>


