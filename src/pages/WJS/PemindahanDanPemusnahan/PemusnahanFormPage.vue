<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="add_circle" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Form Pemusnahan Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/pemusnahan' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Pemusnahan Arsip
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
            <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
              <template v-slot:avatar>
                <q-icon name="info" color="red" size="24px"/>
              </template>
              <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
            </q-banner>
          </div>

          <!-- Two Column Form Layout -->
          <div class="row q-col-gutter-md tw-mb-6">
            <!-- Left Column -->
            <div class="col-12 col-md-6">
              <q-input v-model="tmpForm.bu_name" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="business" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Bisnis Unit</span></template>
              </q-input>

              <q-select
                v-model="tmpForm.kategori_dokumen"
                :options="listKategoriDokumen"
                option-value="code_value"
                option-label="code_value"
                emit-value map-options use-input input-debounce="0"
                @filter="filterKategoriDokumen"
                outlined label-slot
                :disable="isFiltersLocked"
                class="tw-mb-4"
              >
                <template v-slot:prepend><q-icon name="category" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Dokumen</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">No results</q-item-section></q-item>
                </template>
              </q-select>

              <q-select
                v-model="tmpForm.kategori_keamanan"
                :options="listKategoriKeamanan"
                option-value="code_value"
                option-label="code_value"
                emit-value map-options use-input input-debounce="0"
                @filter="filterKategoriKeamanan"
                outlined label-slot
                :disable="isFiltersLocked"
                class="tw-mb-4"
              >
                <template v-slot:prepend><q-icon name="security" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Keamanan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">No results</q-item-section></q-item>
                </template>
              </q-select>

              <q-select
                v-model="tmpForm.lokasi_arsip"
                :options="listLokasiArsip"
                option-value="lokasi_arsip_id"
                option-label="lokasi_arsip_name"
                emit-value map-options outlined label-slot
                :disable="isFiltersLocked"
                class="tw-mb-4"
              >
                <template v-slot:prepend><q-icon name="location_on" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Lokasi Penyimpanan Arsip</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <q-select
                v-model="tmpForm.arsiparis"
                :options="listArsiparis"
                option-value="id"
                option-label="nama"
                emit-value map-options outlined label-slot
                :disable="isFiltersLocked"
                class="tw-mb-4"
              >
                <template v-slot:prepend><q-icon name="person" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Lokasi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <q-input v-model="tmpForm.arsiparis_atasan" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="supervisor_account" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Lokasi</span></template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <q-input model-value="Auto Generate" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="confirmation_number" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">No. Pemusnahan</span></template>
              </q-input>

              <q-input v-model="tmpForm.tgl_pengajuan" outlined type="date" readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Pengajuan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <q-input v-model="tmpForm.tgl_pemusnahan" outlined type="date" label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Pemusnahan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <q-input v-model="tmpForm.target_pemusnahan" outlined type="month" label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="calendar_month" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Target Waktu Pemusnahan</span></template>
              </q-input>

              <div class="tw-mb-4">
                <q-input v-model.number="tmpForm.pinjam_prioritas_approve" outlined type="number" min="1" label-slot>
                  <template v-slot:prepend><q-icon name="priority_high" color="blue-6"/></template>
                  <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Prioritas Approval</span></template>
                  <template v-slot:append>
                    <q-btn flat dense color="blue-6" label="View Detail" size="sm" @click="viewApprovalDetail"/>
                  </template>
                </q-input>
              </div>

              <q-input v-model="tmpForm.keterangan_pemusnahan" outlined type="textarea" rows="5" label-slot counter maxlength="500" class="tw-mb-4">
                <template v-slot:prepend><q-icon name="notes" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Keterangan Pemusnahan Arsip</span></template>
              </q-input>
            </div>
          </div>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Document Selection Section -->
          <div class="tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
              <q-icon name="folder_open" color="blue-6" size="24px"/>
              <div class="text-h6 tw-text-slate-700 tw-font-bold">Pilih Arsip untuk Dimusnahkan</div>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </div>

            <div class="row q-col-gutter-md tw-mb-4">
              <div class="col-12 col-md-6">
                <q-btn unelevated color="red-6" label="+ New" icon="add" @click="showAddModal = true" class="tw-font-semibold"/>
              </div>
              <div class="col-12 col-md-6">
                <div class="tw-flex tw-gap-2">
                  <q-file v-model="uploadFile" outlined dense label="Upload Excel" accept=".xls,.xlsx" style="flex: 1" class="tw-bg-white">
                    <template v-slot:prepend><q-icon name="upload_file"/></template>
                  </q-file>
                  <q-btn unelevated color="red-6" label="Upload" @click="handleUpload" :disable="!uploadFile"/>
                  <q-btn unelevated color="red-6" label="Download Template" icon="download" @click="downloadTemplate"/>
                </div>
              </div>
            </div>

            <q-table
              :rows="tmpForm.documents"
              :columns="documentColumns"
              row-key="arsip_no"
              flat bordered
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
            <q-btn label="Kembali" color="red-7" push icon="arrow_back" class="tw-px-6 tw-font-semibold" @click="$router.push('/dms/pemusnahan')"/>
            <q-btn label="Simpan" color="red-6" push icon="save" class="tw-px-6 tw-font-semibold" @click="validateAndSave" :loading="loading"/>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Modals -->
    <AddArchiveModal
      v-model="showAddModal"
      :kategori-dokumen="tmpForm.kategori_dokumen"
      :kategori-keamanan="tmpForm.kategori_keamanan"
      :lokasi-arsip="tmpForm.lokasi_arsip"
      @archive-added="onArchiveAdded"
    />
    <EditArchiveModal
      v-model="showEditModal"
      :archive="selectedArchive"
      @keterangan-updated="onKeteranganUpdated"
    />

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden">
        <q-card-section class="tw-bg-blue-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Konfirmasi Pemusnahan</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700">Apakah anda yakin untuk melanjutkan pemusnahan arsip ini?</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Tutup" color="grey-7" v-close-popup class="tw-px-4"/>
          <q-btn unelevated label="Konfirmasi" color="blue-6" @click="confirmSave" class="tw-px-4"/>
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

const router = useRouter();
const { success, error: showError } = useNotify();
const loading = ref(false);

const tmpForm = reactive({
  bulogin: domain(),
  bu_name: window.localStorage.getItem("bu_name") || "",
  div: window.localStorage.getItem("div_name") || "",
  nik: window.localStorage.getItem("nik") || "",
  tgl_pengajuan: null,
  target_pemusnahan: null,
  tgl_pemusnahan: null,
  kategori_keamanan: null,
  kategori_dokumen: null,
  lokasi_arsip: null,
  keterangan_pemusnahan: null,
  pinjam_prioritas_approve: 1,
  arsiparis: null,
  arsiparis_atasan: null,
  documents: []
});

const listLokasiArsip = ref([]);
const listKategoriKeamanan = ref([]);
const listKategoriKeamananFull = ref([]);
const listKategoriDokumen = ref([]);
const listKategoriDokumenFull = ref([]);
const listArsiparis = ref([]);
const uploadFile = ref(null);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showConfirmDialog = ref(false);
const selectedArchive = ref({});

const documentColumns = [
  { name: 'arsip_no', label: 'Kode Arsip', field: 'arsip_no', align: 'left' },
  { name: 'content_name', label: 'Nama Arsip', field: 'content_name', align: 'left' },
  { name: 'content_doc', label: 'No. Document', field: 'content_doc', align: 'left' },
  { name: 'status_berlaku', label: 'Status Berlaku Arsip', field: 'status_berlaku', align: 'center' },
  { name: 'direktorat_name', label: 'Document Owner', field: 'direktorat_name', align: 'left' },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
];

const isFiltersLocked = computed(() => tmpForm.documents.length > 0);

const schema = yup.object({
  tgl_pengajuan: yup.date().required("Tanggal pengajuan wajib diisi").nullable(),
  tgl_pemusnahan: yup.date().required("Tanggal pemusnahan wajib diisi").nullable(),
  kategori_keamanan: yup.string().required("Kategori keamanan wajib diisi").nullable(),
  kategori_dokumen: yup.string().required("Kategori dokumen wajib diisi").nullable(),
  lokasi_arsip: yup.number().required("Lokasi arsip wajib diisi").nullable(),
  arsiparis: yup.string().required("Arsiparis wajib diisi").nullable(),
  documents: yup.array().min(1, "Minimal 1 arsip harus dipilih").nullable()
});

const getLokasiArsip = async () => {
  if (!tmpForm.bulogin) return;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listLokasiArsip`, {
      params: { rowsPerPage: null, bu_id: tmpForm.bulogin },
      skipErrorInterceptor: true
    });
    listLokasiArsip.value = res.data;
  } catch (error) {
    console.error('getLokasiArsip error:', error);
  }
};

const getArsiparis = async () => {
  if (!tmpForm.lokasi_arsip) {
    listArsiparis.value = [];
    return;
  }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/arsiparis`, {
      params: { rowsPerPage: null, lokasi_arsip: tmpForm.lokasi_arsip },
      skipErrorInterceptor: true
    });
    listArsiparis.value = res.data;
  } catch (error) {
    console.error('getArsiparis error:', error);
  }
};

const getArsiparisAtasan = async () => {
  if (!tmpForm.arsiparis) {
    tmpForm.arsiparis_atasan = '';
    return;
  }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/arsiparis-atasan`, {
      params: { arsiparis: tmpForm.arsiparis },
      skipErrorInterceptor: true
    });
    tmpForm.arsiparis_atasan = res.data.data.nama;
  } catch (error) {
    console.error('getArsiparisAtasan error:', error);
  }
};

const getKategoriKeamanan = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}listCodeMaster`, {
      params: { field: 'dms_pemusnahan_dokumen', limit: 10 },
      skipErrorInterceptor: true
    });
    listKategoriKeamananFull.value = res.data;
    listKategoriKeamanan.value = res.data;
  } catch (error) {
    console.error('getKategoriKeamanan error:', error);
  }
};

const filterKategoriKeamanan = (val, update) => {
  update(() => {
    if (val === '') {
      listKategoriKeamanan.value = listKategoriKeamananFull.value;
    } else {
      const needle = val.toLowerCase();
      listKategoriKeamanan.value = listKategoriKeamananFull.value.filter(v => v.code_value.toLowerCase().indexOf(needle) > -1);
    }
  });
};

const getKategoriDokumen = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}listCodeMaster`, {
      params: { field: 'dms_kategori_dokumen', limit: 10 },
      skipErrorInterceptor: true
    });
    listKategoriDokumenFull.value = res.data;
    listKategoriDokumen.value = res.data;
  } catch (error) {
    console.error('getKategoriDokumen error:', error);
  }
};

const filterKategoriDokumen = (val, update) => {
  update(() => {
    if (val === '') {
      listKategoriDokumen.value = listKategoriDokumenFull.value;
    } else {
      const needle = val.toLowerCase();
      listKategoriDokumen.value = listKategoriDokumenFull.value.filter(v => v.code_value.toLowerCase().indexOf(needle) > -1);
    }
  });
};

watch(() => tmpForm.lokasi_arsip, () => {
  tmpForm.arsiparis = null;
  tmpForm.arsiparis_atasan = '';
  getArsiparis();
});

watch(() => tmpForm.arsiparis, () => {
  getArsiparisAtasan();
});

watch(() => tmpForm.target_pemusnahan, () => {
  if (!tmpForm.target_pemusnahan || !tmpForm.tgl_pemusnahan) return;
  const targetYearMonth = tmpForm.target_pemusnahan;
  const dateYearMonth = tmpForm.tgl_pemusnahan.substring(0, 7);
  if (targetYearMonth !== dateYearMonth) {
    showError('Bulan - tahun target pemusnahan harus sama dengan bulan - tahun tgl. pemusnahan');
    tmpForm.target_pemusnahan = null;
  }
});

watch(() => tmpForm.tgl_pemusnahan, () => {
  if (!tmpForm.tgl_pemusnahan) return;
  const today = new Date().toISOString().split('T')[0];
  if (tmpForm.tgl_pemusnahan < today) {
    showError('Tanggal pemusnahan tidak boleh sebelum hari ini');
    tmpForm.tgl_pemusnahan = today;
  }
  if (tmpForm.target_pemusnahan) {
    const targetYearMonth = tmpForm.target_pemusnahan;
    const dateYearMonth = tmpForm.tgl_pemusnahan.substring(0, 7);
    if (targetYearMonth !== dateYearMonth) {
      showError('Bulan - tahun target pemusnahan harus sama dengan bulan - tahun tgl. pemusnahan');
      tmpForm.tgl_pemusnahan = today;
    }
  }
});

const viewApprovalDetail = () => {
  const url = `/app/mapproval/viewapproval?bu_id=${tmpForm.bulogin}&app_prioritas=${tmpForm.pinjam_prioritas_approve}&app_jns_trans=6`;
  window.open(url, 'blank', 'width=800,height=600');
};

const onArchiveAdded = (archive) => {
  const exists = tmpForm.documents.find(doc => doc.arsip_no === archive.arsip_no);
  if (exists) {
    showError('Nomer dokumen sudah diinputkan!');
    return;
  }
  tmpForm.documents.push(archive);
};

const editDocument = (doc) => {
  selectedArchive.value = doc;
  showEditModal.value = true;
};

const deleteDocument = (doc) => {
  const index = tmpForm.documents.findIndex(d => d.arsip_no === doc.arsip_no);
  if (index > -1) tmpForm.documents.splice(index, 1);
};

const onKeteranganUpdated = ({ arsip_no, keterangan }) => {
  const doc = tmpForm.documents.find(d => d.arsip_no === arsip_no);
  if (doc) doc.keterangan = keterangan;
};

const handleUpload = async () => {
  if (!uploadFile.value) {
    showError('Pilih file Excel terlebih dahulu');
    return;
  }
  if (!tmpForm.kategori_dokumen || !tmpForm.kategori_keamanan || !tmpForm.lokasi_arsip) {
    showError('Pilih kategori dokumen, keamanan, dan lokasi arsip terlebih dahulu');
    return;
  }
  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('file', uploadFile.value);
    formData.append('kategori_dokumen', tmpForm.kategori_dokumen);
    formData.append('kategori_keamanan', tmpForm.kategori_keamanan);
    formData.append('lokasi_arsip', tmpForm.lokasi_arsip);
    formData.append('content_owner', window.localStorage.getItem('id') || '');

    const res = await axios.post(`${import.meta.env.VITE_API}dms/pemusnahan/upload-details`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipErrorInterceptor: true
    });
    loading.value = false;

    if (res.data.errors && res.data.errors.length > 0) {
      res.data.errors.forEach(err => showError(err));
    }
    if (res.data.data && res.data.data.length > 0) {
      res.data.data.forEach(archive => {
        const exists = tmpForm.documents.find(doc => doc.arsip_no === archive.arsip_no);
        if (!exists) tmpForm.documents.push(archive);
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
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pemusnahan/template`, {
      responseType: 'blob',
      skipErrorInterceptor: true
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_pemusnahan.xlsx');
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
    tgl_pengajuan: tmpForm.tgl_pengajuan,
    tgl_pemusnahan: tmpForm.tgl_pemusnahan,
    kategori_keamanan: tmpForm.kategori_keamanan,
    kategori_dokumen: tmpForm.kategori_dokumen,
    lokasi_arsip: tmpForm.lokasi_arsip,
    arsiparis: tmpForm.arsiparis,
    documents: tmpForm.documents
  };
  schema.validate(validate, { abortEarly: false })
    .then(() => { showConfirmDialog.value = true; })
    .catch(err => { err.inner.forEach(e => showError(e.message)); });
};

const confirmSave = () => {
  showConfirmDialog.value = false;
  savePemusnahan();
};

const savePemusnahan = async () => {
  try {
    loading.value = true;
    await axios.post(`${import.meta.env.VITE_API}dms/pemusnahan`, {
      ...tmpForm,
      creator: empid()
    }, { skipErrorInterceptor: true });
    loading.value = false;
    success('Tiket pemusnahan berhasil dibuat');
    router.push('/dms/pemusnahan');
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal menyimpan data');
  }
};

onMounted(() => {
  const today = new Date().toISOString().split('T')[0];
  tmpForm.tgl_pengajuan = today;
  tmpForm.tgl_pemusnahan = today;
  getLokasiArsip();
  getKategoriKeamanan();
  getKategoriDokumen();
});
</script>


