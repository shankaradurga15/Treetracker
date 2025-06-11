"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Filter,
  Eye,
  ClipboardList,
  BookCheck,
  Clock,
  TriangleAlert,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  Search,
  X,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getInspections, updateInspection, deleteInspection, type Inspection } from "@/lib/supabaseClient"
import { Loader2 } from "lucide-react"

const statusColor = {
  Pending: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
}

export default function InspectionManagement() {
  const { toast } = useToast()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter states
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string[]>([])
  const [showAreaFilter, setShowAreaFilter] = useState(false)
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string[]>([])
  const [showVolunteerFilter, setShowVolunteerFilter] = useState(false)
  const [selectedVolunteerFilter, setSelectedVolunteerFilter] = useState<string[]>([])
  const statusFilterRef = useRef<HTMLDivElement>(null)
  const areaFilterRef = useRef<HTMLDivElement>(null)
  const volunteerFilterRef = useRef<HTMLDivElement>(null)

  // Calculate summary statistics
  const totalInspections = filteredInspections.length
  const completedInspections = filteredInspections.filter((i) => i.status === "Completed").length
  const inProgressInspections = filteredInspections.filter((i) => i.status === "In Progress").length
  const overdueInspections = filteredInspections.filter((i) => i.status === "Overdue").length

  // Get unique values for filters
  const getUniqueAreas = () => {
    return [...new Set(inspections.map((i) => i.area).filter(Boolean))]
  }

  const getUniqueVolunteers = () => {
    return [...new Set(inspections.map((i) => i.volunteer?.name).filter(Boolean))]
  }

  const getUniqueStatuses = () => {
    return [...new Set(inspections.map((i) => i.status).filter(Boolean))]
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = inspections

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (inspection) =>
          inspection.volunteer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.inspection_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.volunteer?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (selectedStatusFilter.length > 0) {
      filtered = filtered.filter((inspection) => selectedStatusFilter.includes(inspection.status))
    }

    // Apply area filter
    if (selectedAreaFilter.length > 0) {
      filtered = filtered.filter((inspection) => selectedAreaFilter.includes(inspection.area))
    }

    // Apply volunteer filter
    if (selectedVolunteerFilter.length > 0) {
      filtered = filtered.filter(
        (inspection) => inspection.volunteer?.name && selectedVolunteerFilter.includes(inspection.volunteer.name),
      )
    }

    setFilteredInspections(filtered)
  }

  // Fetch inspections
  const fetchInspections = async () => {
    setIsLoading(true)
    try {
      const result = await getInspections()
      if (result.success && result.data) {
        // Update overdue status based on due date
        const updatedInspections = result.data.map((inspection) => {
          const dueDate = new Date(inspection.due_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (inspection.status === "Pending" && dueDate < today) {
            return { ...inspection, status: "Overdue" as const }
          }
          return inspection
        })

        setInspections(updatedInspections)
        setFilteredInspections(updatedInspections)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch inspections",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching inspections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inspections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInspections()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedStatusFilter, selectedAreaFilter, selectedVolunteerFilter, inspections])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) {
        setShowStatusFilter(false)
      }
      if (areaFilterRef.current && !areaFilterRef.current.contains(event.target as Node)) {
        setShowAreaFilter(false)
      }
      if (volunteerFilterRef.current && !volunteerFilterRef.current.contains(event.target as Node)) {
        setShowVolunteerFilter(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleViewDetails = (inspection: Inspection) => {
    setSelectedInspection(inspection)
    setIsDialogOpen(true)
  }

  const handleAcceptInspection = async (inspection: Inspection) => {
    if (inspection.status !== "Completed") {
      toast({
        title: "Cannot Accept",
        description: "Only completed inspections can be accepted",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await updateInspection(inspection.id, {
        // You can add an "accepted" field to track this
        // For now, we'll just show a success message
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Inspection accepted successfully",
        })
        setIsDialogOpen(false)
        fetchInspections()
      } else {
        toast({
          title: "Error",
          description: "Failed to accept inspection",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error accepting inspection:", error)
      toast({
        title: "Error",
        description: "Failed to accept inspection",
        variant: "destructive",
      })
    }
  }

  const handleDeleteInspection = async (inspection: Inspection) => {
    if (confirm(`Are you sure you want to delete this inspection for ${inspection.area}?`)) {
      try {
        const result = await deleteInspection(inspection.id)
        if (result.success) {
          toast({
            title: "Success",
            description: "Inspection deleted successfully",
          })
          fetchInspections()
        } else {
          toast({
            title: "Error",
            description: "Failed to delete inspection",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting inspection:", error)
        toast({
          title: "Error",
          description: "Failed to delete inspection",
          variant: "destructive",
        })
      }
    }
  }

  // Filter handlers
  const handleStatusFilterToggle = (status: string) => {
    setSelectedStatusFilter((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  const handleAreaFilterToggle = (area: string) => {
    setSelectedAreaFilter((prev) => {
      if (prev.includes(area)) {
        return prev.filter((a) => a !== area)
      } else {
        return [...prev, area]
      }
    })
  }

  const handleVolunteerFilterToggle = (volunteer: string) => {
    setSelectedVolunteerFilter((prev) => {
      if (prev.includes(volunteer)) {
        return prev.filter((v) => v !== volunteer)
      } else {
        return [...prev, volunteer]
      }
    })
  }

  const clearStatusFilter = () => {
    setSelectedStatusFilter([])
    setShowStatusFilter(false)
  }

  const clearAreaFilter = () => {
    setSelectedAreaFilter([])
    setShowAreaFilter(false)
  }

  const clearVolunteerFilter = () => {
    setSelectedVolunteerFilter([])
    setShowVolunteerFilter(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB")
  }

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="pt-8">
          <h1 className="text-2xl font-semibold mb-2">Inspection Management</h1>
          <p className="text-sm text-gray-500 mb-6">Track and manage tree inspection activities</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 mb-1">Total Inspections</h2>
              <p className="text-2xl font-bold">{totalInspections}</p>
              <p className="text-xs text-gray-400">All time</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 mb-1">Completed</h2>
              <p className="text-2xl font-bold">{completedInspections}</p>
              <p className="text-xs text-gray-400">Current month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BookCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 mb-1">In Progress</h2>
              <p className="text-2xl font-bold">{inProgressInspections}</p>
              <p className="text-xs text-gray-400">Current month</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-500 mb-1">Over Due</h2>
              <p className="text-2xl font-bold">{overdueInspections}</p>
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
            <div className="flex gap-2 items-center">
              {/* Status Filter */}
              <div className="relative" ref={statusFilterRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className={selectedStatusFilter.length > 0 ? "bg-green-100 border-green-300 text-green-800" : ""}
                >
                  Status
                  {selectedStatusFilter.length > 0 && (
                    <span className="ml-1 bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                      {selectedStatusFilter.length}
                    </span>
                  )}
                  <Filter className="ml-1 w-4 h-4" />
                </Button>

                {showStatusFilter && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {getUniqueStatuses().map((status) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{status}</span>
                            <input
                              type="checkbox"
                              checked={selectedStatusFilter.includes(status)}
                              onChange={() => handleStatusFilterToggle(status)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={clearStatusFilter}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-2 rounded-md transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Area Filter */}
              <div className="relative" ref={areaFilterRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAreaFilter(!showAreaFilter)}
                  className={selectedAreaFilter.length > 0 ? "bg-green-100 border-green-300 text-green-800" : ""}
                >
                  Area
                  {selectedAreaFilter.length > 0 && (
                    <span className="ml-1 bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                      {selectedAreaFilter.length}
                    </span>
                  )}
                  <Filter className="ml-1 w-4 h-4" />
                </Button>

                {showAreaFilter && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {getUniqueAreas().map((area) => (
                          <div key={area} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{area}</span>
                            <input
                              type="checkbox"
                              checked={selectedAreaFilter.includes(area)}
                              onChange={() => handleAreaFilterToggle(area)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={clearAreaFilter}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-2 rounded-md transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Volunteer Filter */}
              <div className="relative" ref={volunteerFilterRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVolunteerFilter(!showVolunteerFilter)}
                  className={selectedVolunteerFilter.length > 0 ? "bg-green-100 border-green-300 text-green-800" : ""}
                >
                  Volunteer
                  {selectedVolunteerFilter.length > 0 && (
                    <span className="ml-1 bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                      {selectedVolunteerFilter.length}
                    </span>
                  )}
                  <Filter className="ml-1 w-4 h-4" />
                </Button>

                {showVolunteerFilter && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {getUniqueVolunteers().map((volunteer) => (
                          <div key={volunteer} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{volunteer}</span>
                            <input
                              type="checkbox"
                              checked={selectedVolunteerFilter.includes(volunteer)}
                              onChange={() => handleVolunteerFilterToggle(volunteer)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={clearVolunteerFilter}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-2 rounded-md transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search inspections..."
                  className="pl-8 text-sm w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-green-700 animate-spin mr-2" />
                        <span>Loading inspections...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInspections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchQuery ||
                      selectedStatusFilter.length > 0 ||
                      selectedAreaFilter.length > 0 ||
                      selectedVolunteerFilter.length > 0
                        ? "No inspections found matching your filters."
                        : "No inspections found. Assign some inspections to volunteers to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell>
                        <div className="font-medium">{inspection.volunteer?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{inspection.volunteer?.email || "N/A"}</div>
                      </TableCell>
                      <TableCell>{inspection.area}</TableCell>
                      <TableCell>{inspection.trees_count}</TableCell>
                      <TableCell>{formatDate(inspection.due_date)}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[inspection.status as keyof typeof statusColor]}>
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(inspection)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {inspection.status === "Completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAcceptInspection(inspection)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Inspection Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95%] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  selectedInspection?.status === "Completed"
                    ? "bg-green-500"
                    : selectedInspection?.status === "In Progress"
                      ? "bg-blue-500"
                      : selectedInspection?.status === "Overdue"
                        ? "bg-red-500"
                        : "bg-gray-500"
                }`}
              ></div>
              <span className="font-medium">{selectedInspection?.status || "Pending"}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedInspection && handleDeleteInspection(selectedInspection)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Volunteer</p>
                <p className="font-medium">{selectedInspection?.volunteer?.name || "Unknown"}</p>
                <p className="text-sm text-gray-500">{selectedInspection?.volunteer?.email || "N/A"}</p>
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
                <p className="font-medium">{selectedInspection?.trees_count}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">No. of Trees Inspected</p>
                <p className="font-medium">{selectedInspection?.trees_inspected || "Pending from mobile app"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">
                  {selectedInspection?.due_date ? formatDate(selectedInspection.due_date) : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Completed Date</p>
                <p className="font-medium">
                  {selectedInspection?.completed_date
                    ? formatDate(selectedInspection.completed_date)
                    : "Pending from mobile app"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Tree Condition</p>
                <p className="font-medium">{selectedInspection?.tree_condition || "Pending from mobile app"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Inspector Notes</p>
              <p className="text-sm">{selectedInspection?.inspector_notes || "Pending from mobile app"}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Inspection Images</p>
              {selectedInspection?.inspection_images && selectedInspection.inspection_images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedInspection.inspection_images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Inspection ${index + 1}`}
                      className="rounded-lg w-full h-32 object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Images will be uploaded from mobile app</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
            {selectedInspection?.status === "Completed" && (
              <Button
                onClick={() => selectedInspection && handleAcceptInspection(selectedInspection)}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
