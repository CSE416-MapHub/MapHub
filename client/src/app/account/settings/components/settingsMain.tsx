import styles from '../styles/settingsMain.module.scss';
import { HTMLAttributes } from 'react';

function SettingsMain({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={styles['settings__main']} {...props}>
      {children}
    </main>
  );
}

export default SettingsMain;
