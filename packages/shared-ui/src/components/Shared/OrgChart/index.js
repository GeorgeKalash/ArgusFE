import { useEffect, useRef } from 'react';
import styles from '@argus/shared-ui/src/components/Shared/OrgChart/OrgChart.module.css'


const index = ({ data, allowCollapse = false }) => {
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
        const dataTable = new window.google.visualization.DataTable();
        dataTable.addColumn('string', 'Name');
        dataTable.addColumn('string', 'Manager');

        dataTable.addRows(data);

        const chart = new window.google.visualization.OrgChart(chartRef.current);
        chart.draw(dataTable, { allowHtml: true, allowCollapse });
      });
    };

    loadGoogleCharts();
  }, [data]);

  return <div ref={chartRef} className={styles.orgChartRoot}></div>;
};

export default index;
