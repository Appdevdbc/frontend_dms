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
      :options="filteredBisnisUnit"
      option-value="bu_id"
      @filter="filterBisnisUnit"
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

const bisnisUnits = ref([]);
const filteredBisnisUnit = ref([]);

const getBisnisUnits = async (needle = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}domains`, {
      skipErrorInterceptor: true
    });
    if (needle) {
      const searchNeedle = needle.toLowerCase();
      return res.data.filter(v => 
        v.bu_id.toLowerCase().indexOf(searchNeedle) > -1 || 
        v.bu_name.toLowerCase().indexOf(searchNeedle) > -1
      );
    }
    return res.data;
  } catch (error) {
    console.error('getBisnisUnits error:', error);
    return [];
  }
};

const filterBisnisUnit = async (val, update) => {
  if (val === '') {
    update(async () => {
      filteredBisnisUnit.value = await getBisnisUnits(null);
    });
  } else {
    update(async () => {
      filteredBisnisUnit.value = await getBisnisUnits(val.toLowerCase());
    });
  }
};

onMounted(async () => {
  filteredBisnisUnit.value = await getBisnisUnits(null);
  bisnisUnits.value = filteredBisnisUnit.value;
});
</script>

