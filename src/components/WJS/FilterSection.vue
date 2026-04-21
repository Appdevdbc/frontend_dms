<template>
  <div class="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4 tw-bg-blue-50 tw-shadow-sm">
    <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
      <q-icon name="filter_alt" color="blue-6" size="24px"/>
      <span class="tw-font-bold tw-text-blue-900 tw-text-base">Filter Data</span>
    </div>
    <div class="tw-space-y-3">
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
            <q-icon name="business" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Bisnis Unit</span>
          </div>
          <q-select
            outlined
            dense
            :model-value="filterBu"
            use-input
            emit-value
            map-options
            input-debounce="0"
            :options="filteredDomains"
            option-value="bu_id"
            @filter="filterDomains"
            @update:model-value="$emit('update:filterBu', $event)"
            clearable
            class="tw-rounded-lg tw-bg-white"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Pilih Bisnis Unit</span>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>({{ scope.opt.bu_id }}) {{ scope.opt.bu_name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <span>({{ scope.opt.bu_id }}) {{ scope.opt.bu_name }}</span>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
            <q-icon name="location_on" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Lokasi Arsip</span>
          </div>
          <q-select
            outlined
            dense
            :model-value="filterLokasiArsip"
            :options="listLokasiArsip"
            option-value="lokasi_arsip_id"
            option-label="lokasi_arsip_name"
            emit-value
            map-options
            clearable
            @update:model-value="$emit('update:filterLokasiArsip', $event)"
            class="tw-bg-white tw-rounded-lg"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Pilih Lokasi Arsip</span>
            </template>
          </q-select>
        </div>
      </div>
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
            <q-icon name="event" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Tanggal Awal</span>
          </div>
          <q-input
            outlined
            dense
            :model-value="filterTglAwal"
            type="date"
            @update:model-value="$emit('update:filterTglAwal', $event)"
            class="tw-bg-white tw-rounded-lg"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Tanggal Awal</span>
            </template>
          </q-input>
        </div>
        <div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
            <q-icon name="event" color="blue-6" size="18px"/>
            <span class="tw-font-semibold tw-text-blue-900 tw-text-xs">Tanggal Akhir</span>
          </div>
          <q-input
            outlined
            dense
            :model-value="filterTglAkhir"
            type="date"
            @update:model-value="$emit('update:filterTglAkhir', $event)"
            class="tw-bg-white tw-rounded-lg"
          >
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Tanggal Akhir</span>
            </template>
          </q-input>
        </div>
      </div>
      <div class="tw-flex tw-gap-3 tw-pt-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  filterBu: {
    type: [String, Number],
    default: null
  },
  filterLokasiArsip: {
    type: [String, Number],
    default: null
  },
  filterTglAwal: {
    type: String,
    default: null
  },
  filterTglAkhir: {
    type: String,
    default: null
  }
});

defineEmits(['update:filterBu', 'update:filterLokasiArsip', 'update:filterTglAwal', 'update:filterTglAkhir']);

const domains = ref([]);
const filteredDomains = ref([]);
const listLokasiArsip = ref([]);

const getDomains = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}domains`, {
      skipErrorInterceptor: true
    });
    domains.value = res.data;
    filteredDomains.value = res.data;
  } catch (error) {
    console.error('getDomains error:', error);
  }
};

const filterDomains = (val, update) => {
  update(() => {
    if (val === '') {
      filteredDomains.value = domains.value;
    } else {
      const needle = val.toLowerCase();
      filteredDomains.value = domains.value.filter(v => 
        v.bu_id.toLowerCase().indexOf(needle) > -1 || 
        v.bu_name.toLowerCase().indexOf(needle) > -1
      );
    }
  });
};

const getLokasiArsip = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/listLokasiArsip`, {
      params: { rowsPerPage: null },
      skipErrorInterceptor: true
    });
    listLokasiArsip.value = res.data;
  } catch (error) {
    console.error('getLokasiArsip error:', error);
  }
};

onMounted(() => {
  getDomains();
  getLokasiArsip();
});
</script>

