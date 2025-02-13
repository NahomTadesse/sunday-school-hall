import {
    IconAdjustments,
    IconCalendarStats,
    IconFileAnalytics,
    IconGauge,
    IconLock,
    IconNotes,
    IconPresentationAnalytics,
  } from '@tabler/icons-react';
  import { Code, Group, ScrollArea } from '@mantine/core';
  import { LinksGroup } from '../NavbarLinksGroup/NavbarLinksGroup';
  import { UserButton } from '../UserButton/UserButton';
  import { Logo } from './Logo';

  import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle'
  
  import classes from './NavbarNested.module.css';
  
  const mockdata = [
    { label: 'Dashboard', icon: IconGauge },
    {
      label: 'Venue',
      icon: IconNotes,
      initiallyOpened: true,
      links: [
        { label: 'Book Venue', link: '/bookvenue' },
        { label: 'Venue Statue', link: '/booked' },
        { label: 'History', link: '/usersTable' },
        // { label: 'Log In', link: '/login' },
      ],
    },
    // {
    //   label: 'Releases',
    //   icon: IconCalendarStats,
    //   links: [
    //     { label: 'Upcoming releases', link: '/' },
    //     { label: 'Previous releases', link: '/' },
    //     { label: 'Releases schedule', link: '/' },
    //   ],
    // },
    
   
    {label: 'Analytics', icon: IconPresentationAnalytics ,
      initiallyOpened: true,
           links: [
        { label: 'Overall Stat', link: '/stat' },
        { label: 'Monthly Stat', link: '/stat' },
        { label: 'Yearly Stat', link: '/stat' },
      ],

    },
    { label: 'Register', icon: IconFileAnalytics,
      initiallyOpened: true,
      links: [
        // { label: 'Enable 2FA', link: '/stat' },
        { label: 'Register Admin', link: '/registerAdmin' },
        { label: 'Admins List', link: '/adminList' },
      ],

     },
    // { label: 'Settings', icon: IconAdjustments },
    {
      label: 'Settings',
      icon: IconLock,
      initiallyOpened: true,
      links: [
        // { label: 'Enable 2FA', link: '/stat' },
        { label: 'Set Price', link: '/mapDaysPrice' },
        { label: 'Members Discount', link: '/membersDiscount' },
      ],
    },

    {label: 'Reports', icon: IconPresentationAnalytics ,
      initiallyOpened: true,
      links: [
   { label: 'Overall Report', link: '/reportOverall' },
   { label: 'Monthly Report', link: '/reportMonthly' },
   { label: 'Customer Report', link: '/reportCustomer' },
 ],

},


    {
      label: 'Security',
      icon: IconLock,
      initiallyOpened: true,
      links: [
        // { label: 'Enable 2FA', link: '/stat' },
        { label: 'Change password', link: '/forgetpass' },
        { label: 'Recovery codes', link: '/' },
      ],
    },
  ];
  
  export function NavbarNested() {
    const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);
  
    return (
      <nav className={classes.navbar}>
        <div className={classes.header}>
          <Group justify="space-between">
            <div>Book Dashboard</div>
            <ColorSchemeToggle/>
          </Group>
        </div>
  
        <ScrollArea className={classes.links}>
          <div className={classes.linksInner}>{links}</div>
        </ScrollArea>
  
        <div className={classes.footer}>
          <UserButton />
        </div>
      </nav>
    );
  }