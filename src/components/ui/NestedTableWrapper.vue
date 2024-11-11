<template>
  <div>
    <template v-for="table in tableData" :key="table.company_id.value">
      <ExpansionPanel :title="table.company_name.value">
        <VueExcelEditor
          v-model="table.scenarios"
          :page="3"
          :noPaging="true"
          :noNumCol="false"
          :noFooter="true"
          selectable
        >
        <VueExcelColumn
          v-for="(column, colIndex) in columns"
          :key="colIndex"
          :field="column.field"
          :label="column.label"
          :type="column.type"
          :width="column.width"
          :placeholder="column.placeholder"
          readonly
          :init-style="{ padding: '2px 4px', height: '15px' }"
          auto-fill-width
          v-slot="scope"
        >
      </VueExcelColumn>
      </VueExcelEditor>
      </ExpansionPanel>
    </template>
  </div>
</template>

<script setup lang="ts">
import ExpansionPanel from './ExpansionPanel.vue';
import VueExcelEditor from '../table/VueExcelEditor.vue';
import VueExcelColumn from '../table/VueExcelColumn.vue';
import {reactive} from 'vue';
import table from './conts';

const tableData = reactive(table);

const columns = reactive([
  { field: "calc_type_id", type: "string", label: "Тип расчета", readonly: true, },
  { field: "pra_version_id", type: "string", label: "Версия" },
  { field: "field_id", type: "string", label: "Месторождение" },
  { field: "name", type: "string", label: "Сценарий" },
  { field: "confirmed", type: "string", label: "Утвержденный" },
  { field: "npv_gep", type: "string", label: "NVP ГЭП, млн.руб" },
  { field: "npv", type: "string", label: "NVP, млн.руб" },
  { field: "qn_cumul", type: "string", label: "Нак.нефть, тыс.т." },
  { field: "created_dt", type: "string", label: "Дата создания сценария" },
  { field: "user_id", type: "string", label: "Автор" },
]);

const jsondata = reactive([
  { 
    id: 'test',
    name: {
            value: "test",
            anomaly: "",
            isSelected: false
    },
    phone: {
            value: '1-415-2345678',
            anomaly: "",
            isSelected: false
    },
    gender: {
            value: 'M',
            anomaly: "",
            isSelected: false
    },
    age: {
            value: '25',
            anomaly: "",
            isSelected: false
    },
    birth: {
      value: '25',
            anomaly: "",
            isSelected: false
    },
    test: {
      value: '25',
            anomaly: "",
            isSelected: false
    }
  },
]);
</script>

<style scoped>
</style>
