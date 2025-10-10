import { PropsWithChildren } from "react";

import Toolbar from "../components/Toolbar";

const CenteredLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Toolbar />

      <main className="flex flex-1 justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            {children}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-slate-500">
        Built for secure voice biometrics — {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default CenteredLayout;
