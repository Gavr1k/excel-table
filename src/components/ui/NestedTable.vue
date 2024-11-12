<template>
  <div>
    <template v-for="table in tableData" :key="table.company_id.value">
      <ExpansionPanel :title="table.company_name.value">
        <VueExcelEditor
          class="excel-table"
          v-model="table.scenarios"
          noPaging
          noFooter
          no-header-edit
          :no-mouse-scroll="false"
          selectable
          free-select
        >
        <VueExcelColumn
          v-for="(column, colIndex) in columns"
          :key="colIndex"
          :field="column.field"
          :label="column.label"
          :type="column.type"
          :width="column.width"
          readonly
          :init-style="{ padding: '2px 4px', height: '15px' }"
          auto-fill-width
          v-slot="scope"
        >
        </VueExcelColumn>
        <template v-slot:actions-header>Ссылки</template>
        <template v-slot:actions="{ record }">
          <button>Открыть</button>
        </template>
      </VueExcelEditor>
      </ExpansionPanel>
    </template>
  </div>
</template>

<script setup lang="ts">
import ExpansionPanel from './ExpansionPanel.vue';
import VueExcelEditor from '../table/VueExcelEditor.vue';
import VueExcelColumn from '../table/VueExcelColumn.vue';

const props = defineProps({
  tableData: Array,
  columns: Array,
});


console.log(props);

</script>

<style scoped lang="scss">

.excel-table::v-deep .component-content .table-content .systable {
  width: auto !important;
}
</style>
