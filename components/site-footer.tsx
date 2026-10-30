import { cn } from '@/lib/cn';

export function Copyright({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs text-fd-muted-foreground', className)}>
      Copyright © 2024-2026 Muhammed Muzzammil Shah
    </p>
  );
}
