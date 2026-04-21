<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden tw-max-w-xl tw-mx-auto">
      <q-card-section class="bg-indigo-7 tw-py-5">
        <div class="text-h6 tw-text-white tw-font-bold">Konfirmasi Keeper Dokumen</div>
      </q-card-section>

      <div v-if="loading" class="tw-flex tw-justify-center tw-py-12"><q-spinner-dots color="indigo-6" size="40px" /></div>

      <template v-else-if="doc">
        <q-card-section class="tw-p-6">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-6 tw-p-4 tw-bg-indigo-50 tw-rounded-xl">
            <div><div class="tw-text-xs tw-text-gray-500">Nama Dokumen</div><div class="tw-font-bold">{{ doc.content_name }}</div></div>
            <div><div class="tw-text-xs tw-text-gray-500">Tipe</div><div class="tw-font-bold">{{ doc.content_type }}</div></div>
            <div><div class="tw-text-xs tw-text-gray-500">Owner</div><div class="tw-font-bold">{{ doc.content_owner }}</div></div>
            <div><div class="tw-text-xs tw-text-gray-500">Status Konfirmasi</div>
              <q-badge :color="doc.content_statuskeeper == 1 ? 'green-6' : doc.content_statuskeeper == 2 ? 'red-6' : 'grey-6'"
                :label="doc.content_statuskeeper == 1 ? 'Confirmed' : doc.content_statuskeeper == 2 ? 'Rejected' : 'Pending'" />
            </div>
          </div>
          <q-input v-if="doc.content_statuskeeper == 0" v-model="reason" outlined type="textarea" label="Alasan (wajib jika menolak)" rows="3" class="tw-rounded-lg" />
          <div v-else class="tw-text-center tw-py-4 tw-text-gray-500">Konfirmasi sudah diproses sebelumnya.</div>
        </q-card-section>
        <q-card-actions v-if="doc.content_statuskeeper == 0" align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Tolak" color="red-6" push icon="cancel" @click="submit('reject')" :loading="saving" />
          <q-btn label="Konfirmasi" color="green-6" push icon="check_circle" @click="submit('confirm')" :loading="saving" />
        </q-card-actions>
      </template>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useNotify } from "../../../composables/useNotify";
import { useRoute, useRouter } from "vue-router";

const { success, error } = useNotify();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const doc = ref(null);
const reason = ref('');
const contentId = route.query.noedit;
const keeperNik = route.query.pic;

const submit = async (action) => {
  if (action === 'reject' && !reason.value) return error('Alasan penolakan wajib diisi');
  saving.value = true;
  try {
    const endpoint = action === 'confirm' ? 'document/keeper/confirm' : 'document/keeper/reject';
    await axios.post(`${import.meta.env.VITE_API}${endpoint}`, { content_id: contentId, keeper_nik: keeperNik, reason: reason.value });
    success(action === 'confirm' ? 'Berhasil dikonfirmasi' : 'Berhasil ditolak');
    router.push({ path: '/wjs/document' });
  } catch (e) { error(e.response?.data?.message || 'Gagal memproses'); } finally { saving.value = false; }
};

onMounted(async () => {
  if (!contentId) { loading.value = false; return; }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/document/files/${contentId}`);
    doc.value = res.data.data;
  } catch { doc.value = null; } finally { loading.value = false; }
});
</script>

