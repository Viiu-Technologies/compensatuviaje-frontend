import type { CalculationResponse } from '../../services/calculatorService';

export type StepId = "flight" | "projects" | "payment";

export interface FormData {
  origin: string;
  destination: string;
  aircraftType: "economy" | "business" | "first";
  projectType: "social" | "environmental" | "";
  email: string;
}

export interface FlightStepProps {
  register: any;
  watch: any;
  errors: any;
  setValue: (name: keyof FormData, value: any, options?: any) => void;
  onNext: () => void;
}

export interface ProjectStepProps {
  formData: FormData;
  setValue: (name: keyof FormData, value: any, options?: any) => void;
  onNext: () => void;
  calculationResult?: CalculationResponse | null;
}

export interface PaymentStepProps {
  formData: FormData;
  onComplete: () => void;
  calculationResult?: CalculationResponse | null;
}
