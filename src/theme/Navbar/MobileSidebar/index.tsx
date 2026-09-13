import {useEffect, type ReactNode} from 'react';
import OriginalMobileSidebar from '@theme-original/Navbar/MobileSidebar';

/** Keep publisher navigation intact while completing its mobile dismissal path. */
export default function MobileSidebar(): ReactNode {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!document.querySelector('.navbar-sidebar--show')) return;
      event.preventDefault();
      document.querySelector<HTMLButtonElement>('.navbar-sidebar__close')?.click();
    };
    const onClose = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('.navbar-sidebar__close')) {
        // Let the publisher's click handler commit its shown=false state first.
        requestAnimationFrame(() => {
          if (!document.querySelector('.navbar-sidebar--show')) {
            document.querySelector<HTMLButtonElement>('.navbar__toggle')?.focus();
          }
        });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClose, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClose, true);
    };
  }, []);

  return <OriginalMobileSidebar />;
}
