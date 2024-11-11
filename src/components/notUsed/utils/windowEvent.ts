import { lazy } from './excelEditor';
import { calVScroll} from './verticalScroll';
import {undoTransaction} from './update';
import {toggleSelectAllRecords} from './excelEditor';
import {doFind} from './finder';
import { moveToWest, moveToEast, moveWest, moveEast, moveNorth, moveSouth } from './cursor';

import { refreshPageSize, prevPage, nextPage } from './paging';

import { inputCellWrite, inputBoxBlur, inputBoxComplete } from './inputBox';

import {calAutocompleteList, inputAutocompleteText} from './autocomplete';

import { showDatePickerDiv } from './datePicker';



export function tableScroll(context: any): void {
  context.showDatePicker = false;
  context.autocompleteInputs = [];

  if (context.focused && context.currentField) {
    context.inputSquare.style.marginLeft = `${context.currentField.sticky ? context.tableContent.scrollLeft - context.squareSavedLeft : 0}px`;
  }

  if (context.tableContent.scrollTop !== context.vScroller.lastTop) {
    calVScroll(context);
    
    if (context.$refs.vScrollButton) {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => context.$refs.vScrollButton.classList.remove('focus'), 1000);
    }

    context.vScroller.lastTop = context.tableContent.scrollTop;
  }

  if (context.tableContent.scrollLeft !== context.hScroller.lastLeft) {
    if (context.$refs.hScroll && context.hScroller.tableUnseenWidth) {
      context.$refs.hScroll.classList.add('focus');
      lazy(context, () => context.$refs.hScroll.classList.remove('focus'), 1000);
      
      const ratio = context.tableContent.scrollLeft / context.hScroller.tableUnseenWidth;
      context.$refs.hScroll.style.left = `${context.hScroller.scrollerUnseenWidth * ratio}px`;
    }

    context.hScroller.lastLeft = context.tableContent.scrollLeft;
  }
}

export function winScroll(context: any): void {
  context.showDatePicker = false;
  context.autocompleteInputs = [];
}

export function mousewheel(context: any, e: WheelEvent): boolean {
  if (context.noMouseScroll || !context.mousein || e.deltaY === 0) return false;

  let adjust = 0;

  if (e.deltaY > context.wheelSensitivity && context.pageTop + context.pageSize < context.table.length) {
    adjust = 1;
  } else if (e.deltaY < -context.wheelSensitivity && context.pageTop > 0) {
    adjust = -1;
  }

  if (adjust) {
    context.pageTop += adjust;
    setTimeout(() => calVScroll(context));

    if (context.$refs.vScrollButton) {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => context.$refs.vScrollButton.classList.remove('focus'), 1000);
    }
  }

  e.preventDefault();
  e.stopPropagation();
  return false;
}

export function winResize(context: any): void {
  lazy(context, () => refreshPageSize(context), 500);
}

export function winPaste(context: any, e: ClipboardEvent): void {
  const target = e.target as HTMLElement;

  if (target.tagName !== 'TEXTAREA') return;

  if (!context.mousein && !context.focused) return;

  if (!context.currentField || context.currentField.readonly) return;

  if (context.inputBoxShow) {
    context.inputBoxChanged = true;
    return;
  }

  const clipboardData = e.clipboardData?.getData('text/plain');
  if (clipboardData) {
    inputCellWrite(context, clipboardData);
  }
  
  e.preventDefault();
}

export function winKeyup(context: any, e: KeyboardEvent): void {
  if (!e.altKey) {
    context.systable.classList.remove('alt');
  }

  if (context.inputBoxShow && context.currentField?.type === 'password') {
    setTimeout(() => {
      const currentValue = context.inputBox.value.split('').map((char, index) =>
        char === context.currentField.masking ? context.inputBox._value[index] : char
      );
      context.inputBox._value = currentValue.join('');
      context.inputBox.value = context.currentField.masking.repeat(currentValue.length);
    });
  }
}

export function winKeydown(context: any, e: KeyboardEvent): void {
  if (e.altKey) context.systable.classList.add('alt');
  if (!context.mousein && !context.focused) return;

  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'z': // Ctrl+Z
        undoTransaction(context);
        e.preventDefault();
        break;
      case 'a': // Ctrl+A
        toggleSelectAllRecords(context);
        e.preventDefault();
        break;
      case 'c': // Ctrl+C
        context.inputBox.value = context.currentCell.textContent;
        context.inputBox.focus();
        context.inputBox.select();
        document.execCommand('copy');
        e.preventDefault();
        break;
      case 'f': // Ctrl+F
        if (!context.noFinding) {
          context.showPanelFind = true;
          e.preventDefault();
        }
        break;
      case 'g': // Ctrl+G
        if (!context.noFindingNext && context.inputFind !== '') {
          doFind(context);
          e.preventDefault();
        }
        break;
      case 'l': // Ctrl+L
        e.preventDefault();
        calAutocompleteList(context, true);
        break;
    }
  } else {
    if (context.currentRowPos < 0) return;

    switch (e.key) {
      case 'ArrowLeft':
        if (context.focused && !context.inputBoxShow) moveWest(context);
        else if (context.inputBox.selectionStart === 0) moveWest(context);
        e.preventDefault();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!context.focused) return;
        context.autocompleteInputs.length === 0 ? moveNorth(context) : adjustAutocompleteSelection(context, -1);
        break;
      case 'ArrowRight':
        if (context.focused && !context.inputBoxShow) moveEast(context, e);
        else if (context.inputBox.selectionEnd === context.inputBox.value.length) moveEast(context, e);
        e.preventDefault();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!context.focused) return;
        context.autocompleteInputs.length === 0 ? moveSouth(context) : adjustAutocompleteSelection(context, 1);
        break;
      case 'Tab':
        e.preventDefault();
        navigateWithTab(context, e.shiftKey);
        break;
      case 'Enter':
        e.preventDefault();
        handleEnterKey(context);
        break;
      case 'Escape':
        resetAutocompleteAndInput(context);
        break;
      case 'PageUp':
        prevPage(context);
        e.preventDefault();
        break;
      case 'PageDown':
        nextPage(context);
        e.preventDefault();
        break;
      case 'Delete':
      case 'Backspace':
        handleDeleteOrBackspace(context, e);
        break;
      default:
        handleCharacterInput(context, e);
        break;
    }
  }
}

export function adjustAutocompleteSelection(context: any, direction: number): void {
  const newIndex = context.autocompleteSelect + direction;
  if (newIndex >= 0 && newIndex < context.autocompleteInputs.length) {
    context.autocompleteSelect = newIndex;
    updateAutocompleteScroll(context);
  }
}

export function updateAutocompleteScroll(context: any): void {
  const itemHeight = 23;
  const maxVisibleItems = 10;
  const scrollTop = context.autocompleteSelect * itemHeight;
  context.$refs.autocomplete.scrollTop = Math.max(scrollTop - itemHeight * (maxVisibleItems - 1), 0);
}

export function navigateWithTab(context: any, isShiftPressed: boolean): void {
  if (isShiftPressed) {
    if (!moveWest(context) && moveNorth(context)) moveToEast(context);
    else inputBoxBlur(context);
  } else {
    if (!moveEast(context) && moveSouth(context)) moveToWest(context);
    else inputBoxBlur(context);
  }
}

export function handleEnterKey(context: any): void {
  if (context.autocompleteInputs.length > 0 && context.autocompleteSelect !== -1) {
    inputAutocompleteText(context, context.autocompleteInputs[context.autocompleteSelect]);
  } else {
    context.enterToSouth ? moveSouth(context) : moveEast(context);
  }
  inputBoxComplete(context);
}

export function resetAutocompleteAndInput(context: any): void {
  context.showDatePicker = false;
  context.autocompleteInputs = [];
  context.autocompleteSelect = -1;
  if (context.inputBoxShow) {
    context.inputBox.value = context.currentCell.textContent;
    context.inputBoxShow = 0;
    context.inputBoxChanged = false;
  }
}

export function handleDeleteOrBackspace(context: any, e: KeyboardEvent): void {
  if (context.currentField.readonly || context.autocompleteInputs.length) return;
  if (context.inputBoxShow) {
    context.inputBoxChanged = true;
    setTimeout(() => calAutocompleteList(context, true));
    return;
  }
  context.inputBox.value = '';
  inputBoxComplete(context);
}

export function handleCharacterInput(context: any, e: KeyboardEvent): void {
  if (context.currentField.readonly || e.altKey || e.key.length > 1) return;
  if (!context.inputBoxShow && context.currentField.type === 'date') {
    showDatePickerDiv(context);
  } else {
    context.inputBox.value = '';
    context.inputBoxShow = 1;
    context.inputBox.focus();
    setTimeout(() => calAutocompleteList(context, false));
  }
  context.inputBoxChanged = true;
}

