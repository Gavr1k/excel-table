import { refresh } from './other';

export function headerClick(context: any, e: MouseEvent, colPos: number): void {
  const target = e.target as HTMLElement;

  if (!context.noHeaderEdit && target.tagName === 'SPAN') {
    target.contentEditable = "true";
    target.addEventListener('focusout', context.completeHeaderChange);
    return;
  }

  if (e.button === 0) {
    e.preventDefault();

    if (context.sortPos === colPos && context.sortDir > 0) {
      sort(context, -1, colPos);
    } else if (context.sortDir === 0) {
      sort(context, 1, colPos);
    } else {
      sort(context, 0, colPos);
    }
  }
}

export function completeHeaderChange(context: any, e: FocusEvent): void {
  const target = e.target as HTMLElement;

  const th = target.parentElement?.parentElement as HTMLElement;
  if (!th) return;

  const index = Array.from(th.parentElement!.children).indexOf(th);

  if (index > 0) {
    context.fields[index - 1].label = target.textContent || '';
  }
}

export function sort(context: any, n: number, pos?: number): void {
  const colPos = pos ?? context.columnFilterRef.colPos;
  const field = context.fields[colPos];

  if (field.noSorting) return;

  context.processing = true;
  const name = field.name;

  setTimeout(() => {
    let sorting = field.sorting;
    if (!sorting) {
      sorting = field.type === 'number'
        ? (a: any, b: any) => (Number(a) > Number(b) ? 1 : Number(a) < Number(b) ? -1 : 0)
        : (a: any, b: any) => String(a).localeCompare(String(b));
    }

    if (n === 0) {
      context.modelValue.sort((a: any, b: any) => (a.$id > b.$id ? 1 : -1));
      context.sortPos = 0;
    } else {
      context.modelValue.sort((a: any, b: any) => {
        if (field.sort) {
          return field.sort(a, b) * -n;
        } else {
          return sorting(a[name], b[name]) * -n;
        }
      });
      context.sortPos = colPos;
    }

    context.sortDir = n;
    refresh(context);
    context.processing = false;
  }, 0);
}

