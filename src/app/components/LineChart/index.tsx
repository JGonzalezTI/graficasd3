import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface FinancialData {
  transactions: Array<{
    month: string;
    total_amount: number;
  }>;
  loans: Array<{
    month: string;
    total_capital: number;
    total_interest: number;
  }>;
}

export default function LineChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/transactions');
      const data: FinancialData = await response.json();
      console.log('data', data)
      
      // Preparar los datos en el formato necesario
      const formatData = [
        ...data.transactions.map(t => ({
          date: new Date(t.month),
          value: t.total_amount,
          category: 'Ingresos'
        })),
        ...data.loans.map(l => ({
          date: new Date(l.month),
          value: l.total_capital,
          category: 'Capital'
        })),
        ...data.loans.map(l => ({
          date: new Date(l.month),
          value: l.total_interest,
          category: 'Intereses'
        }))
      ];

      // Dimensiones del grfico
      const width = 1200;
      const height = 500;
      const marginTop = 90;
      const marginRight = 150;
      const marginBottom = 50;
      const marginLeft = 70;

      // Limpiar SVG existente
      d3.select(svgRef.current).selectAll("*").remove();

      // Crear escalas
      const x = d3.scaleUtc()
        .domain(d3.extent(formatData, d => d.date) as [Date, Date])
        .range([marginLeft, width - marginRight]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(formatData, d => d.value) as number])
        .range([height - marginBottom, marginTop]);

      const color = d3.scaleOrdinal()
        .domain(['Ingresos', 'Capital', 'Intereses'])
        .range(['rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(255, 99, 132)']);

      // Crear el contenedor SVG
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-10, -20, width + 20, height + 40])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

      // Añadir ejes
      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

      svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y));

      // Crear las líneas
      const line = d3.line<any>()
        .x(d => x(d.date))
        .y(d => y(d.value));

      // Agrupar datos por categoría
      const series = Array.from(d3.group(formatData, d => d.category));

      // Dibujar las líneas
      const serie = svg.append("g")
        .selectAll("path")
        .data(series)
        .join("g");

      serie.append("path")
        .attr("fill", "none")
        .attr("stroke", d => color(d[0]))
        .attr("stroke-width", 1.5)
        .attr("d", d => line(d[1]) as string);

      // Añadir etiquetas
      serie.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("text")
        .data(d => d[1])
        .join("text")
        .text(d => d3.format(",.0f")(d.value))
        .attr("dy", "0.35em")
        .attr("x", d => x(d.date))
        .attr("y", d => y(d.value))
        .call(text => text.filter((d, i, data) => i === data.length - 1)
          .append("tspan")
          .attr("font-weight", "bold")
          .text(d => ` ${d.category}`))
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 6);

      // Agregar leyenda
      const legend = svg.append("g")
        .attr("transform", `translate(${width - marginRight + 10}, ${marginTop})`)
        .attr("font-family", "sans-serif")
        .attr("font-size", 12);

      legend.selectAll("rect")
        .data(['Ingresos', 'Capital', 'Intereses'])
        .join("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 25)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => color(d));

      legend.selectAll("text")
        .data(['Ingresos', 'Capital', 'Intereses'])
        .join("text")
        .attr("x", 25)
        .attr("y", (d, i) => i * 25 + 12)
        .text(d => d);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-[600px] overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
        Evolución de Préstamos e Ingresos
      </h2>
      <div>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}