import {updateCell, tempKey, lazy} from './excelEditor';

import { lastPage } from './paging';

import { moveToSouthWest } from './cursor';

import { refresh } from './other';

function deleteRecord(context: any, valueRowPos: number, isUndo: boolean): void {
  if (context.currentRowPos === valueRowPos) context.moveNorth();

  const rec = context.modelValue.splice(valueRowPos, 1)[0];

  setTimeout(() => {
    lazy(context, rec, (buf: any) => {
      context.$emit('delete', buf);

      if (!isUndo) {
        context.redo.push(
          buf.map((t: any) => ({
            type: 'd',
            rec: t
          }))
        );
      }

      refresh(context);
    });
  }, 100);
}

export function undoTransaction(context: any, e?: Event): void {
  if (e) e.preventDefault();

  if (context.redo.length === 0) return;

  const transaction = context.redo.pop();

  transaction.forEach((t: any) => {
    try {
      if (t.type === 'd') {
        newRecord(context, t.rec, false, true, true);
      } 
      else if (t.field && t.field.keyField && t.oldKeys.includes(t.newVal)) {
        const valueRowPos = context.modelValue.findIndex((v: any) => v.$id === t.$id);
        if (valueRowPos >= 0) {
          deleteRecord(context, valueRowPos, true);
        }
      } 
      else {
        updateCell(context, t.$id, t.field.name, t.oldVal, true);
      }
    } catch (error) {
      console.warn("Ошибка при отмене транзакции:", error);
    }
  });
}

export function newRecord(
  context: any, 
  rec: Record<string, any> = {}, 
  selectAfterDone: boolean = false, 
  noLastPage: boolean = false, 
  isUndo: boolean = false
): Record<string, any> {
  context.fields.forEach((field: any) => {
    if (rec[field.name] === undefined) {
      rec[field.name] = field.keyField ? `§${tempKey()}` : null;
    }
  });

  const id = rec.$id || tempKey();
  rec.$id = id;

  context.modelValue.push(rec);
  const rowPos = context.table.push(rec) - 1;

  if (selectAfterDone) context.selected[rowPos] = id;

  Object.keys(rec).forEach((name: string) => {
    const field = context.fields.find((f: any) => f.name === name);
    if (field) updateCell(context, rec, field, rec[name], isUndo);
  });

  if (!noLastPage) {
    lazy(context, () => {
      lastPage(context);
      moveToSouthWest(context);
    });
  }

  return rec;
}

export function updateSelectedRows(context: any, field: any, setText: string): void {
  context.processing = true;

  setTimeout(() => {
    Object.keys(context.selected).forEach((recPos: string) => {
      const pos = parseInt(recPos, 10);
      const newValue = field.toValue(setText, context.table[pos], field);
      updateCell(context, pos, field, newValue);
    });

    context.processing = false;
  }, 0);
}


