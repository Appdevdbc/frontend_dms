<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="report_problem" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Detail Pengaduan</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link to="/dms/pengaduan" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">Pengaduan</router-link>
              <q-icon name="chevron_right" size="14px"/>
              <span>Detail</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div class="tw-max-w-7xl tw-mx-auto">
          <!-- Status Badge -->
          <div class="tw-mb-6">
            <q-badge :color="getStatusColor(ticket.tr_adu_status)" :label="ticket.tr_adu_status" class="tw-text-base tw-px-4 tw-py-2"/>
          </div>

          <!-- Two Column Layout -->
          <div class="row q-col-gutter-md tw-mb-6">
            <!-- Left Column -->
            <div class="col-12 col-md-6">
              <q-input v-model="ticket.tr_no_adu" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="confirmation_number" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">No. Pengaduan</span></template>
              </q-input>

              <q-input :model-value="formatDate(ticket.tr_tgl_adu)" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Tanggal Pengaduan</span></template>
              </q-input>

              <q-input v-model="ticket.tr_adu_no_doc" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="description" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">No. Dokumen</span></template>
              </q-input>

              <q-input v-model="ticket.content_name" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="article" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Nama Dokumen</span></template>
              </q-input>

              <q-input :model-value="formatDate(ticket.content_entrydate)" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Tanggal Dokumen</span></template>
              </q-input>

              <q-input v-model="ticket.arsip_no" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="qr_code" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Kode Arsip</span></template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <div class="tw-mb-4">
                <q-input v-model="ticket.tr_adu_prioritas_approve" outlined readonly label-slot>
                  <template v-slot:prepend><q-icon name="priority_high" color="blue-6"/></template>
                  <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Prioritas Approval</span></template>
                  <template v-slot:append>
                    <q-btn flat dense color="blue-6" label="View Detail" size="sm" @click="viewApprovalDetail"/>
                  </template>
                </q-input>
              </div>

              <q-input v-model="ticket.tr_adu_judul" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="title" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Judul Pengaduan</span></template>
              </q-input>

              <q-input v-model="ticket.bu_name" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="business" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Bisnis Unit</span></template>
              </q-input>

              <q-input v-model="ticket.lokasi_arsip_name" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="location_on" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Lokasi Penyimpanan</span></template>
              </q-input>

              <q-input v-model="ticket.content_kode_lemari" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="inventory_2" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Kode Lemari</span></template>
              </q-input>

              <q-input v-model="ticket.tr_adu_kategori" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="report_problem" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Kategori Pengaduan</span></template>
              </q-input>

              <div v-if="ticket.tr_file_upload_user" class="tw-mb-4">
                <q-input :model-value="ticket.tr_file_upload_user" outlined readonly label-slot>
                  <template v-slot:prepend><q-icon name="attach_file" color="blue-6"/></template>
                  <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Upload Lampiran</span></template>
                  <template v-slot:append>
                    <q-btn flat dense icon="open_in_new" color="blue-6" size="sm"
                      @click="openFile(ticket.tr_file_upload_user)"/>
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Uraian -->
          <q-input v-model="ticket.tr_adu_uraian_user" outlined readonly type="textarea" rows="4" label-slot class="tw-mb-6">
            <template v-slot:prepend><q-icon name="notes" color="blue-6"/></template>
            <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Uraian Pengaduan</span></template>
          </q-input>

          <!-- Lampiran Jawaban (when Selesai) -->
          <div v-if="ticket.tr_adu_status === 'Selesai' && ticket.tr_adu_lampiran_selesai" class="tw-mb-6">
            <q-separator class="tw-my-4 tw-bg-slate-200"/>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="task_alt" color="green-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Lampiran Jawaban</div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input :model-value="ticket.tr_adu_lampiran_selesai" outlined readonly label-slot>
                  <template v-slot:prepend><q-icon name="attach_file" color="green-6"/></template>
                  <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Berkas</span></template>
                  <template v-slot:append>
                    <q-btn flat dense icon="open_in_new" color="blue-6" size="sm"
                      @click="openFile(ticket.tr_adu_lampiran_selesai)"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input :model-value="ticket.tr_adu_keterangan_selesai" outlined readonly label-slot>
                  <template v-slot:prepend><q-icon name="notes" color="green-6"/></template>
                  <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Keterangan Penyelesaian</span></template>
                </q-input>
              </div>
            </div>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Audit Log Timeline -->
          <div class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="history" color="blue-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Riwayat</div>
            </div>
            <q-timeline color="blue-6">
              <q-timeline-entry v-for="(log, i) in logs" :key="i"
                :title="log.trs_log_proses" :subtitle="log.tanggal"
                :icon="log.trs_log_status == 1 ? 'check_circle' : 'schedule'"
                :color="log.trs_log_status == 1 ? 'green-6' : 'orange-6'">
                <div class="tw-text-sm tw-text-slate-600">
                  <div><strong>PIC:</strong> {{ log.account_name || '-' }}</div>
                  <div><strong>Hasil:</strong> {{ log.trs_log_hasil }}</div>
                  <div v-if="log.trs_log_catatan"><strong>Catatan:</strong> {{ log.trs_log_catatan }}</div>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </div>

          <!-- Action Buttons -->
          <div class="tw-flex tw-gap-3 tw-justify-end tw-flex-wrap">
            <q-btn label="Kembali" color="red-7" push icon="arrow_back" class="tw-px-6 tw-font-semibold" @click="$router.push('/dms/pengaduan')"/>

            <q-btn v-if="ticket.can_approve_atasan" label="Konfirmasi" color="green-6" push icon="check_circle"
              class="tw-px-6 tw-font-semibold" @click="showConfirmDialog = true"/>
            <q-btn v-if="ticket.can_approve_atasan" label="Revisi" color="orange-6" push icon="edit_note"
              class="tw-px-6 tw-font-semibold" @click="showRejectDialog = true"/>

            <q-btn v-if="ticket.can_approve_legal_sh" label="Konfirmasi" color="green-6" push icon="check_circle"
              class="tw-px-6 tw-font-semibold" @click="showConfirmDialog = true"/>
            <q-btn v-if="ticket.can_approve_legal_sh" label="Tolak" color="red-6" push icon="cancel"
              class="tw-px-6 tw-font-semibold" @click="showRejectDialog = true"/>

            <q-btn v-if="ticket.can_approve_legal_dh" label="Konfirmasi" color="green-6" push icon="check_circle"
              class="tw-px-6 tw-font-semibold" @click="showConfirmDialog = true"/>
            <q-btn v-if="ticket.can_approve_legal_dh" label="Tolak" color="red-6" push icon="cancel"
              class="tw-px-6 tw-font-semibold" @click="showRejectDialog = true"/>

            <q-btn v-if="ticket.can_selesai" label="Selesai" color="purple-6" push icon="task_alt"
              class="tw-px-6 tw-font-semibold" @click="showSelesaiDialog = true"/>

            <q-btn v-if="ticket.can_revise" label="Revisi" color="orange-6" push icon="edit"
              class="tw-px-6 tw-font-semibold" @click="openRevisionForm"/>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Confirm Dialog (Approve) -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card class="tw-rounded-2xl" style="min-width: 400px">
        <q-card-section class="tw-bg-green-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Konfirmasi</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg">Apakah anda yakin untuk menyetujui pengaduan ini?</p>
          <p class="tw-text-slate-500 tw-text-sm tw-mt-2">Tindakan ini tidak dapat dibatalkan.</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup/>
          <q-btn unelevated label="Konfirmasi" color="green-6" @click="handleApprove" :loading="actionLoading"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject/Revisi Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-rounded-2xl" style="min-width: 500px">
        <q-card-section class="tw-bg-red-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">{{ isLegalReject ? 'Tolak Pengaduan' : 'Revisi Pengaduan' }}</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p>Silakan masukkan alasan:</p>
          <q-input v-model="rejectReason" outlined type="textarea" rows="4" label="Alasan" counter maxlength="300"/>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup/>
          <q-btn unelevated label="Submit" color="red-6" @click="handleReject" :loading="actionLoading"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Selesai Dialog -->
    <q-dialog v-model="showSelesaiDialog" persistent>
      <q-card class="tw-rounded-2xl" style="min-width: 500px">
        <q-card-section class="tw-bg-purple-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Selesaikan Pengaduan</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <q-file v-model="selesaiFile" outlined label="Berkas Lampiran" accept=".pdf" class="tw-mb-4">
            <template v-slot:prepend><q-icon name="attach_file"/></template>
          </q-file>
          <q-input v-model="selesaiKeterangan" outlined type="textarea" rows="4" label="Keterangan Penyelesaian"/>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup/>
          <q-btn unelevated label="Selesai" color="purple-6" @click="handleSelesai" :loading="actionLoading"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Revision Form Dialog -->
    <PengaduanFormDialog v-model="showRevisionDialog" :revision-data="ticket" @saved="loadData"/>

    <!-- File Preview Dialog -->
    <q-dialog v-model="showFileDialog" maximized>
      <q-card>
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="visibility" size="32px" />
              <div class="tw-text-xl tw-font-bold">Preview File</div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showFileDialog = false" />
          </div>
        </q-card-section>
        <q-card-section class="tw-p-0" style="height: calc(100vh - 80px);">
          <iframe :src="fileUrl" style="width: 100%; height: 100%; border: none;"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import axios from "axios";
import { domain, empid } from "../../../utils";
import { useRouter, useRoute } from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import PengaduanFormDialog from "../../../components/WJS/Pengaduan/PengaduanFormDialog.vue";

const router = useRouter();
const route = useRoute();
const { success, error: showError } = useNotify();
const apiUrl = import.meta.env.VITE_API;
const fileBaseUrl = import.meta.env.VITE_FTP || apiUrl;

const ticket = reactive({});
const logs = ref([]);
const actionLoading = ref(false);
const rejectReason = ref('');
const selesaiFile = ref(null);
const selesaiKeterangan = ref('');

const showConfirmDialog = ref(false);
const showRejectDialog = ref(false);
const showSelesaiDialog = ref(false);
const showRevisionDialog = ref(false);
const showFileDialog = ref(false);
const fileUrl = ref('');

const isLegalReject = computed(() => ticket.can_approve_legal_sh || ticket.can_approve_legal_dh);

const statusColorMap = {
  'Masih menunggu persetujuan atasan dokumen owner': 'orange-6',
  'Menunggu persetujuan corporate legal SH': 'blue-6',
  'Menunggu persetujuan corporate legal DH': 'blue-8',
  'Pengaduan diterima dan sedang diproses': 'purple-6',
  'Selesai': 'green-6',
  'Pengaduan ditolak': 'red-6'
};
const getStatusColor = (s) => statusColorMap[s] || 'grey-6';

const formatDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const loadData = async () => {
  try {
    const res = await axios.get(`${apiUrl}dms/pengaduan/${route.params.id}`, {
      params: { creator: empid() }
    });
    const d = res.data.data;
    Object.assign(ticket, d);
    logs.value = d.logs || [];
  } catch (e) {
    showError('Gagal memuat data');
    router.push('/dms/pengaduan');
  }
};

const handleApprove = async () => {
  actionLoading.value = true;
  try {
    let url = '';
    if (ticket.can_approve_atasan) url = `${apiUrl}dms/pengaduan/${route.params.id}/approve-atasan`;
    else if (ticket.can_approve_legal_sh) url = `${apiUrl}dms/pengaduan/${route.params.id}/approve-legal-sh`;
    else if (ticket.can_approve_legal_dh) url = `${apiUrl}dms/pengaduan/${route.params.id}/approve-legal-dh`;

    await axios.post(url, { creator: empid() }, { skipErrorInterceptor: true });
    success('Pengaduan berhasil diproses');
    showConfirmDialog.value = false;
    loadData();
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal memproses');
  }
  actionLoading.value = false;
};

const handleReject = async () => {
  actionLoading.value = true;
  try {
    let url = '';
    if (ticket.can_approve_atasan) url = `${apiUrl}dms/pengaduan/${route.params.id}/reject-atasan`;
    else if (ticket.can_approve_legal_sh) url = `${apiUrl}dms/pengaduan/${route.params.id}/reject-legal-sh`;
    else if (ticket.can_approve_legal_dh) url = `${apiUrl}dms/pengaduan/${route.params.id}/reject-legal-dh`;

    await axios.post(url, { creator: empid(), reason: rejectReason.value }, { skipErrorInterceptor: true });
    success('Pengaduan berhasil diproses');
    showRejectDialog.value = false;
    rejectReason.value = '';
    loadData();
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal memproses');
  }
  actionLoading.value = false;
};

const handleSelesai = async () => {
  actionLoading.value = true;
  try {
    if (selesaiFile.value) {
      const formData = new FormData();
      formData.append('filelampiran', selesaiFile.value);
      formData.append('creator', empid());
      formData.append('keterangan', selesaiKeterangan.value);
      await axios.post(`${apiUrl}dms/pengaduan/${route.params.id}/selesai`, formData, { skipErrorInterceptor: true });
    } else {
      await axios.post(`${apiUrl}dms/pengaduan/${route.params.id}/selesai`, {
        creator: empid(), keterangan: selesaiKeterangan.value
      }, { skipErrorInterceptor: true });
    }
    success('Pengaduan berhasil diselesaikan');
    showSelesaiDialog.value = false;
    loadData();
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal menyelesaikan');
  }
  actionLoading.value = false;
};

const openRevisionForm = () => { showRevisionDialog.value = true; };

const openFile = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  
  if (isPdf || isImage) {
    fileUrl.value = `${fileBaseUrl}dmslegal/${filename}`;
    showFileDialog.value = true;
  } else {
    window.open(`${fileBaseUrl}dmslegal/${filename}`, '_blank');
  }
};

const viewApprovalDetail = () => {
  const buLogin = domain();
  const url = `/app/mapproval/viewapproval?bu_id=${buLogin}&app_prioritas=${ticket.tr_adu_prioritas_approve}&app_jns_trans=8`;
  window.open(url, 'blank', 'width=800,height=600');
};

onMounted(() => { loadData(); });
</script>


