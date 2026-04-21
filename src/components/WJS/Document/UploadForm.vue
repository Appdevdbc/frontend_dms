<template>
  <q-card class="tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
    <q-card-section :class="`bg-${domain()} tw-py-4`">
      <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-2">
        <q-icon name="upload_file" size="24px" />ADD CONTENT
      </div>
    </q-card-section>

    <q-card-section style="max-height:75vh" class="scroll tw-p-6">
      <div class="row q-col-gutter-md">

        <!-- Kolom Kiri -->
        <div class="col-12 col-md-6">
          <div class="tw-grid tw-grid-cols-1 tw-gap-4">

            <q-input v-model="form.namafile" outlined label="Nama Dokumen *" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
            </q-input>

            <q-input v-model="form.content_doc" outlined label="Nomor Dokumen" class="tw-rounded-lg"
              @update:model-value="v => form.content_doc = v ? v.replace(/\s/g, '') : ''">
              <template v-slot:prepend><q-icon name="tag" color="blue-6" /></template>
            </q-input>
            <div v-if="docStatus" class="tw-text-xs tw-mt-[-12px] tw-px-1">
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

            <q-input :model-value="folderName" outlined label="Folder" readonly class="tw-rounded-lg tw-bg-slate-50">
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

            <div>
              <div class="tw-font-semibold tw-text-slate-700 tw-mb-2 tw-text-sm">Upload File PDF *</div>
              <q-file v-model="form.filedoc" outlined accept=".pdf" label="Pilih File PDF" class="tw-rounded-lg">
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
                <div v-for="(item, idx) in form.kelengkapan" :key="idx"
                  class="tw-flex tw-items-center tw-justify-between tw-bg-slate-50 tw-rounded tw-px-3 tw-py-2 tw-text-sm">
                  <div class="tw-flex tw-items-center tw-gap-2 tw-truncate">
                    <q-icon name="description" color="blue-6" size="16px" />
                    <span class="tw-truncate">{{ item.plkp_nama_dokumen || item.plkp_file?.name || '(tanpa nama)' }}</span>
                  </div>
                  <div class="tw-flex tw-gap-1 tw-flex-shrink-0">
                    <q-btn flat round dense icon="edit" size="xs" color="blue-6" @click="editPendukung(idx)">
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="delete" size="xs" color="red-6" @click="hapusPendukung(idx)">
                      <q-tooltip>Hapus</q-tooltip>
                    </q-btn>
                  </div>
                </div>
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

            <!-- Info user (readonly) -->
            <q-input :model-value="userInfo.bu_name" outlined label="Bisnis Unit" readonly class="tw-rounded-lg tw-bg-slate-50">
              <template v-slot:prepend><q-icon name="domain" color="blue-6" /></template>
            </q-input>

            <q-input :model-value="userInfo.div_name" outlined label="Division" readonly class="tw-rounded-lg tw-bg-slate-50">
              <template v-slot:prepend><q-icon name="account_tree" color="blue-6" /></template>
            </q-input>

            <q-input :model-value="userInfo.dir_name" outlined label="Direktorat" readonly class="tw-rounded-lg tw-bg-slate-50">
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
            <q-icon name="attach_file" />
            {{ editPendukungIdx !== null ? 'Edit' : 'Tambah' }} Data Pendukung
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
            <div v-if="formPendukung._existing_file" class="tw-text-xs tw-text-slate-500 tw-mt-1">
              File saat ini: {{ formPendukung._existing_file }}
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="tw-p-3">
          <q-btn flat label="Batal" color="grey-6" v-close-popup />
          <q-btn unelevated label="Simpan" color="blue-6" icon="save" @click="simpanPendukung" :loading="savingPendukung" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-separator />
    <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
      <q-btn label="Kembali" color="grey-6" push icon="arrow_back" @click="emit('cancel')" />
      <q-btn label="Kirim" color="blue-6" push icon="send" @click="submit" :loading="saving" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import axios from "axios";
import { domain, empid } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({ folderId: [Number, String], folderSecurity: String, folderName: { type: String, default: '' } });
const emit = defineEmits(['done', 'cancel']);
const { success, error } = useNotify();

const saving = ref(false);
const subKategoriOptions = ref([]);
const workLocationOptions = ref([]);
const lokasiArsipOptions = ref([]);
const arsiparisOptions = ref([]);
const emailArsiparis = ref('');

// Validasi nomor dokumen
const docStatus = ref(null); // null | 'checking' | 'valid' | 'invalid'
const docInfo = ref(null);
let docCheckTimer = null;

// Info user dari localStorage
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

// Opsi keamanan berdasarkan folder_security (public = non-restricted default, private = wajib pilih)
const securityOptions = computed(() => {
  if (props.folderSecurity === 'public') {
    return [
      { label: 'Non Restricted', value: 'non-restricted' },
      { label: 'Confidential', value: 'confidential' },
      { label: 'Restricted', value: 'restricted' },
    ];
  }
  return [
    { label: 'Pilih Kategori Keamanan', value: '' },
    { label: 'Confidential', value: 'confidential' },
    { label: 'Restricted', value: 'restricted' },
    { label: 'Non Restricted', value: 'non-restricted' },
  ];
});

const form = reactive({
  namafile: '', content_doc: '', description: '', content_kat: '', content_kat_sub: '',
  worklocation: '', jenisfile: 'non-renewable', duedate: '', content_reminder: 'yes',
  security: props.folderSecurity === 'public' ? 'non-restricted' : '',
  lokasiarsip: '', arsiparis_id: '', docdate: '', handdate: '', handtime: '',
  kondisi_dok: 'baik', keterangan: '', no_arsip: '',
  chk_jenis_1: false, txt_jenis_1: 0,
  chk_jenis_2: false, txt_jenis_2: 0,
  chk_jenis_3: false, txt_jenis_3: 0,
  filedoc: null, kelengkapan: [],
});

// ─── Data Pendukung (Kelengkapan Dokumen) ────────────────────────────────────
const showPendukungDialog = ref(false);
const editPendukungIdx = ref(null);
const savingPendukung = ref(false);
const formPendukungDefault = () => ({
  plkp_nama_dokumen: '', plkp_no_dokumen: '', plkp_tanggal_dokumen: '',
  plkp_status_pembaharuan: 'non-renewable', plkp_tanggal_daluwarsa: '',
  plkp_notif_reminder: 'yes', plkp_file: null, _existing_file: '', _id: null,
});
const formPendukung = reactive(formPendukungDefault());

// content_id sementara untuk pendukung sebelum dokumen utama tersimpan
// Akan diisi setelah dokumen utama berhasil disimpan
const pendukungContentId = ref(null);

const openPendukung = (idx = null) => {
  editPendukungIdx.value = idx;
  if (idx !== null) {
    const item = form.kelengkapan[idx];
    Object.assign(formPendukung, { ...item, plkp_file: null });
  } else {
    Object.assign(formPendukung, formPendukungDefault());
  }
  showPendukungDialog.value = true;
};

const editPendukung = (idx) => openPendukung(idx);

const hapusPendukung = async (idx) => {
  const item = form.kelengkapan[idx];
  // Jika sudah tersimpan di DB (ada _id), hapus via API
  if (item._id && pendukungContentId.value) {
    try {
      const fd = new FormData();
      fd.append('plkp_type', 'hapus');
      fd.append('plkp_id', item._id);
      fd.append('content_id', pendukungContentId.value);
      await axios.post(`${import.meta.env.VITE_API}wjs/document/content-det`, fd);
    } catch {}
  }
  form.kelengkapan.splice(idx, 1);
};

const simpanPendukung = async () => {
  savingPendukung.value = true;
  try {
    const fd = new FormData();
    const isEdit = editPendukungIdx.value !== null && formPendukung._id;
    fd.append('plkp_type', isEdit ? 'edit' : 'tambah');
    if (isEdit) fd.append('plkp_id', formPendukung._id);
    if (pendukungContentId.value) fd.append('content_id', pendukungContentId.value);
    fd.append('plkp_nama_dokumen', formPendukung.plkp_nama_dokumen || '');
    fd.append('plkp_no_dokumen', formPendukung.plkp_no_dokumen || '');
    fd.append('plkp_tanggal_dokumen', formPendukung.plkp_tanggal_dokumen || '');
    fd.append('plkp_status_pembaharuan', formPendukung.plkp_status_pembaharuan || '');
    fd.append('plkp_tanggal_daluwarsa', formPendukung.plkp_tanggal_daluwarsa || '');
    fd.append('plkp_notif_reminder', formPendukung.plkp_notif_reminder || '');
    if (formPendukung.plkp_file) fd.append('plkp_file_pendukung', formPendukung.plkp_file);

    // Jika ada content_id (dokumen utama sudah ada), simpan ke DB langsung
    if (pendukungContentId.value) {
      const res = await axios.post(`${import.meta.env.VITE_API}wjs/document/content-det`, fd);
      // Refresh list dari response
      if (res.data?.data) {
        form.kelengkapan = res.data.data.map(d => ({
          _id: d.cdet_content_det_id,
          plkp_nama_dokumen: d.cdet_doc_name || d.cdet_nama || '',
          plkp_no_dokumen: d.cdet_doc_no || '',
          plkp_tanggal_dokumen: d.cdet_doc_date ? String(d.cdet_doc_date).split('T')[0] : '',
          plkp_status_pembaharuan: d.cdet_doc_type || 'non-renewable',
          plkp_tanggal_daluwarsa: d.cdet_doc_daluwarsa ? String(d.cdet_doc_daluwarsa).split('T')[0] : '',
          plkp_notif_reminder: d.cdet_reminder || 'yes',
          _existing_file: d.cdet_file || '',
          plkp_file: null,
        }));
      }
    } else {
      // Belum ada content_id — simpan lokal dulu, akan dikirim saat submit utama
      const item = { ...formPendukung };
      if (editPendukungIdx.value !== null) {
        if (!item.plkp_file) item.plkp_file = form.kelengkapan[editPendukungIdx.value]?.plkp_file || null;
        form.kelengkapan[editPendukungIdx.value] = item;
      } else {
        form.kelengkapan.push(item);
      }
    }
    showPendukungDialog.value = false;
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
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/document/arsiparis-lokasi`, { params: { lokasi_arsip_id: lokasi_id } });
    arsiparisOptions.value = res.data;
  } catch {}
};

const onArsiparisChange = (val) => {
  const found = arsiparisOptions.value.find(a => a.arsiparis_emp_id === val);
  emailArsiparis.value = found?.account_email || '';
};

// Auto-generate nomor arsip saat sub kategori atau lokasi kerja berubah
const fetchNoArsip = async () => {
  if (!form.content_kat_sub || !form.worklocation) {
    form.no_arsip = '';
    return;
  }
  try {
    const userData = JSON.parse(window.localStorage.getItem('data') || '{}');
    const div = userData?.data?.div || '';
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/document/no-arsip`, {
      params: {
        ctr_kateg_doc: form.content_kat_sub,
        bu: domain(),
        div,
        work_id: form.worklocation,
      }
    });
    form.no_arsip = res.data?.no_konter || '';
  } catch { form.no_arsip = ''; }
};

watch(() => form.content_kat_sub, fetchNoArsip);
watch(() => form.worklocation, fetchNoArsip);

watch(() => form.chk_jenis_1, (v) => { if (!v) form.txt_jenis_1 = 0; });
watch(() => form.chk_jenis_2, (v) => { if (!v) form.txt_jenis_2 = 0; });
watch(() => form.chk_jenis_3, (v) => { if (!v) form.txt_jenis_3 = 0; });

watch(() => form.content_doc, (val) => {
  clearTimeout(docCheckTimer);
  if (!val || !val.trim()) { docStatus.value = null; docInfo.value = null; return; }
  docStatus.value = 'checking';
  docCheckTimer = setTimeout(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}wjs/document/check-doc`, { params: { doc_id: val.trim() } });
      docStatus.value = res.data.valid ? 'valid' : 'invalid';
      docInfo.value = res.data.doc || null;
    } catch { docStatus.value = null; }
  }, 500);
});

const submit = async () => {
  if (!form.namafile) return error('Nama dokumen wajib diisi');
  if (!form.filedoc) return error('File PDF wajib diupload');
  if (!form.content_kat) return error('Kategori dokumen wajib dipilih');
  if (!form.jenisfile) return error('Status pembaharuan wajib dipilih');
  if (!form.lokasiarsip) return error('Lokasi penyimpanan wajib dipilih');
  if (!form.security) return error('Kategori keamanan wajib dipilih');

  saving.value = true;
  try {
    const fd = new FormData();
    const userData = JSON.parse(window.localStorage.getItem('data') || '{}');
    fd.append('creator', empid());
    fd.append('folder_id', props.folderId);
    fd.append('buid', domain());
    fd.append('divid', window.localStorage.getItem('div_id') || '');

    Object.entries(form).forEach(([k, v]) => {
      if (k === 'filedoc' && v) fd.append('filedoc', v);
      else if (k === 'kelengkapan') {
        // Kirim setiap file pendukung beserta metadata-nya
        form.kelengkapan.forEach((item, i) => {
          if (item.plkp_file) fd.append('kelengkapan_doc', item.plkp_file);
          fd.append(`kelengkapan_meta[${i}][nama]`, item.plkp_nama_dokumen || '');
          fd.append(`kelengkapan_meta[${i}][no_dok]`, item.plkp_no_dokumen || '');
          fd.append(`kelengkapan_meta[${i}][tgl_dok]`, item.plkp_tanggal_dokumen || '');
          fd.append(`kelengkapan_meta[${i}][status]`, item.plkp_status_pembaharuan || '');
          fd.append(`kelengkapan_meta[${i}][reminder]`, item.plkp_notif_reminder || '');
        });
      }
      else if (v !== null && v !== undefined && k !== 'filedoc' && k !== 'kelengkapan') fd.append(k, v);
    });

    const res = await axios.post(`${import.meta.env.VITE_API}wjs/document/files`, fd);
    const newContentId = res.data?.content_id;

    // Kirim pendukung yang masih lokal (belum tersimpan ke DB)
    if (newContentId) {
      pendukungContentId.value = newContentId;
      for (const item of form.kelengkapan) {
        if (!item._id) {
          const pfd = new FormData();
          pfd.append('plkp_type', 'tambah');
          pfd.append('content_id', newContentId);
          pfd.append('plkp_nama_dokumen', item.plkp_nama_dokumen || '');
          pfd.append('plkp_no_dokumen', item.plkp_no_dokumen || '');
          pfd.append('plkp_tanggal_dokumen', item.plkp_tanggal_dokumen || '');
          pfd.append('plkp_status_pembaharuan', item.plkp_status_pembaharuan || '');
          pfd.append('plkp_tanggal_daluwarsa', item.plkp_tanggal_daluwarsa || '');
          pfd.append('plkp_notif_reminder', item.plkp_notif_reminder || '');
          if (item.plkp_file) pfd.append('plkp_file_pendukung', item.plkp_file);
          await axios.post(`${import.meta.env.VITE_API}wjs/document/content-det`, pfd).catch(() => {});
        }
      }
    }

    success('Dokumen berhasil diupload, menunggu approval atasan');
    emit('done');
  } catch (e) {
    error(e.response?.data?.message || 'Gagal upload dokumen');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    const [sub, wl, la] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}wjs/document/sub-kategori`),
      axios.get(`${import.meta.env.VITE_API}wjs/listWorkLocation`),
      axios.get(`${import.meta.env.VITE_API}wjs/listLokasiArsip`),
    ]);
    subKategoriOptions.value = sub.data;
    workLocationOptions.value = wl.data;
    lokasiArsipOptions.value = la.data;
  } catch {}
});
</script>

