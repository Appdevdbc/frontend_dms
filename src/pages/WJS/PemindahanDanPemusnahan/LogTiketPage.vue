<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="history" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Log Tiket Pemindahan & Penghapusan Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Pemindahan & Penghapusan</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Log Tiket</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div class="tw-max-w-4xl tw-mx-auto">
          <!-- Info Banner -->
          <div class="tw-mb-6">
            <q-banner rounded class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm">
              <template v-slot:avatar>
                <q-icon name="info" color="blue" size="24px"/>
              </template>
              <span class="tw-text-blue-700 tw-font-medium">
                Masukkan nomor tiket untuk melihat riwayat proses approval
              </span>
            </q-banner>
          </div>

          <!-- Search Form -->
          <div class="tw-mb-6">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-input
                  v-model="noTiket"
                  outlined
                  label="Nomor Tiket"
                  placeholder="Masukkan nomor tiket..."
                  @keyup.enter="searchLog"
                >
                  <template v-slot:prepend>
                    <q-icon name="confirmation_number" color="blue-6"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-btn
                  unelevated
                  color="blue-6"
                  label="Tampilkan"
                  icon="search"
                  class="tw-w-full tw-h-full tw-font-semibold"
                  @click="searchLog"
                  :loading="loading"
                />
              </div>
            </div>
          </div>

          <!-- Ticket Info (shown after search) -->
          <div v-if="ticketInfo" class="tw-mb-6">
            <q-card flat bordered class="tw-bg-slate-50">
              <q-card-section>
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                  <div>
                    <div class="tw-text-sm tw-text-slate-600 tw-mb-1">Nomor Tiket</div>
                    <div class="tw-font-semibold tw-text-slate-800">{{ ticketInfo.no_tiket }}</div>
                  </div>
                  <div>
                    <div class="tw-text-sm tw-text-slate-600 tw-mb-1">Jenis</div>
                    <div class="tw-font-semibold tw-text-slate-800">{{ ticketInfo.jenis }}</div>
                  </div>
                  <div>
                    <div class="tw-text-sm tw-text-slate-600 tw-mb-1">Status</div>
                    <q-badge 
                      :color="getStatusColor(ticketInfo.status)" 
                      :label="ticketInfo.status_text"
                      class="tw-px-3 tw-py-1"
                    />
                  </div>
                  <div>
                    <div class="tw-text-sm tw-text-slate-600 tw-mb-1">Tanggal Pengajuan</div>
                    <div class="tw-font-semibold tw-text-slate-800">{{ formatDate(ticketInfo.tgl_pengajuan) }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Logs Timeline -->
          <div v-if="logs.length > 0" class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <div class="tw-flex tw-items-center tw-gap-2">
                <q-icon name="timeline" color="blue-6" size="24px"/>
                <div class="text-h6 tw-text-slate-700 tw-font-bold">Riwayat Proses</div>
              </div>
              <q-btn
                unelevated
                color="green-6"
                label="Export Excel"
                icon="download"
                size="sm"
                @click="exportToExcel"
                :loading="exporting"
              />
            </div>

            <q-timeline color="blue-6">
              <q-timeline-entry
                v-for="(log, index) in logs"
                :key="index"
                :title="log.trs_log_proses"
                :subtitle="formatDateTime(log.trs_log_tgl)"
                :icon="getLogIcon(log.trs_log_status)"
                :color="getLogColor(log.trs_log_status)"
              >
                <div class="tw-text-sm tw-text-slate-600">
                  <div><strong>PIC:</strong> {{ log.account_name || '-' }}</div>
                  <div><strong>Hasil:</strong> {{ log.trs_log_hasil }}</div>
                  <div v-if="log.trs_log_catatan"><strong>Catatan:</strong> {{ log.trs_log_catatan }}</div>
                  <div v-if="log.trs_log_reason_revisi" class="tw-text-red-600">
                    <strong>Alasan Penolakan:</strong> {{ log.trs_log_reason_revisi }}
                  </div>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </div>

          <!-- Empty State -->
          <div v-if="searched && logs.length === 0" class="tw-text-center tw-py-12">
            <q-icon name="search_off" size="64px" color="grey-5"/>
            <div class="tw-text-slate-600 tw-mt-4">Tidak ada data log untuk tiket ini</div>
          </div>

          <!-- Action Buttons -->
          <div class="tw-flex tw-gap-3 tw-justify-end tw-mt-6">
            <q-btn 
              label="Kembali" 
              color="blue-7" 
              push
              icon="arrow_back"
              class="tw-px-6 tw-font-semibold"
              @click="$router.push('/')"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const { success, error: showError } = useNotify();

const noTiket = ref('');
const ticketInfo = ref(null);
const logs = ref([]);
const loading = ref(false);
const exporting = ref(false);
const searched = ref(false);

const getStatusColor = (status) => {
  if (status === 3) return 'red';
  if (status === 9) return 'green';
  if (status === 8) return 'purple';
  if (status === 2) return 'orange';
  return 'blue';
};

const getLogIcon = (status) => {
  if (status === 3) return 'cancel';
  if (status === 9) return 'check_circle';
  return 'pending';
};

const getLogColor = (status) => {
  if (status === 3) return 'red';
  if (status === 9) return 'green';
  return 'blue';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const searchLog = async () => {
  if (!noTiket.value) {
    showError('Nomor tiket wajib diisi');
    return;
  }

  try {
    loading.value = true;
    searched.value = true;

    const res = await axios.get(`${import.meta.env.VITE_API}dms/log-tiket-pemusnahan-mutasi`, {
      params: { no_tiket: noTiket.value },
      skipErrorInterceptor: true
    });

    ticketInfo.value = res.data.data.ticket;
    logs.value = res.data.data.logs;

    loading.value = false;
  } catch (error) {
    loading.value = false;
    ticketInfo.value = null;
    logs.value = [];
    showError(error?.response?.data?.message || 'Gagal memuat data log');
  }
};

const exportToExcel = async () => {
  if (!noTiket.value) {
    showError('Nomor tiket wajib diisi');
    return;
  }

  try {
    exporting.value = true;

    const res = await axios.get(`${import.meta.env.VITE_API}dms/log-tiket-pemusnahan-mutasi/export`, {
      params: { no_tiket: noTiket.value },
      responseType: 'blob',
      skipErrorInterceptor: true
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Log_Tiket_${noTiket.value}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    exporting.value = false;
    success('File Excel berhasil didownload');
  } catch (error) {
    exporting.value = false;
    showError(error?.response?.data?.message || 'Gagal export Excel');
  }
};
</script>


