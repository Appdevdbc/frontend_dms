<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="description" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Detail Mutasi Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/mutasi' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Mutasi Arsip
              </router-link>
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
            <q-badge 
              :color="getStatusColor(ticket.tr_status)" 
              :label="getStatusText(ticket.tr_status)"
              class="tw-text-base tw-px-4 tw-py-2"
            />
          </div>

          <!-- Two Column Layout -->
          <div class="row q-col-gutter-md tw-mb-6">
            <!-- Left Column -->
            <div class="col-12 col-md-6">
              <!-- Bisnis Unit -->
              <q-input
                v-model="ticket.bu_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Bisnis Unit</span>
                </template>
              </q-input>

              <!-- No. Mutasi -->
              <q-input
                v-model="ticket.tr_no_tiket"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">No. Mutasi</span>
                </template>
              </q-input>

              <!-- Tanggal Pengajuan -->
              <q-input
                :model-value="formatDate(ticket.tr_tgl_pengajuan)"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Pengajuan</span>
                </template>
              </q-input>

              <!-- Target Waktu Mutasi -->
              <q-input
                v-model="ticket.tr_target_mutasi"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_month" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Target Waktu Mutasi</span>
                </template>
              </q-input>

              <!-- Tanggal Mutasi -->
              <q-input
                :model-value="formatDate(ticket.tr_tgl_mutasi)"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Mutasi</span>
                </template>
              </q-input>

              <!-- Lokasi Arsip Lama -->
              <q-input
                v-model="ticket.lokasi_lama_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Lokasi Arsip Lama</span>
                </template>
              </q-input>

              <!-- Arsiparis Lama -->
              <q-input
                v-model="ticket.arsiparis_lama_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Lama</span>
                </template>
              </q-input>

              <!-- Atasan Arsiparis Lama -->
              <q-input
                v-model="ticket.atasan_lama_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="supervisor_account" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Lama</span>
                </template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <!-- Lokasi Arsip Baru -->
              <q-input
                v-model="ticket.lokasi_baru_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Lokasi Arsip Baru</span>
                </template>
              </q-input>

              <!-- Arsiparis Baru -->
              <q-input
                v-model="ticket.arsiparis_baru_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Baru</span>
                </template>
              </q-input>

              <!-- Atasan Arsiparis Baru -->
              <q-input
                v-model="ticket.atasan_baru_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="supervisor_account" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Baru</span>
                </template>
              </q-input>

              <!-- Catatan Arsiparis Lama -->
              <q-input
                v-model="ticket.tr_catatan_arsiparis_lama"
                outlined
                readonly
                type="textarea"
                rows="3"
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="note" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Catatan Arsiparis Lama</span>
                </template>
              </q-input>

              <!-- Keterangan Mutasi Arsip -->
              <q-input
                v-model="ticket.tr_keterangan_pemusnahan"
                outlined
                readonly
                type="textarea"
                rows="5"
                label-slot
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Keterangan Mutasi Arsip</span>
                </template>
              </q-input>
            </div>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Document List Section -->
          <div class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="folder_open" color="blue-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Daftar Arsip</div>
            </div>
            
            <q-table
              :rows="documents"
              :columns="documentColumns"
              row-key="trdet_no_arsip"
              flat
              bordered
              class="tw-shadow-md tw-rounded-xl"
            />
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
                :icon="getLogIcon(log.trs_log_status)"
                :color="getLogColor(log.trs_log_status)"
              >
                <div class="tw-text-sm tw-text-slate-600">
                  <div><strong>PIC:</strong> {{ log.account_name || '-' }}</div>
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
            <q-btn 
              label="Kembali" 
              color="blue-7" 
              push
              icon="arrow_back"
              class="tw-px-6 tw-font-semibold"
              @click="$router.push('/dms/mutasi')"
            />
            
            <q-btn 
              v-if="canApprove"
              label="Approve" 
              color="green-6" 
              push
              icon="check_circle"
              class="tw-px-6 tw-font-semibold"
              @click="showApprovalDialog = true"
            />
            
            <q-btn 
              v-if="canReject"
              label="Tolak" 
              color="red-6" 
              push
              icon="cancel"
              class="tw-px-6 tw-font-semibold"
              @click="showRejectionDialog = true"
            />
            
            <q-btn 
              v-if="canRevise"
              label="Revisi" 
              color="orange-6" 
              push
              icon="edit"
              class="tw-px-6 tw-font-semibold"
              @click="goToRevise"
            />
            
            <q-btn 
              v-if="canRevisiApproval"
              label="Revisi" 
              color="orange-6" 
              push
              icon="edit_note"
              class="tw-px-6 tw-font-semibold"
              @click="showRevisiApprovalDialog = true"
            />
            
            <q-btn 
              v-if="canExecute"
              label="Eksekusi Pemindahan" 
              color="purple-6" 
              push
              icon="swap_horiz"
              class="tw-px-6 tw-font-semibold"
              @click="showExecutionDialog = true"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialogs -->
    <ApprovalDialog
      v-model="showApprovalDialog"
      :ticket-data="ticket"
      module="mutasi"
      @approved="onApproved"
    />
    <RejectionDialog
      v-model="showRejectionDialog"
      :ticket-data="ticket"
      module="mutasi"
      @rejected="onRejected"
    />
    <ExecutionDialog
      v-model="showExecutionDialog"
      :ticket-data="ticket"
      module="mutasi"
      @executed="onExecuted"
    />

    <!-- Revisi Approval Dialog -->
    <q-dialog v-model="showRevisiApprovalDialog" persistent>
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
            v-model="alasanRevisiApproval"
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
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="revisiLoading" />
          <q-btn unelevated label="Ya, Revisi" color="orange-7" @click="handleRevisiApproval" :loading="revisiLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
import { domain, empid } from "../../../utils";
import { useRouter, useRoute } from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import ApprovalDialog from "../../../components/WJS/Pemusnahan/ApprovalDialog.vue";
import RejectionDialog from "../../../components/WJS/Pemusnahan/RejectionDialog.vue";
import ExecutionDialog from "../../../components/WJS/Pemusnahan/ExecutionDialog.vue";

const router = useRouter();
const route = useRoute();
const { success, error: showError } = useNotify();
const loading = ref(false);

const ticket = reactive({
  tr_no_tiket: '',
  tr_tgl_pengajuan: null,
  tr_tgl_mutasi: null,
  tr_target_mutasi: '',
  tr_keterangan_pemusnahan: '',
  tr_catatan_arsiparis_lama: '',
  tr_status: 0,
  bu_name: '',
  lokasi_lama_name: '',
  lokasi_baru_name: '',
  arsiparis_lama_name: '',
  arsiparis_baru_name: '',
  atasan_lama_name: '',
  atasan_baru_name: '',
  tr_user_id: '',
  tr_atasan_user_id: '',
  tr_arsiparis_lama_id: '',
  tr_atasan_arsiparis_lama_id: '',
  tr_arsiparis_baru_id: '',
  tr_atasan_arsiparis_baru_id: ''
});

const documents = ref([]);
const logs = ref([]);
const showApprovalDialog = ref(false);
const showRejectionDialog = ref(false);
const showExecutionDialog = ref(false);
const showRevisiApprovalDialog = ref(false);
const alasanRevisiApproval = ref('');
const revisiLoading = ref(false);

const documentColumns = [
  { name: 'trdet_no_arsip', label: 'Kode Arsip', field: 'trdet_no_arsip', align: 'center' },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left' },
  { name: 'content_doc', label: 'No. Document', field: 'content_doc', align: 'center' },
  { name: 'status_berlaku', label: 'Status Berlaku Arsip', field: 'status_berlaku', align: 'center' },
  { name: 'direktorat_name', label: 'Document Owner', field: 'direktorat_name', align: 'left' },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left' },
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', field: 'lokasi_arsip_name', align: 'left' },
  { name: 'trdet_keterangan', label: 'Keterangan', field: 'trdet_keterangan', align: 'left' }
];

const currentUserNik = window.localStorage.getItem("nik") || "";

// Use backend-computed permission flags (based on correct empid comparison)
const canApprove = computed(() => ticket.can_approve === true);
const canReject = computed(() => ticket.can_reject === true);

const canRevise = computed(() => ticket.can_revise === true);

const canRevisiApproval = computed(() => ticket.can_revisi_approval === true);

const canExecute = computed(() => ticket.can_execute === true);

const getStatusText = (status) => {
  const statusMap = {
    1: 'Approval Atasan User Pembuat',
    2: 'Revisi User Pembuat',
    3: 'Ditolak',
    4: 'Approval Arsiparis Lama',
    5: 'Approval Atasan Arsiparis Lama',
    6: 'Approval Arsiparis Baru',
    7: 'Approval Atasan Arsiparis Baru',
    8: 'Pemindahan Arsip',
    9: 'Selesai'
  };
  return statusMap[status] || 'Unknown';
};

const getStatusColor = (status) => {
  if (status === 3) return 'red';
  if (status === 8) return 'purple';
  if (status === 9) return 'green';
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
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getTicketDetail = async () => {
  try {
    loading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/${route.params.id}`, {
      params: { empid: empid(), domain: domain() },
      skipErrorInterceptor: true
    });

    Object.assign(ticket, res.data.data.header);
    documents.value = res.data.data.details;
    logs.value = res.data.data.logs;

    loading.value = false;
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal memuat data');
    router.push('/dms/mutasi');
  }
};

const onApproved = () => {
  getTicketDetail();
};

const onRejected = () => {
  getTicketDetail();
};

const goToRevise = () => {
  router.push(`/dms/mutasi/${route.params.id}/revise`);
};

const onExecuted = () => {
  router.push('/dms/mutasi');
};

const handleRevisiApproval = async () => {
  if (!alasanRevisiApproval.value || alasanRevisiApproval.value.trim() === '') {
    showError('Alasan revisi wajib diisi');
    return;
  }
  
  try {
    revisiLoading.value = true;
    await axios.post(
      `${import.meta.env.VITE_API}dms/mutasi/${route.params.id}/revisi-approval`,
      {
        creator: empid(),
        alasan: alasanRevisiApproval.value
      },
      { skipErrorInterceptor: true }
    );
    revisiLoading.value = false;
    showRevisiApprovalDialog.value = false;
    success('Tiket berhasil dikembalikan untuk direvisi');
    getTicketDetail();
  } catch (error) {
    revisiLoading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal merevisi tiket');
  }
};

onMounted(() => {
  getTicketDetail();
});
</script>


