<template>
  <div>
    <!-- Search and Filter Section -->
    <q-card class="tw-mb-4 tw-shadow-md tw-rounded-xl">
      <q-card-section class="tw-p-4">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              outlined
              dense
              v-model="searchText"
              placeholder="Cari arsip..."
              class="tw-rounded-lg"
              @update:model-value="searchArchives"
              debounce="500"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="blue-6"/>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-8">
            <div class="tw-flex tw-gap-2 tw-justify-end">
              <q-btn
                unelevated
                color="blue-6"
                label="Cari Arsip"
                icon="search"
                class="tw-font-semibold tw-px-4 tw-rounded-lg"
                @click="searchArchives"
                :loading="loading"
              />
              <q-btn
                unelevated
                color="grey-6"
                label="Reset"
                icon="refresh"
                class="tw-font-semibold tw-px-4 tw-rounded-lg"
                @click="resetSearch"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Selected Archives Summary -->
    <div v-if="selectedArchives.length > 0" class="tw-mb-4">
      <q-banner rounded class="tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-shadow-sm">
        <template v-slot:avatar>
          <q-icon name="check_circle" color="green" size="24px"/>
        </template>
        <div class="tw-flex tw-items-center tw-justify-between">
          <span class="tw-text-green-700 tw-font-medium">
            {{ selectedArchives.length }} arsip dipilih untuk dimusnahkan
          </span>
          <q-btn
            flat
            dense
            color="green-7"
            label="Hapus Semua"
            icon="clear"
            size="sm"
            @click="clearSelection"
          />
        </div>
      </q-banner>
    </div>

    <!-- Archives Table -->
    <q-table
      :rows="archives"
      :columns="columns"
      row-key="arsip_no"
      :loading="loading"
      :pagination="pagination"
      flat
      class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
      selection="multiple"
      v-model:selected="selectedArchives"
      @update:selected="onSelectionChange"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>
            <q-checkbox v-model="props.selected" />
          </q-th>
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="bg-blue-6 tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="tw-py-4 tw-text-slate-700"
          >
            {{ col.value }}
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="tw-text-center tw-py-8">
          <q-icon name="inbox" size="48px" color="grey-5" />
          <div class="tw-text-slate-500 tw-mt-2">
            {{ searchText ? 'Tidak ada arsip yang ditemukan' : 'Gunakan filter untuk mencari arsip' }}
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import axios from "axios";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  lokasiArsip: {
    type: Number,
    default: null
  },
  kategoriKeamanan: {
    type: String,
    default: null
  },
  kategoriDokumen: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const { error: showError } = useNotify();

const columns = [
  {
    name: "arsip_no",
    required: true,
    label: "Kode Arsip",
    align: "left",
    field: "arsip_no",
  },
  {
    name: "content_name",
    required: true,
    label: "Nama Arsip",
    align: "left",
    field: "content_name",
  },
  {
    name: "content_doc",
    required: true,
    label: "Nomor Dokumen",
    align: "left",
    field: "content_doc",
  },
  {
    name: "bu_name",
    required: true,
    label: "Bisnis Unit",
    align: "left",
    field: "bu_name",
  },
  {
    name: "lokasi_arsip_name",
    required: true,
    label: "Lokasi",
    align: "left",
    field: "lokasi_arsip_name",
  },
  {
    name: "content_duedate",
    required: true,
    label: "Due Date",
    align: "left",
    field: "content_duedate",
    format: (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-'
  },
  {
    name: "arsip_kat",
    required: true,
    label: "Kategori",
    align: "left",
    field: "arsip_kat",
  },
];

const archives = ref([]);
const selectedArchives = ref([]);
const searchText = ref('');
const loading = ref(false);

const pagination = ref({
  rowsPerPage: 10
});

const searchArchives = async () => {
  if (!props.lokasiArsip) {
    showError('Pilih lokasi arsip terlebih dahulu');
    return;
  }

  try {
    loading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}dms/pemusnahan/archives`, {
      params: {
        lokasi_arsip: props.lokasiArsip,
        kategori_keamanan: props.kategoriKeamanan,
        kategori_dokumen: props.kategoriDokumen,
        search: searchText.value
      },
      skipErrorInterceptor: true
    });

    archives.value = res.data.data || [];
    loading.value = false;
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal memuat data arsip');
  }
};

const resetSearch = () => {
  searchText.value = '';
  archives.value = [];
  selectedArchives.value = [];
  emit('update:modelValue', []);
};

const clearSelection = () => {
  selectedArchives.value = [];
  emit('update:modelValue', []);
};

const onSelectionChange = (selected) => {
  const documents = selected.map(archive => ({
    arsip_no: archive.arsip_no,
    keterangan: ''
  }));
  emit('update:modelValue', documents);
};

// Watch for changes in filter props
watch([() => props.lokasiArsip, () => props.kategoriKeamanan, () => props.kategoriDokumen], () => {
  if (props.lokasiArsip) {
    searchArchives();
  }
});
</script>

