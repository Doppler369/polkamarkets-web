import { fromTimestampToDate } from 'helpers/date';

function generateCustomOptions(ticker: string, showGrid: boolean) {
  return {
    chart: {
      toolbar: {
        show: false
      },
      type: 'area',
      zoom: {
        enabled: false
      }
    },
    tooltip: {
      enabled: true,
      marker: {
        show: false
      },
      custom({ series, seriesIndex, dataPointIndex, w }) {
        const currentValue = series[seriesIndex][dataPointIndex];
        const currentDate = w.globals.seriesX[seriesIndex][dataPointIndex];
        const formatedDate = fromTimestampToDate(currentDate).format(
          'MMMM D, YYYY'
        );
        const formatedTime = fromTimestampToDate(currentDate).format('h:mm A');

        return `<div class="apexcharts-tooltip-box">
          <span class="apexcharts-tooltip-text-value">${currentValue.toFixed(
            3
          )} ${ticker}</span>
          <span class="apexcharts-tooltip-text-date">${formatedDate}</span>
          <span class="apexcharts-tooltip-text-date">${formatedTime}</span>
          </div>`;
      }
    },
    markers: {
      size: 0,
      colors: undefined,
      strokeColors: '#5751FC',
      strokeWidth: 2,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      shape: 'circle',
      radius: 2,
      offsetX: 0,
      offsetY: 0,
      onClick: undefined,
      onDblClick: undefined,
      showNullDataPoints: true,
      hover: {
        size: undefined,
        sizeOffset: 3
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 1.7
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: showGrid,
        format: 'hh:mm TT'
      },
      tooltip: {
        enabled: false
      },
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: showGrid,
        formatter(value) {
          return `${value} ${ticker}`;
        },
        offsetX: -15
      }
    },
    grid: {
      show: showGrid,
      borderColor: '#252C3B',
      strokeDashArray: 5,
      position: 'back',
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    colors: ['#5751FC'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        opacityFrom: 0.85,
        opacityTo: 0.5
      }
    }
  };
}

export default generateCustomOptions;
