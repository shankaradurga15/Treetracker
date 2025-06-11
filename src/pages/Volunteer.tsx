"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ListFilter, Search, UserPlus, Loader2, Eye, Edit, Trash, X, Upload, FileText } from "lucide-react"
import { ChevronLeft, ChevronRight, Import } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  type Volunteer,
  type CreateVolunteerData,
} from "@/lib/supabaseClient"
import AssignVolunteerDialog from "@/pages/AssignVolunteer"

const VolunteerManagement = () => {
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState<number>(10)
  const [isLoading, setIsLoading] = useState(false)
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter states
  const [showTypeFilter, setShowTypeFilter] = useState(false)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string[]>([])
  const [showLocationFilter, setShowLocationFilter] = useState(false)
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string[]>([])
  const typeFilterRef = useRef<HTMLDivElement>(null)
  const locationFilterRef = useRef<HTMLDivElement>(null)

  // Dialog states
  const [openComplaintDialog, setOpenComplaintDialog] = useState(false)
  const [openVolunteerDialog, setOpenVolunteerDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openAssignDialog, setOpenAssignDialog] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileEdit, setUploadedFileEdit] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputEditRef = useRef<HTMLInputElement>(null)

  // Form states
  const [formData, setFormData] = useState<CreateVolunteerData>({
    salutation: "Mr",
    name: "",
    type: "individual",
    email: "",
    gender: "male",
    phone: "",
    organization_name: "",
    no_of_volunteers: undefined,
    aadhaar_number: "",
    address: "",
  })

  // Edit form states
  const [editFormData, setEditFormData] = useState<CreateVolunteerData>({
    salutation: "Mr",
    name: "",
    type: "individual",
    email: "",
    gender: "male",
    phone: "",
    organization_name: "",
    no_of_volunteers: undefined,
    aadhaar_number: "",
    address: "",
  })

  // Get unique locations for filter
  const getUniqueLocations = () => {
    const locations = volunteers
      .map((v) => v.address)
      .filter(Boolean)
      .map((address) => {
        // Extract city/area from address (assuming format like "Area, City")
        const parts = address!.split(",")
        return parts[parts.length - 1].trim()
      })
    return [...new Set(locations)]
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = volunteers

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (volunteer) =>
          volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          volunteer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          volunteer.phone.includes(searchQuery) ||
          volunteer.volunteer_id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply type filter
    if (selectedTypeFilter.length > 0) {
      filtered = filtered.filter((volunteer) => selectedTypeFilter.includes(volunteer.type))
    }

    // Apply location filter
    if (selectedLocationFilter.length > 0) {
      filtered = filtered.filter((volunteer) => {
        if (!volunteer.address) return false
        const location = volunteer.address.split(",").pop()?.trim()
        return location && selectedLocationFilter.includes(location)
      })
    }

    setFilteredVolunteers(filtered)
    setTotalCount(filtered.length)
    setCurrentPage(1)
  }

  // Fetch volunteers
  const fetchVolunteers = async () => {
    setIsLoading(true)
    try {
      const result = await getVolunteers()
      if (result.success && result.data) {
        setVolunteers(result.data)
        setFilteredVolunteers(result.data)
        setTotalCount(result.data.length)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch volunteers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch volunteers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVolunteers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedTypeFilter, selectedLocationFilter, volunteers])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
        setShowTypeFilter(false)
      }
      if (locationFilterRef.current && !locationFilterRef.current.contains(event.target as Node)) {
        setShowLocationFilter(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleImportClick = () => setOpenComplaintDialog(true)
  const handleNewVolunteerClick = () => setOpenVolunteerDialog(true)

  const handleAssignClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer)
    setOpenAssignDialog(true)
  }

  const handleViewClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer)
    setOpenViewDialog(true)
  }

  const handleEditClick = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer)
    setEditFormData({
      salutation: volunteer.salutation || "Mr",
      name: volunteer.name,
      type: volunteer.type,
      email: volunteer.email,
      gender: volunteer.gender || "male",
      phone: volunteer.phone,
      organization_name: volunteer.organization_name || "",
      no_of_volunteers: volunteer.no_of_volunteers,
      aadhaar_number: volunteer.aadhaar_number || "",
      address: volunteer.address || "",
    })
    setUploadedFileEdit(null)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = async (volunteer: Volunteer) => {
    if (confirm(`Are you sure you want to delete ${volunteer.name}?`)) {
      setIsLoading(true)
      try {
        const result = await deleteVolunteer(volunteer.id)
        if (result.success) {
          toast({
            title: "Success",
            description: "Volunteer deleted successfully",
          })
          fetchVolunteers()
        } else {
          toast({
            title: "Error",
            description: "Failed to delete volunteer",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting volunteer:", error)
        toast({
          title: "Error",
          description: "Failed to delete volunteer",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFormChange = (field: keyof CreateVolunteerData, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditFormChange = (field: keyof CreateVolunteerData, value: string | number | undefined) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload only JPEG, PNG, or PDF files",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setUploadedFile(file)
      toast({
        title: "File Selected",
        description: `${file.name} selected successfully`,
      })
    }
  }

  const handleFileUploadEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload only JPEG, PNG, or PDF files",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setUploadedFileEdit(file)
      toast({
        title: "File Selected",
        description: `${file.name} selected successfully`,
      })
    }
  }

  const handleSubmitVolunteer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Prepare data for submission
      const submitData: CreateVolunteerData = {
        ...formData,
        organization_name: formData.type === "individual" ? undefined : formData.organization_name,
        no_of_volunteers: formData.type === "individual" ? undefined : formData.no_of_volunteers,
        document_url: uploadedFile ? `documents/${uploadedFile.name}` : undefined,
      }

      const result = await createVolunteer(submitData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Volunteer created successfully!",
        })

        // Reset form
        setFormData({
          salutation: "Mr",
          name: "",
          type: "individual",
          email: "",
          gender: "male",
          phone: "",
          organization_name: "",
          no_of_volunteers: undefined,
          aadhaar_number: "",
          address: "",
        })
        setUploadedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        setOpenVolunteerDialog(false)
        fetchVolunteers()
      } else {
        toast({
          title: "Error",
          description: "Failed to create volunteer. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating volunteer:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVolunteer) return

    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!editFormData.name || !editFormData.email || !editFormData.phone) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Prepare data for submission
      const submitData: Partial<CreateVolunteerData> = {
        ...editFormData,
        organization_name: editFormData.type === "individual" ? undefined : editFormData.organization_name,
        no_of_volunteers: editFormData.type === "individual" ? undefined : editFormData.no_of_volunteers,
        document_url: uploadedFileEdit ? `documents/${uploadedFileEdit.name}` : editingVolunteer.document_url,
      }

      const result = await updateVolunteer(editingVolunteer.id, submitData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Volunteer updated successfully!",
        })

        setUploadedFileEdit(null)
        if (fileInputEditRef.current) {
          fileInputEditRef.current.value = ""
        }

        setOpenEditDialog(false)
        setEditingVolunteer(null)
        fetchVolunteers()
      } else {
        toast({
          title: "Error",
          description: "Failed to update volunteer. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating volunteer:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter handlers
  const handleTypeFilterToggle = (type: string) => {
    setSelectedTypeFilter((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  const handleLocationFilterToggle = (location: string) => {
    setSelectedLocationFilter((prev) => {
      if (prev.includes(location)) {
        return prev.filter((l) => l !== location)
      } else {
        return [...prev, location]
      }
    })
  }

  const clearTypeFilter = () => {
    setSelectedTypeFilter([])
    setShowTypeFilter(false)
  }

  const clearLocationFilter = () => {
    setSelectedLocationFilter([])
    setShowLocationFilter(false)
  }

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const indexOfLastVolunteer = currentPage * itemsPerPage
  const indexOfFirstVolunteer = indexOfLastVolunteer - itemsPerPage
  const currentVolunteers = filteredVolunteers.slice(indexOfFirstVolunteer, indexOfLastVolunteer)
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Volunteer Management</h1>
          <p className="text-gray-500 text-sm">View, add and manage volunteers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleImportClick}>
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
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog open={openComplaintDialog} onOpenChange={setOpenComplaintDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Volunteers from Excel</DialogTitle>
            <DialogDescription>Upload an Excel file to import multiple volunteers at once.</DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">Feature coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Volunteer Dialog */}
      <Dialog open={openVolunteerDialog} onOpenChange={setOpenVolunteerDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Volunteer</DialogTitle>
            <DialogDescription>Fill in the details to register a new volunteer.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitVolunteer} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Salutation & Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Salutation</label>
              <Select value={formData.salutation} onValueChange={(value) => handleFormChange("salutation", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Mr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </div>

            {/* Type & Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: "individual" | "organization") => handleFormChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Individual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email ID *</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                required
              />
            </div>

            {/* Gender & Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <Select value={formData.gender} onValueChange={(value) => handleFormChange("gender", value)}>
                <SelectTrigger>
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
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <Input
                placeholder="+91-9876543210"
                value={formData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                required
              />
            </div>

            {/* Org Name & No of Volunteers */}
            <div>
              <label className="block text-sm font-medium mb-1">Organisation Name</label>
              <Input
                placeholder="Enter Organisation Name"
                disabled={formData.type === "individual"}
                className={formData.type === "individual" ? "bg-gray-100 text-gray-500" : ""}
                value={formData.organization_name || ""}
                onChange={(e) => handleFormChange("organization_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No of Volunteers</label>
              <Input
                type="number"
                placeholder="Enter No of Volunteers"
                disabled={formData.type === "individual"}
                className={formData.type === "individual" ? "bg-gray-100 text-gray-500" : ""}
                value={formData.no_of_volunteers || ""}
                onChange={(e) => handleFormChange("no_of_volunteers", Number.parseInt(e.target.value) || undefined)}
              />
            </div>

            {/* Aadhaar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Aadhar Card Number</label>
              <Input
                placeholder="XXXX-XXXX-XXXX"
                value={formData.aadhaar_number || ""}
                onChange={(e) => handleFormChange("aadhaar_number", e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <Textarea
                placeholder="Full address with pincode"
                rows={3}
                value={formData.address || ""}
                onChange={(e) => handleFormChange("address", e.target.value)}
              />
            </div>

            {/* Upload Documents */}
            <div className="md:col-span-2">
              <p className="text-sm font-semibold mb-2 text-[#0e3624]">Upload Documents</p>
              <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Drag & drop or click to upload Aadhar card</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Choose file
                  </Button>
                  {uploadedFile ? (
                    <div className="mt-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">No file chosen</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpenVolunteerDialog(false)
                  setUploadedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0e3624] hover:bg-[#0e3624]/90 text-white" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Volunteer Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Volunteer Details</DialogTitle>
            <DialogDescription>View volunteer information</DialogDescription>
          </DialogHeader>

          {selectedVolunteer && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Volunteer ID</p>
                <p className="text-lg font-bold text-blue-900">{selectedVolunteer.volunteer_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salutation</label>
                  <p className="text-sm">{selectedVolunteer.salutation || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm font-medium">{selectedVolunteer.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm capitalize">{selectedVolunteer.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm">{selectedVolunteer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-sm capitalize">{selectedVolunteer.gender || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm">{selectedVolunteer.phone}</p>
                </div>
              </div>

              {selectedVolunteer.type === "organization" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <p className="text-sm">{selectedVolunteer.organization_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No of Volunteers</label>
                    <p className="text-sm">{selectedVolunteer.no_of_volunteers || "N/A"}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                <p className="text-sm">{selectedVolunteer.aadhaar_number || "N/A"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-sm">{selectedVolunteer.address || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trees Planted</label>
                  <p className="text-sm font-bold text-green-600">{selectedVolunteer.trees_planted || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Activity</label>
                  <p className="text-sm">
                    {selectedVolunteer.last_activity
                      ? new Date(selectedVolunteer.last_activity).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {selectedVolunteer.document_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Document uploaded</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setOpenViewDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setOpenViewDialog(false)
                if (selectedVolunteer) handleEditClick(selectedVolunteer)
              }}
              className="bg-[#0e3624] hover:bg-[#0e3624]/90 text-white"
            >
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Volunteer Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Volunteer</DialogTitle>
            <DialogDescription>Update volunteer information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateVolunteer} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Salutation & Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Salutation</label>
              <Select
                value={editFormData.salutation}
                onValueChange={(value) => handleEditFormChange("salutation", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                placeholder="Enter full name"
                value={editFormData.name}
                onChange={(e) => handleEditFormChange("name", e.target.value)}
                required
              />
            </div>

            {/* Type & Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={editFormData.type}
                onValueChange={(value: "individual" | "organization") => handleEditFormChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Individual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email ID *</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={editFormData.email}
                onChange={(e) => handleEditFormChange("email", e.target.value)}
                required
              />
            </div>

            {/* Gender & Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <Select value={editFormData.gender} onValueChange={(value) => handleEditFormChange("gender", value)}>
                <SelectTrigger>
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
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <Input
                placeholder="+91-9876543210"
                value={editFormData.phone}
                onChange={(e) => handleEditFormChange("phone", e.target.value)}
                required
              />
            </div>

            {/* Org Name & No of Volunteers */}
            <div>
              <label className="block text-sm font-medium mb-1">Organisation Name</label>
              <Input
                placeholder="Enter Organisation Name"
                disabled={editFormData.type === "individual"}
                className={editFormData.type === "individual" ? "bg-gray-100 text-gray-500" : ""}
                value={editFormData.organization_name || ""}
                onChange={(e) => handleEditFormChange("organization_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No of Volunteers</label>
              <Input
                type="number"
                placeholder="Enter No of Volunteers"
                disabled={editFormData.type === "individual"}
                className={editFormData.type === "individual" ? "bg-gray-100 text-gray-500" : ""}
                value={editFormData.no_of_volunteers || ""}
                onChange={(e) => handleEditFormChange("no_of_volunteers", Number.parseInt(e.target.value) || undefined)}
              />
            </div>

            {/* Aadhaar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Aadhar Card Number</label>
              <Input
                placeholder="XXXX-XXXX-XXXX"
                value={editFormData.aadhaar_number || ""}
                onChange={(e) => handleEditFormChange("aadhaar_number", e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <Textarea
                placeholder="Full address with pincode"
                rows={3}
                value={editFormData.address || ""}
                onChange={(e) => handleEditFormChange("address", e.target.value)}
              />
            </div>

            {/* Upload Documents */}
            <div className="md:col-span-2">
              <p className="text-sm font-semibold mb-2 text-[#0e3624]">Upload Documents</p>
              <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Drag & drop or click to upload Aadhar card</p>
                  <input
                    ref={fileInputEditRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUploadEdit}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputEditRef.current?.click()}>
                    Choose file
                  </Button>
                  {uploadedFileEdit ? (
                    <div className="mt-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">{uploadedFileEdit.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileEdit(null)
                          if (fileInputEditRef.current) fileInputEditRef.current.value = ""
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : editingVolunteer?.document_url ? (
                    <div className="mt-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Current document uploaded</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">No file chosen</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpenEditDialog(false)
                  setEditingVolunteer(null)
                  setUploadedFileEdit(null)
                  if (fileInputEditRef.current) fileInputEditRef.current.value = ""
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0e3624] hover:bg-[#0e3624]/90 text-white" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Volunteer Dialog */}
      <AssignVolunteerDialog
        open={openAssignDialog}
        onOpenChange={setOpenAssignDialog}
        volunteer={selectedVolunteer}
        onAssignmentCreated={fetchVolunteers}
      />

      {/* Volunteer Table */}
      <div className="bg-white rounded-md shadow mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Volunteers ({totalCount})</h2>
          <div className="flex gap-2">
            {/* Organization Filter */}
            <div className="relative" ref={typeFilterRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className={
                  selectedTypeFilter.includes("organization") ? "bg-green-100 border-green-300 text-green-800" : ""
                }
              >
                Organisation
                {selectedTypeFilter.includes("organization") && (
                  <span className="ml-1 bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full">✓</span>
                )}
                <ListFilter className="ml-1 w-4 h-4" />
              </Button>

              {showTypeFilter && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Organization</span>
                        <input
                          type="checkbox"
                          checked={selectedTypeFilter.includes("organization")}
                          onChange={() => handleTypeFilterToggle("organization")}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Individual</span>
                        <input
                          type="checkbox"
                          checked={selectedTypeFilter.includes("individual")}
                          onChange={() => handleTypeFilterToggle("individual")}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={clearTypeFilter}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-2 rounded-md transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Individual Filter (same as organization but for individual) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTypeFilterToggle("individual")}
              className={
                selectedTypeFilter.includes("individual") ? "bg-green-100 border-green-300 text-green-800" : ""
              }
            >
              Individual
              {selectedTypeFilter.includes("individual") && (
                <span className="ml-1 bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full">✓</span>
              )}
              <ListFilter className="ml-1 w-4 h-4" />
            </Button>

            {/* Location Filter */}
            <div className="relative" ref={locationFilterRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationFilter(!showLocationFilter)}
                className={selectedLocationFilter.length > 0 ? "bg-green-100 border-green-300 text-green-800" : ""}
              >
                Location
                {selectedLocationFilter.length > 0 && (
                  <span className="ml-1 bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                    {selectedLocationFilter.length}
                  </span>
                )}
                <ListFilter className="ml-1 w-4 h-4" />
              </Button>

              {showLocationFilter && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getUniqueLocations().length > 0 ? (
                        getUniqueLocations().map((location) => (
                          <div key={location} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{location}</span>
                            <input
                              type="checkbox"
                              checked={selectedLocationFilter.includes(location)}
                              onChange={() => handleLocationFilterToggle(location)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-2">No locations found</div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={clearLocationFilter}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1 px-2 rounded-md transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-8 text-sm" value={searchQuery} onChange={handleSearch} />
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-green-700 animate-spin mr-2" />
                    <span>Loading volunteers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentVolunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  {searchQuery || selectedTypeFilter.length > 0 || selectedLocationFilter.length > 0
                    ? "No volunteers found matching your filters."
                    : "No volunteers found. Add some volunteers to get started."}
                </TableCell>
              </TableRow>
            ) : (
              currentVolunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.volunteer_id}</TableCell>
                  <TableCell>{volunteer.name}</TableCell>
                  <TableCell>{volunteer.phone}</TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>{volunteer.address ? volunteer.address.split(",").pop()?.trim() : "N/A"}</TableCell>
                  <TableCell>{volunteer.trees_planted || 0}</TableCell>
                  <TableCell>
                    {volunteer.last_activity ? new Date(volunteer.last_activity).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-20 px-2 py-1 text-xs border-[#0e3624] text-[#0e3624] hover:bg-[#0e3624]/10"
                      onClick={() => handleAssignClick(volunteer)}
                    >
                      Assign
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleViewClick(volunteer)}
                        className="p-1.5 bg-gray-100 hover:bg-green-100 rounded text-gray-600 hover:text-green-700 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(volunteer)}
                        className="p-1.5 bg-gray-100 hover:bg-blue-100 rounded text-gray-600 hover:text-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(volunteer)}
                        className="p-1.5 bg-gray-100 hover:bg-red-100 rounded text-gray-600 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                disabled={isLoading}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                  currentPage === number ? "bg-gray-900 text-white" : "border hover:bg-gray-100"
                }`}
              >
                {number}
              </button>
            ))}
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
  )
}

export default VolunteerManagement
