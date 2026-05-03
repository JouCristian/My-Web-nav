// src/components/stepper.tsx
"use client"

import { AnimatePresence, motion, Variants } from 'framer-motion';
import React, { Children, HTMLAttributes, JSX, ReactNode, useLayoutEffect, useRef, useState, useEffect } from 'react';

import './stepper.css';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  activeStep?: number; // 🚀 新增：允许外部强制控制当前步骤
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: RenderStepIndicatorProps) => ReactNode;
  completedContent?: ReactNode; 
}

interface RenderStepIndicatorProps {
  step: number;
  currentStep: number;
  onStepClick: (clicked: number) => void;
}

const appleEase = { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.6 };

export default function Stepper({
  children,
  initialStep = 1,
  activeStep, // 🚀 接收外部强制控制
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  completeButtonText = 'Complete',
  disableStepIndicators = false,
  renderStepIndicator,
  completedContent,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  // 🚀 监听外部步骤控制（用于拦截弹窗回退）
  useEffect(() => {
    if (activeStep !== undefined && activeStep !== currentStep) {
      setDirection(activeStep > currentStep ? 1 : -1);
      setCurrentStep(activeStep);
    }
  }, [activeStep, currentStep]);

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className="outer-container" {...rest}>
      <div className={`step-circle-container ${stepCircleContainerClassName}`}>
        <div className={`step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: clicked => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    isGlobalCompleted={isCompleted}
                    onClickStep={(clicked: number) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} isGlobalCompleted={isCompleted} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper currentStep={currentStep} direction={direction} className={`step-content-default ${contentClassName}`}>
          {isCompleted ? completedContent : stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`footer-container ${footerClassName}`}>
            <div className={`footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
              {currentStep !== 1 && (
                <button onClick={handleBack} {...backButtonProps}>
                  {backButtonText}
                </button>
              )}
              <button onClick={isLastStep ? handleComplete : handleNext} {...nextButtonProps}>
                {isLastStep ? completeButtonText : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({ currentStep, direction, children, className }: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number | "auto">("auto");

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: parentHeight }}
      transition={appleEase}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
          {children}
        </SlideTransition>
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  onHeightReady: (h: number) => void;
}

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={appleEase}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-50%' : '50%', opacity: 0 })
};

export function Step({ children }: { children: ReactNode }): JSX.Element {
  return <div className="step-default">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators, isGlobalCompleted }: any) {
  const status = isGlobalCompleted ? 'globalComplete' : currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
  const handleClick = () => { if (step !== currentStep && !disableStepIndicators) onClickStep(step); };

  return (
    <motion.div onClick={handleClick} className="step-indicator" style={disableStepIndicators ? { pointerEvents: 'none', opacity: 0.5 } : {}} animate={status} initial={false}>
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: 'rgba(255,255,255,0.05)', color: '#71717a', border: '1px solid transparent' },
          active: { scale: 1.1, backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)' },
          complete: { scale: 1, backgroundColor: '#ef4444', color: '#fff', border: '1px solid transparent' },
          globalComplete: { scale: 1, backgroundColor: '#10b981', color: '#fff', border: '1px solid transparent' }
        }}
        transition={appleEase}
        className="step-indicator-inner"
      >
        {(status === 'complete' || status === 'globalComplete') ? <CheckIcon className="check-icon" /> : status === 'active' ? <div className="active-dot" /> : <span className="step-number">{step}</span>}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete, isGlobalCompleted }: { isComplete: boolean, isGlobalCompleted?: boolean }) {
  const lineVariants: Variants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: '#ef4444' },
    globalComplete: { width: '100%', backgroundColor: '#10b981' }
  };
  const animateState = isGlobalCompleted ? 'globalComplete' : isComplete ? 'complete' : 'incomplete';

  return (
    <div className="step-connector">
      <motion.div className="step-connector-inner" variants={lineVariants} initial={false} animate={animateState} transition={appleEase} />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}