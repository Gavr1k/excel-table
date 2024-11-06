<template>
  <div ref="editor" class="vue-excel-editor" :style="{ display: 'inline-block', width }">
    <div class="component-content">
      <!-- No record -->
      <div v-if="localizedLabel.noRecordIndicator && pagingTable.length == 0" class="norecord"
        :style="{ bottom: noFooter ? '12px' : '37px' }">
        {{ localizedLabel.noRecordIndicator }}
      </div>

      <div ref="tableContent" class="table-content" :class="{ 'no-footer': noFooter }" @scroll="tableScroll"
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
                }" :style="{ left: item.left }" @mousedown="headerClick($event, p)"
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
          <tbody @mousedown="mouseDown">
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
                }" :key="p" :style="Object.assign(cellStyle(record, item), renderColumnCellStyle(item, record))"
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
                }" :key="`f${p}`" :style="renderColumnCellStyle(field)">{{ summary[field.name] }}</td>
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
          <date-picker ref="datepicker" inline auto-apply v-model="inputDateTime" @update:modelValue="datepickerClick"
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
            <a :class="{ disabled: pageTop <= 0 }" @mousedown="firstPage">
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
            <a :class="{ disabled: pageTop <= 0 }" @mousedown="prevPage">
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
            <a :class="{ disabled: pageTop + pageSize >= table.length }" @mousedown="nextPage">
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
            <a :class="{ disabled: pageTop + pageSize >= table.length }" @mousedown="lastPage">
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
          <a :class="{ disabled: !showSelectedOnly && selectedCount <= 1 }" @mousedown="toggleSelectView">
            <span v-html="localizedLabel.footerRight.selected" />
            <span :style="{ color: selectedCount > 0 ? 'red' : 'inherit' }">{{ selectedCount }}</span>
          </a>
          &nbsp;|&nbsp;
          <a :class="{ disabled: columnFilterString === '{}' }" @mousedown="toggleFilterView">
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
        style="position: absolute; top: 0; left: 0; width:0; height: 0; opacity:0; z-index:-1" @keyup="componentTabInto"
        @change="doImportWrapper" />

      <panel-filter 
        ref="panelFilter" 
        :n-filter-count="nFilterCount" 
        :localized-label="localizedLabel" 
      />
      <panel-setting 
        :show="showPanelSetting" 
        v-model="fields" 
        :localized-label="localizedLabel" 
        @close="showPanelSetting = false"
        @import="importTable"
        @export="exportTableWrapper"
        @resetColumn="resetColumn"
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
import { exportTable, doImport } from './utils/excelLogic';
import {calVScroll, vsMouseDown, vsbMouseDown, vsbMouseUp, vsbMouseMove} from './utils/verticalScroll';
import {ftMouseDown, sbMouseDown, sbMouseUp, sbMouseMove} from './utils/horizontalScroll';
import {colSepMouseDown, colSepMouseOver, colSepMouseOut, colSepMouseUp} from './utils/columnSeparator';
import {findPageTop, doFind} from './utils/finder';
import {calAutocompleteList, inputAutocompleteText} from './utils/autocomplete';
import {undoTransaction, newRecord, updateSelectedRows} from './utils/update';
import { defaultLocalizedLabel, LocalizedLabel } from './const/constVars';
import { 
  moveInputSquare, 
  inputSquareClick, 
  inputBoxMouseMove, inputBoxMouseDown, inputCellWrite, inputBoxBlur, inputBoxComplete } from './utils/inputBox';
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
  mouseOver,
  numcolMouseOver,
  cellMouseOver,
  calStickyLeft,
  colSepMouseMove,
  getSetting,
  updateCell,
} from './utils/excelEditor';

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
        this.refresh()
        if (this.pageTop > this.table.length)
          this.lastPage()
      })
    },
    columnFilterString() {
      this.lastFilterTime = String(new Date().getTime() % 1e8)
      this.processing = true
      setTimeout(() => {
        this.pageTop = 0
        this.refresh()
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

    this.reset()
    lazy(this, () => {
      this.labelTr.children[0].style.height = this.labelTr.offsetHeight + 'px'
      this.calCellTop2 = this.labelTr.offsetHeight
      this.refreshPageSize()
      this.tableContent.scrollTo(0, this.tableContent.scrollTop)
      calStickyLeft(this);
    }, 200)

    if (ResizeObserver) new ResizeObserver(this.winResize).observe(this.editor)
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
    resetColumn () {
      this.fields = []
      this.tableContent.scrollTo(0, this.tableContent.scrollTop)
      calStickyLeft(context);
    },
    componentTabInto(e) {
      if (e.keyCode === 9) {
        if (!moveInputSquare(this, this.currentRowPos, this.currentColPos))
          moveInputSquare(this, 0, 0)
      }
    },
    reset() {
      this.errmsg = {}
      this.redo = []
      this.showFilteredOnly = true
      this.showSelectedOnly = false
      this.columnFilter = {}
      this.sortPos = 0
      this.sortDir = 0
      this.inputFind = ''
      this.pageTop = 0
      this.selected = {}
      this.selectedCount = 0
      this.prevSelect = -1
      this.processing = false
      this.rowIndex = {}
      this.refresh()
    },
    toggleSelectView(e) {
      if (e) e.stopPropagation()
      this.showSelectedOnly = !this.showSelectedOnly
      this.firstPage()
      return this.refresh()
    },
    toggleFilterView(e) {
      if (e) e.stopPropagation()
      this.showFilteredOnly = !this.showFilteredOnly
      return this.refresh()
    },
    registerColumn(field) {
      let pos = this.fields.findIndex(item => item.pos > field.pos)
      if (pos === -1) pos = this.fields.length
      this.fields.splice(pos, 0, field)
      if (this.register) this.register(field, pos)
      if (field.register) field.register(field, pos)
      if (field.summary) this.summaryRow = true
      this.colHash = hashCode(this.version + JSON.stringify(this.fields))
    },
    insertColumn(pos) {
      const colname = 'COL-' + Math.random().toString().slice(2, 6)
      let colDef = {
        name: colname,
        label: colname,
        type: 'string',
        width: '100px',

        validate: null,
        change: null,
        link: null,
        sort: null,

        keyField: false,
        sticky: false,
        allowKeys: null,
        mandatory: false,
        lengthLimit: 0,

        autocomplete: this.autocomplete,
        textTransform: null,
        initStyle: 'left',
        invisible: false,
        readonly: this.readonly,
        pos: 0,
        options: null,
        summary: null,
        toValue: t => t,
        toText: t => t,
        register: null
      }
      if (this.addColumn) colDef = this.addColumn(colDef)
      this.newColumn(colDef, pos)
    },
    newColumn(field, pos) {
      this.fields.splice(pos, 0, field)
      if (this.register) this.register(field, pos)
      if (field.register) field.register(field, pos)
      if (field.summary) this.summaryRow = true
      this.colHash = hashCode(this.version + JSON.stringify(this.fields))
    },
    autoRegisterAllColumns(rows) {
      const widths = rows.slice(0, 25)
        .reduce((t, v) => Object.keys(v).map((s, i) => !t || v[s].length > t[i] ? v[s].length : t[i]), 0)
        .map(v => Math.min(Math.max(v * 8.2, 55), 250))

      Object.keys(rows[0]).forEach((col, i) => {
        if (col === '$id') return
        this.registerColumn({
          name: col,
          label: col,
          type: widths[i] ? 'string' : 'number',
          width: (widths[i] ? widths[i] : 75) + 'px',
          validate: null,
          change: null,
          link: null,
          keyField: false,
          sticky: false,
          tabStop: true,
          allowKeys: null,
          mandatory: false,
          lengthLimit: 0,
          autocomplete: this.autocomplete,
          initStyle: { textAlign: widths[i] ? 'left' : 'right' },
          invisible: false,
          readonly: this.readonly,
          pos: 0,
          options: null,
          summary: null,
          sort: null,
          toValue: t => t,
          toText: t => t,
          register: null
        })
      })
    },
    refresh() {
      this.prevSelect = -1
      if (this.fields.length === 0 && this.modelValue.length && Object.keys(this.modelValue[0])) {
        this.autoRegisterAllColumns(this.modelValue)
      }
      this.calTable()
      calStickyLeft(this)
      this.refreshPageSize()
    },
    calTable() {
      this.textTip = ''
      let seed = String(new Date().getTime() % 1e8)
      this.modelValue.forEach((rec, i) => {
        if (!rec.$id) rec.$id = seed + '-' + ('000000' + i).slice(-7)
      })

      if (this.showFilteredOnly === false) {
        this.table = this.modelValue
      }
      else {
        const filterColumnList = Object.keys(this.columnFilter)
        const filter = {}
        filterColumnList.forEach((k) => {
          switch (true) {
            case this.columnFilter[k].startsWith('<='):
              filter[k] = { type: 1, modelValue: this.columnFilter[k].slice(2).trim().toUpperCase() }
              if (this.fields[k].type === 'number') filter[k].modelValue = Number(filter[k].modelValue)
              break
            case this.columnFilter[k].startsWith('<>'):
              filter[k] = { type: 9, modelValue: this.columnFilter[k].slice(2).trim().toUpperCase() }
              break
            case this.columnFilter[k].startsWith('<'):
              filter[k] = { type: 2, modelValue: this.columnFilter[k].slice(1).trim().toUpperCase() }
              if (this.fields[k].type === 'number') filter[k].modelValue = Number(filter[k].modelValue)
              break
            case this.columnFilter[k].startsWith('>='):
              filter[k] = { type: 3, modelValue: this.columnFilter[k].slice(2).trim().toUpperCase() }
              if (this.fields[k].type === 'number') filter[k].modelValue = Number(filter[k].modelValue)
              break
            case this.columnFilter[k].startsWith('>'):
              filter[k] = { type: 4, modelValue: this.columnFilter[k].slice(1).trim().toUpperCase() }
              if (this.fields[k].type === 'number') filter[k].modelValue = Number(filter[k].modelValue)
              break
            case this.columnFilter[k].startsWith('='):
              filter[k] = { type: 0, modelValue: this.columnFilter[k].slice(1).trim().toUpperCase() }
              break
            case this.columnFilter[k].startsWith('*') && this.columnFilter[k].endsWith('*'):
              filter[k] = { type: 5, modelValue: this.columnFilter[k].slice(1).slice(0, -1).trim().toUpperCase() }
              break
            case this.columnFilter[k].startsWith('*') && !this.columnFilter[k].slice(1).includes('*'):
              filter[k] = { type: 6, modelValue: this.columnFilter[k].slice(1).trim().toUpperCase() }
              break
            case this.columnFilter[k].startsWith('~'):
              filter[k] = { type: 8, modelValue: this.columnFilter[k].slice(1).trim() }
              break
            case this.columnFilter[k].endsWith('*') && !this.columnFilter[k].slice(0, -1).includes('*'):
              filter[k] = { type: 7, modelValue: this.columnFilter[k].slice(0, -1).trim().toUpperCase() }
              break
            case this.columnFilter[k].includes('*') || this.columnFilter[k].includes('?'):
              filter[k] = { type: 8, modelValue: '^' + this.columnFilter[k].replace(/\*/g, '.*').replace(/\?/g, '.').trim() + '$' }
              break
            default:
              filter[k] = { type: 5, modelValue: this.columnFilter[k].trim().toUpperCase() }
              break
          }
        })
        this.filteredValue = this.modelValue.filter(record => this.recordFilter(record))
        this.filteredValue = this.filteredValue.filter((record, i) => filterGrouping(this, record, i, this.modelValue))
        if (filterColumnList.length === 0)
          this.table = this.filteredValue
        else {
          this.table = this.filteredValue.filter((record) => {

            if (record.$id > this.lastFilterTime) return true

            const content = {}
            filterColumnList.forEach((k) => {
              const val = record[this.fields[k].name]
              if (this.fields[k].type === 'number' && filter[k].type <= 4)
                content[k] = val
              else
                content[k] = typeof val === 'undefined' || val === null ? '' : String(val).toUpperCase()
            })

            for (let i = 0; i < filterColumnList.length; i++) {
              const k = filterColumnList[i]
              switch (filter[k].type) {
                case 0:
                  if (`${content[k]}` !== `${filter[k].modelValue}`) return false
                  break
                case 1:
                  if (filter[k].modelValue < content[k]) return false
                  break
                case 2:
                  if (filter[k].modelValue <= content[k]) return false
                  break
                case 3:
                  if (filter[k].modelValue > content[k]) return false
                  break
                case 4:
                  if (filter[k].modelValue >= content[k]) return false
                  break
                case 5:
                  if (!content[k].includes(filter[k].modelValue)) return false
                  break
                case 6:
                  if (!content[k].endsWith(filter[k].modelValue)) return false
                  break
                case 7:
                  if (!content[k].startsWith(filter[k].modelValue)) return false
                  break
                case 8:
                  if (!new RegExp(filter[k].modelValue, 'i').test(content[k])) return false
                  break
                case 9:
                  if (`${content[k]}` === `${filter[k].modelValue}`) return false
                  break
              }
            }
            return true
          })
        }
      }

      reviseSelectedAfterTableChange(this)
      if (this.showSelectedOnly) {
        this.table = this.table.filter((rec, i) => this.selected[i])
        reviseSelectedAfterTableChange(this)
      }
      calSummary(this)
    },
    renderColumnCellStyle(field, record) {
      let result = field.initStyle
      if (typeof result === 'function') result = result(record, field)
      if (field.readonly) result = Object.assign(result, this.readonlyStyle)
      if (field.left) result.left = field.left
      if (record && field.color)
        result.color = (typeof field.color === 'function' ? field.color(record) : field.color)
      return result
    },

    /* *** Customization **************************************************************************************
     */
    setFilter(name, filterText) {
      const ref = this.$refs[`filter-${name}`][0]
      ref.$el.textContent = filterText
      ref.$emit('update:modelValue', filterText)
    },

    clearFilter(name) {
      if (!name) this.columnFilter = {}
      else this.setFilter(name, '')
    },

    columnSuppress() {
      if (this.table.length === 0) return
      const cols = {}
      this.table.forEach((row) => {
        Object.keys(row).forEach((field) => {
          if (row[field]) cols[field] = 1
        })
      })
      const showCols = Object.keys(cols)
      this.fields.forEach((field) => {
        if (!showCols.includes(field.name))
          field.invisible = true
      })
      // this.refresh()
    },

    /* Still evaluating */
    columnAutoWidth(name) {
      if (this.table.length === 0) return
      let doFields = this.fields
      if (name) doFields = [this.fields.find(f => f.name === name)]

      const cols = {}
      this.table.forEach((row) => {
        doFields.forEach((field) => {
          if (row[field.name] && (!cols[field.name] || cols[field.name] < row[field.name].length))
            cols[field.name] = row[field.name].length
        })
      })
      doFields.forEach((field) => {
        let width = cols[field.name] * 12
        if (width > 450) width = 450
        field.width = width + 'px'
      })
      // this.refresh()
    },

    columnFillWidth() {
      if (this.table.length === 0) return
      if (!this.editor) return
      const doFields = this.fields.filter(f => f.autoFillWidth)
      const count = doFields.length
      if (!count) return

      lazy(this, () => {
        let fullWidth = this.editor.getBoundingClientRect().width
        let viewWidth = this.fields.filter(f => !f.invisible).reduce((c, f) => c + parseFloat(f.width), 0)
        viewWidth += this.numColWidth
        if (this.vScroller.buttonHeight < this.vScroller.height) fullWidth -= 13
        const fillWidth = viewWidth - fullWidth + 2
        if (Math.abs(fillWidth) > 1)
          doFields.forEach(f => {
            const w = parseFloat(f.width) - fillWidth / count
            f.width = (w > parseFloat(f.origWidth) ? w : parseFloat(f.origWidth)) + 'px'
          })
      })
    },

    /* *** Date Picker *********************************************************************************
     */
    showDatePickerDiv() {
      if (!this.$refs.dpContainer) return
      const cellRect = this.currentCell.getBoundingClientRect()
      this.$refs.dpContainer.style.left = (cellRect.left) + 'px'
      this.$refs.dpContainer.style.top = (cellRect.bottom) + 'px'
      this.inputDateTime = new Date(this.currentCell.textContent)
      this.showDatePicker = true
      lazy(this, () => {
        if (!this.$refs.dpContainer) return
        const r = this.$refs.dpContainer.getBoundingClientRect()
        if (r.bottom > window.innerHeight)
          this.$refs.dpContainer.style.top = (cellRect.top - r.height) + 'px'
        if (r.right > window.innerWidth)
          this.$refs.dpContainer.style.left = (window.innerWidth - r.width) + 'px'
      })
    },
    datepickerClick() {
      const offset = new Date().getTimezoneOffset() * 60 * 1000
      // const m = moment(this.inputDateTime)
      switch (this.currentField.type) {
        case 'date':
          // this.inputBox.value = m.format('YYYY-MM-DD')
          this.inputBox.value = new Date(new Date(this.inputDateTime) - offset).toISOString().slice(0, 10)
          break
        case 'datetime':
          // this.inputBox.value = m.format('YYYY-MM-DD hh:mn:00')
          this.inputBox.value = new Date(new Date(this.inputDateTime) - offset).toISOString().replace('T', ' ').slice(0, 16) + ':00'
          break
        case 'datetimesec':
          this.inputBox.value = new Date(new Date(this.inputDateTime) - offset).toISOString().replace('T', ' ').slice(0, 19)
          // this.inputBox.value = m.format('YYYY-MM-DD hh:mn:ss')
          break
        case 'datetick':
        case 'datetimetick':
        case 'datetimesectick':
          this.inputBox.value = new Date(new Date(this.inputDateTime) - offset).getTime()
          break
      }
      this.inputBoxShow = 0
      inputCellWrite(this, this.inputBox.value)
      this.showDatePicker = false
      this.focused = true
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
    tableScroll() {
      this.showDatePicker = false
      this.autocompleteInputs = []
      if (this.focused && this.currentField)
        this.inputSquare.style.marginLeft =
          (this.currentField.sticky ? this.tableContent.scrollLeft - this.squareSavedLeft : 0) + 'px'

      if (this.tableContent.scrollTop !== this.vScroller.lastTop) {
        calVScroll(this)
        if (this.$refs.vScrollButton) {
          this.$refs.vScrollButton.classList.add('focus')
          lazy(this, () => this.$refs.vScrollButton.classList.remove('focus'), 1000)
        }
      }
      this.vScroller.lastTop = this.tableContent.scrollTop

      if (this.tableContent.scrollLeft !== this.hScroller.lastLeft) {
        if (this.$refs.hScroll && this.hScroller.tableUnseenWidth) {
          this.$refs.hScroll.classList.add('focus')
          lazy(this, () => this.$refs.hScroll.classList.remove('focus'), 1000)
          const ratio = this.tableContent.scrollLeft / this.hScroller.tableUnseenWidth
          this.$refs.hScroll.style.left = (this.hScroller.scrollerUnseenWidth * ratio) + 'px'
        }
      }
      this.hScroller.lastLeft = this.tableContent.scrollLeft
    },
    winScroll() {
      this.showDatePicker = false
      this.autocompleteInputs = []
    },
    mousewheel(e) {
      if (this.noMouseScroll || !this.mousein || !e.deltaY) return
      let adjust = 0
      if (e.deltaY > 1 * this.wheelSensitivity && this.pageTop + this.pageSize < this.table.length) adjust = 1
      else if (e.deltaY < -1 * this.wheelSensitivity && this.pageTop > 0) adjust = -1
      if (adjust) {
        this.pageTop += adjust
        setTimeout(() => calVScroll(this));
        if (this.$refs.vScrollButton) {
          this.$refs.vScrollButton.classList.add('focus')
          lazy(this, () => this.$refs.vScrollButton.classList.remove('focus'), 1000)
        }
      }
      e.preventDefault()
      e.stopPropagation()
      return false
    },
    winResize() {
      lazy(this, this.refreshPageSize, 500)
    },
    winPaste(e) {
      if (e.target.tagName !== 'TEXTAREA') return
      if (!this.mousein && !this.focused) return
      if (!this.currentField || this.currentField.readonly) return
      if (this.inputBoxShow) {
        this.inputBoxChanged = true
        return
      }
      const text = (e.originalEvent || e).clipboardData.getData('text/plain')
      inputCellWrite(this, text)
      e.preventDefault()
    },
    winKeyup(e) {
      if (!e.altKey) this.systable.classList.remove('alt')
      if (this.inputBoxShow && this.currentField.type === 'password') {
        setTimeout(() => {
          const v = this.inputBox.value.split('').map((c, i) => c === this.currentField.masking ? this.inputBox._value[i] : c)
          this.inputBox._value = v.join('')
          this.inputBox.value = this.currentField.masking.repeat(v.length)
        })
      }
    },
    winKeydown(e) {
      if (e.altKey) this.systable.classList.add('alt')
      if (!this.mousein && !this.focused) return
      if (e.ctrlKey || e.metaKey)
        switch (e.keyCode) {
          case 90: // z
            undoTransaction(this)
            e.preventDefault()
            break
          case 65: // a
            toggleSelectAllRecords(this)
            e.preventDefault()
            break
          case 67: // c
            this.inputBox.value = this.currentCell.textContent
            this.inputBox.focus()
            this.inputBox.select()
            document.execCommand('copy')
            e.preventDefault()
            break
          case 70: // f
            if (!this.noFinding) {
              this.showPanelFind = true;
              e.preventDefault()
            }
            break
          case 71: // g
            if (!this.noFindingNext && this.inputFind !== '') {
              doFind()
              e.preventDefault()
            }
            break
          case 76: // l
            e.preventDefault()
            calAutocompleteList(this, true)
            break
        }
      else {
        if (this.currentRowPos < 0) return
        switch (e.keyCode) {
          case 37:  // Left Arrow
            if (!this.focused) return
            if (!this.inputBoxShow) {
              this.moveWest(e)
              e.preventDefault()
            }
            else {
              if (this.inputBox.selectionStart === 0) {
                this.moveWest(e)
                e.preventDefault()
              }
            }
            break
          case 38:  // Up Arrow
            if (!this.focused) return
            e.preventDefault()
            if (this.autocompleteInputs.length === 0)
              this.moveNorth()
            else
              if (this.autocompleteSelect > 0) {
                this.autocompleteSelect--
                const showTop = this.autocompleteSelect * 23
                if (showTop < this.$refs.autocomplete.scrollTop)
                  this.$refs.autocomplete.scrollTop = showTop
              }
              else
                if (this.autocompleteSelect === -1) {
                  this.autocompleteSelect = 0
                  // this.autocompleteSelect = this.autocompleteInputs.length - 1
                }
            break
          case 9:  // Tab
            if (!this.focused) return
            if (e.shiftKey) {
              if (!this.moveWest(e)) {
                if (this.moveNorth(e))
                  this.moveToEast(e)
                else
                  return inputBoxBlur(this)
              }
            }
            else {
              if (!this.moveEast(e)) {
                if (this.moveSouth(e))
                  this.moveToWest(e)
                else
                  return inputBoxBlur(this)
              }
            }
            e.preventDefault()
            break
          case 39: // Right Arrow
            if (!this.focused) return
            if (!this.inputBoxShow) {
              this.moveEast(e)
              e.preventDefault()
            }
            else {
              if (this.inputBox.selectionEnd === this.inputBox.value.length) {
                this.moveEast(e)
                e.preventDefault()
              }
            }
            break
          case 40:  // Down Arrow
            if (!this.focused) return
            e.preventDefault()
            if (this.autocompleteInputs.length === 0) {
              this.moveSouth(e)
            }
            else
              if (this.autocompleteSelect < this.autocompleteInputs.length - 1) {
                this.autocompleteSelect++
                if (this.autocompleteSelect >= 10) {
                  const showTop = this.autocompleteSelect * 23 - 206
                  const scrollTop = this.$refs.autocomplete.scrollTop
                  if (scrollTop < showTop)
                    this.$refs.autocomplete.scrollTop = showTop
                }
              }
            break
          case 13:  // Enter
            if (!this.focused) return
            e.preventDefault()
            if (this.autocompleteInputs.length === 0 || this.autocompleteSelect === -1) {
              if (this.enterToSouth)
                this.moveSouth(e)
              else
                this.moveEast(e)
            }
            else if (this.autocompleteSelect !== -1 && this.autocompleteSelect < this.autocompleteInputs.length) {
              inputAutocompleteText(this, this.autocompleteInputs[this.autocompleteSelect])
            }
            else {
              this.inputBox.value = this.currentCell.textContent
              this.inputBoxShow = 0
              this.inputBoxChanged = false
            }
            inputBoxComplete(this)
            break
          case 27:  // Esc
            if (!this.focused) return
            this.showDatePicker = false
            this.autocompleteInputs = []
            this.autocompleteSelect = -1
            if (this.inputBoxShow) {
              e.preventDefault()
              this.inputBox.value = this.currentCell.textContent
              this.inputBoxShow = 0
              this.inputBoxChanged = false
            }
            break
          case 33:  // Page Up
            this.prevPage()
            e.preventDefault()
            break
          case 34:  // Page Down
            this.nextPage()
            e.preventDefault()
            break
          case 8:   // Delete
          case 46:  // BS
            if (!this.focused) return
            if (this.inputBoxShow) {
              this.inputBoxChanged = true
              setTimeout(() => calAutocompleteList(this, true))
              return
            }
            if (this.currentField.readonly) return
            if (this.autocompleteInputs.length) return
            this.inputBoxChanged = true
            this.inputBox.value = ''
            inputBoxComplete(this)
            break
          default:
            if (!this.focused) return
            if (this.currentField.readonly) return
            if (e.altKey) return
            if (e.key !== 'Process' && e.key.length > 1) return
            if (!this.inputBoxShow && this.currentField.type === 'date') {
              this.showDatePickerDiv()
              return
            }
            if (this.currentField.allowKeys) {
              if (this.currentField.allowKeys.constructor.name === 'Function') {
                if (!this.currentField.allowKeys(e.key.toUpperCase())) return e.preventDefault()
              }
              else
                if (this.currentField.allowKeys.indexOf(e.key.toUpperCase()) === -1) return e.preventDefault()
            }
            if (this.inputBoxShow && this.currentField.lengthLimit && this.inputBox.value.length >= this.currentField.lengthLimit) return e.preventDefault()
            if (!this.inputBoxShow) {
              if (['select', 'map', 'action'].includes(this.currentField.type)) {
                setTimeout(() => calAutocompleteList(this, true))
                if (e.keyCode === 32) return e.preventDefault()
                this.inputBox.value = ''
                this.inputBoxShow = 1
                this.inputBox.focus()
                return
              }
              this.inputBox.value = ''
              this.inputBoxShow = 1
              this.inputBox.focus()
              setTimeout(() => calAutocompleteList(this, false))
            }
            else {
              setTimeout(() => calAutocompleteList(this, this.autocompleteInputs.length))
            }
            this.inputBoxChanged = true
            break
        }
      }
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
    headerClick(e, colPos) {
      if (!this.noHeaderEdit && e.target.tagName === 'SPAN') {
        e.target.contentEditable = true
        e.target.addEventListener('focusout', this.completeHeaderChange)
        return
      }
      if (e.which === 1) {
        e.preventDefault()
        if (this.sortPos === colPos && this.sortDir > 0)
          this.sort(-1, colPos)
        else if (this.sortDir === 0)
          this.sort(1, colPos)
        else
          this.sort(0, colPos)
      }
    },
    completeHeaderChange(e) {
      const th = e.target.parentElement.parentElement
      const index = Array.from(th.parentElement.children).findIndex(v => v === th)
      this.fields[index - 1].label = e.target.textContent
    },
    sort(n, pos) {
      const colPos = typeof pos === 'undefined' ? this.columnFilterRef.colPos : pos
      const field = this.fields[colPos]
      if (field.noSorting) return

      this.processing = true

      const name = field.name
      setTimeout(() => {
        let sorting = field.sorting
        if (!sorting) {
          if (field.type === 'number')
            sorting = (a, b) => {
              if (Number(a) > Number(b)) return 1
              if (Number(a) < Number(b)) return -1
              return 0
            }
          else
            sorting = (a, b) => {
              return String(a).localeCompare(String(b))
            }
        }
        if (n === 0) {
          this.modelValue.sort((a, b) => a.$id > b.$id ? 1 : -1)
          this.sortPos = 0
        }
        else {
          this.modelValue.sort((a, b) => {
            if (field.sort) return field.sort(a, b) * -n
            else return sorting(a[name], b[name]) * -n
          })
          this.sortPos = colPos
        }
        this.sortDir = n
        this.refresh()
        this.processing = false
      }, 0)
    },

    /* *** Paging *******************************************************************************************
     */
    refreshPageSize() {
      if (this.$refs.hScroll) {
        const fullWidth = this.systable.getBoundingClientRect().width
        const viewWidth = this.tableContent.getBoundingClientRect().width
        this.hScroller.tableUnseenWidth = fullWidth - viewWidth
        this.$refs.hScroll.style.width = (100 * viewWidth / fullWidth) + '%'
        const scrollerWidth = this.$refs.hScroll.getBoundingClientRect().width
        this.hScroller.scrollerUnseenWidth = this.footer.getBoundingClientRect().width - this.numColWidth - scrollerWidth
      }

      let outerElement = this.editor
      let bottomOffset = 0
      if (this.height !== 'auto') {
        while (outerElement && !outerElement.style.height && outerElement.style.height !== 'auto') {
          const style = getComputedStyle(outerElement)
          bottomOffset += parseInt(style.marginBottom)
          bottomOffset += parseInt(style.paddingBottom)
          bottomOffset += parseInt(style.borderBottomWidth)
          outerElement = outerElement.parentElement
        }
      }
      if (outerElement) {
        const style = getComputedStyle(outerElement)
        bottomOffset += parseInt(style.paddingBottom)
        bottomOffset += parseInt(style.borderBottomWidth)
      }

      const outerHeight = outerElement?.clientHeight || window.innerHeight
      const outerTop = outerElement?.getBoundingClientRect().top || 0

      if (!this.noPaging) {
        const offset = bottomOffset + (this.summaryRow ? 25 : 0) + (this.noFooter ? 0 : 25)
        let controlHeight = outerHeight - (this.recordBody.getBoundingClientRect().top - outerTop) - offset

        if (this.height) {
          if (this.height === 'auto') {
            const p = this.editor.parentElement
            if (p && p.scrollHeight > p.clientHeight)
              controlHeight += p.clientHeight - p.scrollHeight
          }
          else {
            const height = parseInt(this.height) + this.systable.getBoundingClientRect().top - this.recordBody.getBoundingClientRect().top
            if (controlHeight > height) controlHeight = height
          }
        }
        this.pageSize = this.page || Math.floor(controlHeight / 24)
      }
      else if (this.height === 'auto') {
        let h = Math.floor(window.innerHeight - this.tableContent.getBoundingClientRect().top - 25)
        let offset = 4
        if (this.filterRow) offset += 29
        if (this.summaryRow) offset += 25
        if (!this.footerRow) offset += 25
        h = Math.min(24 * (this.table.length - this.pageTop) + offset, h)
        this.systable.parentNode.style.height = h + 'px'
      }
      this.columnFillWidth()
      setTimeout(() => calVScroll(this))
    },
    firstPage(e) {
      if (e) e.stopPropagation()
      this.pageTop = 0
      calVScroll(this);
      if (this.$refs.vScrollButton) {
        setTimeout(() => {
          this.$refs.vScrollButton.classList.add('focus')
          lazy(this, () => {
            if (!this.$refs.vScrollButton) return
            this.$refs.vScrollButton.classList.remove('focus')
          }, 1000)
        })
      }
    },
    lastPage(e) {
      if (e) e.stopPropagation()
      this.pageTop = this.table.length - this.pageSize < 0 ? 0 : this.table.length - this.pageSize
      calVScroll(this)
      if (this.$refs.vScrollButton) {
        setTimeout(() => {
          this.$refs.vScrollButton.classList.add('focus')
          lazy(this, () => {
            if (!this.$refs.vScrollButton) return
            this.$refs.vScrollButton.classList.remove('focus')
          }, 1000)
        })
      }
    },
    prevPage(e) {
      if (e) e.stopPropagation()
      this.pageTop = this.pageTop < this.pageSize ? 0 : this.pageTop - this.pageSize
      calVScroll(this)
      if (this.$refs.vScrollButton) {
        setTimeout(() => {
          this.$refs.vScrollButton.classList.add('focus')
          lazy(this, () => {
            if (!this.$refs.vScrollButton) return
            this.$refs.vScrollButton.classList.remove('focus')
          }, 1000)
        })
      }
    },
    nextPage(e) {
      if (e) e.stopPropagation()
      if (this.pageTop + this.pageSize < this.table.length)
        this.pageTop = Math.min(this.pageTop + this.pageSize, this.table.length - this.pageSize)
      calVScroll(this)
      if (this.$refs.vScrollButton) {
        setTimeout(() => {
          this.$refs.vScrollButton.classList.add('focus')
          lazy(this, () => {
            if (!this.$refs.vScrollButton) return
            this.$refs.vScrollButton.classList.remove('focus')
          }, 1000)
        })
      }
    },

    /* *** Setting *******************************************************************************************
     */
    settingClick() {
      if (!this.disablePanelSetting)
        this.showPanelSetting = true;
    },

    panelFilterClick(item) {
      if (!this.disablePanelFilter)
        this.$refs.panelFilter.showPanel(this.$refs[`filter-${item.name}`][0]);
    },

    /* *** Import/Export ************************************************************************************
     */
    importTable(cb, errCb) {
      this.$refs.importFile.click()
      this.importCallback = cb
      this.importErrorCallback = errCb
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
    moveTo(rowPos, colPos) {
      colPos = colPos || 0
      const done = moveInputSquare(this, rowPos - this.pageTop, colPos)
      this.focused = true
      setTimeout(() => this.inputBox.focus())
      return done
    },
    moveToSouthWest() {
      let goRowPos = this.table.length - 1
      let goColPos = 0
      while (this.fields[goColPos].invisible && goColPos < this.fields.length - 1) goColPos++
      return this.moveTo(goRowPos, goColPos)
    },
    moveToWest() {
      let goRowPos = this.currentRowPos
      let goColPos = 0
      while (this.fields[goColPos].invisible && goColPos < this.fields.length - 1) goColPos++
      return this.moveTo(goRowPos, goColPos)
    },
    moveToEast() {
      let goRowPos = this.currentRowPos
      let goColPos = this.fields.length - 1
      while (this.fields[goColPos].invisible && goColPos > 0) goColPos--
      return this.moveTo(goRowPos, goColPos)
    },
    moveWest() {
      if (this.focused && this.currentColPos > 0) {
        let goColPos = this.currentColPos - 1
        while (this.fields[goColPos].invisible && goColPos > 0) goColPos--
        if (goColPos === -1 || this.fields[goColPos].invisible) return false
        return moveInputSquare(this, this.currentRowPos, goColPos)
      }
      return false
    },
    moveEast() {
      if (this.focused && this.currentColPos < this.fields.length - 1) {
        let goColPos = this.currentColPos + 1
        while (this.fields[goColPos].invisible && goColPos < this.fields.length - 1) goColPos++
        if (goColPos === this.fields.length || this.fields[goColPos].invisible) return false
        return moveInputSquare(this, this.currentRowPos, goColPos)
      }
      return false
    },
    moveNorth() {
      if (this.focused) {
        const done = moveInputSquare(this, this.currentRowPos - 1, this.currentColPos)
        calVScroll(this)
        if (this.$refs.vScrollButton) {
          setTimeout(() => {
            this.$refs.vScrollButton.classList.add('focus')
            lazy(this, () => {
              if (!this.$refs.vScrollButton) return
              this.$refs.vScrollButton.classList.remove('focus')
            }, 1000)
          })
        }
        return done
      }
      return false
    },
    moveSouth() {
      if (this.focused) {
        if (this.currentRowPos + 1 >= (this.pageBottom - this.pageTop) && this.pageBottom >= this.table.length) {
          if (this.readonly) return false
          if (!this.newIfBottom) return false
            newRecord(this, {}, false, true)
          setTimeout(this.moveSouth, 0)
          return true
        }
        const done = moveInputSquare(this, this.currentRowPos + 1, this.currentColPos)
        calVScroll(this)
        if (this.$refs.vScrollButton) {
          setTimeout(() => {
            this.$refs.vScrollButton.classList.add('focus')
            lazy(this, () => {
              if (!this.$refs.vScrollButton) return
              this.$refs.vScrollButton.classList.remove('focus')
            }, 1000)
          })
        }
        return done
      }
      return false
    },
    mouseDown(e) {
      if (e.target.parentNode.parentNode.tagName === 'TBODY' && !e.target.classList.contains('first-col')) {
        e.preventDefault()
        const row = e.target.parentNode
        const colPos = Array.from(row.children).indexOf(e.target) - 1
        const rowPos = Array.from(row.parentNode.children).indexOf(row)

        if (colPos !== this.currentColPos || rowPos !== this.currentRowPos)
          inputBoxBlur(this)

        this.currentField = this.fields[colPos]
        this.currentCell = row.children[colPos + 1]
        this.currentRecord = this.table[this.pageTop + rowPos]

        this.$emit('cell-click', { rowPos, colPos }, this.currentCell.textContent, this.currentRecord, this.currentField, this)
        if (typeof this.currentField.cellClick === 'function')
          this.currentField.cellClick(this.currentCell.textContent, this.currentRecord, rowPos, colPos, this.currentField, this)
        if (this.currentField && this.currentField.link /* && e.altKey */ && this.currentCell.textContent)
          return setTimeout(() => this.currentField.link(this.currentCell.textContent, this.currentRecord, rowPos, colPos, this.currentField, this))
        if (this.currentField.grouping) {
          this.ungroup[this.currentField.name + this.currentCell.textContent] = !this.ungroup[this.currentField.name + this.currentCell.textContent]
          this.refresh()
          return
        }

        setTimeout(() => this.inputBox.focus())
        this.focused = true
        moveInputSquare(this, rowPos, colPos)

        if (this.currentField.listByClick) return calAutocompleteList(this, true)
        if (e.target.offsetWidth - e.offsetX > 25) return
        if (e.target.offsetWidth < e.target.scrollWidth) {
          // show textTip
          this.textTip = this.currentCell.textContent
          this.$refs.texttip.style.opacity = 0
          const rect = e.target.getBoundingClientRect()
          setTimeout(() => {
            const r = this.$refs.texttip.getBoundingClientRect()
            if (rect.bottom + r.height > window.innerHeight) {
              // show at top
              this.$refs.texttip.style.top = (rect.top - r.height) + 'px'
            }
            else {
              this.$refs.texttip.style.top = rect.bottom + 'px'
            }
            if (rect.left + r.width > window.innerWidth)
              this.$refs.texttip.style.left = (rect.right - r.width) + 'px'
            else
              this.$refs.texttip.style.left = rect.left + 'px'
            this.$refs.texttip.style.opacity = 1
          })
          // this.$refs.texttip.style.top = rect.bottom + 'px'
          // this.$refs.texttip.style.left = rect.left + 'px'
        }
        if (this.currentField.readonly) return
        this.inputBox.value = this.currentCell.textContent
        if (e.target.classList.contains('select')) calAutocompleteList(this, true)
        if (e.target.classList.contains('datepick')) this.showDatePickerDiv()
      }
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