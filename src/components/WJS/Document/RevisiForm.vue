<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`bg-${domain()} tw-py-5`">
        <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-2">
          <q-icon name="edit_note" size="24px" />ADD CONTENT (REVISI)
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

                <q-input v-model="form.namafile" outlined label="Nama Dokumen *" class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
                </q-input>

                <div>
                  <q-input v-model="form.content_doc" outlined label="Nomor Dokumen" class="tw-rounded-lg"
                    @update:model-value="v => form.content_doc = v ? v.replace(/\s/g, '') : ''">
                    <template v-slot:prepend><q-icon name="tag" color="blue-6" /></template>
                  </q-input>
                  <div v-if="docStatus" class="tw-text-xs tw-mt-1 tw-px-1">
                    <span v-if="docStatus === 'checking'" class="tw-text-slate-400 tw-flex tw-items-center tw-gap-1">
                      <q-spinner size="12px" />Memeriksa nomor dokumen...
                    </span>
                    <span v-else-if="docStatus === 'valid'" class="tw-text-green-600 tw-flex tw-items-center tw-gap-1">
                      <q-icon name="check_circle" size="14px" />
                      Nomor dokumen ditemukan{{ docInfo?.doc_judul ? ': ' + docInfo.doc_judul : '' }}
                    </span>
                    <span v-else-if="docStatus === 'invalid'" class="tw-text-red-500 tw-flex tw-items-center tw-gap-1">
                      <q-icon name="cancel" size="14px" />Nomor dokumen tidak ditemukan atau bukan status Open
                    </span>
                  </div>
                </div>

                <q-input :model-value="docData.folder_name" outlined label="Folder" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="folder" color="amber-7" /></template>
                </q-input>

                <q-input v-model="form.description" outlined label="Keterangan Dokumen" class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="notes" color="blue-6" /></template>
                </q-input>

                <q-select v-model="form.content_kat" outlined label="Kategori Dokumen *"
                  :options="['Dokumen Legal','Dokumen Non Legal']" class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
                </q-select>

                <q-select v-model="form.content_kat_sub" outlined label="Sub Kategori Dokumen *"
                  :options="subKategoriOptions" option-label="sub_arsip_jenis" option-value="sub_arsip_id"
                  emit-value map-options class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="label" color="blue-6" /></template>
                </q-select>

                <q-select v-model="form.worklocation" outlined label="Lokasi Kerja *"
                  :options="workLocationOptions" option-label="work_desc" option-value="work_id"
                  emit-value map-options class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="place" color="blue-6" /></template>
                </q-select>

                <q-input :model-value="form.no_arsip" outlined label="Nomor Arsip" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="numbers" color="blue-6" /></template>
                </q-input>

                <!-- File Dokumen (opsional saat revisi) -->
                <div>
                  <div class="tw-font-semibold tw-text-slate-700 tw-mb-1 tw-text-sm">Upload File PDF (opsional)</div>
                  <div class="tw-text-xs tw-text-slate-500 tw-mb-1">
                    File saat ini:
                    <a :href="ftpUrl(docData.content_file)" target="_blank" class="tw-text-blue-600 tw-underline">
                      {{ docData.content_file }}
                    </a>
                  </div>
                  <q-file v-model="form.filedoc" outlined accept=".pdf" label="Ganti File PDF (opsional)" class="tw-rounded-lg">
                    <template v-slot:prepend><q-icon name="attach_file" color="blue-6" /></template>
                  </q-file>
                </div>

                <q-select v-model="form.jenisfile" outlined label="Status Pembaharuan *"
                  :options="[{label:'Renewable',value:'renewable'},{label:'Non Renewable',value:'non-renewable'}]"
                  emit-value map-options class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="autorenew" color="blue-6" /></template>
                </q-select>

                <q-select v-model="form.content_reminder" outlined label="Notifikasi Reminder"
                  :options="[{label:'Yes',value:'yes'},{label:'No',value:'no'}]"
                  emit-value map-options class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="notifications" color="blue-6" /></template>
                </q-select>

                <!-- Kelengkapan Dokumen -->
                <div>
                  <div class="tw-font-semibold tw-text-slate-700 tw-mb-2 tw-text-sm">Kelengkapan Dokumen</div>
                  <div class="tw-border tw-rounded-lg tw-p-3 tw-space-y-2">
                    <div v-for="(item, idx) in pendukung" :key="idx"
                      class="tw-flex tw-items-center tw-justify-between tw-bg-slate-50 tw-rounded tw-px-3 tw-py-2 tw-text-sm">
                      <div class="tw-flex tw-items-center tw-gap-2 tw-truncate">
                        <q-icon name="description" color="blue-6" size="16px" />
                        <a :href="ftpUrl(item.cdet_file)" target="_blank" class="tw-truncate tw-text-blue-600 tw-underline">
                          {{ item.cdet_doc_name || item.cdet_file }}
                        </a>
                      </div>
                      <q-btn flat round dense icon="info" size="xs" color="blue-6" @click="openPendukungDetail(item)">
                        <q-tooltip>Detail</q-tooltip>
                      </q-btn>
                    </div>
                    <div v-if="pendukung.length === 0" class="tw-text-xs tw-text-slate-400">Tidak ada data pendukung</div>
                    <q-btn unelevated color="blue-6" icon="add" label="Tambah Data Pendukung" size="sm"
                      class="tw-w-full tw-rounded-lg" @click="openPendukung()" />
                  </div>
                </div>

                <!-- Kondisi Dokumen -->
                <div>
                  <div class="tw-font-semibold tw-text-slate-700 tw-mb-2 tw-text-sm">Kondisi Dokumen</div>
                  <q-option-group v-model="form.kondisi_dok"
                    :options="[{label:'Baik',value:'baik'},{label:'Rusak',value:'rusak'}]"
                    color="blue-6" inline />
                </div>

                <q-input v-model="form.keterangan" outlined type="textarea" label="Keterangan Kondisi Dokumen"
                  rows="3" class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="comment" color="blue-6" /></template>
                </q-input>

              </div>
            </div>

            <!-- Kolom Kanan -->
            <div class="col-12 col-md-6">
              <div class="tw-grid tw-grid-cols-1 tw-gap-4">

                <q-input :model-value="docData.content_bu" outlined label="Bisnis Unit" readonly class="tw-rounded-lg tw-bg-slate-50">
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
                  <div class="tw-font-semibold tw-text-slate-700 tw-mb-2 tw-text-sm">Jenis & Jumlah Dokumen</div>
                  <div class="tw-border tw-rounded-lg tw-p-3 tw-grid tw-grid-cols-1 tw-gap-2">
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <q-checkbox v-model="form.chk_jenis_1" label="Asli" />
                      <q-input v-model.number="form.txt_jenis_1" type="number" dense outlined style="width:80px"
                        :readonly="!form.chk_jenis_1" :class="!form.chk_jenis_1 ? 'tw-bg-slate-50' : ''" />
                    </div>
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <q-checkbox v-model="form.chk_jenis_2" label="Copy" />
                      <q-input v-model.number="form.txt_jenis_2" type="number" dense outlined style="width:80px"
                        :readonly="!form.chk_jenis_2" :class="!form.chk_jenis_2 ? 'tw-bg-slate-50' : ''" />
                    </div>
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <q-checkbox v-model="form.chk_jenis_3" label="PDF/Elektronik" />
                      <q-input v-model.number="form.txt_jenis_3" type="number" dense outlined style="width:80px"
                        :readonly="!form.chk_jenis_3" :class="!form.chk_jenis_3 ? 'tw-bg-slate-50' : ''" />
                    </div>
                  </div>
                </div>

                <q-input v-model="form.docdate" outlined label="Tanggal Dokumen *" type="date" class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
                </q-input>

                <q-input v-if="form.jenisfile === 'renewable'" v-model="form.duedate" outlined
                  label="Tanggal Kadaluarsa" type="date" class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="event_busy" color="orange-6" /></template>
                </q-input>

                <div>
                  <div class="tw-font-semibold tw-text-slate-700 tw-mb-2 tw-text-sm">Tanggal Penyerahan Dokumen</div>
                  <div class="tw-grid tw-grid-cols-2 tw-gap-2">
                    <q-input v-model="form.handdate" outlined label="Tanggal" type="date" class="tw-rounded-lg" />
                    <q-input v-model="form.handtime" outlined label="Jam" type="time" class="tw-rounded-lg" />
                  </div>
                </div>

                <q-select v-model="form.security" outlined label="Kategori Keamanan *"
                  :options="securityOptions" emit-value map-options class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
                </q-select>

                <q-select v-model="form.lokasiarsip" outlined label="Lokasi Penyimpanan *"
                  :options="lokasiArsipOptions" option-label="lokasi_arsip_name" option-value="lokasi_arsip_id"
                  emit-value map-options class="tw-rounded-lg" @update:model-value="loadArsiparis">
                  <template v-slot:prepend><q-icon name="location_on" color="blue-6" /></template>
                </q-select>

                <q-select v-model="form.arsiparis_id" outlined label="Arsiparis Lokasi *"
                  :options="arsiparisOptions" option-label="account_name" option-value="arsiparis_emp_id"
                  emit-value map-options class="tw-rounded-lg" @update:model-value="onArsiparisChange">
                  <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                </q-select>

                <q-input :model-value="emailArsiparis" outlined label="Email Arsiparis Lokasi" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="email" color="blue-6" /></template>
                </q-input>

              </div>
            </div>

          </div>
        </q-card-section>

        <!-- Dialog Data Pendukung -->
        <q-dialog v-model="showPendukungDialog" persistent>
          <q-card style="min-width:420px;max-width:520px">
            <q-card-section :class="`bg-${domain()} text-white`">
              <div class="text-h6 tw-flex tw-items-center tw-gap-2">
                <q-icon name="attach_file" />Tambah Data Pendukung
              </div>
            </q-card-section>
            <q-card-section class="tw-space-y-3 tw-pt-4">
              <q-input v-model="formPendukung.plkp_nama_dokumen" outlined dense label="Nama Dokumen" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
              </q-input>
              <q-input v-model="formPendukung.plkp_no_dokumen" outlined dense label="Nomor Dokumen" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="tag" color="blue-6" /></template>
              </q-input>
              <q-input v-model="formPendukung.plkp_tanggal_dokumen" outlined dense label="Tanggal Dokumen" type="date" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
              </q-input>
              <q-select v-model="formPendukung.plkp_status_pembaharuan" outlined dense label="Status Pembaharuan"
                :options="[{label:'Renewable',value:'renewable'},{label:'Non Renewable',value:'non-renewable'}]"
                emit-value map-options class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="autorenew" color="blue-6" /></template>
              </q-select>
              <q-input v-if="formPendukung.plkp_status_pembaharuan === 'renewable'"
                v-model="formPendukung.plkp_tanggal_daluwarsa" outlined dense label="Tanggal Daluwarsa" type="date" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="event_busy" color="orange-6" /></template>
              </q-input>
              <q-select v-model="formPendukung.plkp_notif_reminder" outlined dense label="Notifikasi Reminder"
                :options="[{label:'Yes',value:'yes'},{label:'No',value:'no'}]"
                emit-value map-options class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="notifications" color="blue-6" /></template>
              </q-select>
              <div>
                <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-1">Upload File PDF</div>
                <q-file v-model="formPendukung.plkp_file" outlined dense accept=".pdf" label="Pilih File PDF" class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="attach_file" color="blue-6" /></template>
                </q-file>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right" class="tw-p-3">
              <q-btn flat label="Batal" color="grey-6" v-close-popup />
              <q-btn unelevated label="Simpan" color="blue-6" icon="save" @click="simpanPendukung" :loading="savingPendukung" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog Detail Pendukung -->
        <q-dialog v-model="showPendukungDetail">
          <q-card style="min-width:400px;max-width:500px">
            <q-card-section :class="`bg-${domain()} text-white`">
              <div class="text-h6 tw-flex tw-items-center tw-gap-2">
                <q-icon name="attach_file" />Data Pendukung
              </div>
            </q-card-section>
            <q-card-section class="tw-space-y-3 tw-pt-4" v-if="selectedPendukung">
              <q-input :model-value="selectedPendukung.cdet_doc_name" outlined dense label="Nama Dokumen" readonly class="tw-bg-slate-50 tw-rounded-lg" />
              <q-input :model-value="selectedPendukung.cdet_doc_no" outlined dense label="Nomor Dokumen" readonly class="tw-bg-slate-50 tw-rounded-lg" />
              <q-input :model-value="selectedPendukung.cdet_doc_date ? String(selectedPendukung.cdet_doc_date).split('T')[0] : ''"
                outlined dense label="Tanggal Dokumen" type="date" readonly class="tw-bg-slate-50 tw-rounded-lg" />
              <q-input :model-value="selectedPendukung.cdet_doc_type" outlined dense label="Status Pembaharuan" readonly class="tw-bg-slate-50 tw-rounded-lg" />
              <q-input :model-value="selectedPendukung.cdet_reminder" outlined dense label="Notifikasi Reminder" readonly class="tw-bg-slate-50 tw-rounded-lg" />
              <div v-if="selectedPendukung.cdet_file">
                <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-1">File</div>
                <a :href="ftpUrl(selectedPendukung.cdet_file)" target="_blank" class="tw-text-blue-600 tw-underline tw-text-sm">
                  {{ selectedPendukung.cdet_file }}
                </a>
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
          <q-btn label="Kembali" color="grey-6" push icon="arrow_back" @click="router.push('/dms/document/recap')" />
          <q-btn label="Kirim" color="orange-6" push icon="send" @click="submit" :loading="saving" />
        </q-card-actions>
      </template>

      <div v-else-if="!loading" class="tw-text-center tw-py-12 tw-text-gray-400">
        <q-icon name="error_outline" size="48px" />
        <div class="tw-mt-2">Token tidak valid atau dokumen tidak ditemukan</div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const route = useRoute();
const router = useRouter();
const { success, error } = useNotify();

const loading = ref(true);
const saving = ref(false);
const docData = ref(null);
const pendukung = ref([]);
const token = route.query.token;

const subKategoriOptions = ref([]);
const workLocationOptions = ref([]);
const lokasiArsipOptions = ref([]);
const arsiparisOptions = ref([]);
const emailArsiparis = ref('');

// Validasi nomor dokumen
const docStatus = ref(null);
const docInfo = ref(null);
let docCheckTimer = null;

const securityOptions = computed(() => [
  { label: 'Non Restricted', value: 'non-restricted' },
  { label: 'Confidential', value: 'confidential' },
  { label: 'Restricted', value: 'restricted' },
]);

const form = reactive({
  namafile: '', content_doc: '', description: '', content_kat: '', content_kat_sub: '',
  worklocation: '', jenisfile: 'non-renewable', duedate: '', content_reminder: 'yes',
  security: '', lokasiarsip: '', arsiparis_id: '', docdate: '', handdate: '', handtime: '',
  kondisi_dok: 'baik', keterangan: '', no_arsip: '',
  chk_jenis_1: false, txt_jenis_1: 0,
  chk_jenis_2: false, txt_jenis_2: 0,
  chk_jenis_3: false, txt_jenis_3: 0,
  filedoc: null,
});

// Data Pendukung
const showPendukungDialog = ref(false);
const showPendukungDetail = ref(false);
const selectedPendukung = ref(null);
const savingPendukung = ref(false);
const formPendukung = reactive({
  plkp_nama_dokumen: '', plkp_no_dokumen: '', plkp_tanggal_dokumen: '',
  plkp_status_pembaharuan: 'non-renewable', plkp_tanggal_daluwarsa: '',
  plkp_notif_reminder: 'yes', plkp_file: null,
});

const ftpUrl = (filename) => {
  if (!filename) return '#';
  const base = import.meta.env.VITE_FTP || '';
  const dir = import.meta.env.VITE_FTP_DIR || 'dmslegal/dev';
  return `${base}${dir}/content/${filename}`;
};

const openPendukungDetail = (item) => {
  selectedPendukung.value = item;
  showPendukungDetail.value = true;
};

const openPendukung = () => {
  Object.assign(formPendukung, {
    plkp_nama_dokumen: '', plkp_no_dokumen: '', plkp_tanggal_dokumen: '',
    plkp_status_pembaharuan: 'non-renewable', plkp_tanggal_daluwarsa: '',
    plkp_notif_reminder: 'yes', plkp_file: null,
  });
  showPendukungDialog.value = true;
};

const simpanPendukung = async () => {
  if (!docData.value?.content_id) return;
  savingPendukung.value = true;
  try {
    const fd = new FormData();
    fd.append('plkp_type', 'tambah');
    fd.append('content_id', docData.value.content_id);
    fd.append('plkp_nama_dokumen', formPendukung.plkp_nama_dokumen || '');
    fd.append('plkp_no_dokumen', formPendukung.plkp_no_dokumen || '');
    fd.append('plkp_tanggal_dokumen', formPendukung.plkp_tanggal_dokumen || '');
    fd.append('plkp_status_pembaharuan', formPendukung.plkp_status_pembaharuan || '');
    fd.append('plkp_tanggal_daluwarsa', formPendukung.plkp_tanggal_daluwarsa || '');
    fd.append('plkp_notif_reminder', formPendukung.plkp_notif_reminder || '');
    if (formPendukung.plkp_file) fd.append('plkp_file_pendukung', formPendukung.plkp_file);
    const res = await axios.post(`${import.meta.env.VITE_API}dms/document/content-det`, fd);
    if (res.data?.data) {
      pendukung.value = res.data.data;
    }
    showPendukungDialog.value = false;
    success('Data pendukung berhasil ditambahkan');
  } catch (e) {
    error(e.response?.data?.message || 'Gagal menyimpan data pendukung');
  } finally {
    savingPendukung.value = false;
  }
};

const loadArsiparis = async (lokasi_id) => {
  arsiparisOptions.value = [];
  emailArsiparis.value = '';
  form.arsiparis_id = '';
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/arsiparis-lokasi`, { params: { lokasi_arsip_id: lokasi_id } });
    arsiparisOptions.value = res.data;
  } catch {}
};

const onArsiparisChange = (val) => {
  const found = arsiparisOptions.value.find(a => a.arsiparis_emp_id === val);
  emailArsiparis.value = found?.account_email || '';
};

watch(() => form.chk_jenis_1, (v) => { if (!v) form.txt_jenis_1 = 0; });
watch(() => form.chk_jenis_2, (v) => { if (!v) form.txt_jenis_2 = 0; });
watch(() => form.chk_jenis_3, (v) => { if (!v) form.txt_jenis_3 = 0; });

watch(() => form.content_doc, (val) => {
  clearTimeout(docCheckTimer);
  if (!val || !val.trim()) { docStatus.value = null; docInfo.value = null; return; }
  docStatus.value = 'checking';
  docCheckTimer = setTimeout(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}dms/document/check-doc`, { params: { doc_id: val.trim() } });
      docStatus.value = res.data.valid ? 'valid' : 'invalid';
      docInfo.value = res.data.doc || null;
    } catch { docStatus.value = null; }
  }, 500);
});

const submit = async () => {
  if (!form.namafile) return error('Nama dokumen wajib diisi');
  if (!form.content_kat) return error('Kategori dokumen wajib dipilih');
  if (!form.jenisfile) return error('Status pembaharuan wajib dipilih');
  if (!form.lokasiarsip) return error('Lokasi penyimpanan wajib dipilih');
  if (!form.security) return error('Kategori keamanan wajib dipilih');

  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('token', token);
    fd.append('namafile', form.namafile);
    fd.append('content_doc', form.content_doc || '');
    fd.append('description', form.description || '');
    fd.append('content_kat', form.content_kat || '');
    fd.append('jenisfile', form.jenisfile || '');
    fd.append('duedate', form.duedate || '');
    fd.append('content_reminder', form.content_reminder || '');
    fd.append('security', form.security || '');
    fd.append('lokasiarsip', form.lokasiarsip || '');
    fd.append('arsiparis_id', form.arsiparis_id || '');
    fd.append('docdate', form.docdate || '');
    fd.append('handdate', form.handdate || '');
    fd.append('handtime', form.handtime || '');
    fd.append('kondisi_dok', form.kondisi_dok || 'baik');
    fd.append('keterangan', form.keterangan || '');
    fd.append('no_arsip', form.no_arsip || '');
    fd.append('chk_jenis_1', form.chk_jenis_1 ? '1' : '');
    fd.append('txt_jenis_1', form.txt_jenis_1 || 0);
    fd.append('chk_jenis_2', form.chk_jenis_2 ? '1' : '');
    fd.append('txt_jenis_2', form.txt_jenis_2 || 0);
    fd.append('chk_jenis_3', form.chk_jenis_3 ? '1' : '');
    fd.append('txt_jenis_3', form.txt_jenis_3 || 0);
    if (form.filedoc) fd.append('filedoc', form.filedoc);

    await axios.post(`${import.meta.env.VITE_API}dms/document/approval/revisi`, fd);
    success('Revisi berhasil dikirim, menunggu approval atasan');
    router.push('/dms/document/recap');
  } catch (e) {
    error(e.response?.data?.message || 'Gagal mengirim revisi');
  } finally {
    saving.value = false;
  }
};

const loadData = async () => {
  if (!token) { loading.value = false; return; }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/approval/validate`, { params: { token } });
    const doc = res.data.data;
    docData.value = doc;
    pendukung.value = res.data.pendukung || [];

    // Pre-fill form dari data existing
    form.namafile = doc.content_name || '';
    form.content_doc = doc.content_doc || '';
    form.description = doc.content_desc || '';
    form.content_kat = doc.arsip_kat || '';
    form.content_kat_sub = doc.content_sub_arsip_id ? Number(doc.content_sub_arsip_id) || '' : '';
    form.worklocation = doc.content_work_id || '';
    form.jenisfile = doc.content_type || 'non-renewable';
    form.duedate = doc.content_duedate && !['', '1900-01-01'].includes(String(doc.content_duedate).split('T')[0])
      ? String(doc.content_duedate).split('T')[0] : '';
    form.content_reminder = doc.content_reminder || 'yes';
    form.security = doc.content_security || '';
    form.lokasiarsip = doc.lokasi_arsip_id ? Number(doc.lokasi_arsip_id) || '' : '';
    form.arsiparis_id = doc.arsiparis_id || '';
    form.docdate = doc.tgl_doc ? String(doc.tgl_doc).split('T')[0] : '';
    form.handdate = doc.tgl_doc_serah ? String(doc.tgl_doc_serah).split('T')[0] : '';
    form.handtime = doc.content_waktu_doc_serah ? (() => {
      const s = String(doc.content_waktu_doc_serah);
      if (s.includes('T')) return s.split('T')[1].substring(0, 5);
      if (s.includes(' ') && s.length > 8) return s.split(' ')[1].substring(0, 5);
      return s.substring(0, 5);
    })() : '';
    form.kondisi_dok = doc.kondisi_doc || 'baik';
    form.keterangan = doc.kondisi_doc_ket || '';
    form.no_arsip = doc.arsip_no || '';
    form.chk_jenis_1 = !!doc.jenis_asli && doc.jenis_asli_qty > 0;
    form.txt_jenis_1 = doc.jenis_asli_qty || 0;
    form.chk_jenis_2 = !!doc.jenis_copy && doc.jenis_copy_qty > 0;
    form.txt_jenis_2 = doc.jenis_copy_qty || 0;
    form.chk_jenis_3 = !!doc.jenis_elektronik && doc.jenis_elektronik_qty > 0;
    form.txt_jenis_3 = doc.jenis_elektronik_qty || 0;

    // Load arsiparis untuk lokasi yang sudah dipilih
    if (form.lokasiarsip) {
      const savedArsiparis = doc.content_arsiparis_lokasi_id;
      await loadArsiparis(form.lokasiarsip);
      // Restore arsiparis setelah load (loadArsiparis me-reset form.arsiparis_id)
      // arsiparis_emp_id di mst_arsiparis bisa string NIK, cocokkan dengan String()
      const found = arsiparisOptions.value.find(a => String(a.arsiparis_emp_id) === String(savedArsiparis));
      form.arsiparis_id = found ? found.arsiparis_emp_id : (savedArsiparis || '');
      emailArsiparis.value = found?.account_email || doc.arsiparis_email || '';
    }
  } catch {
    docData.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const [sub, wl, la] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}dms/document/sub-kategori`),
      axios.get(`${import.meta.env.VITE_API}dms/listWorkLocation`),
      axios.get(`${import.meta.env.VITE_API}dms/listLokasiArsip`),
    ]);
    subKategoriOptions.value = sub.data;
    workLocationOptions.value = wl.data;
    lokasiArsipOptions.value = la.data;
  } catch {}
  await loadData();
});
</script>

