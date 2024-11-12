<template>
  <VueExcelEditor class="excel-table" v-model="tableData" :columns="columns" noPaging noFooter no-header-edit selectable
    free-select>
    <VueExcelColumn v-for="(column, colIndex) in columns" :key="colIndex" :field="column.field" :label="column.label"
      :type="column.type" :width="column.width" :init-style="{ padding: '2px 4px', height: '15px' }" auto-fill-width
      v-slot="scope">
    </VueExcelColumn>
  </VueExcelEditor>
</template>

<script setup lang="ts">
import VueExcelEditor from '../table/VueExcelEditor.vue';
import VueExcelColumn from '../table/VueExcelColumn.vue';
import { reactive } from 'vue';

// const props = defineProps({
//   tableData: Array,
//   columns: Array,
// });

import table from './single-table';

const tableData = reactive(table);

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

<style scoped lang="scss">
.excel-table::v-deep .component-content .table-content .systable {
  width: auto !important;
}
</style>