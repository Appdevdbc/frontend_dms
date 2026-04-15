<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="tw-flex tw-items-center tw-gap-3 bg-primary text-white">
        <q-icon name="info" size="24px" />
        <span class="text-h6 tw-font-bold">Detail Status — SPK {{ spk?.id_spk }}</span>
        <q-space />
        <q-btn flat round icon="close" @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-card-section class="tw-p-4">
        <q-table
          :rows="rows"
          :columns="columns"
          :loading="loading"
          row-key="pic"
          flat bordered
          hide-pagination
          :rows-per-page-options="[0]"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="statusColor(props.row.status)" :label="props.row.status" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({
  modelValue: Boolean,
  spk: { type: Object, default: null },
});
defineEmits(["update:modelValue"]);

const { error } = useNotify();
const rows = ref([]);
const loading = ref(false);

const columns = [
  { name: "nama_pic", label: "Nama PIC", field: "nama_pic", align: "left" },
  { name: "nama_mesin", label: "Mesin", field: "nama_mesin", align: "left" },
  { name: "jam", label: "Jam Kerja", field: "jam", align: "center" },
  { name: "status", label: "Status", field: "status", align: "center" },
];

const statusColor = (s) => {
  if (s === "Start") return "blue";
  if (s === "Finish") return "green";
  if (s === "Postpone") return "orange";
  return "grey";
};

const loadData = async () => {
  if (!props.spk?.id_spk) return;
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/terimaSPK/proses/detail-status`, {
      params: { no_spk: props.spk.id_spk },
    });
    rows.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    error("Gagal memuat detail status");
  } finally {
    loading.value = false;
  }
};

watch(() => props.modelValue, (val) => { if (val) loadData(); });
</script>
