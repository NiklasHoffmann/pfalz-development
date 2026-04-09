'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  screenReaderTitle?: string;
  screenReaderDescription?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  contentId?: string;
  contentClassName?: string;
  scrollBody?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export default function Modal({
  open,
  onOpenChange,
  children,
  title,
  description,
  screenReaderTitle,
  screenReaderDescription,
  size = 'md',
  contentId,
  contentClassName,
  scrollBody = true,
}: ModalProps) {
  const lockedScrollYRef = useRef(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    lockedScrollYRef.current = window.scrollY;

    const keepScrollPosition = () => {
      if (window.scrollY !== lockedScrollYRef.current) {
        window.scrollTo(0, lockedScrollYRef.current);
      }
    };

    const preventPointerScroll = (event: WheelEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && contentRef.current?.contains(target)) {
        return;
      }

      event.preventDefault();
    };

    const preventScrollKeys = (event: KeyboardEvent) => {
      const scrollKeys = new Set([
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
      ]);

      if (!scrollKeys.has(event.key)) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && contentRef.current?.contains(target)) {
        return;
      }

      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('scroll', keepScrollPosition, { passive: true });
    window.addEventListener('wheel', preventPointerScroll, { passive: false });
    window.addEventListener('touchmove', preventPointerScroll, {
      passive: false,
    });
    window.addEventListener('keydown', preventScrollKeys, { passive: false });

    return () => {
      window.removeEventListener('scroll', keepScrollPosition);
      window.removeEventListener('wheel', preventPointerScroll);
      window.removeEventListener('touchmove', preventPointerScroll);
      window.removeEventListener('keydown', preventScrollKeys);
    };
  }, [open]);

  const accessibleTitle =
    title?.trim() || screenReaderTitle?.trim() || 'Dialog';
  const accessibleDescription =
    description?.trim() ||
    screenReaderDescription?.trim() ||
    'Dialog content and actions.';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay-surface fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px]" />
        <Dialog.Content
          id={contentId}
          ref={contentRef}
          className={cn(
            'modal-content-surface fixed left-1/2 top-1/2 z-[60] flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col overflow-hidden overscroll-contain sm:max-h-[calc(100dvh-3rem)] sm:w-full',
            'rounded-lg bg-white p-6 shadow-lg',
            'dark:bg-gray-800',
            sizeClasses[size],
            contentClassName
          )}
        >
          {title ? (
            <div className="mb-4 shrink-0 pr-10">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">
                  {accessibleDescription}
                </Dialog.Description>
              )}
            </div>
          ) : (
            <>
              <Dialog.Title className="sr-only">{accessibleTitle}</Dialog.Title>
              <Dialog.Description className="sr-only">
                {accessibleDescription}
              </Dialog.Description>
            </>
          )}
          {scrollBody ? (
            <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
              {children}
            </div>
          ) : (
            <div className="min-h-0 flex-1">{children}</div>
          )}
          <Dialog.Close
            type="button"
            className="absolute right-4 top-4 z-10 inline-flex rounded-full p-1.5 text-gray-500 opacity-75 transition-opacity hover:text-gray-800 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/60 disabled:pointer-events-none dark:text-gray-300 dark:hover:text-white dark:focus-visible:ring-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
