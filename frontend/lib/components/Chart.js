import ChartJS from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import { createRef, useEffect, useState } from "react";
ChartJS.register(annotationPlugin);

const horizontalLine = (height) => ({
  type: "line",
  yMin: height,
  yMax: height,
  borderColor: "rgb(255, 99, 132)",
  borderWidth: 2,
});

const CHART_OPTIONS = {
  animation: false,
  scales: {
    y: {
      max: 140,
      min: 0,
      ticks: {
        display: false,
      },
      grid: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: { tension: 0.2 },
  },
};

function getGradient(range) {
  let bottom = range[0] / 140;
  let top = range[1] / 140;
  console.log(bottom, top);
  return function getGrad(context) {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) return null;
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;

    let gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );
    console.log(bottom, top);
    gradient.addColorStop(0, "rgb(255, 99, 132)");
    gradient.addColorStop(bottom, "rgb(255, 99, 132)");
    gradient.addColorStop(0.75 * bottom + 0.25 * top, "hsl(222, 100%, 70%)");
    gradient.addColorStop(0.25 * bottom + 0.75 * top, "hsl(222, 100%, 70%)");
    gradient.addColorStop(top, "rgb(255, 99, 132)");
    gradient.addColorStop(1, "rgb(255, 99, 132)");

    return gradient;
  };
}

const chartData = (data, range) => ({
  labels: data.map((d) => ""),
  datasets: [
    {
      label: "title",
      data: data.map((d) => d?.dB),
      backgroundColor: "hsl(222, 35%, 10%)",
      pointBackgroundColor: data.map((d) => {
        if (d?.doesNotCount) return "#000000";
        return d?.hit ? "#ff152b" : "hsl(222, 100%, 70%)";
      }),
      pointBorderColor: data.map((d) => {
        if (d?.doesNotCount) return "hsl(222, 100%, 70%)";
        return d?.hit ? "#ff152b" : "hsl(222, 100%, 70%)";
      }),
      pointRadius: 6,
      borderWidth: 1,
      borderColor: getGradient(range),
      fill: { target: "origin" },
    },
  ],
});

export default function Chart({ data, range }) {
  const [chart, setChart] = useState();
  const chartRef = createRef();
  useEffect(() => {
    let chart = new ChartJS(chartRef.current, {
      type: "line",
      data: chartData(data, [0, 140]),
      options: CHART_OPTIONS,
    });
    setChart(chart);
    return () => {
      chart.destroy();
    };
  }, []);
  if (chart && range) {
    chart.options.plugins.annotation.annotations = [
      horizontalLine(range[0]),
      horizontalLine(range[1]),
    ];
    chart.data = chartData(data, range);
    console.log("Update");
    chart.update();
  }
  return <canvas ref={chartRef}></canvas>;
}
