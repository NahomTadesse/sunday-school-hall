'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const toggleColorScheme = () => {
    colorScheme === 'dark' ? setColorScheme('light') : setColorScheme('dark');
  };

  return (
    <ActionIcon onClick={toggleColorScheme} title="Toggle color scheme" size="lg" variant="transparent">
      {colorScheme === 'dark' ? <IconSun  size={20} color='yellow' /> : <IconMoon size={20} />}
    </ActionIcon>
  );
}
