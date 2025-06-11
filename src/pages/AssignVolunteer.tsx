"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { createInspection, type Volunteer, type CreateInspectionData, supabase } from "@/lib/supabaseClient"
import { Loader2, Calendar, MapPin, TreePine } from "lucide-react"

interface AssignVolunteerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  volunteer: Volunteer | null
  onAssignmentCreated?: () => void
}

interface TreeOption {
  tree_name: string
  species: string
}

const AssignVolunteerDialog = ({ open, onOpenChange, volunteer, onAssignmentCreated }: AssignVolunteerDialogProps) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTrees, setIsLoadingTrees] = useState(false)
  const [treeOptions, setTreeOptions] = useState<TreeOption[]>([])
  const [selectedTrees, setSelectedTrees] = useState<string[]>([])
  const [showTreeSelection, setShowTreeSelection] = useState(false)

  const [formData, setFormData] = useState({
    scheme_name: "",
    description: "",
    location: "",
    tree_species: [] as string[],
    number_of_trees: "",
    inspection_cycle: "Every Week",
    start_date: "",
    end_date: "",
  })

  // Fetch tree options from Master data
  useEffect(() => {
    const fetchTreeOptions = async () => {
      setIsLoadingTrees(true)
      try {
        const { data, error } = await supabase.from("trees").select("tree_name, species").order("tree_name")

        if (error) throw error

        // Create unique tree options
        const uniqueOptions: TreeOption[] = []
        const seen = new Set()

        data?.forEach((item) => {
          const key = `${item.tree_name}-${item.species}`
          if (!seen.has(key) && item.tree_name && item.species) {
            seen.add(key)
            uniqueOptions.push({
              tree_name: item.tree_name,
              species: item.species,
            })
          }
        })

        setTreeOptions(uniqueOptions)
      } catch (error) {
        console.error("Error fetching tree options:", error)
        toast({
          title: "Error",
          description: "Failed to load tree options",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTrees(false)
      }
    }

    if (open) {
      fetchTreeOptions()
    }
  }, [open, toast])

  // Calculate end date based on inspection cycle and start date
  useEffect(() => {
    if (formData.start_date && formData.inspection_cycle) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(startDate)

      switch (formData.inspection_cycle) {
        case "Every Week":
          endDate.setDate(startDate.getDate() + 7)
          break
        case "Every Month":
          endDate.setMonth(startDate.getMonth() + 1)
          break
        case "Every 3 Months":
          endDate.setMonth(startDate.getMonth() + 3)
          break
        default:
          endDate.setDate(startDate.getDate() + 7)
      }

      setFormData((prev) => ({
        ...prev,
        end_date: endDate.toISOString().split("T")[0],
      }))
    }
  }, [formData.start_date, formData.inspection_cycle])

  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTreeToggle = (treeName: string) => {
    setSelectedTrees((prev) => {
      if (prev.includes(treeName)) {
        return prev.filter((name) => name !== treeName)
      } else {
        return [...prev, treeName]
      }
    })
  }

  const handleAddSelectedTrees = () => {
    if (selectedTrees.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tree_species: selectedTrees,
      }))
      setShowTreeSelection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!volunteer) return

    setIsSubmitting(true)

    try {
      // Validate required fields
      if (
        !formData.scheme_name ||
        !formData.location ||
        formData.tree_species.length === 0 ||
        !formData.number_of_trees ||
        !formData.start_date ||
        !formData.end_date
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const inspectionData: CreateInspectionData = {
        volunteer_id: volunteer.id,
        area: formData.location,
        trees_count: Number.parseInt(formData.number_of_trees),
        due_date: formData.end_date,
        assigned_by: "Admin", // You can get this from user context
        status: "Pending",
        scheme_name: formData.scheme_name,
        tree_species: formData.tree_species.join(", "),
        inspection_cycle: formData.inspection_cycle,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description,
      }

      const result = await createInspection(inspectionData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Inspection assigned to ${volunteer.name} successfully!`,
        })

        // Reset form
        setFormData({
          scheme_name: "",
          description: "",
          location: "",
          tree_species: [],
          number_of_trees: "",
          inspection_cycle: "Every Week",
          start_date: "",
          end_date: "",
        })
        setSelectedTrees([])

        onOpenChange(false)
        onAssignmentCreated?.()
      } else {
        toast({
          title: "Error",
          description: "Failed to assign inspection. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning inspection:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Volunteer</DialogTitle>
          <DialogDescription>View, edit and manage volunteers</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Volunteer Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Volunteer/Organisation Name</span>
                <p className="font-medium">{volunteer?.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone Number</span>
                <p className="font-medium">{volunteer?.phone}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Email</span>
                <p className="font-medium">{volunteer?.email}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">This is the name of the volunteer/Organisation</p>
          </div>

          {/* Scheme Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Scheme Name</label>
            <Input
              placeholder="Mango plantation around Tuticorin"
              value={formData.scheme_name}
              onChange={(e) => handleFormChange("scheme_name", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">This is the name of the assignment</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              placeholder="Assigning volunteer to plant trees near the south side of the harbour"
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Write a clear description for the assignment</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="Lakeshore Colony, Sector 13 Harbour, Tuticorin"
                value={formData.location}
                onChange={(e) => handleFormChange("location", e.target.value)}
                required
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" className="text-blue-600">
                <MapPin className="w-4 h-4 mr-1" /> Add Location
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Specify the location for the assignment</p>
          </div>

          {/* Tree Species */}
          <div>
            <label className="block text-sm font-medium mb-1">Tree Species</label>
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 border rounded-md p-2 min-h-10 bg-white">
                  {formData.tree_species.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.tree_species.map((tree) => (
                        <span key={tree} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {tree}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Select tree species</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => setShowTreeSelection(!showTreeSelection)}
                >
                  <TreePine className="w-4 h-4 mr-1" /> Select
                </Button>
              </div>

              {showTreeSelection && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Select Tree Species</span>
                    </div>

                    {isLoadingTrees ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {treeOptions.map((tree) => (
                          <div key={`${tree.tree_name}-${tree.species}`} className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer w-full">
                              <Checkbox
                                checked={selectedTrees.includes(tree.tree_name)}
                                onCheckedChange={() => handleTreeToggle(tree.tree_name)}
                              />
                              <span className="text-sm">
                                {tree.tree_name} <span className="text-xs text-gray-500 italic">({tree.species})</span>
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button
                        type="button"
                        onClick={() => setShowTreeSelection(false)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddSelectedTrees}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white"
                        size="sm"
                      >
                        Add Selected
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Specify the type of species of the plant</p>
          </div>

          {/* Number of Trees */}
          <div>
            <label className="block text-sm font-medium mb-1">Number Of Trees</label>
            <Input
              type="number"
              placeholder="15"
              value={formData.number_of_trees}
              onChange={(e) => handleFormChange("number_of_trees", e.target.value)}
              required
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Specify the number of trees for the assignment</p>
          </div>

          {/* Inspection Cycle */}
          <div>
            <label className="block text-sm font-medium mb-1">Inspection Cycle</label>
            <Select
              value={formData.inspection_cycle}
              onValueChange={(value) => handleFormChange("inspection_cycle", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inspection cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Every Week">Every Week</SelectItem>
                <SelectItem value="Every Month">Every Month</SelectItem>
                <SelectItem value="Every 3 Months">Every 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Specify the inspection cycle for the assignment</p>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleFormChange("start_date", e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="pl-9"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Specify the start date for the assignment</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleFormChange("end_date", e.target.value)}
                  required
                  min={formData.start_date || new Date().toISOString().split("T")[0]}
                  className="pl-9"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-calculated based on inspection cycle</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
  )
}

export default AssignVolunteerDialog
