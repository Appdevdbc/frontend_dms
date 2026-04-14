<template>
  <q-dialog
    v-model="show"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="tw-w-full tw-max-w-4xl tw-rounded-2xl">
      <!-- Header -->
      <q-card-section :class="`bg-${domain()}`">
        <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
          <q-icon name="visibility" size="32px"/>
          Detail Master Approval
        </div>
      </q-card-section>

      <q-separator/>

      <!-- Content -->
      <q-card-section class="tw-p-6" style="max-height: 70vh; overflow-y: auto;">
        <div class="tw-space-y-6">
          <!-- Basic Info -->
          <div class="tw-grid tw-grid-cols-3 tw-gap-4">
            <div>
              <div class="tw-text-sm tw-text-slate-500 tw-font-medium">Kode</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ approvalData?.app_kode || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-sm tw-text-slate-500 tw-font-medium">Business Unit</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ approvalData?.bu_name || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-sm tw-text-slate-500 tw-font-medium">Prioritas</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ approvalData?.app_prioritas || '-' }}</div>
            </div>
            <div class="tw-col-span-3">
              <div class="tw-text-sm tw-text-slate-500 tw-font-medium">Jenis Transaksi</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ approvalData?.app_jns_desc || '-' }}</div>
            </div>
          </div>

          <!-- Approval Bags -->
          <div v-for="bagNum in [1, 2, 3]" :key="bagNum" class="tw-space-y-2">
            <q-separator class="tw-my-4"/>
            <div class="tw-font-bold tw-text-lg tw-text-slate-700 tw-flex tw-items-center tw-gap-2">
              <q-icon :name="`looks_${bagNum === 1 ? 'one' : bagNum === 2 ? 'two' : '3'}`" color="blue-6" size="24px"/>
              Approval Bag #{{ bagNum }}
              <q-badge :color="getBagColor(bagNum)" class="tw-ml-2">
                {{ getBagType(bagNum) }}
              </q-badge>
            </div>
            
            <div v-if="hasLevels(bagNum)" class="tw-space-y-2">
              <div
                v-for="(level, index) in getLevels(bagNum)"
                :key="index"
                class="tw-flex tw-items-center tw-gap-4 tw-p-3 tw-bg-slate-50 tw-rounded-lg tw-border tw-border-slate-200"
              >
                <q-avatar color="blue-6" text-color="white" size="32px">
                  {{ level.level }}
                </q-avatar>
                <div class="tw-flex-1">
                  <div class="tw-font-semibold tw-text-slate-800">
                    {{ level.nik }} ({{ level.emp_id }})
                  </div>
                  <div class="tw-text-sm tw-text-slate-500">
                    {{ level.description || 'Tidak ada keterangan' }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="tw-text-slate-400 tw-italic tw-p-4 tw-bg-slate-50 tw-rounded-lg tw-text-center">
              Tidak ada approver
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator/>

      <!-- Actions -->
      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn
          label="Tutup"
          color="blue-6"
          push
          icon="close"
          class="tw-px-6 tw-font-semibold tw-rounded-lg"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { domain } from '../../../utils';

const props = defineProps({
  modelValue: Boolean,
  approvalData: Object
});

const emit = defineEmits(['update:modelValue']);

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const getBagType = (bagNum) => {
  const type = props.approvalData?.[`app_bag${bagNum}`];
  return type === 1 ? 'Arsiparis Lokasi' : 'Corporate Legal';
};

const getBagColor = (bagNum) => {
  const type = props.approvalData?.[`app_bag${bagNum}`];
  return type === 1 ? 'green-6' : 'blue-6';
};

const hasLevels = (bagNum) => {
  return getLevels(bagNum).length > 0;
};

const getLevels = (bagNum) => {
  const levels = [];
  for (let i = 1; i <= 5; i++) {
    const nik = props.approvalData?.[`app_bag${bagNum}_nik_id${i}`];
    const empId = props.approvalData?.[`app_bag${bagNum}_emp_id${i}`];
    const desc = props.approvalData?.[`app_bag${bagNum}_ket${i}`];
    
    if (nik || empId) {
      levels.push({
        level: i,
        nik: nik || '-',
        emp_id: empId || '-',
        description: desc
      });
    }
  }
  return levels;
};
</script>

