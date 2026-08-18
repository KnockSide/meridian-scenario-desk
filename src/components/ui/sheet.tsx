"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  title,
  ...props
}: ComponentProps<typeof Dialog.Content> & {
  side?: "right" | "left" | "bottom";
  title: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70" />
      <Dialog.Content
        className={cn(
          "fixed z-50 flex flex-col border-border bg-card shadow-lg",
          side === "right" && "inset-y-0 right-0 h-full w-[min(100%,380px)] border-l",
          side === "left" && "inset-y-0 left-0 h-full w-[min(100%,380px)] border-r",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[88vh] rounded-t-xl border-t",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Dialog.Title className="font-display text-lg tracking-tight">{title}</Dialog.Title>
          <Dialog.Close className="grid size-10 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
