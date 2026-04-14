<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent maximized>
    <q-card class="tw-rounded-none">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon :name="isRevision ? 'edit' : 'add_circle'" size="28px" class="tw-text-white"/>
            <div>
              <div class="text-h6 tw-text-white tw-font-bold">{{ isRevision ? 'Revisi Pengaduan' : 'Buat Tiket Pengaduan' }}</div>
              <div class="tw-text-blue-100 tw-text-xs">Pengaduan Kehilangan / Kerusakan Dokumen</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="close"/>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div class="tw-max-w-5xl tw-mx-auto">
          <!-- Required fields banner -->
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
              <q-input model-value="Auto Generate" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="confirmation_number" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">No. Pengaduan</span></template>
              </q-input>

              <q-input v-model="tmpForm.tanggal_pengaduan" outlined type="date" label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Tanggal Pengaduan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <q-select v-model="tmpForm.no_dokumen" :options="docOptions" option-value="doc_id" option-label="doc_id"
                emit-value map-options outlined label-slot clearable use-input input-debounce="0"
                @filter="filterDoc" @update:model-value="onDocChange" class="tw-mb-4">
                <template v-slot:prepend><q-icon name="description" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">No. Dokumen</span></template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey">No results</q-item-section></q-item>
                </template>
              </q-select>

              <q-input v-if="!tmpForm.no_dokumen" v-model="tmpForm.no_dokumen_manual" outlined label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="edit_note" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Nomor Dokumen Baru (Manual)</span></template>
              </q-input>

              <q-input v-model="tmpForm.nama_dokumen" outlined :readonly="!!tmpForm.no_dokumen" label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="article" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Nama Dokumen</span></template>
              </q-input>

              <q-input v-model="tmpForm.tanggal_dokumen" outlined type="date" readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="event" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Tanggal Dokumen</span></template>
              </q-input>

              <q-input v-model="tmpForm.kode_arsip" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="qr_code" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Kode Arsip</span></template>
              </q-input>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <div class="tw-mb-4">
                <q-input v-model.number="tmpForm.prioritas" outlined type="number" min="1" label-slot>
                  <template v-slot:prepend><q-icon name="priority_high" color="blue-6"/></template>
                  <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Prioritas Approval</span></template>
                  <template v-slot:append>
                    <q-btn flat dense color="blue-6" label="View Detail" size="sm" @click="viewApprovalDetail"/>
                  </template>
                </q-input>
              </div>

              <q-input v-model="tmpForm.judul_pengaduan" outlined label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="title" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Judul Pengaduan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>

              <q-input v-model="tmpForm.bisnis_unit" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="business" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Bisnis Unit</span></template>
              </q-input>

              <q-input v-model="tmpForm.lokasi_penyimpanan" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="location_on" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Lokasi Penyimpanan</span></template>
              </q-input>

              <q-input v-model="tmpForm.kode_lemari" outlined readonly label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="inventory_2" color="blue-6"/></template>
                <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Kode Lemari</span></template>
              </q-input>

              <q-select v-model="tmpForm.kategori_pengaduan" :options="['Hilang', 'Rusak']" outlined label-slot class="tw-mb-4">
                <template v-slot:prepend><q-icon name="report_problem" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Kategori Pengaduan</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>

              <q-file v-model="tmpForm.filedoc" outlined label-slot accept=".pdf" class="tw-mb-4">
                <template v-slot:prepend><q-icon name="attach_file" color="blue-6"/></template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Upload Lampiran</span>
                </template>
              </q-file>
            </div>
          </div>

          <!-- Uraian (full width) -->
          <q-input v-model="tmpForm.uraian_pengaduan" outlined type="textarea" rows="4" label-slot counter maxlength="500" class="tw-mb-6">
            <template v-slot:prepend><q-icon name="notes" color="blue-6"/></template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Uraian Pengaduan</span>
              <span class="tw-text-red-500 tw-font-bold">*</span>
            </template>
          </q-input>

          <q-separator class="tw-my-6 tw-bg-slate-200"/>

          <!-- Action Buttons -->
          <div class="tw-flex tw-gap-3 tw-justify-end">
            <q-btn label="Batal" color="red-7" push icon="close" class="tw-px-6 tw-font-semibold" @click="close"/>
            <q-btn :label="isRevision ? 'Kirim Revisi' : 'Kirim'" color="blue-6" push icon="send"
              class="tw-px-6 tw-font-semibold" @click="validate" :loading="saving"/>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import axios from "axios";
import { domain, empid } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import * as yup from "yup";

const props = defineProps({
  modelValue: Boolean,
  revisionData: { type: Object, default: null }
});
const emit = defineEmits(["update:modelValue", "saved"]);

const { success, error: showError } = useNotify();
const saving = ref(false);
const docOptions = ref([]);
const allDocs = ref([]);
const isRevision = ref(false);

const tmpForm = reactive({
  no_pengaduan: '',
  adu_id: null,
  tanggal_pengaduan: new Date().toISOString().split('T')[0],
  no_dokumen: null,
  no_dokumen_manual: '',
  nama_dokumen: '',
  tanggal_dokumen: '',
  kode_arsip: '',
  prioritas: 1,
  judul_pengaduan: '',
  bisnis_unit: '',
  lokasi_penyimpanan: '',
  kode_lemari: '',
  kategori_pengaduan: null,
  uraian_pengaduan: '',
  filedoc: null
});

const schema = yup.object({
  judul_pengaduan: yup.string().required("Judul pengaduan wajib diisi"),
  kategori_pengaduan: yup.string().required("Kategori pengaduan wajib diisi").nullable(),
  uraian_pengaduan: yup.string().required("Uraian pengaduan wajib diisi")
});

watch(() => props.modelValue, async (val) => {
  if (val) {
    await loadDocList();
    if (props.revisionData) {
      isRevision.value = true;
      const d = props.revisionData;
      tmpForm.no_pengaduan = d.tr_no_adu;
      tmpForm.adu_id = d.tr_adu_id;
      tmpForm.tanggal_pengaduan = d.tr_tgl_adu ? d.tr_tgl_adu.split('T')[0] : '';
      tmpForm.no_dokumen = d.tr_adu_no_doc;
      tmpForm.judul_pengaduan = d.tr_adu_judul;
      tmpForm.kategori_pengaduan = d.tr_adu_kategori;
      tmpForm.uraian_pengaduan = d.tr_adu_uraian_user;
      tmpForm.prioritas = d.tr_adu_prioritas_approve;
      tmpForm.nama_dokumen = d.content_judul || '';
      tmpForm.kode_arsip = d.arsip_no || '';
      tmpForm.bisnis_unit = d.bu_name || '';
      tmpForm.lokasi_penyimpanan = d.lokasi_arsip_name || '';
      tmpForm.kode_lemari = d.content_kode_lemari || '';
    } else {
      isRevision.value = false;
      resetForm();
    }
  }
});

const loadDocList = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/doc-list`);
    allDocs.value = res.data;
    docOptions.value = res.data;
  } catch (e) { /* ignore */ }
};

const filterDoc = (val, update) => {
  update(() => {
    if (!val) { docOptions.value = allDocs.value; return; }
    const needle = val.toLowerCase();
    docOptions.value = allDocs.value.filter(v => v.doc_id.toLowerCase().includes(needle));
  });
};

const onDocChange = async (val) => {
  if (!val) {
    tmpForm.nama_dokumen = ''; tmpForm.tanggal_dokumen = ''; tmpForm.kode_arsip = '';
    tmpForm.bisnis_unit = ''; tmpForm.lokasi_penyimpanan = ''; tmpForm.kode_lemari = '';
    return;
  }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pengaduan/doc-detail`, { params: { doc_id: val } });
    const d = res.data.data?.[0];
    if (d) {
      tmpForm.nama_dokumen = d.content_name || d.doc_judul || '';
      tmpForm.tanggal_dokumen = d.content_entrydate ? d.content_entrydate.split('T')[0] : '';
      tmpForm.kode_arsip = d.arsip_no || '';
      tmpForm.bisnis_unit = d.bu_name || '';
      tmpForm.lokasi_penyimpanan = d.lokasi_arsip_name || '';
      tmpForm.kode_lemari = d.content_kode_lemari || '';
    }
  } catch (e) { /* ignore */ }
};

const viewApprovalDetail = () => {
  const buLogin = domain();
  const url = `/app/mapproval/viewapproval?bu_id=${buLogin}&app_prioritas=${tmpForm.prioritas}&app_jns_trans=8`;
  window.open(url, 'blank', 'width=800,height=600');
};

const validate = async () => {
  const v = {
    judul_pengaduan: tmpForm.judul_pengaduan,
    kategori_pengaduan: tmpForm.kategori_pengaduan,
    uraian_pengaduan: tmpForm.uraian_pengaduan
  };
  schema.validate(v, { abortEarly: false })
    .then(() => saveData())
    .catch(err => { err.inner.forEach(e => showError(e.message)); });
};

const saveData = async () => {
  saving.value = true;
  try {
    let filename = '';
    if (tmpForm.filedoc) {
      const fd = new FormData();
      fd.append('filedoc', tmpForm.filedoc);
      const upRes = await axios.post(`${import.meta.env.VITE_API}dms/pengaduan/upload`, fd);
      filename = upRes.data.data.filename;
    }

    if (isRevision.value) {
      await axios.put(`${import.meta.env.VITE_API}dms/pengaduan/${tmpForm.adu_id}/revise`, {
        creator: empid(),
        judul_pengaduan: tmpForm.judul_pengaduan,
        uraian_pengaduan: tmpForm.uraian_pengaduan,
        tanggal_pengaduan: tmpForm.tanggal_pengaduan,
        kategori_pengaduan: tmpForm.kategori_pengaduan,
        no_dokumen: tmpForm.no_dokumen || tmpForm.no_dokumen_manual,
        prioritas: tmpForm.prioritas,
        filename
      }, { skipErrorInterceptor: true });
      success('Pengaduan berhasil direvisi');
    } else {
      await axios.post(`${import.meta.env.VITE_API}dms/pengaduan`, {
        creator: empid(),
        judul_pengaduan: tmpForm.judul_pengaduan,
        uraian_pengaduan: tmpForm.uraian_pengaduan,
        tanggal_pengaduan: tmpForm.tanggal_pengaduan,
        kategori_pengaduan: tmpForm.kategori_pengaduan,
        no_dokumen: tmpForm.no_dokumen,
        no_dokumen_manual: tmpForm.no_dokumen_manual,
        nama_dokumen: tmpForm.nama_dokumen,
        prioritas: tmpForm.prioritas,
        filename
      }, { skipErrorInterceptor: true });
      success('Pengaduan berhasil dibuat');
    }
    emit('saved');
    close();
  } catch (e) {
    showError(e?.response?.data?.message || 'Gagal menyimpan pengaduan');
  }
  saving.value = false;
};

const resetForm = () => {
  tmpForm.no_pengaduan = '';
  tmpForm.adu_id = null;
  tmpForm.tanggal_pengaduan = new Date().toISOString().split('T')[0];
  tmpForm.no_dokumen = null;
  tmpForm.no_dokumen_manual = '';
  tmpForm.nama_dokumen = '';
  tmpForm.tanggal_dokumen = '';
  tmpForm.kode_arsip = '';
  tmpForm.prioritas = 1;
  tmpForm.judul_pengaduan = '';
  tmpForm.bisnis_unit = '';
  tmpForm.lokasi_penyimpanan = '';
  tmpForm.kode_lemari = '';
  tmpForm.kategori_pengaduan = null;
  tmpForm.uraian_pengaduan = '';
  tmpForm.filedoc = null;
};

const close = () => { emit('update:modelValue', false); };
</script>

