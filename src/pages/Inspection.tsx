"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Filter, Eye, PanelLeft, ClipboardList,BookCheck,Clock,TriangleAlert } from "lucide-react";

const inspections = [
  {
    volunteer: "Rahul Kumar",
    email: "rahul.kumar@example.com",
    area: "Central Park",
    trees: 10,
    dueDate: "30/04/2024",
    status: "Completed",
  },
  {
    volunteer: "Anita Singh",
    email: "anita.singh@example.com",
    area: "Beach Road",
    trees: 15,
    dueDate: "05/05/2024",
    status: "In Progress",
  },
  {
    volunteer: "Kumar Swamy",
    email: "kumar.swamy@example.com",
    area: "School Campus",
    trees: 8,
    dueDate: "20/04/2024",
    status: "Overdue",
  },
  {
    volunteer: "Priya Mehta",
    email: "priya.mehta@example.com",
    area: "Hospital Garden",
    trees: 12,
    dueDate: "28/04/2024",
    status: "In Progress",
  },
];

const statusColor = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function InspectionPage() {
  return (
    <div className="pl-64 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <PanelLeft className="w-4 h-4" />
          Volunteers
        </h1>
        <div className="flex flex-col items-end gap-2 -mt-6">
          <img
            src="/logo-placeholder.png"
            alt="Logo"
            className="w-9 h-9 object-contain"
          />
        </div>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Inspection Management</h1>
      <p className="text-sm text-gray-500 mb-6">
        Track and manage tree inspection activities
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-500 mb-1">Total Inspections</h2>
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-gray-400">All time</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-500 mb-1">Completed</h2>
            <p className="text-2xl font-bold">1</p>
            <p className="text-xs text-gray-400">Current month</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <BookCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-500 mb-1">In Progress</h2>
            <p className="text-2xl font-bold">2</p>
            <p className="text-xs text-gray-400">Current month</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
       <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-500 mb-1">Over Due</h2>
            <p className="text-2xl font-bold">1</p>
            <p className="text-xs text-gray-400">Need Attention</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <TriangleAlert className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Inspection Schedule</h2>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Trees</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="font-medium">{item.volunteer}</div>
                    <div className="text-sm text-gray-500">{item.email}</div>
                  </TableCell>
                  <TableCell>{item.area}</TableCell>
                  <TableCell>{item.trees}</TableCell>
                  <TableCell>{item.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColor[item.status as keyof typeof statusColor]
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
