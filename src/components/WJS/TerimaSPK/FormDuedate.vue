<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 520px; max-width: 640px">
      <q-card-section class="text-h6 tw-font-bold">
        Due Date SPK {{ data?.id_spk }}
      </q-card-section>
      <q-separator />

      <q-card-section>
        <div class="tw-grid tw-grid-cols-2 tw-gap-3">
          <template v-for="field in fields">
            <q-input
              v-if="isVisible(field)"
              :key="field.key"
              v-model="form[field.key]"
              type="date"
              :label="field.label"
              outlined dense
            />
          </template>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="tw-px-4 tw-pb-4">
        <q-btn flat label="Batal" @click="$emit('update:modelValue', false)" />
        <q-btn color="primary" label="Simpan" :loading="saving" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import axios from "axios";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({
  modelValue: Boolean,
  data: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue", "done"]);

const { error, success } = useNotify();
const saving = ref(false);

const fields = [
  { key: "target_analisis_start",  label: "Analisis Mulai",    repair: true },
  { key: "target_analisis_finish", label: "Analisis Selesai",  repair: true },
  { key: "target_drawing_start",   label: "Drawing Mulai",     repair: true },
  { key: "target_drawing_finish",  label: "Drawing Selesai",   repair: true },
  { key: "target_order_start",     label: "Order Part Mulai",  repair: true },
  { key: "target_order_finish",    label: "Order Part Selesai",repair: true },
  { key: "target_machining_start", label: "Machining Mulai",   repair: false },
  { key: "target_machining_finish",label: "Machining Selesai", repair: false },
  { key: "target_assy_start",      label: "Assy Mulai",        repair: true },
  { key: "target_assy_finish",     label: "Assy Selesai",      repair: true },
  { key: "target_trial_start",     label: "Trial Mulai",       repair: true },
  { key: "target_trial_finish",    label: "Trial Selesai",     repair: true },
];

const form = reactive({});
fields.forEach((f) => (form[f.key] = ""));

// Sembunyikan field repair-only jika jenis = general
const isVisible = (field) => {
  if (!field.repair) return true;
  return props.data?.jenis === "repair";
};

watch(() => props.modelValue, async (val) => {
  if (val && props.data) {
    // Fetch due date data from API
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}wjs/terimaSPK/duedate/${props.data.id_spk}`);
      fields.forEach((f) => { 
        const dateValue = res.data[f.key];
        // Skip if null, empty, or 1900-01-01
        if (!dateValue || dateValue === '1900-01-01' || dateValue.startsWith('1900-01-01')) {
          form[f.key] = "";
        } else {
          form[f.key] = dateValue.split('T')[0];
        }
      });
    } catch (e) {
      // If error, use data from props (fallback)
      fields.forEach((f) => { 
        const dateValue = props.data[f.key];
        // Skip if null, empty, or 1900-01-01
        if (!dateValue || dateValue === '1900-01-01' || dateValue.startsWith('1900-01-01')) {
          form[f.key] = "";
        } else {
          form[f.key] = dateValue.split('T')[0];
        }
      });
    }
  }
});

const onSubmit = async () => {
  saving.value = true;
  try {
    await axios.put(`${import.meta.env.VITE_API}wjs/terimaSPK/duedate/${props.data.id_spk}`, form);
    success("Due date berhasil disimpan");
    emit("done");
    emit("update:modelValue", false);
  } catch (e) {
    error("Gagal menyimpan due date");
  } finally {
    saving.value = false;
  }
};
</script>
