<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 600px" class="tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-4`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="text-h6 tw-text-white tw-font-bold">Edit Keterangan Arsip</div>
          <q-btn flat dense round icon="close" color="white" v-close-popup />
        </div>
      </q-card-section>
      
      <q-card-section class="tw-p-6">
        <q-input
          :model-value="archive.content_name"
          label="Nama Arsip"
          outlined
          readonly
          class="tw-mb-4"
        >
          <template v-slot:prepend>
            <q-icon name="folder" color="blue-6"/>
          </template>
        </q-input>
        
        <q-input
          :model-value="archive.arsip_no"
          label="Kode Arsip"
          outlined
          readonly
          class="tw-mb-4"
        >
          <template v-slot:prepend>
            <q-icon name="qr_code" color="blue-6"/>
          </template>
        </q-input>
        
        <q-input
          :model-value="archive.content_doc"
          label="No. Dokumen"
          outlined
          readonly
          class="tw-mb-4"
        >
          <template v-slot:prepend>
            <q-icon name="description" color="blue-6"/>
          </template>
        </q-input>
        
        <q-input
          v-model="keterangan"
          label="Keterangan"
          type="textarea"
          outlined
          rows="3"
        >
          <template v-slot:prepend>
            <q-icon name="notes" color="blue-6"/>
          </template>
        </q-input>
      </q-card-section>
      
      <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
        <q-btn 
          flat 
          label="Tutup" 
          color="grey-7"
          v-close-popup 
          class="tw-px-4"
        />
        <q-btn 
          unelevated 
          color="blue-6" 
          label="Simpan" 
          @click="updateKeterangan"
          class="tw-px-4"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { domain } from '../../../utils';

const props = defineProps({
  modelValue: Boolean,
  archive: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'keterangan-updated']);

const show = ref(props.modelValue);
const keterangan = ref('');

watch(() => props.modelValue, (val) => {
  show.value = val;
  if (val && props.archive) {
    keterangan.value = props.archive.keterangan || '';
  }
});

watch(show, (val) => {
  emit('update:modelValue', val);
});

const updateKeterangan = () => {
  emit('keterangan-updated', {
    arsip_no: props.archive.arsip_no,
    keterangan: keterangan.value
  });
  show.value = false;
};
</script>

