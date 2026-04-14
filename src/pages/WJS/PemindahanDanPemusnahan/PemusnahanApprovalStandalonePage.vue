<template>
  <div class="tw-min-h-screen tw-bg-gradient-to-br tw-from-slate-50 tw-to-red-50 tw-py-8">
    <div class="tw-max-w-6xl tw-mx-auto tw-px-4">
      <!-- Loading State -->
      <div v-if="loading" class="tw-text-center tw-py-20">
        <q-spinner color="red-6" size="60px" />
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

      <!-- Main Content -->
      <div v-else-if="ticketData">
        <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
          <!-- Header -->
          <q-card-section class="tw-bg-gradient-to-r tw-from-red-900 tw-to-red-700 tw-text-white tw-py-6">
            <div class="tw-flex tw-items-center tw-justify-between">
              <div class="tw-flex tw-items-center tw-gap-3">
                <q-icon :name="isArsiparis ? 'inventory_2' : 'approval'" size="32px"/>
                <div>
                  <div class="text-h5 tw-font-bold">{{ isArsiparis ? 'Proses Pemusnahan Arsip' : 'Approval Pemusnahan Arsip' }}</div>
                  <div class="tw-text-red-100 tw-text-sm tw-mt-1">{{ approverInfo.role }}</div>
                </div>
              </div>
              <div class="tw-text-right">
                <div class="tw-text-red-100 tw-text-xs">{{ isArsiparis ? 'Arsiparis' : 'Approver' }}</div>
                <div class="tw-font-semibold">{{ approverInfo.name }}</div>
              </div>
            </div>
          </q-card-section>

          <!-- Ticket Info Banner -->
          <q-card-section class="tw-bg-red-50 tw-border-b tw-border-red-100">
            <div class="tw-flex tw-items-center tw-justify-between">
              <div>
                <div class="tw-text-red-900 tw-font-bold tw-text-xl">{{ ticketData.header.tr_no_tiket }}</div>
                <div class="tw-text-red-700 tw-text-sm tw-mt-1">Status: {{ ticketData.header.status_text }}</div>
              </div>
              <q-badge :color="getStatusColor(ticketData.header.tr_status)" class="tw-px-4 tw-py-2 tw-text-sm">
                {{ ticketData.header.status_text }}
              </q-badge>
            </div>
          </q-card-section>

          <!-- Ticket Details -->
          <q-card-section class="tw-p-6">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="info" color="red-6"/>
              Informasi Pemusnahan
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Bisnis Unit</div>
                  <div class="tw-text-slate-900 tw-font-semibold tw-text-lg">{{ ticketData.header.bu_name || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Kategori Dokumen</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_kategori_dokumen }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">No. Pemusnahan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_no_tiket }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Tanggal Pengajuan</div>
                  <div class="tw-text-slate-900 tw-font-semibold tw-text-lg">{{ formatDate(ticketData.header.tr_tgl_pengajuan) }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Target Waktu Pemusnahan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_target_pemusnahan || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Tanggal Pemusnahan</div>
                  <div class="tw-text-slate-900 tw-font-semibold tw-text-lg">{{ formatDate(ticketData.header.tr_tgl_pemusnahan) }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Kategori Keamanan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_kategori_keamanan }}</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Prioritas Approval</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_prioritas_approval }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Lokasi Penyimpanan Arsip</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.lokasi_arsip_name || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Arsiparis Lokasi</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.arsiparis_name || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Atasan Arsiparis Lokasi</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.arsiparis_atasan_name || '-' }}</div>
                </div>
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Keterangan Pemusnahan Arsip</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_keterangan_pemusnahan || '-' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Documents Table -->
          <q-card-section class="tw-p-6 tw-bg-slate-50">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="folder_open" color="red-6"/>
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
                    class="bg-red-9 tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>

          <!-- ============================================ -->
          <!-- ARSIPARIS FORM (status 7) -->
          <!-- ============================================ -->
          <q-card-section v-if="isArsiparis" class="tw-p-6 tw-bg-white tw-border-t tw-border-slate-200">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="description" color="red-6"/>
              Proses Pemusnahan Arsip
            </div>

            <div class="row q-col-gutter-md">
              <!-- Row 1: Arsiparis + Date + No. Pemusnahan -->
              <div class="col-12 col-md-4">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Arsiparis Lokasi</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ approverInfo.name }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="arsiparisForm.tgl_pemusnahan"
                  outlined
                  type="date"
                  label-slot
                  class="tw-mb-4"
                  bg-color="white"
                >
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Pada Tanggal</span>
                    <span class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <div class="tw-mb-4">
                  <div class="tw-text-slate-500 tw-text-sm tw-mb-1">No. Pemusnahan</div>
                  <div class="tw-text-slate-900 tw-font-semibold">{{ ticketData.header.tr_no_tiket }}</div>
                </div>
              </div>
            </div>

            <div class="tw-text-slate-900 tw-mb-4">Telah melakukan pemusnahan dokumen arsip</div>

            <!-- Saksi 1 & Saksi 2 inline -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="arsiparisForm.saksi1_nik"
                  outlined
                  label-slot
                  class="tw-mb-1"
                  bg-color="white"
                  @blur="lookupSaksi(1)"
                >
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Saksi 1 (NIK)</span>
                    <span class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                </q-input>
                <div v-if="saksi1Name" class="tw-text-green-700 tw-text-sm tw-mb-4">✓ {{ saksi1Name }}</div>
                <div v-else class="tw-mb-4"></div>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="arsiparisForm.saksi2_nik"
                  outlined
                  label-slot
                  class="tw-mb-1"
                  bg-color="white"
                  @blur="lookupSaksi(2)"
                >
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Saksi 2 (NIK)</span>
                    <span class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                </q-input>
                <div v-if="saksi2Name" class="tw-text-green-700 tw-text-sm tw-mb-4">✓ {{ saksi2Name }}</div>
                <div v-else class="tw-mb-4"></div>
              </div>
            </div>

            <!-- Generate BAST Button -->
            <q-btn
              unelevated
              color="red-7"
              label="Generate Berita Acara Pemusnahan Arsip"
              icon="picture_as_pdf"
              class="tw-mb-4"
              :disable="!arsiparisForm.saksi1_nik || !arsiparisForm.saksi2_nik || !arsiparisForm.tgl_pemusnahan"
              @click="generateBAST"
            />

            <!-- File Uploads -->
            <div class="tw-mt-4 tw-mb-4">
              <div class="tw-text-slate-700 tw-font-semibold tw-mb-3">Scan Berita Acara Pemusnahan Arsip :</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-file
                    v-model="arsiparisForm.upload1"
                    outlined
                    label="Upload 1"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="tw-mb-4"
                    bg-color="white"
                  >
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                  <q-file
                    v-model="arsiparisForm.upload3"
                    outlined
                    label="Upload 3"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="tw-mb-4"
                    bg-color="white"
                  >
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                </div>
                <div class="col-12 col-md-6">
                  <q-file
                    v-model="arsiparisForm.upload2"
                    outlined
                    label="Upload 2"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="tw-mb-4"
                    bg-color="white"
                  >
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                  <q-file
                    v-model="arsiparisForm.upload4"
                    outlined
                    label="Upload 4"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="tw-mb-4"
                    bg-color="white"
                  >
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="tw-flex tw-gap-4 tw-justify-end">
              <q-btn
                label="Kirim"
                color="red-7"
                size="lg"
                push
                icon="send"
                class="tw-px-8"
                @click="showArsiparisConfirmDialog = true"
                :disable="submitting"
              />
            </div>
          </q-card-section>

          <!-- ============================================ -->
          <!-- STANDARD APPROVAL ACTIONS (non-arsiparis) -->
          <!-- ============================================ -->
          <q-card-section v-else class="tw-p-6 tw-bg-white tw-border-t tw-border-slate-200">
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="task" color="red-6"/>
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

    <!-- Arsiparis Confirm Dialog -->
    <q-dialog v-model="showArsiparisConfirmDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden tw-min-w-[400px]">
        <q-card-section class="tw-bg-red-700 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="send" size="24px"/>
            Konfirmasi Pemusnahan
          </div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-text-lg">Apakah anda yakin untuk melanjutkan pemusnahan arsip ini?</p>
          <p class="tw-text-slate-500 tw-text-sm tw-mt-2">Tindakan ini tidak dapat dibatalkan.</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Konfirmasi" color="red-7" @click="handleSubmitArsiparis" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
          <p class="tw-text-slate-700 tw-text-lg">Apakah Anda yakin ingin menyetujui pemusnahan arsip ini?</p>
          <p class="tw-text-slate-500 tw-text-sm tw-mt-2">Tindakan ini tidak dapat dibatalkan.</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="submitting" />
          <q-btn unelevated label="Ya, Setujui" color="green-7" @click="handleApprove" :loading="submitting" />
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
          <p class="tw-text-slate-700 tw-text-lg tw-mb-4">Apakah Anda yakin ingin mengembalikan pemusnahan arsip ini untuk direvisi?</p>
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
          <p class="tw-text-slate-700 tw-text-lg tw-mb-4">Apakah Anda yakin ingin menolak pemusnahan arsip ini?</p>
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

    <!-- BAST Preview Dialog -->
    <q-dialog v-model="showBASTDialog" maximized>
      <q-card>
        <q-card-section class="tw-bg-red-700 tw-text-white tw-py-4">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <q-icon name="picture_as_pdf" size="32px" />
              <div class="text-h6 tw-font-bold">Preview BAST Pemusnahan</div>
            </div>
            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section class="tw-p-0" style="height: calc(100vh - 80px);">
          <iframe :src="bastIframeUrl" style="width: 100%; height: 100%; border: none;"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
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
const alasanRevisi = ref('');
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showRevisiDialog = ref(false);
const showArsiparisConfirmDialog = ref(false);
const submitting = ref(false);
const actionCompleted = ref(false);
const successMessage = ref('');
const countdown = ref(5);
let countdownInterval = null;

// Arsiparis-specific state
const arsiparisForm = reactive({
  tgl_pemusnahan: '',
  saksi1_nik: '',
  saksi2_nik: '',
  upload1: null,
  upload2: null,
  upload3: null,
  upload4: null
});
const saksi1Name = ref('');
const saksi2Name = ref('');


// Detect arsiparis mode (status 7)
const isArsiparis = computed(() => {
  const status = ticketData.value?.header?.tr_status;
  return status == 7;
});

// Only Atasan User (status 1) can request revision
const canRevisiApproval = computed(() => {
  const status = ticketData.value?.header?.tr_status;
  return status == 1;
});

const documentColumns = [
  { name: 'trdet_no_arsip', label: 'Kode Arsip', field: 'trdet_no_arsip', align: 'center' },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left' },
  { name: 'content_doc', label: 'No. Document', field: 'content_doc', align: 'center' },
  { name: 'status_berlaku', label: 'Status Berlaku Arsip', field: 'status_berlaku', align: 'center' },
  { name: 'direktorat_name', label: 'Document Owner', field: 'direktorat_name', align: 'left' },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left' },
  { name: 'trdet_keterangan', label: 'Keterangan', field: 'trdet_keterangan', align: 'left' }
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
  if (status === 8 || status === 9) return 'green';
  return 'orange';
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

const cleanupSession = () => {
  delete axios.defaults.headers.common['Authorization'];
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('empid');
  window.localStorage.removeItem('domain');
  window.localStorage.removeItem('nik');
  window.localStorage.removeItem('idle_time');
  window.localStorage.removeItem('temp_approval_session');
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

    cleanupSession();

    const validateRes = await axios.get(`${import.meta.env.VITE_API}dms/pemusnahan/validate-token`, {
      params: { token, url },
      headers: { Authorization: undefined },
      skipErrorInterceptor: true
    });

    const loginData = validateRes.data.data;
    
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

    approverInfo.value = {
      id: loginData.empid,
      name: loginData.nama,
      role: loginData.flag
    };

    const detailRes = await axios.get(`${import.meta.env.VITE_API}dms/pemusnahan/${loginData.tiket.ticket_id}`, {
      params: { empid: loginData.empid, domain: loginData.domain },
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

// ============================================
// Arsiparis-specific functions
// ============================================

const lookupSaksi = async (num) => {
  const nik = num === 1 ? arsiparisForm.saksi1_nik : arsiparisForm.saksi2_nik;
  if (!nik || nik.trim() === '') {
    if (num === 1) saksi1Name.value = '';
    else saksi2Name.value = '';
    return;
  }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/employee/${nik.trim()}`, {
      skipErrorInterceptor: true
    });
    if (res.data?.data?.nama) {
      if (num === 1) saksi1Name.value = res.data.data.nama;
      else saksi2Name.value = res.data.data.nama;
    } else {
      if (num === 1) saksi1Name.value = '';
      else saksi2Name.value = '';
      showError(`Saksi ${num} dengan NIK ${nik} tidak ditemukan`);
    }
  } catch (err) {
    if (num === 1) saksi1Name.value = '';
    else saksi2Name.value = '';
    showError(`Gagal mencari data Saksi ${num}`);
  }
};

const showBASTDialog = ref(false);
const bastIframeUrl = ref('');

const generateBAST = async () => {
  if (!arsiparisForm.saksi1_nik || !arsiparisForm.saksi2_nik || !arsiparisForm.tgl_pemusnahan) {
    showError('Saksi 1, Saksi 2, dan Tanggal Pemusnahan wajib diisi untuk generate BAST');
    return;
  }
  try {
    const ticketId = ticketData.value.header.tr_arsip_id;
    const res = await axios.get(
      `${import.meta.env.VITE_API}dms/pemusnahan/${ticketId}/generate-bast-pdf`,
      { params: { saksi1_nik: arsiparisForm.saksi1_nik.trim(), saksi2_nik: arsiparisForm.saksi2_nik.trim(), tgl_pemusnahan: arsiparisForm.tgl_pemusnahan }, skipErrorInterceptor: true }
    );
    const filename = res.data.data.filename;
    bastIframeUrl.value = `${import.meta.env.VITE_API}pdf/${filename}`;
    showBASTDialog.value = true;
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal generate BAST PDF');
  }
};

const handleSubmitArsiparis = async () => {
  // Validate required fields
  if (!arsiparisForm.tgl_pemusnahan) {
    showError('Tanggal Pemusnahan wajib diisi');
    return;
  }
  if (!arsiparisForm.saksi1_nik || arsiparisForm.saksi1_nik.trim() === '') {
    showError('Saksi 1 wajib diisi');
    return;
  }
  if (!arsiparisForm.saksi2_nik || arsiparisForm.saksi2_nik.trim() === '') {
    showError('Saksi 2 wajib diisi');
    return;
  }

  try {
    submitting.value = true;
    const ticketId = ticketData.value.header.tr_arsip_id;

    // Build FormData for multipart upload
    const formData = new FormData();
    formData.append('creator', approverInfo.value.id);
    formData.append('saksi1_nik', arsiparisForm.saksi1_nik.trim());
    formData.append('saksi2_nik', arsiparisForm.saksi2_nik.trim());
    formData.append('tgl_pemusnahan', arsiparisForm.tgl_pemusnahan);
    
    if (arsiparisForm.upload1) formData.append('upload1', arsiparisForm.upload1);
    if (arsiparisForm.upload2) formData.append('upload2', arsiparisForm.upload2);
    if (arsiparisForm.upload3) formData.append('upload3', arsiparisForm.upload3);
    if (arsiparisForm.upload4) formData.append('upload4', arsiparisForm.upload4);

    await axios.post(
      `${import.meta.env.VITE_API}dms/pemusnahan/${ticketId}/submit-arsiparis`,
      formData,
      { 
        headers: { 'Content-Type': 'multipart/form-data' },
        skipErrorInterceptor: true 
      }
    );

    submitting.value = false;
    showArsiparisConfirmDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Berita Acara Pemusnahan berhasil dikirim';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal memproses pemusnahan arsip');
  }
};

// ============================================
// Standard approval functions
// ============================================

const handleApprove = async () => {
  if (!catatan.value || catatan.value.trim() === '') {
    showError('Catatan wajib diisi');
    return;
  }
  try {
    submitting.value = true;
    await axios.post(
      `${import.meta.env.VITE_API}dms/pemusnahan/${ticketData.value.header.tr_arsip_id}/approve`,
      { creator: approverInfo.value.id, catatan: catatan.value },
      { skipErrorInterceptor: true }
    );
    submitting.value = false;
    showApproveDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Pemusnahan arsip berhasil disetujui';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menyetujui pemusnahan');
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
      `${import.meta.env.VITE_API}dms/pemusnahan/${ticketData.value.header.tr_arsip_id}/reject`,
      { creator: approverInfo.value.id, alasan: alasanPenolakan.value },
      { skipErrorInterceptor: true }
    );
    submitting.value = false;
    showRejectDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Pemusnahan arsip berhasil ditolak';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal menolak pemusnahan');
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
      `${import.meta.env.VITE_API}dms/pemusnahan/${ticketData.value.header.tr_arsip_id}/revisi-approval`,
      { creator: approverInfo.value.id, alasan: alasanRevisi.value, catatan: catatan.value },
      { skipErrorInterceptor: true }
    );
    submitting.value = false;
    showRevisiDialog.value = false;
    actionCompleted.value = true;
    successMessage.value = 'Pemusnahan arsip berhasil dikembalikan untuk direvisi';
    cleanupSession();
    startCountdown();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal merevisi pemusnahan');
  }
};

onMounted(() => {
  loadTicketData();
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (window.localStorage.getItem('temp_approval_session')) cleanupSession();
});
</script>




