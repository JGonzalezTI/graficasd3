"use client";

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LeadLoanData {
  period: string;
  leads: number;
  loans: number;
}

export default function LeadsLoansChart() {
  const [data, setData] = useState<LeadLoanData[]>([]);
  const [period, setPeriod] = useState<string>('month');
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 1000;
  const height = 500;
  const margin = { top: 40, right: 80, bottom: 60, left: 80 };

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/leads-loans?period=${period}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data.map((item: any) => ({
          period: item.period,
          leads: Number(item.leads),
          loans: Number(item.loans)
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current);

    const x = d3.scaleBand()
      .range([margin.left, width - margin.right])
      .domain(data.map(d => d.period))
      .padding(0.2);

    const y = d3.scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, d3.max(data, d => Math.max(d.leads, d.loans)) || 0])
      .nice();

    // Barras para leads
    svg.selectAll(".bar-leads")
      .data(data)
      .join("rect")
      .attr("class", "bar-leads")
      .attr("x", d => (x(d.period) || 0))
      .attr("y", d => y(d.leads))
      .attr("width", x.bandwidth() / 2)
      .attr("height", d => height - margin.bottom - y(d.leads))
      .attr("fill", "#4f46e5")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.7);
        tooltip
          .style("opacity", 1)
          .html(`Leads: ${d.leads}<br>Período: ${d.period}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      });

    // Barras para loans
    svg.selectAll(".bar-loans")
      .data(data)
      .join("rect")
      .attr("class", "bar-loans")
      .attr("x", d => (x(d.period) || 0) + x.bandwidth() / 2)
      .attr("y", d => y(d.loans))
      .attr("width", x.bandwidth() / 2)
      .attr("height", d => height - margin.bottom - y(d.loans))
      .attr("fill", "#ef4444")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.7);
        tooltip
          .style("opacity", 1)
          .html(`Préstamos: ${d.loans}<br>Período: ${d.period}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      });

    // Ejes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("border-radius", "5px");

    // Leyenda
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#4f46e5");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Leads");

    legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("y", 20)
      .attr("fill", "#ef4444");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 32)
      .text("Préstamos");

  }, [data]);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Leads Préstamos por Período</h2>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="week">Semanal</option>
          <option value="month">Mensual</option>
          <option value="year">Anual</option>
        </select>
      </div>
      
      <div className="w-full overflow-x-auto">
        <svg 
          ref={svgRef} 
          width={width} 
          height={height}
          className="mx-auto"
        />
      </div>
    </div>
  );
}