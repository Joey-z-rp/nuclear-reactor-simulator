import { useEffect, useRef } from "react";
import { reactor } from "@/reactor/simulator";
import { DataPoint, chartContainerId, initChart, updateChart } from "./chart";

const DATA_POINT_PER_SECOND = 10;
const TIME_RANGE = 30; // second

export const LineChartDisplay = () => {
  const dataRef = useRef<{ lastIndex: number; data: DataPoint[] }>({
    lastIndex: 0,
    data: [],
  });

  useEffect(() => {
    const container = document.getElementById(chartContainerId);
    if (container?.childElementCount) return;

    const { width, height, chart } = initChart();

    const update = () => {
      const dataPointsLimit = DATA_POINT_PER_SECOND * TIME_RANGE;
      const currentIndex = reactor.getCurrentIndex();
      if (dataRef.current.lastIndex < currentIndex) {
        const interval = Math.floor(
          1000 / reactor.getSettings().dtStep / DATA_POINT_PER_SECOND
        );
        for (
          let i = dataRef.current.lastIndex;
          i <= currentIndex;
          i += interval
        ) {
          dataRef.current.data.push({
            time: reactor.getSimulatorTimes()[i],
            power: reactor.getPower(i),
            fuelTemperature: reactor.getFuelTemperatures()[i],
            reactivity: reactor.getReactivities()[i],
          });
        }
        if (dataRef.current.data.length > dataPointsLimit) {
          dataRef.current.data.splice(
            0,
            dataRef.current.data.length - dataPointsLimit
          );
        }
        dataRef.current.lastIndex = currentIndex;
        updateChart({ data: dataRef.current.data, width, height, chart });
      }

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }, []);

  return (
    <div className="h-full">
      <div id={chartContainerId} />
    </div>
  );
};
