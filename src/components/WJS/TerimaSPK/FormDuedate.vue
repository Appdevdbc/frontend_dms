<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 520px; max-width: 640px">
      <q-card-section class="text-h6 tw-font-bold">
        Due Date SPK {{ data?.id_spk }}
      </q-card-section>
      <q-separator />

      <q-card-section>
        <!-- Jenis Repair: Semua field -->
        <template v-if="data?.jenis === 'repair'">
          <!-- Bongkar Analisis -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Bongkar Analisis</div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_analisis_start"
                type="date"
                label="Mulai"
                outlined dense
              />
              <q-input
                v-model="form.target_analisis_finish"
                type="date"
                label="Selesai"
                outlined dense
              />
            </div>
          </div>

          <!-- Drawing -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Drawing</div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_drawing_start"
                type="date"
                label="Mulai"
                outlined dense
              />
              <q-input
                v-model="form.target_drawing_finish"
                type="date"
                label="Selesai"
                outlined dense
              />
            </div>
          </div>

          <!-- Order Part -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Order Part</div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_order_start"
                type="date"
                label="Mulai"
                outlined dense
              />
              <q-input
                v-model="form.target_order_finish"
                type="date"
                label="Selesai"
                outlined dense
              />
            </div>
          </div>

          <!-- Machining -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Machining <span class="tw-text-red-500">*</span></div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_machining_start"
                type="date"
                label="Mulai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
              <q-input
                v-model="form.target_machining_finish"
                type="date"
                label="Selesai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
            </div>
          </div>

          <!-- Assy -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Assy <span class="tw-text-red-500">*</span></div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_assy_start"
                type="date"
                label="Mulai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
              <q-input
                v-model="form.target_assy_finish"
                type="date"
                label="Selesai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
            </div>
          </div>

          <!-- Trial -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Trial <span class="tw-text-red-500">*</span></div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_trial_start"
                type="date"
                label="Mulai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
              <q-input
                v-model="form.target_trial_finish"
                type="date"
                label="Selesai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
            </div>
          </div>
        </template>

        <!-- Jenis General: Hanya Drawing & Machining -->
        <template v-else>
          <!-- Drawing -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Drawing <span class="tw-text-red-500">*</span></div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_drawing_start"
                type="date"
                label="Mulai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
              <q-input
                v-model="form.target_drawing_finish"
                type="date"
                label="Selesai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
            </div>
          </div>

          <!-- Machining -->
          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-mb-2">Machining <span class="tw-text-red-500">*</span></div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-3">
              <q-input
                v-model="form.target_machining_start"
                type="date"
                label="Mulai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
              <q-input
                v-model="form.target_machining_finish"
                type="date"
                label="Selesai"
                outlined dense
                :rules="[val => !!val || 'Wajib diisi']"
              />
            </div>
          </div>
        </template>
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
  { key: "target_analisis_start",  label: "Analisis Mulai" },
  { key: "target_analisis_finish", label: "Analisis Selesai" },
  { key: "target_drawing_start",   label: "Drawing Mulai" },
  { key: "target_drawing_finish",  label: "Drawing Selesai" },
  { key: "target_order_start",     label: "Order Part Mulai" },
  { key: "target_order_finish",    label: "Order Part Selesai" },
  { key: "target_machining_start", label: "Machining Mulai" },
  { key: "target_machining_finish",label: "Machining Selesai" },
  { key: "target_assy_start",      label: "Assy Mulai" },
  { key: "target_assy_finish",     label: "Assy Selesai" },
  { key: "target_trial_start",     label: "Trial Mulai" },
  { key: "target_trial_finish",    label: "Trial Selesai" },
];

const form = reactive({});
fields.forEach((f) => (form[f.key] = ""));

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
  // Validasi field required berdasarkan jenis SPK
  if (props.data?.jenis === "repair") {
    // Repair: Machining, Assy, Trial wajib diisi
    if (!form.target_machining_start || !form.target_machining_finish) {
      return error("Machining Mulai dan Selesai wajib diisi");
    }
    if (!form.target_assy_start || !form.target_assy_finish) {
      return error("Assy Mulai dan Selesai wajib diisi");
    }
    if (!form.target_trial_start || !form.target_trial_finish) {
      return error("Trial Mulai dan Selesai wajib diisi");
    }
  } else {
    // General: Drawing dan Machining wajib diisi
    if (!form.target_drawing_start || !form.target_drawing_finish) {
      return error("Drawing Mulai dan Selesai wajib diisi");
    }
    if (!form.target_machining_start || !form.target_machining_finish) {
      return error("Machining Mulai dan Selesai wajib diisi");
    }
  }

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
