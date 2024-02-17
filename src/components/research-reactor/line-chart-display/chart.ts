import {
  axisBottom,
  axisLeft,
  axisRight,
  BaseType,
  extent,
  Line,
  line,
  max,
  scaleLinear,
  select,
  Selection,
} from "d3";

export const chartContainerId = "research-reactor-line-chart-display";
const xAxisId = "line-chart-x-axis";
const yLeftAxisId = "line-chart-y-left-axis";
const yRightAxisId = "line-chart-y-right-axis";
const fuelTemperaturePathId = "fuel-temperature-path";
const powerPathId = "power-path";

export type DataPoint = {
  time: number;
  power: number;
  fuelTemperature: number;
  reactivity: number;
};

export const updateChart = ({
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
  const yLeftScale = scaleLinear().range([height, 0]).domain([0, 350]);
  const maxPower = max(data, (dataPoint) => dataPoint.power)!;
  const yRightScale = scaleLinear()
    .range([height, 0])
    .domain([0, Math.pow(10, Math.floor(Math.log10(maxPower)) + 1)]);
  const xScale = scaleLinear()
    .range([0, width])
    .domain(extent(data, (dataPoint) => dataPoint.time) as number[]);

  const fuelTemperatureLine = line()
    .x((dataPoint) => xScale((dataPoint as unknown as DataPoint).time))
    .y((dataPoint) =>
      yLeftScale((dataPoint as unknown as DataPoint).fuelTemperature)
    );
  const powerLine = line()
    .x((dataPoint) => xScale((dataPoint as unknown as DataPoint).time))
    .y((dataPoint) => yRightScale((dataPoint as unknown as DataPoint).power));

  chart
    .select(`#${xAxisId}`)
    .attr("transform", `translate(0,${height})`)
    .call(
      axisBottom(xScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );
  chart
    .select(`#${yLeftAxisId}`)
    .call(
      axisLeft(yLeftScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );
  chart
    .select(`#${yRightAxisId}`)
    .attr("transform", `translate(${width},0)`)
    .call(
      axisRight(yRightScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );

  const updatePath = (id: string, line: Line<DataPoint>) => {
    const updatedPath = select(`#${id}`)
      .interrupt()
      .datum(data)
      .attr("d", line);
    const pathLength = (updatedPath.node() as SVGPathElement).getTotalLength();

    updatedPath
      .attr("stroke-dashoffset", pathLength)
      .attr("stroke-dasharray", pathLength)
      .attr("stroke-dashoffset", 0);
  };
  updatePath(
    fuelTemperaturePathId,
    fuelTemperatureLine as unknown as Line<DataPoint>
  );
  updatePath(powerPathId, powerLine as unknown as Line<DataPoint>);
};

export const initChart = () => {
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
  chart.append("g").attr("id", yLeftAxisId);
  chart.append("g").attr("id", yRightAxisId);

  const addPath = (id: string, color: string) => {
    group
      .append("path")
      .attr("id", id)
      .attr("transform", `translate(${margin.left},0)`)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5);
  };
  addPath(fuelTemperaturePathId, "blue");
  addPath(powerPathId, "red");

  return { width, height, chart };
};
