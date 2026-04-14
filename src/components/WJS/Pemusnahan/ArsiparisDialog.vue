<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="width: 90vw; max-width: 1200px;" class="tw-rounded-xl tw-shadow-2xl">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-purple-500 tw-to-purple-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="inventory_2" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Proses Pemusnahan Arsip</div>
              <div class="tw-text-sm tw-opacity-90">{{ dt?.tr_no_tiket }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="closeDialog" />
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" style="max-height: 70vh; overflow-y: auto;">
        <!-- Ticket Header Info (matching PHP two-column layout) -->
        <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
          <div class="tw-text-sm tw-font-bold tw-text-blue-800 tw-mb-3">Informasi Pemusnahan</div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-x-6 tw-gap-y-3 tw-text-sm">
            <!-- Left Column -->
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Bisnis Unit</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.bu_name || '-' }}</div>
            </div>
            <!-- Right Column -->
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Prioritas Approval</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_prioritas_approval || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Kategori Dokumen</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_kategori_dokumen || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Lokasi Penyimpanan Arsip</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.lokasi_arsip_name || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">No. Pemusnahan</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_no_tiket || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Arsiparis Lokasi</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.arsiparis_name || dt?.arsiparis_nama || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Tanggal Pengajuan</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ formatDate(dt?.tr_tgl_pengajuan) }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Atasan Arsiparis Lokasi</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.arsiparis_atasan_name || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Target Waktu Pemusnahan</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_target_pemusnahan || '-' }}</div>
            </div>
            <div class="tw-row-span-2">
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Keterangan Pemusnahan Arsip</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_keterangan_pemusnahan || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Tanggal Pemusnahan</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ formatDate(dt?.tr_tgl_pemusnahan) }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Kategori Keamanan</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ formatSecurity(dt?.tr_kategori_keamanan) }}</div>
            </div>
          </div>
        </div>

        <!-- Document Table (matching PHP: Kode Arsip, Nama Arsip, No. Document, Status Berlaku, Document Owner, Bisnis Unit, Keterangan) -->
        <div class="tw-mb-6">
          <div class="tw-text-sm tw-font-bold tw-text-slate-700 tw-mb-3 tw-flex tw-items-center tw-gap-2">
            <q-icon name="folder_open" color="purple-6" size="20px" />
            Daftar Arsip ({{ archives.length }} dokumen)
          </div>
          <q-table
            :rows="archives"
            :columns="documentColumns"
            row-key="trdet_no_arsip"
            flat
            bordered
            dense
            :rows-per-page-options="[0]"
            hide-bottom
            class="tw-rounded-lg"
          />
        </div>

        <!-- Proses Pemusnahan Arsip Section -->
        <div class="tw-mb-4 tw-p-4 tw-bg-amber-50 tw-rounded-lg tw-border tw-border-amber-200">
          <div class="tw-flex tw-items-center tw-gap-2">
            <q-icon name="description" color="amber-700" size="24px" />
            <span class="tw-font-bold tw-text-amber-800">Proses Pemusnahan Arsip</span>
          </div>
        </div>

        <div class="tw-grid tw-grid-cols-3 tw-gap-4 tw-mb-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Arsiparis Lokasi</label>
            <q-input :model-value="dt?.arsiparis_name || dt?.arsiparis_nama" outlined readonly class="tw-rounded-lg tw-bg-slate-50">
              <template v-slot:prepend><q-icon name="person" color="purple-6" /></template>
            </q-input>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Pada Tanggal <span class="tw-text-red-500">*</span></label>
            <q-input v-model="tmpForm.tgl_pemusnahan" outlined type="date" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="event" color="purple-6" /></template>
            </q-input>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">No. Pemusnahan</label>
            <q-input :model-value="dt?.tr_no_tiket" outlined readonly class="tw-rounded-lg tw-bg-slate-50">
              <template v-slot:prepend><q-icon name="confirmation_number" color="purple-6" /></template>
            </q-input>
          </div>
        </div>

        <div class="tw-text-slate-700 tw-mb-4">Telah melakukan pemusnahan dokumen arsip</div>

        <!-- Saksi 1 & Saksi 2 inline -->
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Saksi 1 (NIK) <span class="tw-text-red-500">*</span></label>
            <q-input v-model="tmpForm.saksi1_nik" outlined placeholder="Masukkan NIK Saksi 1" class="tw-rounded-lg" @update:model-value="lookupSaksi1">
              <template v-slot:prepend><q-icon name="badge" color="purple-6" /></template>
            </q-input>
            <div v-if="saksi1Nama" class="tw-text-sm tw-text-green-600 tw-mt-1 tw-ml-1">✓ {{ saksi1Nama }}</div>
            <div v-else-if="saksi1Error" class="tw-text-sm tw-text-red-500 tw-mt-1 tw-ml-1">{{ saksi1Error }}</div>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Saksi 2 (NIK) <span class="tw-text-red-500">*</span></label>
            <q-input v-model="tmpForm.saksi2_nik" outlined placeholder="Masukkan NIK Saksi 2" class="tw-rounded-lg" @update:model-value="lookupSaksi2">
              <template v-slot:prepend><q-icon name="badge" color="purple-6" /></template>
            </q-input>
            <div v-if="saksi2Nama" class="tw-text-sm tw-text-green-600 tw-mt-1 tw-ml-1">✓ {{ saksi2Nama }}</div>
            <div v-else-if="saksi2Error" class="tw-text-sm tw-text-red-500 tw-mt-1 tw-ml-1">{{ saksi2Error }}</div>
          </div>
        </div>

        <q-btn unelevated color="amber-7" label="Generate Berita Acara Pemusnahan Arsip" icon="description" class="tw-font-semibold tw-px-6 tw-rounded-lg tw-mb-4" @click="generateBAST" :disable="!canGenerateBAST" />

        <!-- Scan BAST label + File Uploads (matching PHP layout) -->
        <div class="tw-text-slate-700 tw-font-semibold tw-mb-3">Scan Berita Acara Pemusnahan Arsip :</div>
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 1</label>
            <q-file v-model="tmpForm.upload1" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="5242880" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
            </q-file>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 2</label>
            <q-file v-model="tmpForm.upload2" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="5242880" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
            </q-file>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 3</label>
            <q-file v-model="tmpForm.upload3" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="5242880" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
            </q-file>
          </div>
          <div>
            <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 4</label>
            <q-file v-model="tmpForm.upload4" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="5242880" class="tw-rounded-lg">
              <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
            </q-file>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
        <q-btn unelevated color="grey-6" label="Batal" icon="close" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="closeDialog" :disable="submitting" />
        <q-btn unelevated color="purple-6" label="Kirim" icon="send" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="handleSubmit" :loading="submitting" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- BAST Preview Dialog -->
  <q-dialog v-model="showBastDialog" maximized>
    <q-card>
      <q-card-section class="tw-bg-purple-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="picture_as_pdf" size="32px" />
            <div class="text-h6 tw-font-bold">Preview BAST Pemusnahan</div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="showBastDialog = false" />
        </div>
      </q-card-section>
      <q-card-section class="tw-p-0" style="height: calc(100vh - 80px);">
        <iframe :src="bastIframeUrl" style="width: 100%; height: 100%; border: none;"></iframe>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';
import { empid } from '../../../utils';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ticketData: { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue', 'submitted']);
const { success, error: showError } = useNotify();
const apiUrl = import.meta.env.VITE_API;

const showDialog = ref(false);
const submitting = ref(false);
const archives = ref([]);
const enrichedTicket = reactive({});
const dt = computed(() => Object.keys(enrichedTicket).length > 0 ? enrichedTicket : props.ticketData);

const saksi1Nama = ref('');
const saksi1Error = ref('');
const saksi2Nama = ref('');
const saksi2Error = ref('');
let saksi1Timeout = null;
let saksi2Timeout = null;

const showBastDialog = ref(false);
const bastIframeUrl = ref('');

const tmpForm = reactive({
  tgl_pemusnahan: '',
  saksi1_nik: '',
  saksi2_nik: '',
  upload1: null,
  upload2: null,
  upload3: null,
  upload4: null
});

const canGenerateBAST = computed(() => {
  return tmpForm.tgl_pemusnahan && tmpForm.saksi1_nik && tmpForm.saksi2_nik &&
    saksi1Nama.value && saksi2Nama.value && !saksi1Error.value && !saksi2Error.value;
});

watch(() => props.modelValue, async (val) => {
  showDialog.value = val;
  if (val && props.ticketData) {
    resetForm();
    await loadArchives();
  }
});
watch(showDialog, (val) => { if (!val) emit('update:modelValue', false); });

const resetForm = () => {
  Object.assign(tmpForm, {
    tgl_pemusnahan: '', saksi1_nik: '', saksi2_nik: '',
    upload1: null, upload2: null, upload3: null, upload4: null
  });
  saksi1Nama.value = ''; saksi1Error.value = '';
  saksi2Nama.value = ''; saksi2Error.value = '';
  Object.keys(enrichedTicket).forEach(k => delete enrichedTicket[k]);
};

const loadArchives = async () => {
  try {
    const res = await axios.get(`${apiUrl}dms/pemusnahan/${props.ticketData.tr_arsip_id}`, {
      params: { empid: empid(), domain: localStorage.getItem('domain') },
      skipErrorInterceptor: true
    });
    archives.value = res.data.data.details || [];
    if (res.data.data.header) Object.assign(enrichedTicket, props.ticketData, res.data.data.header);
  } catch (error) {
    showError('Gagal memuat daftar arsip');
  }
};

const lookupSaksi1 = (nik) => {
  if (saksi1Timeout) clearTimeout(saksi1Timeout);
  if (!nik || nik.length < 3) { saksi1Nama.value = ''; saksi1Error.value = ''; return; }
  saksi1Timeout = setTimeout(async () => {
    try { const r = await axios.get(`${apiUrl}dms/employee/${nik}`, { skipErrorInterceptor: true }); saksi1Nama.value = r.data.data.nama; saksi1Error.value = ''; }
    catch (e) { saksi1Nama.value = ''; saksi1Error.value = 'Karyawan tidak ditemukan'; }
  }, 500);
};

const lookupSaksi2 = (nik) => {
  if (saksi2Timeout) clearTimeout(saksi2Timeout);
  if (!nik || nik.length < 3) { saksi2Nama.value = ''; saksi2Error.value = ''; return; }
  saksi2Timeout = setTimeout(async () => {
    try { const r = await axios.get(`${apiUrl}dms/employee/${nik}`, { skipErrorInterceptor: true }); saksi2Nama.value = r.data.data.nama; saksi2Error.value = ''; }
    catch (e) { saksi2Nama.value = ''; saksi2Error.value = 'Karyawan tidak ditemukan'; }
  }, 500);
};

const generateBAST = async () => {
  if (!canGenerateBAST.value) { showError('Lengkapi semua field BAST terlebih dahulu'); return; }
  try {
    const res = await axios.get(
      `${apiUrl}dms/pemusnahan/${props.ticketData.tr_arsip_id}/generate-bast-pdf`,
      { params: { saksi1_nik: tmpForm.saksi1_nik, saksi2_nik: tmpForm.saksi2_nik, tgl_pemusnahan: tmpForm.tgl_pemusnahan }, skipErrorInterceptor: true }
    );
    const filename = res.data.data.filename;
    bastIframeUrl.value = `${apiUrl}pdf/${filename}`;
    showBastDialog.value = true;
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal generate BAST PDF');
  }
};

const documentColumns = [
  { name: 'trdet_no_arsip', label: 'Kode Arsip', field: 'trdet_no_arsip', align: 'left' },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left' },
  { name: 'content_doc', label: 'No. Document', field: 'content_doc', align: 'left' },
  { name: 'status_berlaku', label: 'Status Berlaku Arsip', field: 'status_berlaku', align: 'left' },
  { name: 'direktorat_name', label: 'Document Owner', field: 'direktorat_name', align: 'left' },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left' },
  { name: 'trdet_keterangan', label: 'Keterangan', field: 'trdet_keterangan', align: 'left' }
];

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatSecurity = (val) => {
  if (!val) return '-';
  return val.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const handleSubmit = async () => {
  if (!tmpForm.tgl_pemusnahan) { showError('Tanggal Pemusnahan wajib diisi'); return; }
  if (!tmpForm.saksi1_nik || tmpForm.saksi1_nik.trim() === '') { showError('Saksi 1 wajib diisi'); return; }
  if (!tmpForm.saksi2_nik || tmpForm.saksi2_nik.trim() === '') { showError('Saksi 2 wajib diisi'); return; }

  try {
    submitting.value = true;
    const formData = new FormData();
    formData.append('creator', empid());
    formData.append('saksi1_nik', tmpForm.saksi1_nik.trim());
    formData.append('saksi2_nik', tmpForm.saksi2_nik.trim());
    formData.append('tgl_pemusnahan', tmpForm.tgl_pemusnahan);
    if (tmpForm.upload1) formData.append('upload1', tmpForm.upload1);
    if (tmpForm.upload2) formData.append('upload2', tmpForm.upload2);
    if (tmpForm.upload3) formData.append('upload3', tmpForm.upload3);
    if (tmpForm.upload4) formData.append('upload4', tmpForm.upload4);

    await axios.post(
      `${apiUrl}dms/pemusnahan/${props.ticketData.tr_arsip_id}/submit-arsiparis`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, skipErrorInterceptor: true }
    );

    submitting.value = false;
    success('Berita Acara Pemusnahan berhasil dikirim');
    emit('submitted');
    closeDialog();
  } catch (err) {
    submitting.value = false;
    showError(err?.response?.data?.message || err?.message || 'Gagal memproses pemusnahan arsip');
  }
};

const closeDialog = () => { showDialog.value = false; };
</script>

