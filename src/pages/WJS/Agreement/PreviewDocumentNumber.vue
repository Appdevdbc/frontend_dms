<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="preview" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Preview Nomor Dokumen</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div class="tw-max-w-4xl tw-mx-auto">
          <div class="tw-mb-6">
            <h6 class="tw-text-lg tw-font-bold tw-text-slate-700 tw-mb-4">Format Nomor Dokumen:</h6>
            <div class="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-p-6 tw-rounded-xl tw-shadow-md">
              <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-text-2xl tw-font-mono tw-font-bold">
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.counter }}</span>
                <span class="tw-text-slate-400">/</span>
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.type }}</span>
                <span class="tw-text-slate-400">/</span>
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.bu }}</span>
                <span class="tw-text-slate-400">/</span>
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.division }}</span>
                <span class="tw-text-slate-400">/</span>
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.department }}</span>
                <span class="tw-text-slate-400">/</span>
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.location }}</span>
                <span class="tw-text-slate-400">/</span>
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.month }}</span>
                <span class="tw-text-slate-400">/</span>
                <span class="tw-bg-yellow-200 tw-px-3 tw-py-1 tw-rounded">{{ preview.year }}</span>
              </div>
            </div>
          </div>

          <q-table
            :rows="breakdownRows"
            :columns="breakdownColumns"
            row-key="component"
            flat
            hide-pagination
            class="tw-shadow-md tw-rounded-xl tw-mb-6"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" :class="`bg-${domain()} tw-text-white tw-font-bold`">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
          </q-table>

          <q-checkbox v-model="agreed" class="tw-mb-6">
            <span class="tw-text-sm tw-text-slate-700">
              Saya menyatakan bahwa nomor perjanjian yang digenerate dimaksudkan untuk perjanjian yang sudah final dan akan ditandatangani oleh pihak terkait
            </span>
          </q-checkbox>

          <div class="tw-flex tw-gap-3 tw-justify-end">
            <q-btn 
              label="Kembali" 
              color="red-7" 
              push
              icon="arrow_back"
              class="tw-px-6 tw-font-semibold"
              @click="router.back()"
            />
            <q-btn 
              label="Submit" 
              color="blue-6" 
              push
              icon="send"
              class="tw-px-6 tw-font-semibold"
              @click="submitRequest"
              :loading="loading"
              :disable="!agreed"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { domain } from "./../../../utils";
import { useRouter, useRoute } from "vue-router";
import { useNotify } from "./../../../composables/useNotify";
import * as agreementApi from "./../../../helpers/agreement";

const router = useRouter();
const route = useRoute();
const { success, error: showError } = useNotify();

const preview = ref({});
const agreed = ref(false);
const loading = ref(false);

const breakdownColumns = [
  { name: 'component', label: 'Komponen', field: 'component', align: 'left' },
  { name: 'value', label: 'Nilai', field: 'value', align: 'left' },
  { name: 'description', label: 'Keterangan', field: 'description', align: 'left' },
];

const breakdownRows = computed(() => [
  { component: 'No. Urut', value: preview.value.counter, description: 'Counter sequential' },
  { component: 'Kode Jenis Perjanjian', value: preview.value.type, description: 'Jenis perjanjian' },
  { component: 'Business Unit', value: preview.value.bu, description: 'Kode BU' },
  { component: 'Divisi', value: preview.value.division, description: 'Akronim divisi' },
  { component: 'Dept', value: preview.value.department, description: 'Akronim department' },
  { component: 'Kode Lokasi Kerja', value: preview.value.location, description: 'Lokasi kerja' },
  { component: 'Bulan', value: preview.value.month, description: 'Bulan (Romawi)' },
  { component: 'Tahun', value: preview.value.year, description: 'Tahun' },
]);

const submitRequest = async () => {
  if (!agreed.value) {
    showError('Silakan centang persetujuan terlebih dahulu');
    return;
  }

  loading.value = true;
  try {
    const requestData = {
      no_spk: preview.value.no_spk,
      emp_id: preview.value.emp_id,
      agr_title: preview.value.agr_title,
      perj_id: preview.value.perj_id
    };
    
    await agreementApi.requestDocumentNumber(requestData);
    success('Sukses mengajukan pembuatan nomer dokumen dan menunggu persetujuan tim legal');
    router.push('/dashboard');
  } catch (error) {
    showError(error?.response?.data?.message || error?.message || 'Gagal mengajukan dokumen');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.params.preview) {
    preview.value = JSON.parse(route.params.preview);
  } else {
    router.push('/dms/request-document-number');
  }
});
</script>


