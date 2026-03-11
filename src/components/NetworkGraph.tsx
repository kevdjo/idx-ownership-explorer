"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Shareholder {
  name: string;
  percent: number;
  total_shares: number;
  holding_scrip: number;
  holding_scrip_percentage: number;
  holding_scripless: number;
  holding_scripless_percentage: number;
}

interface Company {
  ticker: string;
  company: string;
  shareholders: Shareholder[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "company" | "investor" | "center";
  value: number;
  color: string;
  ticker?: string;
  investorName?: string;
  percent?: number;
  x: number;
  y: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  label: string;
}

interface NetworkGraphProps {
  companies: Company[];
  centerNode?: {
    type: "company" | "investor";
    name: string;
    ticker?: string;
  };
  maxNodes?: number;
}

export default function NetworkGraph({
  companies,
  centerNode,
  maxNodes = 50,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const buildGraph = () => {
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      if (centerNode) {
        if (centerNode.type === "company" && centerNode.ticker) {
          const company = companies.find((c) => c.ticker === centerNode.ticker);

          if (company) {
            const shareholderCount = Math.min(company.shareholders.length, maxNodes);
            const angleStep = (2 * Math.PI) / shareholderCount;

            company.shareholders.slice(0, maxNodes).forEach((shareholder, index) => {
              const angle = index * angleStep;
              const radius = 180 + (shareholder.percent / 100) * 80;

              nodes.push({
                id: `investor:${shareholder.name}`,
                label: shareholder.name,
                type: "investor",
                value: 12 + (shareholder.percent / 100) * 15,
                color: "#a855f7",
                investorName: shareholder.name,
                percent: shareholder.percent,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
              });

              links.push({
                source: `investor:${shareholder.name}`,
                target: centerNode.ticker!,
                value: shareholder.percent,
                label: `${shareholder.percent.toFixed(2)}%`,
              });
            });

            nodes.push({
              id: centerNode.ticker,
              label: centerNode.ticker,
              type: "center",
              value: 25,
              color: "#3b82f6",
              ticker: centerNode.ticker,
              x: 0,
              y: 0,
            });
          }
        } else if (centerNode.type === "investor") {
          const investorHoldings: { ticker: string; company: string; percent: number }[] = [];

          companies.forEach((company) => {
            const shareholder = company.shareholders.find(
              (s) => s.name === centerNode.name
            );

            if (shareholder) {
              investorHoldings.push({
                ticker: company.ticker,
                company: company.company,
                percent: shareholder.percent,
              });
            }
          });

          const holdingCount = Math.min(investorHoldings.length, maxNodes);
          const angleStep = (2 * Math.PI) / holdingCount;

          investorHoldings.slice(0, maxNodes).forEach((holding, index) => {
            const angle = index * angleStep;
            const radius = 180 + (holding.percent / 100) * 80;

            nodes.push({
              id: holding.ticker,
              label: holding.ticker,
              type: "company",
              value: 12 + (holding.percent / 100) * 15,
              color: "#3b82f6",
              ticker: holding.ticker,
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            });

            links.push({
              source: `investor:${centerNode.name}`,
              target: holding.ticker,
              value: holding.percent,
              label: `${holding.percent.toFixed(2)}%`,
            });
          });

          nodes.push({
            id: `investor:${centerNode.name}`,
            label: centerNode.name,
            type: "center",
            value: 25,
            color: "#a855f7",
            investorName: centerNode.name,
            x: 0,
            y: 0,
          });
        }
      }

      return { nodes, links };
    };

    const { nodes, links } = buildGraph();
    setNodeCount(nodes.length);
    setLinkCount(links.length);

    if (nodes.length === 0) return;

    // Create SVG groups
    const svg = d3.select(svgRef.current);
    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, d3.SimulationLinkDatum<GraphNode>>(links)
          .id((d: GraphNode) => d.id)
          .distance(150)
          .strength(0.3)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(0, 0))
      .force("collide", d3.forceCollide().radius((d: d3.SimulationNodeDatum) => (d as unknown as GraphNode).value + 5).strength(0.8))
      .alphaDecay(0.02)
      .alphaMin(0.1);

    // Draw links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#9ca3af")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", (d: d3.SimulationLinkDatum<GraphNode>) => {
        const linkValue = (d as unknown as { value?: number }).value || 0;
        return Math.min(2.5, Math.max(0.5, linkValue / 15));
      })
      .attr("stroke-linecap", "round");

    // Draw arrowheads
    svg
      .append("defs")
      .selectAll("marker")
      .data(["arrow"])
      .join("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#9ca3af")
      .attr("d", "M0,-5L10,0L0,5");

    link.attr("marker-end", "url(#arrow)");

    // Draw nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(d3.drag<any, GraphNode>().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => d.value)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => (d.type === "center" ? "#fbbf24" : "transparent"))
      .attr("stroke-width", (d) => (d.type === "center" ? 4 : 0))
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        if (d.ticker) {
          window.location.href = `/company/${d.ticker}`;
        } else if (d.investorName) {
          window.location.href = `/investor/${encodeURIComponent(d.investorName)}`;
        }
      })
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#60a5fa").attr("stroke-width", 3);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("stroke", d.type === "center" ? "#fbbf24" : "transparent")
          .attr("stroke-width", d.type === "center" ? 4 : 0);
      });

    // Add labels
    node
      .append("text")
      .attr("dy", (d) => -d.value - 6)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("font-family", "Inter, sans-serif")
      .attr("pointer-events", "none")
      .attr("paint-order", "stroke")
      .attr("stroke", "#000")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .text((d) => d.label.length > 20 ? d.label.substring(0, 18) + "..." : d.label);

    // Update positions on tick
    simulation.on("tick", () => {
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);

      link
        .attr("x1", (d: d3.SimulationLinkDatum<GraphNode>) => (d.source as GraphNode).x)
        .attr("y1", (d: d3.SimulationLinkDatum<GraphNode>) => (d.source as GraphNode).y)
        .attr("x2", (d: d3.SimulationLinkDatum<GraphNode>) => (d.target as GraphNode).x)
        .attr("y2", (d: d3.SimulationLinkDatum<GraphNode>) => (d.target as GraphNode).y);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Fit to view
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
    );

    return () => {
      simulation.stop();
    };
  }, [companies, centerNode, maxNodes]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {centerNode
            ? `${centerNode.type === "company" ? "Company" : "Investor"} Network`
            : "Ownership Network"}
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Company</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Investor</span>
          </div>
        </div>
      </div>

      <svg ref={svgRef} className="w-full" style={{ height: "500px" }} />

      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {nodeCount} nodes • {linkCount} connections
          {centerNode && " • Click on nodes to navigate • Drag to move • Scroll to zoom"}
        </p>
      </div>
    </div>
  );
}
