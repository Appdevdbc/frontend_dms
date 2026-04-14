<template>
  <div class="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-blue-50 tw-py-8">
    <div class="tw-max-w-6xl tw-mx-auto tw-px-4">
      <!-- Loading State -->
      <div v-if="loading" class="tw-text-center tw-py-20">
        <q-spinner color="blue-6" size="60px" />
        <p class="tw-mt-6 tw-text-slate-600 tw-text-lg">Memuat data approval...</p>
      </div>

      <!-- Success State -->
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
                  <div class="text-h5 tw-font-bold">Approval Pengaduan</div>
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
                <div class="tw-text-blue-900 tw-font-bold tw-text-xl">{{ ticketData.tr_no_adu }}</div>
                <div class="tw-text-blue-700 tw-text-sm tw-mt-1">Status: {{ ticketData.tr_adu_status }}</div>
              </div>
              <q-badge :color="getStatusColor(ticketData.tr_adu_status)" class="tw-px-4 tw-py-2 tw-text-sm">
                {{ ticketData.tr_adu_status }}
              </q-badge>
            </div>
          </q-card-section>

          <!-- Ticket Details -->
          <q-card-section class="tw-p-6">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="info" color="blue-6"/>
              Informasi Pengaduan
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">No. Pengaduan</div>
                  <div class="tw-text-slate-900 tw-font-semibold tw-text-lg">{{ ticketData.tr_no_adu }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Tanggal Pengaduan</div>
                  <div class="tw-text-slate-900 tw-font-semibold tw-text-lg">{{ formatDate(ticketData.tr_tgl_adu) }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">No. Dokumen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.tr_adu_no_doc || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Nama Dokumen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.content_name || '-' }}</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Judul Pengaduan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.tr_adu_judul }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Kategori Pengaduan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.tr_adu_kategori }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Bisnis Unit</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.bu_name || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Lokasi Penyimpanan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.lokasi_arsip_name || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="tw-mb-4">
              <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Uraian Pengaduan</div>
              <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.tr_adu_uraian_user || '-' }}</div>
            </div>
            <div v-if="ticketData.tr_file_upload_user" class="tw-mb-4">
              <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Upload Lampiran</div>
              <q-input :model-value="ticketData.tr_file_upload_user" outlined readonly label-slot>
                <template v-slot:prepend><q-icon name="attach_file" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Upload Lampiran</span></template>
                <template v-slot:append>
                  <q-btn flat dense icon="open_in_new" color="blue-6" size="sm"
                    @click="openFile(ticketData.tr_file_upload_user)"/>
                </template>
              </q-input>
            </div>
          </q-card-section>

          <!-- Approval Actions -->
          <q-card-section class="tw-p-6 tw-bg-white tw-border-t tw-border-slate-200">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="task" color="blue-6"/>
              Tindakan Approval
            </div>

            <div class="tw-p-4 tw-bg-yellow-50 tw-rounded-lg tw-border tw-border-yellow-200 tw-mb-6">
              <div class="tw-flex tw-items-start tw-gap-3">
                <q-icon name="info" color="yellow-700" size="24px"/>
                <div class="tw-text-sm tw-text-yellow-800">
                  <div class="tw-font-semibold tw-mb-1">Konfirmasi Approval</div>
                  <div>Silahkan pilih tindakan yang akan dilakukan terhadap pengaduan ini.</div>
                </div>
              </div>
            </div>

            <div class="tw-flex tw-gap-4 tw-justify-end">
              <q-btn v-if="canReject" label="Tolak" color="red-7" size="lg" push icon="cancel" class="tw-px-8"
                @click="showRejectDialog = true" :disable="submitting"/>
              <q-btn v-if="canRevisi" label="Revisi" color="orange-7" size="lg" push icon="edit_note" class="tw-px-8"
                @click="showRevisiDialog = true" :disable="submitting"/>
              <q-btn v-if="canApprove" label="Setujui" color="green-7" size="lg" push icon="check_circle" class="tw-px-8"
                @click="showApproveDialog = true" :disable="submitting"/>
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
            <q-icon name="check_circle" size="24px"/> Konfirmasi Persetujuan
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg">Apakah Anda yakin ingin menyetujui pengaduan ini?</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting"/>
          <q-btn unelevated label="Ya, Setujui" color="green-7" @click="handleApprove" :loading="submitting"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-red-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="cancel" size="24px"/> Konfirmasi Penolakan
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <q-input v-model="alasanPenolakan" outlined type="textarea" rows="3" label-slot counter maxlength="500" bg-color="white">
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Penolakan</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting"/>
          <q-btn unelevated label="Ya, Tolak" color="red-7" @click="handleReject" :loading="submitting"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Revisi Dialog -->
    <q-dialog v-model="showRevisiDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-orange-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="edit_note" size="24px"/> Konfirmasi Revisi
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <q-input v-model="alasanRevisi" outlined type="textarea" rows="3" label-slot counter maxlength="500" bg-color="white">
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Alasan Revisi</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting"/>
          <q-btn unelevated label="Ya, Revisi" color="orange-7" @click="handleRevisi" :loading="submitting"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- File Preview Dialog -->
    <q-dialog v-model="showFilePreview" maximized>
      <q-card>
        <q-card-section class="tw-bg-gradient-to-r tw-from-blue-900 tw-to-blue-700 tw-text-white tw-py-4">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="visibility" size="32px"/>
              <div class="tw-text-xl tw-font-bold">Preview File</div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showFilePreview = false"/>
          </div>
        </q-card-section>
        <q-card-section class="tw-p-0" style="height: calc(100vh - 80px);">
          <iframe :src="previewFileUrl" style="width: 100%; height: 100%; border: none;"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';

const route = useRoute();
const { success, error: showError } = useNotify();

const loading = ref(true);
const fileBaseUrl = import.meta.env.VITE_FTP || import.meta.env.VITE_API;
const ticketData = ref(null);
const approverInfo = ref({});
const ticketId = ref(null);
const catatan = ref('');
const alasanPenolakan = ref('');
const alasanRevisi = ref('');
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showRevisiDialog = ref(false);
const showFilePreview = ref(false);
const previewFileUrl = ref('');
const submitting = ref(false);
const actionCompleted = ref(false);
const successMessage = ref('');
const countdown = ref(5);
let countdownInterval = null;

const statusColorMap = {
  'Masih menunggu persetujuan atasan dokumen owner': 'orange',
  'Menunggu persetujuan corporate legal SH': 'blue',
  'Menunggu persetujuan corporate legal DH': 'blue-8',
  'Pengaduan diterima dan sedang diproses': 'purple',
  'Selesai': 'green',
  'Pengaduan ditolak': 'red'
};
const getStatusColor = (s) => statusColorMap[s] || 'grey';

// Permission flags based on approver role
const canApprove = computed(() => {
  const role = approverInfo.value.role;
  return ['Atasan Dokumen Owner', 'Corp. Legal SH', 'Corp. Legal DH'].includes(role);
});
const canReject = computed(() => canApprove.value);
const canRevisi = computed(() => approverInfo.value.role === 'Atasan Dokumen Owner');

const formatDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
};

const cleanupSession = () => {
  delete axios.defaults.headers.common['Authorization'];
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('empid');
  window.localStorage.removeItem('domain');
  window.localStorage.removeItem('nik');
  window.localStorage.removeItem('idle_time');
  window.localStorage.removeItem('temp_approval_session');
};

const startCountdown = () => {
  countdown.value = 5;
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
      window.location.href = import.meta.env.VITE_APPDBC;
    }
  }, 1000);
};

const loadTicketData = async () => {
  try {
    loading.value = true;
    const token = route.query.token;
    const url = window.location.origin;
    if (!token) { showError('Token tidak ditemukan.'); loading.value = false; return; }

    cleanupSession();

    const validateRes = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/validate-token`, {
      params: { token, url }, headers: { Authorization: undefined }, skipErrorInterceptor: true
    });

    const loginData = validateRes.data.data;

    // Store session (same as pemusnahan standalone)
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
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginData.token;

    approverInfo.value = { id: loginData.empid, name: loginData.nama, role: loginData.flag };
    ticketId.value = loginData.tiket.ticket_id; // encrypted

    // Load full ticket detail
    const detailRes = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/${ticketId.value}`, {
      params: { creator: loginData.empid }, skipErrorInterceptor: true
    });
    ticketData.value = detailRes.data.data;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    showError(err?.response?.data?.message || 'Gagal memuat data tiket');
  }
};

const getApproveUrl = () => {
  const role = approverInfo.value.role;
  const base = `${import.meta.env.VITE_API}dms/pengaduan/${ticketId.value}`;
  if (role === 'Atasan Dokumen Owner') return `${base}/approve-atasan`;
  if (role === 'Corp. Legal SH') return `${base}/approve-legal-sh`;
  if (role === 'Corp. Legal DH' || role === 'Corp. Legal DH (Selesai)') return `${base}/approve-legal-dh`;
  return '';
};

const getRejectUrl = () => {
  const role = approverInfo.value.role;
  const base = `${import.meta.env.VITE_API}dms/pengaduan/${ticketId.value}`;
  if (role === 'Atasan Dokumen Owner') return `${base}/reject-atasan`;
  if (role === 'Corp. Legal SH') return `${base}/reject-legal-sh`;
  if (role === 'Corp. Legal DH' || role === 'Corp. Legal DH (Selesai)') return `${base}/reject-legal-dh`;
  return '';
};

const handleApprove = async () => {
  try {
    submitting.value = true;
    await axios.post(getApproveUrl(), { creator: approverInfo.value.id, catatan: catatan.value }, { skipErrorInterceptor: true });
    submitting.value = false;
    showApproveDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Pengaduan berhasil disetujui';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || 'Gagal menyetujui');
  }
};

const handleReject = async () => {
  if (!alasanPenolakan.value?.trim()) { showError('Alasan penolakan wajib diisi'); return; }
  try {
    submitting.value = true;
    await axios.post(getRejectUrl(), { creator: approverInfo.value.id, reason: alasanPenolakan.value }, { skipErrorInterceptor: true });
    submitting.value = false;
    showRejectDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Pengaduan berhasil ditolak';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || 'Gagal menolak');
  }
};

const handleRevisi = async () => {
  if (!alasanRevisi.value?.trim()) { showError('Alasan revisi wajib diisi'); return; }
  try {
    submitting.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/pengaduan/${ticketId.value}/reject-atasan`, {
      creator: approverInfo.value.id, reason: alasanRevisi.value
    }, { skipErrorInterceptor: true });
    submitting.value = false;
    showRevisiDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Pengaduan berhasil dikembalikan untuk direvisi';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || 'Gagal merevisi');
  }
};

const openFile = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  
  if (isPdf || isImage) {
    previewFileUrl.value = `${fileBaseUrl}dmslegal/${filename}`;
    showFilePreview.value = true;
  } else {
    window.open(`${fileBaseUrl}dmslegal/${filename}`, '_blank');
  }
};

onMounted(() => { loadTicketData(); });
onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (window.localStorage.getItem('temp_approval_session')) cleanupSession();
});
</script>


