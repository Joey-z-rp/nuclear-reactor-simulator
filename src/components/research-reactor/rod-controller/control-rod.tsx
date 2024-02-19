import { CONTROL_ROD_STEPS } from "@/reactor/control-rod/control-rod";
import { PointerEventHandler, useEffect, useRef, useState } from "react";
import "./control-rod.css";

export type RodPosition = { currentStep: number; targetStep: number };

type ControlRodProps = RodPosition & {
  name: string;
  updateTargetStep: (step: number) => void;
  minStep?: number;
  maxStep?: number;
};

export const ControlRod = ({
  name,
  currentStep,
  targetStep,
  updateTargetStep,
  minStep = 0,
  maxStep = CONTROL_ROD_STEPS,
}: ControlRodProps) => {
  const [pointerValue, setPointerValue] = useState(targetStep);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragStart: PointerEventHandler<HTMLDivElement> = (e) => {
    setIsDragging(true);
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handleDrag: PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    const faderRect = containerRef.current?.getBoundingClientRect();
    if (!faderRect) return;
    const relativePosition = faderRect.bottom - e.clientY;
    const newValue = Math.max(
      minStep,
      Math.min(
        maxStep,
        (relativePosition / faderRect.height) * (maxStep - minStep)
      )
    );
    setPointerValue(Math.floor(newValue));
  };

  const handleDragEnd: PointerEventHandler<HTMLDivElement> = (e) => {
    updateTargetStep(pointerValue);
    setIsDragging(false);
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  const currentRodHeight = `${(currentStep / maxStep) * 100}%`;

  useEffect(() => {
    if (!isDragging && pointerValue !== targetStep) {
      setPointerValue(targetStep);
    }
  }, [targetStep, isDragging]);

  return (
    <div className="max-w-8 flex flex-col gap-1 items-center px-5 pb-3">
      <div className="text-center text-sm mb-1">{name}</div>
      <button
        className="text-xs text-white bg-blue-500 rounded-sm p-1"
        onClick={() =>
          inputRef.current?.value &&
          updateTargetStep(Number(inputRef.current.value))
        }
      >
        Move
      </button>
      <input
        ref={inputRef}
        className="text-xs mb-2"
        type="number"
        min={minStep}
        max={maxStep}
      />
      <div
        className="w-5 h-52 border border-black border-solid relative"
        ref={containerRef}
        onPointerDown={handleDragStart}
        onPointerMove={isDragging ? handleDrag : undefined}
        onPointerUp={handleDragEnd}
      >
        <div
          className="target-step-pointer-left absolute cursor-pointer"
          style={{
            bottom: `${
              ((pointerValue - minStep) / (maxStep - minStep)) * 100
            }%`,
          }}
        >
          <div className="absolute right-3 bottom-1">
            {isDragging ? pointerValue : null}
          </div>
        </div>
        <div
          className="target-step-pointer-right absolute cursor-pointer"
          style={{
            bottom: `${
              ((pointerValue - minStep) / (maxStep - minStep)) * 100
            }%`,
          }}
        />
        <div
          className="w-full absolute bottom-0 bg-gray-500"
          style={{ height: currentRodHeight }}
        />
      </div>
      <div>{currentStep}</div>
    </div>
  );
};
