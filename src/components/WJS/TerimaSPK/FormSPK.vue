<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 480px; max-width: 600px">
      <q-card-section class="text-h6 tw-font-bold">
        {{ data ? "Edit SPK" : "Tambah SPK" }}
      </q-card-section>

      <q-separator />

      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-card-section class="tw-space-y-3">
          <q-input v-model="form.tanggal" type="date" label="Tanggal *" outlined dense :rules="[v => !!v || 'Tanggal wajib diisi']" />
          <q-select
            v-model="form.tipe"
            :options="tipeOptions"
            label="Tipe *"
            outlined dense emit-value map-options
            :rules="[v => !!v || 'Tipe wajib dipilih']"
          />
          <q-select
            v-model="form.jenis"
            :options="jenisOptions"
            label="Jenis *"
            outlined dense emit-value map-options
            :rules="[v => !!v || 'Jenis wajib dipilih']"
          />
          <q-input v-model="form.target_selesai" type="date" label="Target Selesai *" outlined dense :rules="[v => !!v || 'Target Selesai wajib diisi']" />
          <q-input v-model="form.subject" label="Subject *" outlined dense :rules="[v => !!v || 'Subject wajib diisi']" />
          <q-select
            v-model="form.id_dept"
            :options="deptOptions"
            label="Departemen *"
            outlined dense emit-value map-options
            use-input input-debounce="300"
            @filter="filterDept"
            :rules="[v => !!v || 'Departemen wajib dipilih']"
          />
        </q-card-section>

        <q-card-actions align="right" class="tw-px-4 tw-pb-4">
          <q-btn flat label="Batal" @click="$emit('update:modelValue', false)" />
          <q-btn color="primary" label="Simpan" :loading="saving" type="submit" />
        </q-card-actions>
      </q-form>
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
});
const emit = defineEmits(["update:modelValue", "done"]);

const { error, success } = useNotify();
const saving = ref(false);
const formRef = ref(null);
const deptOptions = ref([]);
const deptAll = ref([]);

const tipeOptions = [
  { label: "Normal", value: "normal" },
  { label: "Urgent", value: "urgent" },
];
const jenisOptions = [
  { label: "Repair", value: "repair" },
  { label: "General", value: "general" },
];

const form = reactive({
  tanggal: "", tipe: null, jenis: null,
  target_selesai: "", subject: "", id_dept: null,
});

const loadDept = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}listDepartments`);
    deptAll.value = (res.data ?? []).map((d) => ({
      label: d.nama_site ? `${d.nama_site} » ${d.nama}` : d.nama,
      value: d.id_dept,
    }));
    deptOptions.value = deptAll.value;
  } catch (e) { /* silent */ }
};

const filterDept = (val, update) => {
  update(() => {
    deptOptions.value = val
      ? deptAll.value.filter((d) => d.label.toLowerCase().includes(val.toLowerCase()))
      : deptAll.value;
  });
};

const resetForm = () => {
  form.tanggal = ""; form.tipe = null; form.jenis = null;
  form.target_selesai = ""; form.subject = ""; form.id_dept = null;
};

// Helper: ambil YYYY-MM-DD dari nilai tanggal apapun (ISO string, Date, dll)
const toDateInput = (val) => {
  if (!val) return "";
  // Jika sudah format YYYY-MM-DD, langsung pakai
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // Potong bagian T ke belakang (ISO timestamp)
  if (typeof val === "string" && val.includes("T")) return val.split("T")[0];
  // Fallback: parse via Date
  const d = new Date(val);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.data) {
      Object.assign(form, {
        tanggal:        toDateInput(props.data.tanggal),
        tipe:           props.data.tipe,
        jenis:          props.data.jenis,
        target_selesai: toDateInput(props.data.target_selesai),
        subject:        props.data.subject,
        id_dept:        props.data.id_dept,
      });
    } else {
      resetForm();
    }
  }
});

const onSubmit = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = { ...form, creator: empid() };
    if (props.data) {
      await axios.put(`${import.meta.env.VITE_API}wjs/terimaSPK/update/${props.data.id_spk}`, payload);
    } else {
      await axios.post(`${import.meta.env.VITE_API}wjs/terimaSPK/create`, payload);
    }
    success("SPK berhasil disimpan");
    emit("done");
  } catch (e) {
    error(e.response?.data?.message ?? "Gagal menyimpan SPK");
  } finally {
    saving.value = false;
  }
};

onMounted(() => loadDept());
</script>
