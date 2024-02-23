import { useUpdate } from "@/hooks/useUpdate";
import { reactor } from "@/reactor/simulator";
import { useState } from "react";
import { StatusDisplay } from "./status-display";
import { Toggle } from "@/components/ui/toggle";
import { PulseControl } from "./pulse-control";

const simulationSpeeds = [
  0.01, 0.05, 0.1, 0.5, 0.75, 1, 1.25, 1.5, 2, 4, 6, 8, 10, 15, 20, 50, 100,
];

export const SimulationControl = () => {
  const [isPaused, setIsPaused] = useState(true);
  const [simulationStatus, setSimulationStatus] = useState({
    simulationSpeed: 1,
    isActiveWaterCoolingEnabled: true,
  });

  useUpdate({
    initialData: simulationStatus,
    getData: () => ({
      simulationSpeed: reactor.getSimulationSpeed(),
      isActiveWaterCoolingEnabled: reactor.getIsActiveWaterCoolingEnabled(),
    }),
    setData: setSimulationStatus,
    checkIsChanged: (oldData, newData) =>
      oldData.simulationSpeed !== newData.simulationSpeed ||
      oldData.isActiveWaterCoolingEnabled !==
        newData.isActiveWaterCoolingEnabled,
  });

  const togglePaused = () => {
    if (reactor.getIsPaused()) {
      reactor.start();
      setIsPaused(false);
    } else {
      reactor.pause();
      setIsPaused(true);
    }
  };

  const changeSpeed = (direction: "increase" | "decrease") => {
    const index = simulationSpeeds.indexOf(simulationStatus.simulationSpeed);
    const newSpeed =
      direction === "increase"
        ? simulationSpeeds[index + 1]
        : simulationSpeeds[index - 1];
    if (newSpeed) reactor.setSimulationSpeed(newSpeed);
  };

  return (
    <div className="p-2">
      <div className="bg-gray-300 p-3 rounded-sm mb-2 flex flex-col gap-3">
        <div className="flex justify-between">
          <button
            className="text-sm text-white bg-blue-500 rounded-md p-3 min-w-16"
            onClick={togglePaused}
          >
            {isPaused ? "Start" : "Pause"}
          </button>
          <button
            className="text-sm text-white bg-blue-500 rounded-md p-3 min-w-16"
            onClick={() => location?.reload()}
          >
            Reset
          </button>
        </div>
        <div className="flex">
          <button
            className="text-xs text-white bg-blue-500 rounded-md p-1 mr-2"
            onClick={() => changeSpeed("decrease")}
          >
            {"<<"}
          </button>
          <span className="min-w-24 flex justify-between">
            <span>Speed:</span>
            <span>{simulationStatus.simulationSpeed}x</span>
          </span>
          <button
            className="text-xs text-white bg-blue-500 rounded-md p-1 ml-2"
            onClick={() => changeSpeed("increase")}
          >
            {">>"}
          </button>
        </div>
        <div>
          <Toggle
            isChecked={simulationStatus.isActiveWaterCoolingEnabled}
            onChange={() =>
              reactor.setIsActiveWaterCoolingEnabled(
                !simulationStatus.isActiveWaterCoolingEnabled
              )
            }
            text="Active water cooling"
          />
        </div>
        <div>
          <PulseControl />
        </div>
      </div>
      <StatusDisplay />
    </div>
  );
};
