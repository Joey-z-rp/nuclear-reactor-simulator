import { useEffect, useRef } from "react";
import {
  axisBottom,
  axisLeft,
  BaseType,
  extent,
  line,
  max,
  scaleLinear,
  select,
  Selection,
} from "d3";
import { reactor } from "@/reactor/simulator";

const DATA_POINT_PER_SECOND = 10;
const TIME_RANGE = 30; // second

const chartContainerId = "research-reactor-line-chart-display";
const xAxisId = "line-chart-x-axis";
const yAxisId = "line-chart-y-axis";

type DataPoint = {
  time: number;
  power: number;
  fuelTemperature: number;
  reactivity: number;
};

const updateChart = ({
  data,
  chart,
  height,
  width,
}: {
  data: DataPoint[];
  chart: Selection<SVGGElement, unknown, HTMLElement, any>;
  height: number;
  width: number;
}) => {
  const yScale = scaleLinear()
    .range([height, 0])
    .domain([0, 2 * max(data, (dataPoint) => dataPoint.power)!]);
  const xScale = scaleLinear()
    .range([0, width])
    .domain(extent(data, (dataPoint) => dataPoint.time) as number[]);

  const createdLine = line()
    .x((dataPoint) => xScale((dataPoint as unknown as DataPoint).time))
    .y((dataPoint) => yScale((dataPoint as unknown as DataPoint).power));

  chart
    .select(`#${xAxisId}`)
    .attr("transform", `translate(0,${height})`)
    .call(
      axisBottom(xScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );
  chart
    .select(`#${yAxisId}`)
    .call(
      axisLeft(yScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );

  const updatedPath = select("path")
    .interrupt()
    .datum(data)
    .attr("d", createdLine as any);

  const pathLength = (updatedPath.node() as SVGPathElement).getTotalLength();
  updatedPath
    .attr("stroke-dashoffset", pathLength)
    .attr("stroke-dasharray", pathLength)
    .attr("stroke-dashoffset", 0);
};

const initChart = () => {
  const svg = select(`#${chartContainerId}`)
    .append("svg")
    .attr("height", 300)
    .attr("width", 600);
  const margin = { top: 0, bottom: 20, left: 30, right: 20 };
  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`);
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const group = chart
    .append("g")
    .attr("transform", `translate(-${margin.left},-${margin.top})`);

  // Add empty scales group for the scales to be attatched to on update
  chart.append("g").attr("id", xAxisId);
  chart.append("g").attr("id", yAxisId);

  // Add empty path
  group
    .append("path")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  return { width, height, chart };
};

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
