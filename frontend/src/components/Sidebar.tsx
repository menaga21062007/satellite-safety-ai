import React from 'react';
import { 
  LayoutDashboard, 
  Orbit, 
  Cpu, 
  Rocket,
  Headphones,
  Compass,
  ShieldCheck
} from 'lucide-react';

export type PageId = 'dashboard' | 'debris' | 'risk' | 'maneuver' | 'login' | 'alerts' | 'reports';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  activeAlertCount: number;
  debrisCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  debrisCount
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Mission Control',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'debris',
      label: 'Debris Tracking',
      icon: <Orbit className="w-4 h-4" />,
      badge: debrisCount
    },
    {
      id: 'risk',
      label: 'AI Collision Risk',
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 'maneuver',
      label: 'Safe Orbit Maneuver',
      icon: <Rocket className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 bg-[#fbf9f5]/90 backdrop-blur-2xl border-r border-[#e2dacf] flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-64px)] sticky top-16 font-sans z-20 shadow-[4px_0_20px_rgba(110,95,75,0.04)]">
      <div>
        <div className="px-3.5 py-2 text-[10px] font-heading tracking-[0.2em] text-[#597445] uppercase font-bold flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-[#597445]" />
          <span>ORBITAL DEFENSE</span>
        </div>

        <nav className="space-y-2.5 mt-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-heading font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-[#597445] text-white font-bold shadow-md shadow-[#597445]/25 translate-x-1 border-2 border-[#597445]'
                    : 'bg-[#f5f2eb] hover:bg-[#eae4d8] text-[#363f2d] border-2 border-[#cfc4b2]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-[#597445]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#be7b38] text-white shadow-sm'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tactile Support / Status Capsule */}
      <div className="pt-4 border-t border-[#cfc4b2]">
        <div className="p-3 bg-[#f5f2eb] border-2 border-[#cfc4b2] rounded-2xl flex items-center space-x-3 shadow-inner">
          <div className="w-8 h-8 rounded-xl bg-[#597445] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-heading font-bold text-[#1e2418] truncate">Autonomous Defense</div>
            <div className="text-[9px] text-[#597445] font-semibold truncate">Active Guidance Armed</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
