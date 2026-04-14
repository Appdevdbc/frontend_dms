<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden tw-max-w-4xl tw-mx-auto">
      <q-card-section class="bg-blue-6 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="approval" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Approval Nomor Dokumen</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" v-if="!loading">
        <div v-if="approved">
          <q-banner rounded class="tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-shadow-sm">
            <template v-slot:avatar>
              <q-icon name="check_circle" color="positive" size="32px"/>
            </template>
            <div class="tw-text-green-700">
              <div class="tw-font-bold tw-text-lg tw-mb-2">Dokumen Sudah Disetujui</div>
              <div>{{ approvalData.message }}</div>
            </div>
          </q-banner>
        </div>

        <div v-else>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner rounded class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm">
                <template v-slot:avatar>
                  <q-icon name="info" color="blue" size="24px"/>
                </template>
                <span class="tw-text-blue-700 tw-font-medium">Silakan review detail pengajuan di bawah ini</span>
              </q-banner>
            </div>

            <div class="col-12">
              <q-list bordered class="tw-rounded-lg">
                <q-item>
                  <q-item-section>
                    <q-item-label class="tw-font-semibold tw-text-slate-600">Nomor Tiket HDS</q-item-label>
                    <q-item-label caption class="tw-text-lg tw-text-slate-800">{{ approvalData.doc_hds_id }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator/>
                <q-item>
                  <q-item-section>
                    <q-item-label class="tw-font-semibold tw-text-slate-600">Judul Perjanjian</q-item-label>
                    <q-item-label caption class="tw-text-lg tw-text-slate-800">{{ approvalData.doc_judul }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator/>
                <q-item>
                  <q-item-section>
                    <q-item-label class="tw-font-semibold tw-text-slate-600">Nama Pemohon</q-item-label>
                    <q-item-label caption class="tw-text-lg tw-text-slate-800">{{ approvalData.requester }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator/>
                <q-item>
                  <q-item-section>
                    <q-item-label class="tw-font-semibold tw-text-slate-600">Business Unit</q-item-label>
                    <q-item-label caption class="tw-text-lg tw-text-slate-800">{{ approvalData.bu }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator/>
                <q-item>
                  <q-item-section>
                    <q-item-label class="tw-font-semibold tw-text-slate-600">Divisi</q-item-label>
                    <q-item-label caption class="tw-text-lg tw-text-slate-800">{{ approvalData.division }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12">
              <q-select
                v-model="selectedType"
                :options="approvalData.agreement_types"
                option-value="perj_id"
                option-label="perj_desc"
                emit-value
                map-options
                outlined
                label="Jenis Perjanjian (dapat diubah)"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="blue-6"/>
                </template>
              </q-select>
            </div>
          </div>

          <div class="tw-flex tw-gap-3 tw-justify-end tw-mt-6">
            <q-btn 
              label="Konfirmasi" 
              color="blue-6" 
              push
              icon="check_circle"
              class="tw-px-8 tw-font-semibold"
              @click="approve"
              :loading="submitting"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="loading" class="tw-p-6 tw-text-center">
        <q-spinner color="blue-6" size="50px" />
        <div class="tw-mt-4 tw-text-slate-600">Memuat data...</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import * as agreementApi from "./../../../helpers/agreement";

const route = useRoute();
const $q = useQuasar();

const loading = ref(true);
const submitting = ref(false);
const approved = ref(false);
const approvalData = ref({});
const selectedType = ref(null);
const token = ref(null);

const loadApprovalDetails = async () => {
  try {
    token.value = route.query.token;
    if (!token.value) {
      $q.notify({
        type: 'negative',
        message: 'Token tidak valid',
        position: 'bottom'
      });
      return;
    }

    const data = await agreementApi.getApprovalDetails(token.value);
    approvalData.value = data;
    approved.value = data.approved;
    selectedType.value = data.doc_perj_id;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Gagal memuat data approval',
      position: 'bottom'
    });
  }
};

const approve = async () => {
  submitting.value = true;
  try {
    const result = await agreementApi.approveDocumentNumber({
      token: token.value,
      perj_id: selectedType.value
    });
    
    $q.notify({
      type: 'positive',
      message: result.message || 'Approval berhasil',
      position: 'bottom'
    });
    
    approved.value = true;
    approvalData.value.message = result.message;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Gagal melakukan approval',
      position: 'bottom'
    });
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadApprovalDetails();
});
</script>


