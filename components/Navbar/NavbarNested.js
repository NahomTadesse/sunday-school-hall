

"use client";
import {
  IconAdjustments,
  IconFileAnalytics,
  IconGauge,
  IconLock,
  IconNotes,
  IconPresentationAnalytics,
  IconLogout, // Add this import
} from '@tabler/icons-react';
import { Group, ScrollArea, Collapse } from '@mantine/core';
import { UserButton } from '../UserButton/UserButton';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Add this import
import { useState } from 'react';
import classes from './NavbarNested.module.css';
import { removeAuthData } from '../../app/utils/auth'; // Import your auth utility

const mockdata = [
  { label: 'Dashboard', icon: IconGauge, 
    links: [
      { label: 'Home', link: '/stat' },
    ],
   },
  {
    label: 'Venue',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'Book Venue', link: '/bookvenue' },
      { label: 'Venue Requests', link: '/booked' },
    ],
  },
  {
    label: 'Hall',
    icon: IconPresentationAnalytics,
    links: [
      { label: 'Create Hall', link: '/createHall' },
      { label: 'Hall List', link: '/hallList' },
    ],
  },

  // {
  //   label: 'Payment',
  //   icon: IconPresentationAnalytics,
  //   links: [
  //     { label: 'Payment', link: '/paymentRequests' },
     
  //   ],
  // },


  {
        label: 'Terms',
        icon: IconPresentationAnalytics,
        initiallyOpened: true,
        links: [
          { label: 'Create Term', link: '/termCreate' },
          { label: 'Term List', link: '/termList' },
        ],
      },


      {
        label: 'Schedule',
        icon: IconPresentationAnalytics,
        initiallyOpened: true,
        links: [
          { label: 'Create Schedule', link: '/scheduleCreate' },
          { label: 'Schedule List', link: '/scheduleList' },
        ],
      },

      {
        label: 'Promo',
        icon: IconPresentationAnalytics,
        initiallyOpened: true,
        links: [
          { label: 'Create Promo', link: '/promoCreate' },
          { label: 'Promo List', link: '/promoList' },
        ],
      },

      {
        label: 'Analytics',
        icon: IconPresentationAnalytics,
        initiallyOpened: true,
        links: [
          { label: 'Overall Stat', link: '/stat' },
          { label: 'Monthly Stat', link: '/stat' },
          { label: 'Yearly Stat', link: '/stat' },
        ],
      },
      {
        label: 'Register',
        icon: IconFileAnalytics,
        initiallyOpened: true,
        links: [
          { label: 'Register Admin', link: '/registerAdmin' },
          { label: 'Admins List', link: '/adminList' },
        ],
      },
      {
        label: 'Settings',
        icon: IconLock,
        initiallyOpened: true,
        links: [
          { label: 'Set Price', link: '/mapDaysPrice' },
          // { label: 'Members Discount', link: '/membersDiscount' },
        ],
      },
      {
        label: 'Reports',
        icon: IconPresentationAnalytics,
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
          { label: 'Change password', link: '/changePass' },
          { label: 'Recovery codes', link: '/' },
        ],
      },
  // Add logout section
  {
    label: 'Logout',
    icon: IconLogout,
    links: [
      { label: 'Log Out', link: '#' }, // Use # to prevent navigation
    ],
  },
];

export function NavbarNested() {
  const [opened, setOpened] = useState({});
  const router = useRouter();

  const toggleLink = (label) => {
    setOpened((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    removeAuthData(); // Clear all auth data from cookies
    router.push('/login'); // Redirect to login page
  };

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <div className={classes.dashboardTitle}>Sunday-School</div>
          <ColorSchemeToggle />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {mockdata.map((item) => (
            <div key={item.label}>
              <div
                className={classes.linkHeader}
                onClick={() => toggleLink(item.label)}
              >
                <item.icon color="#00ffcc" size={20} style={{marginRight:15,marginTop:5}}/>
                {item.label}
              </div>
              {item.links && (
                <Collapse in={opened[item.label]}>
                  {item.links.map((link) => (
                    item.label === 'Logout' ? (
                      // Special handling for logout
                      <div 
                        key={link.label} 
                        className={classes.linkItem}
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                      >
                        {link.label}
                      </div>
                    ) : (
                      <Link href={link.link} key={link.label} passHref>
                        <div className={classes.linkItem}>
                          {link.label}
                        </div>
                      </Link>
                    )
                  ))}
                </Collapse>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}