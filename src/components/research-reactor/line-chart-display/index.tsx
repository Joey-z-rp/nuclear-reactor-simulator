import { useEffect, useRef } from "react";
import { reactor } from "@/reactor/simulator";
import { DataPoint, chartContainerId, initChart, updateChart } from "./chart";

const DATA_POINT_PER_SECOND = 10;
const TIME_RANGE = 30; // second

export const LineChartDisplay = () => {
  const dataRef = useRef<{ lastIndex: number; data: DataPoint[] }>({
    lastIndex: -1,
    data: [],
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = document.getElementById(chartContainerId);
    if (container?.childElementCount || !containerRef.current) return;

    const { width, height, chart } = initChart({
      containerWidth: containerRef.current.offsetWidth,
      containerHeight: containerRef.current.offsetHeight,
    });

    const update = () => {
      const dataPointsLimit = DATA_POINT_PER_SECOND * TIME_RANGE;
      const currentIndex = reactor.getCurrentIndex();
      if (dataRef.current.lastIndex !== currentIndex) {
        const addDataPoint = (fromIndex: number, toIndex: number) => {
          const interval = Math.floor(
            1000 / reactor.getSettings().dtStep / DATA_POINT_PER_SECOND
          );
          for (
            let i = fromIndex < 0 ? 0 : fromIndex;
            i <= toIndex;
            i += interval
          ) {
            dataRef.current.data.push({
              time: reactor.getSimulatorTimes()[i],
              power: reactor.getPower(i),
              fuelTemperature: reactor.getFuelTemperatures()[i],
              netReactivity: reactor.getNetReactivities()[i],
              rawReactivity: reactor.getRawReactivities()[i],
            });
          }
        };

        if (dataRef.current.lastIndex < currentIndex) {
          addDataPoint(dataRef.current.lastIndex, currentIndex);
        } else {
          addDataPoint(dataRef.current.lastIndex, reactor.getDataPoints() - 1);
          addDataPoint(0, currentIndex);
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
    <div className="h-full" ref={containerRef}>
      <div id={chartContainerId} />
    </div>
  );
};
