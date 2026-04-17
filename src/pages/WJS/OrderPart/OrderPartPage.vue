<template>
  <div class="q-pa-md tw-space-y-4">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon :name="sectionIcon" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">{{ sectionLabel }}</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Transaksi</span>
              <q-icon name="chevron_right" size="14px" />
              <span>{{ sectionLabel }}</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Form Input -->
      <q-card-section class="tw-bg-white tw-p-6">
        <!-- Alert needs_last_type -->
        <q-banner v-if="needsLastType" class="tw-bg-red-50 tw-border tw-border-red-300 tw-rounded-xl tw-mb-4" rounded>
          <template #avatar><q-icon name="warning" color="red-6" /></template>
          <span class="tw-text-red-700 tw-font-semibold">
            Mohon dilakukan Postpone / Finish dan input Tipe Proses &amp; Alasan
          </span>
          <div class="tw-mt-2 tw-text-sm tw-text-red-600">
            No. SPK: <b>{{ others.id_spk }}</b> &nbsp;|&nbsp; PIC: <b>{{ others.opt_name }}</b>
          </div>
        </q-banner>

        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
          <q-input
            v-model="form.pic"
            outlined dense label="ID Card *"
            placeholder="Scan / ketik ID Card"
            :readonly="needsLastType"
            @keyup.enter="focusSpk"
            ref="refPic"
          />
          <q-input
            v-model="form.id_spk"
            outlined dense label="No SPK *"
            placeholder="Scan / ketik No SPK"
            :readonly="needsLastType"
            @keyup.enter="focusJobType"
            ref="refSpk"
          />
          <q-select
            v-model="form.id_job"
            :options="jobTypeOptions"
            outlined dense label="Job Type *"
            emit-value map-options
            :readonly="needsLastType"
            ref="refJobType"
          />
        </div>

        <!-- Last Type fields — muncul saat needs_last_type -->
        <div v-if="needsLastType" class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mt-4">
          <q-select
            v-model="form.last_type"
            :options="lastTypeOptions"
            outlined dense label="Tipe Process *"
            emit-value map-options
          />
          <q-select
            v-model="form.last_reason"
            :options="lastReasonOptions"
            outlined dense label="Alasan *"
            emit-value map-options
          />
          <q-select
            v-model="form.last_moment"
            :options="lastMomentOptions"
            outlined dense label="Waktu *"
            emit-value map-options
          />
        </div>

        <!-- Action buttons -->
        <div class="tw-flex tw-gap-3 tw-mt-5 tw-flex-wrap">
          <q-btn
            unelevated color="green-7" icon="play_arrow" label="Start"
            :loading="submitting === 'start'"
            class="tw-font-semibold tw-px-5 tw-rounded-lg"
            @click="onAction('start')"
          />
          <q-btn
            unelevated color="orange-7" icon="pause" label="Postpone"
            :loading="submitting === 'postpone'"
            class="tw-font-semibold tw-px-5 tw-rounded-lg"
            @click="onAction('postpone')"
          />
          <q-btn
            unelevated color="blue-7" icon="check_circle" label="Finish"
            :loading="submitting === 'finish'"
            class="tw-font-semibold tw-px-5 tw-rounded-lg"
            @click="onAction('finish')"
          />
          <q-btn
            v-if="needsLastType"
            flat color="grey-7" icon="refresh" label="Reset"
            class="tw-font-semibold tw-px-5 tw-rounded-lg"
            @click="resetForm"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabel Daftar SPK -->
    <q-card class="tw-shadow-md tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`bg-${domain()} tw-py-3 tw-px-5`">
        <div class="tw-text-white tw-font-bold tw-text-sm">Daftar SPK — {{ sectionLabel }}</div>
      </q-card-section>
      <q-card-section class="tw-p-4">
        <q-table
          :rows="scanList"
          :columns="columns"
          row-key="id"
          :loading="loadingList"
          flat
          class="tw-rounded-xl tw-overflow-hidden"
          :rows-per-page-options="[10, 25, 50]"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-py-3`">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-3 tw-text-slate-700 tw-text-sm">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="tw-py-3">
              <q-badge
                :color="props.value === 'Finish' ? 'green' : props.value === 'Postpone' ? 'orange' : 'blue'"
                :label="props.value"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import { domain } from "../../../utils";
import { useNotify } from "../../../composables/useNotify";

const props = defineProps({
  section: { type: String, default: "order_part" },
});

const { error, success } = useNotify();
const route = useRoute();

// Gunakan prop atau query param
const activeSection = computed(() => props.section || route.query.section || "order_part");

const sectionMeta = {
  order_part:       { label: "Order Part",       icon: "inventory_2" },
  bongkar_analisis: { label: "Bongkar Analisis",  icon: "build" },
  drawing:          { label: "Drawing",           icon: "draw" },
  assy:             { label: "Assembly",          icon: "settings" },
  trial:            { label: "Trial",             icon: "science" },
};

const sectionLabel = computed(() => sectionMeta[activeSection.value]?.label ?? activeSection.value);
const sectionIcon  = computed(() => sectionMeta[activeSection.value]?.icon ?? "assignment");

// ─── Form state ───────────────────────────────────────────────────────────────
const form = ref({ pic: "", id_spk: "", id_job: null, last_type: null, last_reason: null, last_moment: null });
const needsLastType = ref(false);
const others = ref({ id_spk: "", opt_name: "" });
const submitting = ref(null);

// ─── Options ──────────────────────────────────────────────────────────────────
const jobTypeOptions = ref([]);
const lastTypeOptions   = ["Postpone", "Finish"].map((v) => ({ label: v, value: v }));
const lastReasonOptions = ["Kendala Sistem", "Lupa Finish"].map((v) => ({ label: v, value: v }));
const lastMomentOptions = [
  { label: "Normal (17.00)", value: "Normal" },
  { label: "Lembur (20.30)", value: "Lembur" },
];

// ─── Table ────────────────────────────────────────────────────────────────────
const scanList   = ref([]);
const loadingList = ref(false);

const columns = [
  { name: "id_spk",    label: "No SPK",     field: "id_spk",    align: "left",   sortable: true },
  { name: "nama_pic",  label: "PIC",         field: (r) => `${r.nama_pic} - ${r.pic}`, align: "left" },
  { name: "start",     label: "Start",       field: "start",     align: "center", sortable: true },
  { name: "finish",    label: "Finish",      field: "finish",    align: "center", sortable: true },
  { name: "jamTotal",  label: "Total Jam",   field: "jamTotal",  align: "center" },
  { name: "status",    label: "Status",      field: "status",    align: "center" },
];

// ─── Refs ─────────────────────────────────────────────────────────────────────
const refPic     = ref(null);
const refSpk     = ref(null);
const refJobType = ref(null);

const focusSpk     = () => refSpk.value?.focus();
const focusJobType = () => refJobType.value?.focus();

// ─── Load data ────────────────────────────────────────────────────────────────
const loadJobTypes = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/orderPart/job-types`);
    jobTypeOptions.value = (res.data ?? []).map((j) => ({ label: j.nama_job, value: j.id_job }));
  } catch (e) { /* silent */ }
};

const loadList = async () => {
  loadingList.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/orderPart/list`, {
      params: { section: activeSection.value },
    });
    scanList.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    error("Gagal memuat daftar SPK");
  } finally {
    loadingList.value = false;
  }
};

// ─── Actions ──────────────────────────────────────────────────────────────────
const onAction = async (action) => {
  if (!form.value.pic || !form.value.id_spk || !form.value.id_job)
    return error("ID Card, No SPK, dan Job Type wajib diisi");

  submitting.value = action;
  try {
    await axios.post(`${import.meta.env.VITE_API}dms/orderPart/store`, {
      ...form.value,
      section: activeSection.value,
      action,
    });
    success(`SPK ${action === "start" ? "dimulai" : action === "postpone" ? "postpone" : "finish"}`);
    needsLastType.value = false;
    resetForm();
    loadList();
  } catch (e) {
    const data = e.response?.data;
    if (data?.type === "needs_last_type") {
      needsLastType.value = true;
      others.value = data.others ?? {};
      error(data.message);
    } else {
      error(data?.message ?? "Terjadi kesalahan");
    }
  } finally {
    submitting.value = null;
  }
};

const resetForm = () => {
  form.value = { pic: "", id_spk: "", id_job: null, last_type: null, last_reason: null, last_moment: null };
  needsLastType.value = false;
  others.value = { id_spk: "", opt_name: "" };
};

onMounted(() => {
  loadJobTypes();
  loadList();
});
</script>
