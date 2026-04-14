<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="description" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Detail Pemusnahan Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/pemusnahan' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Pemusnahan Arsip
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

              <!-- Kategori Dokumen -->
              <q-input
                v-model="ticket.tr_kategori_dokumen"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Dokumen</span>
                </template>
              </q-input>

              <!-- No. Pemusnahan -->
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
                  <span class="tw-font-semibold tw-text-slate-700">No. Pemusnahan</span>
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

              <!-- Target Waktu Pemusnahan -->
              <q-input
                v-model="ticket.tr_target_pemusnahan"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_month" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Target Waktu Pemusnahan</span>
                </template>
              </q-input>

              <!-- Tanggal Pemusnahan -->
              <q-input
                :model-value="formatDate(ticket.tr_tgl_pemusnahan)"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Pemusnahan</span>
                </template>
              </q-input>

              <!-- Kategori Keamanan -->
              <q-input
                :model-value="formatKategoriKeamanan(ticket.tr_kategori_keamanan)"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="security" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Keamanan</span>
                </template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <!-- Prioritas Approval with View Detail -->
              <div class="tw-mb-4">
                <div class="tw-flex tw-items-end tw-gap-2">
                  <q-input
                    v-model.number="ticket.tr_prioritas_approval"
                    outlined
                    readonly
                    label-slot
                    style="flex: 1"
                  >
                    <template v-slot:prepend>
                      <q-icon name="priority_high" color="blue-6"/>
                    </template>
                    <template v-slot:label>
                      <span class="tw-font-semibold tw-text-slate-700">Prioritas Approval</span>
                    </template>
                  </q-input>
                  <q-btn
                    flat
                    dense
                    color="blue-6"
                    label="View Detail"
                    icon="visibility"
                    @click="viewApprovalDetail"
                    class="tw-mb-1"
                  />
                </div>
              </div>

              <!-- Lokasi Penyimpanan Arsip -->
              <q-input
                v-model="ticket.lokasi_arsip_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Lokasi Penyimpanan Arsip</span>
                </template>
              </q-input>

              <!-- Arsiparis Lokasi -->
              <q-input
                v-model="ticket.arsiparis_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Lokasi</span>
                </template>
              </q-input>

              <!-- Atasan Arsiparis Lokasi -->
              <q-input
                v-model="ticket.arsiparis_atasan_name"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="supervisor_account" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Lokasi</span>
                </template>
              </q-input>

              <!-- Keterangan Pemusnahan Arsip -->
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
                  <span class="tw-font-semibold tw-text-slate-700">Keterangan Pemusnahan Arsip</span>
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

          <!-- ============================================ -->
          <!-- ARSIPARIS BAST FORM (when is_arsiparis) -->
          <!-- ============================================ -->
          <div v-if="isArsiparis" class="tw-mb-6">
            <q-separator class="tw-my-6 tw-bg-slate-200"/>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="inventory_2" color="blue-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Proses Pemusnahan Arsip</div>
            </div>

            <!-- Row 1: Arsiparis / Tanggal / No. Pemusnahan -->
            <div class="row q-col-gutter-md tw-mb-2">
              <div class="col-12 col-md-4">
                <div class="tw-text-slate-500 tw-text-sm tw-mb-1">Arsiparis Lokasi</div>
                <div class="tw-text-slate-900 tw-font-semibold">{{ ticket.arsiparis_name }}</div>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="arsiparisForm.tgl_pemusnahan"
                  outlined
                  dense
                  type="date"
                  label-slot
                  :readonly="!isArsiparisEditable"
                >
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Pada Tanggal</span>
                    <span v-if="isArsiparisEditable" class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <div class="tw-text-slate-500 tw-text-sm tw-mb-1">No. Pemusnahan</div>
                <div class="tw-text-slate-900 tw-font-semibold">{{ ticket.tr_no_tiket }}</div>
              </div>
            </div>

            <div class="tw-text-slate-900 tw-mb-4">Telah melakukan pemusnahan dokumen arsip</div>

            <!-- Row 2: Saksi 1 & Saksi 2 inline -->
            <div class="row q-col-gutter-md tw-mb-4">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="arsiparisForm.saksi1_nik"
                  outlined
                  label-slot
                  class="tw-mb-1"
                  :readonly="!isArsiparisEditable"
                  @blur="lookupSaksi(1)"
                >
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Saksi 1 (NIK)</span>
                    <span v-if="isArsiparisEditable" class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                </q-input>
                <div v-if="saksi1Name" class="tw-text-green-700 tw-text-sm">{{ saksi1Name }}</div>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="arsiparisForm.saksi2_nik"
                  outlined
                  label-slot
                  class="tw-mb-1"
                  :readonly="!isArsiparisEditable"
                  @blur="lookupSaksi(2)"
                >
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Saksi 2 (NIK)</span>
                    <span v-if="isArsiparisEditable" class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                </q-input>
                <div v-if="saksi2Name" class="tw-text-green-700 tw-text-sm">{{ saksi2Name }}</div>
              </div>
            </div>

            <!-- Generate BAST Button -->
            <q-btn
              v-if="isArsiparisEditable"
              unelevated
              color="blue-7"
              label="Generate Berita Acara Pemusnahan Arsip"
              icon="picture_as_pdf"
              class="tw-mb-4 tw-w-full"
              :disable="!arsiparisForm.saksi1_nik || !arsiparisForm.saksi2_nik || !arsiparisForm.tgl_pemusnahan"
              @click="generateBAST"
            />

            <!-- File Uploads -->
            <div v-if="isArsiparisEditable" class="tw-mt-4 tw-mb-4">
              <div class="tw-text-slate-700 tw-font-semibold tw-mb-3">Scan Berita Acara Pemusnahan Arsip :</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-file
                    v-model="arsiparisForm.upload1"
                    outlined
                    label="Upload 1"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="tw-mb-4"
                  >
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                  <q-file
                    v-model="arsiparisForm.upload3"
                    outlined
                    label="Upload 3"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="tw-mb-4"
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
                  >
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                  <q-file
                    v-model="arsiparisForm.upload4"
                    outlined
                    label="Upload 4"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="tw-mb-4"
                  >
                    <template v-slot:prepend><q-icon name="attach_file" /></template>
                  </q-file>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="tw-flex tw-gap-3 tw-justify-end">
            <q-btn 
              label="Kembali" 
              color="red-7" 
              push
              icon="arrow_back"
              class="tw-px-6 tw-font-semibold"
              @click="$router.push('/dms/pemusnahan')"
            />

            <!-- Arsiparis Submit Button -->
            <q-btn 
              v-if="isArsiparisEditable"
              label="Kirim" 
              color="green-6" 
              push
              icon="send"
              class="tw-px-6 tw-font-semibold"
              @click="showArsiparisConfirmDialog = true"
              :disable="loading"
            />
            
            <!-- Approve Button (hidden when arsiparis) -->
            <q-btn 
              v-if="canApprove && !isArsiparis"
              label="Approve" 
              color="green-6" 
              push
              icon="check_circle"
              class="tw-px-6 tw-font-semibold"
              @click="showApproveDialog = true"
            />
            
            <!-- Reject Button (hidden when arsiparis) -->
            <q-btn 
              v-if="canReject && !isArsiparis"
              label="Tolak" 
              color="red-6" 
              push
              icon="cancel"
              class="tw-px-6 tw-font-semibold"
              @click="showRejectDialog = true"
            />
            
            <!-- Revisi Approval Button (Approver sends back for revision) -->
            <q-btn 
              v-if="canRevisiApproval"
              label="Revisi" 
              color="orange-6" 
              push
              icon="edit_note"
              class="tw-px-6 tw-font-semibold"
              @click="showRevisiApprovalDialog = true"
            />
            
            <!-- Revise Button (User self-revision at status 2) -->
            <q-btn 
              v-if="canRevise"
              label="Revisi" 
              color="orange-6" 
              push
              icon="edit"
              class="tw-px-6 tw-font-semibold"
              @click="showReviseDialog = true"
            />
            
            <!-- Execute Button -->
            <q-btn 
              v-if="canExecute"
              label="Eksekusi Pemusnahan" 
              color="purple-6" 
              push
              icon="delete_forever"
              class="tw-px-6 tw-font-semibold"
              @click="showExecuteDialog = true"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Approve Dialog -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width: 500px">
        <q-card-section class="tw-bg-green-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Konfirmasi Approval</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-mb-4">Apakah anda yakin untuk menyetujui pemusnahan arsip ini?</p>
          <q-input
            v-model="approveCatatan"
            outlined
            type="textarea"
            rows="3"
            label="Catatan"
            counter
            maxlength="500"
          />
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup class="tw-px-4" />
          <q-btn unelevated label="Approve" color="green-6" @click="handleApprove" :loading="loading" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width: 500px">
        <q-card-section class="tw-bg-red-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Tolak Pemusnahan</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-mb-4">Silakan masukkan alasan penolakan:</p>
          <q-input
            v-model="rejectReason"
            outlined
            type="textarea"
            rows="4"
            label="Alasan Penolakan"
            counter
            maxlength="300"
          />
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup class="tw-px-4" />
          <q-btn unelevated label="Tolak" color="red-6" @click="handleReject" :loading="loading" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Revise Dialog -->
    <q-dialog v-model="showReviseDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width: 500px">
        <q-card-section class="tw-bg-orange-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Revisi Pemusnahan</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-mb-4">Silakan masukkan alasan revisi:</p>
          <q-input
            v-model="reviseReason"
            outlined
            type="textarea"
            rows="4"
            label="Alasan Revisi"
            counter
            maxlength="300"
          />
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup class="tw-px-4" />
          <q-btn unelevated label="Revisi" color="orange-6" @click="handleRevise" :loading="loading" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Revisi Approval Dialog (Approver sends back for revision) -->
    <q-dialog v-model="showRevisiApprovalDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width: 500px">
        <q-card-section class="tw-bg-orange-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Revisi Pemusnahan</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-mb-4">Apakah Anda yakin ingin mengembalikan pemusnahan arsip ini untuk direvisi?</p>
          <q-input
            v-model="revisiApprovalReason"
            outlined
            type="textarea"
            rows="4"
            label="Alasan Revisi"
            counter
            maxlength="300"
          />
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup class="tw-px-4" />
          <q-btn unelevated label="Revisi" color="orange-6" @click="handleRevisiApproval" :loading="loading" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Execute Dialog -->
    <q-dialog v-model="showExecuteDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width: 400px">
        <q-card-section class="tw-bg-purple-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Konfirmasi Eksekusi</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700 tw-font-semibold">PERINGATAN: Tindakan ini akan menghapus arsip secara permanen!</p>
          <p class="tw-text-slate-700 tw-mt-2">Apakah anda yakin untuk mengeksekusi pemusnahan arsip ini?</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Batal" color="grey-7" v-close-popup class="tw-px-4" />
          <q-btn unelevated label="Eksekusi" color="purple-6" @click="handleExecute" :loading="loading" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Arsiparis Confirm Dialog -->
    <q-dialog v-model="showArsiparisConfirmDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden" style="min-width: 400px">
        <q-card-section class="tw-bg-blue-700 tw-text-white tw-py-4">
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
          <q-btn flat label="Batal" color="grey-7" v-close-popup :disable="loading" class="tw-px-4" />
          <q-btn unelevated label="Konfirmasi" color="blue-7" @click="handleSubmitArsiparis" :loading="loading" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- BAST Preview Dialog -->
    <q-dialog v-model="showBASTDialog" maximized>
      <q-card>
        <q-card-section class="tw-bg-blue-700 tw-text-white tw-py-4">
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
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
import { domain, empid } from "../../../utils";
import { useRouter, useRoute } from "vue-router";
import { useNotify } from "../../../composables/useNotify";

const router = useRouter();
const route = useRoute();
const { success, error: showError } = useNotify();
const loading = ref(false);

const ticket = reactive({
  tr_no_tiket: '',
  tr_tgl_pengajuan: null,
  tr_tgl_pemusnahan: null,
  tr_target_pemusnahan: '',
  tr_kategori_keamanan: '',
  tr_kategori_dokumen: '',
  tr_prioritas_approval: 1,
  tr_keterangan_pemusnahan: '',
  tr_status: 0,
  bu_name: '',
  lokasi_arsip_name: '',
  arsiparis_name: '',
  arsiparis_atasan_name: '',
  tr_user_id: '',
  tr_atasan_user_id: '',
  tr_corp_lgl_id: '',
  tr_atasan_corp_lgl_id: '',
  tr_dir_corp_lgl_id: '',
  tr_arsiparis_id: ''
});

const documents = ref([]);
const logs = ref([]);
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showReviseDialog = ref(false);
const showRevisiApprovalDialog = ref(false);
const showExecuteDialog = ref(false);
const showArsiparisConfirmDialog = ref(false);
const rejectReason = ref('');
const reviseReason = ref('');
const revisiApprovalReason = ref('');
const approveCatatan = ref('');

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


const documentColumns = [
  { name: 'trdet_no_arsip', label: 'Kode Arsip', field: 'trdet_no_arsip', align: 'center' },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left' },
  { name: 'content_doc', label: 'No. Document', field: 'content_doc', align: 'center' },
  { name: 'status_berlaku', label: 'Status Berlaku Arsip', field: 'status_berlaku', align: 'center' },
  { name: 'direktorat_name', label: 'Document Owner', field: 'direktorat_name', align: 'left' },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left' },
  { name: 'trdet_keterangan', label: 'Keterangan', field: 'trdet_keterangan', align: 'left' }
];

// Use backend-computed permission flags (based on correct empid comparison)
const canApprove = computed(() => ticket.can_approve === true);
const canReject = computed(() => ticket.can_reject === true);
const canRevise = computed(() => ticket.can_revise === true);
const canRevisiApproval = computed(() => ticket.can_revisi_approval === true);
const canExecute = computed(() => ticket.can_execute === true);
const isArsiparis = computed(() => ticket.is_arsiparis === true);
const isArsiparisEditable = computed(() => isArsiparis.value && ticket.tr_status === 7);

const getStatusText = (status) => {
  const statusMap = {
    1: 'Approval Atasan User Pembuat',
    2: 'Revisi User Pembuat',
    3: 'Ditolak',
    4: 'Approval Corp. Legal SH',
    5: 'Approval Corp. Legal Div. Head / Dept. Head',
    6: 'Approval Corp. Legal Director',
    7: 'Approval Arsiparis Lokasi',
    8: 'Penghapusan Arsip',
    9: 'Approval Arsiparis Lokasi'
  };
  return statusMap[status] || 'Unknown';
};

const getStatusColor = (status) => {
  if (status === 3) return 'red';
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
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatKategoriKeamanan = (val) => {
  if (!val) return '';
  return val.charAt(0).toUpperCase() + val.slice(1);
};

const viewApprovalDetail = () => {
  const url = `/app/mapproval/viewapproval?bu_id=${domain()}&app_prioritas=${ticket.tr_prioritas_approval}&app_jns_trans=6`;
  window.open(url, 'blank', 'width=800,height=600');
};

const getTicketDetail = async () => {
  try {
    loading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pemusnahan/${route.params.id}`, {
      params: { empid: empid(), domain: domain() },
      skipErrorInterceptor: true
    });

    // Populate ticket data
    Object.assign(ticket, res.data.data.header);
    documents.value = res.data.data.details;
    logs.value = res.data.data.logs;

    loading.value = false;
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal memuat data');
    router.push('/dms/pemusnahan');
  }
};

const handleApprove = async () => {
  try {
    loading.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/pemusnahan/${route.params.id}/approve`, {
      creator: empid(),
      catatan: approveCatatan.value
    }, {
      skipErrorInterceptor: true
    });

    loading.value = false;
    showApproveDialog.value = false;
    success('Pemusnahan berhasil disetujui');
    router.push('/dms/pemusnahan');
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal menyetujui pemusnahan');
  }
};

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    showError('Alasan penolakan wajib diisi');
    return;
  }

  try {
    loading.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/pemusnahan/${route.params.id}/reject`, {
      creator: empid(),
      alasan: rejectReason.value
    }, {
      skipErrorInterceptor: true
    });

    loading.value = false;
    showRejectDialog.value = false;
    success('Pemusnahan berhasil ditolak');
    router.push('/dms/pemusnahan');
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal menolak pemusnahan');
  }
};

const handleRevise = async () => {
  if (!reviseReason.value.trim()) {
    showError('Alasan revisi wajib diisi');
    return;
  }

  try {
    loading.value = true;
    await axios.put(`${import.meta.env.VITE_API}dms/pemusnahan/${route.params.id}/revise`, {
      creator: empid(),
      reason: reviseReason.value
    }, {
      skipErrorInterceptor: true
    });

    loading.value = false;
    showReviseDialog.value = false;
    success('Pemusnahan berhasil direvisi');
    router.push('/dms/pemusnahan');
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal merevisi pemusnahan');
  }
};

const handleRevisiApproval = async () => {
  if (!revisiApprovalReason.value.trim()) {
    showError('Alasan revisi wajib diisi');
    return;
  }

  try {
    loading.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/pemusnahan/${route.params.id}/revisi-approval`, {
      creator: empid(),
      alasan: revisiApprovalReason.value
    }, {
      skipErrorInterceptor: true
    });

    loading.value = false;
    showRevisiApprovalDialog.value = false;
    success('Pemusnahan berhasil dikembalikan untuk direvisi');
    router.push('/dms/pemusnahan');
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal merevisi pemusnahan');
  }
};

const handleExecute = async () => {
  try {
    loading.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/pemusnahan/${route.params.id}/execute`, {
      creator: empid()
    }, {
      skipErrorInterceptor: true
    });

    loading.value = false;
    showExecuteDialog.value = false;
    success('Pemusnahan berhasil dieksekusi');
    router.push('/dms/pemusnahan');
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal mengeksekusi pemusnahan');
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
    const ticketId = route.params.id;
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
    loading.value = true;
    const ticketId = route.params.id;

    const formData = new FormData();
    formData.append('creator', empid());
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

    loading.value = false;
    showArsiparisConfirmDialog.value = false;
    success('Berita Acara Pemusnahan berhasil dikirim');
    router.push('/dms/pemusnahan');
  } catch (err) {
    loading.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal memproses pemusnahan arsip');
  }
};

onMounted(() => {
  getTicketDetail();
});
</script>




