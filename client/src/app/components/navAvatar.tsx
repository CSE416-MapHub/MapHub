import Avatar from '../../components/avatar';
import Button from '../../components/button';
import styles from '../styles/navAvatar.module.scss';

function NavAvatar() {
  return (
    <Button
      id={styles['nav-avatar__button']}
      className={styles['nav-avatar__button']}
    >
      <Avatar className={styles['nav-avatar']} />
    </Button>
  );
}

export default NavAvatar;
