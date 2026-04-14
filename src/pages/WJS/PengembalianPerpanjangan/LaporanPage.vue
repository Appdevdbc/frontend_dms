<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assessment" size="28px" class="tw-text-white" />
          <div class="text-h6 tw-text-white tw-font-bold">Laporan Peminjaman Dokumen</div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-flex tw-flex-wrap tw-gap-3 tw-items-end">
          <q-select outlined dense v-model="filters.bu_id" :options="listBU" option-label="bu_name" option-value="bu_id"
            emit-value map-options label="Bisnis Unit" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[200px]">
            <template v-slot:prepend><q-icon name="domain" color="blue-6" /></template>
          </q-select>
          <q-input outlined dense v-model="filters.from" label="Dari Tanggal" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[160px]">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filters.from" mask="YYYY-MM-DD"><div class="row items-center justify-end"><q-btn v-close-popup label="Close" color="primary" flat /></div></q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input outlined dense v-model="filters.to" label="Sampai Tanggal" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[160px]">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filters.to" mask="YYYY-MM-DD"><div class="row items-center justify-end"><q-btn v-close-popup label="Close" color="primary" flat /></div></q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select outlined dense v-model="filters.status" :options="statusOptions" emit-value map-options label="Status" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[220px]">
            <template v-slot:prepend><q-icon name="filter_list" color="blue-6" /></template>
          </q-select>
          <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility" class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData" />
          <q-btn unelevated color="green-6" label="Export Excel" icon="download" class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="exportExcel" :loading="exporting" />
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table :rows="rows" :columns="columns" row-key="id" :loading="loading" flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-py-4`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body-cell-pinjam_tgl_create="props">
            <q-td :props="props">{{ formatDateDMY(props.row.pinjam_tgl_create) }}</q-td>
          </template>
          <template v-slot:body-cell-pinjam_tgl_est_kembali_to="props">
            <q-td :props="props">{{ formatDateDMY(props.row.pinjam_tgl_est_kembali_to) }}</q-td>
          </template>
          <template v-slot:body-cell-kembali_tgl="props">
            <q-td :props="props">{{ formatDateDMY(props.row.kembali_tgl) || '-' }}</q-td>
          </template>
          <template v-slot:body-cell-pinjam_status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.pinjam_status)" :label="props.row.pinjam_status" class="tw-px-2 tw-py-1 tw-rounded-full tw-text-xs" />
            </q-td>
          </template>
          <template v-slot:body-cell-hari_terlambat="props">
            <q-td :props="props" class="tw-text-center">
              <q-badge v-if="props.row.hari_terlambat > 0" color="red-6" :label="`${props.row.hari_terlambat} hari`" />
              <span v-else class="tw-text-green-600 tw-font-semibold">-</span>
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-3 tw-text-slate-700">{{ props.value }}</q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import { domain, formatDateDMY, spinnerBall } from "../../../utils";
import { Loading } from "quasar";
import { useNotify } from "../../../composables/useNotify";

const { error } = useNotify();
const loading = ref(false);
const exporting = ref(false);
const rows = ref([]);
const listBU = ref([]);
const filters = reactive({ bu_id: '', from: '', to: '', status: '' });

const statusOptions = [
  { label: 'Peminjaman Berhasil', value: 'Peminjaman Berhasil' },
  { label: 'Kembali Arsiparis', value: 'Kembali Arsiparis' },
  { label: 'Peminjaman Berakhir', value: 'Peminjaman Berakhir' },
  { label: 'Perpanjangan Approval Atasan User', value: 'Perpanjangan Approval Atasan User' },
  { label: 'Perpanjangan Approval Legal', value: 'Perpanjangan Approval Legal' },
  { label: 'Perpanjangan Approval Atasan Legal', value: 'Perpanjangan Approval Atasan Legal' },
];

const columns = [
  { name: 'pinjam_no_tiket', label: 'Nomor Tiket', align: 'center', field: 'pinjam_no_tiket' },
  { name: 'pinjam_nama_doc', label: 'Nama Arsip', align: 'left', field: 'pinjam_nama_doc' },
  { name: 'arsip_no', label: 'Kode Arsip', align: 'left', field: 'arsip_no' },
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', align: 'left', field: 'lokasi_arsip_name' },
  { name: 'pinjam_tgl_create', label: 'Tgl Pinjam', align: 'center', field: 'pinjam_tgl_create' },
  { name: 'pinjam_tgl_est_kembali_to', label: 'Tgl Est. Kembali', align: 'center', field: 'pinjam_tgl_est_kembali_to' },
  { name: 'kembali_tgl', label: 'Tgl Kembali Aktual', align: 'center', field: 'kembali_tgl' },
  { name: 'pinjam_status', label: 'Status', align: 'center', field: 'pinjam_status' },
  { name: 'perpanjang_qty', label: 'Perpanjangan ke-', align: 'center', field: 'perpanjang_qty' },
  { name: 'hari_terlambat', label: 'Hari Terlambat', align: 'center', field: 'hari_terlambat' },
];

const getStatusColor = (status) => {
  const map = { 'Peminjaman Berhasil': 'green-6', 'Kembali Arsiparis': 'purple-6', 'Peminjaman Berakhir': 'grey-6', 'Perpanjangan Approval Atasan User': 'orange-6', 'Perpanjangan Approval Legal': 'teal-6', 'Perpanjangan Approval Atasan Legal': 'indigo-6' };
  return map[status] || 'grey-6';
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`/dms/pengembalian-perpanjangan/laporan`, { params: { ...filters } });
    rows.value = res.data;
  } catch (e) { error('Gagal memuat laporan'); } finally { loading.value = false; }
};

const exportExcel = async () => {
  exporting.value = true;
  try {
    const res = await axios.get(`/dms/pengembalian-perpanjangan/laporan`, {
      params: { ...filters, format: 'excel' }, responseType: 'blob'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(res.data);
    link.download = 'Laporan_Peminjaman.xls';
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (e) { error('Gagal export Excel'); } finally { exporting.value = false; }
};

const getBU = async () => {
  try { const res = await axios.get(`/dms/getBU`); listBU.value = res.data; } catch {}
};

onMounted(() => { getBU(); loadData(); });
</script>


