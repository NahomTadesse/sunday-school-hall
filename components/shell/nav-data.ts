import {
  LayoutDashboard,
  DoorOpen,
  Building2,
  CalendarRange,
  CalendarClock,
  Megaphone,
  BarChart3,
  UserPlus,
  Settings,
  FileBarChart,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavLink {
  labelKey: string;
  href: string;
}

export interface NavGroup {
  labelKey: string;
  icon: LucideIcon;
  links: NavLink[];
}

export const navGroups: NavGroup[] = [
  { labelKey: 'nav.dashboard', icon: LayoutDashboard, links: [{ labelKey: 'nav.home', href: '/stat' }] },
  {
    labelKey: 'nav.venue',
    icon: DoorOpen,
    links: [
      { labelKey: 'nav.bookVenue', href: '/bookvenue' },
      { labelKey: 'nav.venueRequests', href: '/booked' },
    ],
  },
  {
    labelKey: 'nav.hall',
    icon: Building2,
    links: [
      { labelKey: 'nav.createHall', href: '/createHall' },
      { labelKey: 'nav.hallList', href: '/hallList' },
    ],
  },
  {
    labelKey: 'nav.terms',
    icon: CalendarRange,
    links: [
      { labelKey: 'nav.createTerm', href: '/termCreate' },
      { labelKey: 'nav.termList', href: '/termList' },
    ],
  },
  {
    labelKey: 'nav.schedule',
    icon: CalendarClock,
    links: [
      { labelKey: 'nav.createSchedule', href: '/scheduleCreate' },
      { labelKey: 'nav.scheduleList', href: '/scheduleList' },
      { labelKey: 'nav.scheduleCalendar', href: '/scheduleCalendar' },
    ],
  },
  {
    labelKey: 'nav.promo',
    icon: Megaphone,
    links: [
      { labelKey: 'nav.createPromo', href: '/promoCreate' },
      { labelKey: 'nav.promoList', href: '/promoList' },
    ],
  },
  {
    labelKey: 'nav.analytics',
    icon: BarChart3,
    links: [{ labelKey: 'nav.overallStat', href: '/stat' }],
  },
  {
    labelKey: 'nav.register',
    icon: UserPlus,
    links: [
      { labelKey: 'nav.registerAdmin', href: '/registerAdmin' },
      { labelKey: 'nav.adminList', href: '/adminList' },
    ],
  },
  {
    labelKey: 'nav.settings',
    icon: Settings,
    links: [{ labelKey: 'nav.setPrice', href: '/mapDaysPrice' }],
  },
  {
    labelKey: 'nav.reports',
    icon: FileBarChart,
    links: [
      { labelKey: 'nav.overallReport', href: '/reportOverall' },
      { labelKey: 'nav.monthlyReport', href: '/reportMonthly' },
      { labelKey: 'nav.customerReport', href: '/reportCustomer' },
    ],
  },
  {
    labelKey: 'nav.security',
    icon: ShieldCheck,
    links: [{ labelKey: 'nav.changePassword', href: '/changePass' }],
  },
];
