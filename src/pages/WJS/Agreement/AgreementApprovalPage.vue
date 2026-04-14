<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden tw-max-w-2xl tw-mx-auto">
      <q-card-section :class="`side-${domain()}-1 tw-py-5`">
        <div class="text-h6 tw-text-white tw-font-bold">Generate Nomor Dokumen</div>
      </q-card-section>

      <div v-if="loading" class="tw-flex tw-justify-center tw-py-12">
        <q-spinner-dots color="blue-6" size="40px" />
      </div>

      <!-- Sudah disetujui -->
      <template v-else-if="alreadyApproved">
        <q-card-section class="tw-p-6">
          <q-banner rounded class="tw-bg-green-50 tw-border-l-4 tw-border-green-500">
            <template v-slot:avatar><q-icon name="check_circle" color="green" size="24px" /></template>
            <span class="tw-text-green-700 tw-font-medium">{{ approvedMessage }}</span>
          </q-banner>
        </q-card-section>
      </template>

      <!-- Form approval -->
      <template v-else-if="docData">
        <q-card-section class="tw-p-6">
          <div class="tw-grid tw-grid-cols-1 tw-gap-4">

            <!-- Business Unit (readonly) -->
            <q-input :model-value="docData.bu" outlined label="Business Unit" readonly class="tw-rounded-lg tw-bg-slate-50">
              <template v-slot:prepend><q-icon name="domain" color="blue-6" /></template>
            </q-input>

            <!-- Nomor Tiket HDS (readonly) -->
            <q-input :model-value="docData.doc_hds_id" outlined label="Nomor Tiket HDS Legal" readonly class="tw-rounded-lg tw-bg-slate-50">
              <template v-slot:prepend><q-icon name="confirmation_number" color="blue-6" /></template>
            </q-input>

            <!-- Judul Perjanjian (readonly) -->
            <q-input :model-value="docData.doc_judul" outlined label="Judul Perjanjian" readonly class="tw-rounded-lg tw-bg-slate-50">
              <template v-slot:prepend><q-icon name="title" color="blue-6" /></template>
            </q-input>

            <!-- Jenis Perjanjian (editable — approver bisa ubah) -->
            <q-select
              v-model="selectedPerjId"
              :options="agreementTypes"
              option-value="perj_id"
              option-label="perj_desc"
              emit-value
              map-options
              outlined
              label="Jenis Perjanjian"
              class="tw-rounded-lg"
            >
              <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
            </q-select>

            <!-- Info pemohon -->
            <div class="tw-bg-blue-50 tw-rounded-xl tw-p-4 tw-grid tw-grid-cols-2 tw-gap-3">
              <div><div class="tw-text-xs tw-text-gray-500">Nama Pemohon</div><div class="tw-font-semibold">{{ docData.requester }}</div></div>
              <div><div class="tw-text-xs tw-text-gray-500">Divisi</div><div class="tw-font-semibold">{{ docData.division }}</div></div>
              <div><div class="tw-text-xs tw-text-gray-500">Status</div>
                <q-badge :color="docData.doc_nmr_status === 'Approval 1' ? 'orange' : 'blue-6'" :label="docData.doc_nmr_status" />
              </div>
            </div>

          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Konfirmasi" color="blue-6" push icon="check_circle" @click="submit" :loading="submitting" class="tw-px-6 tw-font-semibold" />
        </q-card-actions>
      </template>

      <!-- Token tidak valid -->
      <template v-else>
        <q-card-section class="tw-p-6 tw-text-center tw-text-gray-400">
          <q-icon name="error_outline" size="48px" />
          <div class="tw-mt-2">Token tidak valid atau dokumen tidak ditemukan</div>
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { useRoute, useRouter } from "vue-router";
import * as agreementApi from "../../../helpers/agreement";

const { success, error: showError } = useNotify();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const docData = ref(null);
const agreementTypes = ref([]);
const selectedPerjId = ref('');
const alreadyApproved = ref(false);
const approvedMessage = ref('');

const token = route.query.token;

const loadData = async () => {
  if (!token) { loading.value = false; return; }
  try {
    const res = await agreementApi.getApprovalDetails(token);
    if (res.approved) {
      alreadyApproved.value = true;
      approvedMessage.value = res.message;
    } else {
      docData.value = res;
      agreementTypes.value = res.agreement_types || [];
      selectedPerjId.value = res.doc_perj_id || '';
    }
  } catch (e) {
    docData.value = null;
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  if (!selectedPerjId.value) return showError('Silahkan pilih jenis perjanjian dahulu');
  submitting.value = true;
  try {
    const res = await agreementApi.approveDocumentNumber({ token, perj_id: selectedPerjId.value });
    if (res.doc_number) {
      // Approval 2 selesai — status Open
      success(`Pengajuan nomer dokumen berhasil disetujui dan dikirimkan email notifikasi ke user!`);
    } else {
      // Approval 1 selesai — lanjut ke Approval 2
      success('Pengajuan nomer dokumen berhasil disetujui, menunggu persetujuan Departemen Head Legal!');
    }
    router.push({ path: '/dms/request-document-number' });
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal memproses approval');
  } finally {
    submitting.value = false;
  }
};

onMounted(loadData);
</script>


