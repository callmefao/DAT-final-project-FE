import { PropsWithChildren } from "react";

import Toolbar from "../components/Toolbar";

const CenteredLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* site-wide background */}
      <div className="fun-bg-full" aria-hidden>
        <img src="/fun_bg.jpg" alt="background" />
        <div className="fun-overlay-full" />
      </div>

      <Toolbar />

      <main className="relative z-10 flex flex-1 justify-center px-4 pt-16 pb-10">
        <div className="w-full">
          <div className="p-0">{children}</div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-slate-500">
        Built for secure voice biometrics — {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default CenteredLayout;
