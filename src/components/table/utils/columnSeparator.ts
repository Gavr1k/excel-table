import {colSepMouseMove, getSetting} from './excelEditor';
import { insertColumn } from './other';

export function colSepMouseDown(context: any, e: MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();

  if (context.allowAddCol && !e.target.classList.contains('col-sep')) {
    e.target.style.display = 'none';
    const parentElement = e.target.parentElement?.parentElement;
    if (parentElement) {
      const pos = Array.from(parentElement.parentElement!.children).findIndex(td => td === parentElement);
      insertColumn(context, pos);
    }
  }

  context.focused = false;

  const getStyleVal = (element: HTMLElement, cssProperty: string): string =>
    window.getComputedStyle(element).getPropertyValue(cssProperty);

  const index = Array.from(context.labelTr.children).indexOf(e.target.parentElement!);
  context.sep = {};

  context.sep.curCol = context.colgroupTr.children[index - (context.noNumCol ? 1 : 0)] as HTMLElement;
  context.sep.curField = context.fields[index - 1];
  context.sep.pageX = e.pageX;

  let padding = 0;
  if (getStyleVal(context.sep.curCol, 'box-sizing') !== 'border-box') {
    const padLeft = getStyleVal(context.sep.curCol, 'padding-left');
    const padRight = getStyleVal(context.sep.curCol, 'padding-right');
    padding = (parseInt(padLeft) || 0) + (parseInt(padRight) || 0);
  }

  context.sep.curColWidth = e.target.parentElement!.offsetWidth - padding;

  window.addEventListener('mousemove', () => colSepMouseMove(context, e));
  window.addEventListener('mouseup', () => colSepMouseUp(context, e));
}

export function colSepMouseOver(context: any, e: MouseEvent): void {
  const target = e.target as HTMLElement;

  if (target.classList.contains('col-sep')) {
    target.style.borderRight = '5px solid #cccccc';
    target.style.height = `${context.systable.getBoundingClientRect().height}px`;

    if (context.allowAddCol) {
      const addButton = target.children[0] as HTMLElement;
      if (addButton) {
        addButton.style.display = 'block';
      }
    }
  } else {
    if (context.addColBtnTimeout) clearTimeout(context.addColBtnTimeout);

    if (context.allowAddCol) {
      target.style.display = 'block';
    }
  }
}

export function colSepMouseOut(context: any, e: MouseEvent): void {
  const target = e.target as HTMLElement;

  if (target.classList.contains('col-sep')) {
    target.style.borderRight = '5px solid transparent';
    target.style.height = '100%';

    context.addColBtnTimeout = setTimeout(() => {
      const addButton = target.children[0] as HTMLElement;
      if (addButton) {
        addButton.style.display = 'none';
      }
    }, 500);
  } else {
    target.style.display = 'none';
  }
}

export function colSepMouseUp(context: any, e: MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();

  delete context.sep;

  window.removeEventListener('mousemove', () => colSepMouseMove(context, e));
  window.removeEventListener('mouseup', () => colSepMouseUp(context, e));

  const setting = getSetting(context);
  if (context.remember) {
    const storageKey = `${window.location.pathname}${window.location.hash}.${context.token}`;
    localStorage.setItem(storageKey, JSON.stringify(setting));
  }

  context.$emit('setting', setting);
}



