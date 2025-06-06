"use client";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const pieData = [
  { name: "Ward 1", value: 400 },
  { name: "Ward 2", value: 300 },
  { name: "Ward 3", value: 300 },
  { name: "Ward 4", value: 200 },
];

const pieColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const customIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "/leaflet/marker-shadow.png",
  shadowSize: [41, 41],
});

const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200); // delay ensures DOM is ready
  }, [map]);

  return null;
};

const HeatmapSection = () => {
  const [activeTab, setActiveTab] = useState("chart");

  // Heights for each tab content
  const containerHeights = {
    chart: 400,
    map: 400,
  };

  return (
    <div
      className="chart-container w-full rounded-md overflow-hidden border border-gray-300"
      style={{
        height: activeTab === "map" ? "400px" : "400px",
        transition: "height 0.3s ease",
      }}
    >
      <h2 className="text-lg font-semibold mb-4">Inspection Due Heatmap</h2>

      <Tabs
        defaultValue="chart"
        onValueChange={setActiveTab}
        className="h-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        {/* Container for tab content */}
        <div className="relative h-[calc(100%-3rem)] w-full -mt-4">

          {/* 3rem approx height of h2 + margin */}

          {/* Chart content */}
          <TabsContent
            value="chart"
            className="absolute inset-0 flex items-center justify-center bg-white p-4"
          >
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Map content */}
          <TabsContent value="map" className="absolute inset-0">
            <MapContainer
              center={[9.1526, 79.1219]}
              zoom={13}
              scrollWheelZoom={true}
              className="w-full h-full rounded-md"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ResizeMap />
              <Marker position={[9.142, 79.123]}>
                <Popup>Maria Mahal – 5 Trees</Popup>
              </Marker>
              <Marker position={[9.151, 79.128]}>
                <Popup>SPIC Area – 12 Trees</Popup>
              </Marker>
              <Marker position={[9.146, 79.115]}>
                <Popup>Railway Colony – 3 Trees</Popup>
              </Marker>
            </MapContainer>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default HeatmapSection;
