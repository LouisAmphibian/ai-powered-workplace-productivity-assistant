import { createContext, useContext, useState, type ReactNode } from "react";

type View = "email" | "meeting" | "planner";

type Ctx = {
  view: View;
  setView: (v: View) => void;
  factCheck: boolean;
  setFactCheck: (v: boolean) => void;
};

const WorkspaceCtx = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("email");
  const [factCheck, setFactCheck] = useState(false);
  return (
    <WorkspaceCtx.Provider value={{ view, setView, factCheck, setFactCheck }}>
      {children}
    </WorkspaceCtx.Provider>
  );
}

export function useWorkspace() {
  const c = useContext(WorkspaceCtx);
  if (!c) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return c;
}

export type { View };
