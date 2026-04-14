<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="people" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">
              Peminjaman Dokumen Fisik / Scan Elektronik
            </div>
            <div
              class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs"
            >
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Peminjaman Dokumen Fisik / Scan Elektronik</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-slate-50 tw-py-4">
        <div class="tw-flex tw-flex-col tw-gap-3">
          <div class="tw-flex tw-gap-3 tw-items-end">
            <q-select
              outlined
              dense
              v-model="filterBU"
              :options="listDomainFiltered"
              option-label="domain_name"
              option-value="domain_code"
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterDomainFn"
              @update:model-value="updateTable"
              placeholder="Pilih Bisnis Unit"
              clearable
              class="tw-bg-white tw-rounded-lg tw-flex-1"
            >
              <template v-slot:prepend>
                <q-icon name="domain" color="blue-6" />
              </template>
            </q-select>
            <q-select
              outlined
              dense
              v-model="filterSite"
              :options="listSiteFiltered"
              option-label="site_name"
              option-value="site_code"
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterSiteFn"
              @update:model-value="updateTable"
              placeholder="Pilih Lokasi Arsip"
              clearable
              class="tw-bg-white tw-rounded-lg tw-flex-1"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="blue-6" />
              </template>
            </q-select>
          </div>
          <div class="tw-flex tw-gap-3 tw-items-end">
            <q-input
              outlined
              dense
              v-model="filterDateStart"
              placeholder="Tanggal Awal"
              @update:model-value="updateTable"
              clearable
              class="tw-bg-white tw-rounded-lg tw-flex-1"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="blue-6" />
              </template>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="filterDateStart"
                      mask="YYYY-MM-DD"
                      @update:model-value="updateTable"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              outlined
              dense
              v-model="filterDateEnd"
              placeholder="Tanggal Akhir"
              @update:model-value="updateTable"
              clearable
              class="tw-bg-white tw-rounded-lg tw-flex-1"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="blue-6" />
              </template>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="filterDateEnd"
                      mask="YYYY-MM-DD"
                      @update:model-value="updateTable"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          v-if="tmpPage.view == '1' || tmpPage.admin == '1'"
          :rows="listPermintaan"
          :columns="columns"
          row-key="id"
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
              <q-btn
                v-if="tmpPage.add == '1' || tmpPage.admin == '1'"
                unelevated
                color="blue-6"
                label="Tambah Data"
                icon="add"
                @click="addUser"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-btn
                unelevated
                color="green-6"
                label="Tampilkan"
                icon="visibility"
                @click="updateTable"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search users..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>
          <!--   <template v-slot:body-cell-domain="props">
            <q-td :props="props">
              {{ parseDomain(props.row.domains) }}
            </q-td>
          </template> -->
          <template v-slot:body-cell-pinjam_tgl_create="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ formatDateDMY(props.row.pinjam_tgl_create) }}
            </q-td>
          </template>
          <template v-slot:body-cell-pinjam_tgl_est_ambil_to="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ formatDateDMY(props.row.pinjam_tgl_est_ambil_to) }}
            </q-td>
          </template>
          <template v-slot:body-cell-pinjam_tgl_est_kembali_to="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ formatDateDMY(props.row.pinjam_tgl_est_kembali_to) }}
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-4 sticky-column-left">
              <q-btn
                round
                dense
                color="light-green-9"
                size="sm"
                class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                @click="editUser(props.row)"
                icon="visibility"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs"> View </q-tooltip>
              </q-btn>

              <q-btn
                round
                dense
                color="purple-7"
                size="sm"
                class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                @click="grantRole(props.row)"
                icon="admin_panel_settings"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                  Grant Role
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog
      v-model="dialogForm"
      transition-show="slide-up"
      transition-hide="slide-down"
      maximized
    >
      <q-card
        class="tw-w-full tw-rounded-2xl tw-shadow-2xl"
        style="max-width: 90vw; width: 90vw"
      >
        <q-card-section :class="`bg-${domain()}`">
          <div
            class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3"
          >
            <q-icon name="edit_note" size="32px" />
            Permintaan Dokumen
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
            <div class="col-6">
              <q-input
                model-value="Auto Generate"
                outlined
                readonly
                label="Nomor Tiket"
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="buName"
                outlined
                label="Bisnis Unit"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="domain" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <div class="tw-mb-2">
                <span class="tw-font-semibold tw-text-slate-700"
                  >Aktivitas</span
                >
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </div>
              <q-option-group
                v-model="tmpForm.aktivitas"
                :options="[
                  { label: 'Pinjam Asli', value: 'Pinjam Asli' },
                  {
                    label: 'Permintaan PDF / Elektronik',
                    value: 'Permintaan PDF / Elektronik',
                  },
                ]"
                color="blue-6"
                inline
                class="tw-rounded-lg"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="divName"
                outlined
                label="Divisi"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="domain" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="tmpForm.content_name"
                outlined
                label="Nama Dokumen"
                counter
                maxlength="100"
                debounce="500"
                @update:model-value="getDocument"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                :model-value="deptName"
                outlined
                label="Departemen"
                counter
                maxlength="100"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="tmpForm.lokasi_arsip_name"
                outlined
                label="Lokasi Penyimpanan"
                counter
                maxlength="100"
                debounce="500"
                @update:model-value="getDocument"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="tmpForm.content_doc"
                outlined
                label="Nomor Dokumen"
                counter
                maxlength="100"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="tmpForm.arsip_kat"
                outlined
                label="Kategori Dokumen"
                counter
                maxlength="100"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="tmpForm.arsip_no"
                outlined
                label="Nomor Arsip"
                counter
                maxlength="100"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                :model-value="
                  tmpForm.content_security
                    ?.replace(/-/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                "
                outlined
                label="Kategori Keamanan"
                counter
                maxlength="100"
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="tmpForm.catatan"
                outlined
                type="textarea"
                label="Alasan / Catatan Peminjaman"
                counter
                maxlength="500"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="blue-6" />
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="tmpForm.tgl_ambil"
                outlined
                label="Estimasi Tanggal Pengambilan Dokumen"
                mask="##-##-####"
                placeholder="DD-MM-YYYY"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="tmpForm.tgl_ambil" mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="tmpForm.jam_ambil_from"
                outlined
                label="Jam Mulai"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time v-model="tmpForm.jam_ambil_from" format24h>
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="tmpForm.jam_ambil_to"
                outlined
                label="Jam Selesai"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time v-model="tmpForm.jam_ambil_to" format24h>
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="tmpForm.tgl_kembali"
                outlined
                label="Estimasi Waktu Pengembalian Dokumen"
                mask="##-##-####"
                placeholder="DD-MM-YYYY"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="tmpForm.tgl_kembali" mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="tmpForm.jam_kembali_from"
                outlined
                label="Jam Mulai"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time v-model="tmpForm.jam_kembali_from" format24h>
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="tmpForm.jam_kembali_to"
                outlined
                label="Jam Selesai"
                mask="##:##"
                placeholder="HH:MM"
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="blue-6" />
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time v-model="tmpForm.jam_kembali_to" format24h>
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="tmpForm.keterangan_user"
                outlined
                type="textarea"
                label="Keterangan User"
                counter
                maxlength="500"
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
            label="Batal"
            color="red-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            v-if="!updateForm"
            label="Simpan"
            color="blue-6"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validateData"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <GrantRole v-model="dialogGrantRole" :roleData="selectedUser" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import {
  ParseError,
  domain,
  role,
  empid,
  admin,
  card,
  header,
  spinnerBall,
  formatDateDMY,
  formatDateDMYHM,
  decrypt,
  site,
  decryptMessage,
} from "./../../../utils";
import { useQuasar, Loading, QSpinnerCube } from "quasar";
import * as yup from "yup";
import { useRouter as useVueRouter, useRoute } from "vue-router";
import { useNotify } from "./../../../composables/useNotify";
import UserDomainDialog from "./../../../components/master/UserDomainDialog.vue";
import UserSiteDialog from "./../../../components/master/UserSiteDialog.vue";
import GrantRole from "./../../../components/master/GrantRole.vue";
import "./../../../assets/styles/table.css";

const route = useRoute();
const router = useVueRouter();
const { success, error } = useNotify();
const buName = ref(window.localStorage.getItem("bu_name") || "");
const divName = ref(window.localStorage.getItem("div_name") || "");
const deptName = ref(window.localStorage.getItem("dept_name") || "");
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
    name: "pinjam_no_tiket",
    required: true,
    label: "Nomor Tiket",
    align: "center",
    field: "pinjam_no_tiket",
    sortable: true,
  },
  {
    name: "pinjam_aktivitas",
    required: true,
    label: "Aktivitas",
    align: "center",
    field: "pinjam_aktivitas",
    sortable: true,
  },
  {
    name: "pinjam_tgl_create",
    required: true,
    label: "Tanggal Permintaan",
    align: "center",
    field: "pinjam_tgl_create",
    sortable: true,
  },
  {
    name: "pinjam_nama_doc",
    required: true,
    label: "Nama Arsip",
    align: "left",
    field: "pinjam_nama_doc",
    sortable: true,
  },
  {
    name: "arsip_no",
    required: true,
    label: "Kode Arsip",
    align: "left",
    field: "arsip_no",
    sortable: true,
  },
  {
    name: "pinjam_nomor_doc",
    required: true,
    label: "Nomor Dokumen",
    align: "left",
    field: "pinjam_nomor_doc",
    sortable: true,
  },
  {
    name: "lokasi_arsip_name",
    required: true,
    label: "Lokasi Arsip",
    align: "left",
    field: "lokasi_arsip_name",
    sortable: true,
  },
  {
    name: "content_security",
    required: true,
    label: "Kategori Keamanan",
    align: "left",
    field: "content_security",
    sortable: true,
  },
  {
    name: "pinjam_tgl_est_ambil_to",
    required: true,
    label: "Tgl Estimasi Pengambilan",
    align: "left",
    field: "pinjam_tgl_est_ambil_to",
    sortable: true,
  },
  {
    name: "pinjam_tgl_est_kembali_to",
    required: true,
    label: "Tgl Estimasi Pengembalian",
    align: "left",
    field: "pinjam_tgl_est_kembali_to",
    sortable: true,
  },
  {
    name: "pinjam_nama_doc",
    required: true,
    label: "Status",
    align: "left",
    field: "pinjam_nama_doc",
    sortable: true,
  },

  // {
  //   name: "account_nik",
  //   required: true,
  //   label: "NIK",
  //   align: "left",
  //   field: "account_nik",
  //   sortable: true,
  // },
  // {
  //   name: "account_name",
  //   align: "left",
  //   label: "Nama",
  //   field: "account_name",
  //   sortable: true,
  // },
  // {
  //   name: "account_email",
  //   label: "Email",
  //   align: "left",
  //   field: "account_email",
  //   sortable: true,
  // },
  // {
  //   name: "account_jabatan",
  //   label: "Jabatan",
  //   align: "left",
  //   field: "account_jabatan",
  //   sortable: true,
  // },
  // {
  //   name: "account_bu",
  //   label: "Bisnis Unit",
  //   align: "left",
  //   field: "account_bu",
  //   sortable: true,
  // },
];
const $q = useQuasar();
const listUser = ref([]);
const listPermintaan = ref([]);

const tmpRole = reactive({
  code: null,
  needle: null,
});

const listDomain = ref([]);
const listDomainFiltered = ref([]);
const filterBU = ref(null);
const listSite = ref([]);
const listSiteFiltered = ref([]);
const filterSite = ref(null);
const filterDateStart = ref(null);
const filterDateEnd = ref(null);
const listApp = ref([]);
const listSiteDefault = ref([]);
const listRole = ref([]);

const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
const dialogDomain = ref(false);
const dialogSite = ref(false);
const dialogGrantRole = ref(false);
const selectedUser = ref(null);

const pagination = ref({
  sortBy: "pinjam_no_tiket",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
  domain: domain(),
  site: null,
  dateStart: null,
  dateEnd: null,
});

const tmpForm = reactive({
  fldid: null,
  nik: null,
  empid: null,
  nama: null,
  email: null,
  jabatan: null,
  domain: null,
  site: null,
  grade: null,
  dept_id: null,
  dept: null,
  div_id: null,
  div: null,
  dir_id: null,
  dir: null,
  role: null,
  admin: "0",
  creator: empid(),
  aktivitas: null,

  content_name: null,
  lokasi_arsip_name: null,
  content_doc: null,
  arsip_kat: null,
  arsip_no: null,
  content_security: null,
});

const tmpPage = reactive({
  add: "1",
  edit: "1",
  delete: "1",
  view: "1",
  admin: "1",
});

const schema = yup.object({
  aktivitas: yup.string().required("Aktivitas wajib dipilih").nullable(),
  content_name: yup.string().required("Nama Dokumen wajib diisi").nullable(),
  lokasi_arsip_name: yup.string().required("Lokasi Penyimpanan wajib diisi").nullable(),
  catatan: yup.string().required("Alasan / Catatan Peminjaman wajib diisi").nullable(),
  tgl_ambil: yup.string().required("Estimasi Tanggal Pengambilan Dokumen wajib diisi").nullable(),
  jam_ambil_from: yup.string().required("Estimasi Jam Mulai Pengambilan Dokumen wajib diisi").nullable(),
  jam_ambil_to: yup.string().required("Estimasi Jam Selesai Pengambilan Dokumen wajib diisi wajib diisi").nullable(),
  tgl_kembali: yup.string().required("Estimasi Tanggal Pengembalian Dokumen wajib diisi").nullable(),
  jam_kembali_from: yup.string().required("Estimasi Jam Mulai Pengembalian Dokumen wajib diisi wajib diisi").nullable(),
  jam_kembali_to: yup.string().required("Estimasi Jam Selesai Pengembalian Dokumen wajib diisi wajib diisi").nullable(),
  keterangan_user: yup.string().required("Keterangan User wajib diisi").nullable(),
});

// const getPageAkses = async () => {
//   try {
//     spinnerBall()
//     const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
//       params: {
//         role:empid(),
//         page:'/dms/document-request'
//       }
//     });
//     tmpPage.add = decryptMessage(res.data.add);
//     tmpPage.edit = decryptMessage(res.data.edit);
//     tmpPage.delete = decryptMessage(res.data.delete);
//     tmpPage.view = decryptMessage(res.data.view);
//     tmpPage.admin = admin();

//     console.log(tmpPage)
//     Loading.hide()
//   } catch (error) {
//     console.error('getPageAkses error:', error);
//     Loading.hide()
//     router.push('/404');
//   }
// };

// const getUser = async () => {
//   try {
//     spinnerBall();
//     loading.value = true;
//     if (pagination.value.rowsPerPage == "All")
//       pagination.value.rowsPerPage = pagination.value.rowsNumber;
//     const res = await axios.get(`${import.meta.env.VITE_API}users`, {
//       params: pagination.value,
//     });

//     if (typeof res.data.data === "undefined") {
//       listUser.value = res.data;
//     } else {
//       listUser.value = res.data.data;
//     }

//     pagination.value.rowsNumber = res.data.pagination.total;
//     loading.value = false;
//     Loading.hide();
//   } catch (error) {
//     loading.value = false;
//     Loading.hide();
//   }
// };

const getPermintaan = async () => {
  try {
    spinnerBall();
    loading.value = true;
    if (pagination.value.rowsPerPage == "All")
      pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(
      `${import.meta.env.VITE_API}dms/listPermintaan`,
      {
        params: pagination.value,
      }
    );

    if (typeof res.data.data === "undefined") {
      listPermintaan.value = res.data;
    } else {
      listPermintaan.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
    Loading.hide();
  } catch (error) {
    loading.value = false;
    Loading.hide();
  }
};

const getRole = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}role`, {
      params: {
        ...tmpRole,
      },
    });
    listRole.value = res.data;
  } catch (error) {}
};

const addUser = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
};

const editUser = (value) => {
  try {
    reset();
    updateForm.value = true;
    dialogForm.value = true;

    tmpForm.fldid = value.id;
    tmpForm.empid = value.account_username;
    tmpForm.nik = value.account_nik;
    tmpForm.email = value.account_email;
    tmpForm.nama = value.account_name;
    tmpForm.jabatan = value.account_jabatan;
    tmpForm.grade = value.account_grade;
    tmpForm.domain = value.account_bu;
    tmpForm.dept_id = value.account_dept_id;
    tmpForm.dept = value.account_dept_name;
    tmpForm.div_id = value.account_div_id;
    tmpForm.div = value.account_div_name;
    tmpForm.dir_id = value.account_dir_id;
    tmpForm.dir = value.account_dir_name;
    tmpRole.code = value.user_role;
    //tmpForm.admin =  decryptMessage(value.user_admin);
    console.log(value.user_site);
    getRole();
    getSiteByDomain();
  } catch (error) {
    console.log(error);
  }
};

const validateData = async () => {
  let validate = {
    nik: tmpForm.nik,
    aktivitas: tmpForm.aktivitas,
    content_name: tmpForm.content_name,
    lokasi_arsip_name: tmpForm.lokasi_arsip_name,
    catatan: tmpForm.catatan,
    tgl_ambil: tmpForm.tgl_ambil,
    jam_ambil_from: tmpForm.jam_ambil_from,
    jam_ambil_to: tmpForm.jam_ambil_to,
    tgl_kembali: tmpForm.tgl_kembali,
    jam_kembali_from: tmpForm.jam_kembali_from,
    jam_kembali_to: tmpForm.jam_kembali_to,
    keterangan_user: tmpForm.keterangan_user,
  };
  schema
    .validate(validate, { abortEarly: false })
    .then(() => {
      // success process
      saveDialog();
    })
    .catch((err) => {
      err.inner.forEach((e) => {
        error(e.message);
      });
    });
};

const saveDialog = async (value) => {
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
      await saveData();
    } catch (error) {
      /* $q.notify({
        type: "negative",
        message: ParseError(error),
      }); */
    }
  });
};

const saveData = async () => {
  if (updateForm.value) {
    try {
      await axios.post(`${import.meta.env.VITE_API}users`, tmpForm);
      dialogForm.value = false;
      reset();
      success("Data berhasil diubah");
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {}
  } else {
    try {
      await axios.post(`${import.meta.env.VITE_API}users`, tmpForm);
      dialogForm.value = false;
      reset();
      success("Data berhasil disimpan");
      onRequest({
        pagination: pagination.value,
      });
    } catch (error) {}
  }
};

const getHrisByNIK = async () => {
  try {
    spinnerBall();
    if (tmpForm.nik != null) {
      const res = await axios.get(`${import.meta.env.VITE_API}getHrisByNIK`, {
        params: {
          nik: tmpForm.nik,
        },
      });
      tmpForm.nama = res.data.name;
      tmpForm.email = res.data.email;
      tmpForm.empid = res.data.empid;
      tmpForm.grade = res.data.grade;
      tmpForm.jabatan = res.data.jabatan;
      tmpForm.dept_id = res.data.dept_id;
      tmpForm.dept = res.data.dept_name;
      tmpForm.div_id = res.data.div_id;
      tmpForm.div = res.data.div_name;
      tmpForm.dir_id = res.data.dir_id;
      tmpForm.dir = res.data.dir_name;
      tmpForm.domain = res.data.bu;
    }
    Loading.hide();
  } catch (error) {
    Loading.hide();
  }
};

const getDocument = async () => {
  if (!tmpForm.content_name || !tmpForm.lokasi_arsip_name) {
    return;
  }
  try {
    spinnerBall();
    const res = await axios.post(`${import.meta.env.VITE_API}dms/getDocument`, {
      content_name: tmpForm.content_name,
      lokasi_arsip_name: tmpForm.lokasi_arsip_name,
    });
    tmpForm.content_doc = res.data.content_doc;
    tmpForm.arsip_kat = res.data.arsip_kat;
    tmpForm.arsip_no = res.data.arsip_no;
    tmpForm.content_security = res.data.content_security;
    console.log(res);
    Loading.hide();
  } catch (error) {
    Loading.hide();
  }
};

const getSiteByDomain = async (isreset = null) => {
  try {
    listSiteDefault.value = [];
    if (isreset != null) tmpForm.site = null;
    if (tmpForm.domain != null) {
      const res = await axios.get(
        `${import.meta.env.VITE_API}listSiteByDomain`,
        {
          params: {
            empid: tmpForm.empid,
            domain: tmpForm.domain,
            creator: tmpForm.empid,
          },
        }
      );
      listSiteDefault.value = res.data;
    }
  } catch (error) {
    console.log(error.message);
    /* $q.notify({
      type: "negative",
      message: ParseError(error),
    }); */
  }
};

const deleteUser = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus data <span class="text-bold">${value.user_nik} - ${value.user_name}</span>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deleteusers`, {
        empid: value.user_id,
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
  tmpForm.empid = null;
  tmpForm.nik = null;
  tmpForm.nama = null;
  tmpForm.email = null;
  tmpForm.site = null;
  tmpForm.domain = null;
  tmpForm.jabatan = null;
  tmpForm.grade = null;
  tmpForm.dept_id = null;
  tmpForm.dept_name = null;
  tmpForm.div_id = null;
  tmpForm.div_name = null;
  tmpForm.dir = null;
  tmpForm.dir_name = null;
  tmpForm.role = null;
  tmpForm.admin = "0";
  tmpForm.content_name = null;
  tmpForm.lokasi_arsip_name = null;
  tmpForm.content_doc = null;
  tmpForm.arsip_kat = null;
  tmpForm.tgl_ambil = null;
  tmpForm.jam_ambil_from = null;
  tmpForm.jam_ambil_to = null;
  tmpForm.tgl_kembali = null;
  tmpForm.jam_kembali_from = null;
  tmpForm.jam_kembali_to = null;
  tmpForm.keterangan_user = null;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  // getUser();
  getPermintaan();
};

const grantRole = async (value) => {
  selectedUser.value = value;
  console.log(selectedUser.value);
  dialogGrantRole.value = true;
};

const updateTable = async () => {
  pagination.value.domain = filterBU.value || domain();
  pagination.value.site = filterSite.value || null;
  pagination.value.dateStart = filterDateStart.value || null;
  pagination.value.dateEnd = filterDateEnd.value || null;
  onRequest({
    pagination: pagination.value,
  });
};

const getDomain = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}domain`);
    listDomain.value = res.data;
    listDomainFiltered.value = res.data;
  } catch (error) {
    console.log(error);
  }
};

const getSite = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}site`);
    listSite.value = res.data;
    listSiteFiltered.value = res.data;
  } catch (error) {
    console.log(error);
  }
};

const filterDomainFn = (val, update) => {
  update(() => {
    if (val === "") {
      listDomainFiltered.value = listDomain.value;
    } else {
      const needle = val.toLowerCase();
      listDomainFiltered.value = listDomain.value.filter(
        (v) => v.domain_name.toLowerCase().indexOf(needle) > -1
      );
    }
  });
};

const filterSiteFn = (val, update) => {
  update(() => {
    if (val === "") {
      listSiteFiltered.value = listSite.value;
    } else {
      const needle = val.toLowerCase();
      listSiteFiltered.value = listSite.value.filter(
        (v) => v.site_name.toLowerCase().indexOf(needle) > -1
      );
    }
  });
};

onMounted(() => {
  getDomain();
  getSite();
  onRequest({
    pagination: pagination.value,
  });
});
</script>

