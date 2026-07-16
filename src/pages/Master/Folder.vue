<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="folder" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Folder</div>
            <div
              class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs"
            >
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Master</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Data Folder</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white tw-p-0">
        <!-- Tabs for Folder Hierarchy -->
        <q-tabs
          v-model="activeTab"
          dense
          :class="`bg-${domain()}`"
          active-color="white"
          indicator-color="white"
          align="left"
          narrow-indicator
        >
          <q-tab
            name="mainFolder"
            label="Main Folder"
            class="tw-text-white tw-font-semibold"
          />
          <q-tab
            name="subFolder1"
            label="Sub Folder 1"
            class="tw-text-white tw-font-semibold"
          />
          <q-tab
            name="subFolder2"
            label="Sub Folder 2"
            class="tw-text-white tw-font-semibold"
          />
        </q-tabs>

        <q-separator />

        <!-- Tab Panels -->
        <q-tab-panels v-model="activeTab" animated class="tw-bg-white">
          <!-- Main Folder Panel -->
          <q-tab-panel name="mainFolder" class="tw-p-6">
            <q-table
              v-if="tmpPage.view == '1' || tmpPage.admin == '1'"
              :rows="listFolder"
              :columns="columns"
              row-key="folder_id"
              v-model:pagination="pagination"
              :rows-per-page-options="[]"
              :loading="loading"
              :filter="pagination.filter"
              @request="onRequest"
              binary-state-sort
              flat
              class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="[
                      `bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`,
                      col.name === 'aksi' ? 'sticky-column-left-header' : '',
                    ]"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:top-left>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <q-select
                      borderless
                      dense
                      debounce="300"
                      v-model="pagination.rowsPerPage"
                      :options="[5, 10, 25, 50, 100, 200]"
                      @update:modelValue="updateTable"
                    >
                      <template v-slot:before>
                        <q-icon name="reorder">
                          <q-tooltip :class="'tw-bg-black/90'">
                            Rows per page
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-select>
                  </div>
                </div>
              </template>
              <template v-slot:top-right>
                <div class="tw-flex tw-gap-3 tw-items-center">
                  <q-input
                    outlined
                    dense
                    debounce="300"
                    v-model="pagination.filter"
                    placeholder="Search folders..."
                    class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="blue-6" />
                    </template>
                  </q-input>
                  <q-btn
                    v-if="tmpPage.add == '1' || tmpPage.admin == '1'"
                    push
                    :color="`${domain()}`"
                    icon="add"
                    label="Tambah Folder"
                    @click="addFolder"
                    class="tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
                  />
                </div>
              </template>
              <template v-slot:body-cell="props">
                <q-td :props="props" class="tw-py-4 tw-text-slate-700">
                  {{ props.value }}
                </q-td>
              </template>
              <template v-slot:body-cell-aksi="props">
                <q-td :props="props" class="tw-py-3 sticky-column-left">
                  <q-btn
                    v-if="tmpPage.edit == '1' || tmpPage.admin == '1'"
                    round
                    dense
                    color="orange-7"
                    size="sm"
                    class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    @click="editFolder(props.row)"
                    icon="edit"
                  >
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                      Edit
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="tmpPage.delete == '1' || tmpPage.admin == '1'"
                    round
                    dense
                    color="red-7"
                    size="sm"
                    class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    @click="deleteFolder(props.row)"
                    icon="delete"
                  >
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                      Delete
                    </q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Sub Folder 1 Panel -->
          <q-tab-panel name="subFolder1" class="tw-p-6">
            <q-table
              v-if="tmpPage.view == '1' || tmpPage.admin == '1'"
              :rows="listSubFolder1"
              :columns="columnsSubFolder1"
              row-key="subfolder1_id"
              v-model:pagination="paginationSub1"
              :rows-per-page-options="[]"
              :loading="loadingSub1"
              :filter="paginationSub1.filter"
              @request="onRequestSub1"
              binary-state-sort
              flat
              class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:top-left>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <q-select
                      borderless
                      dense
                      debounce="300"
                      v-model="paginationSub1.rowsPerPage"
                      :options="[5, 10, 25, 50, 100, 200]"
                      @update:modelValue="updateTableSub1"
                    >
                      <template v-slot:before>
                        <q-icon name="reorder">
                          <q-tooltip :class="'tw-bg-black/90'">
                            Rows per page
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-select>
                  </div>
                </div>
              </template>
              <template v-slot:top-right>
                <div class="tw-flex tw-gap-3 tw-items-center">
                  <q-input
                    outlined
                    dense
                    debounce="300"
                    v-model="paginationSub1.filter"
                    placeholder="Search sub folder 1..."
                    class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="blue-6" />
                    </template>
                  </q-input>
                  <q-btn
                    v-if="tmpPage.add == '1' || tmpPage.admin == '1'"
                    push
                    :color="`${domain()}`"
                    icon="add"
                    label="Tambah Sub Folder 1"
                    @click="addSubFolder1"
                    class="tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
                  />
                </div>
              </template>
              <template v-slot:body-cell="props">
                <q-td :props="props" class="tw-py-4 tw-text-slate-700">
                  {{ props.value }}
                </q-td>
              </template>
              <template v-slot:body-cell-aksi="props">
                <q-td :props="props" class="tw-py-3">
                  <q-btn
                    v-if="tmpPage.edit == '1' || tmpPage.admin == '1'"
                    round
                    dense
                    color="orange-7"
                    size="sm"
                    class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    @click="editSubFolder1(props.row)"
                    icon="edit"
                  >
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                      Edit
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="tmpPage.delete == '1' || tmpPage.admin == '1'"
                    round
                    dense
                    color="red-7"
                    size="sm"
                    class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    @click="deleteSubFolder1(props.row)"
                    icon="delete"
                  >
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                      Delete
                    </q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Sub Folder 2 Panel -->
          <q-tab-panel name="subFolder2" class="tw-p-6">
            <q-table
              v-if="tmpPage.view == '1' || tmpPage.admin == '1'"
              :rows="listSubFolder2"
              :columns="columnsSubFolder2"
              row-key="subfolder2_id"
              v-model:pagination="paginationSub2"
              :rows-per-page-options="[]"
              :loading="loadingSub2"
              :filter="paginationSub2.filter"
              @request="onRequestSub2"
              binary-state-sort
              flat
              class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:top-left>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <q-select
                      borderless
                      dense
                      debounce="300"
                      v-model="paginationSub2.rowsPerPage"
                      :options="[5, 10, 25, 50, 100, 200]"
                      @update:modelValue="updateTableSub2"
                    >
                      <template v-slot:before>
                        <q-icon name="reorder">
                          <q-tooltip :class="'tw-bg-black/90'">
                            Rows per page
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-select>
                  </div>
                </div>
              </template>
              <template v-slot:top-right>
                <div class="tw-flex tw-gap-3 tw-items-center">
                  <q-input
                    outlined
                    dense
                    debounce="300"
                    v-model="paginationSub2.filter"
                    placeholder="Search sub folder 2..."
                    class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="blue-6" />
                    </template>
                  </q-input>
                  <q-btn
                    v-if="tmpPage.add == '1' || tmpPage.admin == '1'"
                    push
                    :color="`${domain()}`"
                    icon="add"
                    label="Tambah Sub Folder 2"
                    @click="addSubFolder2"
                    class="tw-font-semibold tw-shadow-md hover:tw-shadow-lg tw-transition-all"
                  />
                </div>
              </template>
              <template v-slot:body-cell="props">
                <q-td :props="props" class="tw-py-4 tw-text-slate-700">
                  {{ props.value }}
                </q-td>
              </template>
              <template v-slot:body-cell-aksi="props">
                <q-td :props="props" class="tw-py-3">
                  <q-btn
                    v-if="tmpPage.edit == '1' || tmpPage.admin == '1'"
                    round
                    dense
                    color="orange-7"
                    size="sm"
                    class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    @click="editSubFolder2(props.row)"
                    icon="edit"
                  >
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                      Edit
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="tmpPage.delete == '1' || tmpPage.admin == '1'"
                    round
                    dense
                    color="red-7"
                    size="sm"
                    class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                    @click="deleteSubFolder2(props.row)"
                    icon="delete"
                  >
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                      Delete
                    </q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>

    <!-- Dialog Form -->
    <q-dialog
      v-model="dialogForm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div
            class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3"
          >
            <q-icon name="edit_note" size="32px" />
            {{ updateForm ? "Edit Folder" : "Tambah Folder" }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner
                rounded
                class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm"
              >
                <template v-slot:avatar>
                  <q-icon name="info" color="red" size="24px" />
                </template>
                <span class="tw-text-red-700 tw-font-medium"
                  >Field bertanda bintang (*) wajib diisi</span
                >
              </q-banner>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.folder_name"
                outlined
                counter
                maxlength="100"
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="folder" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Nama Folder</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpForm.folder_iddiv"
                :options="listDivisi"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                @update:model-value="onDivisiChange"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Divisi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpForm.folder_iddept"
                :options="listDept"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpForm.folder_iddiv"
              >
                <template v-slot:prepend>
                  <q-icon name="corporate_fare" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Departement</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.folder_desc"
                outlined
                type="textarea"
                rows="3"
                counter
                maxlength="200"
                label="Keterangan"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200" />
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Close"
            color="grey-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Save"
            :color="`${domain()}`"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validateFolder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Form Sub Folder 1 -->
    <q-dialog
      v-model="dialogFormSub1"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div
            class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3"
          >
            <q-icon name="edit_note" size="32px" />
            {{ updateFormSub1 ? "Edit Sub Folder 1" : "Tambah Sub Folder 1" }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner
                rounded
                class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm"
              >
                <template v-slot:avatar>
                  <q-icon name="info" color="red" size="24px" />
                </template>
                <span class="tw-text-red-700 tw-font-medium"
                  >Field bertanda bintang (*) wajib diisi</span
                >
              </q-banner>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpFormSub1.subfolder1_name"
                outlined
                counter
                maxlength="100"
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="folder_open" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Nama Sub Folder 1</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpFormSub1.subfolder1_iddiv"
                :options="listDivisi"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                @update:model-value="onDivisiChangeSub1"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Divisi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpFormSub1.subfolder1_iddept"
                :options="listDeptSub1"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpFormSub1.subfolder1_iddiv"
                @update:model-value="onDeptChangeSub1"
              >
                <template v-slot:prepend>
                  <q-icon name="corporate_fare" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Departement</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpFormSub1.subfolder1_idfolder"
                :options="listFolderSelect"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpFormSub1.subfolder1_iddept"
              >
                <template v-slot:prepend>
                  <q-icon name="folder" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Main Folder</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpFormSub1.subfolder1_desc"
                outlined
                type="textarea"
                rows="3"
                counter
                maxlength="200"
                label="Keterangan"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200" />
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Close"
            color="grey-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Save"
            :color="`${domain()}`"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validateSubFolder1"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Form Sub Folder 2 -->
    <q-dialog
      v-model="dialogFormSub2"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div
            class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3"
          >
            <q-icon name="edit_note" size="32px" />
            {{ updateFormSub2 ? "Edit Sub Folder 2" : "Tambah Sub Folder 2" }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-banner
                rounded
                class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm"
              >
                <template v-slot:avatar>
                  <q-icon name="info" color="red" size="24px" />
                </template>
                <span class="tw-text-red-700 tw-font-medium"
                  >Field bertanda bintang (*) wajib diisi</span
                >
              </q-banner>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpFormSub2.subfolder2_name"
                outlined
                counter
                maxlength="100"
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="folder_open" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Nama Sub Folder 2</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpFormSub2.subfolder2_iddiv"
                :options="listDivisi"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                @update:model-value="onDivisiChangeSub2"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Divisi</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpFormSub2.subfolder2_iddept"
                :options="listDeptSub2"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpFormSub2.subfolder2_iddiv"
                @update:model-value="onDeptChangeSub2"
              >
                <template v-slot:prepend>
                  <q-icon name="corporate_fare" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Departement</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpFormSub2.subfolder2_idfolder"
                :options="listFolderSelectSub2"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpFormSub2.subfolder2_iddept"
                @update:model-value="onFolderChangeSub2"
              >
                <template v-slot:prepend>
                  <q-icon name="folder" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Main Folder</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                v-model="tmpFormSub2.subfolder2_idsubfolder1"
                :options="listSubFolder1Select"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
                :disable="!tmpFormSub2.subfolder2_idfolder"
              >
                <template v-slot:prepend>
                  <q-icon name="folder_open" color="blue-6" />
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700"
                    >Sub Folder 1</span
                  >
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpFormSub2.subfolder2_desc"
                outlined
                type="textarea"
                rows="3"
                counter
                maxlength="200"
                label="Keterangan"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200" />
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Close"
            color="grey-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Save"
            :color="`${domain()}`"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validateSubFolder2"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import {
  ParseError,
  domain,
  empid,
  admin,
  spinnerBall,
  decrypt,
  decryptMessage,
} from "./../../utils";
import { useQuasar, Loading } from "quasar";
import * as yup from "yup";
import { useRouter as useVueRouter } from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const router = useVueRouter();
const { success, error } = useNotify();
const columns = [
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi",
    classes: "sticky-column-left",
    headerClasses: "sticky-column-left-header",
  },
  {
    name: "folder_name",
    required: true,
    label: "Folder",
    align: "left",
    field: "folder_name",
    sortable: true,
  },
  {
    name: "folder_path",
    align: "left",
    label: "Path",
    field: "folder_path",
    sortable: true,
  },
  {
    name: "divisi_name",
    align: "left",
    label: "Divisi",
    field: "divisi_name",
    sortable: true,
  },
  {
    name: "dept_name",
    label: "Departement",
    align: "left",
    field: "dept_name",
    sortable: true,
  },
];

const columnsSubFolder1 = [
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi",
  },
  {
    name: "subfolder1_name",
    required: true,
    label: "Sub Folder 1",
    align: "left",
    field: "subfolder1_name",
    sortable: true,
  },
  {
    name: "folder_name",
    align: "left",
    label: "Main Folder",
    field: "folder_name",
    sortable: true,
  },
  {
    name: "subfolder1_path",
    align: "left",
    label: "Path",
    field: "subfolder1_path",
    sortable: true,
  },
  {
    name: "divisi_name",
    align: "left",
    label: "Divisi",
    field: "divisi_name",
    sortable: true,
  },
  {
    name: "dept_name",
    label: "Departement",
    align: "left",
    field: "dept_name",
    sortable: true,
  },
];

const columnsSubFolder2 = [
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi",
  },
  {
    name: "subfolder2_name",
    required: true,
    label: "Sub Folder 2",
    align: "left",
    field: "subfolder2_name",
    sortable: true,
  },
  {
    name: "subfolder1_name",
    align: "left",
    label: "Sub Folder 1",
    field: "subfolder1_name",
    sortable: true,
  },
  {
    name: "folder_name",
    align: "left",
    label: "Main Folder",
    field: "folder_name",
    sortable: true,
  },
  {
    name: "subfolder2_path",
    align: "left",
    label: "Path",
    field: "subfolder2_path",
    sortable: true,
  },
  {
    name: "divisi_name",
    align: "left",
    label: "Divisi",
    field: "divisi_name",
    sortable: true,
  },
  {
    name: "dept_name",
    label: "Departement",
    align: "left",
    field: "dept_name",
    sortable: true,
  },
];
const $q = useQuasar();
const activeTab = ref("mainFolder");
const listFolder = ref([]);
const listSubFolder1 = ref([]);
const listSubFolder2 = ref([]);
const listDivisi = ref([]);
const listDept = ref([]);
const listDeptSub1 = ref([]);
const listDeptSub2 = ref([]);
const listFolderSelect = ref([]);
const listFolderSelectSub2 = ref([]);
const listSubFolder1Select = ref([]);

const loading = ref(false);
const loadingSub1 = ref(false);
const loadingSub2 = ref(false);
const updateForm = ref(false);
const updateFormSub1 = ref(false);
const updateFormSub2 = ref(false);
const dialogForm = ref(false);
const dialogFormSub1 = ref(false);
const dialogFormSub2 = ref(false);

const pagination = ref({
  sortBy: "folder_id",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const paginationSub1 = ref({
  sortBy: "subfolder1_id",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const paginationSub2 = ref({
  sortBy: "subfolder2_id",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
});

const tmpForm = reactive({
  id: null,
  folder_name: null,
  folder_iddiv: null,
  folder_iddept: null,
  folder_desc: null,
  creator: empid(),
  domain: domain(),
});

const tmpFormSub1 = reactive({
  id: null,
  subfolder1_name: null,
  subfolder1_idfolder: null,
  subfolder1_iddiv: null,
  subfolder1_iddept: null,
  subfolder1_desc: null,
  creator: empid(),
});

const tmpFormSub2 = reactive({
  id: null,
  subfolder2_name: null,
  subfolder2_idfolder: null,
  subfolder2_idsubfolder1: null,
  subfolder2_iddiv: null,
  subfolder2_iddept: null,
  subfolder2_desc: null,
  creator: empid(),
});

const tmpPage = reactive({
  add: "0",
  edit: "0",
  delete: "0",
  view: "0",
  admin: "0",
});

const schema = yup.object({
  folder_name: yup.string().required("Nama folder wajib diisi").nullable(),
  folder_iddiv: yup.number().required("Divisi wajib dipilih").nullable(),
  folder_iddept: yup.number().required("Departement wajib dipilih").nullable(),
});

const schemaSub1 = yup.object({
  subfolder1_name: yup
    .string()
    .required("Nama sub folder 1 wajib diisi")
    .nullable(),
  subfolder1_idfolder: yup
    .number()
    .required("Main folder wajib dipilih")
    .nullable(),
  subfolder1_iddiv: yup.number().required("Divisi wajib dipilih").nullable(),
  subfolder1_iddept: yup
    .number()
    .required("Departement wajib dipilih")
    .nullable(),
});

const schemaSub2 = yup.object({
  subfolder2_name: yup
    .string()
    .required("Nama sub folder 2 wajib diisi")
    .nullable(),
  subfolder2_idfolder: yup
    .number()
    .required("Main folder wajib dipilih")
    .nullable(),
  subfolder2_idsubfolder1: yup
    .number()
    .required("Sub folder 1 wajib dipilih")
    .nullable(),
  subfolder2_iddiv: yup.number().required("Divisi wajib dipilih").nullable(),
  subfolder2_iddept: yup
    .number()
    .required("Departement wajib dipilih")
    .nullable(),
});

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: empid(),
        page: "master_folder",
        domain: domain(),
      },
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    tmpPage.admin = admin();
    Loading.hide();
  } catch (error) {
    console.error("getPageAkses error:", error);
    Loading.hide();
    router.push("/404");
  }
};

const getFolder = async () => {
  loading.value = true;
  try {
    if (pagination.value.rowsPerPage == "All")
      pagination.value.rowsPerPage = pagination.value.rowsNumber;
    pagination.value.domain = localStorage.getItem("domain");

    const res = await axios.get(`${import.meta.env.VITE_API}listFolder`, {
      params: pagination.value,
    });

    if (typeof res.data.data === "undefined") {
      listFolder.value = res.data;
      pagination.value.rowsNumber = res.data.length;
    } else {
      listFolder.value = res.data.data;
      pagination.value.rowsNumber = res.data.pagination?.total || 0;
    }
  } catch (err) {
    console.error('getFolder error:', err);
    error(ParseError(err));
    listFolder.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const getDivisi = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDivisi`);
    listDivisi.value = res.data;
  } catch (error) {
    console.error("getDivisi error:", error);
  }
};

const getDept = async (iddiv) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDept`, {
      params: { iddiv },
    });
    listDept.value = res.data;
  } catch (error) {
    console.error("getDept error:", error);
  }
};

const onDivisiChange = async (value) => {
  tmpForm.folder_iddept = null;
  listDept.value = [];
  if (value) {
    await getDept(value);
  }
};

const addFolder = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
  await getDivisi();
};

const editFolder = async (value) => {
  try {
    reset();
    updateForm.value = true;
    dialogForm.value = true;

    tmpForm.id = value.folder_id;
    tmpForm.folder_name = value.folder_name;
    tmpForm.folder_iddiv = value.folder_iddiv;
    tmpForm.folder_iddept = value.folder_iddept;
    tmpForm.folder_desc = value.folder_desc;

    await getDivisi();
    if (value.folder_iddiv) {
      await getDept(value.folder_iddiv);
    }
  } catch (error) {
    console.log(error);
  }
};

const validateFolder = async () => {
  let validate = {
    folder_name: tmpForm.folder_name,
    folder_iddiv: tmpForm.folder_iddiv,
    folder_iddept: tmpForm.folder_iddept,
  };
  schema
    .validate(validate, { abortEarly: false })
    .then(() => {
      saveDialog();
    })
    .catch((err) => {
      err.inner.forEach((e) => {
        error(e.message);
      });
    });
};

const saveDialog = async () => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah data sudah sesuai ?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Simpan",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await saveFolder();
    } catch (error) {
      // Error handled in saveFolder
    }
  });
};

const saveFolder = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}saveFolder`, tmpForm);
    dialogForm.value = false;
    reset();
    success(
      updateForm.value ? "Data berhasil diubah" : "Data berhasil disimpan"
    );
    await onRequest({
      pagination: pagination.value,
    });
  } catch (error) {
    error(ParseError(error));
  }
};

const deleteFolder = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus folder <span class="text-bold">${value.folder_name}</span>?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Hapus",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}deleteFolder`, {
        id: value.folder_id,
        creator: empid(),
      });
      dialogForm.value = false;
      reset();
      success("Data berhasil dihapus");
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      error(ParseError(error));
    }
  });
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.folder_name = null;
  tmpForm.folder_iddiv = null;
  tmpForm.folder_iddept = null;
  tmpForm.folder_desc = null;
  listDept.value = [];
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getFolder();
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

// Sub Folder 1 Functions
const getSubFolder1 = async () => {
  loadingSub1.value = true;
  try {
    if (paginationSub1.value.rowsPerPage == "All")
      paginationSub1.value.rowsPerPage = paginationSub1.value.rowsNumber;

    paginationSub1.value.domain = domain();

    const res = await axios.get(`${import.meta.env.VITE_API}listSubFolder1`, {
      params: paginationSub1.value,
    });

    if (typeof res.data.data === "undefined") {
      listSubFolder1.value = res.data;
      paginationSub1.value.rowsNumber = res.data.length;
    } else {
      listSubFolder1.value = res.data.data;
      paginationSub1.value.rowsNumber = res.data.pagination?.total || 0;
    }
  } catch (err) {
    console.error('getSubFolder1 error:', err);
    error(ParseError(err));
    listSubFolder1.value = [];
    paginationSub1.value.rowsNumber = 0;
  } finally {
    loadingSub1.value = false;
  }
};

const getSelectFolder = async (iddept) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectFolder`, {
      params: { iddept },
    });
    listFolderSelect.value = res.data;
  } catch (error) {
    console.error("getFolder error:", error);
  }
};

const onDivisiChangeSub1 = async (value) => {
  tmpFormSub1.subfolder1_iddept = null;
  tmpFormSub1.subfolder1_idfolder = null;
  listDeptSub1.value = [];
  listFolderSelect.value = [];
  if (value) {
    await getDeptSub1(value);
  }
};

const getDeptSub1 = async (iddiv) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDept`, {
      params: { iddiv },
    });
    listDeptSub1.value = res.data;
  } catch (error) {
    console.error("getDeptSub1 error:", error);
  }
};

const onDeptChangeSub1 = async (value) => {
  tmpFormSub1.subfolder1_idfolder = null;
  listFolderSelect.value = [];
  if (value) {
    await getSelectFolder(value);
  }
};

const addSubFolder1 = async () => {
  updateFormSub1.value = false;
  dialogFormSub1.value = true;
  resetSub1();
  await getDivisi();
};

const editSubFolder1 = async (value) => {
  try {
    resetSub1();
    updateFormSub1.value = true;
    dialogFormSub1.value = true;

    tmpFormSub1.id = value.subfolder1_id;
    tmpFormSub1.subfolder1_name = value.subfolder1_name;
    tmpFormSub1.subfolder1_idfolder = value.subfolder1_idfolder;
    tmpFormSub1.subfolder1_iddiv = value.subfolder1_iddiv;
    tmpFormSub1.subfolder1_iddept = value.subfolder1_iddept;
    tmpFormSub1.subfolder1_desc = value.subfolder1_desc;

    await getDivisi();
    if (value.subfolder1_iddiv) {
      await getDeptSub1(value.subfolder1_iddiv);
    }
    if (value.subfolder1_iddept) {
      await getSelectFolder(value.subfolder1_iddept);
    }
  } catch (error) {
    console.log(error);
  }
};

const validateSubFolder1 = async () => {
  let validate = {
    subfolder1_name: tmpFormSub1.subfolder1_name,
    subfolder1_idfolder: tmpFormSub1.subfolder1_idfolder,
    subfolder1_iddiv: tmpFormSub1.subfolder1_iddiv,
    subfolder1_iddept: tmpFormSub1.subfolder1_iddept,
  };
  schemaSub1
    .validate(validate, { abortEarly: false })
    .then(() => {
      saveDialogSub1();
    })
    .catch((err) => {
      err.inner.forEach((e) => {
        error(e.message);
      });
    });
};

const saveDialogSub1 = async () => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah data sudah sesuai ?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Simpan",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await saveSubFolder1();
    } catch (error) {
      // Error handled in saveSubFolder1
    }
  });
};

const saveSubFolder1 = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}saveSubFolder1`, tmpFormSub1);
    dialogFormSub1.value = false;
    resetSub1();
    success(
      updateFormSub1.value ? "Data berhasil diubah" : "Data berhasil disimpan"
    );
    await onRequestSub1({
      pagination: paginationSub1.value,
    });
  } catch (error) {
    error(ParseError(error));
  }
};

const deleteSubFolder1 = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus sub folder <span class="text-bold">${value.subfolder1_name}</span>?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Hapus",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}deleteSubFolder1`, {
        id: value.subfolder1_id,
        creator: empid(),
      });
      dialogFormSub1.value = false;
      resetSub1();
      success("Data berhasil dihapus");
      await onRequestSub1({
        pagination: paginationSub1.value,
      });
    } catch (error) {
      error(ParseError(error));
    }
  });
};

const resetSub1 = () => {
  tmpFormSub1.id = null;
  tmpFormSub1.subfolder1_name = null;
  tmpFormSub1.subfolder1_idfolder = null;
  tmpFormSub1.subfolder1_iddiv = null;
  tmpFormSub1.subfolder1_iddept = null;
  tmpFormSub1.subfolder1_desc = null;
  listDeptSub1.value = [];
  listFolderSelect.value = [];
};

const onRequestSub1 = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  paginationSub1.value.filter = filter;
  paginationSub1.value.page = page;
  paginationSub1.value.rowsPerPage = rowsPerPage;
  paginationSub1.value.sortBy = sortBy;
  paginationSub1.value.descending = descending;
  getSubFolder1();
};

const updateTableSub1 = async () => {
  onRequestSub1({
    pagination: paginationSub1.value,
  });
};

// Sub Folder 2 Functions
const getSubFolder2 = async () => {
  loadingSub2.value = true;
  try {
    if (paginationSub2.value.rowsPerPage == "All")
      paginationSub2.value.rowsPerPage = paginationSub2.value.rowsNumber;

    paginationSub2.value.domain = domain();

    const res = await axios.get(`${import.meta.env.VITE_API}listSubFolder2`, {
      params: paginationSub2.value,
    });

    if (typeof res.data.data === "undefined") {
      listSubFolder2.value = res.data;
      paginationSub2.value.rowsNumber = res.data.length;
    } else {
      listSubFolder2.value = res.data.data;
      paginationSub2.value.rowsNumber = res.data.pagination?.total || 0;
    }
  } catch (err) {
    console.error('getSubFolder2 error:', err);
    error(ParseError(err));
    listSubFolder2.value = [];
    paginationSub2.value.rowsNumber = 0;
  } finally {
    loadingSub2.value = false;
  }
};

const getSelectSubFolder1 = async (idfolder) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API}getSelectSubFolder1`,
      {
        params: { idfolder },
      }
    );
    listSubFolder1Select.value = res.data;
  } catch (error) {
    console.error("getSelectSubFolder1 error:", error);
  }
};

const onDivisiChangeSub2 = async (value) => {
  tmpFormSub2.subfolder2_iddept = null;
  tmpFormSub2.subfolder2_idfolder = null;
  tmpFormSub2.subfolder2_idsubfolder1 = null;
  listDeptSub2.value = [];
  listFolderSelectSub2.value = [];
  listSubFolder1Select.value = [];
  if (value) {
    await getDeptSub2(value);
  }
};

const getDeptSub2 = async (iddiv) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectDept`, {
      params: { iddiv },
    });
    listDeptSub2.value = res.data;
  } catch (error) {
    console.error("getDeptSub2 error:", error);
  }
};

const onDeptChangeSub2 = async (value) => {
  tmpFormSub2.subfolder2_idfolder = null;
  tmpFormSub2.subfolder2_idsubfolder1 = null;
  listFolderSelectSub2.value = [];
  listSubFolder1Select.value = [];
  if (value) {
    await getFolderSub2(value);
  }
};

const getFolderSub2 = async (iddept) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getSelectFolder`, {
      params: { iddept },
    });
    listFolderSelectSub2.value = res.data;
  } catch (error) {
    console.error("getFolderSub2 error:", error);
  }
};

const onFolderChangeSub2 = async (value) => {
  tmpFormSub2.subfolder2_idsubfolder1 = null;
  listSubFolder1Select.value = [];
  if (value) {
    await getSelectSubFolder1(value);
  }
};

const addSubFolder2 = async () => {
  updateFormSub2.value = false;
  dialogFormSub2.value = true;
  resetSub2();
  await getDivisi();
};

const editSubFolder2 = async (value) => {
  try {
    resetSub2();
    updateFormSub2.value = true;
    dialogFormSub2.value = true;

    tmpFormSub2.id = value.subfolder2_id;
    tmpFormSub2.subfolder2_name = value.subfolder2_name;
    tmpFormSub2.subfolder2_idfolder = value.subfolder2_idfolder;
    tmpFormSub2.subfolder2_idsubfolder1 = value.subfolder2_idsubfolder1;
    tmpFormSub2.subfolder2_iddiv = value.subfolder2_iddiv;
    tmpFormSub2.subfolder2_iddept = value.subfolder2_iddept;
    tmpFormSub2.subfolder2_desc = value.subfolder2_desc;

    await getDivisi();
    if (value.subfolder2_iddiv) {
      await getDeptSub2(value.subfolder2_iddiv);
    }
    if (value.subfolder2_iddept) {
      await getFolderSub2(value.subfolder2_iddept);
    }
    if (value.subfolder2_idfolder) {
      await getSelectSubFolder1(value.subfolder2_idfolder);
    }
  } catch (error) {
    console.log(error);
  }
};

const validateSubFolder2 = async () => {
  let validate = {
    subfolder2_name: tmpFormSub2.subfolder2_name,
    subfolder2_idfolder: tmpFormSub2.subfolder2_idfolder,
    subfolder2_idsubfolder1: tmpFormSub2.subfolder2_idsubfolder1,
    subfolder2_iddiv: tmpFormSub2.subfolder2_iddiv,
    subfolder2_iddept: tmpFormSub2.subfolder2_iddept,
  };
  schemaSub2
    .validate(validate, { abortEarly: false })
    .then(() => {
      saveDialogSub2();
    })
    .catch((err) => {
      err.inner.forEach((e) => {
        error(e.message);
      });
    });
};

const saveDialogSub2 = async () => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah data sudah sesuai ?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Simpan",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await saveSubFolder2();
    } catch (error) {
      // Error handled in saveSubFolder2
    }
  });
};

const saveSubFolder2 = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}saveSubFolder2`, tmpFormSub2);
    dialogFormSub2.value = false;
    resetSub2();
    success(
      updateFormSub2.value ? "Data berhasil diubah" : "Data berhasil disimpan"
    );
    await onRequestSub2({
      pagination: paginationSub2.value,
    });
  } catch (error) {
    error(ParseError(error));
  }
};

const deleteSubFolder2 = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus sub folder 2 <span class="text-bold">${value.subfolder2_name}</span>?`,
    html: true,
    class: `side-${domain()} text-semibold tw-rounded-2xl`,
    style: "border-radius: 16px;",
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Hapus",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}deleteSubFolder2`, {
        id: value.subfolder2_id,
        creator: empid(),
      });
      dialogFormSub2.value = false;
      resetSub2();
      success("Data berhasil dihapus");
      await onRequestSub2({
        pagination: paginationSub2.value,
      });
    } catch (error) {
      error(ParseError(error));
    }
  });
};

const resetSub2 = () => {
  tmpFormSub2.id = null;
  tmpFormSub2.subfolder2_name = null;
  tmpFormSub2.subfolder2_idfolder = null;
  tmpFormSub2.subfolder2_idsubfolder1 = null;
  tmpFormSub2.subfolder2_iddiv = null;
  tmpFormSub2.subfolder2_iddept = null;
  tmpFormSub2.subfolder2_desc = null;
  listDeptSub2.value = [];
  listFolderSelectSub2.value = [];
  listSubFolder1Select.value = [];
};

const onRequestSub2 = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  paginationSub2.value.filter = filter;
  paginationSub2.value.page = page;
  paginationSub2.value.rowsPerPage = rowsPerPage;
  paginationSub2.value.sortBy = sortBy;
  paginationSub2.value.descending = descending;
  getSubFolder2();
};

const updateTableSub2 = async () => {
  onRequestSub2({
    pagination: paginationSub2.value,
  });
};

onMounted(() => {
  getPageAkses();
  onRequest({
    pagination: pagination.value,
  });
  onRequestSub1({
    pagination: paginationSub1.value,
  });
  onRequestSub2({
    pagination: paginationSub2.value,
  });
});
</script>
