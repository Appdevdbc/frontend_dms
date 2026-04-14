<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="description" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Detail Peminjaman Dokumen</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/peminjaman-dokumen' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">Peminjaman Dokumen</router-link>
              <q-icon name="chevron_right" size="14px"/>
              <span>Detail</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" v-if="!loading">
        <div class="tw-max-w-7xl tw-mx-auto">
          <!-- Status Badge -->
          <div class="tw-mb-6">
            <q-badge :color="getStatusColor(ticket.pinjam_status)" :label="ticket.pinjam_status" class="tw-text-base tw-px-4 tw-py-2"/>
          </div>

          <!-- Two Column Layout -->
          <div class="row q-col-gutter-md tw-mb-6">
            <div class="col-12 col-md-6">
              <q-input v-model="ticket.pinjam_no_tiket" outlined readonly label="No. Tiket" class="tw-mb-4"><template v-slot:prepend><q-icon name="confirmation_number" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.pinjam_aktivitas" outlined readonly label="Aktivitas" class="tw-mb-4"><template v-slot:prepend><q-icon name="swap_horiz" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.pinjam_nama_doc" outlined readonly label="Nama Dokumen" class="tw-mb-4"><template v-slot:prepend><q-icon name="description" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.pinjam_nomor_doc" outlined readonly label="Nomor Dokumen" class="tw-mb-4"><template v-slot:prepend><q-icon name="tag" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.arsip_no" outlined readonly label="Kode Arsip" class="tw-mb-4"><template v-slot:prepend><q-icon name="folder" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.pinjam_lokasi_arsip" outlined readonly label="Lokasi Penyimpanan" class="tw-mb-4"><template v-slot:prepend><q-icon name="location_on" color="blue-6"/></template></q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="ticket.kat_desc" outlined readonly label="Kategori Dokumen" class="tw-mb-4"><template v-slot:prepend><q-icon name="category" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.content_security" outlined readonly label="Kategori Keamanan" class="tw-mb-4"><template v-slot:prepend><q-icon name="security" color="blue-6"/></template></q-input>
              <q-input :model-value="formatDate(ticket.pinjam_tgl_est_ambil_to)" outlined readonly label="Tgl Estimasi Pengambilan" class="tw-mb-4"><template v-slot:prepend><q-icon name="event" color="blue-6"/></template></q-input>
              <q-input :model-value="formatDate(ticket.pinjam_tgl_est_kembali_to)" outlined readonly label="Tgl Estimasi Pengembalian" class="tw-mb-4"><template v-slot:prepend><q-icon name="event_repeat" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.pinjam_alasan_pinjam" outlined readonly type="textarea" rows="3" label="Alasan Peminjaman" class="tw-mb-4"><template v-slot:prepend><q-icon name="notes" color="blue-6"/></template></q-input>
              <q-input v-model="ticket.pinjam_ket_user" outlined readonly type="textarea" rows="2" label="Keterangan User" class="tw-mb-4"><template v-slot:prepend><q-icon name="comment" color="blue-6"/></template></q-input>
            </div>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Pemohon Info -->
          <div class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="person" color="blue-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Informasi Pemohon</div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="tw-text-slate-500 tw-text-sm">Nama</div>
                <div class="tw-font-semibold">{{ ticket.nama_user || '-' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="tw-text-slate-500 tw-text-sm">Divisi</div>
                <div class="tw-font-semibold">{{ ticket.div_nama || '-' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="tw-text-slate-500 tw-text-sm">Bisnis Unit</div>
                <div class="tw-font-semibold">{{ ticket.bu_name || '-' }}</div>
              </div>
            </div>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Audit Log Timeline -->
          <div class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="history" color="blue-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Riwayat Approval</div>
            </div>
            <q-timeline color="blue-6">
              <q-timeline-entry
                v-for="(log, index) in logs"
                :key="index"
                :title="log.trs_log_proses"
                :subtitle="formatDate(log.trs_log_tgl)"
                :color="log.trs_log_proses?.includes('Tolak') ? 'red' : log.trs_log_proses?.includes('Revisi') ? 'orange' : 'blue'"
              >
                <div class="tw-text-sm tw-text-slate-600">
                  <div><strong>PIC:</strong> {{ log.employee_name || '-' }}</div>
                  <div><strong>Hasil:</strong> {{ log.trs_log_hasil }}</div>
                  <div v-if="log.trs_log_catatan"><strong>Catatan:</strong> {{ log.trs_log_catatan }}</div>
                  <div v-if="log.trs_log_reason_revisi" class="tw-text-red-600"><strong>Alasan:</strong> {{ log.trs_log_reason_revisi }}</div>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Action Buttons -->
          <div class="tw-flex tw-gap-3 tw-justify-end">
            <q-btn label="Kembali" color="red-7" push icon="arrow_back" class="tw-px-6 tw-font-semibold" @click="$router.push('/dms/peminjaman-dokumen')"/>
            <q-btn v-if="canApprove" label="Tolak" color="red-6" push icon="cancel" class="tw-px-6 tw-font-semibold" @click="showRejectDialog = true"/>
            <q-btn v-if="canApprove" label="Revisi" color="orange-6" push icon="edit_note" class="tw-px-6 tw-font-semibold" @click="showRevisiDialog = true"/>
            <q-btn v-if="canApprove" label="Approve" color="green-6" push icon="check_circle" class="tw-px-6 tw-font-semibold" @click="showApproveDialog = true"/>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else class="tw-p-12 tw-text-center">
        <q-spinner color="blue-6" size="60px"/>
        <p class="tw-mt-4 tw-text-slate-500">Memuat data...</p>
      </q-card-section>
    </q-card>

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width:500px">
        <q-card-section class="tw-bg-green-600 tw-text-white tw-py-4"><div class="text-h6 tw-font-bold">Konfirmasi Approval</div></q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-mb-4">Apakah anda yakin untuk menyetujui permintaan ini?</p>
          <q-input v-model="catatan" outlined type="textarea" rows="3" label="Catatan" counter maxlength="500"/>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup/>
          <q-btn unelevated label="Approve" color="green-6" @click="handleAction('approve')" :loading="submitting"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width:500px">
        <q-card-section class="tw-bg-red-600 tw-text-white tw-py-4"><div class="text-h6 tw-font-bold">Tolak Permintaan</div></q-card-section>
        <q-card-section class="tw-p-6">
          <q-input v-model="reason" outlined type="textarea" rows="3" label="Alasan Penolakan *" counter maxlength="500"/>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup/>
          <q-btn unelevated label="Tolak" color="red-6" @click="handleAction('reject')" :loading="submitting" :disable="!reason.trim()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Revisi Dialog -->
    <q-dialog v-model="showRevisiDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width:500px">
        <q-card-section class="tw-bg-orange-600 tw-text-white tw-py-4"><div class="text-h6 tw-font-bold">Revisi Permintaan</div></q-card-section>
        <q-card-section class="tw-p-6">
          <q-input v-model="reason" outlined type="textarea" rows="3" label="Alasan Revisi *" counter maxlength="500"/>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup/>
          <q-btn unelevated label="Revisi" color="orange-6" @click="handleAction('revise')" :loading="submitting" :disable="!reason.trim()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { domain, empid, decryptMessage } from '../../../utils';
import { useRouter, useRoute } from 'vue-router';
import { useNotify } from '../../../composables/useNotify';

const router = useRouter();
const route = useRoute();
const { success, error: showError } = useNotify();

const loading = ref(true);
const submitting = ref(false);
const ticket = ref({});
const logs = ref([]);
const catatan = ref('');
const reason = ref('');
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showRevisiDialog = ref(false);

const canApprove = computed(() => {
  const nik = decryptMessage(empid());
  return nik === ticket.value.pinjam_user_approve &&
    ['Kirim Atasan User', 'Kirim Legal', 'Kirim Revisi Legal', 'Kirim Arsiparis'].includes(ticket.value.pinjam_status);
});

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status) => {
  const map = { 'Kirim Atasan User': 'orange', 'Kirim Legal': 'blue', 'Kirim Arsiparis': 'purple', 'Proses BAST': 'teal', 'Selesai BAST': 'green', 'Peminjaman Berhasil': 'green', 'Tolak': 'red', 'Revisi': 'amber' };
  return map[status] || 'grey';
};

const loadDetail = async () => {
  try {
    loading.value = true;
    const id = decodeURIComponent(route.params.id);
    const [ticketRes, logRes] = await Promise.all([
      axios.get(`/dms/listPeminjaman`, { params: { rowsPerPage: 1, page: 1, sortBy: 'asc', descending: false, filter: '', user_nik: empid() } }),
      axios.get(`/dms/getLogTiket`, { params: { no_tiket: id } })
    ]);

    // Find the ticket by pinjam_no_tiket from list
    const allTickets = ticketRes.data?.data || [];
    const found = allTickets.find(t => t.pinjam_no_tiket === id || String(t.id) === String(id));

    if (!found) {
      // Try direct query by getting all and filtering
      const allRes = await axios.get(`/dms/listPeminjaman`, { params: { rowsPerPage: 9999, page: 1, sortBy: 'asc', descending: false, filter: id, user_nik: empid() } });
      const allData = allRes.data?.data || [];
      const match = allData.find(t => t.pinjam_no_tiket === id || String(t.id) === String(id));
      if (match) ticket.value = match;
      else { showError('Data tidak ditemukan'); router.push('/dms/peminjaman-dokumen'); return; }
    } else {
      ticket.value = found;
    }

    logs.value = logRes.data || [];
  } catch (err) {
    showError('Gagal memuat data');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleAction = async (action) => {
  if ((action === 'reject' || action === 'revise') && !reason.value.trim()) {
    showError(action === 'reject' ? 'Alasan penolakan wajib diisi' : 'Alasan revisi wajib diisi');
    return;
  }
  try {
    submitting.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/processApprovalDirect`, {
      token: ticket.value.tr_token,
      action,
      notes: catatan.value,
      revisi_reason: reason.value,
    }, { skipErrorInterceptor: true });

    const msg = { approve: 'Permintaan berhasil disetujui', revise: 'Permintaan dikembalikan untuk revisi', reject: 'Permintaan ditolak' };
    success(msg[action]);
    showApproveDialog.value = false;
    showRejectDialog.value = false;
    showRevisiDialog.value = false;
    await loadDetail();
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal memproses');
  } finally {
    submitting.value = false;
  }
};

onMounted(loadDetail);
</script>


