<template>
  <div class="test">
    <template v-for="table in tableData" :key="table.company_id.value">
      <ExpansionPanel :title="table.company_name.value">
        <VueExcelEditor
          v-model="table.scenarios"
          :page="3"
          :noPaging="true"
          :noNumCol="false"
          :noFooter="true"
        >
        <vue-excel-column field="id" label="Scenario ID" type="string" />
        <vue-excel-column field="name" label="Name" type="string" />
        <vue-excel-column field="confirmed" label="Confirmed" type="string" />
        <vue-excel-column field="npv_gep" label="NPV GEP" type="number" />
        <vue-excel-column field="npv" label="NPV" type="number" />
        <vue-excel-column field="qn_cumul" label="QN Cumul" type="string" />
        <vue-excel-column field="created_dt" label="Created Date" type="string" />
        <vue-excel-column field="calc_type_id" label="Calc Type ID" type="string" />
        <vue-excel-column field="pra_version_id" label="PRA Version ID" type="string" />
        <vue-excel-column field="field_id" label="Field ID" type="string" />
        <vue-excel-column field="company_id_scenario" label="Company ID (Scenario)" type="string" />
        <vue-excel-column field="field_file_id" label="Field File ID" type="string" />
        <vue-excel-column field="user_id" label="User ID" type="string" />
      </VueExcelEditor>
      </ExpansionPanel>
    </template>
    <!-- <ExpansionPanel title="test">
      <vue-excel-editor 
        v-model="jsondata"
        :page="3"
        :noPaging="true"
        :noNumCol="false"
        :noFooter="true"
      >
          <vue-excel-column field="name" label="Name" type="string" />
          <vue-excel-column field="created_dt" label="Created" type="string" />
          <vue-excel-column field="calc_type_id" label="Type" type="string" />
          <vue-excel-column field="pra_version_id" label="Version" type="string" />




          <vue-excel-column field="user"   label="User ID"       type="string" />
          <vue-excel-column field="name"   label="Name"          type="string" />
          <vue-excel-column field="phone"  label="Contact"       type="string" />
          <vue-excel-column field="gender" label="Gender"        type="string"  />
          <vue-excel-column field="age"    label="Age"           type="string" />
          <vue-excel-column field="birth"  label="Date Of Birth" type="string"/>
      </vue-excel-editor> 
    </ExpansionPanel> -->
  </div>
</template>

<script setup lang="ts">
import ExpansionPanel from './ExpansionPanel.vue';
import VueExcelEditor from '../table/VueExcelEditor.vue';
import VueExcelColumn from '../table/VueExcelColumn.vue';
import {reactive} from 'vue';
import table from './conts';

const tableData = reactive(table);
console.log(tableData[0].scenarios);

const jsondata = reactive([
  { 
    name: {
            value: "2024-10-01",
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
    }
  },
]);
</script>

<style scoped>

.test {
  width: 800px;
}
</style>
