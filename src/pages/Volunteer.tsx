"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ListFilter, Search, UserPlus, Ellipsis } from "lucide-react";
import {
  List,
  MapPin,
  PanelLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  Import,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AssignVolunteerDialog from "@/components/volunteerdialog";

interface VolunteerListData {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  treeplanted: string;
  lastactivity: string;
  assignto: string;
}

const sampleVolunteers: VolunteerListData[] = [
  {
    id: "VT001",
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    location: "City Center",
    treeplanted: "15",
    lastactivity: "May 20, 2025",
    assignto: "Org1",
  },
  {
    id: "VT002",
    name: "Jane Smith",
    phone: "1234567890",
    email: "jane@example.com",
    location: "North Zone",
    treeplanted: "8",
    lastactivity: "May 18, 2025",
    assignto: "Org2",
  },
  {
    id: "VT002",
    name: "Jane Smith",
    phone: "1234567890",
    email: "jane@example.com",
    location: "North Zone",
    treeplanted: "8",
    lastactivity: "May 18, 2025",
    assignto: "Org2",
  },
  {
    id: "VT002",
    name: "Jane Smith",
    phone: "1234567890",
    email: "jane@example.com",
    location: "North Zone",
    treeplanted: "8",
    lastactivity: "May 18, 2025",
    assignto: "Org2",
  },
  {
    id: "VT002",
    name: "Jane Smith",
    phone: "1234567890",
    email: "jane@example.com",
    location: "North Zone",
    treeplanted: "8",
    lastactivity: "May 18, 2025",
    assignto: "Org2",
  },
  {
    id: "VT002",
    name: "Jane Smith",
    phone: "1234567890",
    email: "jane@example.com",
    location: "North Zone",
    treeplanted: "8",
    lastactivity: "May 18, 2025",
    assignto: "Org2",
  },
  {
    id: "VT002",
    name: "Jane Smith",
    phone: "1234567890",
    email: "jane@example.com",
    location: "North Zone",
    treeplanted: "8",
    lastactivity: "May 18, 2025",
    assignto: "Org2",
  },
  {
    id: "VT001",
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    location: "City Center",
    treeplanted: "15",
    lastactivity: "May 20, 2025",
    assignto: "Org1",
  },
  {
    id: "VT001",
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    location: "City Center",
    treeplanted: "15",
    lastactivity: "May 20, 2025",
    assignto: "Org1",
  },
  {
    id: "VT001",
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    location: "City Center",
    treeplanted: "15",
    lastactivity: "May 20, 2025",
    assignto: "Org1",
  },
];

const Volunteer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showImportButton, setShowImportButton] = useState(true);
  const [openComplaintDialog, setOpenComplaintDialog] = useState(false);
  const [openVolunteerDialog, setOpenVolunteerDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerListData | null>(null);

  const handleImportClick = () => setOpenComplaintDialog(true);
  const handleNewVolunteerClick = () => setOpenVolunteerDialog(true);
  
  const handleAssignClick = (volunteer: VolunteerListData) => {
    setSelectedVolunteer(volunteer);
    setOpenAssignDialog(true);
  };

  const paginate = (pageNumber: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsLoading(false);
    }, 300);
  };
  const indexOfLastTree = currentPage * itemsPerPage;
  const indexOfFirstTree = indexOfLastTree - itemsPerPage;
  const currentTrees = sampleVolunteers.slice(
    indexOfFirstTree,
    indexOfLastTree
  );

  const totalPages = 20;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Remove the logo and header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Volunteer Management</h1>
          <p className="text-gray-500 text-sm">
            View, add and manage volunteers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showImportButton && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleImportClick}
              >
                <Import size={18} className="mr-1" /> Import Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewVolunteerClick}
                className="bg-white text-[#0e3624] border-[#0e3624] hover:bg-[#0e3624]/10"
              >
                <UserPlus size={18} className="mr-1" /> New Volunteer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Complaint Register Dialog */}
      <Dialog open={openComplaintDialog} onOpenChange={setOpenComplaintDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Register New Complaint</DialogTitle>
            <DialogDescription>
              Enter the details of the new dog complaint.
            </DialogDescription>
          </DialogHeader>

          <form className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4">
            {/* Location */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Location
            </label>
            <Input className="sm:col-span-9" placeholder="Enter location" />
            {/* Ward */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Ward
            </label>
            <Select>
              <SelectTrigger className="sm:col-span-9">
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ward-1">Ward 1</SelectItem>
                <SelectItem value="ward-2">Ward 2</SelectItem>
              </SelectContent>
            </Select>
            {/* Address */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Address
            </label>
            <Input className="sm:col-span-9" placeholder="Full address" />
            {/* Reported By */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Reported By
            </label>
            <Input className="sm:col-span-9" placeholder="Name of reporter" />
            {/* Contact */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Contact
            </label>
            <Input className="sm:col-span-9" placeholder="Phone number" />
            {/* Dog Count */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Dog Count
            </label>
            <Input className="sm:col-span-9" placeholder="1" />
            {/* Description */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Description
            </label>
            <Textarea
              className="sm:col-span-9"
              placeholder="Describe the issue"
            />
            {/* Priority */}
            <label className="sm:col-span-3 text-sm font-medium mt-2">
              Priority
            </label>
            <Select>
              <SelectTrigger className="sm:col-span-9">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            {/* Submit Button */}
            <div className="sm:col-span-3" /> {/* Empty space for alignment */}
            <Button
              type="submit"
              className="sm:col-span-9 text-white hover:opacity-90 transition"
              style={{ backgroundColor: "#0e3624" }}
            >
              Register Complaint
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Volunteer Dialog */}
      <Dialog open={openVolunteerDialog} onOpenChange={setOpenVolunteerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Volunteer</DialogTitle>
            <DialogDescription>
              Fill in the details to register a new volunteer.
            </DialogDescription>
          </DialogHeader>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Salutation & Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Salutation
              </label>
              <Select>
                <SelectTrigger id="salutation">
                  <SelectValue placeholder="Mr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr</SelectItem>
                  <SelectItem value="mrs">Mrs</SelectItem>
                  <SelectItem value="ms">Ms</SelectItem>
                  <SelectItem value="dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input placeholder="Ruban Jagathesh" />
            </div>

            {/* Type & Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Individual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email ID</label>
              <Input type="email" placeholder="ruban@gmail.com" />
            </div>

            {/* Gender & Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <Select>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Male" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <Input placeholder="+91-9876543210" />
            </div>

            {/* Org Name & No of Volunteers */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Organisation Name
              </label>
              <Input placeholder="Enter Organisation Name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                No of Volunteers
              </label>
              <Input type="number" placeholder="Enter No of Volunteers" />
            </div>

            {/* Aadhaar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Aadhar Card Number
              </label>
              <Input placeholder="XXXX-XXXX-XXXX" />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <Textarea placeholder="Full address with pincode" rows={3} />
            </div>

            {/* Upload Documents */}
            <div className="md:col-span-2">
              <p className="text-sm font-semibold mb-2 text-[#0e3624]">
                Upload Documents
              </p>
              <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
                <p className="text-sm text-gray-500">
                  Drag & drop or click to upload Aadhar card
                </p>
                <Input id="file" type="file" className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  Choose file
                </Button>
                <p className="text-xs text-gray-400 mt-1">No file chosen</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenVolunteerDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0e3624] hover:bg-[#0e3624]/90 text-white"
              >
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Volunteer Dialog */}
      <AssignVolunteerDialog
        open={openAssignDialog}
        onOpenChange={setOpenAssignDialog}
        volunteerId={selectedVolunteer?.id}
        volunteerName={selectedVolunteer?.name}
      />

      {/* Volunteer Table */}
      <div className="bg-white rounded-md shadow mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Volunteers</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Organisation <ListFilter className="ml-1 w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              Individual <ListFilter className="ml-1 w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              Location <ListFilter className="ml-1 w-4 h-4" />
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-8 text-sm" />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Trees Planted</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTrees.map((volunteer) => (
              <TableRow key={volunteer.id}>
                <TableCell className="font-medium">{volunteer.id}</TableCell>
                <TableCell>{volunteer.name}</TableCell>
                <TableCell>{volunteer.phone}</TableCell>
                <TableCell>{volunteer.email}</TableCell>
                <TableCell>{volunteer.location}</TableCell>
                <TableCell>{volunteer.treeplanted}</TableCell>
                <TableCell>{volunteer.lastactivity}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-20 px-2 py-1 text-xs border-[#0e3624] text-[#0e3624] hover:bg-[#0e3624]/10"
                    onClick={() => handleAssignClick(volunteer)}
                  >
                    Assigned To
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded focus:outline-none"
                  >
                    <Ellipsis className="w-4 h-4 text-gray-600" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  disabled={isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                    currentPage === number
                      ? "bg-gray-900 text-white"
                      : "border hover:bg-gray-100"
                  }`}
                >
                  {number}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
