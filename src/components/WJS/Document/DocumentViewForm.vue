<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`bg-${domain()} tw-py-5`">
        <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-2">
          <q-icon name="visibility" size="24px" />ADD CONTENT (VIEW)
        </div>
      </q-card-section>

      <div v-if="loading" class="tw-flex tw-justify-center tw-py-12">
        <q-spinner-dots color="blue-6" size="40px" />
      </div>

      <template v-else-if="docData">
        <q-card-section style="max-height:75vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">

            <!-- Kolom Kiri -->
            <div class="col-12 col-md-6">
              <div class="tw-grid tw-grid-cols-1 tw-gap-4">

                <q-input :model-value="docData.content_name" outlined label="Nama Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.content_doc" outlined label="Nomor Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="tag" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.folder_name" outlined label="Folder" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="folder" color="amber-7" /></template>
                </q-input>

                <q-input :model-value="docData.content_desc" outlined label="Keterangan Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="notes" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.arsip_kat" outlined label="Kategori Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.arsip_no" outlined label="Nomor Arsip" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="numbers" color="blue-6" /></template>
                </q-input>

                <!-- File Dokumen -->
                <div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-1">File Dokumen</div>
                  <q-btn outline color="blue-6" icon="download" :label="docData.content_file" size="sm"
                    @click="openFile(docData.content_file)" class="tw-rounded-lg" />
                </div>

                <q-input :model-value="docData.content_type" outlined label="Status Pembaharuan" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="autorenew" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.content_reminder" outlined label="Notifikasi Reminder" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="notifications" color="blue-6" /></template>
                </q-input>

                <!-- Kelengkapan Dokumen -->
                <div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Kelengkapan Dokumen</div>
                  <div class="tw-border tw-rounded-lg tw-p-3 tw-space-y-1 tw-bg-slate-50">
                    <div v-if="pendukung.length === 0" class="tw-text-xs tw-text-slate-400">Tidak ada data pendukung</div>
                    <div v-for="p in pendukung" :key="p.cdet_content_det_id"
                      class="tw-flex tw-items-center tw-justify-between tw-bg-white tw-rounded tw-px-3 tw-py-2 tw-text-sm tw-border">
                      <div class="tw-flex tw-items-center tw-gap-2 tw-truncate">
                        <q-icon name="description" color="blue-6" size="16px" />
                        <span class="tw-truncate">{{ p.cdet_doc_name || p.cdet_nama || p.cdet_file }}</span>
                      </div>
                      <q-btn flat round dense icon="info" size="xs" color="blue-6" @click="openPendukungDetail(p)">
                        <q-tooltip>Lihat Detail</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
                <!-- Kondisi Dokumen -->
                <div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-1">Kondisi Dokumen</div>
                  <q-option-group :model-value="docData.kondisi_doc"
                    :options="[{label:'Baik',value:'baik'},{label:'Rusak',value:'rusak'}]"
                    color="blue-6" inline disable />
                </div>

                <q-input :model-value="docData.kondisi_doc_ket" outlined type="textarea"
                  label="Keterangan Kondisi" rows="3" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="comment" color="blue-6" /></template>
                </q-input>

              </div>
            </div>

            <!-- Kolom Kanan -->
            <div class="col-12 col-md-6">
              <div class="tw-grid tw-grid-cols-1 tw-gap-4">

                <q-input :model-value="docData.bu_name || docData.content_bu" outlined label="Bisnis Unit" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="domain" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.account_div_name || docData.content_div" outlined label="Division" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="account_tree" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.account_dir_name" outlined label="Direktorat" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="corporate_fare" color="blue-6" /></template>
                </q-input>

                <!-- Jenis & Jumlah Dokumen -->
                <div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Jenis & Jumlah Dokumen</div>
                  <div class="tw-border tw-rounded-lg tw-p-3 tw-grid tw-grid-cols-1 tw-gap-2 tw-bg-slate-50">
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <q-checkbox :model-value="!!docData.jenis_asli && docData.jenis_asli_qty > 0" label="Asli" disable />
                      <q-input :model-value="docData.jenis_asli_qty" type="number" dense outlined readonly style="width:80px" class="tw-bg-slate-50" />
                    </div>
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <q-checkbox :model-value="!!docData.jenis_copy && docData.jenis_copy_qty > 0" label="Copy" disable />
                      <q-input :model-value="docData.jenis_copy_qty" type="number" dense outlined readonly style="width:80px" class="tw-bg-slate-50" />
                    </div>
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <q-checkbox :model-value="!!docData.jenis_elektronik && docData.jenis_elektronik_qty > 0" label="PDF/Elektronik" disable />
                      <q-input :model-value="docData.jenis_elektronik_qty" type="number" dense outlined readonly style="width:80px" class="tw-bg-slate-50" />
                    </div>
                  </div>
                </div>

                <q-input :model-value="docData.tgl_doc ? String(docData.tgl_doc).split('T')[0] : ''" outlined label="Tanggal Dokumen" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
                </q-input>

                <q-input v-if="docData.content_duedate && !['','1900-01-01'].includes(String(docData.content_duedate).split('T')[0])"
                  :model-value="String(docData.content_duedate).split('T')[0]" outlined label="Tanggal Kadaluarsa" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="event_busy" color="orange-6" /></template>
                </q-input>

                <div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Tanggal Penyerahan Dokumen</div>
                  <div class="tw-grid tw-grid-cols-2 tw-gap-2">
                    <q-input :model-value="docData.tgl_doc_serah ? String(docData.tgl_doc_serah).split('T')[0] : ''" outlined label="Tanggal" type="date" readonly class="tw-rounded-lg tw-bg-slate-50" />
                    <q-input :model-value="parseTime(docData.content_waktu_doc_serah)" outlined label="Jam" type="time" readonly class="tw-rounded-lg tw-bg-slate-50" />
                  </div>
                </div>

                <q-input :model-value="docData.content_security" outlined label="Kategori Keamanan" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.lokasi_arsip_name" outlined label="Lokasi Penyimpanan" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="location_on" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.account_name_arsiparis" outlined label="Arsiparis Lokasi" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.account_email_arsiparis" outlined label="Email Arsiparis" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="email" color="blue-6" /></template>
                </q-input>

              </div>
            </div>

          </div>
        </q-card-section>

    <!-- Dialog Data Pendukung (view-only) -->
    <q-dialog v-model="showPendukungDialog">
      <q-card style="min-width:420px;max-width:520px">
        <q-card-section :class="`bg-${domain()} text-white`">
          <div class="text-h6 tw-flex tw-items-center tw-gap-2">
            <q-icon name="attach_file" />Data Pendukung
          </div>
        </q-card-section>
        <q-card-section class="tw-space-y-3 tw-pt-4" v-if="selectedPendukung">
          <q-input :model-value="selectedPendukung.cdet_doc_name || selectedPendukung.cdet_nama" outlined dense label="Nama Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
            <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
          </q-input>
          <q-input :model-value="selectedPendukung.cdet_doc_no" outlined dense label="Nomor Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
            <template v-slot:prepend><q-icon name="tag" color="blue-6" /></template>
          </q-input>
          <q-input :model-value="selectedPendukung.cdet_doc_date ? String(selectedPendukung.cdet_doc_date).split('T')[0] : ''"
            outlined dense label="Tanggal Dokumen" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
            <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
          </q-input>
          <q-input :model-value="selectedPendukung.cdet_doc_type" outlined dense label="Status Pembaharuan" readonly class="tw-rounded-lg tw-bg-slate-50">
            <template v-slot:prepend><q-icon name="autorenew" color="blue-6" /></template>
          </q-input>
          <q-input v-if="selectedPendukung.cdet_doc_daluwarsa"
            :model-value="String(selectedPendukung.cdet_doc_daluwarsa).split('T')[0]"
            outlined dense label="Tanggal Daluwarsa" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
            <template v-slot:prepend><q-icon name="event_busy" color="orange-6" /></template>
          </q-input>
          <q-input :model-value="selectedPendukung.cdet_reminder" outlined dense label="Notifikasi Reminder" readonly class="tw-rounded-lg tw-bg-slate-50">
            <template v-slot:prepend><q-icon name="notifications" color="blue-6" /></template>
          </q-input>
          <div v-if="selectedPendukung.cdet_file">
            <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-1">File</div>
            <q-btn outline color="blue-6" icon="download" :label="selectedPendukung.cdet_file" size="sm"
              @click="openFile(selectedPendukung.cdet_file)" class="tw-rounded-lg" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="tw-p-3">
          <q-btn flat label="Tutup" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

        <q-separator />
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Kembali" color="grey-6" push icon="arrow_back" @click="router.push('/wjs/document/recap')" />
        </q-card-actions>
      </template>

      <div v-else class="tw-text-center tw-py-12 tw-text-gray-400">
        <q-icon name="error_outline" size="48px" />
        <div class="tw-mt-2">Token tidak valid atau dokumen tidak ditemukan</div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { domain } from "../../../utils";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const docData = ref(null);
const pendukung = ref([]);
const token = route.query.token;

// Info user dari localStorage (sama seperti UploadForm)
const userInfo = computed(() => {
  try {
    const data = JSON.parse(window.localStorage.getItem('data') || '{}')?.data || {};
    return {
      bu_name: window.localStorage.getItem('bu_name') || data.bu_name || '',
      div_name: window.localStorage.getItem('div_name') || data.div_name || data.account_div_name || '',
      dir_name: window.localStorage.getItem('dir_name') || data.dir_name || data.account_dir_name || '',
    };
  } catch { return { bu_name: '', div_name: '', dir_name: '' }; }
});

const showPendukungDialog = ref(false);
const selectedPendukung = ref(null);

const openFile = (f) => {
  const base = import.meta.env.VITE_FTP || '';
  const dir = import.meta.env.VITE_FTP_DIR || 'dmslegal';
  window.open(`${base}${dir}/content/${f}`, '_blank');
};

// Parse waktu dari berbagai format SQL Server: "HH:mm:ss", "YYYY-MM-DDTHH:mm:ss.sssZ", "YYYY-MM-DD HH:mm:ss"
const parseTime = (val) => {
  if (!val) return '';
  const s = String(val);
  if (s.includes('T')) return s.split('T')[1].substring(0, 5);
  if (s.includes(' ') && s.length > 8) return s.split(' ')[1].substring(0, 5);
  return s.substring(0, 5);
};

const openPendukungDetail = (item) => {
  selectedPendukung.value = item;
  showPendukungDialog.value = true;
};

const loadData = async () => {
  if (!token) { loading.value = false; return; }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/document/approval/validate`, { params: { token } });
    docData.value = res.data.data;
    pendukung.value = res.data.pendukung || [];
  } catch { docData.value = null; } finally { loading.value = false; }
};

onMounted(loadData);
</script>

