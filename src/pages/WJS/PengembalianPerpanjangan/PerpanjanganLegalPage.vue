<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-5`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-btn flat round icon="arrow_back" color="white" @click="router.back()" />
          <div class="text-h6 tw-text-white tw-font-bold">Approval Perpanjangan — Corp Legal SH</div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" v-if="tiketData">
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-6 tw-p-4 tw-bg-teal-50 tw-rounded-xl">
          <div><div class="tw-text-xs tw-text-gray-500">Nomor Tiket</div><div class="tw-font-bold">{{ tiketData.pinjam_no_tiket }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Nama Dokumen</div><div class="tw-font-bold">{{ tiketData.pinjam_nama_doc }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Alasan Perpanjangan</div><div class="tw-font-bold">{{ tiketData.pinjam_alasan_perpanjang }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Catatan Atasan User</div><div class="tw-font-bold">{{ tiketData.panjang1_ket_atasan_user || '-' }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Tgl Mulai Perpanjangan</div><div class="tw-font-bold">{{ formatDateDMY(tiketData.perpanjang_mulai_tgl) }}</div></div>
          <div><div class="tw-text-xs tw-text-gray-500">Tgl Sampai Perpanjangan</div><div class="tw-font-bold">{{ formatDateDMY(tiketData.perpanjang_sampai_tgl) }}</div></div>
        </div>
        <q-input v-model="catatan" outlined type="textarea" label="Catatan Corp Legal SH" rows="3" class="tw-rounded-lg">
          <template v-slot:prepend><q-icon name="gavel" color="teal-6" /></template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn label="Batal" color="grey-6" push icon="close" class="tw-px-6" @click="router.back()" />
        <q-btn label="Tolak" color="red-6" push icon="cancel" class="tw-px-6" @click="tolak" :loading="saving" />
        <q-btn label="Approve" color="green-6" push icon="check_circle" class="tw-px-6" @click="approve" :loading="saving" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { domain, empid, formatDateDMY } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { useRouter, useRoute } from "vue-router";

const { success, error } = useNotify();
const router = useRouter();
const route = useRoute();
const tiketData = ref(null);
const saving = ref(false);
const catatan = ref('');

const loadTiket = async () => {
  try {
    const res = await axios.get(`/dms/pengembalian-perpanjangan/detail`, { params: { no_tiket: route.query.tiket } });
    tiketData.value = res.data.data;
  } catch (e) { error('Gagal memuat data tiket'); }
};

const buildPayload = () => ({ creator: empid(), no_tiket: tiketData.value.pinjam_no_tiket, id: tiketData.value.id, panjang1_ket_corp_legal: catatan.value });

const approve = async () => {
  saving.value = true;
  try {
    await axios.post(`/dms/pengembalian-perpanjangan/perpanjangan/legal/approve`, buildPayload());
    success('Perpanjangan diapprove');
    router.push({ path: '/dms/pengembalian-perpanjangan' });
  } catch (e) { error(e.response?.data?.message || 'Gagal approve'); } finally { saving.value = false; }
};

const tolak = async () => {
  if (!catatan.value) return error('Catatan penolakan wajib diisi');
  saving.value = true;
  try {
    await axios.post(`/dms/pengembalian-perpanjangan/perpanjangan/legal/tolak`, buildPayload());
    success('Perpanjangan ditolak');
    router.push({ path: '/dms/pengembalian-perpanjangan' });
  } catch (e) { error(e.response?.data?.message || 'Gagal tolak'); } finally { saving.value = false; }
};

onMounted(loadTiket);
</script>


