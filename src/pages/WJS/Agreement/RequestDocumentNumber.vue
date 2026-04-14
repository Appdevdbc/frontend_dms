<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="description" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Request Nomor Dokumen</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Request Nomor Dokumen</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div class="tw-max-w-3xl tw-mx-auto">

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
                <template v-slot:avatar>
                  <q-icon name="info" color="red" size="24px"/>
                </template>
                <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
              </q-banner>
            </div>
            
            <div class="col-12">
              <q-input 
                v-model="form.no_spk" 
                outlined 
                label-slot
                counter
                maxlength="50"
                :rules="[val => !!val || 'Field is required']"
                class="tw-rounded-lg"
                @blur="checkSPK"
                :loading="validatingSPK"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Nomor Tiket HDS Legal</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:append v-if="spkValid">
                  <q-icon name="check_circle" color="positive" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input 
                v-model="form.agr_title" 
                outlined 
                label-slot
                counter
                maxlength="100"
                :rules="[val => !!val || 'Field is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="title" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Judul Perjanjian</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-select
                v-model="form.perj_id"
                :options="agreementTypes"
                option-value="perj_id"
                option-label="perj_desc"
                emit-value
                map-options
                outlined
                label-slot
                :rules="[val => !!val || 'Field is required']"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Jenis Perjanjian</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <div class="tw-flex tw-gap-3 tw-justify-end">
            <q-btn 
              label="Ajukan Permintaan" 
              color="blue-6" 
              push
              icon="send"
              class="tw-px-6 tw-font-semibold"
              @click="handleSubmit"
              :loading="loading"
              :disable="!canPreview"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreviewDialog" persistent>
      <q-card class="tw-w-full tw-max-w-3xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="visibility" size="32px"/>
            Preview Nomor Dokumen
          </div>
        </q-card-section>
        <q-separator/>
        
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <q-banner rounded class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm tw-mb-6">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" size="24px"/>
            </template>
            <span class="tw-text-blue-700 tw-font-medium">
              Nomor dokumen yang akan digenerate dimaksudkan untuk perjanjian yang sudah final dan pasti akan ditandatangani oleh para pihak
            </span>
          </q-banner>

          <div class="tw-bg-yellow-50 tw-p-6 tw-rounded-xl tw-border-2 tw-border-yellow-300">
            <div class="tw-text-center tw-mb-4">
              <div class="tw-text-sm tw-text-gray-600 tw-mb-2">Nomor Dokumen Perjanjian</div>
              <div class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-font-mono">
                {{ previewData.counter }}/{{ previewData.type }}/{{ previewData.bu }}/{{ previewData.division }}/{{ previewData.department }}/{{ previewData.location }}/{{ previewData.month }}/{{ previewData.year }}
              </div>
            </div>

            <q-separator class="tw-my-4"/>

            <div class="tw-grid tw-grid-cols-5 tw-gap-4 tw-text-center">
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">No. Urut</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.counter }}</div>
              </div>
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">Kode Jenis</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.type }}</div>
              </div>
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">BU</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.bu }}</div>
              </div>
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">Divisi</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.division }}</div>
              </div>
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">Dept</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.department }}</div>
              </div>
            </div>

            <div class="tw-grid tw-grid-cols-3 tw-gap-4 tw-text-center tw-mt-4">
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">Lokasi</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.location }}</div>
              </div>
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">Bulan</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.month }}</div>
              </div>
              <div>
                <div class="tw-text-xs tw-text-gray-600 tw-mb-1">Tahun</div>
                <div class="tw-bg-yellow-200 tw-py-2 tw-px-3 tw-rounded tw-font-bold">{{ previewData.year }}</div>
              </div>
            </div>
          </div>

          <div class="tw-mt-6 tw-space-y-3">
            <div class="tw-flex tw-gap-3">
              <div class="tw-w-40 tw-text-gray-600">No. Tiket HDS:</div>
              <div class="tw-font-semibold">{{ form.no_spk }}</div>
            </div>
            <div class="tw-flex tw-gap-3">
              <div class="tw-w-40 tw-text-gray-600">Judul Perjanjian:</div>
              <div class="tw-font-semibold">{{ form.agr_title }}</div>
            </div>
            <div class="tw-flex tw-gap-3">
              <div class="tw-w-40 tw-text-gray-600">Jenis Perjanjian:</div>
              <div class="tw-font-semibold">{{ getAgreementTypeName(form.perj_id) }}</div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn 
            label="Batal" 
            color="red-7" 
            push 
            icon="close" 
            @click="showPreviewDialog = false"
            class="tw-px-6 tw-font-semibold" 
          />
          <q-btn 
            label="Ya, Ajukan Permintaan" 
            color="blue-6" 
            push 
            icon="check_circle" 
            @click="submitRequest"
            :loading="submitting"
            class="tw-px-6 tw-font-semibold" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { domain, empid } from "./../../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../../composables/useNotify";
import * as agreementApi from "./../../../helpers/agreement";

const $q = useQuasar();
const { success, error: showError } = useNotify();

const form = ref({
  no_spk: null,
  agr_title: null,
  perj_id: null,
  emp_id: empid()
});

const agreementTypes = ref([]);
const loading = ref(false);
const submitting = ref(false);
const validatingSPK = ref(false);
const spkValid = ref(false);
const showPreviewDialog = ref(false);
const previewData = ref({
  counter: '',
  type: '',
  bu: '',
  division: '',
  department: '',
  location: '',
  month: '',
  year: ''
});

const canPreview = computed(() => {
  return form.value.no_spk && form.value.agr_title && form.value.perj_id && spkValid.value;
});

const getAgreementTypeName = (perj_id) => {
  const type = agreementTypes.value.find(t => t.perj_id === perj_id);
  return type ? type.perj_desc : perj_id;
};

const loadAgreementTypes = async () => {
  try {
    const res = await agreementApi.fetchAgreementTypes();
    agreementTypes.value = Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    showError('Gagal memuat jenis perjanjian. Silakan refresh halaman.');
  }
};

const checkSPK = async () => {
  if (!form.value.no_spk) return;
  
  validatingSPK.value = true;
  spkValid.value = false;
  
  try {
    await agreementApi.validateSPK(form.value.no_spk);
    spkValid.value = true;
    success('Nomor tiket HDS valid');
  } catch (error) {
    spkValid.value = false;
    const errorMessage = error?.response?.data?.message || 'SPK tidak valid';
    showError(errorMessage);
  } finally {
    validatingSPK.value = false;
  }
};

const handleSubmit = async () => {
  if (!canPreview.value) {
    $q.notify({
      type: 'warning',
      message: 'Silakan lengkapi semua field yang wajib diisi',
      position: 'bottom',
      timeout: 3000
    });
    return;
  }

  loading.value = true;
  try {
    // Call preview API to get document number format
    const preview = await agreementApi.previewDocumentNumber(form.value);
    
    // Store preview data
    previewData.value = preview;
    
    // Show preview dialog
    showPreviewDialog.value = true;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Gagal membuat preview nomor dokumen';
    showError(errorMessage);
  } finally {
    loading.value = false;
  }
};

const submitRequest = async () => {
  submitting.value = true;
  try {
    await agreementApi.requestDocumentNumber(form.value);
    
    showPreviewDialog.value = false;
    success('Sukses mengajukan pembuatan nomer dokumen dan menunggu persetujuan tim legal');
    
    // Reset form — sama seperti PHP redirect ke halaman yang sama
    form.value = {
      no_spk: null,
      agr_title: null,
      perj_id: null,
      emp_id: empid()
    };
    spkValid.value = false;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Gagal mengajukan pembuatan nomer dokumen, silahkan dicoba lagi';
    showError(errorMessage);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadAgreementTypes();
});
</script>


