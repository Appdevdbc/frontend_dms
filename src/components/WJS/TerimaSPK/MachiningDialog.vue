<template>
  <q-dialog :model-value="modelValue" persistent maximized transition-show="slide-up" transition-hide="slide-down"
    @update:model-value="$emit('update:modelValue', $event)">
    <q-card>
      <q-card-section class="tw-flex tw-items-center tw-gap-3 bg-primary text-white">
        <q-icon name="settings" size="24px" />
        <span class="text-h6 tw-font-bold">Machining Proses — SPK {{ spk?.id_spk }}</span>
        <q-space />
        <q-btn flat round icon="close" @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-card-section class="tw-p-4">
        <div class="tw-flex tw-justify-between tw-mb-4">
          <q-btn color="primary" icon="add" label="Tambah Proses" @click="onAdd" />
          <q-input v-model="filter" dense outlined debounce="300" label="Cari..." class="tw-w-56">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>

        <q-table
          :rows="rows"
          :columns="columns"
          :loading="loading"
          row-key="id_spkpart"
          flat bordered
        >
          <template #body-cell-proses_list="props">
            <q-td :props="props">
              <span class="tw-text-xs">{{ props.row.proses_list }}</span>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="tw-space-x-1">
              <q-btn flat round dense icon="edit" color="primary" size="sm" @click="onEdit(props.row)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="delete" color="negative" size="sm" @click="onDelete(props.row)">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Form Tambah/Edit Machining -->
    <FormMachining
      v-model="showForm"
      :data="selectedRow"
      :id-spk="spk?.id_spk"
      @done="onFormDone"
    />
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import { useNotify } from "../../../composables/useNotify";
import { useQuasar } from "quasar";
import FormMachining from "./FormMachining.vue";

const props = defineProps({
  modelValue: Boolean,
  spk: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue"]);

const { error, success } = useNotify();
const $q = useQuasar();

const rows = ref([]);
const loading = ref(false);
const filter = ref("");
const showForm = ref(false);
const selectedRow = ref(null);

const columns = [
  { name: "nama_part", label: "Part", field: "nama_part", align: "left", sortable: true },
  { name: "proses_list", label: "Urutan Proses", field: "proses_list", align: "left" },
  { name: "actions", label: "Aksi", field: "actions", align: "center" },
];

const loadData = async () => {
  if (!props.spk?.id_spk) return;
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/terimaSPK/machining/list`, {
      params: { id_spk: props.spk.id_spk, filter: filter.value || undefined },
    });
    rows.value = res.data.data ?? res.data;
  } catch (e) {
    error("Gagal memuat machining proses");
  } finally {
    loading.value = false;
  }
};

const onAdd = () => { selectedRow.value = null; showForm.value = true; };
const onEdit = (row) => { selectedRow.value = row; showForm.value = true; };
const onFormDone = () => { showForm.value = false; loadData(); };

const onDelete = (row) => {
  $q.dialog({
    title: "Hapus Machining",
    message: `Hapus proses untuk part ${row.nama_part}?`,
    cancel: true, persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}wjs/terimaSPK/machining/delete`, { id: row.id_spkpart });
      success("Machining proses berhasil dihapus");
      loadData();
    } catch (e) {
      error("Gagal menghapus machining proses");
    }
  });
};

watch(() => props.modelValue, (val) => { if (val) loadData(); });
watch(filter, () => loadData());
</script>
