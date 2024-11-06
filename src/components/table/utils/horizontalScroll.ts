/* TODO
не хватает функции  numColWidth
*/

import { getCurrentInstance } from 'vue';
import { lazy } from './excelEditor';

export function ftMouseDown(context: any, e: MouseEvent): void {
  const footerRect = context.footer.getBoundingClientRect();

  const ratio = (e.clientX - footerRect.left - context.numColWidth) / (footerRect.width - context.numColWidth);

  const fullWidth = context.systable.getBoundingClientRect().width;
  const viewWidth = context.tableContent.getBoundingClientRect().width;

  context.tableContent.scrollTo(fullWidth * ratio - viewWidth / 2, context.tableContent.scrollTop);
}

export function sbMouseDown(context: any, e: MouseEvent): void {
  e.stopPropagation();

  if (!context.hScroller.mouseX) {
    const scrollLeft = context.$refs.hScroll.getBoundingClientRect().left;
    const footerLeft = context.footer.getBoundingClientRect().left + context.numColWidth;

    context.hScroller.left = scrollLeft - footerLeft;
    context.hScroller.mouseX = e.clientX;

    window.addEventListener('mousemove', context.sbMouseMove);
    window.addEventListener('mouseup', context.sbMouseUp);

    context.$refs.hScroll.classList.add('focus');
  }
}

export function sbMouseUp(context: any): void {
  window.removeEventListener('mousemove', context.sbMouseMove);
  window.removeEventListener('mouseup', () => sbMouseUp(context));

  lazy(context, () => {
    if (context.$refs.hScroll) {
      context.$refs.hScroll.classList.remove('focus');
    }
  });

  context.hScroller.mouseX = 0;

  const instance = getCurrentInstance();
  instance?.proxy?.$forceUpdate();
}

export function sbMouseMove(context: any, e: MouseEvent): void {
  if (e.buttons === 0) {
    sbMouseUp(context);
    return;
  }

  const diff = e.clientX - context.hScroller.mouseX;

  const ratio = (context.hScroller.left + diff) / context.hScroller.scrollerUnseenWidth;

  context.tableContent.scrollTo(context.hScroller.tableUnseenWidth * ratio, context.tableContent.scrollTop);
}