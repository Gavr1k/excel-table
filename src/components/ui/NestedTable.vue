<template>
  <div>
    <template v-for="(table, index) in tableData" :key="table.company_id">
      <ExpansionPanel 
        :title="table.company_name" 
        v-model:show="panelStates[index]"
      >
        <VueExcelEditor 
          class="excel-table" 
          v-model="table.scenarios" 
          noPaging 
          noFooter 
          no-header-edit
          selectable
          free-select
          disableMultiCopy
          disableMultiPaste
          @select="handleSelect"
        >
          <VueExcelColumn 
            v-for="(column, colIndex) in columns" 
            :key="colIndex" 
            :field="column.field"
            :label="column.label" 
            :type="column.type" 
            :width="column.width"
            :init-style="{ padding: '2px 4px', height: '15px' }" 
            auto-fill-width 
            v-slot="scope"
          >
          </VueExcelColumn>
          <template v-if="$slots.actions" v-slot:actions-header>
            <slot name="actions-header"></slot>
          </template>
          <template v-if="$slots.actions" v-slot:actions="{ record }">
            <slot name="actions" :record="record"></slot>
          </template>
        </VueExcelEditor>
      </ExpansionPanel>
    </template>
  </div>
</template>

<script setup lang="ts">
import ExpansionPanel from '../table/components/ExpansionPanel.vue';
import VueExcelEditor from '../table/VueExcelEditor.vue';
import VueExcelColumn from '../table/VueExcelColumn.vue';
import { ref, watch } from 'vue';

const props = defineProps({
  tableData: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
});

const allSelectedIds = ref<string[]>([]);

const panelStates = ref<boolean[]>([]);

watch(
  () => props.tableData,
  (newTableData) => {
    panelStates.value = newTableData.map(() => false);
  },
  { immediate: true }
);

const handleSelect = (selectedId: string[], status: boolean): void => {
  selectedId.forEach((id: string) => {
    const indexIfExist: number = allSelectedIds.value.indexOf(id); 
    if (!status) {
      allSelectedIds.value.splice(indexIfExist, 1);
    } else {
      allSelectedIds.value.push(id);
    }
  });
  console.log(allSelectedIds.value);
};
</script>

<style scoped lang="scss">
.excel-table::v-deep .component-content .table-content .systable {
  width: auto !important;
}
</style>
