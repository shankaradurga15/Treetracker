"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  ListFilter,
  Search,
  Import,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  X,
  ChevronDown,
  Loader2,
  Save,
  Trash,
  Eye,
  Edit,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase, type TreeData, type TreeSummary } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

const Master = () => {
  const { toast } = useToast()
  const [openComplaintDialog, setOpenComplaintDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState<number>(10)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedTreeName, setSelectedTreeName] = useState("")
  const [selectedScientificName, setSelectedScientificName] = useState("")
  const [o2Released, setO2Released] = useState("")
  const [co2Released, setCo2Released] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  // First, add state variables for filters at the top of the component with other state variables
  const [showSpeciesFilter, setShowSpeciesFilter] = useState(false)
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string[]>([])
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    showActive: true,
    showDead: true,
    minTrees: 0,
    maxTrees: 1000,
  })
  const speciesFilterRef = useRef<HTMLDivElement>(null)
  const filterOptionsRef = useRef<HTMLDivElement>(null)

  // Data states
  const [trees, setTrees] = useState<TreeSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  // Popover states
  const [showNamePopover, setShowNamePopover] = useState(false)
  const [selectedTrees, setSelectedTrees] = useState<string[]>([])
  const [showScientificPopover, setShowScientificPopover] = useState(false)
  const [selectedScientificNames, setSelectedScientificNames] = useState<string[]>([])
  const [showNewTreeDialog, setShowNewTreeDialog] = useState(false)
  const [newTreeName, setNewTreeName] = useState("")
  const [newScientificName, setNewScientificName] = useState("")
  const [newO2Released, setNewO2Released] = useState("")
  const [newCo2Released, setNewCo2Released] = useState("")
  const popoverRef = useRef<HTMLDivElement>(null)
  const scientificPopoverRef = useRef<HTMLDivElement>(null)

  // Actions menu states
  const [openMenuIndex, setOpenMenuIndex] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // View/Edit states
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [viewingTree, setViewingTree] = useState<TreeSummary | null>(null)
  const [editingTree, setEditingTree] = useState<TreeSummary | null>(null)
  const [editTreeName, setEditTreeName] = useState("")
  const [editScientificName, setEditScientificName] = useState("")
  const [editO2Released, setEditO2Released] = useState("")
  const [editCo2Released, setEditCo2Released] = useState("")

  // Dynamic options from database
  const [treeOptions, setTreeOptions] = useState<string[]>([])
  const [scientificNameOptions, setScientificNameOptions] = useState<string[]>([])

  // Fetch trees with aggregation
  const fetchTrees = async () => {
    setIsLoading(true)
    try {
      // Get aggregated tree data
      const { data, error } = await supabase.rpc("get_tree_summary", {
        search_query: searchQuery || null,
        limit_count: itemsPerPage,
        offset_count: (currentPage - 1) * itemsPerPage,
      })

      if (error) {
        console.error("RPC Error:", error)
        // Fallback to manual aggregation if RPC doesn't exist
        await fetchTreesManual()
        return
      }

      // Apply species filter if selected
      let filteredData = data || []
      if (selectedSpeciesFilter.length > 0) {
        filteredData = filteredData.filter((tree) => selectedSpeciesFilter.includes(tree.species))
      }

      // Apply additional filters
      filteredData = filteredData.filter((tree) => {
        // Filter by active/dead trees
        if (!filterOptions.showActive && tree.active_trees > 0) return false
        if (!filterOptions.showDead && tree.dead_trees > 0) return false

        // Filter by tree count range
        if (tree.total_trees < filterOptions.minTrees) return false
        if (filterOptions.maxTrees > 0 && tree.total_trees > filterOptions.maxTrees) return false

        return true
      })

      setTrees(filteredData)

      // Get total count for pagination
      const { count } = await supabase.from("trees").select("*", { count: "exact", head: true })

      setTotalCount(count || 0)

      // Fetch unique options for dropdowns
      await fetchTreeOptions()
    } catch (error) {
      console.error("Error fetching trees:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tree data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to handle species filter toggle
  const handleSpeciesFilterToggle = (species: string) => {
    setSelectedSpeciesFilter((prev) => {
      if (prev.includes(species)) {
        return prev.filter((s) => s !== species)
      } else {
        return [...prev, species]
      }
    })
  }

  // Add a function to apply species filter
  const applySpeciesFilter = () => {
    setCurrentPage(1) // Reset to first page when filtering
    fetchTrees()
    setShowSpeciesFilter(false)
  }

  // Add a function to clear species filter
  const clearSpeciesFilter = () => {
    setSelectedSpeciesFilter([])
    setCurrentPage(1)
    fetchTrees()
    setShowSpeciesFilter(false)
  }

  // Add a function to apply general filters
  const applyFilters = () => {
    setCurrentPage(1)
    fetchTrees()
    setShowFilterOptions(false)
  }

  // Add a function to reset filters
  const resetFilters = () => {
    setFilterOptions({
      showActive: true,
      showDead: true,
      minTrees: 0,
      maxTrees: 1000,
    })
    setCurrentPage(1)
    fetchTrees()
    setShowFilterOptions(false)
  }

  // Manual aggregation fallback
  const fetchTreesManual = async () => {
    try {
      let query = supabase.from("trees").select("*").order("created_at", { ascending: false })

      if (searchQuery) {
        query = query.or(
          `tree_name.ilike.%${searchQuery}%,species.ilike.%${searchQuery}%,custom_id.ilike.%${searchQuery}%`,
        )
      }

      const { data: allTrees, error } = await query

      if (error) throw error

      // Group trees by name and species
      const grouped = (allTrees || []).reduce((acc: Record<string, TreeData[]>, tree) => {
        const key = `${tree.tree_name}-${tree.species}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(tree)
        return acc
      }, {})

      // Convert to summary format with proper type checking
      let summaries: TreeSummary[] = Object.values(grouped)
        .filter((group): group is TreeData[] => Array.isArray(group) && group.length > 0)
        .map((group: TreeData[]) => {
          const first = group[0]
          const groupLength = group.length
          return {
            id: first.id,
            custom_id: first.custom_id || `T${Math.floor(Math.random() * 900) + 100}`,
            tree_name: first.tree_name,
            species: first.species,
            total_trees: groupLength,
            active_trees: Math.floor(groupLength * 0.8), // 80% active (example)
            dead_trees: Math.floor(groupLength * 0.2), // 20% dead (example)
            o2_released: first.o2_released,
            co2_released: first.co2_released,
          }
        })

      // Apply species filter if selected
      if (selectedSpeciesFilter.length > 0) {
        summaries = summaries.filter((tree) => selectedSpeciesFilter.includes(tree.species))
      }

      // Apply additional filters
      summaries = summaries.filter((tree) => {
        // Filter by active/dead trees
        if (!filterOptions.showActive && tree.active_trees > 0) return false
        if (!filterOptions.showDead && tree.dead_trees > 0) return false

        // Filter by tree count range
        if (tree.total_trees < filterOptions.minTrees) return false
        if (filterOptions.maxTrees > 0 && tree.total_trees > filterOptions.maxTrees) return false

        return true
      })

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedSummaries = summaries.slice(startIndex, startIndex + itemsPerPage)

      setTrees(paginatedSummaries)
      setTotalCount(summaries.length)
    } catch (error) {
      console.error("Error in manual fetch:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tree data",
        variant: "destructive",
      })
    }
  }

  // Fetch unique tree options with better error handling
  const fetchTreeOptions = async () => {
    setIsLoadingOptions(true)
    try {
      console.log("Fetching tree options...")
      const { data, error } = await supabase.from("trees").select("tree_name, species").order("tree_name")

      if (error) {
        console.error("Error fetching tree options:", error)
        toast({
          title: "Warning",
          description: "Could not load existing tree options",
          variant: "destructive",
        })
        return
      }

      console.log("Fetched tree data:", data)

      if (data && data.length > 0) {
        const uniqueTreeNames = [...new Set(data.map((item) => item.tree_name))].filter(Boolean)
        const uniqueSpecies = [...new Set(data.map((item) => item.species))].filter(Boolean)

        console.log("Unique tree names:", uniqueTreeNames)
        console.log("Unique species:", uniqueSpecies)

        setTreeOptions(uniqueTreeNames)
        setScientificNameOptions(uniqueSpecies)
      } else {
        console.log("No tree data found")
        setTreeOptions([])
        setScientificNameOptions([])
      }
    } catch (error) {
      console.error("Error in fetchTreeOptions:", error)
      toast({
        title: "Error",
        description: "Failed to load tree options",
        variant: "destructive",
      })
    } finally {
      setIsLoadingOptions(false)
    }
  }

  // Create the RPC function for tree summary
  const createRPCFunction = async () => {
    try {
      const { error } = await supabase.rpc("create_tree_summary_function")
      if (error) {
        console.log("RPC function might already exist or needs to be created manually")
      }
    } catch (error) {
      console.log("RPC function creation skipped")
    }
  }

  useEffect(() => {
    createRPCFunction()
    fetchTrees()
  }, [currentPage, searchQuery])

  // Add a separate useEffect for initial data loading
  useEffect(() => {
    fetchTreeOptions()
  }, [])

  const handleImportClick = () => setOpenComplaintDialog(true)

  const handleToggleMenu = (treeId: string) => {
    setOpenMenuIndex((prev) => (prev === treeId ? null : treeId))
  }

  // View tree details
  const handleViewTree = (tree: TreeSummary) => {
    setViewingTree(tree)
    setShowViewDialog(true)
    setOpenMenuIndex(null) // Close the menu
  }

  // Edit tree
  const handleEditTree = (tree: TreeSummary) => {
    setEditingTree(tree)
    setEditTreeName(tree.tree_name)
    setEditScientificName(tree.species)
    setEditO2Released(tree.o2_released)
    setEditCo2Released(tree.co2_released)
    setShowEditDialog(true)
    setOpenMenuIndex(null) // Close the menu
  }

  // Delete tree
  const handleDeleteTree = async (tree: TreeSummary) => {
    if (confirm(`Are you sure you want to delete all ${tree.tree_name} trees?`)) {
      setIsLoading(true)
      try {
        // Delete all trees with matching tree_name and species
        const { error } = await supabase
          .from("trees")
          .delete()
          .eq("tree_name", tree.tree_name)
          .eq("species", tree.species)

        if (error) {
          throw error
        }

        // Also delete from tree_types table to maintain consistency
        await supabase.from("tree_types").delete().eq("tree_name", tree.tree_name).eq("species", tree.species)

        toast({
          title: "Success",
          description: `Deleted all ${tree.tree_name} trees`,
        })

        // Close edit dialog if open
        if (showEditDialog) {
          setShowEditDialog(false)
          setEditingTree(null)
        }

        // Close menu if open
        setOpenMenuIndex(null)

        // Refresh the tree list
        fetchTrees()
      } catch (error) {
        console.error("Error deleting trees:", error)
        toast({
          title: "Error",
          description: "Failed to delete trees",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleUpdateTree = async () => {
    if (!editingTree) return

    if (!editTreeName || !editScientificName) {
      toast({
        title: "Error",
        description: "Tree name and scientific name are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // First, check if we're changing the tree type (name or species)
      const isTreeTypeChanged = editingTree.tree_name !== editTreeName || editingTree.species !== editScientificName

      if (isTreeTypeChanged) {
        // If tree type is changed, we need to:
        // 1. Get count of trees to recreate
        const { data: treeData, error: countError } = await supabase
          .from("trees")
          .select("id")
          .eq("tree_name", editingTree.tree_name)
          .eq("species", editingTree.species)

        if (countError) throw countError

        const count = treeData?.length || 0

        // 2. Delete the old tree type from tree_types
        const { error: typeDeleteError } = await supabase
          .from("tree_types")
          .delete()
          .eq("tree_name", editingTree.tree_name)
          .eq("species", editingTree.species)

        if (typeDeleteError) {
          console.warn("Error deleting tree type:", typeDeleteError)
          // Continue anyway as the tree type might not exist
        }

        // 3. Delete old trees
        const { error: deleteError } = await supabase
          .from("trees")
          .delete()
          .eq("tree_name", editingTree.tree_name)
          .eq("species", editingTree.species)

        if (deleteError) throw deleteError

        // 4. Create new trees with updated type
        if (count > 0) {
          const newTrees = []
          for (let i = 0; i < count; i++) {
            newTrees.push({
              tree_name: editTreeName,
              species: editScientificName,
              o2_released: editO2Released || "0 kg",
              co2_released: editCo2Released || "0 kg",
            })
          }

          const { error: insertError } = await supabase.from("trees").insert(newTrees)
          if (insertError) throw insertError
        }
      } else {
        // If only updating o2/co2 values, update all trees of this type
        const { error: updateError } = await supabase
          .from("trees")
          .update({
            o2_released: editO2Released,
            co2_released: editCo2Released,
          })
          .eq("tree_name", editingTree.tree_name)
          .eq("species", editingTree.species)

        if (updateError) throw updateError
      }

      toast({
        title: "Success",
        description: `Updated ${editTreeName} trees`,
      })

      setShowEditDialog(false)
      setEditingTree(null)
      fetchTrees()
    } catch (error) {
      console.error("Error updating trees:", error)
      toast({
        title: "Error",
        description: "Failed to update trees",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNamePopover(false)
      }
      if (scientificPopoverRef.current && !scientificPopoverRef.current.contains(event.target as Node)) {
        setShowScientificPopover(false)
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuIndex(null)
      }
      if (speciesFilterRef.current && !speciesFilterRef.current.contains(event.target as Node)) {
        setShowSpeciesFilter(false)
      }
      if (filterOptionsRef.current && !filterOptionsRef.current.contains(event.target as Node)) {
        setShowFilterOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleAddTree = () => {
    setShowAddDialog(true)
  }

  const handleCloseDialog = () => {
    setShowAddDialog(false)
    setSelectedTreeName("")
    setSelectedScientificName("")
    setO2Released("")
    setCo2Released("")
    setSelectedTrees([])
    setSelectedScientificNames([])
    setShowNamePopover(false)
    setShowScientificPopover(false)
  }

  const handleCreateTree = async () => {
    if (!selectedTreeName || !selectedScientificName) {
      toast({
        title: "Error",
        description: "Tree name and scientific name are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // The custom_id will be generated automatically by the database trigger
      const newTree = {
        tree_name: selectedTreeName,
        species: selectedScientificName,
        o2_released: o2Released || "0 kg",
        co2_released: co2Released || "0 kg",
      }

      const { error } = await supabase.from("trees").insert([newTree])

      if (error) throw error

      toast({
        title: "Success",
        description: `Added new tree: ${selectedTreeName}`,
      })

      fetchTrees()
      handleCloseDialog()
    } catch (error) {
      console.error("Error creating tree:", error)
      toast({
        title: "Error",
        description: "Failed to add tree",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
      setSelectedTreeName(selectedTrees.join(", "))
    }
    setShowNamePopover(false)
  }

  const handleScientificNameToggle = (scientificName: string) => {
    setSelectedScientificNames((prev) => {
      if (prev.includes(scientificName)) {
        return prev.filter((name) => name !== scientificName)
      } else {
        return [...prev, scientificName]
      }
    })
  }

  const handleAddSelectedScientificNames = () => {
    if (selectedScientificNames.length > 0) {
      setSelectedScientificName(selectedScientificNames.join(", "))
    }
    setShowScientificPopover(false)
  }

  const handleShowNewTreeDialog = () => {
    setShowNewTreeDialog(true)
    setShowNamePopover(false)
    setShowScientificPopover(false)
  }

  const handleCloseNewTreeDialog = () => {
    setShowNewTreeDialog(false)
    setNewTreeName("")
    setNewScientificName("")
    setNewO2Released("")
    setNewCo2Released("")
  }

  const handleCreateNewTree = async () => {
    if (!newTreeName || !newScientificName) {
      toast({
        title: "Error",
        description: "Tree name and scientific name are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // The custom_id will be generated automatically by the database trigger
      const newTree = {
        tree_name: newTreeName,
        species: newScientificName,
        o2_released: newO2Released || "0 kg",
        co2_released: newCo2Released || "0 kg",
      }

      const { error } = await supabase.from("trees").insert([newTree])

      if (error) throw error

      toast({
        title: "Success",
        description: `Added new tree: ${newTreeName}`,
      })

      // Update options
      if (!treeOptions.includes(newTreeName)) {
        setTreeOptions([...treeOptions, newTreeName])
      }
      if (!scientificNameOptions.includes(newScientificName)) {
        setScientificNameOptions([...scientificNameOptions, newScientificName])
      }

      fetchTrees()
      handleCloseNewTreeDialog()
    } catch (error) {
      console.error("Error creating new tree:", error)
      toast({
        title: "Error",
        description: "Failed to add new tree",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Update the useEffect dependencies to include filter changes
  useEffect(() => {
    createRPCFunction()
    fetchTrees()
  }, [
    currentPage,
    searchQuery,
    selectedSpeciesFilter.length,
    filterOptions.showActive,
    filterOptions.showDead,
    filterOptions.minTrees,
    filterOptions.maxTrees,
  ])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Tree Master Header Section */}
      <div className="mb-6 pt-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Tree Master</h1>
            <p className="text-sm text-gray-600">Add and manage tree species across Tuticorin district</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleImportClick}>
              <Import size={18} className="mr-1" /> Import Excel
            </Button>
            <button
              onClick={handleAddTree}
              className="flex items-center px-3 py-2 text-sm bg-green-700 hover:bg-green-800 text-white rounded-md transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Trees
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tree list ({totalCount} total)</h2>
          <div className="flex gap-2 items-center">
            <div className="relative" ref={speciesFilterRef}>
              <button
                onClick={() => setShowSpeciesFilter(!showSpeciesFilter)}
                className={`flex items-center px-3 py-2 text-sm border rounded-md transition-colors ${
                  selectedSpeciesFilter.length > 0
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Species
                {selectedSpeciesFilter.length > 0 && (
                  <span className="ml-1 bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                    {selectedSpeciesFilter.length}
                  </span>
                )}
                <ListFilter className="ml-1 w-4 h-4" />
              </button>

              {showSpeciesFilter && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Filter by Species</span>
                    </div>

                    <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                      {scientificNameOptions.length > 0 ? (
                        scientificNameOptions.map((species) => (
                          <div key={species} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{species}</span>
                            <input
                              type="checkbox"
                              checked={selectedSpeciesFilter.includes(species)}
                              onChange={() => handleSpeciesFilterToggle(species)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-2">No species found in database.</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={clearSpeciesFilter}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={applySpeciesFilter}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={filterOptionsRef}>
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className={`flex items-center justify-center p-2 border rounded-md transition-colors ${
                  !filterOptions.showActive ||
                  !filterOptions.showDead ||
                  filterOptions.minTrees > 0 ||
                  filterOptions.maxTrees < 1000
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {showFilterOptions && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Advanced Filters</span>
                    </div>

                    <div className="space-y-4 mb-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Tree Status</label>
                        <div className="flex gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showActive"
                              checked={filterOptions.showActive}
                              onChange={(e) => setFilterOptions({ ...filterOptions, showActive: e.target.checked })}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                            />
                            <label htmlFor="showActive" className="text-sm text-gray-700">
                              Active Trees
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showDead"
                              checked={filterOptions.showDead}
                              onChange={(e) => setFilterOptions({ ...filterOptions, showDead: e.target.checked })}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                            />
                            <label htmlFor="showDead" className="text-sm text-gray-700">
                              Dead Trees
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Tree Count Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Min</label>
                            <input
                              type="number"
                              min="0"
                              value={filterOptions.minTrees}
                              onChange={(e) =>
                                setFilterOptions({ ...filterOptions, minTrees: Number.parseInt(e.target.value) || 0 })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Max</label>
                            <input
                              type="number"
                              min="0"
                              value={filterOptions.maxTrees}
                              onChange={(e) =>
                                setFilterOptions({ ...filterOptions, maxTrees: Number.parseInt(e.target.value) || 0 })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={resetFilters}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Trees..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-gray-900">ID</th>
                <th className="text-left p-4 font-medium text-gray-900">Tree Name</th>
                <th className="text-left p-4 font-medium text-gray-900">Species</th>
                <th className="text-left p-4 font-medium text-gray-900">Total Trees</th>
                <th className="text-left p-4 font-medium text-gray-900">Active Trees</th>
                <th className="text-left p-4 font-medium text-gray-900">Dead Trees</th>
                <th className="text-left p-4 font-medium text-gray-900">O₂ Released/year (kg)</th>
                <th className="text-left p-4 font-medium text-gray-900">CO₂ Released/year (kg)</th>
                <th className="text-right p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-green-700 animate-spin mr-2" />
                      <span>Loading trees...</span>
                    </div>
                  </td>
                </tr>
              ) : trees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? "No trees found matching your search."
                      : "No trees found. Add some trees to get started."}
                  </td>
                </tr>
              ) : (
                trees.map((tree) => (
                  <tr key={tree.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{tree.custom_id || "N/A"}</td>
                    <td className="p-4">{tree.tree_name}</td>
                    <td className="p-4 italic text-gray-600">{tree.species}</td>
                    <td className="p-4">{tree.total_trees}</td>
                    <td className="p-4">{tree.active_trees}</td>
                    <td className="p-4">{tree.dead_trees}</td>
                    <td className="p-4">{tree.o2_released}</td>
                    <td className="p-4">{tree.co2_released}</td>
                    <td className="p-4 text-right">
                      {/* Direct action buttons instead of dropdown menu */}
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleViewTree(tree)}
                          className="p-1.5 bg-gray-100 hover:bg-green-100 rounded text-gray-600 hover:text-green-700 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditTree(tree)}
                          className="p-1.5 bg-gray-100 hover:bg-blue-100 rounded text-gray-600 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTree(tree)}
                          className="p-1.5 bg-gray-100 hover:bg-red-100 rounded text-gray-600 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(10, totalPages || 1) }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                disabled={isLoading}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                  currentPage === number ? "bg-gray-900 text-white" : "border hover:bg-gray-100"
                }`}
              >
                {number}
              </button>
            ))}
            {(totalPages || 0) > 10 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => paginate(totalPages || 1)}
                  disabled={isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-sm border hover:bg-gray-100 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => paginate(Math.min(totalPages || 1, currentPage + 1))}
            disabled={currentPage === (totalPages || 1) || isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog open={openComplaintDialog} onOpenChange={setOpenComplaintDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Trees from Excel</DialogTitle>
            <DialogDescription>Upload an Excel file to import multiple trees at once.</DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">Feature coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Tree Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add Tree</h3>
              <button onClick={handleCloseDialog} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Fill in the details to add a new tree</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative" ref={popoverRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedTreeName}
                        onChange={(e) => setSelectedTreeName(e.target.value)}
                        onClick={() => setShowNamePopover(!showNamePopover)}
                        placeholder="Select / Enter Tree name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {showNamePopover && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Add New</span>
                            <button
                              onClick={handleShowNewTreeDialog}
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                            {treeOptions.length > 0 ? (
                              treeOptions.map((tree) => (
                                <div key={tree} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">{tree}</span>
                                  <input
                                    type="checkbox"
                                    checked={selectedTrees.includes(tree)}
                                    onChange={() => handleTreeToggle(tree)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500 text-center py-2">
                                No existing trees found. Click + to add new.
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handleAddSelectedTrees}
                            className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={scientificPopoverRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedScientificName}
                        onChange={(e) => setSelectedScientificName(e.target.value)}
                        onClick={() => setShowScientificPopover(!showScientificPopover)}
                        placeholder="Select / Enter Scientific name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {showScientificPopover && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Add New</span>
                            <button
                              onClick={handleShowNewTreeDialog}
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                            {scientificNameOptions.length > 0 ? (
                              scientificNameOptions.map((scientificName) => (
                                <div key={scientificName} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">{scientificName}</span>
                                  <input
                                    type="checkbox"
                                    checked={selectedScientificNames.includes(scientificName)}
                                    onChange={() => handleScientificNameToggle(scientificName)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500 text-center py-2">
                                No existing species found. Click + to add new.
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handleAddSelectedScientificNames}
                            className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">O₂ Released/year (kg)</label>
                    <input
                      type="text"
                      value={o2Released}
                      onChange={(e) => setO2Released(e.target.value)}
                      placeholder="Enter Value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ Released/year (kg)</label>
                    <input
                      type="text"
                      value={co2Released}
                      onChange={(e) => setCo2Released(e.target.value)}
                      placeholder="Enter Value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTree}
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Tree Dialog */}
      {showNewTreeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">New Tree Type</h3>
              <button
                onClick={handleCloseNewTreeDialog}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Add a new tree type to the database</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newTreeName}
                      onChange={(e) => setNewTreeName(e.target.value)}
                      placeholder="Enter Tree name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
                    <input
                      type="text"
                      value={newScientificName}
                      onChange={(e) => setNewScientificName(e.target.value)}
                      placeholder="Enter Scientific name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">O₂ Released/year (kg)</label>
                    <input
                      type="text"
                      value={newO2Released}
                      onChange={(e) => setNewO2Released(e.target.value)}
                      placeholder="Enter Value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ Released/year (kg)</label>
                    <input
                      type="text"
                      value={newCo2Released}
                      onChange={(e) => setNewCo2Released(e.target.value)}
                      placeholder="Enter Value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseNewTreeDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewTree}
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Tree Dialog (Read-only) */}
      {showViewDialog && viewingTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Tree Details</h3>
              <button
                onClick={() => {
                  setShowViewDialog(false)
                  setViewingTree(null)
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <form className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Tree Type ID</p>
                  <p className="text-lg font-bold text-blue-900">{viewingTree.custom_id}</p>
                  <p className="text-xs text-blue-600">
                    This ID represents all {viewingTree.tree_name} trees of this species
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tree Name</label>
                    <input
                      type="text"
                      value={viewingTree.tree_name}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
                    <input
                      type="text"
                      value={viewingTree.species}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm italic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Trees</label>
                    <input
                      type="text"
                      value={viewingTree.total_trees}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm font-bold text-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Trees</label>
                    <input
                      type="text"
                      value={viewingTree.active_trees}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dead Trees</label>
                    <input
                      type="text"
                      value={viewingTree.dead_trees}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm font-bold text-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">O₂ Released/year</label>
                    <input
                      type="text"
                      value={viewingTree.o2_released}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ Released/year</label>
                    <input
                      type="text"
                      value={viewingTree.co2_released}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowViewDialog(false)
                  handleEditTree(viewingTree)
                }}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowViewDialog(false)
                    setViewingTree(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tree Dialog (Editable) */}
      {showEditDialog && editingTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Tree</h3>
              <button
                onClick={() => {
                  setShowEditDialog(false)
                  setEditingTree(null)
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateTree()
                }}
              >
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Tree Type ID</p>
                  <p className="text-lg font-bold text-blue-900">{editingTree.custom_id}</p>
                  <p className="text-xs text-blue-600">
                    Editing will update all {editingTree.tree_name} trees of this species
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tree Name</label>
                    <input
                      type="text"
                      value={editTreeName}
                      onChange={(e) => setEditTreeName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
                    <input
                      type="text"
                      value={editScientificName}
                      onChange={(e) => setEditScientificName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Trees</label>
                    <input
                      type="text"
                      value={editingTree.total_trees}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm font-bold text-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Trees</label>
                    <input
                      type="text"
                      value={editingTree.active_trees}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dead Trees</label>
                    <input
                      type="text"
                      value={editingTree.dead_trees}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm font-bold text-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">O₂ Released/year (kg)</label>
                    <input
                      type="text"
                      value={editO2Released}
                      onChange={(e) => setEditO2Released(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ Released/year (kg)</label>
                    <input
                      type="text"
                      value={editCo2Released}
                      onChange={(e) => setEditCo2Released(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => handleDeleteTree(editingTree)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowEditDialog(false)
                    setEditingTree(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTree}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Master
