"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { ListFilter, Search, Import, ChevronLeft, ChevronRight, Plus, Filter, X, ChevronDown } from "lucide-react";

interface TreeListData {
  id: string;
  treeName: string;
  species: string;
  totalTrees: number;
  activeTrees: number;
  deadTrees: number;
  o2Released: string;
  co2Released: string;
}

const sampleTrees: TreeListData[] = [
  {
    id: "T045",
    treeName: "Oak",
    species: "Quercus robur",
    totalTrees: 300,
    activeTrees: 150,
    deadTrees: 50,
    o2Released: "120 kg",
    co2Released: "10-20 kg",
  },
  {
    id: "T183",
    treeName: "Maple",
    species: "Acer saccharum",
    totalTrees: 200,
    activeTrees: 225,
    deadTrees: 75,
    o2Released: "140 kg",
    co2Released: "20-25",
  },
  {
    id: "T140",
    treeName: "Pine",
    species: "Pinus sylvestris",
    totalTrees: 150,
    activeTrees: 100,
    deadTrees: 50,
    o2Released: "110 kg",
    co2Released: "15-18",
  },
  {
    id: "T035",
    treeName: "Banyan",
    species: "Ficus Benghalensis",
    totalTrees: 200,
    activeTrees: 150,
    deadTrees: 50,
    o2Released: "160 kg",
    co2Released: "25-30",
  },
  {
    id: "T171",
    treeName: "Neem",
    species: "Azadirachta indica",
    totalTrees: 500,
    activeTrees: 400,
    deadTrees: 100,
    o2Released: "100 kg",
    co2Released: "12-15",
  }
];

const Master = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTreeName, setSelectedTreeName] = useState("");
  const [selectedScientificName, setSelectedScientificName] = useState("");
  const [o2Released, setO2Released] = useState("");
  const [co2Released, setCo2Released] = useState("");
  
  // Popover states
  const [showNamePopover, setShowNamePopover] = useState(false);
  const [selectedTrees, setSelectedTrees] = useState<string[]>([]);
  const [showScientificPopover, setShowScientificPopover] = useState(false);
  const [selectedScientificNames, setSelectedScientificNames] = useState<string[]>([]);
  const [showNewTreeDialog, setShowNewTreeDialog] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");
  const [newScientificName, setNewScientificName] = useState("");
  const [newO2Released, setNewO2Released] = useState("");
  const [newCo2Released, setNewCo2Released] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const scientificPopoverRef = useRef<HTMLDivElement>(null);

  const treeOptions = ["Neem", "Banyan", "Oak", "Pine"];
  const scientificNameOptions = ["Azadirachta indica", "Ficus benghalensis", "Quercus robur", "Pinus sylvestris"];

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNamePopover(false);
      }
      if (scientificPopoverRef.current && !scientificPopoverRef.current.contains(event.target as Node)) {
        setShowScientificPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const paginate = (pageNumber: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsLoading(false);
    }, 300);
  };

  const handleAddTree = () => {
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setSelectedTreeName("");
    setSelectedScientificName("");
    setO2Released("");
    setCo2Released("");
    setSelectedTrees([]);
    setSelectedScientificNames([]);
    setShowNamePopover(false);
    setShowScientificPopover(false);
    setShowNewTreeDialog(false);
    setNewTreeName("");
    setNewScientificName("");
    setNewO2Released("");
    setNewCo2Released("");
  };

  const handleCreateTree = () => {
    // Handle tree creation logic here
    console.log("Creating tree:", {
      treeName: selectedTreeName,
      scientificName: selectedScientificName,
      o2Released,
      co2Released
    });
    handleCloseDialog();
  };

  const handleTreeToggle = (treeName: string) => {
    setSelectedTrees(prev => {
      if (prev.includes(treeName)) {
        return prev.filter(name => name !== treeName);
      } else {
        return [...prev, treeName];
      }
    });
  };

  const handleAddSelectedTrees = () => {
    if (selectedTrees.length > 0) {
      setSelectedTreeName(selectedTrees.join(", "));
    }
    setShowNamePopover(false);
  };

  const handleScientificNameToggle = (scientificName: string) => {
    setSelectedScientificNames(prev => {
      if (prev.includes(scientificName)) {
        return prev.filter(name => name !== scientificName);
      } else {
        return [...prev, scientificName];
      }
    });
  };

  const handleAddSelectedScientificNames = () => {
    if (selectedScientificNames.length > 0) {
      setSelectedScientificName(selectedScientificNames.join(", "));
    }
    setShowScientificPopover(false);
  };

  const handleShowNewTreeDialog = () => {
    setShowNewTreeDialog(true);
    setShowNamePopover(false);
    setShowScientificPopover(false);
  };

  const handleCloseNewTreeDialog = () => {
    setShowNewTreeDialog(false);
    setNewTreeName("");
    setNewScientificName("");
    setNewO2Released("");
    setNewCo2Released("");
  };

  const handleCreateNewTree = () => {
    // Handle new tree creation logic here
    console.log("Creating new tree:", {
      name: newTreeName,
      scientificName: newScientificName,
      o2Released: newO2Released,
      co2Released: newCo2Released
    });
    handleCloseNewTreeDialog();
  };

  const indexOfLastTree = currentPage * itemsPerPage;
  const indexOfFirstTree = indexOfLastTree - itemsPerPage;
  const currentTrees = sampleTrees.slice(indexOfFirstTree, indexOfLastTree);
  const totalPages = 20;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Tree Master Header Section */}
      <div className="mb-6 pt-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Tree Master</h1>
            <p className="text-sm text-gray-600">Add and manage tree species across Tufitcorp district</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center px-3 py-2 text-sm border border-green-200 text-green-700 rounded-md hover:bg-green-50 transition-colors">
              <Import className="w-4 h-4 mr-1" />
              Import Excel
            </button>
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
          <h2 className="text-lg font-semibold">Tree list</h2>
          <div className="flex gap-2 items-center">
            <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Species <ListFilter className="ml-1 w-4 h-4" />
            </button>
            <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Location <ListFilter className="ml-1 w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search Trees..." 
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
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
              {currentTrees.map((tree) => (
                <tr key={tree.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{tree.id}</td>
                  <td className="p-4">{tree.treeName}</td>
                  <td className="p-4 italic text-gray-600">{tree.species}</td>
                  <td className="p-4">{tree.totalTrees}</td>
                  <td className="p-4">{tree.activeTrees}</td>
                  <td className="p-4">{tree.deadTrees}</td>
                  <td className="p-4">{tree.o2Released}</td>
                  <td className="p-4">{tree.co2Released}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded focus:outline-none"
                    >
                      <span className="text-gray-600">⋯</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  disabled={isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                    currentPage === number
                      ? "bg-gray-900 text-white"
                      : "border hover:bg-gray-100"
                  }`}
                >
                  {number}
                </button>
              )
            )}
            {totalPages > 10 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-sm border hover:bg-gray-100 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Tree Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add Tree</h3>
              <button
                onClick={handleCloseDialog}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Fill in the details to add Tree Details</p>
              
              <div className="space-y-4">
                {/* Name Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative" ref={popoverRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedTreeName}
                        onChange={(e) => setSelectedTreeName(e.target.value)}
                        onClick={() => setShowNamePopover(!showNamePopover)}
                        placeholder="Select / Enter Tree name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                        readOnly
                      />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Name Popover */}
                    {showNamePopover && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3">
                          {/* Add New Section */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Add New</span>
                            <button 
                              onClick={handleShowNewTreeDialog}
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Tree Options */}
                          <div className="space-y-2 mb-3">
                            {treeOptions.map((tree) => (
                              <div key={tree} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{tree}</span>
                                <input
                                  type="checkbox"
                                  checked={selectedTrees.includes(tree)}
                                  onChange={() => handleTreeToggle(tree)}
                                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Add Button */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scientific Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedScientificName}
                        onChange={(e) => setSelectedScientificName(e.target.value)}
                        onClick={() => setShowScientificPopover(!showScientificPopover)}
                        placeholder="Select / Enter Scientific name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                        readOnly
                      />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Scientific Name Popover */}
                    {showScientificPopover && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3">
                          {/* Add New Section */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Add New</span>
                            <button 
                              onClick={handleShowNewTreeDialog}
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Scientific Name Options */}
                          <div className="space-y-2 mb-3">
                            {scientificNameOptions.map((scientificName) => (
                              <div key={scientificName} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{scientificName}</span>
                                <input
                                  type="checkbox"
                                  checked={selectedScientificNames.includes(scientificName)}
                                  onChange={() => handleScientificNameToggle(scientificName)}
                                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Add Button */}
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

                {/* O2 and CO2 Released Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      O₂ Released/year (kg)
                    </label>
                    <input
                      type="text"
                      value={o2Released}
                      onChange={(e) => setO2Released(e.target.value)}
                      placeholder="Enter Value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CO₂ Released/year (kg)
                    </label>
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

            {/* Dialog Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTree}
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors"
              >
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
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">New Tree</h3>
              <button
                onClick={handleCloseNewTreeDialog}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Fill in the details to add New Tree Details</p>
              
              <div className="space-y-4">
                {/* Name and Scientific Name Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newTreeName}
                      onChange={(e) => setNewTreeName(e.target.value)}
                      placeholder="Enter Tree name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scientific Name
                    </label>
                    <input
                      type="text"
                      value={newScientificName}
                      onChange={(e) => setNewScientificName(e.target.value)}
                      placeholder="Enter Scientific name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* O2 and CO2 Released Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      O₂ Released/year (kg)
                    </label>
                    <input
                      type="text"
                      value={newO2Released}
                      onChange={(e) => setNewO2Released(e.target.value)}
                      placeholder="Enter Value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CO₂ Released/year (kg)
                    </label>
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

            {/* Dialog Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseNewTreeDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewTree}
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Master;