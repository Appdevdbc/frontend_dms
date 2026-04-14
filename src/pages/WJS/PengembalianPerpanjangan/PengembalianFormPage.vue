<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-5`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-btn flat round icon="arrow_back" color="white" @click="router.back()" />
          <div class="text-h6 tw-text-white tw-font-bold">Form Pengembalian Dokumen</div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" v-if="tiketData">
        <!-- Info Tiket -->
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-xl">
          <div><div class="tw-text-xs tw-text-gray-500">Nomor Tiket</div><div class="tw-font-bold">{{ tiketData.pinjam_no_tiket }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Nama Dokumen</div><div class="tw-font-bold">{{ tiketData.pinjam_nama_doc }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Kode Arsip</div><div class="tw-font-bold">{{ tiketData.arsip_no }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Lokasi Arsip</div><div class="tw-font-bold">{{ tiketData.lokasi_arsip_name }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Tgl Est. Kembali</div><div class="tw-font-bold">{{ formatDateDMY(tiketData.pinjam_tgl_est_kembali_to) }}</div></div>
          <div>
            <div class="tw-text-xs tw-text-gray-500">Status Keterlambatan</div>
            <q-badge :color="hariTerlambat > 0 ? 'red-6' : 'green-6'" :label="hariTerlambat > 0 ? `Terlambat ${hariTerlambat} hari` : 'Tepat Waktu'" />
          </div>
        </div>

        <!-- Form Input -->
        <div class="tw-grid tw-grid-cols-1 tw-gap-4">
          <div>
            <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">Kondisi Dokumen <span class="tw-text-red-500">*</span></div>
            <q-option-group v-model="form.kondisi_dokumen" :options="[{label:'Baik',value:'baik'},{label:'Rusak',value:'rusak'}]" color="blue-6" inline />
          </div>
          <q-input v-if="form.kondisi_dokumen === 'rusak'" v-model="form.notes" outlined type="textarea" label="Keterangan Kondisi Rusak *" rows="3" class="tw-rounded-lg">
            <template v-slot:prepend><q-icon name="notes" color="blue-6" /></template>
          </q-input>
          <q-input v-if="hariTerlambat > 0" v-model="form.alasan_terlambat" outlined type="textarea" label="Alasan Keterlambatan *" rows="3" class="tw-rounded-lg">
            <template v-slot:prepend><q-icon name="warning" color="orange-6" /></template>
          </q-input>
          <div>
            <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">Upload BAST Pengembalian (maks. 4 file)</div>
            <q-file v-model="files" outlined multiple accept=".pdf,.jpg,.jpeg,.png" max-files="4" label="Pilih File BAST" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="attach_file" color="blue-6" /></template>
            </q-file>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn label="Batal" color="red-7" push icon="close" class="tw-px-6" @click="router.back()" />
        <q-btn label="Submit Pengembalian" color="green-6" push icon="assignment_return" class="tw-px-6" @click="submit" :loading="saving" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import { domain, empid, formatDateDMY } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { useRouter, useRoute } from "vue-router";

const { success, error } = useNotify();
const router = useRouter();
const route = useRoute();
const tiketData = ref(null);
const saving = ref(false);
const files = ref([]);
const form = ref({ kondisi_dokumen: 'baik', notes: '', alasan_terlambat: '' });

const hariTerlambat = computed(() => {
  if (!tiketData.value?.pinjam_tgl_est_kembali_to) return 0;
  const diff = dayjs().diff(dayjs(tiketData.value.pinjam_tgl_est_kembali_to), 'day');
  return diff > 0 ? diff : 0;
});

const loadTiket = async () => {
  try {
    const res = await axios.get(`/dms/pengembalian-perpanjangan/detail`, {
      params: { no_tiket: route.query.tiket }
    });
    tiketData.value = res.data.data;
  } catch (e) { error('Gagal memuat data tiket'); }
};

const submit = async () => {
  if (form.value.kondisi_dokumen === 'rusak' && !form.value.notes) return error('Keterangan kondisi rusak wajib diisi');
  if (hariTerlambat.value > 0 && !form.value.alasan_terlambat) return error('Alasan keterlambatan wajib diisi');
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('creator', empid());
    fd.append('no_tiket', tiketData.value.pinjam_no_tiket);
    fd.append('id', tiketData.value.id);
    fd.append('kondisi_dokumen', form.value.kondisi_dokumen);
    fd.append('notes', form.value.notes);
    fd.append('alasan_terlambat', form.value.alasan_terlambat);
    if (files.value) {
      (Array.isArray(files.value) ? files.value : [files.value]).forEach((f, i) => {
        fd.append(`kembali_upload_file${i + 1}`, f);
      });
    }
    await axios.post(`/dms/pengembalian-perpanjangan/pengembalian`, fd);
    success('Pengembalian berhasil disubmit');
    router.push({ path: '/dms/pengembalian-perpanjangan' });
  } catch (e) {
    error(e.response?.data?.message || 'Gagal submit pengembalian');
  } finally { saving.value = false; }
};

onMounted(loadTiket);
</script>


