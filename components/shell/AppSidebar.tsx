'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, GraduationCap, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { navGroups } from './nav-data';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.labelKey] = g.links.some((l) => l.href === pathname);
    });
    return initial;
  });

  const toggleGroup = (key: string) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[264px]'
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
        <div className={cn('flex items-center gap-2 overflow-hidden transition-opacity', collapsed && 'opacity-0')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-semibold">{t('app.name')}</span>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navGroups.map((group) => {
            const Icon = group.icon;
            const isActiveGroup = group.links.some((l) => l.href === pathname);
            const isOpen = collapsed ? false : openGroups[group.labelKey];
            return (
              <li key={group.labelKey}>
                <button
                  onClick={() => toggleGroup(group.labelKey)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                    isActiveGroup ? 'bg-white/10 text-white' : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 text-primary" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-start">{t(group.labelKey)}</span>
                      <ChevronDown
                        className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
                      />
                    </>
                  )}
                </button>
                {!collapsed && (
                  <div
                    className="grid overflow-hidden transition-all duration-200 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="min-h-0">
                      <ul className="ms-4 mt-0.5 space-y-0.5 border-s border-sidebar-border ps-3">
                        {group.links.map((link) => {
                          const active = pathname === link.href;
                          return (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className={cn(
                                  'block rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150',
                                  active
                                    ? 'bg-primary/90 text-primary-foreground shadow-sm'
                                    : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white'
                                )}
                              >
                                {t(link.labelKey)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
