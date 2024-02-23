import { Toggle } from "@/components/ui/toggle";
import { reactor } from "@/reactor/simulator";
import { useRef, useState } from "react";

export const PulseControl = () => {
  const [isPulseMode, setIsPulseMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Toggle
        isChecked={isPulseMode}
        onChange={() => {
          if (!isPulseMode) {
            reactor.setRodTarget("regulatory", 0);
          }
          setIsPulseMode(!isPulseMode);
        }}
        text="Pulse mode"
      />
      {isPulseMode && (
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            className="text-xs"
            type="number"
            placeholder="Pulse steps"
          />
          <button
            className="text-xs text-white bg-blue-500 rounded-sm p-1"
            onClick={() => {
              if (
                inputRef.current?.value &&
                reactor.getRodPositions().regulatory.currentStep === 0
              ) {
                reactor.pulse(Number(inputRef.current.value));
              }
            }}
          >
            Fire
          </button>
        </div>
      )}
    </div>
  );
};
