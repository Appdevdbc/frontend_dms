<template>
  <q-card class="tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
    <q-card-section :class="`bg-${domain()} tw-py-4`">
      <div class="tw-flex tw-items-center tw-gap-3">
        <q-btn flat round icon="arrow_back" color="white" @click="emit('close')" />
        <div class="text-h6 tw-text-white tw-font-bold">Detail Dokumen</div>
      </div>
    </q-card-section>

    <div v-if="loading" class="tw-flex tw-justify-center tw-py-12">
      <q-spinner-dots color="blue-6" size="40px" />
    </div>

    <template v-else-if="doc">
      <q-card-section style="max-height:75vh" class="scroll tw-p-6">
        <div class="row q-col-gutter-md">

          <!-- Kolom Kiri -->
          <div class="col-12 col-md-6">
            <div class="tw-font-bold tw-text-slate-600 tw-mb-3 tw-text-sm tw-uppercase tw-tracking-wide">Informasi Dokumen</div>

            <div class="tw-grid tw-grid-cols-1 tw-gap-3">
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Nama Dokumen</div>
                <div class="tw-font-semibold">{{ doc.content_name }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Nomor Dokumen</div>
                <div class="tw-font-semibold">{{ doc.content_doc || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Folder</div>
                <div class="tw-font-semibold">{{ doc.folder_name || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Keterangan Dokumen</div>
                <div class="tw-font-semibold">{{ doc.content_desc || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Kategori Dokumen</div>
                <div class="tw-font-semibold">{{ doc.arsip_kat || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Sub Kategori Dokumen</div>
                <div class="tw-font-semibold">{{ doc.sub_arsip_jenis || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Lokasi Kerja</div>
                <div class="tw-font-semibold">{{ doc.work_desc || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Nomor Arsip</div>
                <div class="tw-font-semibold">{{ doc.arsip_no || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">File Dokumen</div>
                <q-btn flat dense color="blue-6" icon="picture_as_pdf" :label="doc.content_file" @click="openFile(doc.content_file)" class="tw-text-xs" />
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Status Pembaharuan</div>
                <q-badge :color="doc.content_type === 'renewable' ? 'green-6' : 'grey-6'" :label="doc.content_type" />
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Notifikasi Reminder</div>
                <q-badge :color="doc.content_reminder === 'yes' ? 'blue-6' : 'grey-6'" :label="doc.content_reminder || '-'" />
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Kondisi Dokumen</div>
                <q-badge :color="doc.kondisi_doc === 'rusak' ? 'red-6' : 'green-6'" :label="doc.kondisi_doc || 'baik'" />
              </div>
              <div v-if="doc.kondisi_doc_ket" class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Keterangan Kondisi</div>
                <div class="tw-font-semibold">{{ doc.kondisi_doc_ket }}</div>
              </div>
            </div>
          </div>

          <!-- Kolom Kanan -->
          <div class="col-12 col-md-6">
            <div class="tw-font-bold tw-text-slate-600 tw-mb-3 tw-text-sm tw-uppercase tw-tracking-wide">Informasi Tambahan</div>

            <div class="tw-grid tw-grid-cols-1 tw-gap-3">
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Bisnis Unit</div>
                <div class="tw-font-semibold">{{ doc.bu_name || doc.content_bu || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Divisi</div>
                <div class="tw-font-semibold">{{ doc.div_nama || doc.content_div || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Jenis & Jumlah Dokumen</div>
                <div class="tw-flex tw-gap-4 tw-mt-1">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <q-icon :name="doc.jenis_asli ? 'check_box' : 'check_box_outline_blank'" :color="doc.jenis_asli ? 'blue-6' : 'grey-4'" />
                    <span class="tw-text-sm">Asli</span>
                    <q-badge v-if="doc.jenis_asli" color="blue-6" :label="doc.jenis_asli_qty" />
                  </div>
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <q-icon :name="doc.jenis_copy ? 'check_box' : 'check_box_outline_blank'" :color="doc.jenis_copy ? 'blue-6' : 'grey-4'" />
                    <span class="tw-text-sm">Copy</span>
                    <q-badge v-if="doc.jenis_copy" color="blue-6" :label="doc.jenis_copy_qty" />
                  </div>
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <q-icon :name="doc.jenis_elektronik ? 'check_box' : 'check_box_outline_blank'" :color="doc.jenis_elektronik ? 'blue-6' : 'grey-4'" />
                    <span class="tw-text-sm">PDF/Elektronik</span>
                    <q-badge v-if="doc.jenis_elektronik" color="blue-6" :label="doc.jenis_elektronik_qty" />
                  </div>
                </div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Tanggal Dokumen</div>
                <div class="tw-font-semibold">{{ formatDateDMY(doc.tgl_doc) || '-' }}</div>
              </div>
              <div v-if="doc.content_duedate && doc.content_duedate !== '1900-01-01'" class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Tanggal Kadaluarsa</div>
                <div :class="isExpired ? 'tw-font-semibold tw-text-red-600' : 'tw-font-semibold'">
                  {{ formatDateDMY(doc.content_duedate) }}
                  <q-badge v-if="isExpired" color="red-6" label="Kadaluarsa" class="tw-ml-2" />
                </div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Tanggal Penyerahan</div>
                <div class="tw-font-semibold">
                  {{ formatDateDMY(doc.tgl_doc_serah) || '-' }}
                  <span v-if="doc.content_waktu_doc_serah" class="tw-text-gray-500 tw-ml-1">{{ doc.content_waktu_doc_serah }}</span>
                </div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Kategori Keamanan</div>
                <q-badge :color="secColor(doc.content_security)" :label="doc.content_security" class="tw-px-2 tw-py-1" />
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Lokasi Penyimpanan</div>
                <div class="tw-font-semibold">{{ doc.lokasi_arsip_name || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Arsiparis Lokasi</div>
                <div class="tw-font-semibold">{{ doc.arsiparis_nama || doc.arsiparis_id || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Status Dokumen</div>
                <q-badge :color="statusColor(doc.content_status)" :label="doc.content_status" class="tw-px-2 tw-py-1" />
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">PIC Owner</div>
                <div class="tw-font-semibold">{{ doc.owner_name || doc.content_owner || '-' }}</div>
              </div>
              <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
                <div class="tw-text-xs tw-text-gray-500 tw-mb-1">PIC Keeper</div>
                <div class="tw-flex tw-items-center tw-gap-2">
                  <span class="tw-font-semibold">{{ doc.keeper_name || doc.content_keeper || '-' }}</span>
                  <q-badge v-if="doc.content_statuskeeper == 1" color="green-6" label="Confirmed" />
                  <q-badge v-else-if="doc.content_statuskeeper == 2" color="red-6" label="Rejected" />
                  <q-badge v-else color="grey-6" label="Pending" />
                </div>
              </div>
            </div>

            <!-- Kelengkapan Dokumen -->
            <div class="tw-mt-4">
              <div class="tw-font-bold tw-text-slate-600 tw-mb-3 tw-text-sm tw-uppercase tw-tracking-wide">
                Kelengkapan Dokumen
                <q-badge v-if="pendukung.length > 0" color="blue-6" :label="pendukung.length" class="tw-ml-2" />
              </div>
              <div v-if="pendukung.length > 0" class="tw-flex tw-flex-wrap tw-gap-2">
                <q-btn v-for="p in pendukung" :key="p.cdet_content_det_id"
                  outline color="blue-6" icon="attach_file" :label="p.cdet_nama || p.cdet_file"
                  size="sm" class="tw-rounded-lg" @click="openKelengkapan(p)" />
              </div>
              <div v-else class="tw-text-gray-400 tw-text-sm tw-italic">Tidak ada dokumen pendukung</div>
            </div>
          </div>

        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
        <q-btn label="Tutup" color="grey-6" push icon="close" @click="emit('close')" />
        <q-btn label="View File" color="blue-6" push icon="visibility" @click="openFile(doc.content_file)" />
        <q-btn label="Download" color="green-6" push icon="download" @click="handleDownload" />
      </q-card-actions>
    </template>

    <DownloadDialog v-model="showDownloadDialog" :content-id="doc?.content_id"
      :content-file="doc?.content_file" :content-name="doc?.content_name"
      :content-security="doc?.content_security" />

    <!-- Modal Kelengkapan Dokumen (konfirm-info) -->
    <q-dialog v-model="showKelengkapanDialog">
      <q-card style="min-width:480px">
        <q-card-section class="bg-blue-7 text-white tw-flex tw-items-center tw-justify-between">
          <div class="text-h6">Data Pendukung</div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>
        <q-card-section class="tw-p-6 tw-flex tw-justify-center" v-if="!selectedPendukung">
          <q-spinner-dots color="blue-6" size="32px" />
        </q-card-section>
        <q-card-section class="tw-p-6" v-if="selectedPendukung">
          <div class="tw-grid tw-grid-cols-1 tw-gap-3">
            <!-- Nama dari content_det -->
            <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
              <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Nama Dokumen</div>
              <div class="tw-font-semibold">{{ selectedPendukung.cdet_nama || '-' }}</div>
            </div>
            <!-- Field berikut diambil dari dokumen induk (doc) -->
            <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
              <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Nomor Dokumen</div>
              <div class="tw-font-semibold">{{ doc?.content_doc || '-' }}</div>
            </div>
            <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
              <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Tanggal Dokumen</div>
              <div class="tw-font-semibold">{{ formatDateDMY(doc?.tgl_doc) || '-' }}</div>
            </div>
            <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
              <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Status Pembaharuan</div>
              <q-badge :color="doc?.content_type === 'renewable' ? 'green-6' : 'grey-6'"
                :label="doc?.content_type || '-'" />
            </div>
            <div v-if="doc?.content_duedate && doc.content_duedate !== '1900-01-01'" class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
              <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Tanggal Daluwarsa</div>
              <div class="tw-font-semibold">{{ formatDateDMY(doc.content_duedate) }}</div>
            </div>
            <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
              <div class="tw-text-xs tw-text-gray-500 tw-mb-1">Notifikasi Reminder</div>
              <q-badge :color="doc?.content_reminder === 'yes' ? 'blue-6' : 'grey-6'"
                :label="doc?.content_reminder || '-'" />
            </div>
            <!-- File dari content_det -->
            <div class="tw-bg-slate-50 tw-rounded-lg tw-p-3">
              <div class="tw-text-xs tw-text-gray-500 tw-mb-1">File</div>
              <q-btn v-if="selectedPendukung.cdet_file" flat dense color="blue-6" icon="picture_as_pdf"
                :label="selectedPendukung.cdet_file" @click="openFile(selectedPendukung.cdet_file, true)" class="tw-text-xs" />
              <span v-else class="tw-text-gray-400 tw-text-sm tw-italic">Tidak ada file</span>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Tutup" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import { domain, empid, formatDateDMY } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import DownloadDialog from "./DownloadDialog.vue";

const props = defineProps({ contentId: [Number, String] });
const emit = defineEmits(['close']);
const { error } = useNotify();

const loading = ref(false);
const doc = ref(null);
const pendukung = ref([]);
const showDownloadDialog = ref(false);
const showKelengkapanDialog = ref(false);
const selectedPendukung = ref(null);

const secColor = (s) => ({ 'non-restricted': 'green-6', 'confidential': 'orange-6', 'restricted': 'red-6' }[s] || 'grey-6');
const statusColor = (s) => ({ 'Tersedia': 'green-6', 'Pinjam': 'orange-6', 'Revisi': 'amber-6', 'Ditolak': 'red-6' }[s] || 'blue-6');

const isExpired = computed(() => {
  if (!doc.value?.content_duedate || doc.value.content_duedate === '1900-01-01') return false;
  return dayjs(doc.value.content_duedate).isBefore(dayjs(), 'day');
});

const openFile = (f, isKelengkapan = false) => {
  const base = import.meta.env.VITE_FILE_URL || '';
  const path = isKelengkapan ? `${base}kelengkapan/${f}` : `${base}${f}`;
  window.open(path, '_blank');
};

const openKelengkapan = async (p) => {
  selectedPendukung.value = null;
  showKelengkapanDialog.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/content-det`, {
      params: { content_id: props.contentId }
    });
    const detail = (res.data || []).find(d => d.cdet_content_det_id === p.cdet_content_det_id);
    // Pastikan cdet_nama terisi — fallback ke cdet_file jika kosong
    const item = detail || p;
    selectedPendukung.value = { ...item, cdet_nama: item.cdet_nama || item.cdet_file || '-' };
  } catch {
    selectedPendukung.value = { ...p, cdet_nama: p.cdet_nama || p.cdet_file || '-' };
  }
};

const handleDownload = () => {
  if (doc.value?.content_security !== 'non-restricted') {
    showDownloadDialog.value = true;
  } else {
    axios.post(`${import.meta.env.VITE_API}dms/document/download-log`, { content_id: doc.value.content_id, empid: empid() }).catch(() => {});
    openFile(doc.value.content_file);
  }
};

const loadDoc = async () => {
  if (!props.contentId) return;
  loading.value = true;
  try {
    const res = await axios.get(`/dms/document/files/${props.contentId}`);
    doc.value = res.data.data;
    pendukung.value = res.data.pendukung || [];
  } catch (e) { error('Gagal memuat detail dokumen'); } finally { loading.value = false; }
};

watch(() => props.contentId, loadDoc, { immediate: true });
</script>

