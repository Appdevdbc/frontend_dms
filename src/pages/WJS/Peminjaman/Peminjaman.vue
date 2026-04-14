<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="folder_shared" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">
              Peminjaman Dokumen Fisik / Scan Elektronik
            </div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Peminjaman Dokumen</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-flex tw-flex-wrap tw-gap-3 tw-items-end">
          <q-select
            outlined
            dense
            v-model="filterBU"
            :options="listBU"
            option-label="bu_name"
            option-value="bu_id"
            emit-value
            map-options
            label="Bisnis Unit"
            clearable
            class="tw-bg-white tw-rounded-lg tw-min-w-[200px]"
          >
            <template v-slot:prepend>
              <q-icon name="domain" color="blue-6" />
            </template>
          </q-select>
          <q-select
            outlined
            dense
            v-model="filterLokasi"
            :options="listLokasi"
            option-label="lokasi_arsip_name"
            option-value="lokasi_arsip_id"
            emit-value
            map-options
            label="Lokasi Arsip"
            clearable
            class="tw-bg-white tw-rounded-lg tw-min-w-[200px]"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" color="blue-6" />
            </template>
          </q-select>
          <q-input
            outlined
            dense
            v-model="filterDateStart"
            label="Tanggal Awal"
            clearable
            class="tw-bg-white tw-rounded-lg tw-min-w-[160px]"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="blue-6" />
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filterDateStart" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            outlined
            dense
            v-model="filterDateEnd"
            label="Tanggal Akhir"
            clearable
            class="tw-bg-white tw-rounded-lg tw-min-w-[160px]"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="blue-6" />
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filterDateEnd" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn
            unelevated
            color="blue-6"
            label="Tampilkan"
            icon="visibility"
            class="tw-font-semibold tw-px-4 tw-rounded-lg"
            @click="updateTable"
          />
          <q-btn
            unelevated
            color="green-6"
            label="Excel"
            icon="download"
            class="tw-font-semibold tw-px-4 tw-rounded-lg"
            @click="exportExcel"
          />
        </div>
        <div class="tw-mt-4 tw-mx-auto tw-w-[90%] tw-h-0.5 tw-bg-gradient-to-r tw-from-transparent tw-via-slate-300 tw-to-transparent"></div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          v-if="tmpPage.view=='1'"
          :rows="listPeminjaman"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="pagination.filter"
          @request="onRequest"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px">
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
              </q-icon>
              <q-select
                borderless
                dense
                v-model="pagination.rowsPerPage"
                :options="[5, 10, 25, 50, 100]"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>

          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn
                v-if="tmpPage.add=='1'"
                unelevated
                color="blue-6"
                label="Tambah Data"
                icon="add"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
                @click="addPermintaan"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search ..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>
          <template v-slot:body-cell-pinjam_tgl_create="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ formatDateDMY(props.row.pinjam_tgl_create) }}
            </q-td>
          </template>
          
          <template v-slot:body-cell-pinjam_tgl_est_ambil_to="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ formatDateDMY(props.row.pinjam_tgl_est_ambil_to) }}
            </q-td>
          </template>
          
          <template v-slot:body-cell-pinjam_tgl_est_kembali_to="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ formatDateDMY(props.row.pinjam_tgl_est_kembali_to) }}
            </q-td>
          </template>
          
          <template v-slot:body-cell-pinjam_status="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge 
                :color="getStatusColor(props.row.pinjam_status)"
                :label="getStatusLabel(props.row)"
                class="tw-px-3 tw-py-1 tw-font-semibold tw-rounded-full"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3">
              <div class="tw-flex tw-gap-2">
                <!-- Detail Button -->
                <q-btn round dense color="blue-6" icon="visibility" size="sm" @click="viewDetail(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Lihat</q-tooltip>
                </q-btn>
                <!-- Approve Button -->
                <q-btn v-if="canApprove(props.row)" round dense color="green-6" icon="check_circle" size="sm" @click="openApprovalDirect(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Approve</q-tooltip>
                </q-btn>
                <!-- Reject Button -->
                <q-btn v-if="canApprove(props.row)" round dense color="red-6" icon="cancel" size="sm" @click="openRejection(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Tolak</q-tooltip>
                </q-btn>
                <!-- Revisi Button (approver sends back for revision) -->
                <q-btn v-if="canApprove(props.row)" round dense color="orange-6" icon="edit_note" size="sm" @click="openRevisiApproval(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Revisi</q-tooltip>
                </q-btn>
                <!-- Revisi Button (user self-revision) -->
                <q-btn v-if="canRevise(props.row)" round dense color="orange-6" icon="edit" size="sm" @click="openRevisionForm(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Revisi</q-tooltip>
                </q-btn>
                <!-- BAST Button -->
                <q-btn v-if="canProcessBAST(props.row)" round dense color="purple-6" icon="assignment" size="sm" @click="openBASTForm(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Proses BAST</q-tooltip>
                </q-btn>
                <!-- User Confirmation BAST -->
                <q-btn v-if="canConfirmBAST(props.row)" round dense color="teal-6" icon="assignment_turned_in" size="sm" @click="openUserConfirmation(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Konfirmasi BAST</q-tooltip>
                </q-btn>
                <!-- Edit Button -->
                <q-btn v-if="canEdit(props.row)" round dense color="light-blue-9" icon="edit" size="sm" @click="editPermintaan(props.row)" class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all">
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
                <!-- Delete Button -->
                <q-btn v-if="canDelete(props.row)" round dense color="red-6" icon="delete" size="sm"
                  @click="deletePermintaan(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Hapus Permintaan</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <!-- Dialog Revisi -->
    <RevisiDialog
      v-model="showRevisiDialog"
      :ticketData="selectedTicket"
      @done="updateTable"
    />

    <!-- Dialog Proses BAST -->
    <BASTDialog
      v-model="showBASTDialog"
      :ticketData="selectedTicket"
      @done="updateTable"
    />

    <!-- Dialog Konfirmasi BAST -->
    <KonfirmasiBASTDialog
      v-model="showKonfirmasiBASTDialog"
      :ticketData="selectedTicket"
      @done="updateTable"
    />

    <!-- Dialog Approval (inline, same pattern as pemusnahan) -->
    <ApprovalDialog
      v-model="showApprovalDialog"
      :ticketData="selectedTicket"
      @done="updateTable"
    />

    <!-- Dialog Rejection -->
    <RejectionDialog
      v-model="showRejectionDialog"
      :ticketData="selectedTicket"
      @done="updateTable"
    />

    <!-- Dialog Revisi Approval (approver sends back) -->
    <RevisiApprovalDialog
      v-model="showRevisiApprovalDialog"
      :ticketData="selectedTicket"
      @done="updateTable"
    />

    <!-- Dialog Form Tambah/Edit -->
    <q-dialog
      v-model="dialogForm"
      transition-show="slide-up"
      transition-hide="slide-down"
      maximized
    >
      <q-card class="tw-w-full tw-rounded-2xl tw-shadow-2xl" style="max-width: 90vw; width: 90vw">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit_note" size="32px" />
            {{ updateForm ? 'Edit' : 'Tambah' }} Permintaan Dokumen
          </div>
        </q-card-section>
        <q-separator />
        
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
                <template v-slot:avatar>
                  <q-icon name="info" color="red" size="24px" />
                </template>
                <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
              </q-banner>
            </div>
            
            <div class="col-6">
              <q-input
                model-value="Auto Generate"
                outlined
                readonly
                label="Nomor Tiket"
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <q-input
                v-model="buName"
                outlined
                label="Bisnis Unit"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="domain" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <div class="tw-mb-2">
                <span class="tw-font-semibold tw-text-slate-700">Aktivitas</span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </div>
              <q-option-group
                v-model="tmpForm.aktivitas"
                :options="[
                  { label: 'Pinjam Asli', value: 'Pinjam Asli' },
                  { label: 'Permintaan PDF / Elektronik', value: 'Permintaan PDF / Elektronik' }
                ]"
                color="blue-6"
                inline
                @update:model-value="onAktivitasChange"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="divName"
                outlined
                label="Divisi"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="domain" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <q-input
                v-model="tmpForm.nama_dokumen"
                outlined
                label="Nama Dokumen *"
                counter
                maxlength="100"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    dense
                    color="blue-6"
                    icon="search"
                    @click="getDocumentDetails"
                    :disable="!tmpForm.nama_dokumen || !tmpForm.lokasi_penyimpanan"
                  >
                    <q-tooltip>Cari Dokumen</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <q-input
                v-model="tmpForm.lokasi_penyimpanan"
                outlined
                label="Lokasi Penyimpanan *"
                counter
                maxlength="100"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <q-input
                v-model="tmpForm.nomor_dokumen"
                outlined
                label="Nomor Dokumen"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <q-input
                v-model="tmpForm.kategori_dokumen"
                outlined
                label="Kategori Dokumen"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <q-input
                v-model="tmpForm.kategori_keamanan"
                outlined
                label="Kategori Keamanan"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="security" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <div class="tw-flex tw-items-center tw-gap-3">
                <q-input
                  v-model="tmpForm.pinjam_prioritas_approve"
                  outlined
                  label="Prioritas Approval"
                  class="tw-rounded-lg tw-flex-1"
                  type="number"
                  min="1"
                  max="5"
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="priority_high" color="blue-6" />
                  </template>
                </q-input>
                <q-btn
                  color="blue-6"
                  label="View Detail"
                  size="sm"
                  @click="viewApprovalDetail"
                  class="tw-mt-2"
                />
              </div>
            </div>
            
            <div class="col-6">
              <q-input
                v-model="tmpForm.nomor_arsip"
                outlined
                label="Nomor Arsip"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="folder" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.alasan"
                outlined
                type="textarea"
                label="Alasan / Catatan Peminjaman *"
                counter
                maxlength="500"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <!-- Waktu Pengambilan -->
            <div class="col-4">
              <q-input
                v-model="tmpForm.tgl_pengambilan"
                outlined
                label="Tanggal Pengambilan *"
                mask="##-##-####"
                placeholder="DD-MM-YYYY"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="tmpForm.tgl_pengambilan" mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            
            <div class="col-4">
              <q-input
                v-model="tmpForm.jam_pengambilan"
                outlined
                label="Jam Mulai *"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-4">
              <q-input
                v-model="tmpForm.jam_pengambilan_sd"
                outlined
                label="Jam Selesai *"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
              </q-input>
            </div>
            <!-- Waktu Pengembalian (hanya untuk Pinjam Asli) -->
            <div v-if="tmpForm.aktivitas === 'Pinjam Asli'" class="col-4">
              <q-input
                v-model="tmpForm.tgl_pengembalian"
                outlined
                label="Tanggal Pengembalian *"
                mask="##-##-####"
                placeholder="DD-MM-YYYY"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="tmpForm.tgl_pengembalian" mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            
            <div v-if="tmpForm.aktivitas === 'Pinjam Asli'" class="col-4">
              <q-input
                v-model="tmpForm.jam_pengembalian"
                outlined
                label="Jam Mulai *"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div v-if="tmpForm.aktivitas === 'Pinjam Asli'" class="col-4">
              <q-input
                v-model="tmpForm.jam_pengembalian_sd"
                outlined
                label="Jam Selesai *"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-input
                v-model="tmpForm.keterangan_user"
                outlined
                type="textarea"
                label="Keterangan User"
                counter
                maxlength="500"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200" />
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Batal"
            color="red-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Simpan"
            color="blue-6"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="savePermintaan"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>


<script setup>
import { ref, onMounted, reactive, watch } from "vue";
import axios from "axios";
import {
  domain,
  empid,
  formatDateDMY,
  encryptMessage,
  decryptMessage,
  spinnerBall
} from "./../../../utils";
import { useQuasar, Loading } from "quasar";
import { useNotify } from "./../../../composables/useNotify";
import { useRouter } from "vue-router";
import RevisiDialog from "./../../../components/WJS/Peminjaman/RevisiDialog.vue";
import BASTDialog from "./../../../components/WJS/Peminjaman/BASTDialog.vue";
import KonfirmasiBASTDialog from "./../../../components/WJS/Peminjaman/KonfirmasiBASTDialog.vue";
import ApprovalDialog from "./../../../components/WJS/Peminjaman/ApprovalDialog.vue";
import RejectionDialog from "./../../../components/WJS/Peminjaman/RejectionDialog.vue";
import RevisiApprovalDialog from "./../../../components/WJS/Peminjaman/RevisiApprovalDialog.vue";

const $q = useQuasar();
const { success, error } = useNotify();
const router = useRouter();

// Reactive data
const loading = ref(false);
const saving = ref(false);
const dialogForm = ref(false);
const updateForm = ref(false);
const listPeminjaman = ref([]);
const listBU = ref([]);
const listLokasi = ref([]);

// Filter data
const filterBU = ref('');
const filterLokasi = ref('');
const filterDateStart = ref('');
const filterDateEnd = ref('');

// Dialog state
const selectedTicket = ref(null);
const showRevisiDialog = ref(false);
const showBASTDialog = ref(false);
const showKonfirmasiBASTDialog = ref(false);
const showApprovalDialog = ref(false);
const showRejectionDialog = ref(false);
const showRevisiApprovalDialog = ref(false);

// User data
const buName = ref(window.localStorage.getItem("bu_name") || "");
const divName = ref(window.localStorage.getItem("div_name") || "");
const deptName = ref(window.localStorage.getItem("dept_name") || "");

// Form data
const tmpForm = reactive({
  aktivitas: 'Pinjam Asli',
  nama_dokumen: '',
  lokasi_penyimpanan: '',
  nomor_dokumen: '',
  kategori_dokumen: '',
  kategori_keamanan: '',
  nomor_arsip: '',
  alasan: '',
  tgl_pengambilan: '',
  jam_pengambilan: '',
  jam_pengambilan_sd: '',
  tgl_pengembalian: '',
  jam_pengembalian: '',
  jam_pengembalian_sd: '',
  keterangan_user: '',
  pinjam_prioritas_approve: 1
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

// Pagination
const pagination = ref({
  sortBy: 'pinjam_tgl_create',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: ''
});

// Table columns
const columns = [
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi"
  },
  {
    name: "pinjam_no_tiket",
    required: true,
    label: "Nomor Tiket",
    align: "center",
    field: "pinjam_no_tiket",
    sortable: true
  },
  {
    name: "pinjam_aktivitas",
    required: true,
    label: "Aktivitas",
    align: "center",
    field: "pinjam_aktivitas",
    sortable: true
  },
  {
    name: "pinjam_tgl_create",
    required: true,
    label: "Tanggal Permintaan",
    align: "center",
    field: "pinjam_tgl_create",
    sortable: true
  },
  {
    name: "pinjam_nama_doc",
    required: true,
    label: "Nama Arsip",
    align: "left",
    field: "pinjam_nama_doc",
    sortable: true
  },
  {
    name: "arsip_no",
    required: true,
    label: "Kode Arsip",
    align: "left",
    field: "arsip_no",
    sortable: true
  },
  {
    name: "pinjam_nomor_doc",
    required: true,
    label: "Nomor Dokumen",
    align: "left",
    field: "pinjam_nomor_doc",
    sortable: true
  },
  {
    name: "lokasi_arsip_name",
    required: true,
    label: "Lokasi Arsip",
    align: "left",
    field: "lokasi_arsip_name",
    sortable: true
  },
  {
    name: "kat_desc",
    required: true,
    label: "Kategori Dokumen",
    align: "left",
    field: "kat_desc",
    sortable: true
  },
  {
    name: "content_security",
    required: true,
    label: "Kategori Keamanan",
    align: "center",
    field: "content_security",
    sortable: true
  },
  {
    name: "pinjam_tgl_est_ambil_to",
    required: true,
    label: "Tgl Estimasi Pengambilan",
    align: "center",
    field: "pinjam_tgl_est_ambil_to",
    sortable: true
  },
  {
    name: "pinjam_tgl_est_kembali_to",
    required: true,
    label: "Tgl Estimasi Pengembalian",
    align: "center",
    field: "pinjam_tgl_est_kembali_to",
    sortable: true
  },
  {
    name: "pinjam_status",
    required: true,
    label: "Status",
    align: "center",
    field: "pinjam_status",
    sortable: true
  }
];
// Methods
const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filter = props.pagination.filter;

  loading.value = true;

  try {
    const params = {
      page,
      rowsPerPage,
      sortBy,
      descending,
      filter,
      bu_id: filterBU.value,
      lokasi: filterLokasi.value,
      from: filterDateStart.value,
      to: filterDateEnd.value,
      user_nik: empid()
    };

    const response = await axios.get('/dms/listPeminjaman', { params });
    
    listPeminjaman.value = response.data.data;
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;
    pagination.value.rowsNumber = response.data.total;
  } catch (err) {
    error('Gagal memuat data peminjaman');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const updateTable = () => {
  onRequest({
    pagination: pagination.value
  });
};

const addPermintaan = async () => {
  // Check user eligibility first (from PHP validation)
  try {
    const response = await axios.get('/dms/checkUserEligibility', {
      params: { user_nik: encryptMessage(empid()) }
    });
    
    if (!response.data.success) {
      error(response.data.message);
      return;
    }
  } catch (err) {
    // Log error but still allow form to open (PHP version checks on save, not on open)
    console.warn('checkUserEligibility error (non-blocking):', err?.response?.data?.message || err?.message);
  }

  // Open form
  updateForm.value = false;
  resetForm();
  dialogForm.value = true;
};

const editPermintaan = (row) => {
  updateForm.value = true;
  Object.assign(tmpForm, row);
  dialogForm.value = true;
};

const resetForm = () => {
  Object.assign(tmpForm, {
    aktivitas: 'Pinjam Asli',
    nama_dokumen: '',
    lokasi_penyimpanan: '',
    nomor_dokumen: '',
    kategori_dokumen: '',
    kategori_keamanan: '',
    nomor_arsip: '',
    alasan: '',
    tgl_pengambilan: '',
    jam_pengambilan: '',
    jam_pengambilan_sd: '',
    tgl_pengembalian: '',
    jam_pengembalian: '',
    jam_pengembalian_sd: '',
    keterangan_user: '',
    pinjam_prioritas_approve: 1
  });
};

const onAktivitasChange = (value) => {
  // Reset document fields when activity changes
  resetDocumentFields();
  
  if (value === 'Permintaan PDF / Elektronik') {
    tmpForm.tgl_pengembalian = '';
    tmpForm.jam_pengembalian = '';
    tmpForm.jam_pengembalian_sd = '';
  }
};

const getDocumentDetails = async () => {
  if (tmpForm.nama_dokumen && tmpForm.lokasi_penyimpanan) {
    try {
      const response = await axios.get('/dms/getDocumentData', {
        params: {
          nama_dokumen: tmpForm.nama_dokumen,
          lokasi_penyimpanan: tmpForm.lokasi_penyimpanan,
          user_nik: encryptMessage(empid())
        }
      });
      
      if (response.data && response.data.length > 0) {
        const res = response.data[0];
        
        // Validasi berdasarkan aktivitas
        if (tmpForm.aktivitas === 'Permintaan PDF / Elektronik') {
          if (!res.content_kode_lemari) {
            resetDocumentFields();
            error("Dokumen belum tersedia");
            return;
          } else if (res.content_status === 'Musnah') {
            resetDocumentFields();
            error("Dokumen ini sudah dimusnahkan. Proses transaksi tidak bisa dilanjutkan.");
            return;
          }
        } else { // Pinjam Asli
          if (res.jumlah_pinjam > 5) {
            resetDocumentFields();
            error("Anda tidak dapat melakukan peminjaman dokumen lebih dari 5 (lima)!");
            return;
          } else if (res.jumlah_belum_kembali > 0) {
            resetDocumentFields();
            error("Anda tidak dapat melakukan peminjaman karena ada dokumen yang belum dikembalikan melebihi due date H + 12 !");
            return;
          } else if (res.content_status === 'Pinjam') {
            resetDocumentFields();
            error("Dokumen sedang dipinjam");
            return;
          } else if (res.content_status === 'Hilang') {
            resetDocumentFields();
            error("Dokumen ini sudah diadukan Hilang. Proses transaksi tidak bisa dilanjutkan.");
            return;
          } else if (res.content_status === 'Musnah') {
            resetDocumentFields();
            error("Dokumen ini sudah dimusnahkan. Proses transaksi tidak bisa dilanjutkan.");
            return;
          } else if (!res.lemari_id) {
            resetDocumentFields();
            error("Dokumen belum tersedia");
            return;
          }
        }
        
        // Set data dokumen jika validasi berhasil
        tmpForm.nomor_dokumen = res.content_doc || '';
        tmpForm.kategori_dokumen = res.kat_desc || '';
        tmpForm.kategori_keamanan = res.content_security || '';
        tmpForm.nomor_arsip = res.arsip_no || '';
        
      } else {
        resetDocumentFields();
        error("Dokumen tidak ditemukan, pastikan nama dokumen & lokasi penyimpanan benar");
      }
    } catch (err) {
      console.error('Error getting document details:', err);
      resetDocumentFields();
      error("Gagal mengambil detail dokumen");
    }
  }
};

// Reset document fields
const resetDocumentFields = () => {
  tmpForm.nomor_dokumen = '';
  tmpForm.kategori_dokumen = '';
  tmpForm.kategori_keamanan = '';
  tmpForm.nomor_arsip = '';
};

// View approval detail (from PHP functionality)
const viewApprovalDetail = () => {
  const buId = window.localStorage.getItem("bu_id");
  const appJnsTrans = tmpForm.aktivitas === 'Pinjam Asli' ? 2 : 3;
  const prioritas = tmpForm.pinjam_prioritas_approve || 1;
  
  // Open approval detail in new window (similar to PHP implementation)
  const url = `/app/mapproval/viewapproval?bu_id=${buId}&app_prioritas=${prioritas}&app_jns_trans=${appJnsTrans}`;
  window.open(url, '_blank');
};

const savePermintaan = async () => {
  // Validation
  if (!tmpForm.aktivitas || !tmpForm.nama_dokumen || !tmpForm.lokasi_penyimpanan || !tmpForm.alasan) {
    error('Mohon lengkapi field yang wajib diisi');
    return;
  }

  if (!tmpForm.tgl_pengambilan || !tmpForm.jam_pengambilan || !tmpForm.jam_pengambilan_sd) {
    error('Mohon lengkapi waktu pengambilan');
    return;
  }

  if (tmpForm.aktivitas === 'Pinjam Asli') {
    if (!tmpForm.tgl_pengembalian || !tmpForm.jam_pengembalian || !tmpForm.jam_pengembalian_sd) {
      error('Mohon lengkapi waktu pengembalian untuk pinjam asli');
      return;
    }
  }

  saving.value = true;

  try {
    const payload = {
      creator: empid(),
      ...tmpForm,
      account_nik: window.localStorage.getItem("nik"),
      employee_spv_pk: window.localStorage.getItem("employee_spv_pk"),
      employee_spv: window.localStorage.getItem("employee_spv"),
      pinjam_prioritas_approve: tmpForm.pinjam_prioritas_approve || 1,
      bu_id: window.localStorage.getItem("bu_id"),
      div_id: window.localStorage.getItem("div_id")
    };

    const response = await axios.post('/dms/addPermintaanDokumen', payload);
    
    if (response.data.status === 1) {
      success(`Permintaan berhasil dibuat dengan nomor tiket: ${response.data.no_tiket}. Email notifikasi telah dikirim ke atasan untuk approval.`);
      dialogForm.value = false;
      updateTable();
    } else {
      error('Gagal menyimpan permintaan');
    }
  } catch (err) {
    error('Gagal menyimpan permintaan');
    console.error(err);
  } finally {
    saving.value = false;
  }
};

const deletePermintaan = async (row) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: 'Apakah Anda yakin ingin menghapus permintaan ini?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.post('/dms/deletePermintaan', { id: row.id });
      success('Permintaan berhasil dihapus');
      updateTable();
    } catch (err) {
      error('Gagal menghapus permintaan');
      console.error(err);
    }
  });
};

// Open approval dialog (inline, same pattern as pemusnahan)
const openApprovalDirect = (row) => {
  selectedTicket.value = row;
  showApprovalDialog.value = true;
};

// Open rejection dialog
const openRejection = (row) => {
  selectedTicket.value = row;
  showRejectionDialog.value = true;
};

// Open revisi approval dialog (approver sends back for revision)
const openRevisiApproval = (row) => {
  selectedTicket.value = row;
  showRevisiApprovalDialog.value = true;
};

// Open detail page (same pattern as pemusnahan)
const viewDetail = (row) => {
  router.push(`/dms/peminjaman-dokumen/${encodeURIComponent(row.pinjam_no_tiket)}`);
};

// Open revision dialog
const openRevisionForm = (row) => {
  selectedTicket.value = row;
  showRevisiDialog.value = true;
};

// Open BAST dialog for processing
const openBASTForm = (row) => {
  selectedTicket.value = row;
  showBASTDialog.value = true;
};

// Open user confirmation dialog for BAST
const openUserConfirmation = (row) => {
  selectedTicket.value = row;
  showKonfirmasiBASTDialog.value = true;
};

const exportExcel = async () => {
  try {
    loading.value = true;
    
    const params = {
      bu_id: filterBU.value || '',
      lokasi: filterLokasi.value || '',
      from: filterDateStart.value || '',
      to: filterDateEnd.value || '',
      user_nik: encryptMessage(empid())
    };
    
    // Use axios to download with proper authentication
    const response = await axios.get('/dms/exportPeminjamanExcel', {
      params,
      responseType: 'blob', // Important for file download
      headers: {
        'Accept': 'application/vnd.ms-excel'
      }
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { 
      type: 'application/vnd.ms-excel' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Peminjaman_Dokumen_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    success('Export Excel berhasil diunduh');
  } catch (err) {
    error('Gagal export Excel: ' + (err.response?.data?.message || err.message));
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Helper functions
const getStatusColor = (status) => {
  const statusColors = {
    'Kirim Atasan User': 'orange',
    'Kirim Legal': 'blue',
    'Kirim Arsiparis': 'purple',
    'Proses BAST': 'teal',
    'Selesai BAST': 'green',
    'Peminjaman Berhasil': 'green',
    'Kirim Tolak': 'red',
    'Kirim Revisi': 'amber',
    'Kirim Revisi Legal': 'amber',
    'Revisi': 'amber'
  };
  return statusColors[status] || 'grey';
};

const getStatusLabel = (row) => {
  if (row.pinjam_flag == "4") return 'Full approve';
  if (row.pinjam_status == 'setuju') return 'Proses approval';
  
  // Handle electronic document status based on download time
  if (row.pinjam_aktivitas === 'Permintaan PDF / Elektronik') {
    const tglDownload = row.tanggal_download;
    const tglAmbilFr = new Date(row.pinjam_tgl_est_ambil_fr);
    const tglAmbilTo = new Date(row.pinjam_tgl_est_ambil_to);
    const now = new Date();
    
    if (!tglDownload && tglAmbilFr > now) {
      return 'Belum Memasuki Waktu Download';
    } else if (!tglDownload && tglAmbilTo < now) {
      return 'Melewati Waktu Download';
    } else if (tglDownload) {
      return 'Berhasil Didownload';
    }
  }
  
  return row.pinjam_status;
};

const canApprove = (row) => {
  // empid() returns NIK directly — compare with pinjam_user_approve (NIK of approver)
  return decryptMessage(empid()) === row.pinjam_user_approve && 
         ['Kirim Atasan User', 'Kirim Legal', 'Kirim Revisi Legal', 'Kirim Arsiparis'].includes(row.pinjam_status);
};

const canRevise = (row) => {
  const userNik = empid();
  return (userNik === row.pinjam_user_nik && row.pinjam_status === 'Kirim Revisi') ||
         (userNik === row.pinjam_user_nik && row.pinjam_status === 'Revisi');
};

const canProcessBAST = (row) => {
  const userNik = empid();
  return userNik === row.pinjam_user_approve && row.pinjam_status === 'Proses BAST';
};

const canConfirmBAST = (row) => {
  const userNik = empid();
  return userNik === row.pinjam_user_nik && row.pinjam_status === 'Selesai BAST';
};

const canEdit = (row) => {
  return ['revisi', ''].includes(row.pinjam_status);
};

const canDelete = (row) => {
  return ['revisi', ''].includes(row.pinjam_status);
};

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: '/dms/peminjaman-dokumen',
        domain: domain(),
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    console.log(tmpPage);
    Loading.hide();
  } catch (error) {
    console.log(error);
    Loading.hide();
    router.push('/404');
  }
};

// Lifecycle
onMounted(() => {
  loadBU();
  loadLokasi();
  loadUserData();
  loadSupervisorData();
  updateTable();
  getPageAkses();
});

// Load supervisor data (from PHP logic)
const loadSupervisorData = async () => {
  try {
    const response = await axios.get('/dms/getEmployeeSupervisor', {
      params: { employee_nik: empid() }
    });
    
    if (response.data.success && response.data.data.supervisor) {
      const supervisor = response.data.data.supervisor;
      // Store supervisor data in localStorage for form submission
      window.localStorage.setItem("employee_spv", supervisor.nik || supervisor.employee_id);
      window.localStorage.setItem("employee_spv_pk", supervisor.id);
    }
  } catch (err) {
    console.error('Error loading supervisor data:', err);
  }
};

// Load user data
const loadUserData = async () => {
  try {
    const response = await axios.get('/dms/getUserData', {
      params: { nik: encryptMessage(empid()) }
    });
    
    if (response.data && response.data.length > 0) {
      const userData = response.data[0];
      // Data sudah tersedia di localStorage, tapi bisa diupdate jika perlu
    }
  } catch (err) {
    console.error('Error loading user data:', err);
  }
};

// Watch filterBU changes
watch(filterBU, (newVal) => {
  watchBUFilter();
});

// Load Business Units
const loadBU = async () => {
  try {
    const response = await axios.get('/dms/getBU');
    listBU.value = response.data;
  } catch (err) {
    console.error('Error loading BU:', err);
  }
};

// Load Lokasi Arsip
const loadLokasi = async () => {
  try {
    const response = await axios.get('/dms/listLokasiArsip');
    listLokasi.value = response.data;
  } catch (err) {
    console.error('Error loading lokasi:', err);
  }
};

// Load Lokasi Arsip berdasarkan BU
const loadLokasiByBU = async (bu_id) => {
  try {
    if (!bu_id) {
      listLokasi.value = [];
      return;
    }
    
    const response = await axios.get('/dms/getLokasiArsipByBU', {
      params: { lokasi_arsip_bu_id: bu_id }
    });
    listLokasi.value = response.data;
  } catch (err) {
    console.error('Error loading lokasi by BU:', err);
    listLokasi.value = [];
  }
};

// Watch untuk perubahan BU filter
const watchBUFilter = () => {
  if (filterBU.value) {
    loadLokasiByBU(filterBU.value);
  } else {
    loadLokasi();
  }
};
</script>

<style scoped>
.sticky-column-left {
  position: sticky;
  left: 0;
  z-index: 1;
  background: white;
}

.sticky-column-left-header {
  position: sticky;
  left: 0;
  z-index: 2;
}
</style>


