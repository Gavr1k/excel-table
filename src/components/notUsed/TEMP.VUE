<template>
  <div ref="editor" class="vue-excel-editor" :style="{ display: 'inline-block', width }">
    <div class="component-content">
      <!-- No record -->
      <div v-if="localizedLabel.noRecordIndicator && pagingTable.length == 0" class="norecord"
        :style="{ bottom: noFooter ? '12px' : '37px' }">
        {{ localizedLabel.noRecordIndicator }}
      </div>

      <div ref="tableContent" class="table-content" :class="{ 'no-footer': noFooter }" @scroll="tableScrollWrapper"
        @mouseover="mouseOverWrapper" @mouseout="mouseOutWrapper">

        <!-- Main Table -->
        <table ref="systable" id="systable" style="table-layout: fixed; width: 0" class="systable"
          :class="{ 'no-number': noNumCol }"
          ondragenter="event.preventDefault(); event.dataTransfer.dropEffect = 'none'"
          ondragover="event.preventDefault(); event.dataTransfer.dropEffect = 'none'">
          <colgroup>
            <col v-if="!noNumCol" style="width:40px">
            <col v-for="(item, p) in state.fields" v-show="!item.invisible" :key="p" :style="{ width: item.width }">
            <col v-if="state.vScroller.buttonHeight < state.vScroller.height" style="width:12px">
          </colgroup>
          <thead class="center-text">
            <tr>
              <th class="center-text first-col tl-setting" :class="{ hide: noNumCol }" style="top: 0"
                @mousedown.left="selectAllClick" @contextmenu.prevent="settingClick">
                <span style="width:100%">
                  <svg v-if="selectedCount > 0" aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="times-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                    class="svg-inline--fa fa-times-circle fa-w-16 fa-sm">
                    <path fill="currentColor"
                      d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z">
                    </path>
                  </svg>
                  <svg v-else aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bars" role="img"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
                    class="svg-inline--fa fa-bars fa-w-14 fa-sm">
                    <path fill="currentColor"
                      d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z">
                    </path>
                  </svg>
                </span>
              </th>
              <th v-for="(item, p) in state.fields" v-show="!item.invisible" :key="`th-${p}`"
                :colspan="p === state.fields.length - 1 && state.vScroller.buttonHeight < state.vScroller.height ? 2 : 1" :class="{
                  'sort-asc-sign': state.sortPos == p && state.sortDir == 1,
                  'sort-des-sign': state.sortPos == p && state.sortDir == -1,
                  'sticky-column': item.sticky,
                  'no-sorting': item.noSorting
                }" :style="{ left: item.left }" @mousedown="headerClickWrapper($event, p)"
                @contextmenu.prevent="panelFilterClick(item)">
                <div :class="{ 'filter-sign': state.columnFilter[p] }">
                  <span :class="{ 'table-col-header': !noHeaderEdit }" v-html="headerLabel(item.label, item)"></span>
                </div>
                <div class="col-sep" @mousedown="colSepMouseDownWrapper" @mouseover="colSepMouseOverWrapper"
                  @mouseout="colSepMouseOutWrapper">
                  <div class="add-col-btn"> + </div>
                </div>
              </th>
            </tr>
            <tr :class="{ hide: !filterRow }">
              <td class="center-text first-col tl-filter" :class="{ hide: noNumCol }"
                style="vertical-align: middle; padding: 0" :style="{ top: state.calCellTop2 + 'px' }"
                @click="state.columnFilter = {}">
                <span v-if="Object.keys(state.columnFilter).length > 0">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eraser" role="img"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                    class="svg-inline--fa fa-eraser fa-w-16 fa-sm">
                    <path fill="currentColor"
                      d="M497.941 273.941c18.745-18.745 18.745-49.137 0-67.882l-160-160c-18.745-18.745-49.136-18.746-67.883 0l-256 256c-18.745 18.745-18.745 49.137 0 67.882l96 96A48.004 48.004 0 0 0 144 480h356c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12H355.883l142.058-142.059zm-302.627-62.627l137.373 137.373L265.373 416H150.628l-80-80 124.686-124.686z">
                    </path>
                  </svg>
                </span>
              </td>
              <vue-excel-filter 
              v-for="(item, p) in state.fields" v-show="!item.invisible" :ref="`filter-${item.name}`"
                :colspan="p === state.fields.length - 1 ? 2 : 1" :key="`th2-${p}`" v-model="state.columnFilter[p]"
                :class="{ 'sticky-column': item.sticky }" :style="{ left: item.left }" class="column-filter" 
                @showFilter="state.showPanelFilter = true"
              />
            </tr>
          </thead>
          <tbody @mousedown="mouseDownWrapper">
            <tr v-if="localizedLabel.noRecordIndicator && pagingTable.length == 0">
              <td colspan="100%" style="height:40px; vertical-align: middle; text-align: center"></td>
            </tr>
            <tr v-else v-for="(record, rowPos) in pagingTable" :key="rowPos"
              :class="{ select: typeof state.selected[state.pageTop + rowPos] !== 'undefined' }" :style="rowStyle(record)">
              <td class="center-text first-col" :id="`rid-${record.$id}`" :class="{
                hide: noNumCol,
                error: state.rowerr[`rid-${record.$id}`]
              }" :pos="rowPos" @mouseover="numcolMouseOverWrapper" @click="rowLabelClickWrapper">
                <span v-html="recordLabel(state.pageTop + rowPos + 1, record)"></span>
              </td>
              <td v-for="(item, p) in state.fields" v-show="!item.invisible" :id="`id-${record.$id}-${item.name}`"
                :cell-RC="`${rowPos}-${item.name}`" :class="{
                  readonly: item.readonly,
                  error: state.errmsg[`id-${record.$id}-${item.name}`],
                  link: item.link && item.isLink && item.isLink(record),
                  select: item.options,
                  grouping: item.grouping,
                  expand: item.grouping && state.ungroup[item.name + record[item.name]],
                  datepick: item.type == 'date',
                  'sticky-column': item.sticky,
                  hideDuplicate: item.hideDuplicate && rowPos > 0 && isSameSinceLeft(state, p, record, pagingTable[rowPos - 1]),
                }" :key="p" :style="Object.assign(cellStyle(record, item), renderColumnCellStyleWrapper(item, record))"
                @mouseover="cellMouseOverWrapper" @mousemove="cellMouseMoveWrapper">
                <template v-if="item.format == 'html'"><span
                    v-html="item.toText(record[item.name], record, item, p)" /></template>
                <template v-else>{{ item.toText(record[item.name], record, item, p) }}</template>
              </td>
              <td v-if="state.vScroller.buttonHeight < state.vScroller.height" class="last-col"></td>
            </tr>
          </tbody>
          <tfoot>
            <tr v-show="pagingTable.length && state.summaryRow">
              <td class="row-summary first-col" :class="{ 'hide': noNumCol }">&nbsp;</td>
              <td v-for="(field, p) in state.fields" v-show="!field.invisible" class="row-summary"
                :colspan="p === state.fields.length - 1 && state.vScroller.buttonHeight < state.vScroller.height ? 2 : 1" :class="{
                  'sticky-column': field.sticky,
                  'summary-column1': p + 1 < state.fields.length && state.fields[p + 1].summary,
                  'summary-column2': field.summary
                }" :key="`f${p}`" :style="renderColumnCellStyleWrapper(field)">{{ state.summary[field.name] }}</td>
            </tr>
          </tfoot>
          <slot></slot>
        </table>

        <!-- Tool Tip -->
        <div v-show="state.tip" ref="tooltip" class="tool-tip">{{ state.tip }}</div>

        <!-- Text Tip -->
        <div v-show="state.textTip" ref="texttip" class="text-tip">{{ state.textTip }}</div>

        <!-- Editor Square -->
        <div v-show="state.focused" ref="inputSquare" class="input-square" @mousedown="inputSquareClickWrapper">
          <div style="position: relative; height: 100%; padding: 2px 2px 1px">
            <div class="rb-square" />
            <textarea ref="inputBox" id="inputBox" class="input-box" :style="{ opacity: state.inputBoxShow }"
              @blur="inputBoxBlurWrapper" @mousemove="inputBoxMouseMoveWrapper" @mousedown="inputBoxMouseDownWrapper" trim autocomplete="off"
              autocorrect="off" autocompitaize="off" :spellcheck="spellcheck"></textarea>
          </div>
        </div>

        <!-- Date Picker -->
        <div ref="dpContainer" v-show="state.showDatePicker" style="z-index:20; position:fixed">
          <date-picker ref="datepicker" inline auto-apply v-model="state.inputDateTime" @update:modelValue="datepickerClickWrapper"
            valueType="format"></date-picker>
        </div>

        <!-- Waiting scene -->
        <div v-show="state.processing" ref="frontdrop" class="front-drop">
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="spinner" role="img"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
            class="svg-inline--fa fa-spinner fa-w-16 fa-spin fa-3x">
            <path fill="currentColor"
              d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z">
            </path>
          </svg>
        </div>
      </div>

      <!-- Vertical Scroll Bar -->
      <div v-show="state.vScroller.buttonHeight < state.vScroller.height" ref="vScroll" class="v-scroll"
        :style="{ top: `${state.vScroller.top}px`, height: `${state.vScroller.height}px` }" @mousedown="vsMouseDownWrapper">
        <div ref="vScrollButton" class="v-scroll-button"
          :style="{ marginTop: `${state.vScroller.buttonTop}px`, height: `${state.vScroller.buttonHeight}px` }"
          @mousedown="vsbMouseDownWrapper">
          <div v-show="state.vScroller.runner" class="runner" v-html="state.vScroller.runner" />
        </div>
      </div>

      <!-- Autocomplete List -->
      <ul ref="autocomplete" v-show="state.focused && state.autocompleteInputs.length" class="autocomplete-results">
        <li v-for="(item, i) in state.autocompleteInputs" :key="i" :class="{ select: state.autocompleteSelect === i }"
          @mousedown.left.prevent="inputAutocompleteTextWrapper($event.target.textContent, $event)"
          class="autocomplete-result">{{
            item }}</li>
      </ul>

      <!-- Footer -->
      <div ref="footer" class="footer center-text" :class="{ hide: noFooter }" style="position:relative"
        @mousedown="ftMouseDownWrapper">
        <div ref="hScroll" class="h-scroll" @mousedown="sbMouseDownWrapper" />
        <span class="left-block" :class="{ 'hide': noNumCol }"></span>
        <span v-show="!noPaging" class="footer-left">
          <span v-html="localizedLabel.footerLeft(state.pageTop + 1, pageBottom, state.table.length)"></span>
        </span>
        <span v-show="!noPaging && pageBottom - state.pageTop < state.table.length">
          <template v-if="state.processing">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="spinner" role="img"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
              class="svg-inline--fa fa-spinner fa-w-16 fa-spin fa-sm">
              <path fill="currentColor"
                d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z">
              </path>
            </svg>
            &nbsp;
            <span v-html="localizedLabel.processing" />
          </template>
          <template v-else>
            <a :class="{ disabled: state.pageTop <= 0 }" @mousedown="firstPageWrapper">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-backward" role="img"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
                class="svg-inline--fa fa-step-backward fa-w-14 fa-sm">
                <path fill="currentColor"
                  d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z">
                </path>
              </svg>
              &nbsp;
              <span v-html="localizedLabel.first" />
            </a>
            &nbsp;|&nbsp;
            <a :class="{ disabled: state.pageTop <= 0 }" @mousedown="prevPageWrapper">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="backward" role="img"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                class="svg-inline--fa fa-backward fa-w-16 fa-sm">
                <path fill="currentColor"
                  d="M11.5 280.6l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2zm256 0l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2z">
                </path>
              </svg>
              &nbsp;
              <span v-html="localizedLabel.previous" />
            </a>
            &nbsp;|&nbsp;
            <a :class="{ disabled: state.pageTop + state.pageSize >= state.table.length }" @mousedown="nextPageWrapper">
              <span v-html="localizedLabel.next" />
              &nbsp;
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="forward" role="img"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                class="svg-inline--fa fa-forward fa-w-16 fa-sm">
                <path fill="currentColor"
                  d="M500.5 231.4l-192-160C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2zm-256 0l-192-160C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2z">
                </path>
              </svg>
            </a>
            &nbsp;|&nbsp;
            <a :class="{ disabled: state.pageTop + state.pageSize >= state.table.length }" @mousedown="lastPageWrapper">
              <span v-html="localizedLabel.last" />
              &nbsp;
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-forward" role="img"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
                class="svg-inline--fa fa-step-forward fa-w-14 fa-sm">
                <path fill="currentColor"
                  d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z">
                </path>
              </svg>
            </a>
          </template>
        </span>
        <span class="footer-right">
          <a :class="{ disabled: !state.showSelectedOnly && selectedCount <= 1 }" @mousedown="toggleSelectViewWrapper">
            <span v-html="localizedLabel.footerRight.selected" />
            <span :style="{ color: selectedCount > 0 ? 'red' : 'inherit' }">{{ selectedCount }}</span>
          </a>
          &nbsp;|&nbsp;
          <a :class="{ disabled: columnFilterString === '{}' }" @mousedown="toggleFilterViewWrapper">
            <span v-html="localizedLabel.footerRight.filtered" />
            <span :style="{ color: state.table.length !== state.filteredValue.length ? 'red' : 'inherit' }">{{ state.table.length
              }}</span>
          </a>
          &nbsp;|&nbsp;
          <a :class="{ disabled: true }">
            <span v-html="localizedLabel.footerRight.loaded" />
            <span>{{ state.filteredValue.length }}</span>
          </a>
        </span>
      </div>

      <input type="file" ref="importFile" accept=".xlsx, .xls, xlsm, .csv"
        style="position: absolute; top: 0; left: 0; width:0; height: 0; opacity:0; z-index:-1" @keyup="componentTabIntoWrapper"
        @change="doImportWrapper" />

      <panel-filter 
        ref="panelFilter"
        :refId="state.currentFilterRef"
        :show="state.showPanelFilter" 
        @close="state.showPanelFilter = false"
        @sort="sortWrapper"
        @calTable="calTableWrapper"
        :n-filter-count="nFilterCount" 
        :localized-label="localizedLabel" 
        :fields="state.fields"
        :table="state.table"
      />
      <panel-setting 
        :show="state.showPanelSetting" 
        v-model="state.fields" 
        :localized-label="localizedLabel" 
        @close="state.showPanelSetting = false"
        @import="importTableWrapper"
        @export="exportTableWrapper"
        @resetColumn="resetColumnWrapper"
        @calStickyLeft="calStickyLeftWrapper()"
        />
      <panel-find 
        :show="state.showPanelFind" 
        @doFind="doFindWrapper" 
        @close="state.showPanelFind = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  reactive, 
  computed, 
  watch, 
  onMounted, 
  onActivated, 
  onDeactivated, 
  onBeforeUnmount, 
  getCurrentInstance 
} from 'vue';
import VueExcelFilter from './components/VueExcelFilter.vue';
import PanelFilter from './components/filter/PanelFilter.vue';
import PanelSetting from './components/settings/PanelSetting.vue';
import PanelFind from './components/find/PanelFind.vue';
import DatePicker from '@vuepic/vue-datepicker';
import { exportTable, doImport, importTable } from './utils/excelLogic';
import { vsMouseDown, vsbMouseDown, vsbMouseUp, vsbMouseMove } from './utils/verticalScroll';
import { ftMouseDown, sbMouseDown, sbMouseMove } from './utils/horizontalScroll';
import { colSepMouseDown, colSepMouseOver, colSepMouseOut, colSepMouseUp } from './utils/columnSeparator';
import { doFind } from './utils/finder';
import { inputAutocompleteText } from './utils/autocomplete';
import { defaultLocalizedLabel, LocalizedLabel } from './const/constVars';
import {
  cellMouseOver,
  numcolMouseOver,
  mouseDown,   
  mouseOver,
} from './utils/cursor';
import {
  refreshPageSize,
  firstPage,
  lastPage,
  prevPage,
  nextPage,
} from './utils/paging';
import { 
  inputSquareClick, 
  inputBoxMouseMove, inputBoxMouseDown, inputBoxBlur
} from './utils/inputBox';
import { datepickerClick } from './utils/datePicker';
import { headerClick, completeHeaderChange, sort } from './utils/sort';
import {
  lazy,
  isSameSinceLeft,
  addEventListener,
  removeEventListener,
  toggleSelectAllRecords,
  rowLabelClick,
  calStickyLeft,
  getSetting,
} from './utils/excelEditor';
import { clearFilter, columnSuppress, columnAutoWidth, columnFillWidth } from './utils/customization';
import {
  tableScroll,

  winResize,
} from './utils/windowEvent';
import {
  resetColumn,
  componentTabInto,
  reset,
  toggleSelectView,
  toggleFilterView,
  registerColumn,
  refresh,
  calTable,
  renderColumnCellStyle,
} from './utils/other';
import '@vuepic/vue-datepicker/dist/main.css';

// Define Props
const props = defineProps({
  disablePanelSetting: {
    type: Boolean,
    default: false,
  },
  disablePanelFilter: {
    type: Boolean,
    default: false,
  },
  modelValue: { type: Array, default: () => [] },
  rowStyle: { type: Function, default: () => ({}) },
  cellStyle: { type: Function, default: () => ({}) },
  headerLabel: {
    type: Function,
    default: (label: string) => label,
  },
  recordLabel: {                                
    type: Function,
    default: (pos: number) => pos,
  },
  noFinding: { type: Boolean, default: false },
  noFindingNext: { type: Boolean, default: false },
  noSorting: { type: Boolean, default: false },
  noMassUpdate: { type: Boolean, default: false },
  filterRow: { type: Boolean, default: false },
  freeSelect: { type: Boolean, default: false },
  noFooter: { type: Boolean, default: false },
  noPaging: { type: Boolean, default: false },
  noNumCol: { type: Boolean, default: false },
  noMouseScroll: { type: Boolean, default: false },
  page: { type: Number, default: 0 },
  enterToSouth: { type: Boolean, default: false },
  nFilterCount: { type: Number, default: 1000 },
  height: { type: String, default: '' },
  width: { type: String, default: '100%' },
  wheelSensitivity: { type: Number, default: 30 },
  autocomplete: { type: Boolean, default: false },
  autocompleteCount: { type: Number, default: 50 },
  readonly: { type: Boolean, default: false },
  readonlyStyle: { type: Object, default: () => ({}) },
  remember: { type: Boolean, default: false },

  register: { type: Function, default: null },
  allowAddCol: { type: Boolean, default: false },
  noHeaderEdit: { type: Boolean, default: false },
  addColumn: { type: Function, default: null },
  spellcheck: { type: Boolean, default: false },
  newIfBottom: { type: Boolean, default: false },
  validate: { type: Function, default: null },
  localizedLabel: {
    type: Object as () => LocalizedLabel,
    default: () => defaultLocalizedLabel,
  },
  recordFilter: {
    type: Function,
    default: () => true,
  },
});

// Define Emits
const emit = defineEmits(['update:selectedCount', 'setting', 'page-changed']);

// References to DOM elements
const editor = ref<HTMLElement | null>(null);
const tableContent = ref<HTMLElement | null>(null);
const systable = ref<HTMLElement | null>(null);
const colgroupTr = ref<HTMLElement | null>(null);
const labelTr = ref<HTMLElement | null>(null);
const filterTr = ref<HTMLElement | null>(null);
const recordBody = ref<HTMLElement | null>(null);
const footer = ref<HTMLElement | null>(null);
const inputSquare = ref<HTMLElement | null>(null);
const inputBox = ref<HTMLTextAreaElement | null>(null);
const frontdrop = ref<HTMLElement | null>(null);

// Reactive State
const state = reactive({
  version: '1.3',
  tableContent: null as HTMLElement | null,
  systable: null as HTMLElement | null,
  colgroupTr: null as HTMLElement | null,
  labelTr: null as HTMLElement | null,
  filterTr: null as HTMLElement | null,
  recordBody: null as HTMLElement | null,
  footer: null as HTMLElement | null,

  pageSize: props.noPaging ? 999999 : 20,
  pageTop: 0,

  selected: {} as Record<string, any>,
  _selectedCount: 0,
  prevSelect: -1,
  processing: false,

  rowIndex: {} as Record<string, number>,

  currentRecord: null as any,
  currentRowPos: 0,
  currentColPos: 0,
  currentField: null as any,
  currentCell: null as any,
  inputBoxShow: 0,
  autocompleteInputs: [] as string[],
  autocompleteSelect: -1,

  errmsg: {} as Record<string, string>,
  rowerr: {} as Record<string, string>,
  tip: '',
  textTip: '',

  colHash: '',
  fields: [] as any[],
  focused: false,
  mousein: false,
  inputBoxChanged: false,

  columnFilter: {} as Record<string, string>,

  inputFind: '',
  calCellLeft: 0,
  calCellTop: 0,
  calCellTop2: 29,

  frontdrop: null as HTMLElement | null,

  sortPos: 0,
  sortDir: 0,
  redo: [] as any[],

  lazyTimeout: {} as Record<string, any>,
  lazyBuffer: {} as Record<string, any>,
  hScroller: {} as any,
  vScroller: {} as any,
  leftMost: 0,

  showDatePicker: false,
  inputDateTime: new Date(),

  table: [] as any[],
  filteredValue: [] as any[],
  lastFilterTime: '',
  summaryRow: false,
  summary: {} as Record<string, any>,
  showFilteredOnly: true,
  showSelectedOnly: false,

  ungroup: {} as Record<string, any>,

  showPanelFind: false,
  showPanelSetting: false,
  showPanelFilter: false,
  currentFilterRef: null as any,
});

// Computed Properties
const numColWidth = computed(() => {
  return props.noNumCol ? 0 : 40;
});

const selectedCount = computed({
  get: () => state._selectedCount,
  set: (value: number) => {
    state._selectedCount = value;
    emit('update:selectedCount', value);
  },
});

const token = computed(() => {
  const id = Array.from(document.querySelectorAll('.vue-excel-editor')).indexOf(editor.value!);
  return `vue-excel-editor-${id}`;
});

const columnFilterString = computed(() => {
  Object.keys(state.columnFilter).forEach((key) => {
    if (state.columnFilter[key].trim() === '') delete state.columnFilter[key];
  });
  return JSON.stringify(state.columnFilter);
});

const pagingTable = computed(() => {
  return state.table.slice(state.pageTop, state.pageTop + state.pageSize);
});

const pageBottom = computed(() => {
  if (state.filteredValue.length === 0) return 0;
  return state.pageTop + state.pageSize > state.table.length ? state.table.length : state.pageTop + state.pageSize;
});

const setting = computed({
  get: () => null,
  set: (setter: any) => {
    if (setter.fields) {
      if (setter.fields.length !== state.fields.length) return;
      let valid = true;
      const newFields = setter.fields.map((local: any) => {
        const current = state.fields.find(f => f.name === local.name);
        if (!current) {
          valid = false;
          return null;
        } else {
          if (typeof local.invisible !== 'undefined') current.invisible = local.invisible;
          if (typeof local.width !== 'undefined') current.width = local.width;
          if (typeof local.label !== 'undefined') current.label = local.label;
        }
        return current;
      }).filter(f => f !== null) as any[];
      if (valid) {
        state.fields = newFields;
        const instance = getCurrentInstance();
        instance?.proxy?.$forceUpdate();
      }
    }
  },
});

// Watchers
watch(() => props.modelValue, () => {
  lazy({ ...state, ...props }, () => {
    refresh({ ...state, ...props });
    if (state.pageTop > state.table.length)
      lastPage({ ...state, ...props });
  });
});

watch(columnFilterString, () => {
  state.lastFilterTime = String(new Date().getTime() % 1e8);
  state.processing = true;
  setTimeout(() => {
    state.pageTop = 0;
    refresh({ ...state, ...props });
    state.processing = false;
  }, 0);
});

watch(() => state.fields, () => {
  lazy({ ...state, ...props }, () => {
    const settingData = getSetting({ ...state, ...props });
    if (props.remember) {
      localStorage[`${window.location.pathname}${window.location.hash}.${token.value}`] = JSON.stringify(settingData);
    }
    emit('setting', settingData);
  });
}, { deep: true });

watch(() => state.processing, (newVal) => {
  if (newVal && frontdrop.value) {
    const rect = editor.value!.children[0].getBoundingClientRect();
    frontdrop.value.style.top = `${rect.top}px`;
    frontdrop.value.style.left = `${rect.left}px`;
    frontdrop.value.style.height = `${rect.height}px`;
    frontdrop.value.style.width = `${rect.width}px`;
  }
});

watch(() => state.pageTop, (newVal) => {
  emit('page-changed', newVal, newVal + state.pageSize - 1);
});

watch(() => state.pageSize, (newVal) => {
  emit('page-changed', state.pageTop, state.pageTop + newVal - 1);
});

// Lifecycle Hooks
onMounted(() => {
  state.editor = editor.value;
  state.tableContent = tableContent.value;
  state.systable = systable.value;
  state.colgroupTr = systable.value!.children[0] as HTMLElement;
  state.labelTr = (systable.value!.children[1] as HTMLElement).children[0] as HTMLElement;
  state.filterTr = (systable.value!.children[1] as HTMLElement).children[1] as HTMLElement;
  state.recordBody = systable.value!.children[2] as HTMLElement;
  state.footer = footer.value;
  state.inputSquare = inputSquare.value;
  state.inputBox = inputBox.value;
  state.frontdrop = frontdrop.value;

  if (props.height && state.systable && state.systable.parentNode instanceof HTMLElement) {
    state.systable.parentNode.style.height = props.height;
  }

  reset({ ...state, ...props });
  lazy({ ...state, ...props }, () => {
    if (state.labelTr) {
      (state.labelTr.children[0] as HTMLElement).style.height = `${state.labelTr.offsetHeight}px`;
      state.calCellTop2 = state.labelTr.offsetHeight;
    }
    refreshPageSize({ ...state, ...props });
    if (state.tableContent) {
      state.tableContent.scrollTo(0, state.tableContent.scrollTop);
    }
    calStickyLeft({ ...state, ...props });
  }, 200);

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => winResize({ ...state, ...props }));
    resizeObserver.observe(editor.value!);
  }
  addEventListener({ ...state, ...props });

  if (props.remember) {
    const saved = localStorage[`${window.location.pathname}${window.location.hash}.${token.value}`];
    if (saved) {
      const data = JSON.parse(saved);
      if (data.colHash === state.colHash)
        setting.value = data;
    }
  }
});

onActivated(() => {
  addEventListener({ ...state, ...props });
});

onDeactivated(() => {
  removeEventListener({ ...state, ...props });
});

onBeforeUnmount(() => {
  removeEventListener({ ...state, ...props });
});

// Methods
const calStickyLeftWrapper = () => {
  calStickyLeft({ ...state, ...props });
};

const resetColumnWrapper = () => {
  resetColumn({ ...state, ...props });
};

const componentTabIntoWrapper = (e: KeyboardEvent) => {
  componentTabInto({ ...state, ...props }, e);
};

const toggleSelectViewWrapper = (e: Event) => {
  toggleSelectView({ ...state, ...props }, e);
};

const toggleFilterViewWrapper = (e: Event) => {
  toggleFilterView({ ...state, ...props }, e);
};

const calTableWrapper = () => {
  calTable({ ...state, ...props });
};

const renderColumnCellStyleWrapper = (field: any, record: any) => {
  renderColumnCellStyle({ ...state, ...props }, field, record);
};

const registerColumnWrapper = (field: any) => {
  registerColumn({ ...state, ...props }, field);
};

/* *** Customization ************************************************************************************** */
const clearFilterWrapper = (name: string) => {
  clearFilter({ ...state, ...props }, name);
};

const columnSuppressWrapper = () => {
  columnSuppress({ ...state, ...props });
};

const columnAutoWidthWrapper = (name: string) => {
  columnAutoWidth({ ...state, ...props }, name);
};

const columnFillWidthWrapper = () => {
  columnFillWidth({ ...state, ...props });
};

/* *** Date Picker ********************************************************************************* */
const datepickerClickWrapper = () => {
  datepickerClick({ ...state, ...props });
};

/* *** Vertical Scrollbar ********************************************************************************* */
const vsMouseDownWrapper = (e: MouseEvent) => {
  vsMouseDown({ ...state, ...props }, e);
};

const vsbMouseDownWrapper = (e: MouseEvent) => {
  vsbMouseDown({ ...state, ...props }, e);
};

const vsbMouseUpWrapper = () => {
  vsbMouseUp({ ...state, ...props });
};

const vsbMouseMoveWrapper = (e: MouseEvent) => {
  vsbMouseMove({ ...state, ...props }, e);
};

/* *** Horizontal Scrollbar ********************************************************************************* */
const ftMouseDownWrapper = (e: MouseEvent) => {
  ftMouseDown({ ...state, ...props }, e);
};

const sbMouseDownWrapper = (e: MouseEvent) => {
  sbMouseDown({ ...state, ...props }, e);
};

const sbMouseMoveWrapper = (e: MouseEvent) => {
  sbMouseMove({ ...state, ...props }, e);
};

/* *** Window Event ******************************************************************************************* */
const tableScrollWrapper = () => {
  tableScroll({ ...state, ...props });
};

/* *** Column Separator ******************************************************************************************* */
const colSepMouseDownWrapper = (e: MouseEvent) => {
  colSepMouseDown({ ...state, ...props }, e);
};

const colSepMouseOverWrapper = (e: MouseEvent) => {
  colSepMouseOver({ ...state, ...props }, e);
};

const colSepMouseOutWrapper = (e: MouseEvent) => {
  colSepMouseOut({ ...state, ...props }, e);
};

const colSepMouseUpWrapper = (e: MouseEvent) => {
  colSepMouseUp({ ...state, ...props }, e);
};

/* *** Finder ******************************************************************************************* */
const doFindWrapper = (s: string) => {
  doFind({ ...state, ...props }, s);
};

/* *** Sort ******************************************************************************************* */
const headerClickWrapper = (e: MouseEvent, colPos: number) => {
  headerClick({ ...state, ...props }, e, colPos);
};

const completeHeaderChangeWrapper = (e: Event) => {
  completeHeaderChange({ ...state, ...props }, e);
};

const sortWrapper = (n: any, pos: number) => {
  sort({ ...state, ...props }, n, pos);
};

/* *** Paging ******************************************************************************************* */
const firstPageWrapper = (e: Event) => {
  firstPage({ ...state, ...props }, e);
};

const lastPageWrapper = (e: Event) => {
  lastPage({ ...state, ...props }, e);
};

const prevPageWrapper = (e: Event) => {
  prevPage({ ...state, ...props }, e);
};

const nextPageWrapper = (e: Event) => {
  nextPage({ ...state, ...props }, e);
};

/* *** Setting ******************************************************************************************* */
const settingClick = () => {
  if (!props.disablePanelSetting)
    state.showPanelSetting = true;
};

const panelFilterClick = (item: any) => {
  if (!props.disablePanelFilter) {
    state.currentFilterRef = (getCurrentInstance()?.refs[`filter-${item.name}`] as any)[0];
    state.showPanelFilter = true;
    // Optionally, you can call a method on PanelFilter if needed
    // e.g., (panelFilter.value as any).showPanel(state.currentFilterRef);
  }
};

/* *** Import/Export ************************************************************************************ */
const importTableWrapper = (cb: Function, errCb: Function) => {
  importTable({ ...state, ...props }, cb, errCb);
};

const doImportWrapper = (e: Event) => {
  doImport({ ...state, ...props }, e);
};

const exportTableWrapper = (format: string, selectedOnly: boolean, filename: string) => {
  exportTable({ ...state, ...props }, format, selectedOnly, filename);
};

/* *** Select ******************************************************************************************* */
const rowLabelClickWrapper = (e: Event) => {
  rowLabelClick({ ...state, ...props }, e);
};

const selectAllClick = () => {
  toggleSelectAllRecords({ ...state, ...props });
};

/* *** Cursor ******************************************************************************************* */
const mouseDownWrapper = (e: MouseEvent) => {
  mouseDown({ ...state, ...props }, e);
};

const cellMouseMoveWrapper = (e: MouseEvent) => {
  cellMouseOver({ ...state, ...props }, e);
};

const cellMouseOverWrapper = (e: MouseEvent) => {
  cellMouseOver({ ...state, ...props }, e);
};

const numcolMouseOverWrapper = (e: MouseEvent) => {
  numcolMouseOver({ ...state, ...props }, e);
};

const mouseOverWrapper = () => {
  mouseOver({ ...state, ...props });
};

const mouseOutWrapper = () => {
  mouseOver({ ...state, ...props }); // This seems to be intended as mouseOut logic
};

/* *** InputBox ***************************************************************************************** */
const inputSquareClickWrapper = () => {
  inputSquareClick({ ...state, ...props });
};

const inputBoxMouseMoveWrapper = (e: MouseEvent) => {
  inputBoxMouseMove({ ...state, ...props }, e);
};

const inputBoxMouseDownWrapper = (e: MouseEvent) => {
  inputBoxMouseDown({ ...state, ...props }, e);
};

const inputBoxBlurWrapper = () => {
  inputBoxBlur({ ...state, ...props });
};

/* *** Autocomplete **************************************************************************************** */
const inputAutocompleteTextWrapper = (text: string, e: MouseEvent) => {
  inputAutocompleteText(state, text, e);
};
</script>


<style scoped>
@import './styles/styles.css';
</style>