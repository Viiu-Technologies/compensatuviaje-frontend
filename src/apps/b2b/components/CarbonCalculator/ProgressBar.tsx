import React from "react";
import { motion } from "framer-motion";
import { Plane, TreePine, CreditCard, Check } from "lucide-react";
import type { StepId } from "./types";

interface ProgressBarProps {
  currentStep: StepId;
  completedSteps: StepId[];
}

const steps: { id: StepId; label: string; icon: React.ReactNode }[] = [
  { id: "flight", label: "Vuelo", icon: <Plane size={18} /> },
  { id: "projects", label: "Proyecto", icon: <TreePine size={18} /> },
  { id: "payment", label: "Pago", icon: <CreditCard size={18} /> },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, completedSteps }) => {
  const getCurrentIndex = () => steps.findIndex(s => s.id === currentStep);
  const isCompleted = (stepId: StepId) => completedSteps.includes(stepId);
  const isCurrent = (stepId: StepId) => stepId === currentStep;
  const isActive = (stepId: StepId) => isCompleted(stepId) || isCurrent(stepId);

  return (
    <div className="!w-full !mb-8">
      <div className="!relative !flex !items-center !justify-between">
        {/* Progress Line Background */}
        <div className="!absolute !top-5 !left-0 !right-0 !h-[2px] !bg-gray-200 !mx-10" />
        
        {/* Progress Line Active */}
        <motion.div
          className="!absolute !top-5 !left-10 !h-[2px] !bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ 
            width: `calc(${(getCurrentIndex() / (steps.length - 1)) * 100}% - 5rem)` 
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {steps.map((step, index) => (
          <div key={step.id} className="!relative !flex !flex-col !items-center !z-10">
            <motion.div
              className={`
                !w-10 !h-10 !rounded-full !flex !items-center !justify-center !transition-all !duration-300
                ${isCompleted(step.id) 
                  ? '!bg-emerald-500 !text-white !shadow-lg !shadow-emerald-500/30' 
                  : isCurrent(step.id)
                    ? '!bg-emerald-500 !text-white !shadow-lg !shadow-emerald-500/30'
                    : '!bg-gray-100 !text-gray-400'
                }
              `}
              initial={false}
              animate={isActive(step.id) ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isCompleted(step.id) && !isCurrent(step.id) ? (
                <Check size={18} strokeWidth={3} />
              ) : (
                step.icon
              )}
            </motion.div>
            <span className={`
              !mt-2 !text-xs !font-medium !transition-colors !duration-300
              ${isActive(step.id) ? '!text-emerald-600' : '!text-gray-400'}
            `}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
