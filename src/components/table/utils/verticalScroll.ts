import { getCurrentInstance } from 'vue';
import { lazy } from './excelEditor';

export function calVScroll(context: any): void {
  let offset = context.labelTr.getBoundingClientRect().height;

  if (context.filterRow) offset += 29;

  context.vScroller.top = offset - 1;

  if (!context.noFooter) offset += 25;

  if (context.summaryRow) offset += 27;

  const fullHeight = context.$el.getBoundingClientRect().height;

  context.vScroller.height = fullHeight - offset;

  const totalTableHeight = context.table.length * 24;
  const ratio = context.vScroller.height / totalTableHeight;

  context.vScroller.buttonHeight = Math.max(24, context.vScroller.height * ratio);

  const scrollPosition = context.tableContent.scrollTop + context.pageTop * 24;
  const maxScroll = totalTableHeight - context.vScroller.height;
  const prop = scrollPosition / maxScroll;

  context.vScroller.buttonTop = (context.vScroller.height - context.vScroller.buttonHeight) * prop;

  const instance = getCurrentInstance();
  instance?.proxy?.$forceUpdate();
}

export function vsMouseDown(context: any, e: MouseEvent): void {
  e.stopPropagation();

  const pos = e.offsetY - context.vScroller.buttonHeight / 2;
  let ratio = Math.max(0, pos);
  ratio = Math.min(ratio, context.vScroller.height - context.vScroller.buttonHeight) / (context.vScroller.height - context.vScroller.buttonHeight);

  if (context.noPaging) {
    context.tableContent.scrollTo(context.tableContent.scrollLeft, context.table.length * 24 * ratio);
  } else {
    context.vScroller.buttonTop = ratio * (context.vScroller.height - context.vScroller.buttonHeight);
    context.$refs.vScrollButton.style.marginTop = `${context.vScroller.buttonTop}px`;

    context.pageTop = Math.round((context.table.length - context.pageSize) * ratio);
  }
}

export function vsbMouseDown(context: any, e: MouseEvent): void {
  e.stopPropagation();

  if (!context.vScroller.mouseY) {
    context.vScroller.saveButtonTop = context.vScroller.buttonTop;
    context.vScroller.mouseY = e.clientY;

    window.addEventListener('mousemove', context.vsbMouseMove);
    window.addEventListener('mouseup',context.vsbMouseUp);

    context.$refs.vScrollButton.classList.add('focus');
  }
}

export function vsbMouseUp(context: any): void {
  window.removeEventListener('mousemove', context.vsbMouseMove);
  window.removeEventListener('mouseup', context.vsbMouseUp);

  lazy(context, () => {
    context.$refs.vScrollButton?.classList.remove('focus');
  });

  context.vScroller.mouseY = 0;

  if (!context.noPaging) {
    const ratio = context.vScroller.buttonTop / (context.vScroller.height - context.vScroller.buttonHeight);
    context.pageTop = Math.round((context.table.length - context.pageSize) * ratio);
  }

  context.vScroller.runner = '';

  const instance = getCurrentInstance();
  instance?.proxy?.$forceUpdate();
}

export function vsbMouseMove(context: any, e: MouseEvent): void {
  if (e.buttons === 0) {
    vsbMouseUp(context);
    return;
  }

  const diff = e.clientY - context.vScroller.mouseY;

  if (context.noPaging) {
    const ratio = (context.vScroller.saveButtonTop + diff) / (context.vScroller.height - context.vScroller.buttonHeight);
    context.tableContent.scrollTo(context.tableContent.scrollLeft, context.table.length * 24 * ratio);
  } else {
    context.vScroller.buttonTop = Math.max(0, Math.min(context.vScroller.height - context.vScroller.buttonHeight, context.vScroller.saveButtonTop + diff));
    context.$refs.vScrollButton.style.marginTop = `${context.vScroller.buttonTop}px`;

    const ratio = context.vScroller.buttonTop / (context.vScroller.height - context.vScroller.buttonHeight);
    const recPos = Math.round((context.table.length - context.pageSize) * ratio) + 1;
    const rec = context.table[recPos];

    context.vScroller.runner = `${recPos}<br>` + context.fields
      .filter((field: any, i: number) => field.keyField || field.sticky || context.sortPos === i)
      .map((field: any) => `${field.label}: ${rec[field.name]}`)
      .join('<br>');

    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
  }
}


