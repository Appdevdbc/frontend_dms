<template>
  <q-dialog
    v-model="show"
    transition-show="slide-up"
    transition-hide="slide-down"
    persistent
    maximized
  >
    <q-card class="tw-w-full">
      <!-- Header -->
      <q-card-section :class="`bg-${domain()}`">
        <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
          <q-icon :name="props.isView ? 'visibility' : 'edit_note'" size="32px"/>
          {{ props.isView ? 'View' : (isEdit ? 'Edit' : 'Tambah') }} Master Approval
        </div>
      </q-card-section>

      <q-separator/>

      <!-- Form Content -->
      <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
        <div class="row q-col-gutter-md">
          <!-- Required Fields Banner -->
          <div class="col-12">
            <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
              <template v-slot:avatar>
                <q-icon name="info" color="red" size="24px"/>
              </template>
              <span class="tw-text-red-700 tw-font-medium">
                Field bertanda bintang (*) wajib diisi
              </span>
            </q-banner>
          </div>

          <!-- Business Unit -->
          <div class="col-md-4 col-12">
            <q-select
              v-model="form.app_bu_id"
              :options="businessUnits"
              option-value="bu_id"
              label-slot
              outlined
              dense
              emit-value
              map-options
              :disable="props.isView"
              :rules="[val => !!val || 'Business Unit wajib diisi']"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="blue-6"/>
              </template>
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">Business Unit</span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
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
            </q-select>
          </div>

          <!-- Transaction Type -->
          <div class="col-md-4 col-12">
            <q-select
              v-model="form.app_jns_trans"
              :options="transactionTypes"
              use-input
              emit-value
              map-options
              input-debounce="0"
              option-value="app_jns_id"
              option-label="app_jns_desc"
              @filter="filterJenisApprovalOptions"
              clearable
              label-slot
              outlined
              dense
              :disable="props.isView"
              :rules="[val => !!val || 'Jenis Transaksi wajib diisi']"
            >
              <template v-slot:prepend>
                <q-icon name="approval" color="blue-6"/>
              </template>
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">Jenis Transaksi</span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Priority -->
          <div class="col-md-4 col-12">
            <q-input
              v-model="form.app_prioritas"
              label-slot
              outlined
              dense
              :readonly="props.isView"
              :rules="[val => !!val || 'Prioritas wajib diisi']"
              @update:model-value="handlePrioritasInput"
              @keypress="onlyNumber"
            >
              <template v-slot:prepend>
                <q-icon name="priority_high" color="blue-6"/>
              </template>
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">Prioritas</span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </template>
            </q-input>
          </div>

          <!-- Approval Bag 1 -->
          <div class="col-12">
            <q-separator class="tw-my-4"/>
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="looks_one" color="blue-6" size="24px"/>
              Approval Bag #1
            </div>
            <ApprovalBagSection
              v-model="form.bag1"
              :users="users"
              :bag-number="1"
              :on-filter-users="filterUserOptions"
              :is-view="props.isView"
            />
          </div>

          <!-- Approval Bag 2 -->
          <div class="col-12">
            <q-separator class="tw-my-4"/>
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="looks_two" color="blue-6" size="24px"/>
              Approval Bag #2
            </div>
            <ApprovalBagSection
              v-model="form.bag2"
              :users="users"
              :bag-number="2"
              :on-filter-users="filterUserOptions"
              :is-view="props.isView"
            />
          </div>

          <!-- Approval Bag 3 -->
          <div class="col-12">
            <q-separator class="tw-my-4"/>
            <div class="text-h6 tw-text-slate-700 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <q-icon name="looks_3" color="blue-6" size="24px"/>
              Approval Bag #3
            </div>
            <ApprovalBagSection
              v-model="form.bag3"
              :users="users"
              :bag-number="3"
              :on-filter-users="filterUserOptions"
              :is-view="props.isView"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator class="tw-bg-slate-200"/>

      <!-- Actions -->
      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn
          :label="props.isView ? 'Tutup' : 'Batal'"
          color="red-7"
          push
          icon="close"
          class="tw-px-6 tw-font-semibold tw-rounded-lg"
          @click="closeDialog"
        />
        <q-btn
          v-if="!props.isView"
          label="Simpan"
          color="blue-6"
          push
          icon="save"
          class="tw-px-6 tw-font-semibold tw-rounded-lg"
          @click="saveApproval"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { domain, spinnerBall, empid } from '../../../utils';
import { useNumeral } from '../../../helpers/useNumeral';
import { useNotify } from '../../../composables/useNotify';
import ApprovalBagSection from './ApprovalBagSection.vue';
import axios from 'axios';
import * as yup from 'yup';

const { formatInteger, unformatNumber, onlyNumber } = useNumeral();
const { success, error: showError } = useNotify();

const props = defineProps({
  modelValue: Boolean,
  approvalData: Object,
  isEdit: Boolean,
  isView: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const $q = useQuasar();

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const form = ref({
  app_bu_id: null,
  app_jns_trans: null,
  app_prioritas: null,
  bag1: {
    type: null,
    levels: []
  },
  bag2: {
    type: null,
    levels: []
  },
  bag3: {
    type: null,
    levels: []
  }
});

const businessUnits = ref([]);
const transactionTypes = ref([]);
const users = ref([]);

const tmpUser = reactive({
  code: null,
  needle: null,
  limit: 100,
});

const tmpJenisApproval = reactive({
  code: null,
  needle: null,
  limit: 100,
});

const schema = yup.object({
  app_bu_id: yup.string().required('Business Unit wajib diisi').nullable(),
  app_jns_trans: yup.string().required('Jenis Transaksi wajib diisi').nullable(),
  app_prioritas: yup.string().required('Prioritas wajib diisi').nullable()
});

const loadDropdownData = async () => {
  try {
    spinnerBall();
    const buRes = await axios.get(`${import.meta.env.VITE_API}domains`, {
      skipErrorInterceptor: true
    });
    
    businessUnits.value = buRes.data;
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    showError('Gagal memuat data');
  }
};

const getListJenisApproval = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}dms/listJenisApproval`, {
      params: {
        ...tmpJenisApproval,
      },
      skipErrorInterceptor: true
    });
    transactionTypes.value = res.data;
  } catch (error) {
    console.error('getListJenisApproval error:', error);
  }
};

const getListUser = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}users`, {
      params: {
        ...tmpUser,
      },
      skipErrorInterceptor: true
    });
    users.value = res.data;
  } catch (error) {
    console.error('getListUser error:', error);
  }
};

const filterUserOptions = async (val, update) => {
  if (val === '') {
    update(() => {
      tmpUser.needle = null;
      tmpUser.code = null;
      getListUser();
    })
  } else {
    update(() => {
      tmpUser.needle = val.toLowerCase();
      getListUser();
    })
  }
};

const filterJenisApprovalOptions = async (val, update) => {
  if (val === '') {
    update(() => {
      tmpJenisApproval.needle = null;
      tmpJenisApproval.code = null;
      getListJenisApproval();
    })
  } else {
    update(() => {
      tmpJenisApproval.needle = val.toLowerCase();
      getListJenisApproval();
    })
  }
};

const handlePrioritasInput = (val) => {
  const numericValue = unformatNumber(val);
  if (numericValue !== null) {
    form.value.app_prioritas = formatInteger(numericValue);
  }
};

const loadApprovalData = async () => {
  if (props.isEdit && props.approvalData) {
    try {
      spinnerBall();
      const res = await axios.get(
        `${import.meta.env.VITE_API}dms/approvals/${props.approvalData.app_id}`,
        { skipErrorInterceptor: true }
      );
      const data = res.data.data;
      
      tmpJenisApproval.code = parseInt(data.app_jns_trans);
      
      // Collect all unique user codes from all bags
      const userCodes = [];
      [data.bag1, data.bag2, data.bag3].forEach(bag => {
        if (bag && bag.levels) {
          bag.levels.forEach(level => {
            if (level.emp_id && !userCodes.includes(level.emp_id)) {
              userCodes.push(level.emp_id);
            }
          });
        }
      });
      
      // Load users one by one
      const loadedUsers = [];
      if (userCodes.length > 0) {
        for (const code of userCodes) {
          try {
            const userRes = await axios.get(`${import.meta.env.VITE_API}users`, {
              params: { code, limit: 1 },
              skipErrorInterceptor: true
            });
            if (userRes.data && userRes.data.length > 0) {
              // Add combined field if it doesn't exist
              const users = userRes.data.map(u => ({
                ...u,
                combined: u.combined || `${u.account_nik}|${u.account_username}`
              }));
              loadedUsers.push(...users);
            }
          } catch (err) {
            console.error('Error loading user:', code, err);
          }
        }
      }
      
      users.value = loadedUsers;
      await getListJenisApproval();
      
      // Transform levels to include combined field
      const transformLevels = (levels) => {
        const transformed = Array(5).fill(null).map(() => ({
          nik: null,
          emp_id: null,
          description: null,
          combined: null
        }));
        
        if (levels && levels.length > 0) {
          levels.forEach((level, index) => {
            if (index < 5 && level.emp_id) {
              const user = loadedUsers.find(u => u.account_username === level.emp_id);
              transformed[index] = {
                nik: level.nik,
                emp_id: level.emp_id,
                description: level.description,
                combined: user ? user.combined : null
              };
            }
          });
        }
        
        return transformed;
      };
      
      form.value = {
        ...data,
        app_jns_trans: parseInt(data.app_jns_trans),
        app_prioritas: formatInteger(data.app_prioritas),
        bag1: data.bag1 ? {
          type: data.bag1.type ? parseInt(data.bag1.type) : null,
          levels: transformLevels(data.bag1.levels)
        } : { type: null, levels: transformLevels([]) },
        bag2: data.bag2 ? {
          type: data.bag2.type ? parseInt(data.bag2.type) : null,
          levels: transformLevels(data.bag2.levels)
        } : { type: null, levels: transformLevels([]) },
        bag3: data.bag3 ? {
          type: data.bag3.type ? parseInt(data.bag3.type) : null,
          levels: transformLevels(data.bag3.levels)
        } : { type: null, levels: transformLevels([]) }
      };
      $q.loading.hide();
    } catch (err) {
      $q.loading.hide();
      showError('Gagal memuat data approval');
    }
  }
};

const resetForm = () => {
  form.value = {
    app_bu_id: null,
    app_jns_trans: null,
    app_prioritas: null,
    bag1: {
      type: null,
      levels: Array(5).fill(null).map(() => ({
        nik: null,
        emp_id: null,
        description: null,
        combined: null
      }))
    },
    bag2: {
      type: null,
      levels: Array(5).fill(null).map(() => ({
        nik: null,
        emp_id: null,
        description: null,
        combined: null
      }))
    },
    bag3: {
      type: null,
      levels: Array(5).fill(null).map(() => ({
        nik: null,
        emp_id: null,
        description: null,
        combined: null
      }))
    }
  };
};

const saveApproval = async () => {
  try {
    await schema.validate(form.value, { abortEarly: false });
    
    $q.dialog({
      title: 'Konfirmasi',
      message: 'Apakah data sudah sesuai?',
      html: true,
      class: `side-${domain()} tw-rounded-2xl`,
      style: 'border-radius: 16px;',
      ok: {
        push: true,
        color: 'blue-6',
        label: 'Ya, Simpan',
        icon: 'check_circle',
        class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
      },
      cancel: {
        push: true,
        color: 'red-7',
        label: 'Batal',
        icon: 'cancel',
        class: 'tw-font-semibold tw-px-6 tw-rounded-lg'
      },
      persistent: true
    }).onOk(async () => {
      try {
        spinnerBall();
        
        const payload = {
          ...form.value,
          app_prioritas: unformatNumber(form.value.app_prioritas),
          creator: empid()
        };
        
        if (props.isEdit) {
          await axios.put(
            `${import.meta.env.VITE_API}dms/approvals/${props.approvalData.app_id}`,
            payload,
            { skipErrorInterceptor: true }
          );
          success('Master approval berhasil diubah');
        } else {
          await axios.post(
            `${import.meta.env.VITE_API}dms/approvals`,
            payload,
            { skipErrorInterceptor: true }
          );
          success('Master approval berhasil ditambahkan');
        }
        
        $q.loading.hide();
        emit('saved');
      } catch (err) {
        $q.loading.hide();
        showError(err?.response?.data?.message || err?.message || 'Gagal menyimpan data');
      }
    });
  } catch (err) {
    if (err.inner) {
      err.inner.forEach(e => {
        showError(e.message);
      });
    }
  }
};

const closeDialog = () => {
  show.value = false;
};

watch(() => props.modelValue, async (val) => {
  if (val) {
    loadDropdownData();
    getListUser();
    if (props.isEdit || props.isView) {
      await loadApprovalData();
    } else {
      getListJenisApproval();
      resetForm();
    }
  }
});
</script>

