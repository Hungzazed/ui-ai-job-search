import { Check } from "lucide-react";
import { cn } from "@/utils";

export interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({ steps, current, onStepClick, className }: StepperProps) {
  return (
    <ol className={cn("flex items-start w-full", className)}>
      {steps.map((step, index) => {
        const state = index < current ? "done" : index === current ? "active" : "todo";
        return (
          <li key={step.label} className={cn("flex flex-1 items-start", index < steps.length - 1 && "")}>
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!onStepClick || index > current}
                onClick={() => onStepClick?.(index)}
                aria-current={state === "active" ? "step" : undefined}
                className={cn(
                  "z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  state === "done" && "border-primary-600 bg-primary-600 text-white",
                  state === "active" &&
                  "border-primary-600 bg-white text-primary-700 ring-4 ring-primary-100",
                  state === "todo" && "border-slate-300 bg-white text-slate-400",
                  onStepClick && index <= current && "cursor-pointer",
                )}
              >
                {state === "done" ? <Check className="size-4" /> : index + 1}
              </button>
              <span
                className={cn(
                  "mt-2 hidden text-xs font-medium sm:block",
                  state === "active" ? "text-primary-700" : state === "done" ? "text-slate-700" : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mt-4 h-0.5 flex-1 rounded transition-colors",
                  index < current ? "bg-primary-500" : "bg-slate-200",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
