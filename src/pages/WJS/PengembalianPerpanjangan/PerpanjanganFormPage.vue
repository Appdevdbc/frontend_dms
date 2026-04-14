<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-5`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-btn flat round icon="arrow_back" color="white" @click="router.back()" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Form Perpanjangan Peminjaman</div>
            <q-badge v-if="tiketData" color="white" text-color="blue-8" :label="`Perpanjangan ke-${(tiketData.perpanjang_qty || 0) + 1}`" class="tw-mt-1" />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" v-if="tiketData">
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-xl">
          <div><div class="tw-text-xs tw-text-gray-500">Nomor Tiket</div><div class="tw-font-bold">{{ tiketData.pinjam_no_tiket }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Nama Dokumen</div><div class="tw-font-bold">{{ tiketData.pinjam_nama_doc }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Tgl Kembali Saat Ini</div><div class="tw-font-bold tw-text-orange-600">{{ formatDateDMY(tiketData.pinjam_tgl_est_kembali_to) }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Sisa Perpanjangan</div>
            <q-badge :color="sisaPerpanjangan > 0 ? 'green-6' : 'red-6'" :label="`${sisaPerpanjangan}x lagi`" />
          </div>
        </div>

        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
          <q-input v-model="form.perpanjang_mulai_tgl" outlined label="Tanggal Mulai Perpanjangan *" mask="####-##-##" placeholder="YYYY-MM-DD" class="tw-rounded-lg">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.perpanjang_mulai_tgl" mask="YYYY-MM-DD"><div class="row items-center justify-end"><q-btn v-close-popup label="Close" color="primary" flat /></div></q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input v-model="form.perpanjang_sampai_tgl" outlined label="Tanggal Sampai Perpanjangan *" mask="####-##-##" placeholder="YYYY-MM-DD" class="tw-rounded-lg">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.perpanjang_sampai_tgl" mask="YYYY-MM-DD"><div class="row items-center justify-end"><q-btn v-close-popup label="Close" color="primary" flat /></div></q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="md:tw-col-span-2">
            <q-input v-model="form.alasan_perpanjang" outlined type="textarea" label="Alasan Perpanjangan *" rows="3" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="notes" color="blue-6" /></template>
            </q-input>
          </div>
          <div class="md:tw-col-span-2">
            <q-input v-model="form.panjang1_ket_user" outlined type="textarea" label="Catatan Tambahan" rows="2" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="comment" color="blue-6" /></template>
            </q-input>
          </div>
          <div class="md:tw-col-span-2">
            <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">Upload Lampiran (opsional)</div>
            <q-file v-model="fileLampiran" outlined accept=".pdf,.jpg,.jpeg,.png" label="Pilih File Lampiran" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="attach_file" color="blue-6" /></template>
            </q-file>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn label="Batal" color="red-7" push icon="close" class="tw-px-6" @click="router.back()" />
        <q-btn label="Ajukan Perpanjangan" color="blue-6" push icon="update" class="tw-px-6" @click="submit" :loading="saving" />
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
const fileLampiran = ref(null);
const form = ref({ perpanjang_mulai_tgl: '', perpanjang_sampai_tgl: '', alasan_perpanjang: '', panjang1_ket_user: '' });

const sisaPerpanjangan = computed(() => 2 - (tiketData.value?.perpanjang_qty || 0));

const loadTiket = async () => {
  try {
    const res = await axios.get(`/dms/pengembalian-perpanjangan/detail`, { params: { no_tiket: route.query.tiket } });
    tiketData.value = res.data.data;
    // Default mulai dari tgl kembali saat ini
    if (tiketData.value?.pinjam_tgl_est_kembali_to) {
      form.value.perpanjang_mulai_tgl = dayjs(tiketData.value.pinjam_tgl_est_kembali_to).format('YYYY-MM-DD');
    }
  } catch (e) { error('Gagal memuat data tiket'); }
};

const submit = async () => {
  if (!form.value.perpanjang_mulai_tgl || !form.value.perpanjang_sampai_tgl) return error('Tanggal perpanjangan wajib diisi');
  if (!form.value.alasan_perpanjang) return error('Alasan perpanjangan wajib diisi');
  if (dayjs(form.value.perpanjang_sampai_tgl).isBefore(dayjs(form.value.perpanjang_mulai_tgl))) return error('Tanggal sampai harus setelah tanggal mulai');
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('creator', empid());
    fd.append('no_tiket', tiketData.value.pinjam_no_tiket);
    fd.append('id', tiketData.value.id);
    fd.append('alasan_perpanjang', form.value.alasan_perpanjang);
    fd.append('perpanjang_mulai_tgl', form.value.perpanjang_mulai_tgl);
    fd.append('perpanjang_sampai_tgl', form.value.perpanjang_sampai_tgl);
    fd.append('panjang1_ket_user', form.value.panjang1_ket_user);
    if (fileLampiran.value) fd.append('perpanjang_upload_file1', fileLampiran.value);
    await axios.post(`/dms/pengembalian-perpanjangan/perpanjangan`, fd);
    success('Perpanjangan berhasil diajukan');
    router.push({ path: '/dms/pengembalian-perpanjangan' });
  } catch (e) { error(e.response?.data?.message || 'Gagal ajukan perpanjangan'); } finally { saving.value = false; }
};

onMounted(loadTiket);
</script>


