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
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
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
  size = 'md',
}: ModalProps) {
  const lockedScrollYRef = useRef(0);

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

  const accessibleTitle = title?.trim() || 'Dialog';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal forceMount>
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black/50 transition-opacity',
            'ease-[cubic-bezier(0.22,1,0.36,1)]',
            open
              ? 'opacity-100 duration-[420ms]'
              : 'pointer-events-none opacity-0 duration-[360ms]'
          )}
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
        />
        <Dialog.Content
          forceMount
          className={cn(
            'fixed left-1/2 top-1/2 z-[60] w-full -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-gray-200 bg-white p-6 shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800',
            'transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)]',
            open
              ? 'scale-100 opacity-100 duration-[420ms]'
              : 'pointer-events-none scale-[0.99] opacity-0 duration-[360ms]',
            sizeClasses[size]
          )}
        >
          {title ? (
            <div className="mb-4">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
          ) : (
            <Dialog.Title className="sr-only">{accessibleTitle}</Dialog.Title>
          )}
          {children}
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:ring-offset-gray-950 dark:focus:ring-gray-800 dark:data-[state=open]:bg-gray-800">
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
