import { useUpdate } from "@/hooks/useUpdate";
import { reactor } from "@/reactor/simulator";
import { useState } from "react";

const simulationSpeeds = [
  0.01, 0.05, 0.1, 0.5, 0.75, 1, 1.25, 1.5, 2, 4, 6, 8, 10, 15, 20, 50, 100,
];

export const SimulationControl = () => {
  const [simulationStatus, setSimulationStatus] = useState({
    isPaused: true,
    simulationSpeed: 1,
  });

  useUpdate({
    initialData: simulationStatus,
    getData: () => ({
      isPaused: reactor.getIsPaused(),
      simulationSpeed: reactor.getSimulationSpeed(),
    }),
    setData: setSimulationStatus,
    checkIsChanged: (oldData, newData) =>
      oldData.isPaused !== newData.isPaused ||
      oldData.simulationSpeed !== newData.simulationSpeed,
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
      <div className="bg-gray-300 p-3 rounded-sm">
        <div className="mb-3">
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
      </div>
    </div>
  );
};
