import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = {
  factCheck: boolean;
  setFactCheck: (v: boolean) => void;
};

const WorkspaceCtx = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [factCheck, setFactCheck] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("factCheck");
    if (stored) setFactCheck(stored === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("factCheck", factCheck ? "1" : "0");
  }, [factCheck]);

  return (
    <WorkspaceCtx.Provider value={{ factCheck, setFactCheck }}>{children}</WorkspaceCtx.Provider>
  );
}

export function useWorkspace() {
  const c = useContext(WorkspaceCtx);
  if (!c) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return c;
}
