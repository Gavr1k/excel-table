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
            <col v-for="(item, p) in fields" v-show="!item.invisible" :key="p" :style="{ width: item.width }">
            <col v-if="vScroller.buttonHeight < vScroller.height" style="width:12px">
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
              <th v-for="(item, p) in fields" v-show="!item.invisible" :key="`th-${p}`"
                :colspan="p === fields.length - 1 && vScroller.buttonHeight < vScroller.height ? 2 : 1" :class="{
                  'sort-asc-sign': sortPos == p && sortDir == 1,
                  'sort-des-sign': sortPos == p && sortDir == -1,
                  'sticky-column': item.sticky,
                  'no-sorting': item.noSorting
                }" :style="{ left: item.left }" @mousedown="headerClickWrapper($event, p)"
                @contextmenu.prevent="panelFilterClick(item)">
                <div :class="{ 'filter-sign': columnFilter[p] }">
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
                style="vertical-align: middle; padding: 0" :style="{ top: calCellTop2 + 'px' }"
                @click="columnFilter = {}">
                <span v-if="Object.keys(columnFilter).length > 0">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eraser" role="img"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                    class="svg-inline--fa fa-eraser fa-w-16 fa-sm">
                    <path fill="currentColor"
                      d="M497.941 273.941c18.745-18.745 18.745-49.137 0-67.882l-160-160c-18.745-18.745-49.136-18.746-67.883 0l-256 256c-18.745 18.745-18.745 49.137 0 67.882l96 96A48.004 48.004 0 0 0 144 480h356c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12H355.883l142.058-142.059zm-302.627-62.627l137.373 137.373L265.373 416H150.628l-80-80 124.686-124.686z">
                    </path>
                  </svg>
                </span>
              </td>
              <vue-excel-filter v-for="(item, p) in fields" v-show="!item.invisible" :ref="`filter-${item.name}`"
                :colspan="p === fields.length - 1 ? 2 : 1" :key="`th2-${p}`" v-model="columnFilter[p]"
                :class="{ 'sticky-column': item.sticky }" :style="{ left: item.left }" class="column-filter" />
            </tr>
          </thead>
          <tbody @mousedown="mouseDownWrapper">
            <tr v-if="localizedLabel.noRecordIndicator && pagingTable.length == 0">
              <td colspan="100%" style="height:40px; vertical-align: middle; text-align: center"></td>
            </tr>
            <tr v-else v-for="(record, rowPos) in pagingTable" :key="rowPos"
              :class="{ select: typeof selected[pageTop + rowPos] !== 'undefined' }" :style="rowStyle(record)">
              <td class="center-text first-col" :id="`rid-${record.$id}`" :class="{
                hide: noNumCol,
                error: rowerr[`rid-${record.$id}`]
              }" :pos="rowPos" @mouseover="numcolMouseOverWrapper" @click="rowLabelClickWrapper">
                <span v-html="recordLabel(pageTop + rowPos + 1, record)"></span>
              </td>
              <td v-for="(item, p) in fields" v-show="!item.invisible" :id="`id-${record.$id}-${item.name}`"
                :cell-RC="`${rowPos}-${item.name}`" :class="{
                  readonly: item.readonly,
                  error: errmsg[`id-${record.$id}-${item.name}`],
                  link: item.link && item.isLink && item.isLink(record),
                  select: item.options,
                  grouping: item.grouping,
                  expand: item.grouping && ungroup[item.name + record[item.name]],
                  datepick: item.type == 'date',
                  'sticky-column': item.sticky,
                  hideDuplicate: item.hideDuplicate && rowPos > 0 && isSameSinceLeft(this, p, record, pagingTable[rowPos - 1]),
                }" :key="p" :style="Object.assign(cellStyle(record, item), renderColumnCellStyleWrapper(item, record))"
                @mouseover="cellMouseOverWrapper" @mousemove="cellMouseMoveWrapper">
                <template v-if="item.format == 'html'"><span
                    v-html="item.toText(record[item.name], record, item, p)" /></template>
                <template v-else>{{ item.toText(record[item.name], record, item, p) }}</template>
              </td>
              <td v-if="vScroller.buttonHeight < vScroller.height" class="last-col"></td>
            </tr>
          </tbody>
          <tfoot>
            <tr v-show="pagingTable.length && summaryRow">
              <td class="row-summary first-col" :class="{ 'hide': noNumCol }">&nbsp;</td>
              <td v-for="(field, p) in fields" v-show="!field.invisible" class="row-summary"
                :colspan="p === fields.length - 1 && vScroller.buttonHeight < vScroller.height ? 2 : 1" :class="{
                  'sticky-column': field.sticky,
                  'summary-column1': p + 1 < fields.length && fields[p + 1].summary,
                  'summary-column2': field.summary
                }" :key="`f${p}`" :style="renderColumnCellStyleWrapper(field)">{{ summary[field.name] }}</td>
            </tr>
          </tfoot>
          <slot></slot>
        </table>

        <!-- Tool Tip -->
        <div v-show="tip" ref="tooltip" class="tool-tip">{{ tip }}</div>

        <!-- Text Tip -->
        <div v-show="textTip" ref="texttip" class="text-tip">{{ textTip }}</div>

        <!-- Editor Square -->
        <div v-show="focused" ref="inputSquare" class="input-square" @mousedown="inputSquareClickWrapper">
          <div style="position: relative; height: 100%; padding: 2px 2px 1px">
            <div class="rb-square" />
            <textarea ref="inputBox" id="inputBox" class="input-box" :style="{ opacity: inputBoxShow }"
              @blur="inputBoxBlurWrapper" @mousemove="inputBoxMouseMoveWrapper" @mousedown="inputBoxMouseDownWrapper" trim autocomplete="off"
              autocorrect="off" autocompitaize="off" :spellcheck="spellcheck"></textarea>
          </div>
        </div>

        <!-- Date Picker -->
        <div ref="dpContainer" v-show="showDatePicker" style="z-index:20; position:fixed">
          <date-picker ref="datepicker" inline auto-apply v-model="inputDateTime" @update:modelValue="datepickerClickWrapper"
            valueType="format"></date-picker>
        </div>

        <!-- Waiting scene -->
        <div v-show="processing" ref="frontdrop" class="front-drop">
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
      <div v-show="vScroller.buttonHeight < vScroller.height" ref="vScroll" class="v-scroll"
        :style="{ top: `${vScroller.top}px`, height: `${vScroller.height}px` }" @mousedown="vsMouseDownWrapper">
        <div ref="vScrollButton" class="v-scroll-button"
          :style="{ marginTop: `${vScroller.buttonTop}px`, height: `${vScroller.buttonHeight}px` }"
          @mousedown="vsbMouseDownWrapper">
          <div v-show="vScroller.runner" class="runner" v-html="vScroller.runner" />
        </div>
      </div>

      <!-- Autocomplete List -->
      <ul ref="autocomplete" v-show="focused && autocompleteInputs.length" class="autocomplete-results">
        <li v-for="(item, i) in autocompleteInputs" :key="i" :class="{ select: autocompleteSelect === i }"
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
          <span v-html="localizedLabel.footerLeft(pageTop + 1, pageBottom, table.length)"></span>
        </span>
        <span v-show="!noPaging && pageBottom - pageTop < table.length">
          <template v-if="processing">
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
            <a :class="{ disabled: pageTop <= 0 }" @mousedown="firstPageWrapper">
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
            <a :class="{ disabled: pageTop <= 0 }" @mousedown="prevPageWrapper">
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
            <a :class="{ disabled: pageTop + pageSize >= table.length }" @mousedown="nextPageWrapper">
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
            <a :class="{ disabled: pageTop + pageSize >= table.length }" @mousedown="lastPageWrapper">
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
          <a :class="{ disabled: !showSelectedOnly && selectedCount <= 1 }" @mousedown="toggleSelectViewWrapper">
            <span v-html="localizedLabel.footerRight.selected" />
            <span :style="{ color: selectedCount > 0 ? 'red' : 'inherit' }">{{ selectedCount }}</span>
          </a>
          &nbsp;|&nbsp;
          <a :class="{ disabled: columnFilterString === '{}' }" @mousedown="toggleFilterViewWrapper">
            <span v-html="localizedLabel.footerRight.filtered" />
            <span :style="{ color: table.length !== filteredValue.length ? 'red' : 'inherit' }">{{ table.length
              }}</span>
          </a>
          &nbsp;|&nbsp;
          <a :class="{ disabled: true }">
            <span v-html="localizedLabel.footerRight.loaded" />
            <span>{{ filteredValue.length }}</span>
          </a>
        </span>
      </div>

      <input type="file" ref="importFile" accept=".xlsx, .xls, xlsm, .csv"
        style="position: absolute; top: 0; left: 0; width:0; height: 0; opacity:0; z-index:-1" @keyup="componentTabIntoWrapper"
        @change="doImportWrapper" />

      <panel-filter 
        ref="panelFilter"
        :refId="currentFilterRef"
        :show="showPanelFilter" 
        @close="showPanelFilter = false"
        :n-filter-count="nFilterCount" 
        :localized-label="localizedLabel" 
      />
      <panel-setting 
        :show="showPanelSetting" 
        v-model="fields" 
        :localized-label="localizedLabel" 
        @close="showPanelSetting = false"
        @import="importTableWrapper"
        @export="exportTableWrapper"
        @resetColumn="resetColumnWrapper"
        @calStickyLeft="calStickyLeftWrapper()"
        />
      <panel-find 
        :show="showPanelFind" 
        @doFind="doFindWrapper" 
        @close="showPanelFind = false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { getCurrentInstance, defineComponent } from 'vue'
import VueExcelFilter from './VueExcelFilter.vue'
import PanelFilter from './PanelFilter.vue'
import PanelSetting from './PanelSetting.vue'
import PanelFind from './PanelFind.vue'
import DatePicker from '@vuepic/vue-datepicker'
import { exportTable, doImport, importTable } from './utils/excelLogic';
import {calVScroll, vsMouseDown, vsbMouseDown, vsbMouseUp, vsbMouseMove} from './utils/verticalScroll';
import {ftMouseDown, sbMouseDown, sbMouseUp, sbMouseMove} from './utils/horizontalScroll';
import {colSepMouseDown, colSepMouseOver, colSepMouseOut, colSepMouseUp} from './utils/columnSeparator';
import {findPageTop, doFind} from './utils/finder';
import {calAutocompleteList, inputAutocompleteText} from './utils/autocomplete';
import {undoTransaction, newRecord, updateSelectedRows} from './utils/update';
import { defaultLocalizedLabel, LocalizedLabel } from './const/constVars';
import {
  moveTo, 
  moveToSouthWest, 
  moveToWest, 
  moveToEast, 
  moveWest, 
  moveEast, 
  moveNorth, 
  moveSouth, 
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
  moveInputSquare, 
  inputSquareClick, 
  inputBoxMouseMove, inputBoxMouseDown, inputCellWrite, inputBoxBlur, inputBoxComplete } from './utils/inputBox';

import {showDatePickerDiv, datepickerClick} from './utils/datePicker';

import {headerClick, completeHeaderChange, sort} from './utils/sort';

import {
  hashCode,
  lazy,
  isSameSinceLeft,
  tempKey,
  addEventListener,
  removeEventListener,
  filterGrouping,
  calSummary,
  reviseSelectedAfterTableChange,
  toggleSelectAllRecords,
  rowLabelClick,
  calStickyLeft,
  colSepMouseMove,
  getSetting,
  updateCell,
} from './utils/excelEditor';

import {setFilter, clearFilter, columnSuppress, columnAutoWidth, columnFillWidth } from './utils/customization';

import {
  tableScroll,
  winScroll,
  mousewheel,
  winResize,
  winPaste,
  winKeyup,
  winKeydown,
  adjustAutocompleteSelection,
  updateAutocompleteScroll,
  navigateWithTab,
  handleEnterKey,
  resetAutocompleteAndInput,
  handleDeleteOrBackspace,
  handleCharacterInput,
} from './utils/windowEvent';

import {
  resetColumn,
  componentTabInto,
  reset,
  toggleSelectView,
  toggleFilterView,
  registerColumn,
  insertColumn,
  newColumn,
  autoRegisterAllColumns,
  refresh,
  calTable,
  renderColumnCellStyle,
} from './utils/other';

import '@vuepic/vue-datepicker/dist/main.css'

export default defineComponent({
  components: {
    'vue-excel-filter': VueExcelFilter,
    'panel-filter': PanelFilter,
    'panel-setting': PanelSetting,
    'panel-find': PanelFind,
    'date-picker': DatePicker
  },
  props: {
    disablePanelSetting: {
      type: Boolean,
      default() {
        return false;
      }
    },
    disablePanelFilter: {
      type: Boolean,
      default() {
        return false;
      }
    },
    modelValue: { type: Array, default() { return [] } },
    rowStyle: { type: Function, default() { return {} } },
    cellStyle: { type: Function, default() { return {} } },
    headerLabel: {
      type: Function,
      default(label) {
        return label
      }
    },
    recordLabel: {                                
      type: Function,
      default(pos) {
        return pos
      }
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
    readonlyStyle: { type: Object, default() { return {} } },
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
      default: () => defaultLocalizedLabel
    },
    recordFilter: {
      type: Function,
      default() {
        return true
      }
    }
  },
  data() {
    const pageSize = this.noPaging ? 999999 : 20
    const dataset = {
      version: '1.3',
      tableContent: null,           // Table parent
      systable: null,               // TABLE dom node
      colgroupTr: null,             // colgroup TR dom node
      labelTr: null,                // THEAD label dom node
      filterTr: null,               // THEAD filter dom node
      recordBody: null,             // TBODY dom node
      footer: null,                 // TFOOTER dom node

      pageSize: pageSize,
      pageTop: 0,                   // Current page top pos of [table] array

      selected: {},                 // selected storage in hash, key is the pos of [table] array
      _selectedCount: 0,            // selected row count
      prevSelect: -1,               // previous select pos of [table] array
      processing: false,            // current general-purpose processing status

      rowIndex: {},                 // index of the record key to pos of [table] array

      currentRecord: null,          // focusing row content
      currentRowPos: 0,             // focusing array pos of [table] array
      currentColPos: 0,             // focusing pos of column/field
      currentField: null,           // focusing field object
      currentCell: null,
      inputBox: null,
      inputBoxShow: 0,
      inputSquare: null,
      autocompleteInputs: [],
      autocompleteSelect: -1,

      errmsg: {},
      rowerr: {},
      tip: '',
      textTip: '',

      colHash: '',
      fields: [],
      focused: false,
      mousein: false,
      inputBoxChanged: false,

      columnFilter: {},             // set filter storage in hash, key is the column pos

      inputFind: '',
      calCellLeft: 0,
      calCellTop: 0,
      calCellTop2: 29,

      frontdrop: null,              // frontdrop dom node

      sortPos: 0,                   // Sort column position
      sortDir: 0,                   // Sort direction, 1=Ascending, -1=Descending
      redo: [],                     // redo log

      lazyTimeout: {},
      lazyBuffer: {},
      hScroller: {},
      vScroller: {},
      leftMost: 0,

      showDatePicker: false,
      inputDateTime: new Date(),

      table: [],
      filteredValue: [],
      lastFilterTime: '',
      summaryRow: false,
      summary: {},
      showFilteredOnly: true,
      showSelectedOnly: false,

      ungroup: {},

      showPanelFind: false,
      showPanelSetting: false,
      showPanelFilter: false,
      currentFilterRef: null,
    }
    return dataset
  },
  computed: {
    numColWidth() {
      if (this.noNumCol) return 0
      else return 40
    },
    selectedCount: {
      get() {
        return this._selectedCount
      },
      set(value) {
        this._selectedCount = value
        this.$emit('update:selectedCount', value)
      }
    },
    token() {
      const id = Array.from(document.querySelectorAll('.vue-excel-editor')).indexOf(this.$el)
      return `vue-excel-editor-${id}`
    },
    columnFilterString() {
      Object.keys(this.columnFilter).forEach((key) => {
        if (this.columnFilter[key].trim() === '') delete this.columnFilter[key]
      })
      return JSON.stringify(this.columnFilter)
    },
    pagingTable() {
      return this.table.slice(this.pageTop, this.pageTop + this.pageSize)
    },
    pageBottom() {
      if (this.filteredValue.length === 0) return 0
      else return this.pageTop + this.pageSize > this.table.length ? this.table.length : this.pageTop + this.pageSize
    },
    setting: {
      get() {
        return null
      },
      set(setter) {
        if (setter.fields) {
          if (setter.fields.length !== this.fields.length) return
          let valid = true
          const newFields = setter.fields.map(local => {
            const current = this.fields.find(f => f.name === local.name)
            if (!current) valid = false
            else {
              if (typeof local.invisible !== 'undefined') current.invisible = local.invisible
              if (typeof local.width !== 'undefined') current.width = local.width
              if (typeof local.label !== 'undefined') current.label = local.label
            }
            return current
          })
          if (valid) {
            this.fields = newFields
            const instance = getCurrentInstance()
            instance?.proxy?.$forceUpdate()
          }
        }
      }
    }
  },
  watch: {
    modelValue() {
      lazy(this, () => {
        refresh(this)
        if (this.pageTop > this.table.length)
          lastPage(this);
      })
    },
    columnFilterString() {
      this.lastFilterTime = String(new Date().getTime() % 1e8)
      this.processing = true
      setTimeout(() => {
        this.pageTop = 0
        refresh(this)
        this.processing = false
      }, 0)
    },
    fields: {
      handler() {
        lazy(this, () => {
          const setting = getSetting(this)
          if (this.remember) localStorage[window.location.pathname + window.location.hash + '.' + this.token] = JSON.stringify(setting)
          this.$emit('setting', setting)
        })
      },
      deep: true
    },
    processing(newVal) {
      if (newVal) {
        const rect = this.$el.children[0].getBoundingClientRect()
        this.frontdrop.style.top = rect.top + 'px'
        this.frontdrop.style.left = rect.left + 'px'
        this.frontdrop.style.height = rect.height + 'px'
        this.frontdrop.style.width = rect.width + 'px'
      }
    },
    pageTop(newVal) {
      this.$emit('page-changed', newVal, newVal + this.pageSize - 1)
    },
    pageSize(newVal) {
      this.$emit('page-changed', this.pageTop, this.pageTop + newVal - 1)
    }
  },
  activated() {
    addEventListener(this);
  },
  deactivated() {
    removeEventListener(this);
  },
  beforeUnmount() {
    removeEventListener(this)
  },
  mounted() {
    this.editor = this.$refs.editor
    this.tableContent = this.$refs.tableContent
    this.systable = this.$refs.systable
    this.colgroupTr = this.systable.children[0]
    this.labelTr = this.systable.children[1].children[0]
    this.filterTr = this.systable.children[1].children[1]
    this.recordBody = this.systable.children[2]
    this.footer = this.$refs.footer
    this.inputSquare = this.$refs.inputSquare
    this.inputBox = this.$refs.inputBox
    this.frontdrop = this.$refs.frontdrop

    if (this.height)
      this.systable.parentNode.style.height = this.height

    reset(this)
    lazy(this, () => {
      this.labelTr.children[0].style.height = this.labelTr.offsetHeight + 'px'
      this.calCellTop2 = this.labelTr.offsetHeight
      refreshPageSize(this)
      this.tableContent.scrollTo(0, this.tableContent.scrollTop)
      calStickyLeft(this);
    }, 200)

    if (ResizeObserver) new ResizeObserver(() => winResize(this)).observe(this.editor)
    addEventListener(this);

    if (this.remember) {
      const saved = localStorage[window.location.pathname + window.location.hash + '.' + this.token]
      if (saved) {
        const data = JSON.parse(saved)
        if (data.colHash === this.colHash)
          this.setting = data
      }
    }
  },
  methods: {
    calStickyLeftWrapper() {
      calStickyLeft(this);
    },
    resetColumnWrapper () {
      resetColumn(this);
    },
    componentTabIntoWrapper(e) {
      componentTabInto(this, e);
    },
    toggleSelectViewWrapper(e) {
      toggleSelectView(this, e);
    },
    toggleFilterViewWrapper(e) {
      toggleFilterView(this, e);
    },
    calTableWrapper() {
      calTable(this);
    },
    renderColumnCellStyleWrapper(field, record) {
      renderColumnCellStyle(this, field, record);
    },
    registerColumnWrapper(field) {
      registerColumn(this, field);
    },

    /* *** Customization **************************************************************************************
     */

    clearFilterWrrapper(name) {
      clearFilter(this, name);
    },

    columnSuppressWrapper() {
      columnSuppress(this);
    },

    columnAutoWidthWrapper(name) {
      columnAutoWidth(this, name);
    },

    columnFillWidthWrapper() {
      columnFillWidth(this);
    },

    /* *** Date Picker *********************************************************************************
     */
     datepickerClickWrapper() {
      datepickerClick(context);
    },

    /* *** Vertical Scrollbar *********************************************************************************
     */
    vsMouseDownWrapper(e) {
      vsMouseDown(this, e);
    },
    vsbMouseDownWrapper(e) {
      vsbMouseDown(this, e);
    },
    vsbMouseUp() {
      vsbMouseUp(this);
    },
    vsbMouseMove(e) {
      vsbMouseMove(this, e);
    },

    /* *** Horizontal Scrollbar *********************************************************************************
     */
    ftMouseDownWrapper(e) {
      ftMouseDown(this, e);
    },
    sbMouseDownWrapper(e) {
      sbMouseDown(this, e);
    },
    sbMouseMove(e) {
      sbMouseMove(this, e);
    },

    /* *** Window Event *******************************************************************************************
     */
    tableScrollWrapper() {
      tableScroll(this);
    },
    /* *** Column Separator *******************************************************************************************
     */
    colSepMouseDownWrapper(e) {
      colSepMouseDown(this, e);
    },
    colSepMouseOverWrapper(e) {
      colSepMouseOver(this, e);
    },
    colSepMouseOutWrapper(e) {
      colSepMouseOut(this, e);
    },
    colSepMouseUpWrapper(e) {
      colSepMouseUp(this, e);
    },

    /* *** Finder *******************************************************************************************
     */
    doFindWrapper(s) {
      doFind(this, s)
    },
    /* *** Sort *******************************************************************************************
     */
    headerClickWrapper(e, colPos) {
      headerClick(this, e ,colPos);
    },
    completeHeaderChangeWrapper(e) {
      completeHeaderChange(this, e);
    },
    sortWrapper(n, pos) {
      sort(this, n, pos);
    },

    /* *** Paging *******************************************************************************************
     */
    firstPageWrapper(e) {
      firstPage(this, e);
    },
    lastPageWrapper(e) {
      lastPage(this, e);
    },
    prevPageWrapper(e) {
      prevPage(this, e);
    },
    nextPageWrapper(e) {
      nextPage(this, e);
    },

    /* *** Setting *******************************************************************************************
     */
    settingClick() {
      if (!this.disablePanelSetting)
        this.showPanelSetting = true;
    },

    panelFilterClick(item) {
      if (!this.disablePanelFilter)
        this.currentFilterRef = this.$refs[`filter-${item.name}`][0]
        this.showPanelFilter = true;
        // this.$refs.panelFilter.showPanel(this.$refs[`filter-${item.name}`][0]);
    },

    /* *** Import/Export ************************************************************************************
     */
    importTableWrapper(cb, errCb) {
      importTable(this, cb, errCb);
    },
    doImportWrapper(e) {
      doImport(this, e);
    },
    exportTableWrapper(format, selectedOnly, filename) {
        exportTable(this, format, selectedOnly, filename)
    },

    /* *** Select *******************************************************************************************
     */
    rowLabelClickWrapper(e) {
      rowLabelClick(this, e);
    },
    selectAllClick() {
      toggleSelectAllRecords(this)
    },

    /* *** Cursor *******************************************************************************************
     */
    mouseDownWrapper(e) {
      mouseDown(this, e);
    },
    cellMouseMoveWrapper(e) {
      cellMouseOver(this, e);
    },
    cellMouseOverWrapper(e) {
      cellMouseOver(this, e);
    },
    numcolMouseOverWrapper(e) {
      numcolMouseOver(this, e);
    },
    mouseOverWrapper() {
      mouseOver(this);
    },
    mouseOutWrapper() {
      mouseOver(this);
    },

    /* *** InputBox *****************************************************************************************
     */
    inputSquareClickWrapper() {
      inputSquareClick(this);
    },
    inputBoxMouseMoveWrapper(e) {
      inputBoxMouseMove(this, e);
    },
    inputBoxMouseDownWrapper(e) {
      inputBoxMouseDown(this, e);
    },
    inputBoxBlurWrapper() {
      inputBoxBlur(this);
    },
    /* *** Autocomplete ****************************************************************************************
     */
    inputAutocompleteTextWrapper(text, e) {
      inputAutocompleteText(this, text, e);
    },
  }
})
</script>

<style scoped>
@import './styles/styles.css';
</style>