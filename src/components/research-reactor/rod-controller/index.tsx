import { reactor } from "@/reactor/simulator";
import { useState } from "react";
import { ControlRod, RodPosition } from "./control-rod";
import { useUpdate } from "@/hooks/useUpdate";

type RodPositions = {
  safety: RodPosition;
  regulatory: RodPosition;
  shim: RodPosition;
};

const controlRodNames = ["safety", "regulatory", "shim"] as const;

export const RodController = () => {
  const [controllerRodPositions, setControlRodPositions] =
    useState<RodPositions>({
      safety: { currentStep: 0, targetStep: 0 },
      regulatory: { currentStep: 0, targetStep: 0 },
      shim: { currentStep: 0, targetStep: 0 },
    });

  useUpdate({
    initialData: controllerRodPositions,
    setData: setControlRodPositions,
    getData: () => reactor.getRodPositions() as RodPositions,
    checkIsChanged: (oldData, newData) =>
      controlRodNames.some(
        (name) =>
          oldData[name].currentStep !== newData[name]?.currentStep ||
          oldData[name].targetStep !== newData[name]?.targetStep
      ),
  });

  return (
    <div className="p-3 flex gap-5">
      <ControlRod
        name="Safety"
        currentStep={controllerRodPositions.safety.currentStep}
        targetStep={controllerRodPositions.safety.targetStep}
        updateTargetStep={(targetStep) =>
          reactor.setRodTarget("safety", targetStep)
        }
      />
      <ControlRod
        name="Regulatory"
        currentStep={controllerRodPositions.regulatory.currentStep}
        targetStep={controllerRodPositions.regulatory.targetStep}
        updateTargetStep={(targetStep) =>
          reactor.setRodTarget("regulatory", targetStep)
        }
      />
      <ControlRod
        name="Shim"
        currentStep={controllerRodPositions.shim.currentStep}
        targetStep={controllerRodPositions.shim.targetStep}
        updateTargetStep={(targetStep) =>
          reactor.setRodTarget("shim", targetStep)
        }
      />
    </div>
  );
};
