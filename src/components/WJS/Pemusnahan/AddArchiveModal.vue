<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 600px" class="tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-4`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="text-h6 tw-text-white tw-font-bold">Tambah Arsip</div>
          <q-btn flat dense round icon="close" color="white" v-close-popup />
        </div>
      </q-card-section>
      
      <q-card-section class="tw-p-6">
        <q-input
          v-model="searchName"
          label="Nama Arsip"
          outlined
          @update:model-value="handleSearch"
          hint="Ketik nama arsip untuk mencari (minimal 3 karakter)"
          :loading="searching"
          class="tw-mb-4"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="blue-6"/>
          </template>
        </q-input>
        
        <q-input
          v-model="selectedArchive.arsip_no"
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
          v-model="selectedArchive.content_doc"
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
          @click="addArchive"
          :disable="!selectedArchive.arsip_no"
          class="tw-px-4"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { domain, empid } from '../../../utils';
import { useNotify } from '../../../composables/useNotify';

const props = defineProps({
  modelValue: Boolean,
  kategoriDokumen: String,
  kategoriKeamanan: String,
  lokasiArsip: [String, Number],
  module: {
    type: String,
    default: 'pemusnahan',
    validator: (value) => ['pemusnahan', 'mutasi'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'archive-added']);

const { error: showError } = useNotify();

const show = ref(props.modelValue);
const searchName = ref('');
const selectedArchive = ref({});
const keterangan = ref('');
const searching = ref(false);
let searchTimeout = null;

watch(() => props.modelValue, (val) => {
  show.value = val;
  if (val) {
    // Reset form when opened
    searchName.value = '';
    selectedArchive.value = {};
    keterangan.value = '';
  }
});

watch(show, (val) => {
  emit('update:modelValue', val);
});

const handleSearch = (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  if (!val || val.length < 3) {
    selectedArchive.value = {};
    return;
  }
  
  searchTimeout = setTimeout(() => {
    searchArchive(val);
  }, 1000);
};

const searchArchive = async (nama) => {
  console.log('searchArchive called with:', {
    nama,
    kategoriDokumen: props.kategoriDokumen,
    kategoriKeamanan: props.kategoriKeamanan,
    lokasiArsip: props.lokasiArsip
  });
  
  if (!props.kategoriDokumen || !props.kategoriKeamanan || !props.lokasiArsip) {
    showError('Pilih kategori dokumen, keamanan, dan lokasi arsip terlebih dahulu');
    console.log('woi')
    return;
  }
  
  try {
    searching.value = true;
    const res = await axios.post(`${import.meta.env.VITE_API}dms/${props.module}/validate-archive`, {
      nama_arsip: nama,
      kategori_dokumen: props.kategoriDokumen,
      kategori_keamanan: props.kategoriKeamanan,
      lokasi_arsip: props.lokasiArsip,
      nik_owner: empid()
    }, {
      skipErrorInterceptor: true
    });
    
    selectedArchive.value = res.data.data;
    searching.value = false;
  } catch (error) {
    searching.value = false;
    selectedArchive.value = {};
    showError(error?.response?.data?.message || 'Gagal mencari arsip');
  }
};

const addArchive = () => {
  if (!selectedArchive.value.arsip_no) {
    showError('Silahkan cari arsip terlebih dahulu');
    return;
  }
  
  emit('archive-added', {
    ...selectedArchive.value,
    keterangan: keterangan.value
  });
  
  show.value = false;
};
</script>

