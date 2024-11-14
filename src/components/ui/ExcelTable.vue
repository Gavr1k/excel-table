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

const props = defineProps({
  // tableData: Array,
  columns: Array,
});

import table from './single-table';

const tableData = reactive(table);



</script>

<style scoped lang="scss">
.excel-table::v-deep .component-content .table-content .systable {
  width: auto !important;
}
</style>