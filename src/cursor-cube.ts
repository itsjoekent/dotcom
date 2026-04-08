import "./cursor-cube.css";

type CursorMode = "default" | "pointer" | "text";

function cursorModeAt(x: number, y: number, cursorRoot: HTMLElement): CursorMode {
  const el = document.elementFromPoint(x, y);
  if (!el || cursorRoot.contains(el)) return "default";

  if (
    el.closest(
      "a[href], button, [role='button'], [role='link'], .social-link, summary, label[for], .project-card:not(.project-card--placeholder)",
    )
  ) {
    return "pointer";
  }

  if (
    el.closest(
      "textarea, [contenteditable='true'], .bio, .handle, input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='range']):not([type='file']):not([type='hidden'])",
    )
  ) {
    return "text";
  }

  return "default";
}

function applyMode(root: HTMLElement, mode: CursorMode) {
  root.classList.remove("cursor-cube--default", "cursor-cube--pointer", "cursor-cube--text");
  root.classList.add(`cursor-cube--${mode}`);
}

export function initCursorCube(root: HTMLElement) {
  const mqFine = window.matchMedia("(pointer: fine)");
  const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const active = () => mqFine.matches && !mqMotion.matches;

  const setCursorClass = (on: boolean) => {
    document.documentElement.classList.toggle("use-custom-cursor", on);
  };

  const move = (clientX: number, clientY: number) => {
    root.style.transform = `translate(${clientX}px, ${clientY}px)`;
    applyMode(root, cursorModeAt(clientX, clientY, root));
  };

  const onMove = (e: MouseEvent) => {
    move(e.clientX, e.clientY);
  };

  let listening = false;

  const sync = () => {
    if (active()) {
      if (!listening) {
        window.addEventListener("mousemove", onMove, { passive: true });
        listening = true;
      }
      setCursorClass(true);
      move(-100, -100);
    } else {
      if (listening) {
        window.removeEventListener("mousemove", onMove);
        listening = false;
      }
      setCursorClass(false);
      applyMode(root, "default");
    }
  };

  sync();
  mqFine.addEventListener("change", sync);
  mqMotion.addEventListener("change", sync);

  return () => {
    if (listening) window.removeEventListener("mousemove", onMove);
    mqFine.removeEventListener("change", sync);
    mqMotion.removeEventListener("change", sync);
    setCursorClass(false);
  };
}
