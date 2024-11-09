import { calVScroll } from './verticalScroll';
import { lazy } from './excelEditor';
import { columnFillWidth } from './customization';

// full correct +

/**
 * - context.$refs.hScroll: Reference to the horizontal scroll element.
 * - context.systable: Main system table element.
 * - context.tableContent: Element that contains table content.
 * - context.hScroller: Object managing horizontal scroll properties.
 * - context.footer: Footer element.
 * - context.numColWidth: Width of the number column.
 * - context.editor: Editor element.
 * - context.height: Height setting for the table, can be 'auto' or specific value.
 * - context.summaryRow: Boolean indicating if there’s a summary row.
 * - context.noFooter: Boolean indicating if there’s no footer.
 * - context.pageSize: Number of rows visible on a single page.
 * - context.recordBody: Body element for records within the table.
 * - context.noPaging: Boolean indicating if paging is disabled.
 * - context.filterRow: Boolean indicating if there’s a filter row.
 * - context.footerRow: Boolean indicating if there’s a footer row.
 * - context.page: Current page number.
 * - context.table: Array containing table rows.
 * - context.pageTop: Starting row index of the current page.
 * - context.$refs.vScrollButton: Reference to the vertical scroll button.
 */

export function refreshPageSize(context: any): void {
  console.log("refreshPageSize - start");

  if (context.$refs.hScroll) {
    const fullWidth = context.systable.getBoundingClientRect().width;
    const viewWidth = context.tableContent.getBoundingClientRect().width;
    context.hScroller.tableUnseenWidth = fullWidth - viewWidth;
    context.$refs.hScroll.style.width = `${(100 * viewWidth) / fullWidth}%`;

    const scrollerWidth = context.$refs.hScroll.getBoundingClientRect().width;
    context.hScroller.scrollerUnseenWidth =
      context.footer.getBoundingClientRect().width - context.numColWidth - scrollerWidth;
  }

  let outerElement = context.editor;
  let bottomOffset = 0;

  if (context.height !== 'auto') {
    while (outerElement && outerElement.style.height !== 'auto' && !outerElement.style.height) {
      const style = getComputedStyle(outerElement);
      bottomOffset += parseInt(style.marginBottom) + parseInt(style.paddingBottom) + parseInt(style.borderBottomWidth);
      outerElement = outerElement.parentElement;
    }
  }

  if (outerElement) {
    const style = getComputedStyle(outerElement);
    bottomOffset += parseInt(style.paddingBottom) + parseInt(style.borderBottomWidth);
  }

  const outerHeight = outerElement?.clientHeight || window.innerHeight;
  const outerTop = outerElement?.getBoundingClientRect().top || 0;

  if (!context.noPaging) {
    const offset = bottomOffset + (context.summaryRow ? 25 : 0) + (context.noFooter ? 0 : 25);
    let controlHeight = outerHeight - (context.recordBody.getBoundingClientRect().top - outerTop) - offset;

    if (context.height) {
      if (context.height === 'auto') {
        const parent = context.editor.parentElement;
        if (parent && parent.scrollHeight > parent.clientHeight) {
          controlHeight += parent.clientHeight - parent.scrollHeight;
        }
      } else {
        const height = parseInt(context.height) + context.systable.getBoundingClientRect().top - context.recordBody.getBoundingClientRect().top;
        controlHeight = Math.min(controlHeight, height);
      }
    }

    context.pageSize = context.page || Math.floor(controlHeight / 24);
  } else if (context.height === 'auto') {
    let height = Math.floor(window.innerHeight - context.tableContent.getBoundingClientRect().top - 25);
    let offset = 4;

    if (context.filterRow) offset += 29;
    if (context.summaryRow) offset += 25;
    if (!context.footerRow) offset += 25;

    height = Math.min(24 * (context.table.length - context.pageTop) + offset, height);
    context.systable.parentNode.style.height = `${height}px`;
  }

  columnFillWidth(context);
  setTimeout(() => calVScroll(context));

  console.log("refreshPageSize - end");
}

export function firstPage(context: any, e?: Event): void {
  console.log("firstPage - start");
  
  if (e) e.stopPropagation();

  context.pageTop = 0;
  calVScroll(context);

  if (context.$refs.vScrollButton) {
    setTimeout(() => {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => {
        context.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }

  console.log("firstPage - end");
}

export function lastPage(context: any, e?: Event): void {
  console.log("lastPage - start");

  if (e) e.stopPropagation();

  context.pageTop = Math.max(0, context.table.length - context.pageSize);
  calVScroll(context);

  if (context.$refs.vScrollButton) {
    setTimeout(() => {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => {
        context.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }

  console.log("lastPage - end");
}

export function prevPage(context: any, e?: Event): void {
  console.log("prevPage - start");

  if (e) e.stopPropagation();

  context.pageTop = Math.max(0, context.pageTop - context.pageSize);
  calVScroll(context);

  if (context.$refs.vScrollButton) {
    setTimeout(() => {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => {
        context.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }

  console.log("prevPage - end");
}

export function nextPage(context: any, e?: Event): void {
  console.log("nextPage - start");

  if (e) e.stopPropagation();

  if (context.pageTop + context.pageSize < context.table.length) {
    context.pageTop = Math.min(context.pageTop + context.pageSize, context.table.length - context.pageSize);
  }

  calVScroll(context);

  if (context.$refs.vScrollButton) {
    setTimeout(() => {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => {
        context.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }

  console.log("nextPage - end");
}
