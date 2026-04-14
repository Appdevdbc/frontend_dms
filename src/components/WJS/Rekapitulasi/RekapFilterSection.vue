<template>
  <div class="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4 tw-bg-blue-50 tw-shadow-sm">
    <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
      <q-icon name="filter_alt" color="blue-6" size="24px"/>
      <span class="tw-font-bold tw-text-blue-900 tw-text-base">Filter Data</span>
    </div>
    <div class="tw-space-y-3">
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
        <!-- BU -->
        <div v-if="showBu">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <q-icon name="business" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Bisnis Unit</span>
          </div>
          <q-select outlined dense :model-value="filterBu" use-input emit-value map-options
            input-debounce="0" :options="filteredDomains" option-value="bu_id"
            @filter="filterDomainsFn" @update:model-value="$emit('update:filterBu', $event)"
            clearable class="tw-rounded-lg tw-bg-white">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section><q-item-label>({{ scope.opt.bu_id }}) {{ scope.opt.bu_name }}</q-item-label></q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <span>({{ scope.opt.bu_id }}) {{ scope.opt.bu_name }}</span>
            </template>
            <template v-slot:no-option><q-item><q-item-section class="text-grey">Tidak ada data</q-item-section></q-item></template>
          </q-select>
        </div>
        <!-- Lokasi Arsip -->
        <div v-if="showLokasiArsip">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <q-icon name="location_on" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Lokasi Arsip</span>
          </div>
          <q-select outlined dense :model-value="filterLokasiArsip" :options="listLokasiArsip"
            option-value="lokasi_arsip_id" option-label="lokasi_arsip_name" emit-value map-options clearable
            @update:model-value="$emit('update:filterLokasiArsip', $event)" class="tw-bg-white tw-rounded-lg"/>
        </div>
        <!-- Kategori -->
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <q-icon name="category" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Kategori Dokumen</span>
          </div>
          <q-select outlined dense :model-value="filterKategori" :options="listKategori"
            option-value="sub_arsip_id" option-label="sub_arsip_categ" emit-value map-options clearable
            @update:model-value="$emit('update:filterKategori', $event)" class="tw-bg-white tw-rounded-lg"/>
        </div>
      </div>
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
        <!-- Divisi -->
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <q-icon name="groups" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Divisi</span>
          </div>
          <q-select outlined dense :model-value="filterDivisi" :options="listDivisi"
            option-value="div_id" option-label="div_nama" emit-value map-options clearable
            @update:model-value="$emit('update:filterDivisi', $event)" class="tw-bg-white tw-rounded-lg"/>
        </div>
        <!-- Periode From -->
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <q-icon name="event" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">{{ periodLabel }} Awal</span>
          </div>
          <q-input outlined dense :model-value="filterFrom" :type="periodType"
            @update:model-value="$emit('update:filterFrom', $event)" class="tw-bg-white tw-rounded-lg"/>
        </div>
        <!-- Periode To -->
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <q-icon name="event" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">{{ periodLabel }} Akhir</span>
          </div>
          <q-input outlined dense :model-value="filterTo" :type="periodType"
            @update:model-value="$emit('update:filterTo', $event)" class="tw-bg-white tw-rounded-lg"/>
        </div>
      </div>
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
        <!-- Tipe Dokumen -->
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <q-icon name="description" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Tipe Dokumen</span>
          </div>
          <q-select outlined dense :model-value="filterTipe" :options="tipeOptions" emit-value map-options clearable
            @update:model-value="$emit('update:filterTipe', $event)" class="tw-bg-white tw-rounded-lg"/>
        </div>
        <div class="tw-flex tw-items-end tw-gap-3">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { empid } from '../../../utils';

const props = defineProps({
  filterBu: { type: [String, Number], default: null },
  filterLokasiArsip: { type: [String, Number], default: null },
  filterKategori: { type: [String, Number], default: null },
  filterDivisi: { type: [String, Number], default: null },
  filterFrom: { type: String, default: null },
  filterTo: { type: String, default: null },
  filterTipe: { type: String, default: null },
  showBu: { type: Boolean, default: true },
  showLokasiArsip: { type: Boolean, default: true },
  periodType: { type: String, default: 'month' },
  periodLabel: { type: String, default: 'Periode' },
});

defineEmits([
  'update:filterBu','update:filterLokasiArsip','update:filterKategori',
  'update:filterDivisi','update:filterFrom','update:filterTo','update:filterTipe'
]);

const tipeOptions = ['Dokumen Induk', 'Dokumen Pendukung', 'Semua'];
const domains = ref([]);
const filteredDomains = ref([]);
const listLokasiArsip = ref([]);
const listKategori = ref([]);
const listDivisi = ref([]);

const getDomains = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}domains`, { skipErrorInterceptor: true });
    domains.value = res.data;
    filteredDomains.value = res.data;
  } catch (e) { console.error(e); }
};
const filterDomainsFn = (val, update) => {
  update(() => {
    if (!val) { filteredDomains.value = domains.value; return; }
    const needle = val.toLowerCase();
    filteredDomains.value = domains.value.filter(v => v.bu_id.toLowerCase().includes(needle) || v.bu_name.toLowerCase().includes(needle));
  });
};
const getLokasiArsip = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listLokasiArsip`, { params: { rowsPerPage: null }, skipErrorInterceptor: true });
    listLokasiArsip.value = res.data;
  } catch (e) { console.error(e); }
};
const getKategori = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/rekapitulasi/kategori`);
    listKategori.value = res.data.data || res.data;
  } catch (e) { console.error(e); }
};
const getDivisi = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/rekapitulasi/divisi`, { params: { empid: empid() } });
    listDivisi.value = res.data.data || res.data;
  } catch (e) { console.error(e); }
};

onMounted(() => { getDomains(); getLokasiArsip(); getKategori(); getDivisi(); });
</script>

