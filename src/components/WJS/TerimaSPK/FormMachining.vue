<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 640px; max-width: 800px">
      <q-card-section class="text-h6 tw-font-bold">
        {{ data ? "Edit Machining Proses" : "Tambah Machining Proses" }}
      </q-card-section>
      <q-separator />

      <q-card-section class="tw-space-y-4">
        <!-- Part -->
        <q-select
          v-model="form.id_part"
          :options="partOptions"
          label="Part *"
          outlined dense emit-value map-options
          use-input input-debounce="300"
          @filter="filterPart"
          :rules="[v => !!v || 'Wajib diisi']"
        />

        <!-- Template -->
        <div class="tw-flex tw-items-center tw-gap-2">
          <q-select
            v-model="selectedTemplate"
            :options="templateOptions"
            label="Load dari Template"
            outlined dense emit-value map-options
            clearable
            class="tw-flex-1"
            @update:model-value="onLoadTemplate"
          />
        </div>

        <!-- Drag & Drop Proses -->
        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <!-- Tersedia -->
          <div>
            <div class="tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-600">Proses Tersedia</div>
            <div class="tw-border tw-rounded-lg tw-min-h-40 tw-p-2 tw-space-y-1 tw-bg-gray-50">
              <div
                v-for="p in availableProses"
                :key="p.id_proses"
                class="tw-flex tw-items-center tw-justify-between tw-bg-white tw-border tw-rounded tw-px-3 tw-py-1 tw-text-sm tw-cursor-pointer hover:tw-bg-blue-50"
                @click="addProses(p)"
              >
                <span>{{ p.nama }}</span>
                <q-icon name="arrow_forward" size="xs" color="primary" />
              </div>
            </div>
          </div>

          <!-- Dipilih -->
          <div>
            <div class="tw-text-sm tw-font-semibold tw-mb-2 tw-text-gray-600">Urutan Proses Dipilih</div>
            <div class="tw-border tw-rounded-lg tw-min-h-40 tw-p-2 tw-space-y-1 tw-bg-gray-50">
              <div
                v-for="(p, idx) in selectedProses"
                :key="p.id_proses"
                class="tw-flex tw-items-center tw-justify-between tw-bg-white tw-border tw-rounded tw-px-3 tw-py-1 tw-text-sm"
              >
                <span class="tw-text-gray-500 tw-mr-2">{{ idx + 1 }}.</span>
                <span class="tw-flex-1">{{ p.nama }}</span>
                <q-btn flat round dense icon="close" size="xs" color="negative" @click="removeProses(idx)" />
              </div>
            </div>
          </div>
        </div>

        <!-- Simpan sebagai template -->
        <q-checkbox v-model="form.saveTemplate" true-value="Y" false-value="N" label="Simpan sebagai Template" />
      </q-card-section>

      <q-card-actions align="right" class="tw-px-4 tw-pb-4">
        <q-btn flat label="Batal" @click="$emit('update:modelValue', false)" />
        <q-btn color="primary" label="Simpan" :loading="saving" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import axios from "axios";
import { empid } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({
  modelValue: Boolean,
  data: { type: Object, default: null },
  idSpk: { type: [String, Number], default: null },
});
const emit = defineEmits(["update:modelValue", "done"]);

const { error, success } = useNotify();
const saving = ref(false);
const allProses = ref([]);
const availableProses = ref([]);
const selectedProses = ref([]);
const partOptions = ref([]);
const partAll = ref([]);
const templateOptions = ref([]);
const selectedTemplate = ref(null);

const form = reactive({ id_part: null, saveTemplate: "N" });

const loadMaster = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/terimaSPK/machining/master`);
    allProses.value = res.data.proses ?? [];
    partAll.value = (res.data.parts ?? []).map((p) => ({ label: p.nama_part, value: p.id_part }));
    partOptions.value = partAll.value;
    templateOptions.value = (res.data.templates ?? []).map((t) => ({
      label: `Template #${t.id_template}`, value: t.id_template,
    }));
  } catch (e) { /* silent */ }
};

const filterPart = (val, update) => {
  update(() => {
    partOptions.value = val
      ? partAll.value.filter((p) => p.label.toLowerCase().includes(val.toLowerCase()))
      : partAll.value;
  });
};

const syncAvailable = () => {
  const selectedIds = selectedProses.value.map((p) => p.id_proses);
  availableProses.value = allProses.value.filter((p) => !selectedIds.includes(p.id_proses));
};

const addProses = (p) => {
  selectedProses.value.push(p);
  syncAvailable();
};

const removeProses = (idx) => {
  selectedProses.value.splice(idx, 1);
  syncAvailable();
};

const onLoadTemplate = async (id) => {
  if (!id) return;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/terimaSPK/machining/template`, {
      params: { id_template: id },
    });
    selectedProses.value = res.data.selectedProses ?? [];
    syncAvailable();
  } catch (e) {
    error("Gagal memuat template");
  }
};

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedTemplate.value = null;
    form.saveTemplate = "N";
    if (props.data) {
      form.id_part = props.data.id_part;
      const prosesIds = props.data.proses ? props.data.proses.split(",").filter(Boolean) : [];
      selectedProses.value = allProses.value.filter((p) => prosesIds.includes(String(p.id_proses)));
    } else {
      form.id_part = null;
      selectedProses.value = [];
    }
    syncAvailable();
  }
});

const onSubmit = async () => {
  if (!form.id_part) return error("Pilih part terlebih dahulu");
  if (!selectedProses.value.length) return error("Pilih minimal satu proses");

  saving.value = true;
  const prosesStr = selectedProses.value.map((p) => p.id_proses).join(",");
  try {
    const payload = { ...form, proses: prosesStr, creator: empid() };
    if (props.data) {
      await axios.put(`${import.meta.env.VITE_API}dms/terimaSPK/machining/update/${props.data.id_spkpart}`, payload);
    } else {
      await axios.post(`${import.meta.env.VITE_API}dms/terimaSPK/machining/create`, {
        ...payload, id_spk: props.idSpk,
      });
    }
    success("Machining proses berhasil disimpan");
    emit("done");
  } catch (e) {
    error("Gagal menyimpan machining proses");
  } finally {
    saving.value = false;
  }
};

onMounted(() => loadMaster());
</script>
