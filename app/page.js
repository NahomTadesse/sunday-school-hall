"use client"
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import {NavbarNested} from '../components/Navbar/NavbarNested'

import {TableSort} from '../components/UserTable/TableSort'
import Stat from './stat/page'
import AuthenticationTitle from './login/page'

export default function HomePage() {
  return (
    <>
      {/* <Welcome /> */}
      {/* <TableSort/> */}
      {/* <NavbarNested/> */}
      {<AuthenticationTitle/>}
      {/* <ColorSchemeToggle /> */}

    </>
  );
}
