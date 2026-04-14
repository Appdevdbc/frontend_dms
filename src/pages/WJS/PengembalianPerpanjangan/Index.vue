<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assignment_return" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Pengembalian & Perpanjangan Peminjaman</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Pengembalian & Perpanjangan</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-flex tw-flex-wrap tw-gap-3 tw-items-end">
          <q-select outlined dense v-model="filterBU" :options="listBU" option-label="bu_name" option-value="bu_id"
            emit-value map-options label="Bisnis Unit" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[200px]">
            <template v-slot:prepend><q-icon name="domain" color="blue-6" /></template>
          </q-select>
          <q-input outlined dense v-model="filterFrom" label="Dari Tanggal" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[160px]">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filterFrom" mask="YYYY-MM-DD"><div class="row items-center justify-end"><q-btn v-close-popup label="Close" color="primary" flat /></div></q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input outlined dense v-model="filterTo" label="Sampai Tanggal" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[160px]">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filterTo" mask="YYYY-MM-DD"><div class="row items-center justify-end"><q-btn v-close-popup label="Close" color="primary" flat /></div></q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility" class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData" />
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination"
          :rows-per-page-options="[]" :loading="loading" :filter="pagination.filter"
          @request="onRequest" binary-state-sort flat class="tw-shadow-md tw-rounded-xl tw-overflow-hidden">
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-py-4`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px" />
              <q-select borderless dense v-model="pagination.rowsPerPage" :options="[5,10,25,50,100]" @update:modelValue="loadData" class="tw-min-w-[80px]" />
            </div>
          </template>
          <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="pagination.filter" placeholder="Search ..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[280px]">
              <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
            </q-input>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3">
              <div class="tw-flex tw-gap-2 tw-flex-wrap">
                <q-btn v-if="props.row.can_kembalikan" round dense color="green-6" icon="assignment_return" size="sm"
                  @click="goTo('pengembalian-perpanjangan/pengembalian', props.row.pinjam_no_tiket)">
                  <q-tooltip>Kembalikan Dokumen</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_perpanjang" round dense color="blue-6" icon="update" size="sm"
                  
                  @click="goTo('pengembalian-perpanjangan/perpanjangan', props.row.pinjam_no_tiket)">
                  <q-tooltip>Ajukan Perpanjangan</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_approve_arsiparis" round dense color="purple-6" icon="check_circle" size="sm"
                  @click="goTo('pengembalian-perpanjangan/pengembalian-arsiparis', props.row.pinjam_no_tiket)">
                  <q-tooltip>Konfirmasi Pengembalian</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_approve_perpanjangan && props.row.pinjam_status === 'Perpanjangan Approval Atasan User'"
                  round dense color="orange-6" icon="how_to_reg" size="sm"
                  @click="goTo('pengembalian-perpanjangan/perpanjangan-atasan-user', props.row.pinjam_no_tiket)">
                  <q-tooltip>Approval Atasan User</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_approve_perpanjangan && props.row.pinjam_status === 'Perpanjangan Approval Legal'"
                  round dense color="teal-6" icon="gavel" size="sm"
                  @click="goTo('pengembalian-perpanjangan/perpanjangan-legal', props.row.pinjam_no_tiket)">
                  <q-tooltip>Approval Corp Legal SH</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.can_approve_perpanjangan && props.row.pinjam_status === 'Perpanjangan Approval Atasan Legal'"
                  round dense color="indigo-6" icon="supervisor_account" size="sm"
                  @click="goTo('pengembalian-perpanjangan/perpanjangan-atasan-legal', props.row.pinjam_no_tiket)">
                  <q-tooltip>Approval Atasan Legal</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-pinjam_tgl_create="props">
            <q-td :props="props">{{ formatDateDMY(props.row.pinjam_tgl_create) }}</q-td>
          </template>
          <template v-slot:body-cell-pinjam_tgl_est_kembali_to="props">
            <q-td :props="props">{{ formatDateDMY(props.row.pinjam_tgl_est_kembali_to) }}</q-td>
          </template>
          <template v-slot:body-cell-pinjam_status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.pinjam_status)" :label="props.row.pinjam_status"
                class="tw-px-2 tw-py-1 tw-rounded-full tw-text-xs" />
            </q-td>
          </template>
          <template v-slot:body-cell-perpanjang_qty="props">
            <q-td :props="props" class="tw-text-center">
              <q-badge v-if="props.row.perpanjang_qty > 0" color="blue-6" :label="`ke-${props.row.perpanjang_qty}`" />
              <span v-else class="tw-text-gray-400">-</span>
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
import { ref, onMounted } from "vue";
import axios from "axios";
import { domain, empid, formatDateDMY, spinnerBall } from "../../../utils";
import { Loading } from "quasar";
import { useNotify } from "../../../composables/useNotify";
import { useRouter } from "vue-router";

const { error } = useNotify();
const router = useRouter();
const loading = ref(false);
const rows = ref([]);
const listBU = ref([]);
const filterBU = ref('');
const filterFrom = ref('');
const filterTo = ref('');

const pagination = ref({ sortBy: 'pinjam_tgl_create', descending: true, page: 1, rowsPerPage: 10, rowsNumber: 0, filter: '' });

const columns = [
  { name: 'aksi', label: 'Aksi', align: 'left', field: 'aksi' },
  { name: 'pinjam_no_tiket', label: 'Nomor Tiket', align: 'center', field: 'pinjam_no_tiket', sortable: true },
  { name: 'pinjam_tgl_create', label: 'Tgl Permintaan', align: 'center', field: 'pinjam_tgl_create', sortable: true },
  { name: 'pinjam_nama_doc', label: 'Nama Arsip', align: 'left', field: 'pinjam_nama_doc', sortable: true },
  { name: 'arsip_no', label: 'Kode Arsip', align: 'left', field: 'arsip_no' },
  { name: 'lokasi_arsip_name', label: 'Lokasi Arsip', align: 'left', field: 'lokasi_arsip_name' },
  { name: 'pinjam_tgl_est_kembali_to', label: 'Tgl Est. Kembali', align: 'center', field: 'pinjam_tgl_est_kembali_to', sortable: true },
  { name: 'pinjam_status', label: 'Status', align: 'center', field: 'pinjam_status', sortable: true },
  { name: 'perpanjang_qty', label: 'Perpanjangan', align: 'center', field: 'perpanjang_qty' },
];

const getStatusColor = (status) => {
  const map = {
    'Peminjaman Berhasil': 'green-6',
    'Kembali Arsiparis': 'purple-6',
    'Perpanjangan Approval Atasan User': 'orange-6',
    'Perpanjangan Approval Legal': 'teal-6',
    'Perpanjangan Approval Atasan Legal': 'indigo-6',
  };
  return map[status] || 'grey-6';
};

const goTo = (path, tiket) => router.push({ path: `/dms/${path}`, query: { tiket } });

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`/dms/pengembalian-perpanjangan`, {
      params: {
        rowsPerPage: pagination.value.rowsPerPage,
        page: pagination.value.page,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        filter: pagination.value.filter,
        bu_id: filterBU.value,
        from: filterFrom.value,
        to: filterTo.value,
        empid: empid(),
      }
    });
    rows.value = res.data.data || res.data;
    pagination.value.rowsNumber = res.data.total || rows.value.length;
  } catch (e) {
    error(e.response?.data?.message || 'Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  pagination.value = { ...pagination.value, ...props.pagination };
  loadData();
};

const getBU = async () => {
  try {
    const res = await axios.get(`/dms/getBU`);
    listBU.value = res.data;
  } catch {}
};

onMounted(() => { getBU(); loadData(); });
</script>


