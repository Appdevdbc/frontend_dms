<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`bg-${domain()} tw-py-5`">
        <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-2">
          <q-icon name="assignment_turned_in" size="24px" />ADD CONTENT (APPROVE)
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
                  <q-option-group v-model="form.kondisi_dok"
                    :options="[{label:'Baik',value:'baik'},{label:'Rusak',value:'rusak'}]"
                    color="blue-6" inline />
                </div>

                <q-input v-model="form.kondisi_doc_ket" outlined type="textarea" label="Keterangan Kondisi" rows="3" class="tw-rounded-lg">
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

                <q-input :model-value="docData.account_div_name || docData.div_nama || docData.content_div" outlined label="Division" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="account_tree" color="blue-6" /></template>
                </q-input>

                <q-input :model-value="docData.account_dir_name" outlined label="Direktorat" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="corporate_fare" color="blue-6" /></template>
                </q-input>

                <!-- Jenis & Jumlah Dokumen -->
                <div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Jenis & Jumlah Dokumen</div>
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

                <q-input :model-value="docData.tgl_doc ? String(docData.tgl_doc).split('T')[0] : ''" outlined label="Tanggal Dokumen" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
                </q-input>

                <q-input v-if="docData.content_duedate && !['','1900-01-01'].includes(String(docData.content_duedate).split('T')[0])"
                  :model-value="String(docData.content_duedate).split('T')[0]" outlined label="Tanggal Kadaluarsa" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="event_busy" color="orange-6" /></template>
                </q-input>

                <q-select v-model="form.security" outlined label="Kategori Keamanan *"
                  :options="[{label:'Non Restricted',value:'non-restricted'},{label:'Confidential',value:'confidential'},{label:'Restricted',value:'restricted'}]"
                  emit-value map-options class="tw-rounded-lg">
                  <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
                </q-select>

                <!-- Field yang bisa diisi arsiparis -->
                <q-select v-model="form.lokasiarsip" outlined label="Lokasi Penyimpanan *"
                  :options="lokasiOptions" option-label="lokasi_arsip_name" option-value="lokasi_arsip_id"
                  emit-value map-options class="tw-rounded-lg" @update:model-value="loadLemari">
                  <template v-slot:prepend><q-icon name="location_on" color="blue-6" /></template>
                </q-select>

                <q-select v-model="form.lemari_id" outlined label="Lemari Penyimpanan"
                  :options="lemariOptions" option-label="lemari_name" option-value="lemari_id"
                  emit-value map-options class="tw-rounded-lg" @update:model-value="onLemariChange">
                  <template v-slot:prepend><q-icon name="inventory_2" color="blue-6" /></template>
                </q-select>

                <div class="tw-grid tw-grid-cols-3 tw-gap-2">
                  <q-input :model-value="selectedLemari?.lemari_tingkat_ke ?? ''" outlined dense label="Tingkat Lemari" readonly class="tw-rounded-lg tw-bg-slate-50" />
                  <q-input :model-value="selectedLemari?.lemari_box_ke ?? ''" outlined dense label="Box ke" readonly class="tw-rounded-lg tw-bg-slate-50" />
                  <q-input :model-value="selectedLemari?.kode_lemari ?? ''" outlined dense label="Kode Lemari" readonly class="tw-rounded-lg tw-bg-slate-50" />
                </div>

                <div>
                  <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Tanggal Penyerahan Dokumen</div>
                  <div class="tw-grid tw-grid-cols-2 tw-gap-2">
                    <q-input v-model="form.handdate" outlined label="Tanggal" type="date" class="tw-rounded-lg" />
                    <q-input v-model="form.handtime" outlined label="Jam" type="time" class="tw-rounded-lg" />
                  </div>
                </div>

                <q-select v-model="form.arsiparis_id" outlined label="Arsiparis Lokasi *"
                  :options="arsiparisOptions" option-label="account_name" option-value="arsiparis_emp_id"
                  emit-value map-options class="tw-rounded-lg" @update:model-value="onArsiparisChange">
                  <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                </q-select>

                <q-input :model-value="emailArsiparis" outlined label="Email Arsiparis" readonly class="tw-rounded-lg tw-bg-slate-50">
                  <template v-slot:prepend><q-icon name="email" color="blue-6" /></template>
                </q-input>

              </div>
            </div>

          </div>
        </q-card-section>

        <!-- Dialog Konfirmasi Approve -->
        <q-dialog v-model="showKonfirmDialog" persistent>
          <q-card style="min-width:380px;max-width:460px">
            <q-card-section :class="`bg-${domain()} text-white`">
              <div class="text-h6 tw-flex tw-items-center tw-gap-2">
                <q-icon name="help_outline" />Konfirmasi
              </div>
            </q-card-section>
            <q-card-section class="tw-pt-4 tw-text-slate-700">
              Apakah dokumen sudah berada di tangan anda sesuai informasi yang diisikan pada sistem?
            </q-card-section>
            <q-separator />
            <q-card-actions align="right" class="tw-p-3">
              <q-btn flat label="Batal" color="grey-6" v-close-popup />
              <q-btn unelevated label="Konfirmasi" color="green-6" icon="check_circle"
                @click="doApprove" :loading="saving" />
            </q-card-actions>
          </q-card>
        </q-dialog>

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
          <q-btn label="Konfirmasi" color="green-6" push icon="check_circle" @click="showKonfirmDialog = true" :loading="saving" />
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
import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import { useNotify } from "../../../composables/useNotify";
import { useRoute, useRouter } from "vue-router";
import { domain } from "../../../utils";

const { success, error } = useNotify();
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const docData = ref(null);
const pendukung = ref([]);
const lokasiOptions = ref([]);
const lemariOptions = ref([]);
const token = route.query.token;

const form = reactive({
  lokasiarsip: '', lemari_id: '', handdate: '', handtime: '',
  security: '', arsiparis_id: '', emailArsiparis: '',
  kondisi_dok: 'baik', kondisi_doc_ket: '',
  chk_jenis_1: false, txt_jenis_1: 0,
  chk_jenis_2: false, txt_jenis_2: 0,
  chk_jenis_3: false, txt_jenis_3: 0,
});

const arsiparisOptions = ref([]);
const emailArsiparis = ref('');
const selectedLemari = ref(null);

const showKonfirmDialog = ref(false);
const showPendukungDialog = ref(false);
const selectedPendukung = ref(null);

const openFile = (f) => {
  const base = import.meta.env.VITE_FTP || '';
  const dir = import.meta.env.VITE_FTP_DIR || 'dmslegal';
  window.open(`${base}${dir}/content/${f}`, '_blank');
};

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

const loadLemari = async (lokasi_id) => {
  lemariOptions.value = [];
  form.lemari_id = '';
  selectedLemari.value = null;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/document/lemari-lokasi`, { params: { lokasi_arsip_id: lokasi_id } });
    lemariOptions.value = res.data;
  } catch {}
  // Load arsiparis berdasarkan lokasi
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

const onLemariChange = (val) => {
  selectedLemari.value = lemariOptions.value.find(l => l.lemari_id === val) || null;
};

watch(() => form.chk_jenis_1, (v) => { if (!v) form.txt_jenis_1 = 0; });
watch(() => form.chk_jenis_2, (v) => { if (!v) form.txt_jenis_2 = 0; });
watch(() => form.chk_jenis_3, (v) => { if (!v) form.txt_jenis_3 = 0; });

const doApprove = async () => {
  saving.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}wjs/document/approval/arsiparis`, {
      token, action: 'approve', ...form,
    });
    success('Dokumen berhasil dikonfirmasi oleh arsiparis');
    showKonfirmDialog.value = false;
    router.push('/wjs/document/recap');
  } catch (e) { error(e.response?.data?.message || 'Gagal memproses'); } finally { saving.value = false; }
};

onMounted(async () => {
  if (!token) { loading.value = false; return; }
  try {
    const [docRes, lokasiRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}wjs/document/approval/validate`, { params: { token } }),
      axios.get(`${import.meta.env.VITE_API}wjs/listLokasiArsip`),
    ]);
    docData.value = docRes.data.data;
    pendukung.value = docRes.data.pendukung || [];
    lokasiOptions.value = lokasiRes.data;

    // Pre-fill dari data dokumen
    if (docData.value?.lokasi_arsip_id) {
      form.lokasiarsip = Number(docData.value.lokasi_arsip_id) || docData.value.lokasi_arsip_id;
      await loadLemari(form.lokasiarsip);
      // Restore arsiparis setelah load
      const savedArsiparis = docData.value.arsiparis_id || docData.value.content_arsiparis_lokasi_id;
      if (savedArsiparis) {
        const found = arsiparisOptions.value.find(a => String(a.arsiparis_emp_id) === String(savedArsiparis));
        form.arsiparis_id = found ? found.arsiparis_emp_id : savedArsiparis;
        emailArsiparis.value = found?.account_email || docData.value.account_email_arsiparis || '';
      }
    }
    if (docData.value?.tgl_doc_serah) {
      form.handdate = String(docData.value.tgl_doc_serah).split('T')[0];
    }
    if (docData.value?.content_waktu_doc_serah) {
      form.handtime = parseTime(docData.value.content_waktu_doc_serah);
    }
    form.security = docData.value?.content_security || '';
    form.kondisi_dok = docData.value?.kondisi_doc || 'baik';
    form.kondisi_doc_ket = docData.value?.kondisi_doc_ket || '';
    form.chk_jenis_1 = !!docData.value?.jenis_asli && docData.value?.jenis_asli_qty > 0;
    form.txt_jenis_1 = docData.value?.jenis_asli_qty || 0;
    form.chk_jenis_2 = !!docData.value?.jenis_copy && docData.value?.jenis_copy_qty > 0;
    form.txt_jenis_2 = docData.value?.jenis_copy_qty || 0;
    form.chk_jenis_3 = !!docData.value?.jenis_elektronik && docData.value?.jenis_elektronik_qty > 0;
    form.txt_jenis_3 = docData.value?.jenis_elektronik_qty || 0;
  } catch { docData.value = null; } finally { loading.value = false; }
});
</script>

