<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-5`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-btn flat round icon="arrow_back" color="white" @click="router.back()" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Log Tiket Peminjaman</div>
            <div class="tw-text-blue-100 tw-text-xs tw-mt-1" v-if="inputTiket">{{ inputTiket }}</div>
          </div>
        </div>
      </q-card-section>

      <!-- Search Bar -->
      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-flex tw-gap-3 tw-items-end">
          <q-input
            outlined
            dense
            v-model="inputTiket"
            label="Nomor Tiket"
            placeholder="Masukkan nomor tiket..."
            class="tw-bg-white tw-rounded-lg tw-flex-1 tw-max-w-sm"
            @keyup.enter="loadLog"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="confirmation_number" color="blue-6" />
            </template>
          </q-input>
          <q-btn
            unelevated
            color="blue-6"
            label="Tampilkan"
            icon="search"
            class="tw-font-semibold tw-px-5 tw-rounded-lg"
            @click="loadLog"
            :loading="loading"
          />
          <q-btn
            outline
            color="grey-6"
            label="Reset"
            icon="refresh"
            class="tw-px-4 tw-rounded-lg"
            @click="reset"
          />
        </div>
      </q-card-section>

      <q-separator class="tw-opacity-20" />

      <q-card-section class="tw-p-6">
        <!-- Placeholder sebelum search -->
        <div v-if="!hasSearched" class="tw-text-center tw-py-16 tw-text-gray-400">
          <q-icon name="manage_search" size="56px" class="tw-mb-3 tw-opacity-40" />
          <div class="tw-text-base">Masukkan nomor tiket lalu klik <strong>Tampilkan</strong></div>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="tw-flex tw-justify-center tw-py-12">
          <q-spinner-dots color="blue-6" size="40px" />
        </div>

        <!-- Tidak ditemukan -->
        <div v-else-if="logs.length === 0" class="tw-text-center tw-py-12 tw-text-gray-400">
          <q-icon name="history_toggle_off" size="48px" class="tw-mb-2" />
          <div>Tidak ada log untuk tiket <strong>{{ inputTiket }}</strong></div>
        </div>

        <template v-else>
          <!-- Info Tiket -->
          <div v-if="tiketInfo" class="tw-p-4 tw-bg-blue-50 tw-rounded-xl tw-mb-6 tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-4">
            <div>
              <div class="tw-text-xs tw-text-gray-500">Nomor Tiket</div>
              <div class="tw-font-bold">{{ tiketInfo.pinjam_no_tiket }}</div>
            </div>
            <div>
              <div class="tw-text-xs tw-text-gray-500">Nama Dokumen</div>
              <div class="tw-font-bold">{{ tiketInfo.pinjam_nama_doc }}</div>
            </div>
            <div>
              <div class="tw-text-xs tw-text-gray-500">Aktivitas</div>
              <div class="tw-font-bold">{{ tiketInfo.pinjam_aktivitas }}</div>
            </div>
            <div>
              <div class="tw-text-xs tw-text-gray-500">Status Saat Ini</div>
              <q-badge :color="getStatusColor(tiketInfo.pinjam_status)" :label="tiketInfo.pinjam_status" class="tw-px-2 tw-py-1 tw-rounded-full tw-text-xs" />
            </div>
            <div>
              <div class="tw-text-xs tw-text-gray-500">Tgl Permintaan</div>
              <div class="tw-font-bold">{{ formatDateDMY(tiketInfo.pinjam_tgl_create) }}</div>
            </div>
            <div>
              <div class="tw-text-xs tw-text-gray-500">Tgl Est. Kembali</div>
              <div class="tw-font-bold">{{ formatDateDMY(tiketInfo.pinjam_tgl_est_kembali_to) }}</div>
            </div>
          </div>

          <!-- Timeline Log -->
          <q-timeline color="blue-6" layout="comfortable">
            <q-timeline-entry
              v-for="(log, index) in logs"
              :key="index"
              :title="log.trs_log_proses"
              :subtitle="formatDateDMYHM(log.trs_log_tgl)"
              :icon="getLogIcon(log.trs_log_proses)"
              :color="getLogColor(log.trs_log_proses)"
            >
              <div class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-4">
                <div class="tw-flex tw-flex-wrap tw-gap-4 tw-mb-3">
                  <div>
                    <div class="tw-text-xs tw-text-gray-500">PIC</div>
                    <div class="tw-font-semibold tw-text-slate-700">{{ log.employee_name || log.account_name || log.trs_log_pic }}</div>
                  </div>
                  <div v-if="log.employee_jabatan || log.pic_jabatan">
                    <div class="tw-text-xs tw-text-gray-500">Jabatan</div>
                    <div class="tw-font-semibold tw-text-slate-700">{{ log.employee_jabatan || log.pic_jabatan }}</div>
                  </div>
                  <div>
                    <div class="tw-text-xs tw-text-gray-500">Hasil</div>
                    <div class="tw-font-semibold tw-text-slate-700">{{ log.trs_log_hasil }}</div>
                  </div>
                </div>
                <div v-if="log.trs_log_catatan" class="tw-text-sm tw-text-gray-600 tw-bg-gray-50 tw-rounded-lg tw-p-3">
                  <span class="tw-font-semibold">Catatan:</span> {{ log.trs_log_catatan }}
                </div>
                <div v-if="log.trs_log_reason_revisi" class="tw-text-sm tw-text-orange-700 tw-bg-orange-50 tw-rounded-lg tw-p-3 tw-mt-2">
                  <span class="tw-font-semibold">Alasan Revisi/Tolak:</span> {{ log.trs_log_reason_revisi }}
                </div>
              </div>
            </q-timeline-entry>
          </q-timeline>
        </template>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { domain, formatDateDMY, formatDateDMYHM } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { useRouter, useRoute } from "vue-router";

const { error } = useNotify();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const hasSearched = ref(false);
const logs = ref([]);
const tiketInfo = ref(null);
// Pre-fill dari query param jika ada (navigasi dari halaman lain)
const inputTiket = ref(route.query.tiket || route.params.tiket || '');

const getStatusColor = (status) => {
  const map = {
    'Peminjaman Berhasil': 'green-6',
    'Peminjaman Berakhir': 'grey-6',
    'Kembali Arsiparis': 'purple-6',
    'Perpanjangan Approval Atasan User': 'orange-6',
    'Perpanjangan Approval Legal': 'teal-6',
    'Perpanjangan Approval Atasan Legal': 'indigo-6',
    'Tolak': 'red-6',
  };
  return map[status] || 'blue-6';
};

const getLogIcon = (proses) => {
  if (!proses) return 'radio_button_unchecked';
  const p = proses.toLowerCase();
  if (p.includes('tolak') || p.includes('ditolak')) return 'cancel';
  if (p.includes('revisi')) return 'edit_note';
  if (p.includes('approve') || p.includes('konfirmasi') || p.includes('selesai')) return 'check_circle';
  if (p.includes('submit') || p.includes('pembuatan')) return 'add_circle';
  return 'radio_button_unchecked';
};

const getLogColor = (proses) => {
  if (!proses) return 'blue-6';
  const p = proses.toLowerCase();
  if (p.includes('tolak') || p.includes('ditolak')) return 'red-6';
  if (p.includes('revisi')) return 'orange-6';
  if (p.includes('approve') || p.includes('konfirmasi') || p.includes('selesai')) return 'green-6';
  return 'blue-6';
};

const loadLog = async () => {
  if (!inputTiket.value?.trim()) return error('Nomor tiket wajib diisi');
  loading.value = true;
  hasSearched.value = true;
  logs.value = [];
  tiketInfo.value = null;
  try {
    const res = await axios.get(`/dms/getLogTiket`, {
      params: { no_tiket: inputTiket.value.trim() }
    });
    const data = Array.isArray(res.data) ? res.data : [];
    logs.value = data;
    if (data.length > 0) {
      tiketInfo.value = {
        pinjam_no_tiket: data[0].pinjam_no_tiket,
        pinjam_nama_doc: data[0].pinjam_nama_doc,
        pinjam_aktivitas: data[0].pinjam_aktivitas,
        pinjam_status: data[0].pinjam_status,
        pinjam_tgl_create: data[0].pinjam_tgl_create,
        pinjam_tgl_est_kembali_to: data[0].pinjam_tgl_est_kembali_to,
      };
    }
  } catch (e) {
    error(e.response?.data?.message || 'Gagal memuat log tiket');
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  inputTiket.value = '';
  logs.value = [];
  tiketInfo.value = null;
  hasSearched.value = false;
};

// Auto-load jika ada query param dari navigasi halaman lain
onMounted(() => {
  if (inputTiket.value) loadLog();
});
</script>


