import { Link, NavLink } from "react-router";
import { LayoutDashboard, MessageSquare, HandCoins, TrendingUp, ShieldCheck, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Tableau de bord", primary: true },
  { to: "/chat", icon: MessageSquare, label: "Chat Franklin", primary: true },
  { to: "/subsidies", icon: HandCoins, label: "Subventions" },
  { to: "/market-trends", icon: TrendingUp, label: "Tendances Marché" },
  { to: "/regulations", icon: ShieldCheck, label: "Réglementation" },
  { to: "/settings", icon: Settings, label: "Paramètres" },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white p-4 hidden md:flex flex-col border-r border-slate-800 shadow-2xl z-[100]">
      <div className="mb-10 px-2 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 transform rotate-3">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
          DataGouv Insight
        </h1>
        <div className="mt-1 px-2 py-0.5 bg-indigo-500/20 rounded-full border border-indigo-500/30">
          <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Analytics Pro</p>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                item.primary ? "font-black" : "font-medium",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )
            }
          >
            <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", item.primary && "w-6 h-6")} />
            <span className={cn(item.primary ? "text-base" : "text-sm")}>{item.label}</span>
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800/50">
        <Link 
          to="/settings"
          className="group px-4 py-3 flex items-center gap-3 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl transition-all duration-300 border border-slate-700/50"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
            <Settings className="w-5 h-5 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate">Configuration</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gérer le profil</p>
          </div>
        </Link>
      </div>
    </nav>
  );
}

export function MobileNavbar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex justify-around z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center p-2 rounded-lg transition-colors",
              isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            )
          }
        >
          <item.icon className="w-6 h-6" />
        </NavLink>
      ))}
    </nav>
  );
}
