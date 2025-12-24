import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ChevronLeft, Leaf, Info, TreePine, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

import { ProgressBar } from '../CarbonCalculator/ProgressBar';
import { FlightStep } from '../CarbonCalculator/Steps/FlightStep';
import { ProjectStep } from '../CarbonCalculator/Steps/ProjectStep';
import { PaymentStep } from '../CarbonCalculator/Steps/PaymentStep';
import type { FormData, StepId } from '../CarbonCalculator/types';
import calculatorService, { CalculationResponse, CabinClass } from '../../services/calculatorService';

const CalculatorView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepId>('flight');
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResponse | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const { register, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      origin: '',
      destination: '',
      aircraftType: 'economy',
      projectType: '',
      email: ''
    }
  });

  const formData = watch();

  const steps: StepId[] = ['flight', 'projects', 'payment'];

  const nextStep = async () => {
    setCalculationError(null);

    if (currentStep === 'flight') {
      // Validar campos de vuelo
      if (!formData.origin || !formData.destination) {
        setCalculationError('Por favor selecciona origen y destino');
        return;
      }

      // Calcular emisiones con la API
      setIsCalculating(true);
      try {
        const result = await calculatorService.calculateEmissions({
          origin: formData.origin,
          destination: formData.destination,
          cabinCode: formData.aircraftType as CabinClass,
          passengers: 1,
          roundTrip: false
        });

        if (result.status === 'success') {
          setCalculationResult(result);
          setCompletedSteps(prev => [...prev, currentStep]);
          setCurrentStep('projects');
        } else {
          setCalculationError(result.message || 'Error al calcular emisiones');
        }
      } catch (error: any) {
        setCalculationError(error.message || 'Error de conexión con el servidor');
      } finally {
        setIsCalculating(false);
      }
      return;
    }

    if (currentStep === 'projects') {
      if (!formData.projectType) {
        setCalculationError('Por favor selecciona un tipo de proyecto');
        return;
      }
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep('payment');
      return;
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
    setCalculationError(null);
  };

  const handlePaymentComplete = () => {
    setIsProcessComplete(true);
    setCompletedSteps(['flight', 'projects', 'payment']);
  };

  const handleStartOver = () => {
    setCurrentStep('flight');
    setCompletedSteps([]);
    setIsProcessComplete(false);
    setCalculationResult(null);
    setCalculationError(null);
    setValue('origin', '');
    setValue('destination', '');
    setValue('aircraftType', 'economy');
    setValue('projectType', '');
    setValue('email', '');
  };

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold !text-gray-900 !flex !items-center !gap-2">
            <Leaf className="!w-7 !h-7 !text-green-500" />
            Calculadora de Carbono
          </h1>
          <p className="!text-gray-500 !text-sm !mt-1">Compensa las emisiones de tu vuelo en 3 simples pasos</p>
        </div>
        {currentStep !== 'flight' && !isProcessComplete && (
          <button
            onClick={prevStep}
            className="!flex !items-center !gap-2 !px-4 !py-2 !text-gray-600 hover:!text-gray-800 !transition-colors !border-0 !bg-gray-100 hover:!bg-gray-200 !rounded-xl"
          >
            <ChevronLeft className="!w-4 !h-4" />
            Paso anterior
          </button>
        )}
      </div>

      {/* Main Calculator Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-xl !overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="!relative !bg-gradient-to-br !from-emerald-50 !via-white !to-sky-50">
          <div className="!absolute !inset-0 !opacity-30">
            <div className="!absolute !top-10 !left-10 !w-64 !h-64 !bg-green-200 !rounded-full !blur-3xl" />
            <div className="!absolute !bottom-10 !right-10 !w-48 !h-48 !bg-sky-200 !rounded-full !blur-3xl" />
          </div>

          <div className="!relative !p-6 sm:!p-8">
            {/* Progress Bar */}
            {!isProcessComplete && (
              <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
            )}

            {/* Steps Content */}
            <AnimatePresence mode="wait">
              {currentStep === 'flight' && (
                <motion.div
                  key="flight"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FlightStep
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    onNext={nextStep}
                  />
                </motion.div>
              )}

              {currentStep === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProjectStep
                    formData={formData}
                    setValue={setValue}
                    onNext={nextStep}
                    calculationResult={calculationResult}
                  />
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentStep
                    formData={formData}
                    onComplete={handlePaymentComplete}
                    calculationResult={calculationResult}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Over Button (when complete) */}
            {isProcessComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="!mt-8 !text-center"
              >
                <button
                  onClick={handleStartOver}
                  className="!px-6 !py-3 !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !rounded-xl !font-medium !transition-colors !border-0"
                >
                  Calcular otra compensación
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Section */}
      <div className="!grid sm:!grid-cols-2 lg:!grid-cols-3 !gap-4">
        <div className="!bg-blue-50 !rounded-xl !p-4 !border !border-blue-200">
          <Info className="!w-6 !h-6 !text-blue-600 !mb-2" />
          <h4 className="!font-semibold !text-gray-900 !mb-1">Metodología certificada</h4>
          <p className="!text-sm !text-gray-600">Usamos factores de emisión de DEFRA y GHG Protocol</p>
        </div>
        <div className="!bg-green-50 !rounded-xl !p-4 !border !border-green-200">
          <TreePine className="!w-6 !h-6 !text-green-600 !mb-2" />
          <h4 className="!font-semibold !text-gray-900 !mb-1">Proyectos verificados</h4>
          <p className="!text-sm !text-gray-600">Compensaciones con certificación Gold Standard y VCS</p>
        </div>
        <div className="!bg-purple-50 !rounded-xl !p-4 !border !border-purple-200 sm:!col-span-2 lg:!col-span-1">
          <ShieldCheck className="!w-6 !h-6 !text-purple-600 !mb-2" />
          <h4 className="!font-semibold !text-gray-900 !mb-1">Pago 100% seguro</h4>
          <p className="!text-sm !text-gray-600">Transacciones protegidas con encriptación SSL</p>
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;