import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import styled from 'styled-components';
import { Attack } from '../types/Attack';
import { useWindowSize } from '../hooks/useWindowSize';

interface GeoJSONFeature {
  type: string;
  properties: any;
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

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

const AttackLine = styled.line<{ opacity: number }>`
  stroke: #ff4444;
  stroke-width: 1;
  opacity: ${props => props.opacity};
  filter: drop-shadow(0 0 3px #ff4444);
`;

const AttackPoint = styled.circle<{ size: number }>`
  fill: #ff4444;
  filter: drop-shadow(0 0 5px #ff4444);
  r: ${props => props.size};
`;

interface AttackMapProps {
  attacks: Attack[];
  width?: number;
  height?: number;
}

const AttackMap: React.FC<AttackMapProps> = ({ attacks, width: propWidth, height: propHeight }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [projection, setProjection] = useState<d3Geo.GeoProjection | null>(null);
  const [path, setPath] = useState<d3.GeoPath<any, any> | null>(null);
  const [worldData, setWorldData] = useState<GeoJSONData | null>(null);
  
  // Use window size for auto-stretch, fallback to props if provided
  const windowSize = useWindowSize();
  const width = propWidth || windowSize?.width || 1200;
  const height = propHeight || windowSize?.height || 800;

  // Load world map data
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const data: GeoJSONData = await response.json();
        setWorldData(data);
      } catch (error) {
        console.error('Error loading world data:', error);
        // Fallback: create a simple world map
        setWorldData({
          type: "FeatureCollection",
          features: []
        } as GeoJSONData);
      }
    };

    loadWorldData();
  }, []);

  // Setup projection and path
  useEffect(() => {
    if (!svgRef.current || width <= 0 || height <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Calculate scale based on window size for better responsiveness
    const scale = Math.min(width, height) * 0.15;
    const proj = d3Geo.geoNaturalEarth1()
      .scale(scale)
      .translate([width / 2, height / 2]);

    const geoPath = d3.geoPath().projection(proj);

    setProjection(proj);
    setPath(geoPath);

    // Draw world map
    if (worldData) {
      svg.append("g")
        .selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", (d: GeoJSONFeature) => geoPath(d as any) || "")
        .attr("fill", "#1a1a2e")
        .attr("stroke", "#2a2a3e")
        .attr("stroke-width", 0.5)
        .style("opacity", 0.8);
    }
  }, [worldData, width, height]);

  // Draw attack lines and points
  useEffect(() => {
    if (!svgRef.current || !projection || !path || attacks.length === 0 || width <= 0 || height <= 0) return;

    const svg = d3.select(svgRef.current);
    
    // Remove existing attack elements
    svg.selectAll(".attack-line").remove();
    svg.selectAll(".attack-point").remove();

    // Create attack lines group
    const attackGroup = svg.append("g").attr("class", "attacks");

    attacks.forEach((attack, index) => {
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
          // Fade out line
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
  }, [attacks, projection, path]);

  return (
    <MapContainer>
      <MapSvg ref={svgRef} width={width} height={height} />
    </MapContainer>
  );
};

export default AttackMap;
