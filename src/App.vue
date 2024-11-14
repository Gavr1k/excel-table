<template>
  <div class="test">
      <!-- <NestedTableWrapper
        :tableData="nestedTable"
        :columns="nestedColumns"
      >
      <template #actions-header>Ссылки</template>
      <template #actions="{ record }">
        <button @click="">Открыть</button>
      </template>
    </NestedTableWrapper> -->
      <ExcelTable
        v-model="singleTable"
        :columns="columns"
      ></ExcelTable>
  </div>
</template>

<script setup lang="ts">
import NestedTableWrapper from './components/ui/NestedTable.vue';
import ExcelTable from './components/ui/ExcelTable.vue';
import { reactive } from 'vue';

import nestedTable_ from './components/ui/conts';
import singleTable_ from './components/ui/single-table';
import singleTable from './components/ui/single-table';

const nestedTable = reactive(nestedTable_);

const nestedColumns = reactive([
  { field: "calc_type_id", type: "string", label: "Тип расчета", readonly: true, },
  { field: "pra_version_id", type: "string", label: "Версия" },
  { field: "field_id", type: "string", label: "Месторождение" },
  { field: "name", type: "string", label: "Сценарий" },
  { field: "confirmed", type: "boolean", label: "Утвержденный" },
  { field: "npv_gep", type: "string", label: "NVP ГЭП, млн.руб" },
  { field: "npv", type: "string", label: "NVP, млн.руб" },
  { field: "qn_cumul", type: "string", label: "Нак.нефть, тыс.т." },
  { field: "created_dt", type: "string", label: "Дата создания сценария" },
  { field: "user_id", type: "string", label: "Автор" },
]);

//----------single table

const singleTableData = reactive(singleTable_);

const columns = reactive([
  { field: "date_dt", type: "string", label: "Дата" },
  { field: "prod_horizon", type: "string", label: "Объект работы" },
  { field: "well_status", type: "string", label: "Состояние" },
  { field: "well_type", type: "string", label: "Характер работы" },
  { field: "liq_prod_rate_tn", type: "string", label: "Дебит жид., т/сут" },
  { field: "liq_prod_month_tn", type: "string", label: "Добыча  жид., тыс.т" },
  { field: "oil_prod_rate_tn", type: "string", label: "Дебит неф., т/сут" },
  { field: "oil_prod_month_tn", type: "string", label: "Добыча  неф., тыс.т" },
  { field: "oil_prod_cumul_tn", type: "string", label: "Нак. добыча неф., тыс.т" },
  { field: "png_prod_rate_m3", type: "string", label: "Дебит газа, тыс.м3/сут" },
  { field: "png_prod_month_m3", type: "string", label: "Добыча  газа, тыс.м3" },
  { field: "png_prod_cumul_m3", type: "string", label: "Нак. добыча газа, млн.м3" },
  { field: "wat_inje_rate_m3", type: "string", label: "Приемистость, м3/сут" },
  { field: "wat_inje_month_m3", type: "string", label: "Закачка воды, тыс.м3" },
  { field: "wat_inje_cumul_m3", type: "string", label: "Нак. закачка воды, тыс.м3" },
  { field: "wct_tn", type: "string", label: "Обв., т/т" },
  { field: "gor_tn_to_m3", type: "string", label: "Газовый фактор, м3/т" },
  { field: "eff", type: "string", label: "К_эксп" },
]);
</script>

<style scoped>

.test {
  width: 100%;
}
</style>
