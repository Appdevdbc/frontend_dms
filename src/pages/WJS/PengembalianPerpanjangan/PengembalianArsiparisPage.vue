<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-5`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-btn flat round icon="arrow_back" color="white" @click="router.back()" />
          <div class="text-h6 tw-text-white tw-font-bold">Konfirmasi Pengembalian (Arsiparis)</div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" v-if="tiketData">
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-6 tw-p-4 tw-bg-purple-50 tw-rounded-xl">
          <div><div class="tw-text-xs tw-text-gray-500">Nomor Tiket</div><div class="tw-font-bold">{{ tiketData.pinjam_no_tiket }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Nama Dokumen</div><div class="tw-font-bold">{{ tiketData.pinjam_nama_doc }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Kondisi Dokumen</div>
            <q-badge :color="tiketData.pinjam_kondisi_dokumen === 'rusak' ? 'red-6' : 'green-6'" :label="tiketData.pinjam_kondisi_dokumen || 'baik'" />
          </div>
          <div><div class="tw-text-xs tw-text-gray-500">Catatan Peminjam</div><div class="tw-font-bold">{{ tiketData.pinjam_notes || '-' }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Alasan Terlambat</div><div class="tw-font-bold">{{ tiketData.pinjam_alasan_terlambat || '-' }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Tgl Pengembalian</div><div class="tw-font-bold">{{ formatDateDMY(tiketData.kembali_tgl) }}</div></div>
        </div>

        <!-- File BAST dari user -->
        <div class="tw-mb-4" v-if="bastFiles.length > 0">
          <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">File BAST dari Peminjam</div>
          <div class="tw-flex tw-gap-2 tw-flex-wrap">
            <q-btn v-for="(f, i) in bastFiles" :key="i" outline color="blue-6" :label="`File ${i+1}`" icon="download" size="sm" @click="downloadFile(f)" />
          </div>
        </div>

        <div class="tw-grid tw-grid-cols-1 tw-gap-4">
          <q-input v-model="form.catatan" outlined type="textarea" label="Catatan Arsiparis" rows="3" class="tw-rounded-lg">
            <template v-slot:prepend><q-icon name="notes" color="purple-6" /></template>
          </q-input>
          <div>
            <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">Upload BAST Arsiparis (opsional)</div>
            <q-file v-model="file5" outlined accept=".pdf,.jpg,.jpeg,.png" label="Pilih File BAST Arsiparis" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
            </q-file>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn label="Batal" color="grey-6" push icon="close" class="tw-px-6" @click="router.back()" />
        <q-btn label="Tolak" color="red-6" push icon="cancel" class="tw-px-6" @click="showTolakDialog = true" :loading="saving" />
        <q-btn label="Konfirmasi Diterima" color="green-6" push icon="check_circle" class="tw-px-6" @click="approve" :loading="saving" />
      </q-card-actions>
    </q-card>

    <!-- Dialog Tolak -->
    <q-dialog v-model="showTolakDialog">
      <q-card style="min-width:400px">
        <q-card-section class="bg-red-6 text-white"><div class="text-h6">Tolak Pengembalian</div></q-card-section>
        <q-card-section>
          <q-input v-model="alasanTolak" outlined type="textarea" label="Alasan Penolakan *" rows="3" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="red-6" label="Tolak" @click="tolak" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { domain, empid, formatDateDMY } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { useRouter, useRoute } from "vue-router";

const { success, error } = useNotify();
const router = useRouter();
const route = useRoute();
const tiketData = ref(null);
const saving = ref(false);
const file5 = ref(null);
const showTolakDialog = ref(false);
const alasanTolak = ref('');
const form = ref({ catatan: '' });

const bastFiles = computed(() => {
  if (!tiketData.value) return [];
  return [1,2,3,4].map(i => tiketData.value[`kembali_upload_file${i}`]).filter(Boolean);
});

const downloadFile = (filename) => window.open(`${import.meta.env.VITE_API}uploads/permintaan/kembali/${filename}`, '_blank');

const loadTiket = async () => {
  try {
    const res = await axios.get(`/dms/pengembalian-perpanjangan/detail`, { params: { no_tiket: route.query.tiket } });
    tiketData.value = res.data.data;
  } catch (e) { error('Gagal memuat data tiket'); }
};

const approve = async () => {
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('creator', empid());
    fd.append('no_tiket', tiketData.value.pinjam_no_tiket);
    fd.append('id', tiketData.value.id);
    fd.append('catatan', form.value.catatan);
    if (file5.value) fd.append('kembali_upload_file5', file5.value);
    await axios.post(`/dms/pengembalian-perpanjangan/pengembalian/approve`, fd);
    success('Pengembalian berhasil dikonfirmasi');
    router.push({ path: '/dms/pengembalian-perpanjangan' });
  } catch (e) { error(e.response?.data?.message || 'Gagal konfirmasi'); } finally { saving.value = false; }
};

const tolak = async () => {
  if (!alasanTolak.value) return error('Alasan tolak wajib diisi');
  saving.value = true;
  try {
    await axios.post(`/dms/pengembalian-perpanjangan/pengembalian/tolak`, {
      creator: empid(), no_tiket: tiketData.value.pinjam_no_tiket, id: tiketData.value.id, alasan_tolak: alasanTolak.value,
    });
    success('Pengembalian ditolak');
    router.push({ path: '/dms/pengembalian-perpanjangan' });
  } catch (e) { error(e.response?.data?.message || 'Gagal tolak'); } finally { saving.value = false; }
};

onMounted(loadTiket);
</script>


