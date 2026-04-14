<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="assignment" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Data Outstanding Rekap Hasil Add File</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" /><q-icon name="chevron_right" size="14px" /><span>Document Recap</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Filter -->
      <q-card-section class="tw-p-6 tw-pb-4">
        <div class="tw-flex tw-flex-wrap tw-gap-3 tw-items-end">
          <q-select outlined dense v-model="filterBU" :options="listBU" option-label="bu_name" option-value="bu_id"
            emit-value map-options label="Bisnis Unit" clearable class="tw-bg-white tw-rounded-lg tw-min-w-[200px]">
            <template v-slot:prepend><q-icon name="domain" color="blue-6" /></template>
          </q-select>
          <q-input outlined dense v-model="filterFrom" label="Tanggal Awal" type="date"
            class="tw-bg-white tw-rounded-lg tw-min-w-[160px]">
            <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
          </q-input>
          <q-input outlined dense v-model="filterTo" label="Tanggal Akhir" type="date"
            class="tw-bg-white tw-rounded-lg tw-min-w-[160px]">
            <template v-slot:prepend><q-icon name="event" color="blue-6" /></template>
          </q-input>
          <q-btn unelevated color="blue-6" label="Tampilkan" icon="visibility"
            class="tw-font-semibold tw-px-4 tw-rounded-lg" @click="loadData" />
        </div>
      </q-card-section>

      <!-- Tabel -->
      <q-card-section class="tw-p-6 tw-pt-0">
        <q-table :rows="rows" :columns="columns" row-key="content_id" :loading="loading"
          :filter="search" flat class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
          :rows-per-page-options="[10, 25, 50]">

          <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="search" placeholder="Search..."
              class="tw-bg-white tw-rounded-lg tw-min-w-[250px]">
              <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
            </q-input>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-py-4`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body-cell-content_status="props">
            <q-td :props="props">
              <q-badge :color="statusColor(props.row.content_status)" :label="props.row.content_status"
                class="tw-px-2 tw-py-1 tw-rounded-full tw-text-xs" />
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props">
              <div class="tw-flex tw-gap-2">
                <q-btn flat dense size="sm" color="blue-6" icon="visibility" label="View"
                  @click="goTo('document/view', props.row.token)" />
                <q-btn v-if="props.row.action?.type === 'approval'" flat dense size="sm"
                  color="green-6" icon="check_circle" label="Approval"
                  @click="goTo('document/approval', props.row.token)" />
                <q-btn v-if="props.row.action?.type === 'revisi'" flat dense size="sm"
                  color="orange-6" icon="edit" label="Revisi"
                  @click="goTo('document/revisi', props.row.token)" />
                <q-btn v-if="props.row.action?.type === 'konfirmasi'" flat dense size="sm"
                  color="purple-6" icon="assignment_turned_in" label="Konfirmasi"
                  @click="goTo('document/approve', props.row.token)" />
              </div>            </q-td>
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
import { useRouter } from "vue-router";
import { domain, empid, decryptMessage, spinnerBall } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";
import { Loading } from "quasar";

const router = useRouter();
const { error } = useNotify();

const rows = ref([]);
const listBU = ref([]);
const loading = ref(false);
const search = ref('');

const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
const filterBU = ref('');
const filterFrom = ref(firstDay);
const filterTo = ref(lastDay);

const columns = [
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'left' },
  { name: 'tgl_doc', label: 'Tanggal Dokumen', field: 'tgl_doc', align: 'center', sortable: true },
  { name: 'content_doc', label: 'Nomor Dokumen', field: 'content_doc', align: 'left', sortable: true },
  { name: 'content_name', label: 'Nama Dokumen', field: 'content_name', align: 'left', sortable: true },
  { name: 'arsip_no', label: 'Kode Arsip', field: 'arsip_no', align: 'left', sortable: true },
  { name: 'nama_owner', label: 'PIC User', field: 'nama_owner', align: 'left', sortable: true },
  { name: 'div_nama', label: 'Divisi', field: 'div_nama', align: 'left', sortable: true },
  { name: 'bu_name', label: 'Bisnis Unit', field: 'bu_name', align: 'left', sortable: true },
  { name: 'content_status', label: 'Status', field: 'content_status', align: 'left', sortable: true },
];

const statusColor = (status) => {
  if (!status) return 'grey-5';
  const s = status.toLowerCase();
  if (s.includes('menunggu persetujuan atasan')) return 'orange-6';
  if (s.includes('arsiparis')) return 'purple-6';
  if (s === 'revisi') return 'red-6';
  if (s === 'tersedia') return 'green-6';
  return 'blue-6';
};

const goTo = (path, token) => {
  router.push({ path: `/dms/${path}`, query: { token } });
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/document/recap`, {
      params: { empid: empid(), bu_id: filterBU.value || undefined, tgl_awal: filterFrom.value, tgl_akhir: filterTo.value }
    });
    rows.value = res.data || [];
  } catch (e) {
    error('Gagal memuat data rekap');
  } finally {
    loading.value = false;
  }
};

const loadBU = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/getBU`);
    listBU.value = res.data || [];
  } catch {}
};

onMounted(() => {
  loadBU();
  loadData();
});
</script>


