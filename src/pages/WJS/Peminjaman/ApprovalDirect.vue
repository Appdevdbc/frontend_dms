<template>
  <div class="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-py-8">
    <div class="tw-max-w-6xl tw-mx-auto tw-px-4">

      <!-- Loading State -->
      <div v-if="loading" class="tw-text-center tw-py-20">
        <q-spinner color="blue-6" size="60px" />
        <p class="tw-mt-6 tw-text-slate-600 tw-text-lg">Memuat data approval...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="tw-max-w-2xl tw-mx-auto">
        <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
          <q-card-section class="tw-bg-red-600 tw-text-white tw-py-6">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="error" size="32px"/>
              <div class="text-h5 tw-font-bold">Akses Ditolak</div>
            </div>
          </q-card-section>
          <q-card-section class="tw-p-8 tw-text-center">
            <q-icon name="block" color="red" size="80px" class="tw-mb-4"/>
            <div class="text-h6 tw-text-slate-800 tw-font-bold tw-mb-2">{{ errorMessage }}</div>
            <p class="tw-text-slate-600">Silahkan tutup halaman ini</p>
          </q-card-section>
        </q-card>
      </div>

      <!-- Success State (After Action) -->
      <div v-else-if="actionCompleted" class="tw-max-w-2xl tw-mx-auto">
        <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
          <q-card-section class="tw-bg-green-600 tw-text-white tw-py-6">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="check_circle" size="32px"/>
              <div class="text-h5 tw-font-bold">Berhasil</div>
            </div>
          </q-card-section>
          <q-card-section class="tw-p-8 tw-text-center">
            <q-icon name="task_alt" color="green" size="80px" class="tw-mb-4"/>
            <div class="text-h6 tw-text-slate-800 tw-font-bold tw-mb-2">{{ successMessage }}</div>
            <p class="tw-text-slate-600 tw-mb-6">Silahkan tutup halaman ini</p>
            <q-linear-progress :value="countdown / 5" color="green" class="tw-rounded-full" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Approval Form -->
      <div v-else-if="ticketData">
        <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">

          <!-- Header -->
          <q-card-section class="tw-bg-gradient-to-r tw-from-blue-900 tw-to-blue-700 tw-text-white tw-py-6">
            <div class="tw-flex tw-items-center tw-justify-between">
              <div class="tw-flex tw-items-center tw-gap-3">
                <q-icon name="approval" size="32px"/>
                <div>
                  <div class="text-h5 tw-font-bold">Approval Permintaan Dokumen</div>
                  <div class="tw-text-blue-100 tw-text-sm tw-mt-1">{{ approverInfo.role }}</div>
                </div>
              </div>
              <div class="tw-text-right">
                <div class="tw-text-blue-100 tw-text-xs">Approver</div>
                <div class="tw-font-semibold">{{ approverInfo.name }}</div>
              </div>
            </div>
          </q-card-section>

          <!-- Ticket Info Banner -->
          <q-card-section class="tw-bg-blue-50 tw-border-b tw-border-blue-100">
            <div class="tw-flex tw-items-center tw-justify-between">
              <div>
                <div class="tw-text-blue-900 tw-font-bold tw-text-xl">{{ ticketData.pinjam_no_tiket }}</div>
                <div class="tw-text-blue-700 tw-text-sm tw-mt-1">Status: {{ ticketData.pinjam_status }}</div>
              </div>
              <q-badge :color="getStatusColor(ticketData.pinjam_status)" class="tw-px-4 tw-py-2 tw-text-sm">
                {{ ticketData.pinjam_status }}
              </q-badge>
            </div>
          </q-card-section>

          <!-- Document & Requester Info -->
          <q-card-section class="tw-p-6">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="description" color="blue-6"/>
              Informasi Dokumen
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Nama Dokumen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.nama_dokumen || ticketData.pinjam_nama_doc }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Nomor Dokumen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.nomor_dokumen || ticketData.pinjam_nomor_doc }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Nomor Arsip</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.nomor_arsip }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Aktivitas</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.pinjam_aktivitas }}</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Kategori Dokumen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.arsip_kat }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Kategori Keamanan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.kategori_keamanan }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Lokasi Penyimpanan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.pinjam_lokasi_arsip }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Alasan Peminjaman</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.pinjam_alasan_pinjam }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Requester Info -->
          <q-card-section class="tw-p-6 tw-bg-slate-50 tw-border-t tw-border-slate-200">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="person" color="blue-6"/>
              Informasi Pemohon
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Nama</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.nama_user }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Divisi</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.div_nama }}</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Departemen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.nama_dept }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Bisnis Unit</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.bu_name }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Schedule Section (Pinjam Asli only) -->
          <q-card-section v-if="ticketData.pinjam_aktivitas === 'Pinjam Asli'" class="tw-p-6 tw-border-t tw-border-slate-200">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="event" color="blue-6"/>
              Jadwal Pengambilan & Pengembalian
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="tw-text-slate-600 tw-font-semibold tw-mb-2">Estimasi Pengambilan</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <q-input
                      v-model="approvalForm.tgl_pengambilan"
                      outlined dense label="Tanggal" type="date"
                      :readonly="!canEditSchedule"
                      :bg-color="canEditSchedule ? 'white' : 'grey-2'"
                    />
                  </div>
                  <div class="col-4">
                    <q-input
                      v-model="approvalForm.jam_pengambilan"
                      outlined dense label="Jam Mulai" mask="##:##"
                      :readonly="!canEditSchedule"
                      :bg-color="canEditSchedule ? 'white' : 'grey-2'"
                    />
                  </div>
                  <div class="col-4">
                    <q-input
                      v-model="approvalForm.jam_pengambilan_sd"
                      outlined dense label="Jam Selesai" mask="##:##"
                      :readonly="!canEditSchedule"
                      :bg-color="canEditSchedule ? 'white' : 'grey-2'"
                    />
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="tw-text-slate-600 tw-font-semibold tw-mb-2">Estimasi Pengembalian</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <q-input
                      v-model="approvalForm.tgl_pengembalian"
                      outlined dense label="Tanggal" type="date"
                      :readonly="!canEditSchedule"
                      :bg-color="canEditSchedule ? 'white' : 'grey-2'"
                    />
                  </div>
                  <div class="col-4">
                    <q-input
                      v-model="approvalForm.jam_pengembalian"
                      outlined dense label="Jam Mulai" mask="##:##"
                      :readonly="!canEditSchedule"
                      :bg-color="canEditSchedule ? 'white' : 'grey-2'"
                    />
                  </div>
                  <div class="col-4">
                    <q-input
                      v-model="approvalForm.jam_pengembalian_sd"
                      outlined dense label="Jam Selesai" mask="##:##"
                      :readonly="!canEditSchedule"
                      :bg-color="canEditSchedule ? 'white' : 'grey-2'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Approval Actions -->
          <q-card-section class="tw-p-6 tw-bg-white tw-border-t tw-border-slate-200">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="task" color="blue-6"/>
              Tindakan Approval
            </div>

            <q-input
              v-if="!isProsesBAST"
              v-model="catatan"
              outlined type="textarea" rows="3"
              counter maxlength="300"
              class="tw-mb-6" bg-color="white"
            >
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">Notes Approver</span>
              </template>
            </q-input>

            <div class="tw-flex tw-gap-4 tw-justify-end">
              <q-btn
                v-if="canShowRejectRevisi"
                label="Tolak" color="red-7" size="md" push icon="cancel"
                class="tw-px-8"
                @click="showRejectDialog = true"
                :disable="submitting"
              />
              <q-btn
                v-if="canShowRejectRevisi"
                label="Revisi" color="orange-7" size="md" push icon="edit_note"
                class="tw-px-8"
                @click="showRevisiDialog = true"
                :disable="submitting"
              />
              <q-btn
                v-if="canShowSetuju"
                label="Setujui" color="green-7" size="md" push icon="check_circle"
                class="tw-px-8"
                @click="showApproveDialog = true"
                :disable="submitting"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-green-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="check_circle" size="24px"/>
            Konfirmasi Persetujuan
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg">Apakah Anda yakin ingin menyetujui permintaan ini?</p>
          <p class="tw-text-slate-500 tw-text-sm tw-mt-2">Tindakan ini tidak dapat dibatalkan.</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Ya, Setujui" color="green-7" @click="handleApprove" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-red-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="cancel" size="24px"/>
            Konfirmasi Penolakan
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg tw-mb-4">Apakah Anda yakin ingin menolak permintaan ini?</p>
          <q-input
            v-model="alasanPenolakan"
            outlined type="textarea" rows="3"
            counter maxlength="300" bg-color="white"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Penolakan</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Ya, Tolak" color="red-7" @click="handleReject" :loading="submitting" :disable="!alasanPenolakan.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Revisi Dialog -->
    <q-dialog v-model="showRevisiDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-orange-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="edit_note" size="24px"/>
            Konfirmasi Revisi
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg tw-mb-4">Apakah Anda yakin ingin mengembalikan permintaan ini untuk direvisi?</p>
          <q-input
            v-model="alasanRevisi"
            outlined type="textarea" rows="3"
            counter maxlength="300" bg-color="white"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Revisi</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Ya, Revisi" color="orange-7" @click="handleRevisi" :loading="submitting" :disable="!alasanRevisi.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';
import { useBrowserLocation } from '@vueuse/core';

const route = useRoute();
const router = useRouter();
const location = useBrowserLocation();
const { success, error: showError } = useNotify();

const loading = ref(true);
const errorMessage = ref('');
const ticketData = ref(null);
const approverInfo = ref({});
const catatan = ref('');
const alasanPenolakan = ref('');
const alasanRevisi = ref('');
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showRevisiDialog = ref(false);
const submitting = ref(false);
const actionCompleted = ref(false);
const successMessage = ref('');
const countdown = ref(5);
let countdownInterval = null;

const approvalForm = ref({
  tgl_pengambilan: '',
  jam_pengambilan: '08:00',
  jam_pengambilan_sd: '17:00',
  tgl_pengembalian: '',
  jam_pengembalian: '08:00',
  jam_pengembalian_sd: '17:00',
});

// Computed
const isProsesBAST = computed(() => ticketData.value?.pinjam_status === 'Proses BAST');

const isLegalSH = computed(() => {
  return approverInfo.value?.id_dir === 11680 && approverInfo.value?.grade === 4;
});

const canEditSchedule = computed(() => {
  if (!ticketData.value) return false;
  return ticketData.value.pinjam_approve_ke === 1 ||
         ticketData.value.pinjam_status === 'Kirim Arsiparis';
});

const canShowSetuju = computed(() => {
  return !isProsesBAST.value;
});

const canShowRejectRevisi = computed(() => {
  const status = ticketData.value?.pinjam_status;
  return !['Kirim Arsiparis', 'Proses BAST'].includes(status) && !isLegalSH.value;
});

const getStatusColor = (status) => {
  const map = {
    'Kirim Atasan User': 'orange',
    'Kirim Legal': 'blue',
    'Kirim Arsiparis': 'purple',
    'Proses BAST': 'teal',
    'Selesai': 'green',
    'Ditolak': 'red',
  };
  return map[status] || 'grey';
};

const startCountdown = () => {
  countdown.value = 5;
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
      window.location.href = import.meta.env.VITE_APPDBC || '/';
    }
  }, 1000);
};

const cleanupSession = () => {
  if (window.localStorage.getItem('temp_approval_session')) {
    // Jangan hapus session jika navigasi ke halaman peminjaman-approval
    const currentPath = router.currentRoute?.value?.path || '';
    if (currentPath.includes('peminjaman-approval')) return;

    delete axios.defaults.headers.common['Authorization'];
    ['token', 'empid', 'domain', 'nik', 'idle_time', 'temp_approval_session'].forEach(k =>
      window.localStorage.removeItem(k)
    );
  }
};

const loadTicketData = async () => {
  try {
    loading.value = true;
    const token = route.query.token;
    const url = location.value.origin;

    if (!token) {
      errorMessage.value = 'Token tidak ditemukan. Link approval tidak valid.';
      loading.value = false;
      return;
    }

    // Validate token & auto-login (same pattern as Mutasi)
    const validateRes = await axios.get(`${import.meta.env.VITE_API}dms/peminjaman/validate-token`, {
      params: { token, url },
      skipErrorInterceptor: true
    });

    const loginData = validateRes.data.data;

    // Store session like login does
    window.localStorage.setItem('token', loginData.token);
    window.localStorage.setItem('empid', loginData.empid);
    window.localStorage.setItem('domain', loginData.domain);
    window.localStorage.setItem('nik', loginData.nik);
    window.localStorage.setItem('idle_time', loginData.idle);
    window.localStorage.setItem('temp_approval_session', 'true');

    // Set axios auth header
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginData.token;

    approverInfo.value = {
      id: loginData.empid,
      name: loginData.nama,
      role: loginData.flag,
    };

    // ticketData comes directly from validate-token response (tiket field)
    ticketData.value = loginData.tiket;

    // Pre-fill schedule form
    if (ticketData.value?.pinjam_aktivitas === 'Pinjam Asli') {
      if (ticketData.value.pinjam_tgl_est_ambil_fr) {
        const ambilFr = ticketData.value.pinjam_tgl_est_ambil_fr;
        approvalForm.value.tgl_pengambilan = ambilFr.split('T')[0] || ambilFr.split(' ')[0];
        approvalForm.value.jam_pengambilan = ambilFr.split('T')[1]?.slice(0, 5) || ambilFr.split(' ')[1]?.slice(0, 5) || '08:00';
      }
      if (ticketData.value.pinjam_tgl_est_ambil_to) {
        const ambilTo = ticketData.value.pinjam_tgl_est_ambil_to;
        approvalForm.value.jam_pengambilan_sd = ambilTo.split('T')[1]?.slice(0, 5) || ambilTo.split(' ')[1]?.slice(0, 5) || '17:00';
      }
      if (ticketData.value.pinjam_tgl_est_kembali_fr) {
        const kembaliFr = ticketData.value.pinjam_tgl_est_kembali_fr;
        approvalForm.value.tgl_pengembalian = kembaliFr.split('T')[0] || kembaliFr.split(' ')[0];
        approvalForm.value.jam_pengembalian = kembaliFr.split('T')[1]?.slice(0, 5) || kembaliFr.split(' ')[1]?.slice(0, 5) || '08:00';
      }
      if (ticketData.value.pinjam_tgl_est_kembali_to) {
        const kembaliTo = ticketData.value.pinjam_tgl_est_kembali_to;
        approvalForm.value.jam_pengembalian_sd = kembaliTo.split('T')[1]?.slice(0, 5) || kembaliTo.split(' ')[1]?.slice(0, 5) || '17:00';
      }
    }

    loading.value = false;
  } catch (err) {
    loading.value = false;
    errorMessage.value = err?.response?.data?.message || err?.message || 'Gagal memuat data tiket';
  }
};

const handleApprove = async () => {
  try {
    submitting.value = true;

    await axios.post(
      `${import.meta.env.VITE_API}dms/approvePermintaan`,
      {
        creator: window.localStorage.getItem('empid'),
        id: ticketData.value.id,
        nomor_tiket: ticketData.value.pinjam_no_tiket,
        pinjam_status: ticketData.value.pinjam_status,
        notes: catatan.value,
        jabatan: approverInfo.value.role || 'Approver',
        app_jns_trans: ticketData.value.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3,
      },
      { skipErrorInterceptor: true }
    );

    submitting.value = false;
    showApproveDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Permintaan berhasil disetujui';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menyetujui permintaan');
  }
};

const handleReject = async () => {
  if (!alasanPenolakan.value.trim()) {
    showError('Alasan penolakan wajib diisi');
    return;
  }
  try {
    submitting.value = true;

    await axios.post(
      `${import.meta.env.VITE_API}dms/approvePermintaan`,
      {
        creator: window.localStorage.getItem('empid'),
        id: ticketData.value.id,
        nomor_tiket: ticketData.value.pinjam_no_tiket,
        pinjam_status: 'Kirim Tolak',
        notes: alasanPenolakan.value,
        revisi_reason: alasanPenolakan.value,
        jabatan: approverInfo.value.role || 'Approver',
        app_jns_trans: ticketData.value.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3,
      },
      { skipErrorInterceptor: true }
    );

    submitting.value = false;
    showRejectDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Permintaan berhasil ditolak';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menolak permintaan');
  }
};

const handleRevisi = async () => {
  if (!alasanRevisi.value.trim()) {
    showError('Alasan revisi wajib diisi');
    return;
  }
  try {
    submitting.value = true;

    await axios.post(
      `${import.meta.env.VITE_API}dms/approvePermintaan`,
      {
        creator: window.localStorage.getItem('empid'),
        id: ticketData.value.id,
        nomor_tiket: ticketData.value.pinjam_no_tiket,
        pinjam_status: 'Kirim Revisi',
        notes: alasanRevisi.value,
        revisi_reason: alasanRevisi.value,
        jabatan: approverInfo.value.role || 'Approver',
        app_jns_trans: ticketData.value.pinjam_aktivitas === 'Pinjam Asli' ? 2 : 3,
      },
      { skipErrorInterceptor: true }
    );

    submitting.value = false;
    showRevisiDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Permintaan berhasil dikembalikan untuk revisi';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal merevisi permintaan');
  }
};

onMounted(() => {
  loadTicketData();
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  cleanupSession();
});
</script>


