import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { Attack } from '../types/Attack';
import { useWindowSize } from '../hooks/useWindowSize';

const MapContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
`;

const MapSvg = styled.svg`
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%);
`;

interface AttackMapProps {
  attacks: Attack[];
  width?: number;
  height?: number;
}

const AttackMapSimple: React.FC<AttackMapProps> = ({ attacks, width: propWidth, height: propHeight }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  
  // Use window size for auto-stretch, fallback to props if provided
  const windowSize = useWindowSize();
  const width = propWidth || windowSize?.width || 1200;
  const height = propHeight || windowSize?.height || 800;

  // Load world map data
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const data = await response.json();
        setWorldData(data);
      } catch (error) {
        console.error('Error loading world data:', error);
        setWorldData({
          type: "FeatureCollection",
          features: []
        });
      }
    };

    loadWorldData();
  }, []);

  // Setup map
  useEffect(() => {
    if (!svgRef.current || !worldData || width <= 0 || height <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create projection with responsive scale
    const scale = Math.min(width, height) * 0.15;
    const projection = d3.geoNaturalEarth1()
      .scale(scale)
      .translate([width / 2, height / 2]);

    // Create path generator
    const path = d3.geoPath().projection(projection);

    // Draw world map
    svg.append("g")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("fill", "#1a1a2e")
      .attr("stroke", "#2a2a3e")
      .attr("stroke-width", 0.5)
      .style("opacity", 0.8);

    // Draw attack lines and points
    if (attacks.length > 0) {
      const attackGroup = svg.append("g").attr("class", "attacks");

      attacks.forEach((attack) => {
        if (!attack?.src_geo || !attack?.dst_geo || 
            typeof attack.src_geo.lon !== 'number' || typeof attack.src_geo.lat !== 'number' ||
            typeof attack.dst_geo.lon !== 'number' || typeof attack.dst_geo.lat !== 'number') return;

        const source = projection([attack.src_geo.lon, attack.src_geo.lat] as [number, number]);
        const target = projection([attack.dst_geo.lon, attack.dst_geo.lat] as [number, number]);

        if (!source || !target || !Array.isArray(source) || !Array.isArray(target) || 
            source.length < 2 || target.length < 2) return;

        // Create animated attack line
        const line = attackGroup
          .append("line")
          .attr("class", "attack-line")
          .attr("x1", source[0])
          .attr("y1", source[1])
          .attr("x2", source[0])
          .attr("y2", source[1])
          .attr("stroke", "#ff4444")
          .attr("stroke-width", 1)
          .attr("opacity", 0.8)
          .style("filter", "drop-shadow(0 0 3px #ff4444)");

        // Animate line drawing
        line.transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr("x2", target[0])
          .attr("y2", target[1])
          .on("end", () => {
            line.transition()
              .duration(3000)
              .attr("opacity", 0)
              .remove();
          });

        // Create source point
        attackGroup
          .append("circle")
          .attr("class", "attack-point")
          .attr("cx", source[0])
          .attr("cy", source[1])
          .attr("r", 0)
          .attr("fill", "#ff4444")
          .style("filter", "drop-shadow(0 0 5px #ff4444)")
          .transition()
          .duration(500)
          .attr("r", 3)
          .transition()
          .delay(2000)
          .duration(1000)
          .attr("r", 0)
          .remove();

        // Create target point
        attackGroup
          .append("circle")
          .attr("class", "attack-point")
          .attr("cx", target[0])
          .attr("cy", target[1])
          .attr("r", 0)
          .attr("fill", "#ff6666")
          .style("filter", "drop-shadow(0 0 5px #ff6666)")
          .transition()
          .delay(1500)
          .duration(500)
          .attr("r", 2)
          .transition()
          .delay(2000)
          .duration(1000)
          .attr("r", 0)
          .remove();
      });
    }
  }, [worldData, attacks, width, height]);

  return (
    <MapContainer>
      <MapSvg ref={svgRef} width={width} height={height} />
    </MapContainer>
  );
};

export default AttackMapSimple;
