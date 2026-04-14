<template>
  <div class="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-3 tw-bg-blue-50 tw-shadow-sm">
    <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
      <q-icon name="category" color="blue-6" size="20px"/>
      <span class="tw-font-bold tw-text-blue-900 tw-text-sm">Filter Sub Kategori Dokumen</span>
    </div>
    <q-select
      outlined
      :model-value="modelValue"
      use-input
      emit-value
      map-options
      input-debounce="0"
      :rules="rules"
      :options="filteredSubKatDoc"
      option-value="sub_arsip_categ"
      option-label="sub_arsip_categ"
      @filter="filterSubKatDoc"
      @update:model-value="$emit('update:modelValue', $event)"
      label-slot
      class="tw-rounded-lg tw-bg-white"
      dense
    >
      <template v-slot:label>
        <span class="tw-font-semibold tw-text-slate-700">Pilih Sub Kategori</span>
        <span v-if="required" class="tw-text-red-500 tw-font-bold">*</span>
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">No results</q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  required: {
    type: Boolean,
    default: true
  },
  rules: {
    type: Array,
    default: () => []
  }
});

defineEmits(['update:modelValue']);

const subKatDocs = ref([]);
const filteredSubKatDoc = ref([]);

const getSubKatDocs = async (needle = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listSubKategoriDokumen`, {
      params: {
        limit: 10,
        needle: needle
      },
      skipErrorInterceptor: true
    });
    return res.data;
  } catch (error) {
    console.error('getSubKatDocs error:', error);
    return [];
  }
};

const filterSubKatDoc = async (val, update) => {
  if (val === '') {
    update(async () => {
      filteredSubKatDoc.value = await getSubKatDocs(null);
    });
  } else {
    update(async () => {
      filteredSubKatDoc.value = await getSubKatDocs(val.toLowerCase());
    });
  }
};

onMounted(async () => {
  filteredSubKatDoc.value = await getSubKatDocs(null);
  subKatDocs.value = filteredSubKatDoc.value;
});
</script>

