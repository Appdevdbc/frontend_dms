<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="add_circle" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Form Mutasi Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/mutasi' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Mutasi Arsip
              </router-link>
              <q-icon name="chevron_right" size="14px"/>
              <span>Form</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div class="tw-max-w-7xl tw-mx-auto">
          <div class="tw-mb-4">
            <q-banner rounded class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm">
              <template v-slot:avatar>
                <q-icon name="info" color="blue" size="24px"/>
              </template>
              <span class="tw-text-blue-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
            </q-banner>
          </div>

          <!-- Two Column Form Layout -->
          <div class="row q-col-gutter-md tw-mb-6">
            <!-- Left Column -->
            <div class="col-12 col-md-6">
              <!-- Bisnis Unit (readonly) -->
              <q-input
                v-model="tmpForm.bu_name"
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
              <q-select
                v-model="tmpForm.kategori_dokumen"
                :options="kategoriDokumenOptions"
                option-value="code_value"
                option-label="code_value"
                emit-value
                map-options
                use-input
                input-debounce="0"
                @filter="filterKategoriDokumen"
                outlined
                label-slot
                :disable="isFiltersLocked"
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Dokumen</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Kategori Keamanan -->
              <q-select
                v-model="tmpForm.kategori_keamanan"
                :options="kategoriKeamananOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                label-slot
                :disable="isFiltersLocked"
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="security" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Keamanan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <!-- No. Mutasi (readonly) -->
              <q-input
                model-value="Auto Generate"
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

              <!-- Tanggal Pengajuan (readonly) -->
              <q-input
                v-model="tmpForm.tgl_pengajuan"
                outlined
                type="date"
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Pengajuan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <!-- Rencana Tanggal Mutasi -->
              <q-input
                v-model="tmpForm.tgl_mutasi"
                outlined
                type="date"
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Rencana Tanggal Mutasi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <!-- Keterangan Mutasi Arsip -->
              <q-input
                v-model="tmpForm.keterangan_pemusnahan"
                outlined
                type="textarea"
                rows="5"
                label-slot
                counter
                maxlength="500"
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Keterangan Mutasi Arsip</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <!-- Prioritas Approval -->
              <div class="tw-mb-4">
                <q-input
                  v-model.number="tmpForm.prioritas_approve"
                  outlined
                  type="number"
                  min="1"
                  label-slot
                >
                  <template v-slot:prepend>
                    <q-icon name="priority_high" color="blue-6"/>
                  </template>
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Prioritas Approval</span>
                    <span class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      color="blue-6"
                      label="View Detail"
                      size="sm"
                      @click="viewApprovalDetail"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Arsiparis Lokasi (Lama) - SELECT DROPDOWN -->
              <q-select
                v-model="tmpForm.arsiparis_lama"
                :options="listArsiparisLama"
                option-value="id"
                option-label="nama"
                emit-value
                map-options
                outlined
                label-slot
                :disable="isFiltersLocked"
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Lokasi (Lama)</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <!-- Atasan Arsiparis Lama (readonly, auto-filled) -->
              <q-input
                v-model="tmpForm.arsiparis_lama_atasan"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="supervisor_account" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Lokasi (Lama)</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <!-- Arsiparis Lokasi (Baru) -->
              <q-select
                v-model="tmpForm.arsiparis_baru"
                :options="listArsiparisBaru"
                option-value="id"
                option-label="nama"
                emit-value
                map-options
                outlined
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Lokasi (Baru)</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <!-- Atasan Arsiparis Baru (readonly) -->
              <q-input
                v-model="tmpForm.arsiparis_baru_atasan"
                outlined
                readonly
                label-slot
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="supervisor_account" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Lokasi (Baru)</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <!-- Catatan Arsiparis Lama (single-line text input) -->
              <q-input
                v-model="tmpForm.catatan_arsiparis_lama"
                outlined
                type="text"
                label-slot
                maxlength="500"
                :readonly="!isCatatanEditable"
                class="tw-mb-4"
              >
                <template v-slot:prepend>
                  <q-icon name="note" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Catatan Arsiparis Lokasi Lama</span>
                </template>
              </q-input>
            </div>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Document Selection Section -->
          <div class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="folder_open" color="blue-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Pilih Arsip untuk Dimutasi</div>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </div>
            
            <!-- Action Buttons Row -->
            <div class="row q-col-gutter-md tw-mb-4">
              <div class="col-12 col-md-6">
                <q-btn
                  unelevated
                  color="blue-6"
                  label="+ New"
                  icon="add"
                  @click="showAddModal = true"
                  class="tw-font-semibold"
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="tw-flex tw-gap-2">
                  <q-file
                    v-model="uploadFile"
                    outlined
                    dense
                    label="Upload Excel"
                    accept=".xls,.xlsx"
                    style="flex: 1"
                    class="tw-bg-white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="upload_file" />
                    </template>
                  </q-file>
                  <q-btn
                    unelevated
                    color="blue-6"
                    label="Upload"
                    @click="handleUpload"
                    :disable="!uploadFile"
                  />
                  <q-btn
                    unelevated
                    color="blue-6"
                    label="Download Template"
                    icon="download"
                    @click="downloadTemplate"
                  />
                </div>
              </div>
            </div>

            <!-- Selected Documents Table -->
            <q-table
              :rows="tmpForm.documents"
              :columns="documentColumns"
              row-key="arsip_no"
              flat
              bordered
              class="tw-shadow-md tw-rounded-xl"
            >
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <a href="javascript:void(0)" @click="editDocument(props.row)" class="tw-text-blue-600 hover:tw-underline">Edit</a>
                  <span class="tw-mx-1">|</span>
                  <a href="javascript:void(0)" @click="deleteDocument(props.row)" class="tw-text-red-600 hover:tw-underline">Hapus</a>
                </q-td>
              </template>
            </q-table>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Action Buttons -->
          <div class="tw-flex tw-gap-3 tw-justify-end">
            <q-btn 
              label="Kembali" 
              color="red-7" 
              push
              icon="arrow_back"
              class="tw-px-6 tw-font-semibold"
              @click="$router.push('/dms/mutasi')"
            />
            <q-btn 
              label="Simpan" 
              color="blue-6" 
              push
              icon="save"
              class="tw-px-6 tw-font-semibold"
              @click="validateAndSave"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Modals -->
    <AddArchiveModal
      v-model="showAddModal"
      :kategori-dokumen="tmpForm.kategori_dokumen"
      :kategori-keamanan="tmpForm.kategori_keamanan"
      :lokasi-arsip="tmpForm.lokasi_lama"
      module="mutasi"
      @archive-added="onArchiveAdded"
    />

    <EditArchiveModal
      v-model="showEditModal"
      :archive="selectedArchive"
      @keterangan-updated="onKeteranganUpdated"
    />

    <!-- Approval Detail Dialog -->
    <ApprovalDetailDialog
      v-model="showApprovalDialog"
      :bu-id="tmpForm.bulogin"
      :prioritas="tmpForm.prioritas_approve"
      :jenis-transaksi="7"
    />

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden">
        <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
          <div class="text-h6 tw-font-bold">Konfirmasi Mutasi</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700">Apakah anda yakin untuk melanjutkan mutasi arsip ini?</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn unelevated label="Tutup" color="red-7" v-close-popup class="tw-px-4" />
          <q-btn unelevated :color="`${domain()}`" label="Konfirmasi" @click="confirmSave" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import { domain, empid } from "../../../utils";
import { useRouter } from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import * as yup from "yup";
import AddArchiveModal from "../../../components/WJS/Pemusnahan/AddArchiveModal.vue";
import EditArchiveModal from "../../../components/WJS/Pemusnahan/EditArchiveModal.vue";
import ApprovalDetailDialog from "../../../components/WJS/Pemusnahan/ApprovalDetailDialog.vue";

const router = useRouter();
const { success, error: showError } = useNotify();
const loading = ref(false);

const tmpForm = reactive({
  bulogin: domain(),
  bu_name: window.localStorage.getItem("bu_name") || "",
  div: window.localStorage.getItem("div_name") || "",
  nik: window.localStorage.getItem("nik") || "",
  kategori_dokumen: null,
  kategori_keamanan: null,
  prioritas_approve: 1,
  tgl_pengajuan: null,
  tgl_mutasi: null,
  lokasi_lama: null,
  lokasi_lama_name: '',
  lokasi_arsip_baru: null,
  arsiparis_lama: null,
  arsiparis_lama_name: '',
  arsiparis_lama_atasan: '',
  arsiparis_baru: null,
  arsiparis_baru_atasan: '',
  catatan_arsiparis_lama: '',
  keterangan_pemusnahan: '',
  documents: []
});

const kategoriDokumenOptions = ref([]);
const listKategoriDokumenFull = ref([]);

const kategoriKeamananOptions = ref([]);

const listArsiparisLama = ref([]);
const listArsiparisBaru = ref([]);
const uploadFile = ref(null);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showConfirmDialog = ref(false);
const showApprovalDialog = ref(false);
const selectedArchive = ref({});

const documentColumns = [
  { name: 'arsip_no', label: 'Kode Arsip', field: 'arsip_no', align: 'left' },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left' },
  { name: 'content_doc', label: 'No. Document', field: 'content_doc', align: 'left' },
  { name: 'status_berlaku', label: 'Status Berlaku Arsip', field: 'status_berlaku', align: 'center' },
  { name: 'direktorat_name', label: 'Document Owner', field: 'direktorat_name', align: 'left' },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left' },
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', field: 'lokasi_arsip_name', align: 'left' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
];

const isFiltersLocked = computed(() => tmpForm.documents.length > 0);

const isCatatanEditable = computed(() => {
  // Catatan can only be edited if current user is the arsiparis lama
  return tmpForm.arsiparis_lama === tmpForm.nik;
});

const schema = yup.object({
  kategori_dokumen: yup.string().required("Kategori dokumen wajib diisi").nullable(),
  kategori_keamanan: yup.string().required("Kategori keamanan wajib diisi").nullable(),
  prioritas_approve: yup.number().required("Prioritas approval wajib diisi").min(1, "Prioritas approval minimal 1").nullable(),
  tgl_pengajuan: yup.date().required("Tanggal pengajuan wajib diisi").nullable(),
  tgl_mutasi: yup.date().required("Tanggal mutasi wajib diisi").nullable(),
  arsiparis_lama: yup.string().required("Arsiparis lokasi lama wajib diisi").nullable(),
  arsiparis_baru: yup.string().required("Arsiparis baru wajib diisi").nullable(),
  arsiparis_lama_atasan: yup.string().required("Atasan arsiparis lama wajib diisi").nullable(),
  documents: yup.array().min(1, "Minimal 1 arsip harus dipilih").nullable()
});

const getArsiparisLama = async () => {
  if (!tmpForm.bulogin) return;
  
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/arsiparis`, {
      params: { 
        rowsPerPage: null,
        bu_id: tmpForm.bulogin
      },
      skipErrorInterceptor: true
    });
    listArsiparisLama.value = res.data;
  } catch (error) {
    console.error('getArsiparisLama error:', error);
  }
};

const getArsiparisBaru = async () => {
  if (!tmpForm.bulogin) return;
  
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/arsiparis`, {
      params: { 
        rowsPerPage: null,
        bu_id: tmpForm.bulogin
      },
      skipErrorInterceptor: true
    });
    listArsiparisBaru.value = res.data;
  } catch (error) {
    console.error('getArsiparisBaru error:', error);
  }
};

const getArsiparisBaruAtasan = async () => {
  if (!tmpForm.arsiparis_baru) {
    tmpForm.arsiparis_baru_atasan = '';
    return;
  }
  
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/arsiparis-atasan`, {
      params: { arsiparis: tmpForm.arsiparis_baru },
      skipErrorInterceptor: true
    });
    tmpForm.arsiparis_baru_atasan = res.data.data.nama;
  } catch (error) {
    console.error('getArsiparisBaruAtasan error:', error);
  }
};

const getArsiparisBaruLokasi = () => {
  if (!tmpForm.arsiparis_baru) {
    tmpForm.lokasi_arsip_baru = null;
    return;
  }
  
  try {
    // Get arsiparis baru details to find their lokasi_arsip
    const arsiparis = listArsiparisBaru.value.find(a => a.id === tmpForm.arsiparis_baru);
    if (arsiparis) {
      // Backend returns both arsiparis_lokasi_arsip_id (from mst_arsiparis) and lokasi_arsip_id (from join)
      tmpForm.lokasi_arsip_baru = arsiparis.arsiparis_lokasi_arsip_id || arsiparis.lokasi_arsip_id;
      console.log('Arsiparis baru found:', arsiparis);
      console.log('Lokasi baru set:', tmpForm.lokasi_arsip_baru);
    } else {
      console.warn('Arsiparis baru not found in list:', tmpForm.arsiparis_baru);
      console.log('Available arsiparis:', listArsiparisBaru.value);
    }
  } catch (error) {
    console.error('getArsiparisBaruLokasi error:', error);
  }
};

watch(() => tmpForm.arsiparis_lama, (newVal) => {
  // Clear all documents when arsiparis lama changes
  tmpForm.documents = [];
  tmpForm.lokasi_lama = null;
  tmpForm.lokasi_lama_name = '';
  
  if (!newVal) {
    tmpForm.arsiparis_lama_atasan = '';
    tmpForm.catatan_arsiparis_lama = '';
  } else {
    getArsiparisLamaAtasan(newVal);
    getArsiparisLamaLokasi(newVal);
  }
});

watch(() => tmpForm.arsiparis_baru, () => {
  getArsiparisBaruAtasan();
  getArsiparisBaruLokasi();
});

watch(() => tmpForm.tgl_mutasi, () => {
  if (!tmpForm.tgl_mutasi) return;
  
  const today = new Date().toISOString().split('T')[0];
  if (tmpForm.tgl_mutasi < today) {
    showError('Tanggal mutasi tidak boleh sebelum hari ini');
    tmpForm.tgl_mutasi = today;
  }
});

const onArchiveAdded = (archive) => {
  const exists = tmpForm.documents.find(doc => doc.arsip_no === archive.arsip_no);
  if (exists) {
    showError('Nomer dokumen sudah diinputkan!');
    return;
  }
  
  // Auto-detect old location from first document (but NOT arsiparis - user selects it manually)
  if (tmpForm.documents.length === 0) {
    tmpForm.lokasi_lama = archive.lokasi_arsip_id;
    tmpForm.lokasi_lama_name = archive.lokasi_arsip_name;
  }
  
  tmpForm.documents.push(archive);
};

const getArsiparisLamaAtasan = async (arsiparisId) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/arsiparis-atasan`, {
      params: { arsiparis: arsiparisId },
      skipErrorInterceptor: true
    });
    tmpForm.arsiparis_lama_atasan = res.data.data.nama;
  } catch (error) {
    console.error('getArsiparisLamaAtasan error:', error);
  }
};

const getArsiparisLamaLokasi = async (arsiparisId) => {
  try {
    // Get arsiparis details to find their lokasi_arsip
    const arsiparis = listArsiparisLama.value.find(a => a.id === arsiparisId);
    if (arsiparis) {
      // Backend returns both arsiparis_lokasi_arsip_id (from mst_arsiparis) and lokasi_arsip_id (from join)
      tmpForm.lokasi_lama = arsiparis.arsiparis_lokasi_arsip_id || arsiparis.lokasi_arsip_id;
      tmpForm.lokasi_lama_name = arsiparis.lokasi_arsip_name || '';
      console.log('Arsiparis lama found:', arsiparis);
      console.log('Lokasi lama set:', tmpForm.lokasi_lama, tmpForm.lokasi_lama_name);
    } else {
      console.warn('Arsiparis not found in list:', arsiparisId);
      console.log('Available arsiparis:', listArsiparisLama.value);
    }
  } catch (error) {
    console.error('getArsiparisLamaLokasi error:', error);
  }
};

const viewApprovalDetail = () => {
  if (!tmpForm.bulogin || !tmpForm.prioritas_approve) {
    showError('Bisnis unit dan prioritas approval harus diisi');
    return;
  }
  
  showApprovalDialog.value = true;
};

const editDocument = (doc) => {
  selectedArchive.value = doc;
  showEditModal.value = true;
};

const deleteDocument = (doc) => {
  const index = tmpForm.documents.findIndex(d => d.arsip_no === doc.arsip_no);
  if (index > -1) {
    tmpForm.documents.splice(index, 1);
  }
  
  // Clear old location if no documents (arsiparis stays selected)
  if (tmpForm.documents.length === 0) {
    tmpForm.lokasi_lama = null;
    tmpForm.lokasi_lama_name = '';
  }
};

const onKeteranganUpdated = ({ arsip_no, keterangan }) => {
  const doc = tmpForm.documents.find(d => d.arsip_no === arsip_no);
  if (doc) {
    doc.keterangan = keterangan;
  }
};

const handleUpload = async () => {
  if (!uploadFile.value) {
    showError('Pilih file Excel terlebih dahulu');
    return;
  }
  
  if (!tmpForm.kategori_dokumen) {
    showError('Silahkan pilih kategori dokumen terlebih dahulu');
    return;
  }
  
  if (!tmpForm.kategori_keamanan) {
    showError('Silahkan pilih kategori keamanan terlebih dahulu');
    return;
  }
  
  if (!tmpForm.arsiparis_lama) {
    showError('Silahkan pilih arsiparis lama terlebih dahulu');
    return;
  }
  
  try {
    loading.value = true;
    
    const formData = new FormData();
    formData.append('file', uploadFile.value);
    formData.append('arsiparis', tmpForm.arsiparis_lama);
    formData.append('kategori_dokumen', tmpForm.kategori_dokumen);
    formData.append('kategori_keamanan', tmpForm.kategori_keamanan);
    formData.append('content_owner', window.localStorage.getItem('id') || '');
    
    const res = await axios.post(`${import.meta.env.VITE_API}dms/mutasi/upload-details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      skipErrorInterceptor: true
    });
    
    loading.value = false;
    
    if (res.data.errors && res.data.errors.length > 0) {
      res.data.errors.forEach(err => showError(err));
    }
    
    if (res.data.data && res.data.data.length > 0) {
      res.data.data.forEach(archive => {
        const exists = tmpForm.documents.find(doc => doc.arsip_no === archive.arsip_no);
        if (!exists) {
          // Auto-detect old location from first document
          if (tmpForm.documents.length === 0) {
            tmpForm.lokasi_lama = archive.lokasi_arsip_id;
            tmpForm.lokasi_lama_name = archive.lokasi_arsip_name;
          }
          tmpForm.documents.push(archive);
        }
      });
      
      success(`${res.data.summary.valid} arsip berhasil ditambahkan dari ${res.data.summary.total} baris`);
    }
    
    uploadFile.value = null;
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal upload file Excel');
  }
};

const downloadTemplate = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/template`, {
      responseType: 'blob',
      skipErrorInterceptor: true
    });
    
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_mutasi.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    success('Template berhasil didownload');
  } catch (error) {
    showError(error?.response?.data?.message || error?.message || 'Gagal download template');
  }
};

const validateAndSave = async () => {
  const validate = {
    kategori_dokumen: tmpForm.kategori_dokumen,
    kategori_keamanan: tmpForm.kategori_keamanan,
    prioritas_approve: tmpForm.prioritas_approve,
    tgl_pengajuan: tmpForm.tgl_pengajuan,
    tgl_mutasi: tmpForm.tgl_mutasi,
    arsiparis_lama: tmpForm.arsiparis_lama,
    arsiparis_baru: tmpForm.arsiparis_baru,
    arsiparis_lama_atasan: tmpForm.arsiparis_lama_atasan,
    documents: tmpForm.documents
  };

  schema.validate(validate, { abortEarly: false })
    .then(() => {
      showConfirmDialog.value = true;
    })
    .catch(err => {
      err.inner.forEach(e => {
        showError(e.message);
      });
    });
};

const confirmSave = () => {
  showConfirmDialog.value = false;
  saveMutasi();
};

const saveMutasi = async () => {
  try {
    loading.value = true;
    
    const payload = {
      creator: empid(),
      kategori_dokumen: tmpForm.kategori_dokumen,
      kategori_keamanan: tmpForm.kategori_keamanan,
      prioritas_approve: tmpForm.prioritas_approve,
      tgl_pengajuan: tmpForm.tgl_pengajuan,
      tgl_mutasi: tmpForm.tgl_mutasi,
      lokasi_arsip_baru: tmpForm.lokasi_arsip_baru,
      arsiparis_lama: tmpForm.arsiparis_lama,
      arsiparis_baru: tmpForm.arsiparis_baru,
      catatan_arsiparis_lama: tmpForm.catatan_arsiparis_lama,
      keterangan_pemusnahan: tmpForm.keterangan_pemusnahan,
      documents: tmpForm.documents
    };
    
    console.log('Payload being sent:', payload);
    console.log('lokasi_arsip_baru value:', tmpForm.lokasi_arsip_baru);
    
    const res = await axios.post(`${import.meta.env.VITE_API}dms/mutasi`, payload, {
      skipErrorInterceptor: true
    });

    loading.value = false;
    success('Tiket mutasi berhasil dibuat');
    router.push('/dms/mutasi');
  } catch (error) {
    loading.value = false;
    console.error('Save error:', error);
    showError(error?.response?.data?.message || error?.message || 'Gagal menyimpan data');
  }
};

const getKategoriDokumen = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}listCodeMaster`, {
      params: {
        field: 'dms_kategori_dokumen',
        limit: 10
      },
      skipErrorInterceptor: true
    });
    listKategoriDokumenFull.value = res.data;
    kategoriDokumenOptions.value = res.data;
  } catch (error) {
    console.error('getKategoriDokumen error:', error);
  }
};

const filterKategoriDokumen = (val, update) => {
  update(() => {
    if (val === '') {
      kategoriDokumenOptions.value = listKategoriDokumenFull.value;
    } else {
      const needle = val.toLowerCase();
      kategoriDokumenOptions.value = listKategoriDokumenFull.value.filter(
        v => v.code_value.toLowerCase().indexOf(needle) > -1
      );
    }
  });
};

const getKategoriKeamanan = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}listCodeMaster`, {
      params: {
        field: 'dms_pemusnahan_dokumen',
        rowsPerPage: null
      },
      skipErrorInterceptor: true
    });
    kategoriKeamananOptions.value = res.data.map(item => ({
      label: item.code_value,
      value: item.code_value
    }));
  } catch (error) {
    console.error('getKategoriKeamanan error:', error);
  }
};

onMounted(() => {
  const today = new Date().toISOString().split('T')[0];
  tmpForm.tgl_pengajuan = today;
  tmpForm.tgl_mutasi = today;
  
  getKategoriDokumen();
  getKategoriKeamanan();
  getArsiparisLama();
  getArsiparisBaru();
});
</script>


