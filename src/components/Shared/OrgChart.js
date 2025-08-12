import { useEffect, useRef } from 'react';

const OrgChart = ({ dataArray }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const loadGoogleCharts = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = drawChart;
        document.head.appendChild(script);
      } else {
        drawChart();
      }
    };

    const drawChart = () => {
      window.google.charts.load('current', { packages: ['orgchart'] });
      window.google.charts.setOnLoadCallback(() => {
        const data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');

        data.addRows(dataArray);

        const chart = new window.google.visualization.OrgChart(chartRef.current);
        chart.draw(data, { allowHtml: true });
      });
    };

    loadGoogleCharts();
  }, [dataArray]);

  return <div ref={chartRef}></div>;
};

export default OrgChart;
