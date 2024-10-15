document.addEventListener("DOMContentLoaded", () => {
    const tableData = [...document.querySelectorAll("#data-table tbody tr")]
      .slice(0, 4)
      .map(row =>
        [...row.querySelectorAll("td")].slice(0, 10).map(td => parseInt(td.textContent))
      );
  
    const labels = Array.from({ length: 10 }, (_, i) => `데이터 ${i + 1}`);
  
    const colorPalette = [
      'rgba(255, 99, 132, 0.5)',
      'rgba(54, 162, 235, 0.5)',
      'rgba(255, 206, 86, 0.5)',
      'rgba(75, 192, 192, 0.5)',
      'rgba(153, 102, 255, 0.5)'
    ];
  
    const borderColorPalette = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)'
    ];
  
    const barChart = createChart('barChart', 'bar');
    const pieChart = createChart('pieChart', 'pie', { showLabels: true });
    const lineChart = createChart('lineChart', 'line');
  
    function createChart(id, type, options = {}) {
      return new Chart(document.getElementById(id), {
        type: type,
        data: {
          labels: labels,
          datasets: [{
            label: `${type} 차트 데이터`,
            data: labels.map((_, i) =>
              tableData.reduce((acc, row) => acc + row[i], 0) / tableData.length
            ),
            backgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length]),
            borderColor: labels.map((_, i) => borderColorPalette[i % borderColorPalette.length]),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 500,
            easing: 'easeInOutQuad'
          },
          plugins: {
            legend: { position: 'right' },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const total = tooltipItem.dataset.data.reduce((acc, val) => acc + val, 0);
                  const value = tooltipItem.raw;
                  const percentage = ((value / total) * 100).toFixed(2);
                  return `${tooltipItem.label}: ${percentage}%`;
                }
              }
            },
            datalabels: {
              display: options.showLabels || false,
              color: '#000',
              formatter: (value, ctx) => {
                const total = ctx.dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                return percentage > 5 ? `${percentage}%` : '';
              }
            }
          },
          scales: type === 'pie' ? {} : { y: { beginAtZero: true } }
        }
      });
    }
  
    ['barChart', 'pieChart', 'lineChart'].forEach(id => {
      const chartElement = document.getElementById(id);
      chartElement.onclick = (evt) => {
        const chart = getChartById(id);
        const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        if (points.length) {
          const index = points[0].index;
          highlightData(index);
          highlightTable(index);
        }
      };
    });
  
    document.body.onclick = (evt) => {
      if (!evt.target.closest('.charts-container')) {
        resetCharts();
        resetTable();
      }
    };
  
    function getChartById(id) {
      switch (id) {
        case 'barChart':
          return barChart;
        case 'pieChart':
          return pieChart;
        case 'lineChart':
          return lineChart;
        default:
          return null;
      }
    }
  
    function highlightData(index) {
      [barChart, pieChart, lineChart].forEach(chart => {
        const meta = chart.getDatasetMeta(0);
        const element = meta.data[index];
  
        element.width *= 1.15; // 너비 15% 확대
        element.height *= 1.15; // 높이 15% 확대
  
        chart.data.datasets[0].backgroundColor = chart.data.labels.map((_, i) =>
          i === index ? 'rgba(0, 0, 0, 0.8)' : colorPalette[i % colorPalette.length]
        );
        chart.update();
      });
    }
  
    function highlightTable(index) {
      resetTable();
      document.querySelectorAll(`#data-table td:nth-child(${index + 2}), th:nth-child(${index + 2})`)
        .forEach(cell => cell.classList.add('highlight'));
      document.querySelectorAll(`#data-table tbody tr`).forEach(row => {
        row.cells[index + 1].classList.add('highlight');
      });
    }
  
    function resetTable() {
      document.querySelectorAll('#data-table .highlight').forEach(cell => {
        cell.classList.remove('highlight');
      });
    }
  
    function resetCharts() {
      [barChart, pieChart, lineChart].forEach(chart => {
        chart.data.datasets[0].backgroundColor = labels.map((_, i) => colorPalette[i % colorPalette.length]);
        chart.update();
      });
    }
  });
  