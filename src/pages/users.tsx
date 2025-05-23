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
import { Search, Filter, PanelLeft, Users, Mail, UserCheck, UserX, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

const users = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    id: "987654201",
    gender: "Male",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    id: "987654202",
    gender: "Female",
  },
  {
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    id: "987654203",
    gender: "Male",
  },
  {
    name: "Sneha Gupta",
    email: "sneha.gupta@example.com",
    id: "987654204",
    gender: "Female",
  },
];

export default function UsersPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Add padding above the title */}
      <div className="pt-8">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-gray-600">View and manage registered users</p>
        </div>
      
      {/* Users Directory Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Users Directory</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-8 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </TableCell>
                  <TableCell>
                    <div>{user.email}</div>
                    <div className="text-sm text-gray-500">{user.id}</div>
                  </TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
    </div>
  );
}