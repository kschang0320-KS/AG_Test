import { STATUS_STEPS } from '../store';
import { CheckCircle2, Circle, Loader2, ClipboardCheck } from 'lucide-react';

const stepIcons = {
  received: ClipboardCheck,
  reviewing: Loader2,
  in_progress: Loader2,
  completed: CheckCircle2,
};

export default function ProgressStepper({ status }) {
  const currentIndex = STATUS_STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-center w-full py-3">
      {STATUS_STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isPending = idx > currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isDone ? 'bg-blue-600 border-blue-600 text-white' : ''}
                ${isCurrent ? 'bg-white border-blue-500 text-blue-600 shadow-md shadow-blue-100' : ''}
                ${isPending ? 'bg-white border-slate-200 text-slate-300' : ''}
              `}>
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <span className={`text-xs font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-300'}`}>
                    {idx + 1}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap
                ${isDone ? 'text-blue-600' : ''}
                ${isCurrent ? 'text-blue-700 font-semibold' : ''}
                ${isPending ? 'text-slate-400' : ''}
              `}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STATUS_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 relative overflow-hidden rounded-full bg-slate-200">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
                  style={{ width: isDone ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
