"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LoanStatus {
  label: string;
  value: number;
  count: number;
}

const DonutChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/loans-status');
        const result = await response.json();

        if (!result.success || !svgRef.current) return;

        const data = result.data;
        const total = data.reduce((sum: number, d: LoanStatus) => sum + Number(d.value), 0);

        const width = 400;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
          .attr("viewBox", [-width / 2, -height / 2, width, height])
          .style("max-width", "100%")
          .style("height", "auto");

        const color = d3.scaleOrdinal()
          .domain(['Al día', 'Atrasados', 'Pagado'])
          .range(['#4ECDC4', '#FF6B6B', '#45B7D1']);

        const pie = d3.pie<any>()
          .padAngle(0.008)
          .value(d => d.value);

        const arc = d3.arc()
          .innerRadius(radius * 0.6)
          .outerRadius(radius - 1)
          .cornerRadius(1);

        const arcs = svg.selectAll("arc")
          .data(pie(data))
          .join("path")
          .attr("fill", d => color(d.data.label))
          .attr("d", arc as any)
          .append("title")
          .text(d => `${d.data.label}: $${d3.format(",.2f")(d.data.value)}`);

        const texto = svg.append("g")
          .attr("text-anchor", "middle")
          .selectAll("text")
          .data(pie(data))
          .join("text")
          .attr("transform", d => `translate(${arc.centroid(d)})`)
          .attr("font-size", "12px")
          .call(text => text.append("tspan")
            .attr("y", "-0.8em")
            .attr("font-weight", "bold")
            .attr("font-size", "10px")
            .text(d => d.data.label))
          .call(text => text.append("tspan")
            .attr("x", 0)
            .attr("y", "0.4em")
            .attr("fill-opacity", 0.7)
            .attr("font-size", "9px")
            .text(d => `$${d3.format(",.0f")(d.data.value)}`))
          .call(text => text.append("tspan")
            .attr("x", 0)
            .attr("y", "1.4em")
            .attr("fill-opacity", 0.7)
            .attr("font-size", "8px")
            .text(d => `${Math.round((d.data.value / total) * 100)}%`));

      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Estado de Préstamos
      </h2>
      <div>
        <svg ref={svgRef} width="100%" height="300" />
      </div>
    </div>
  );
};

export default DonutChart;