import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

export const Dialog = DialogPrimitive.Root
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

function Overlay() {
  return (
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
  )
}

export function DialogContent({
  className,
  children,
  hideClose,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { hideClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border bg-popover p-5 text-popover-foreground shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-98',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && <CloseButton className="absolute top-3 right-3" />}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/** Slide-in panel used for the mobile navigation. */
export function SheetContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-background shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:duration-200',
          className,
        )}
        {...props}
      >
        {children}
        <CloseButton className="absolute top-3.5 right-3" />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function CloseButton({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close
      aria-label="Close"
      className={cn('rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground', className)}
    >
      <X className="size-4" />
    </DialogPrimitive.Close>
  )
}
