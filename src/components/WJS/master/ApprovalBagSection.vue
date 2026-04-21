<template>
  <div class="tw-space-y-4">
    <!-- Bag Type Selection -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-select
          v-model="localBag.type"
          :options="bagTypes"
          use-input
          emit-value
          map-options
          input-debounce="0"
          option-value="app_type_id"
          option-label="app_type_desc"
          @filter="filterBagTypes"
          clearable
          label="Tipe Approver"
          outlined
          dense
          :disable="props.isView"
          @update:model-value="updateBag"
        >
          <template v-slot:prepend>
            <q-icon name="category" color="blue-6"/>
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Approval Levels (1-5) -->
    <q-expansion-item
      v-for="level in 5"
      :key="level"
      :label="`Level ${level}`"
      :caption="getLevelCaption(level)"
      icon="person"
      header-class="tw-bg-slate-100 tw-rounded-lg tw-mb-2"
      expand-icon-class="tw-text-blue-600"
    >
      <q-card flat bordered class="tw-mt-2">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- User Selection -->
            <div class="col-md-6 col-12">
              <q-select
                v-model="localBag.levels[level - 1].combined"
                :options="filteredUsers"
                emit-value
                map-options
                option-value="combined"
                :option-label="opt => opt ? `${opt.account_nik} - ${opt.account_name}` : ''"
                label="Pilih User"
                outlined
                dense
                clearable
                use-input
                input-debounce="300"
                :disable="props.isView"
                @filter="filterUsers"
                @update:model-value="(val) => onUserSelect(level - 1, val)"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Tidak ada hasil
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Description -->
            <div class="col-md-6 col-12">
              <q-input
                v-model="localBag.levels[level - 1].description"
                label="Keterangan"
                outlined
                dense
                placeholder="Contoh: Manager, Direktur, dll"
                :readonly="props.isView"
                @update:model-value="updateBag"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6"/>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  users: {
    type: Array,
    default: () => []
  },
  bagNumber: {
    type: Number,
    required: true
  },
  onFilterUsers: {
    type: Function,
    default: null
  },
  isView: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const localBag = ref({
  type: null,
  levels: []
});

const filteredUsers = ref([]);
const bagTypes = ref([]);
const bagTypesFull = ref([]);

// Load bag types from API
const loadBagTypes = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}wjs/listTypeApproval`, {
      params: { limit: 100 },
      skipErrorInterceptor: true
    });
    bagTypesFull.value = res.data;
    bagTypes.value = res.data;
    
    // Set first item as default if type is null
    if (localBag.value.type === null && res.data.length > 0) {
      localBag.value.type = res.data[0].app_type_id;
      updateBag();
    }
  } catch (error) {
    console.error('loadBagTypes error:', error);
  }
};

const filterBagTypes = (val, update) => {
  update(() => {
    if (val === '') {
      bagTypes.value = bagTypesFull.value;
    } else {
      const needle = val.toLowerCase();
      bagTypes.value = bagTypesFull.value.filter(v => 
        v.app_type_desc.toLowerCase().indexOf(needle) > -1
      );
    }
  })
};

// Initialize levels
const initializeLevels = () => {
  if (!localBag.value.levels || localBag.value.levels.length === 0) {
    localBag.value.levels = Array(5).fill(null).map(() => ({
      nik: null,
      emp_id: null,
      description: null,
      combined: null
    }));
  }
};

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localBag.value = JSON.parse(JSON.stringify(newVal));
    initializeLevels();
  }
}, { immediate: true, deep: true });

// Watch for users prop changes
watch(() => props.users, (newVal) => {
  filteredUsers.value = newVal || [];
}, { immediate: true });

const getLevelCaption = (level) => {
  const levelData = localBag.value.levels[level - 1];
  if (levelData && levelData.nik) {
    return `${levelData.nik} - ${levelData.description || 'No description'}`;
  }
  return 'Belum diisi';
};

const filterUsers = (val, update) => {
  if (props.onFilterUsers) {
    props.onFilterUsers(val, update);
  } else {
    update(() => {
      if (val === '') {
        filteredUsers.value = props.users;
      } else {
        const needle = val.toLowerCase();
        filteredUsers.value = props.users.filter(user => 
          user.account_nik.toLowerCase().includes(needle) ||
          user.account_name.toLowerCase().includes(needle)
        );
      }
    });
  }
};

const onUserSelect = (index, val) => {
  if (val) {
    // Find the user object
    const user = props.users.find(u => u.combined === val);
    if (user) {
      localBag.value.levels[index].nik = user.account_nik;
      localBag.value.levels[index].emp_id = user.account_username;
      localBag.value.levels[index].combined = user.combined;
    }
  } else {
    // Clear the level
    localBag.value.levels[index].nik = null;
    localBag.value.levels[index].emp_id = null;
    localBag.value.levels[index].combined = null;
  }
  updateBag();
};

const updateBag = () => {
  emit('update:modelValue', localBag.value);
};

onMounted(() => {
  loadBagTypes();
});
</script>

