import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step { id: number; title: string; subtitle?: string; }

export function StepperSidebar({ steps, current, onJump }: {
  steps: Step[]; current: number; onJump: (i: number) => void;
}) {
  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card/30 p-4 hidden lg:block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 px-2">Pasos del avalúo</div>
      <ol className="space-y-1">
        {steps.map((s, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <li key={s.id}>
              <button
                onClick={() => onJump(i)}
                className={cn(
                  'w-full text-left flex items-start gap-3 p-3 rounded-md transition-colors',
                  active ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/40 border border-transparent'
                )}
              >
                <div className={cn(
                  'h-6 w-6 rounded-full grid place-items-center text-xs shrink-0 mt-0.5',
                  done ? 'bg-primary text-primary-foreground' :
                  active ? 'bg-primary/20 text-primary border border-primary' :
                  'bg-muted text-muted-foreground'
                )}>
                  {done ? <Check className="h-3 w-3" /> : s.id}
                </div>
                <div className="min-w-0">
                  <div className={cn('text-sm font-medium', active && 'text-primary')}>{s.title}</div>
                  {s.subtitle && <div className="text-xs text-muted-foreground truncate">{s.subtitle}</div>}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
