const dialogs = new Set();
const listeners = new Set();

export const hasOpenDialogs = () => dialogs.size > 0;
export const isTopDialog = dialog => [...dialogs].at(-1) === dialog;

export function subscribeDialogActivity(listener) {
  listeners.add(listener);
  listener(hasOpenDialogs());
  return () => listeners.delete(listener);
}

export function registerDialog(dialog) {
  dialogs.add(dialog);
  listeners.forEach(listener => listener(hasOpenDialogs()));
  return () => {
    if (!dialogs.delete(dialog)) return;
    listeners.forEach(listener => listener(hasOpenDialogs()));
  };
}
