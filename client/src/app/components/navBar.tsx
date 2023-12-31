'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

import { AuthContext } from '../../context/AuthProvider';
import NavAvatar from './navAvatar';
import Button from '../../components/button';
import styles from '../styles/navBar.module.scss';

function NavBar() {
  const auth = useContext(AuthContext);
  return (
    <nav
      id="nav-bar"
      className={clsx({
        [styles['nav__bar']]: true,
        [styles['nav__bar--compact']]: usePathname() === '/create',
      })}
    >
      <div>
        <Link className={styles.nav__logo} id="home" href="/">
          <Image
            src="/maphub.svg"
            width={96}
            height={24}
            alt="The MapHub logo with a cerulean pin over a circle on the right"
          />
        </Link>
      </div>
      <div className={styles['nav__box']}>
        <Link id="create" href="/create">
          <Button variant="text">Create</Button>
        </Link>
        <Link id="discover" href="/discover">
          <Button variant="text">Discover</Button>
        </Link>
        {!auth.state.isLoggedIn ? (
          <>
            <Link id="signin" href="/account/sign-in">
              <Button variant="outlined">Sign In</Button>
            </Link>
            <Link id="join-now" href="/account/create">
              <Button variant="filled">Join Now</Button>
            </Link>
          </>
        ) : (
          <NavAvatar />
        )}
      </div>
    </nav>
  );
}

export default NavBar;
