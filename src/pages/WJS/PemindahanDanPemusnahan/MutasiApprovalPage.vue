<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="approval" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Approval Mutasi Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Mutasi Arsip</span>
              <q-icon name="chevron_right" size="14px"/>
              <span>Approval</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="loading" class="tw-p-6 tw-text-center">
        <q-spinner color="blue-6" size="50px" />
        <p class="tw-mt-4 tw-text-slate-600">Memuat data...</p>
      </q-card-section>

      <q-card-section v-else-if="error" class="tw-p-6">
        <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500">
          <template v-slot:avatar>
            <q-icon name="error" color="red" size="24px"/>
          </template>
          <span class="tw-text-red-700 tw-font-medium">{{ error }}</span>
        </q-banner>
        <div class="tw-mt-4 tw-text-center">
          <q-btn 
            label="Kembali ke Daftar Mutasi" 
            color="blue-6" 
            push
            icon="arrow_back"
            @click="$router.push('/dms/mutasi')"
          />
        </div>
      </q-card-section>

      <q-card-section v-else-if="ticketData" class="tw-p-6">
        <div class="tw-max-w-7xl tw-mx-auto">
          <!-- Ticket Info Banner -->
          <q-banner rounded class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm tw-mb-6">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" size="24px"/>
            </template>
            <div>
              <div class="tw-text-blue-900 tw-font-bold tw-text-lg">{{ ticketData.header.tr_no_tiket }}</div>
              <div class="tw-text-blue-700 tw-text-sm">Status: {{ ticketData.header.status_text }}</div>
            </div>
          </q-banner>

          <!-- Ticket Details -->
          <div class="tw-mb-6">
            <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-6">
              <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4">Informasi Mutasi</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="tw-mb-3">
                    <div class="tw-text-slate-500 tw-text-sm">Tanggal Pengajuan</div>
                    <div class="tw-text-slate-900 tw-font-semibold">{{ formatDate(ticketData.header.tr_tgl_pengajuan) }}</div>
                  </div>
                  <div class="tw-mb-3">
                    <div class="tw-text-slate-500 tw-text-sm">Tanggal Mutasi</div>
                    <div class="tw-text-slate-900 tw-font-semibold">{{ formatDate(ticketData.header.tr_tgl_mutasi) }}</div>
                  </div>
                  <div class="tw-mb-3">
                    <div class="tw-text-slate-500 tw-text-sm">Kategori Dokumen</div>
                    <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_kategori_dokumen }}</div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="tw-mb-3">
                    <div class="tw-text-slate-500 tw-text-sm">Kategori Keamanan</div>
                    <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_kategori_keamanan }}</div>
                  </div>
                  <div class="tw-mb-3">
                    <div class="tw-text-slate-500 tw-text-sm">Lokasi Lama</div>
                    <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.lokasi_lama_name || '-' }}</div>
                  </div>
                  <div class="tw-mb-3">
                    <div class="tw-text-slate-500 tw-text-sm">Lokasi Baru</div>
                    <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.lokasi_baru_name || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Table -->
          <div class="tw-mb-6">
            <div class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-6">
              <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4">Daftar Arsip</div>
              <q-table
                :rows="ticketData.details"
                :columns="documentColumns"
                row-key="trdet_no_arsip"
                flat
                bordered
                :rows-per-page-options="[10, 25, 50]"
              />
            </div>
          </div>

          <!-- Approval Actions -->
          <div v-if="canApprove" class="tw-bg-white tw-rounded-xl tw-shadow-md tw-p-6">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4">Tindakan Approval</div>
            
            <q-input
              v-model="catatan"
              outlined
              type="textarea"
              rows="3"
              label="Catatan"
              class="tw-mb-4"
            />

            <div class="tw-flex tw-gap-3 tw-justify-end">
              <q-btn 
                label="Tolak" 
                color="red-7" 
                push
                icon="cancel"
                @click="showRejectDialog = true"
              />
              <q-btn 
                label="Setujui" 
                color="green-7" 
                push
                icon="check_circle"
                @click="showApproveDialog = true"
              />
            </div>
          </div>

          <div v-else class="tw-bg-yellow-50 tw-rounded-xl tw-border tw-border-yellow-200 tw-p-6 tw-text-center">
            <q-icon name="info" color="yellow-8" size="32px" class="tw-mb-2"/>
            <p class="tw-text-yellow-800 tw-font-medium">Anda tidak memiliki akses untuk melakukan approval pada tiket ini.</p>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Approve Confirmation Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden">
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="text-h6 tw-font-bold">Konfirmasi Persetujuan</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700">Apakah Anda yakin ingin menyetujui mutasi arsip ini?</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn unelevated label="Batal" color="red-7" v-close-popup />
          <q-btn unelevated label="Setujui" color="green-7" @click="handleApprove" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Confirmation Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden">
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="text-h6 tw-font-bold">Konfirmasi Penolakan</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-mb-4">Apakah Anda yakin ingin menolak mutasi arsip ini?</p>
          <q-input
            v-model="alasanPenolakan"
            outlined
            type="textarea"
            rows="3"
            label="Alasan Penolakan *"
            :rules="[val => !!val || 'Alasan penolakan wajib diisi']"
          />
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn unelevated label="Batal" color="grey-7" v-close-popup />
          <q-btn unelevated label="Tolak" color="red-7" @click="handleReject" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { domain, empid } from '../../../utils';
import { useNotify } from '../../../composables/useNotify';

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useNotify();

const loading = ref(true);
const error = ref(null);
const ticketData = ref(null);
const canApprove = ref(false);
const catatan = ref('');
const alasanPenolakan = ref('');
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const submitting = ref(false);

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

const loadTicketData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = route.query.token;
    if (!token) {
      error.value = 'Token tidak ditemukan. Link approval tidak valid.';
      loading.value = false;
      return;
    }

    // Find ticket by token
    const listRes = await axios.get(`${import.meta.env.VITE_API}dms/mutasi`, {
      params: {
        rowsPerPage: null,
        empid: empid(),
        domain: domain()
      },
      skipErrorInterceptor: true
    });

    const ticket = listRes.data.find(t => t.tr_token === token);
    if (!ticket) {
      error.value = 'Token tidak valid atau tiket mutasi tidak ditemukan.';
      loading.value = false;
      return;
    }

    // Get full ticket details
    const detailRes = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/${ticket.tr_arsip_id}`, {
      params: {
        empid: empid(),
        domain: domain()
      },
      skipErrorInterceptor: true
    });

    ticketData.value = detailRes.data.data;
    
    // Check if current user can approve
    canApprove.value = checkCanApprove(ticketData.value.header);
    
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error.value = err?.response?.data?.message || err?.message || 'Gagal memuat data tiket';
    console.error('Load ticket error:', err);
  }
};

const checkCanApprove = (header) => {
  const currentUser = empid();
  const status = header.tr_status;
  
  if (status === 1 && header.tr_atasan_user_id === currentUser) return true;
  if (status === 4 && header.tr_arsiparis_lama_id === currentUser) return true;
  if (status === 5 && header.tr_atasan_arsiparis_lama_id === currentUser) return true;
  if (status === 6 && header.tr_arsiparis_baru_id === currentUser) return true;
  if (status === 7 && header.tr_atasan_arsiparis_baru_id === currentUser) return true;
  if (status === 8 && header.tr_arsiparis_baru_id === currentUser) return true;
  
  return false;
};

const handleApprove = async () => {
  try {
    submitting.value = true;
    
    await axios.post(
      `${import.meta.env.VITE_API}dms/mutasi/${ticketData.value.header.tr_arsip_id}/approve`,
      {
        creator: empid(),
        catatan: catatan.value || 'Disetujui'
      },
      { skipErrorInterceptor: true }
    );
    
    submitting.value = false;
    showApproveDialog.value = false;
    success('Mutasi arsip berhasil disetujui');
    
    // Reload data
    await loadTicketData();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menyetujui mutasi');
  }
};

const handleReject = async () => {
  if (!alasanPenolakan.value) {
    showError('Alasan penolakan wajib diisi');
    return;
  }
  
  try {
    submitting.value = true;
    
    await axios.post(
      `${import.meta.env.VITE_API}dms/mutasi/${ticketData.value.header.tr_arsip_id}/reject`,
      {
        creator: empid(),
        alasan: alasanPenolakan.value
      },
      { skipErrorInterceptor: true }
    );
    
    submitting.value = false;
    showRejectDialog.value = false;
    success('Mutasi arsip berhasil ditolak');
    
    // Reload data
    await loadTicketData();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menolak mutasi');
  }
};

onMounted(() => {
  loadTicketData();
});
</script>


