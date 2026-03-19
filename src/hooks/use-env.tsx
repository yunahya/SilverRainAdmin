"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_ENV, type EnvKey } from "@/lib/constants";

interface EnvContextType {
  env: EnvKey;
  setEnv: (env: EnvKey) => void;
}

const EnvContext = createContext<EnvContextType>({
  env: DEFAULT_ENV,
  setEnv: () => {},
});

export function EnvProvider({ children }: { children: ReactNode }) {
  const [env, setEnv] = useState<EnvKey>(DEFAULT_ENV);

  return (
    <EnvContext.Provider value={{ env, setEnv }}>
      {children}
    </EnvContext.Provider>
  );
}

export function useEnv() {
  return useContext(EnvContext);
}
