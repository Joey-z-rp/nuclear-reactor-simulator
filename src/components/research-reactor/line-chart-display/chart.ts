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
const yTemperatureAxisId = "line-chart-y-temperature-axis";
const yPowerAxisId = "line-chart-y-power-axis";
const yReactivityAxisId = "line-chart-y-reactivity-axis";
const fuelTemperaturePathId = "fuel-temperature-path";
const powerPathId = "power-path";
const netReactivityPathId = "net-reactivity-path";
const rawReactivityPathId = "raw-reactivity-path";
const netReactivityMarkerId = "net-reactivity-marker";
const rawReactivityMarkerId = "raw-reactivity-marker";
const fuelTemperatureColor = "green";
const powerColor = "red";
const rawReactivityColor = "gray";
const netReactivityColor = "blue";

const yReactivityAxisOffset = 50;

export type DataPoint = {
  time: number;
  power: number;
  fuelTemperature: number;
  netReactivity: number;
  rawReactivity: number;
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
  const yTemperatureScale = scaleLinear().range([height, 0]).domain([0, 350]);
  const maxPower = max(data, (dataPoint) => dataPoint.power)!;
  const yPowerScale = scaleLinear()
    .range([height, 0])
    .domain([0, Math.pow(10, Math.floor(Math.log10(maxPower)) + 1)]);
  const yReactivityScale = scaleLinear()
    .range([height, 0])
    .domain([-1000, 1000]);
  const xScale = scaleLinear()
    .range([0, width])
    .domain(extent(data, (dataPoint) => dataPoint.time) as number[]);

  const fuelTemperatureLine = line()
    .x((dataPoint) => xScale((dataPoint as unknown as DataPoint).time))
    .y((dataPoint) =>
      yTemperatureScale((dataPoint as unknown as DataPoint).fuelTemperature)
    );
  const powerLine = line()
    .x((dataPoint) => xScale((dataPoint as unknown as DataPoint).time))
    .y((dataPoint) => yPowerScale((dataPoint as unknown as DataPoint).power));
  const netReactivityLine = line()
    .x((dataPoint) => xScale((dataPoint as unknown as DataPoint).time))
    .y((dataPoint) =>
      yReactivityScale(
        Math.max((dataPoint as unknown as DataPoint).netReactivity, -1000)
      )
    );
  const rawReactivityLine = line()
    .x((dataPoint) => xScale((dataPoint as unknown as DataPoint).time))
    .y((dataPoint) =>
      yReactivityScale(
        Math.max((dataPoint as unknown as DataPoint).rawReactivity, -1000)
      )
    );

  chart
    .select(`#${xAxisId}`)
    .attr("transform", `translate(0,${height})`)
    .call(
      axisBottom(xScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );
  chart
    .select(`#${yTemperatureAxisId}`)
    .call(
      axisLeft(yTemperatureScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );
  chart
    .select(`#${yPowerAxisId}`)
    .attr("transform", `translate(${width},0)`)
    .call(
      axisRight(yPowerScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );
  chart
    .select(`#${yReactivityAxisId}`)
    .attr("transform", `translate(${width + yReactivityAxisOffset},0)`)
    .call(
      axisRight(yReactivityScale) as unknown as (
        selection: Selection<BaseType, unknown, HTMLElement, any>
      ) => void
    );

  const updatePath = (id: string, line: Line<DataPoint>) => {
    const updatedPath = select(`#${id}`).datum(data).attr("d", line);
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
  updatePath(
    rawReactivityPathId,
    rawReactivityLine as unknown as Line<DataPoint>
  );
  updatePath(
    netReactivityPathId,
    netReactivityLine as unknown as Line<DataPoint>
  );

  const updateReactivityMarker = (
    markerId: string,
    markerColor: string,
    value: number
  ) => {
    chart.select(`#${markerId}`).remove();
    chart
      .append("line")
      .attr("id", markerId)
      .attr("x1", width + yReactivityAxisOffset)
      .attr("y1", yReactivityScale(value))
      .attr("x2", width + yReactivityAxisOffset + 10)
      .attr("y2", yReactivityScale(value))
      .attr("stroke", markerColor)
      .attr("stroke-width", 2);
  };
  updateReactivityMarker(
    netReactivityMarkerId,
    netReactivityColor,
    data[data.length - 1].netReactivity
  );
  updateReactivityMarker(
    rawReactivityMarkerId,
    rawReactivityColor,
    data[data.length - 1].rawReactivity
  );
};

export const initChart = () => {
  const svg = select(`#${chartContainerId}`)
    .append("svg")
    .attr("height", 300)
    .attr("width", 600);
  const margin = { top: 20, bottom: 20, left: 30, right: 100 };
  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const group = chart
    .append("g")
    .attr("transform", `translate(-${margin.left},0)`);

  // Add empty scales group for the scales to be attatched to on update
  chart.append("g").attr("id", xAxisId);
  chart.append("g").attr("id", yTemperatureAxisId);
  chart.append("g").attr("id", yPowerAxisId);
  chart.append("g").attr("id", yReactivityAxisId);

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
  addPath(fuelTemperaturePathId, fuelTemperatureColor);
  addPath(powerPathId, powerColor);
  addPath(rawReactivityPathId, rawReactivityColor);
  addPath(netReactivityPathId, netReactivityColor);

  return { width, height, chart };
};
