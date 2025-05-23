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
import { Filter, Eye, PanelLeft, ClipboardList, BookCheck, Clock, TriangleAlert, X, MapPin, Users, Calendar, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

// Add inspection details interface
interface InspectionDetails {
  volunteer: string;
  email: string;
  area: string;
  trees: number;
  dueDate: string;
  status: string;
  treesInspected: number;
  completedDate: string;
  treeCondition: string;
  inspectorNotes: string;
  images: string[];
}

export default function InspectionPage() {
  const [selectedInspection, setSelectedInspection] = useState<InspectionDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (inspection: typeof inspections[0]) => {
    // Simulate additional details that would come from API
    const details: InspectionDetails = {
      ...inspection,
      treesInspected: inspection.trees,
      completedDate: "25/04/2024",
      treeCondition: "Healthy",
      inspectorNotes: "All trees growing well. Applied fertilizer as recommended.",
      images: ["/tree-image-1.jpg", "/tree-image-2.jpg"],
    };
    setSelectedInspection(details);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        {/* Add padding above the title */}
        <div className="pt-8">
          <h1 className="text-2xl font-semibold mb-2">Inspection Management</h1>
          <p className="text-sm text-gray-500 mb-6">
            Track and manage tree inspection activities
          </p>
        </div>

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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95%] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="font-medium">Completed</span>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Volunteer</p>
                <p className="font-medium">{selectedInspection?.volunteer}</p>
                <p className="text-sm text-gray-500">{selectedInspection?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-medium">{selectedInspection?.area}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Total Number of Trees</p>
                <p className="font-medium">{selectedInspection?.trees}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">No. of Trees Inspected</p>
                <p className="font-medium">{selectedInspection?.treesInspected}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{selectedInspection?.dueDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Completed Date</p>
                <p className="font-medium">{selectedInspection?.completedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Tree Condition</p>
                <p className="font-medium">{selectedInspection?.treeCondition}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Inspector Notes</p>
              <p className="text-sm">{selectedInspection?.inspectorNotes}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Inspection Images</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedInspection?.images?.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Inspection ${index + 1}`}
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
