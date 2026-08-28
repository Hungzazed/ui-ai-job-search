export type SidebarState = "expanded" | "collapsed";

export const DEFAULT_SIDEBAR: SidebarState = "expanded";
export const SIDEBAR_KEY = "aijob:sidebar";

export const isSidebarState = (value: unknown): value is SidebarState =>
  value === "expanded" || value === "collapsed";

export function savedSidebar(): SidebarState {
  try {
    const saved = window.localStorage.getItem(SIDEBAR_KEY);
    return isSidebarState(saved) ? saved : DEFAULT_SIDEBAR;
  } catch {
    return DEFAULT_SIDEBAR;
  }
}

export function readSidebar(): SidebarState {
  if (typeof document === "undefined") return DEFAULT_SIDEBAR;
  const painted = document.documentElement.dataset.sidebar;
  if (isSidebarState(painted)) return painted;
  return savedSidebar();
}

const listeners = new Set<() => void>();

export function subscribeSidebar(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function paintSidebar(state: SidebarState): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.sidebar = state;
}

export function applySidebar(state: SidebarState): void {
  paintSidebar(state);
  try {
    window.localStorage.setItem(SIDEBAR_KEY, state);
  } catch {
    /* empty */
  }
  for (const listener of listeners) listener();
}

export function toggleSidebar(): void {
  applySidebar(readSidebar() === "collapsed" ? "expanded" : "collapsed");
}

export const SPLIT_ROOMY_WIDTH = 1440;

export function squeezeSidebar(): () => void {
  if (typeof window === "undefined") return () => {};

  const fit = () => {
    paintSidebar(
      window.innerWidth < SPLIT_ROOMY_WIDTH ? "collapsed" : savedSidebar(),
    );
    for (const listener of listeners) listener();
  };

  fit();
  window.addEventListener("resize", fit);

  return () => {
    window.removeEventListener("resize", fit);
    paintSidebar(savedSidebar());
    for (const listener of listeners) listener();
  };
}

export const serverSidebar = (): SidebarState => DEFAULT_SIDEBAR;

export const SIDEBAR_BOOTSTRAP = `
(function(){
  try {
    var saved = localStorage.getItem(${JSON.stringify(SIDEBAR_KEY)});
    document.documentElement.dataset.sidebar =
      (saved === 'collapsed' || saved === 'expanded') ? saved : 'expanded';
  } catch (e) {
    document.documentElement.dataset.sidebar = 'expanded';
  }
})();
`;
