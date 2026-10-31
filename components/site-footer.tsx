import { CurrentYear } from '@/components/current-year';
import { cn } from '@/lib/cn';

export function Copyright({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs text-fd-muted-foreground', className)}>
      Copyright © 2024-
      <CurrentYear /> Muhammed Muzzammil Shah
    </p>
  );
}
