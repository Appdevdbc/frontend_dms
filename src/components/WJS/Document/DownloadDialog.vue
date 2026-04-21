<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width:420px">
      <q-card-section class="bg-blue-6 text-white">
        <div class="text-h6">Konfirmasi Download</div>
      </q-card-section>
      <q-card-section>
        <p class="tw-text-sm tw-text-gray-600 tw-mb-4">
          Dokumen ini bersifat <strong>{{ contentSecurity }}</strong>. Masukkan nomor tiket permintaan dokumen PDF/Elektronik untuk melanjutkan download.
        </p>
        <q-input v-model="noTiket" outlined label="Nomor Tiket" placeholder="Contoh: PKS/001/25" autofocus @keyup.enter="submit" />
        <div v-if="logOutput" class="tw-mt-3 tw-text-red-600 tw-text-sm tw-bg-red-50 tw-p-3 tw-rounded-lg">{{ logOutput }}</div>
        <p class="tw-text-xs tw-text-gray-500 tw-mt-3">
          Belum punya tiket? <a href="#/dms/peminjaman-dokumen" class="tw-text-blue-600 tw-underline">Klik disini</a>
        </p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Batal" v-close-popup />
        <q-btn color="blue-6" label="Download" @click="submit" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { empid } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({
  modelValue: Boolean,
  contentId: [Number, String],
  contentFile: String,
  contentName: String,
  contentSecurity: { type: String, default: 'restricted' },
});
const emit = defineEmits(['update:modelValue']);
const { error } = useNotify();

const noTiket = ref('');
const loading = ref(false);
const logOutput = ref('');

const submit = async () => {
  if (!noTiket.value.trim()) { logOutput.value = 'Nomor tiket wajib diisi'; return; }
  loading.value = true; logOutput.value = '';
  try {
    await axios.post(`${import.meta.env.VITE_API}wjs/document/download-log/pinjam`, {
      content_id: props.contentId, empid: empid(), no_tiket: noTiket.value.trim(),
    });
    emit('update:modelValue', false);
    window.open(`${import.meta.env.VITE_FILE_URL || ''}${props.contentFile}`, '_blank');
  } catch (e) {
    logOutput.value = e.response?.data?.message || 'Tiket tidak valid atau sudah melewati waktu download';
  } finally { loading.value = false; }
};
</script>

