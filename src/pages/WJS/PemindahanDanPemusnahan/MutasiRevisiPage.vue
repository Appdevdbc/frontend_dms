<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="edit" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Revisi Mutasi Arsip</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/dms/mutasi' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Mutasi Arsip
              </router-link>
              <q-icon name="chevron_right" size="14px"/>
              <span>Revisi</span>
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
                <template v-slot:prepend><q-icon name="security" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Keamanan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <q-input v-model="tmpForm.tr_no_tiket" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="confirmation_number" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">No. Mutasi</span></template>
              </q-input>

              <q-input v-model="tmpForm.tgl_pengajuan" outlined type="date" readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Pengajuan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <q-input v-model="tmpForm.tgl_mutasi" outlined type="date" label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Rencana Tanggal Mutasi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <q-input v-model="tmpForm.keterangan_pemusnahan" outlined type="textarea" rows="5" label-slot counter maxlength="500" class="tw-mb-4">
                <template v-slot:prepend><q-icon name="notes" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Keterangan Mutasi Arsip</span>
                </template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <div class="tw-mb-4">
                <q-input v-model.number="tmpForm.prioritas_approve" outlined type="number" min="1" label-slot>
                  <template v-slot:prepend><q-icon name="priority_high" color="blue-6"/></template>
                  <template v-slot:label>
                    <span class="tw-font-semibold tw-text-slate-700">Prioritas Approval</span>
                    <span class="tw-text-red-500 tw-font-bold">*</span>
                  </template>
                  <template v-slot:append>
                    <q-btn flat dense color="blue-6" label="View Detail" size="sm" @click="viewApprovalDetail"/>
                  </template>
                </q-input>
              </div>

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
                <template v-slot:prepend><q-icon name="person" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Lokasi (Lama)</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <q-input v-model="tmpForm.arsiparis_lama_atasan" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="supervisor_account" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Lokasi (Lama)</span></template>
              </q-input>

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
                <template v-slot:prepend><q-icon name="person" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Arsiparis Lokasi (Baru)</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <q-input v-model="tmpForm.arsiparis_baru_atasan" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="supervisor_account" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Atasan Arsiparis Lokasi (Baru)</span></template>
              </q-input>

              <q-input v-model="tmpForm.catatan_arsiparis_lama" outlined type="text" label-slot maxlength="500" class="tw-mb-4">
                <template v-slot:prepend><q-icon name="note" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Catatan Arsiparis Lokasi Lama</span></template>
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
            
            <div class="row q-col-gutter-md tw-mb-4">
              <div class="col-12 col-md-6">
                <q-btn unelevated color="blue-6" label="+ New" icon="add" @click="showAddModal = true" class="tw-font-semibold"/>
              </div>
            </div>

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
            <q-btn label="Kembali" color="red-7" push icon="arrow_back" class="tw-px-6 tw-font-semibold" @click="$router.push('/dms/mutasi')"/>
            <q-btn label="Simpan" color="blue-6" push icon="save" class="tw-px-6 tw-font-semibold" @click="validateAndSave" :loading="loading"/>
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

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card class="tw-rounded-2xl tw-overflow-hidden">
        <q-card-section class="tw-bg-blue-600 tw-text-white tw-py-4">
          <div class="text-h6 tw-font-bold">Konfirmasi Revisi</div>
        </q-card-section>
        <q-card-section class="tw-p-6">
          <p class="tw-text-slate-700">Apakah anda yakin untuk mengirim ulang mutasi arsip ini?</p>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn flat label="Tutup" color="grey-7" v-close-popup class="tw-px-4" />
          <q-btn unelevated label="Konfirmasi" color="blue-6" @click="confirmSave" class="tw-px-4" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import { decryptMessage, domain, empid } from "../../../utils";
import { useRouter, useRoute } from "vue-router";
import { useNotify } from "../../../composables/useNotify";
import * as yup from "yup";
import AddArchiveModal from "../../../components/WJS/Pemusnahan/AddArchiveModal.vue";
import EditArchiveModal from "../../../components/WJS/Pemusnahan/EditArchiveModal.vue";

const router = useRouter();
const route = useRoute();
const { success, error: showError } = useNotify();
const loading = ref(false);

const tmpForm = reactive({
  tr_arsip_id: null,
  tr_no_tiket: '',
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
  lokasi_arsip_baru: null,
  arsiparis_lama: null,
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
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', field: 'lokasi_arsip_name', align: 'left' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
];

const isFiltersLocked = computed(() => tmpForm.documents.length > 0);

const schema = yup.object({
  kategori_dokumen: yup.string().required("Kategori dokumen wajib diisi").nullable(),
  kategori_keamanan: yup.string().required("Kategori keamanan wajib diisi").nullable(),
  prioritas_approve: yup.number().required("Prioritas approval wajib diisi").min(1, "Prioritas approval minimal 1").nullable(),
  tgl_pengajuan: yup.date().required("Tanggal pengajuan wajib diisi").nullable(),
  tgl_mutasi: yup.date().required("Tanggal mutasi wajib diisi").nullable(),
  arsiparis_lama: yup.string().required("Arsiparis lokasi lama wajib diisi").nullable(),
  arsiparis_baru: yup.string().required("Arsiparis baru wajib diisi").nullable(),
  documents: yup.array().min(1, "Minimal 1 arsip harus dipilih").nullable()
});

const getTicketData = async () => {
  try {
    loading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/${route.params.id}`, {
      params: { empid: empid(), domain: domain() },
      skipErrorInterceptor: true
    });

    const header = res.data.data.header;
    const details = res.data.data.details;

    // Check access - only creator with status 2 (Revisi) can edit
    if (header.tr_status !== 2 || header.tr_user_id !== decryptMessage(empid())) {
      showError('Anda tidak berhak mengakses halaman ini');
      router.push('/dms/mutasi');
      return;
    }

    tmpForm.tr_arsip_id = header.tr_arsip_id;
    tmpForm.tr_no_tiket = header.tr_no_tiket;
    tmpForm.tgl_pengajuan = header.tr_tgl_pengajuan?.split('T')[0];
    tmpForm.tgl_mutasi = header.tr_tgl_mutasi?.split('T')[0];
    tmpForm.kategori_keamanan = header.tr_kategori_keamanan;
    tmpForm.kategori_dokumen = header.tr_kategori_dokumen;
    tmpForm.prioritas_approve = header.tr_mutasi_prioritas_approve;
    tmpForm.arsiparis_lama = header.tr_arsiparis_lama_id;
    tmpForm.arsiparis_baru = header.tr_arsiparis_baru_id;
    tmpForm.catatan_arsiparis_lama = header.tr_catatan_arsiparis_lama;
    tmpForm.keterangan_pemusnahan = header.tr_keterangan_pemusnahan;

    tmpForm.documents = details.map(d => ({
      arsip_no: d.trdet_no_arsip,
      content_name: d.content_name,
      content_doc: d.content_doc,
      status_berlaku: d.status_berlaku,
      direktorat_name: d.direktorat_name,
      bu_name: d.bu_name,
      lokasi_arsip_name: d.lokasi_arsip_name,
      keterangan: d.trdet_keterangan
    }));

    loading.value = false;
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || 'Gagal memuat data');
    router.push('/dms/mutasi');
  }
};

const getArsiparisLama = async () => {
  if (!tmpForm.bulogin) return;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/arsiparis`, {
      params: { rowsPerPage: null, bu_id: tmpForm.bulogin },
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
      params: { rowsPerPage: null, bu_id: tmpForm.bulogin },
      skipErrorInterceptor: true
    });
    listArsiparisBaru.value = res.data;
  } catch (error) {
    console.error('getArsiparisBaru error:', error);
  }
};

const getArsiparisAtasan = async (arsiparisId, field) => {
  if (!arsiparisId) { tmpForm[field] = ''; return; }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/mutasi/arsiparis-atasan`, {
      params: { arsiparis: arsiparisId },
      skipErrorInterceptor: true
    });
    tmpForm[field] = res.data.data.nama;
  } catch (error) {
    console.error('getArsiparisAtasan error:', error);
  }
};

watch(() => tmpForm.arsiparis_lama, (newVal) => {
  getArsiparisAtasan(newVal, 'arsiparis_lama_atasan');
  if (newVal) {
    const arsiparis = listArsiparisLama.value.find(a => a.id === newVal);
    if (arsiparis) {
      tmpForm.lokasi_lama = arsiparis.arsiparis_lokasi_arsip_id || arsiparis.lokasi_arsip_id;
    }
  }
});

watch(() => tmpForm.arsiparis_baru, (newVal) => {
  getArsiparisAtasan(newVal, 'arsiparis_baru_atasan');
  if (newVal) {
    const arsiparis = listArsiparisBaru.value.find(a => a.id === newVal);
    if (arsiparis) {
      tmpForm.lokasi_arsip_baru = arsiparis.arsiparis_lokasi_arsip_id || arsiparis.lokasi_arsip_id;
    }
  }
});

watch(() => tmpForm.tgl_mutasi, () => {
  if (!tmpForm.tgl_mutasi) return;
  const today = new Date().toISOString().split('T')[0];
  if (tmpForm.tgl_mutasi < today) {
    showError('Tanggal mutasi tidak boleh sebelum hari ini');
    tmpForm.tgl_mutasi = today;
  }
});

const getKategoriDokumen = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}listCodeMaster`, {
      params: { field: 'dms_kategori_dokumen', limit: 10 },
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
      params: { field: 'dms_pemusnahan_dokumen', rowsPerPage: null },
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

const viewApprovalDetail = () => {
  const url = `/app/mapproval/viewapproval?bu_id=${tmpForm.bulogin}&app_prioritas=${tmpForm.prioritas_approve}&app_jns_trans=7`;
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

const validateAndSave = async () => {
  const validate = {
    kategori_dokumen: tmpForm.kategori_dokumen,
    kategori_keamanan: tmpForm.kategori_keamanan,
    prioritas_approve: tmpForm.prioritas_approve,
    tgl_pengajuan: tmpForm.tgl_pengajuan,
    tgl_mutasi: tmpForm.tgl_mutasi,
    arsiparis_lama: tmpForm.arsiparis_lama,
    arsiparis_baru: tmpForm.arsiparis_baru,
    documents: tmpForm.documents
  };

  schema.validate(validate, { abortEarly: false })
    .then(() => { showConfirmDialog.value = true; })
    .catch(err => { err.inner.forEach(e => showError(e.message)); });
};

const confirmSave = () => {
  showConfirmDialog.value = false;
  saveMutasi();
};

const saveMutasi = async () => {
  try {
    loading.value = true;
    await axios.put(`${import.meta.env.VITE_API}dms/mutasi/${route.params.id}/revise`, {
      ...tmpForm,
      creator: empid()
    }, {
      skipErrorInterceptor: true
    });
    loading.value = false;
    success('Revisi mutasi berhasil dikirim');
    router.push('/dms/mutasi');
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal menyimpan data');
  }
};

onMounted(async () => {
  getKategoriDokumen();
  getKategoriKeamanan();
  await getArsiparisLama();
  await getArsiparisBaru();
  await getTicketData();
});
</script>


