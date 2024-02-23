import { useUpdate } from "@/hooks/useUpdate";
import { reactor } from "@/reactor/simulator";
import { useState } from "react";
import { StatusDisplay } from "./status-display";

const simulationSpeeds = [
  0.01, 0.05, 0.1, 0.5, 0.75, 1, 1.25, 1.5, 2, 4, 6, 8, 10, 15, 20, 50, 100,
];

export const SimulationControl = () => {
  const [simulationStatus, setSimulationStatus] = useState({
    isPaused: true,
    simulationSpeed: 1,
    isActiveWaterCoolingEnabled: true,
  });

  useUpdate({
    initialData: simulationStatus,
    getData: () => ({
      isPaused: reactor.getIsPaused(),
      simulationSpeed: reactor.getSimulationSpeed(),
      isActiveWaterCoolingEnabled: reactor.getIsActiveWaterCoolingEnabled(),
    }),
    setData: setSimulationStatus,
    checkIsChanged: (oldData, newData) =>
      oldData.isPaused !== newData.isPaused ||
      oldData.simulationSpeed !== newData.simulationSpeed ||
      oldData.isActiveWaterCoolingEnabled !==
        newData.isActiveWaterCoolingEnabled,
  });

  const togglePaused = () => {
    if (simulationStatus.isPaused) {
      reactor.start();
    } else {
      reactor.pause();
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
    <div className="p-5">
      <div className="bg-gray-300 p-3 rounded-sm mb-2 flex flex-col gap-3">
        <div>
          <button
            className="text-sm text-white bg-blue-500 rounded-md p-3 min-w-16"
            onClick={togglePaused}
          >
            {simulationStatus.isPaused ? "Start" : "Pause"}
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
          <label
            className="inline-flex items-center cursor-pointer"
            onClick={() =>
              reactor.setIsActiveWaterCoolingEnabled(
                !simulationStatus.isActiveWaterCoolingEnabled
              )
            }
          >
            <input
              type="checkbox"
              checked={simulationStatus.isActiveWaterCoolingEnabled}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Active water cooling
            </span>
          </label>
        </div>
      </div>
      <StatusDisplay />
    </div>
  );
};
