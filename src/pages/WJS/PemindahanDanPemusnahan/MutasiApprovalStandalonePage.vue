<template>
  <div class="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-py-8">
    <div class="tw-max-w-6xl tw-mx-auto tw-px-4">
      <!-- Loading State -->
      <div v-if="loading" class="tw-text-center tw-py-20">
        <q-spinner color="blue-6" size="60px" />
        <p class="tw-mt-6 tw-text-slate-600 tw-text-lg">Memuat data approval...</p>
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
                  <div class="text-h5 tw-font-bold">Approval Mutasi Arsip</div>
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
                <div class="tw-text-blue-900 tw-font-bold tw-text-xl">{{ ticketData.header.tr_no_tiket }}</div>
                <div class="tw-text-blue-700 tw-text-sm tw-mt-1">Status: {{ ticketData.header.status_text }}</div>
              </div>
              <q-badge :color="getStatusColor(ticketData.header.tr_status)" class="tw-px-4 tw-py-2 tw-text-sm">
                {{ ticketData.header.status_text }}
              </q-badge>
            </div>
          </q-card-section>

          <!-- Ticket Details -->
          <q-card-section class="tw-p-6">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="info" color="blue-6"/>
              Informasi Mutasi
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Tanggal Pengajuan</div>
                  <div class="tw-text-slate-900 tw-font-semibold tw-text-lg">{{ formatDate(ticketData.header.tr_tgl_pengajuan) }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Tanggal Mutasi</div>
                  <div class="tw-text-slate-900 tw-font-semibold tw-text-lg">{{ formatDate(ticketData.header.tr_tgl_mutasi) }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Kategori Dokumen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_kategori_dokumen }}</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Kategori Keamanan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_kategori_keamanan }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Lokasi Lama</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.lokasi_lama_name || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Lokasi Baru</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.lokasi_baru_name || '-' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Documents Table -->
          <q-card-section class="tw-p-6 tw-bg-slate-50">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="folder_open" color="blue-6"/>
              Daftar Arsip ({{ ticketData.details.length }} dokumen)
            </div>
            <q-table
              :rows="ticketData.details"
              :columns="documentColumns"
              row-key="trdet_no_arsip"
              flat
              bordered
              :rows-per-page-options="[10, 25, 50]"
              class="tw-shadow-md tw-rounded-lg"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="`bg-${currentDomain} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>

          <!-- Approval Actions -->
          <q-card-section class="tw-p-6 tw-bg-white tw-border-t tw-border-slate-200">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="task" color="blue-6"/>
              Tindakan Approval
            </div>
            
            <q-input
              v-model="catatan"
              outlined
              type="textarea"
              rows="3"
              label-slot
              counter
              maxlength="500"
              class="tw-mb-6"
              bg-color="white"
            >
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">Catatan</span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </template>
            </q-input>

            <div class="tw-flex tw-gap-4 tw-justify-end">
              <q-btn 
                label="Tolak" 
                color="red-7" 
                size="lg"
                push
                icon="cancel"
                class="tw-px-8"
                @click="showRejectDialog = true"
                :disable="submitting"
              />
              <q-btn 
                v-if="canRevisiApproval"
                label="Revisi" 
                color="orange-7" 
                size="lg"
                push
                icon="edit_note"
                class="tw-px-8"
                @click="showRevisiDialog = true"
                :disable="submitting"
              />
              <q-btn 
                label="Setujui" 
                color="green-7" 
                size="lg"
                push
                icon="check_circle"
                class="tw-px-8"
                @click="showApproveDialog = true"
                :disable="submitting"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Approve Confirmation Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-green-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="check_circle" size="24px"/>
            Konfirmasi Persetujuan
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg">Apakah Anda yakin ingin menyetujui mutasi arsip ini?</p>
          <p class="tw-text-slate-500 tw-text-sm tw-mt-2">Tindakan ini tidak dapat dibatalkan.</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Ya, Setujui" color="green-7" @click="handleApprove" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Confirmation Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-red-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="cancel" size="24px"/>
            Konfirmasi Penolakan
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg tw-mb-4">Apakah Anda yakin ingin menolak mutasi arsip ini?</p>
          <q-input
            v-model="alasanPenolakan"
            outlined
            type="textarea"
            rows="3"
            label-slot
            counter
            maxlength="500"
            bg-color="white"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Penolakan</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Ya, Tolak" color="red-7" @click="handleReject" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Revisi Confirmation Dialog -->
    <q-dialog v-model="showRevisiDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-orange-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="edit_note" size="24px"/>
            Konfirmasi Revisi
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg tw-mb-4">Apakah Anda yakin ingin mengembalikan mutasi arsip ini untuk direvisi?</p>
          <q-input
            v-model="alasanRevisi"
            outlined
            type="textarea"
            rows="3"
            label-slot
            counter
            maxlength="500"
            bg-color="white"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Revisi</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Ya, Revisi" color="orange-7" @click="handleRevisi" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';

const route = useRoute();
const { success, error: showError } = useNotify();

const loading = ref(true);
const ticketData = ref(null);
const approverInfo = ref({});
const catatan = ref('');
const alasanPenolakan = ref('');
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showRevisiDialog = ref(false);
const alasanRevisi = ref('');
const submitting = ref(false);
const actionCompleted = ref(false);
const successMessage = ref('');
const countdown = ref(5);
let countdownInterval = null;

const currentDomain = computed(() => {
  return window.localStorage.getItem('domain') || 'DFR';
});

const cleanupSession = () => {
  delete axios.defaults.headers.common['Authorization'];
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('empid');
  window.localStorage.removeItem('domain');
  window.localStorage.removeItem('nik');
  window.localStorage.removeItem('idle_time');
  window.localStorage.removeItem('temp_approval_session');
};

const canRevisiApproval = computed(() => {
  const status = ticketData.value?.header?.tr_status;
  return [1, 5, 7].includes(status);
});

const documentColumns = [
  { name: 'trdet_no_arsip', label: 'Kode Arsip', field: 'trdet_no_arsip', align: 'left' },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left' },
  { name: 'content_doc', label: 'No. Document', field: 'content_doc', align: 'left' },
  { name: 'status_berlaku', label: 'Status Berlaku', field: 'status_berlaku', align: 'center' },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left' },
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', field: 'lokasi_arsip_name', align: 'left' }
];

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getStatusColor = (status) => {
  if (status === 3) return 'red';
  if (status === 8 || status === 9 || status === 10) return 'green';
  return 'blue';
};

const startCountdown = () => {
  countdown.value = 5;
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
      // Redirect to VITE_APPDBC
      window.location.href = import.meta.env.VITE_APPDBC;
    }
  }, 1000);
};

const loadTicketData = async () => {
  try {
    loading.value = true;

    const token = route.query.token;
    const url = window.location.origin;
    if (!token) {
      showError('Token tidak ditemukan. Link approval tidak valid.');
      loading.value = false;
      return;
    }

    // Validate token and auto-login (returns same format as login)
    // Clear any existing session before validating token
    // This prevents conflicts when user is already logged in as different user
    cleanupSession();

    const validateRes = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/validate-token`, {
      params: { token, url },
      headers: { Authorization: undefined },
      skipErrorInterceptor: true
    });

    // Extract data like login success (same structure as MainLogin.vue)
    const loginData = validateRes.data.data;
    
    // Store session data like login does
    window.localStorage.setItem("data", JSON.stringify(loginData));
    window.localStorage.setItem("token", loginData.token);
    window.localStorage.setItem("empid", loginData.empid);
    window.localStorage.setItem("nama", loginData.nama);
    window.localStorage.setItem("domain", loginData.domain);
    window.localStorage.setItem("bu_id", loginData.bu_id);
    window.localStorage.setItem("bu_name", loginData.bu_name);
    window.localStorage.setItem("div_id", loginData.div_id);
    window.localStorage.setItem("div_name", loginData.div_name);
    window.localStorage.setItem("dept_name", loginData.dept_name);
    window.localStorage.setItem("role", loginData.role);
    window.localStorage.setItem("super", loginData.super);
    window.localStorage.setItem("site", loginData.site);
    window.localStorage.setItem("unit", loginData.unit);
    window.localStorage.setItem("nik", loginData.nik);
    window.localStorage.setItem("idle_time", loginData.idle);
    window.localStorage.setItem('temp_approval_session', 'true');
    
    // Set axios default header for subsequent requests
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginData.token;

    // Set approver info from login data
    approverInfo.value = {
      id: loginData.empid, // Already encrypted
      name: loginData.nama,
      email: loginData.email || '',
      role: loginData.flag // approver_role
    };

    // Get full ticket details (now authenticated with JWT)
    const detailRes = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/${loginData.tiket.ticket_id}`, {
      params: {
        empid: loginData.empid, // Already encrypted
        domain: loginData.domain,
      },
      skipErrorInterceptor: true
    });

    ticketData.value = detailRes.data.data;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal memuat data tiket');
    console.error('Load ticket error:', err);
  }
};

const handleApprove = async () => {
  if (!catatan.value || catatan.value.trim() === '') {
    showError('Catatan wajib diisi');
    return;
  }
  
  try {
    submitting.value = true;
    
    await axios.post(
      `${import.meta.env.VITE_API}dms/mutasi/${ticketData.value.header.tr_arsip_id}/approve`,
      {
        creator: approverInfo.value.id, // Already encrypted from login data
        catatan: catatan.value,
      },
      { skipErrorInterceptor: true }
    );
    
    submitting.value = false;
    showApproveDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Mutasi arsip berhasil disetujui';
    
    // Auto-logout and close (clean up like logout does)
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menyetujui mutasi');
  }
};

const handleReject = async () => {
  if (!alasanPenolakan.value || alasanPenolakan.value.trim() === '') {
    showError('Alasan penolakan wajib diisi');
    return;
  }
  
  try {
    submitting.value = true;
    
    await axios.post(
      `${import.meta.env.VITE_API}dms/mutasi/${ticketData.value.header.tr_arsip_id}/reject`,
      {
        creator: approverInfo.value.id, // Already encrypted from login data
        alasan: alasanPenolakan.value
      },
      { skipErrorInterceptor: true }
    );
    
    submitting.value = false;
    showRejectDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Mutasi arsip berhasil ditolak';
    
    // Auto-logout and close (clean up like logout does)
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menolak mutasi');
  }
};

const handleRevisi = async () => {
  if (!alasanRevisi.value || alasanRevisi.value.trim() === '') {
    showError('Alasan revisi wajib diisi');
    return;
  }
  
  try {
    submitting.value = true;
    
    await axios.post(
      `${import.meta.env.VITE_API}dms/mutasi/${ticketData.value.header.tr_arsip_id}/revisi-approval`,
      {
        creator: approverInfo.value.id,
        alasan: alasanRevisi.value,
        catatan: catatan.value
      },
      { skipErrorInterceptor: true }
    );
    
    submitting.value = false;
    showRevisiDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Mutasi arsip berhasil direvisi';
    
    // Auto-logout and close
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal merevisi mutasi');
  }
};

onMounted(() => {
  loadTicketData();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  // Clean up temp session and axios header (like logout does)
  if (window.localStorage.getItem('temp_approval_session')) {
    cleanupSession();
  }
});
</script>


