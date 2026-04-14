<template>
  <div class="tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-3 tw-bg-blue-50 tw-shadow-sm">
    <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
      <q-icon name="business" color="blue-6" size="20px"/>
      <span class="tw-font-bold tw-text-blue-900 tw-text-sm">Filter Bisnis Unit</span>
    </div>
    <q-select
      outlined
      :model-value="modelValue"
      use-input
      emit-value
      map-options
      input-debounce="0"
      :rules="rules"
      :options="filteredDomains"
      option-value="bu_id"
      @filter="filterDomains"
      @update:model-value="$emit('update:modelValue', $event)"
      label-slot
      class="tw-rounded-lg tw-bg-white"
      dense
    >
      <template v-slot:label>
        <span class="tw-font-semibold tw-text-slate-700">Pilih Bisnis Unit</span>
        <span v-if="required" class="tw-text-red-500 tw-font-bold">*</span>
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

const domains = ref([]);
const filteredDomains = ref([]);

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

onMounted(() => {
  getDomains();
});
</script>

