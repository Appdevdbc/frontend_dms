<template>
  <div>
    <div class="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4 tw-bg-blue-50 tw-shadow-sm tw-mb-4">
      <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
        <q-icon name="filter_alt" color="blue-6" size="24px" />
        <span class="tw-font-bold tw-text-blue-900 tw-text-base">Filter Data</span>
      </div>
      <div class="tw-space-y-3">
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
          <div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="description" color="blue-6" size="18px" />
              <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Nama Arsip</span>
            </div>
            <q-input outlined dense v-model="filters.nama_arsip" clearable class="tw-bg-white tw-rounded-lg">
              <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Nama Arsip</span></template>
            </q-input>
          </div>
          <div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="tag" color="blue-6" size="18px" />
              <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Nomor Dokumen</span>
            </div>
            <q-input outlined dense v-model="filters.nomor_dok_arsip" clearable class="tw-bg-white tw-rounded-lg">
              <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Nomor Dokumen</span></template>
            </q-input>
          </div>
          <div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="business" color="blue-6" size="18px" />
              <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Bisnis Unit</span>
            </div>
            <q-select outlined dense v-model="filters.pilihbu" :options="buOptions" option-label="bu_name" option-value="bu_id" emit-value map-options clearable class="tw-bg-white tw-rounded-lg">
              <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Pilih Bisnis Unit</span></template>
            </q-select>
          </div>
        </div>
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
          <div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="location_on" color="blue-6" size="18px" />
              <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Lokasi Penyimpanan</span>
            </div>
            <q-select outlined dense v-model="filters.lokasi_penyimpanan_arsip" :options="lokasiOptions" option-label="lokasi_arsip_name" option-value="lokasi_arsip_id" emit-value map-options clearable class="tw-bg-white tw-rounded-lg">
              <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Pilih Lokasi</span></template>
            </q-select>
          </div>
          <div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="schedule" color="blue-6" size="18px" />
              <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Masa Berlaku</span>
            </div>
            <q-select outlined dense v-model="filters.masa_berlaku_arsip" :options="['Active','In Active']" clearable class="tw-bg-white tw-rounded-lg">
              <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Masa Berlaku</span></template>
            </q-select>
          </div>
          <div></div>
        </div>
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
          <div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="event" color="blue-6" size="18px" />
              <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Tanggal Awal</span>
            </div>
            <q-input outlined dense v-model="filters.periode_from" type="date" class="tw-bg-white tw-rounded-lg">
              <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Tanggal Awal</span></template>
            </q-input>
          </div>
          <div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="event" color="blue-6" size="18px" />
              <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Tanggal Akhir</span>
            </div>
            <q-input outlined dense v-model="filters.periode_to" type="date" class="tw-bg-white tw-rounded-lg">
              <template v-slot:label><span class="tw-font-semibold tw-text-slate-700">Tanggal Akhir</span></template>
            </q-input>
          </div>
        </div>
        <div class="tw-flex tw-gap-3 tw-pt-2">
          <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility" class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="search" :loading="loading" />
        </div>
      </div>
    </div>

    <q-table v-if="results.length > 0" :rows="results" :columns="columns" row-key="content_id"
      :loading="loading" flat class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props"
            :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`">{{ col.label }}</q-th>
        </q-tr>
      </template>
      <template v-slot:body-cell-aksi="props">
        <q-td :props="props">
          <div class="tw-flex tw-gap-1">
            <q-btn round dense flat icon="visibility" color="blue-6" size="sm" @click="openView(props.row)">
              <q-tooltip>View</q-tooltip>
            </q-btn>
            <q-btn round dense flat icon="download" color="green-6" size="sm" @click="openFile(props.row.content_file)">
              <q-tooltip>Download</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell="props">
        <q-td :props="props" class="tw-py-3 tw-text-slate-700 tw-text-sm">{{ props.value }}</q-td>
      </template>
    </q-table>

    <div v-else-if="searched" class="tw-text-center tw-py-12 tw-text-gray-400">
      <q-icon name="search_off" size="48px" /><div class="tw-mt-2">Tidak ada dokumen ditemukan</div>
    </div>

    <!-- Dialog View Dokumen -->
    <q-dialog v-model="showViewDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-rounded-none">
        <q-card-section :class="`bg-${domain()} tw-py-4`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-2">
            <q-icon name="visibility" size="22px" />ADD CONTENT (VIEW)
            <q-space />
            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>
        </q-card-section>

        <div v-if="viewLoading" class="tw-flex tw-justify-center tw-py-12">
          <q-spinner-dots color="blue-6" size="40px" />
        </div>

        <template v-else-if="viewDoc">
          <q-card-section style="max-height:calc(100vh - 120px)" class="scroll tw-p-6">
            <div class="row q-col-gutter-md">

              <!-- Kolom Kiri -->
              <div class="col-12 col-md-6">
                <div class="tw-grid tw-grid-cols-1 tw-gap-4">

                  <q-input :model-value="viewDoc.content_name" outlined label="Nama Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.content_doc" outlined label="Nomor Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="tag" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.folder_name" outlined label="Folder" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="folder" color="amber-7" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.content_desc" outlined label="Keterangan Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="notes" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.arsip_kat" outlined label="Kategori Dokumen" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.arsip_no" outlined label="Nomor Arsip" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="numbers" color="blue-6" /></template>
                  </q-input>

                  <div>
                    <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-1">File Dokumen</div>
                    <q-btn outline color="blue-6" icon="download" :label="viewDoc.content_file" size="sm"
                      @click="openFile(viewDoc.content_file)" class="tw-rounded-lg" />
                  </div>

                  <q-input :model-value="viewDoc.content_type" outlined label="Status Pembaharuan" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="autorenew" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.content_reminder" outlined label="Notifikasi Reminder" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="notifications" color="blue-6" /></template>
                  </q-input>

                  <!-- Kelengkapan Dokumen -->
                  <div>
                    <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Kelengkapan Dokumen</div>
                    <div class="tw-border tw-rounded-lg tw-p-3 tw-space-y-1 tw-bg-slate-50">
                      <div v-if="viewPendukung.length === 0" class="tw-text-xs tw-text-slate-400">Tidak ada data pendukung</div>
                      <div v-for="p in viewPendukung" :key="p.cdet_content_det_id"
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

                  <div>
                    <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-1">Kondisi Dokumen</div>
                    <q-option-group :model-value="viewDoc.kondisi_doc"
                      :options="[{label:'Baik',value:'baik'},{label:'Rusak',value:'rusak'}]"
                      color="blue-6" inline disable />
                  </div>
                  <q-input :model-value="viewDoc.kondisi_doc_ket" outlined type="textarea" label="Keterangan Kondisi" rows="3" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="comment" color="blue-6" /></template>
                  </q-input>

                </div>
              </div>

              <!-- Kolom Kanan -->
              <div class="col-12 col-md-6">
                <div class="tw-grid tw-grid-cols-1 tw-gap-4">

                  <q-input :model-value="viewDoc.bu_name || viewDoc.content_bu" outlined label="Bisnis Unit" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="domain" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.account_div_name || viewDoc.content_div" outlined label="Division" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="account_tree" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.account_dir_name" outlined label="Direktorat" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="corporate_fare" color="blue-6" /></template>
                  </q-input>

                  <!-- Jenis & Jumlah Dokumen -->
                  <div>
                    <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Jenis & Jumlah Dokumen</div>
                    <div class="tw-border tw-rounded-lg tw-p-3 tw-grid tw-grid-cols-1 tw-gap-2 tw-bg-slate-50">
                      <div class="tw-flex tw-items-center tw-gap-3">
                        <q-checkbox :model-value="!!viewDoc.jenis_asli && viewDoc.jenis_asli_qty > 0" label="Asli" disable />
                        <q-input :model-value="viewDoc.jenis_asli_qty" type="number" dense outlined readonly style="width:80px" class="tw-bg-slate-50" />
                      </div>
                      <div class="tw-flex tw-items-center tw-gap-3">
                        <q-checkbox :model-value="!!viewDoc.jenis_copy && viewDoc.jenis_copy_qty > 0" label="Copy" disable />
                        <q-input :model-value="viewDoc.jenis_copy_qty" type="number" dense outlined readonly style="width:80px" class="tw-bg-slate-50" />
                      </div>
                      <div class="tw-flex tw-items-center tw-gap-3">
                        <q-checkbox :model-value="!!viewDoc.jenis_elektronik && viewDoc.jenis_elektronik_qty > 0" label="PDF/Elektronik" disable />
                        <q-input :model-value="viewDoc.jenis_elektronik_qty" type="number" dense outlined readonly style="width:80px" class="tw-bg-slate-50" />
                      </div>
                    </div>
                  </div>

                  <q-input :model-value="viewDoc.tgl_doc ? String(viewDoc.tgl_doc).split('T')[0] : ''" outlined label="Tanggal Dokumen" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
                  </q-input>
                  <q-input v-if="viewDoc.content_duedate && !['','1900-01-01'].includes(String(viewDoc.content_duedate).split('T')[0])"
                    :model-value="String(viewDoc.content_duedate).split('T')[0]" outlined label="Tanggal Kadaluarsa" type="date" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="event_busy" color="orange-6" /></template>
                  </q-input>

                  <div>
                    <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Tanggal Penyerahan Dokumen</div>
                    <div class="tw-grid tw-grid-cols-2 tw-gap-2">
                      <q-input :model-value="viewDoc.tgl_doc_serah ? String(viewDoc.tgl_doc_serah).split('T')[0] : ''" outlined label="Tanggal" type="date" readonly class="tw-rounded-lg tw-bg-slate-50" />
                      <q-input :model-value="parseTime(viewDoc.content_waktu_doc_serah)" outlined label="Jam" type="time" readonly class="tw-rounded-lg tw-bg-slate-50" />
                    </div>
                  </div>

                  <q-input :model-value="viewDoc.content_security" outlined label="Kategori Keamanan" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.lokasi_arsip_name" outlined label="Lokasi Penyimpanan" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="location_on" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.account_name_arsiparis || viewDoc.keeper_name" outlined label="Arsiparis Lokasi" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                  </q-input>
                  <q-input :model-value="viewDoc.account_email_arsiparis" outlined label="Email Arsiparis" readonly class="tw-rounded-lg tw-bg-slate-50">
                    <template v-slot:prepend><q-icon name="email" color="blue-6" /></template>
                  </q-input>

                </div>
              </div>

            </div>
          </q-card-section>

          <!-- Dialog Data Pendukung -->
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
            <q-btn label="Tutup" color="grey-6" push icon="close" v-close-popup />
          </q-card-actions>
        </template>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { empid, domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const { error } = useNotify();

const loading = ref(false);
const searched = ref(false);
const results = ref([]);
const buOptions = ref([]);
const lokasiOptions = ref([]);
const filters = reactive({ nama_arsip: '', nomor_dok_arsip: '', pilihbu: '', lokasi_penyimpanan_arsip: '', masa_berlaku_arsip: '', periode_from: '', periode_to: '' });

// View dialog state
const showViewDialog = ref(false);
const viewLoading = ref(false);
const viewDoc = ref(null);
const viewPendukung = ref([]);
const showPendukungDialog = ref(false);
const selectedPendukung = ref(null);

const columns = [
  { name: 'aksi', label: 'Aksi', align: 'left', field: 'aksi' },
  { name: 'arsip_no', label: 'Kode Arsip', align: 'left', field: 'arsip_no' },
  { name: 'content_name', label: 'Nama Arsip', align: 'left', field: 'content_name', sortable: true },
  { name: 'content_doc', label: 'Nomor Dokumen', align: 'left', field: 'content_doc' },
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', align: 'left', field: 'lokasi_arsip_name' },
  { name: 'arsiparis_name', label: 'Arsiparis', align: 'left', field: 'arsiparis_name' },
  { name: 'content_kode_lemari', label: 'Kode Lemari', align: 'left', field: 'content_kode_lemari' },
  { name: 'tgl_doc', label: 'Tgl Dokumen', align: 'center', field: 'tgl_doc' },
  { name: 'content_duedate', label: 'Tgl Berakhir', align: 'center', field: 'content_duedate' },
  { name: 'jenis_asli_qty', label: 'Asli', align: 'center', field: 'jenis_asli_qty' },
  { name: 'jenis_copy_qty', label: 'Copy', align: 'center', field: 'jenis_copy_qty' },
  { name: 'jenis_elektronik_qty', label: 'Elektronik', align: 'center', field: 'jenis_elektronik_qty' },
  { name: 'owner_name', label: 'Owner', align: 'left', field: 'owner_name' },
  { name: 'arsip_kat', label: 'Kategori', align: 'left', field: 'arsip_kat' },
  { name: 'content_security', label: 'Keamanan', align: 'center', field: 'content_security' },
  { name: 'content_status', label: 'Status', align: 'center', field: 'content_status' },
];

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

const openView = async (row) => {
  showViewDialog.value = true;
  viewLoading.value = true;
  viewDoc.value = null;
  viewPendukung.value = [];
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/files/${row.content_id}`);
    viewDoc.value = res.data.data;
    viewPendukung.value = res.data.pendukung || [];
  } catch { viewDoc.value = null; } finally { viewLoading.value = false; }
};

const search = async () => {
  loading.value = true; searched.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/search`, {
      params: { ...filters, empid: empid(), domain: domain() }
    });
    results.value = res.data;
  } catch (e) { error('Gagal mencari dokumen'); } finally { loading.value = false; }
};

onMounted(async () => {
  try {
    const [bu, la] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}dms/getBU`),
      axios.get(`${import.meta.env.VITE_API}dms/listLokasiArsip`),
    ]);
    buOptions.value = bu.data;
    lokasiOptions.value = la.data;
  } catch {}
});
</script>

