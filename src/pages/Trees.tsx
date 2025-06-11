"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Weight,
  Ruler,
  Building2,
  Share2,
  Heart,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Users,
  TreePine,
  List,
  ListFilter,
  Search,
  Ellipsis,
  Import,
} from "lucide-react";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Define marker icon
const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface TreeData {
  id: string;
  name: string;
  species: string;
  image: string;
  plantedDate?: string;
  location?: string;
  currentWeight?: string;
  projectedWeight?: string;
  volunteerId?: string;
  organizationId?: string;
}

interface TreeListData {
  id: string;
  name: string;
  species: string;
  location: string;
  plantedOn: string;
  plantedBy: {
    name: string;
    id: string;
    image: string;
  };
  status: "Completed" | "Due" | "In Progress" | "Pending";
  nextinspectiondate: string;
}

interface OrganizationData {
  id: string;
  name: string;
  logo: string;
  foundedDate?: string;
  location?: string;
  treesPlanted?: string;
  hiredPlanters?: number;
  heroImage?: string;
  plantedTrees?: {
    id: string;
    name: string;
    species: string;
    image: string;
  }[];
}

interface VolunteerData {
  id: string;
  name: string;
  heroImage?: string;
  photo: string;
  avatar?: string;
  treesPlanted?: number;
  memberSince?: string;
  location?: string;
  organizationId?: string;
  plantedTrees?: {
    id: string;
    name: string;
    species: string;
    image: string;
  }[];
}

const TreeApp = () => {
  // Main view states
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [currentView, setCurrentView] = useState<
    "main" | "tree-details" | "volunteer" | "organization"
  >("main");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showImportButton, setShowImportButton] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Selected item states
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerData | null>(null);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationData | null>(null);

  // UI states
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Scroll refs
  const treescrollRef = useRef<HTMLDivElement>(null);
  const orgscrollRef = useRef<HTMLDivElement>(null);
  const volunteerscrollRef = useRef<HTMLDivElement>(null);

  // Arrow visibility states
  const [treeLeftArrowVisible, setTreeLeftArrowVisible] = useState(false);
  const [orgLeftArrowVisible, setOrgLeftArrowVisible] = useState(false);
  const [volunteerLeftArrowVisible, setVolunteerLeftArrowVisible] =
    useState(false);

  // Sample data for trees
  const trees: TreeData[] = [
    {
      id: "12345",
      name: "Oak Tree",
      species: "Quercus robur",
      image: "/public/oak.jpg",
      plantedDate: "April 30th, 2025",
      location: "Teachers Colony, Tuticorin",
      currentWeight: "~10-20 Kg",
      projectedWeight: "~100-150 Kg",
      volunteerId: "rahul-kumar",
      organizationId: "hcl-foundation",
    },
    {
      id: "12346",
      name: "Pine Tree",
      species: "Pinus sylvestris",
      image: "/public/pine.jpg",
      plantedDate: "March 15th, 2025",
      location: "Green Valley, Chennai",
      currentWeight: "~8-15 Kg",
      projectedWeight: "~80-120 Kg",
      volunteerId: "cory-fisher",
      organizationId: "rotary-club",
    },
    {
      id: "3",
      name: "Neem Tree",
      species: "Azadirachta Indica",
      image: "/public/neem.jpg",
      plantedDate: "May 10th, 2025",
      location: "Central Park, Tuticorin",
      currentWeight: "~5-10 Kg",
      projectedWeight: "~70-90 Kg",
      volunteerId: "albert-flores",
      organizationId: "tuticorin-corporation",
    },
    {
      id: "4",
      name: "Banyan Tree",
      species: "Ficus Benghalensis",
      image: "/public/banyan.jpg",
      plantedDate: "June 5th, 2025",
      location: "Beach Road, Tuticorin",
      currentWeight: "~15-25 Kg",
      projectedWeight: "~120-180 Kg",
      volunteerId: "bessie-cooper",
      organizationId: "lions-club",
    },
    {
      id: "5",
      name: "Bamboo Tree",
      species: "Bambusa Vulgaris",
      image: "/public/bamboo.jpg",
      plantedDate: "July 12th, 2025",
      location: "River Side, Tuticorin",
      currentWeight: "~3-8 Kg",
      projectedWeight: "~50-70 Kg",
      volunteerId: "dianne-russell",
      organizationId: "govern-tamilnadu",
    },
  ];

  // Sample data for organizations
  const organizations: Record<string, OrganizationData> = {
    "hcl-foundation": {
      id: "hcl-foundation",
      name: "HCL Foundation",
      logo: "/public/hclfoundation_logo.jpg",
      foundedDate: "April 30th, 2016",
      location: "Teachers Colony, Tuticorin",
      treesPlanted: "15K",
      hiredPlanters: 75,
      heroImage: "/public/oak.jpg",
      plantedTrees: [
        {
          id: "neem-org",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "banyan-org",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },

        {
          id: "pine-org",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
        {
          id: "bamboo-org",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
      ],
    },
    "rotary-club": {
      id: "rotary-club",
      name: "Rotary Club",
      logo: "/public/rotary club.jpg",
      foundedDate: "March 15th, 2025",
      location: "Green Valley, Chennai",
      treesPlanted: "15K",
      hiredPlanters: 75,
      heroImage: "/public/pine.jpg",
      plantedTrees: [
        {
          id: "neem-org",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "banyan-org",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },

        {
          id: "oak-org",
          name: "Oak Tree",
          species: "Quercus robur",
          image: "/public/oak.jpg",
        },
        {
          id: "bamboo-org",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
      ],
    },
    "tuticorin-corporation": {
      id: "tuticorin-corporation",
      name: "Tuticorin Corporation",
      logo: "/public/tuti corporation.jpg",
      foundedDate: "May 10th, 2025",
      location: "Central Park, Tuticorin",
      treesPlanted: "15K",
      hiredPlanters: 75,
      heroImage: "/public/neem.jpg",
      plantedTrees: [
        {
          id: "oak-org",
          name: "Oak Tree",
          species: "Quercus robur",
          image: "/public/oak.jpg",
        },
        {
          id: "banyan-org",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },

        {
          id: "pine-org",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
        {
          id: "bamboo-org",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
      ],
    },
    "lions-club": {
      id: "lions-club",
      name: "Lions Club",
      logo: "/public/lions club.webp",
      foundedDate: "June 5th, 2025",
      location: "Beach Road, Tuticorin",
      treesPlanted: "15K",
      hiredPlanters: 75,
      heroImage: "/public/banyan.jpg",
      plantedTrees: [
        {
          id: "neem-org",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "oak-org",
          name: "Oak Tree",
          species: "Quercus robur",
          image: "/public/oak.jpg",
        },

        {
          id: "pine-org",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
        {
          id: "bamboo-org",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
      ],
    },
    "govern-tamilnadu": {
      id: "govern-tamilnadu",
      name: "Tamilnadu Government",
      logo: "/public/Tamilnadu.png",
      foundedDate: "July 12th, 2025",
      location: "River Side, Tuticorin",
      treesPlanted: "15K",
      hiredPlanters: 75,
      heroImage: "/public/bamboo.jpg",
      plantedTrees: [
        {
          id: "neem-org",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "banyan-org",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },

        {
          id: "pine-org",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
        {
          id: "oak-org",
          name: "Oak Tree",
          species: "Quercus robur",
          image: "/public/oak.jpg",
        },
      ],
    },
  };

  // Sample data for volunteers
  const volunteers: Record<string, VolunteerData> = {
    "rahul-kumar": {
      id: "rahul-kumar",
      name: "Rahul Kumar",
      heroImage: "/public/oak.jpg",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      treesPlanted: 35,
      memberSince: "April 30th, 2022",
      location: "Teachers Colony, Tuticorin",
      organizationId: "hcl-foundation",
      plantedTrees: [
        {
          id: "neem-1",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "banyan-1",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },
        {
          id: "bamboo-1",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
        {
          id: "pine-1",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
      ],
    },
    "cory-fisher": {
      id: "cory-fisher",
      name: "Cory Fisher",
      heroImage: "/public/pine.jpg",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      treesPlanted: 35,
      memberSince: "March 15th, 2025",
      location: "Green Valley, Chennai",
      organizationId: "rotary-club",
      plantedTrees: [
        {
          id: "neem-1",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "banyan-1",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },
        {
          id: "oak-1",
          name: "Oak Tree",
          species: "Quercus Robur",
          image: "/public/oak.jpg",
        },
        {
          id: "bamboo-1",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
      ],
    },
    "albert-flores": {
      id: "albert-flores",
      name: "Albert Flores",
      heroImage: "/public/neem.jpg",
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
      treesPlanted: 35,
      memberSince: "May 10th, 2025",
      location: "Central Park, Tuticorin",
      organizationId: "tuticorin-corporation",
      plantedTrees: [
        {
          id: "bamboo-1",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
        {
          id: "banyan-1",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },
        {
          id: "oak-1",
          name: "Oak Tree",
          species: "Quercus Robur",
          image: "/public/oak.jpg",
        },
        {
          id: "pine-1",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
      ],
    },
    "bessie-cooper": {
      id: "bessie-cooper",
      name: "Bessie Cooper",
      heroImage: "/public/banyan.jpg",
      photo:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      treesPlanted: 35,
      memberSince: "June 5th, 2025",
      location: "Beach Road, Tuticorin",
      organizationId: "lions-club",
      plantedTrees: [
        {
          id: "neem-1",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "bamboo-1",
          name: "Bamboo Tree",
          species: "Bambusa Vulgaris",
          image: "/public/bamboo.jpg",
        },
        {
          id: "oak-1",
          name: "Oak Tree",
          species: "Quercus Robur",
          image: "/public/oak.jpg",
        },
        {
          id: "pine-1",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
      ],
    },
    "dianne-russell": {
      id: "dianne-russell",
      name: "Dianne Russell",
      heroImage: "/public/bamboo.jpg",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      treesPlanted: 35,
      memberSince: "July 12th, 2025",
      location: "River Side, Tuticorin",
      organizationId: "govern-tamilnadu",
      plantedTrees: [
        {
          id: "neem-1",
          name: "Neem Tree",
          species: "Azadirachta Indica",
          image: "/public/neem.jpg",
        },
        {
          id: "banyan-1",
          name: "Banyan Tree",
          species: "Ficus Benghalensis",
          image: "/public/banyan.jpg",
        },
        {
          id: "oak-1",
          name: "Oak Tree",
          species: "Quercus Robur",
          image: "/public/oak.jpg",
        },
        {
          id: "pine-1",
          name: "Pine Tree",
          species: "Pinus Sylvestris",
          image: "/public/pine.jpg",
        },
      ],
    },
  };

  // Sample data for the detailed tree list view
  const detailedTrees: TreeListData[] = [
    {
      id: "T171",
      name: "Neem",
      species: "Azadirachta Indica",
      location: "Location 171",
      plantedOn: "Dec 23, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Due",
      nextinspectiondate: "April 27,2025",
    },
    {
      id: "T035",
      name: "Banyan",
      species: "Ficus Benghalensis",
      location: "Location 35",
      plantedOn: "Dec 23, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Completed",
      nextinspectiondate: "April 27,2025",
    },
    // More trees...
    {
      id: "T045",
      name: "Oak",
      species: "Quercus Robur",
      location: "Location 45",
      plantedOn: "Dec 27, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Due",
      nextinspectiondate: "April 27,2025",
    },
    {
      id: "T140",
      name: "Pine",
      species: "Pinus Sylvestris",
      location: "Location 140",
      plantedOn: "Dec 25, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Completed",
      nextinspectiondate: "April 27,2025",
    },
    {
      id: "T004",
      name: "Bamboo",
      species: "Bambusa Vulgaris",
      location: "Location 4",
      plantedOn: "Dec 20, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Pending",
      nextinspectiondate: "May 05,2025",
    },
    {
      id: "T183",
      name: "Maple",
      species: "Acer Sacchrarum",
      location: "Location 183",
      plantedOn: "Dec 26, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "In Progress",
      nextinspectiondate: "May 2,2025",
    },
    {
      id: "T042",
      name: "Coconut Palm",
      species: "Cocus Nucifera",
      location: "Location 42",
      plantedOn: "Dec 22, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Completed",
      nextinspectiondate: "April 27,2025",
    },
    {
      id: "T111",
      name: "Redwood",
      species: "Sequoia Sempervirens",
      location: "Location 111",
      plantedOn: "Dec 20, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Pending",
      nextinspectiondate: "May 05, 2025",
    },
    {
      id: "T027",
      name: "Cherry Blosssom",
      species: "Prunus Serrulata",
      location: "Location 27",
      plantedOn: "Dec 18, 2023",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Completed",
      nextinspectiondate: "May 05,2025",
    },
    {
      id: "T036",
      name: "Mango",
      species: "Mangifera Grandis",
      location: "Location 36",
      plantedOn: "Mar 3, 2024",
      plantedBy: {
        name: "Philip",
        id: "VT12",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      },
      status: "Pending",
      nextinspectiondate: "May 07,2025",
    },
  ];

  // Function to handle view mode change
  const handleViewModeChange = (mode: "list" | "map") => {
    setViewMode(mode);
    if (mode === "list") {
      setShowImportButton(true);
    } else {
      setShowImportButton(false);
    }
  };

  // Function to handle import click
  const handleImportClick = () => {
    setOpenDialog(true);
  };

  // Function to handle tree click
  const handleTreeClick = (tree: TreeData) => {
    setSelectedTree(tree);
    setCurrentView("tree-details");
  };

  // Function to handle volunteer click
  const handleVolunteerClick = (volunteerId: string) => {
    setSelectedVolunteer(volunteers[volunteerId]);
    setCurrentView("volunteer");
  };

  // Function to handle organization click
  const handleOrganizationClick = (organizationId: string) => {
    setSelectedOrganization(organizations[organizationId]);
    setCurrentView("organization");
  };

  // Function to handle back button
  const handleBack = () => {
    if (currentView === "tree-details") {
      setCurrentView("main");
    } else if (currentView === "volunteer") {
      setCurrentView("tree-details");
    } else if (currentView === "organization") {
      if (selectedVolunteer) {
        setCurrentView("volunteer");
      } else {
        setCurrentView("tree-details");
      }
    }
  };

  // Function to scroll carousel
  const scroll = (
    direction: "left" | "right",
    ref: React.RefObject<HTMLDivElement>
  ) => {
    const container = ref.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    // Update arrow visibility after scroll
    setTimeout(() => {
      if (ref === treescrollRef) {
        setTreeLeftArrowVisible(container.scrollLeft > 0);
      } else if (ref === orgscrollRef) {
        setOrgLeftArrowVisible(container.scrollLeft > 0);
      } else if (ref === volunteerscrollRef) {
        setVolunteerLeftArrowVisible(container.scrollLeft > 0);
      }
    }, 100);
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Due":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination logic
  const paginate = (pageNumber: number) => {
    setIsLoading(true);

    // Simulate loading delay (remove in production)
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsLoading(false);
    }, 300);
  };

  // Get current trees for the page
  const indexOfLastTree = currentPage * itemsPerPage;
  const indexOfFirstTree = indexOfLastTree - itemsPerPage;
  const currentTrees = detailedTrees.slice(indexOfFirstTree, indexOfLastTree);

  // For demo purposes - to show more pages
  const totalPages = 20;

  // Effect to handle scroll visibility - Fixed to handle each container independently
  useEffect(() => {
    const updateScrollVisibility = () => {
      // Check trees scroll
      if (treescrollRef.current) {
        setTreeLeftArrowVisible(treescrollRef.current.scrollLeft > 0);
      }

      // Check organizations scroll
      if (orgscrollRef.current) {
        setOrgLeftArrowVisible(orgscrollRef.current.scrollLeft > 0);
      }

      // Check volunteers scroll
      if (volunteerscrollRef.current) {
        setVolunteerLeftArrowVisible(volunteerscrollRef.current.scrollLeft > 0);
      }
    };

    // Create individual scroll handlers for each container
    const handleTreesScroll = () => {
      if (treescrollRef.current) {
        setTreeLeftArrowVisible(treescrollRef.current.scrollLeft > 0);
      }
    };

    const handleOrgsScroll = () => {
      if (orgscrollRef.current) {
        setOrgLeftArrowVisible(orgscrollRef.current.scrollLeft > 0);
      }
    };

    const handleVolunteersScroll = () => {
      if (volunteerscrollRef.current) {
        setVolunteerLeftArrowVisible(volunteerscrollRef.current.scrollLeft > 0);
      }
    };

    // Add event listeners
    const treesContainer = treescrollRef.current;
    const orgsContainer = orgscrollRef.current;
    const volunteersContainer = volunteerscrollRef.current;

    if (treesContainer) {
      treesContainer.addEventListener("scroll", handleTreesScroll);
    }
    if (orgsContainer) {
      orgsContainer.addEventListener("scroll", handleOrgsScroll);
    }
    if (volunteersContainer) {
      volunteersContainer.addEventListener("scroll", handleVolunteersScroll);
    }

    // Initial check
    updateScrollVisibility();

    // Cleanup
    return () => {
      if (treesContainer) {
        treesContainer.removeEventListener("scroll", handleTreesScroll);
      }
      if (orgsContainer) {
        orgsContainer.removeEventListener("scroll", handleOrgsScroll);
      }
      if (volunteersContainer) {
        volunteersContainer.removeEventListener(
          "scroll",
          handleVolunteersScroll
        );
      }
    };
  }, []);

  // Tree Details View Component
  const TreeDetailsView = () => {
    if (!selectedTree) return <div>Loading...</div>;

    const volunteer = volunteers[selectedTree.volunteerId || ""];
    const organization = organizations[selectedTree.organizationId || ""];

    return (
      <div className="min-h-screen bg-[#0e3624] pt-6">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Trees</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="relative">
              <div className="h-80 overflow-hidden">
                <img
                  src={selectedTree.image || "/placeholder.svg"}
                  alt={selectedTree.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <button
                onClick={() => setIsImageExpanded(true)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{selectedTree.name}</h1>
                <p className="text-lg opacity-90">{selectedTree.species}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Planted on {selectedTree.plantedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedTree.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Weight className="w-4 h-4" />
                    <span>{selectedTree.currentWeight}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    <span>{selectedTree.projectedWeight}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer and Organization Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Volunteer Card */}
            {volunteer && (
              <div
                className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  handleVolunteerClick(selectedTree.volunteerId || "")
                }
              >
                <div className="flex items-center gap-4">
                  <img
                    src={volunteer.avatar || volunteer.photo}
                    alt={volunteer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Volunteer</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {volunteer.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Card */}
            {organization && (
              <div
                className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  handleOrganizationClick(selectedTree.organizationId || "")
                }
              >
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Associated Organisation
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {organization.name}
                      </p>
                      <p className="text-sm text-green-600">
                        {organization.treesPlanted} Trees Planted
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Volunteer Profile View Component
  const VolunteerProfileView = () => {
    if (!selectedVolunteer) return <div>Loading...</div>;

    const organization = organizations[selectedVolunteer.organizationId || ""];

    return (
      <div className="min-h-screen bg-[#0e3624] pt-6">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="relative">
              <div className="h-48 overflow-hidden">
                <img
                  src={
                    selectedVolunteer.heroImage ||
                    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  }
                  alt="Volunteer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div className="absolute -bottom-12 left-6">
                <img
                  src={selectedVolunteer.avatar || selectedVolunteer.photo}
                  alt={selectedVolunteer.name}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              </div>
            </div>
            <div className="pt-16 px-6 pb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedVolunteer.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {selectedVolunteer.treesPlanted && (
                  <div className="flex items-center gap-1">
                    <TreePine className="w-4 h-4" />
                    <span>{selectedVolunteer.treesPlanted} Trees Planted</span>
                  </div>
                )}
                {selectedVolunteer.memberSince && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Planted since {selectedVolunteer.memberSince}</span>
                  </div>
                )}
                {selectedVolunteer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedVolunteer.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trees Grid */}
          {selectedVolunteer.plantedTrees &&
            selectedVolunteer.plantedTrees.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Planted Trees</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedVolunteer.plantedTrees.map((tree, index) => (
                    <div key={tree.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={tree.image || "/placeholder.svg"}
                          alt={tree.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-sm">{tree.name}</p>
                        <p className="text-xs text-gray-500">{tree.species}</p>
                      </div>
                      {/* {index === selectedVolunteer.plantedTrees.length - 1 && (
                        <div className="absolute top-2 right-2">
                          <ChevronRight className="w-5 h-5 text-white bg-black/50 rounded-full p-1" />
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Organization Card */}
          {organization && (
            <div
              className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                handleOrganizationClick(selectedVolunteer.organizationId || "")
              }
            >
              <p className="text-sm text-gray-500 mb-2">
                Associated Organisation
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {organization.name}
                  </p>
                  <p className="text-sm text-green-600">
                    {organization.treesPlanted} Trees Planted
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="text-center text-gray-500 py-8">
              <p>No Data Yet</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Organization Profile View Component
  const OrganizationProfileView = () => {
    if (!selectedOrganization) return <div>Loading...</div>;

    return (
      <div className="min-h-screen bg-[#0e3624] pt-6">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="relative">
              <div className="h-48 overflow-hidden">
                <img
                  src={
                    selectedOrganization.heroImage ||
                    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  }
                  alt="Organization"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedOrganization.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {selectedOrganization.foundedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Organisation since {selectedOrganization.foundedDate}
                    </span>
                  </div>
                )}
                {selectedOrganization.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedOrganization.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trees Grid */}
          {selectedOrganization.plantedTrees &&
            selectedOrganization.plantedTrees.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedOrganization.plantedTrees.map((tree, index) => (
                    <div key={tree.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={tree.image || "/placeholder.svg"}
                          alt={tree.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-sm">{tree.name}</p>
                        <p className="text-xs text-gray-500">{tree.species}</p>
                      </div>
                      {index ===
                        selectedOrganization.plantedTrees.length - 1 && (
                        <div className="absolute top-2 right-2">
                          <ChevronRight className="w-5 h-5 text-white bg-black/50 rounded-full p-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Stats Section */}
          {(selectedOrganization.hiredPlanters ||
            selectedOrganization.treesPlanted) && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {selectedOrganization.hiredPlanters && (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {selectedOrganization.hiredPlanters}
                  </div>
                  <div className="text-sm text-gray-600">Hired Planters</div>
                </div>
              )}

              {selectedOrganization.treesPlanted && (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <div className="flex justify-center mb-2">
                    <TreePine className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {selectedOrganization.treesPlanted}
                  </div>
                  <div className="text-sm text-gray-600">Trees Planted</div>
                </div>
              )}
            </div>
          )}

          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="text-center text-gray-500 py-8">
              <p>No Data Yet</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main View Component
  const MainView = () => {
    return (
      <div className="p-6 bg-gray-50 min-h-screen w-full overflow-x-hidden">
        <style
          dangerouslySetInnerHTML={{
            __html: `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `,
          }}
        />
        {/* Top Controls and Title */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Tree Locations</h1>
            <p className="text-gray-500 text-sm">
              View and manage tree plantations across Tuticorin district
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-md shadow-sm border flex">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className="rounded-r-none"
              >
                <List size={18} className="mr-1" /> List
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("map")}
                className="rounded-l-none"
              >
                <MapPin size={18} className="mr-1" /> Map
              </Button>
            </div>

            {showImportButton && (
              <Button
                size="sm"
                onClick={handleImportClick}
                className="border border-[#4a695b] text-[white] hover:bg-[#4a695b]/9"
              >
                <Import size={18} className="mr-1" /> Import Excel
              </Button>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListFilter size={18} className="mr-1" /> Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-medium mb-2">Filter Options</h3>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Tree Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Neem", "Banyan", "Oak", "Pine"].map((type) => (
                        <Badge
                          key={type}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-white"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Ward</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Ward 1", "Ward 2", "Ward 3"].map((ward) => (
                        <Badge
                          key={ward}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-white"
                        >
                          {ward}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <Button variant="outline" size="sm">
                      Reset
                    </Button>
                    <Button size="sm">Apply Filters</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Import Trees Data</DialogTitle>
              <DialogDescription>
                Upload an Excel file containing tree information.
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
              {/* Tree Count */}
              <label className="sm:col-span-3 text-sm font-medium mt-2">
                Tree Count
              </label>
              <Input className="sm:col-span-9" placeholder="1" />
              {/* Description */}
              <label className="sm:col-span-3 text-sm font-medium mt-2">
                Description
              </label>
              <Textarea
                className="sm:col-span-9"
                placeholder="Describe the trees"
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
              <div className="sm:col-span-3" />{" "}
              {/* Empty space for alignment */}
              <Button
                type="submit"
                className="sm:col-span-9 text-white hover:opacity-90 transition"
                style={{ backgroundColor: "#0e3624" }}
              >
                Import Data
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Tabs
          value={viewMode}
          onValueChange={(value) =>
            handleViewModeChange(value as "list" | "map")
          }
        >
          <TabsContent value="map">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[500px] flex flex-col gap-6 border border-gray-200 rounded-md p-4">
                {/* Trees Carousel */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Latest Featured Trees
                  </h2>
                  <div className="relative">
                    {/* Conditionally shown left arrow */}
                    {treeLeftArrowVisible && (
                      <button
                        onClick={() => scroll("left", treescrollRef)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/40 rounded-full p-2 font-bold"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                    )}

                    <div
                      ref={treescrollRef}
                      className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide"
                    >
                      {trees.map((tree) => (
                        <div
                          key={tree.id}
                          onClick={() => handleTreeClick(tree)}
                          className="cursor-pointer"
                        >
                          <Card
                            className="bg-[#194f33] text-white rounded-lg shadow overflow-hidden flex-shrink-0"
                            style={{ width: "140px" }}
                          >
                            <div
                              className="h-32 overflow-hidden rounded-xl border-8"
                              style={{ borderColor: "#194f33" }}
                            >
                              <img
                                src={tree.image || "/placeholder.svg"}
                                alt={tree.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="pt-2 pb-2 px-3">
                              <h3 className="text-base font-semibold leading-tight">
                                {tree.name}
                              </h3>
                              <p className="text-xs mt-1">{tree.species}</p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => scroll("right", treescrollRef)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/40 rounded-full p-2"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Organizations */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Featured Organisations
                  </h2>
                  <div className="relative">
                    {orgLeftArrowVisible && (
                      <button
                        onClick={() => scroll("left", orgscrollRef)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/40 rounded-full p-2"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                    )}

                    <div
                      ref={orgscrollRef}
                      className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide"
                    >
                      {Object.values(organizations).map((org) => (
                        <Card
                          key={org.id}
                          className="bg-[#194f33] text-white rounded-lg shadow overflow-hidden flex-shrink-0"
                          style={{ width: "140px" }}
                        >
                          <div
                            className="h-32 overflow-hidden rounded-xl border-8"
                            style={{ borderColor: "#194f33" }}
                          >
                            <img
                              src={org.logo || "/placeholder.svg"}
                              alt={org.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="pt-2 pb-2 px-3">
                            <h3 className="text-sm font-semibold leading-tight">
                              {org.name}
                            </h3>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <button
                      onClick={() => scroll("right", orgscrollRef)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/40 rounded-full p-2"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Volunteers */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">New Volunteers</h2>
                  <div className="relative">
                    {volunteerLeftArrowVisible && (
                      <button
                        onClick={() => scroll("left", volunteerscrollRef)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/40 rounded-full p-2"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                    )}

                    <div
                      ref={volunteerscrollRef}
                      className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide"
                    >
                      {Object.values(volunteers).map((volunteer) => (
                        <Card
                          key={volunteer.id}
                          className="bg-[#194f33] text-white rounded-lg shadow overflow-hidden flex-shrink-0"
                          style={{ width: "140px" }}
                        >
                          <div
                            className="h-32 overflow-hidden rounded-xl border-8"
                            style={{ borderColor: "#194f33" }}
                          >
                            <img
                              src={volunteer.photo || "/placeholder.svg"}
                              alt={volunteer.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="pt-2 pb-2 px-3">
                            <h3 className="text-base font-semibold leading-tight">
                              {volunteer.name}
                            </h3>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <button
                      onClick={() => scroll("right", volunteerscrollRef)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/40 rounded-full p-2"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                
              </div>

              {/* Map View */}
              <div className="w-full lg:w-2/3 min-h-[600px]">
                <div className="bg-white p-4 rounded-md shadow mb-6 h-[800px]">
                  <h2 className="text-lg font-semibold mb-4">Tree Map View</h2>
                  <div className="h-[700px] rounded-md overflow-hidden">
                    <MapContainer
                      center={[10.765, 78.818]}
                      zoom={13}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker position={[10.765, 78.818]} icon={markerIcon}>
                        <Popup>3 trees in this location</Popup>
                      </Marker>
                      <Marker position={[10.775, 78.83]} icon={markerIcon}>
                        <Popup>7 trees here</Popup>
                      </Marker>
                      <Marker position={[10.758, 78.822]} icon={markerIcon}>
                        <Popup>2 trees in this area</Popup>
                      </Marker>
                      <Marker position={[10.75, 78.812]} icon={markerIcon}>
                        <Popup>5 dead/diseased trees</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            {/* Detailed Tree List View - This is what shows when "List" is clicked */}
            <div className="bg-white rounded-md shadow mb-6">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Left Side: Title and count */}
                  <div>
                    <h2 className="text-lg font-semibold">All Trees</h2>
                    <p className="text-sm text-gray-500">
                      Total trees: {detailedTrees.length}
                    </p>
                  </div>

                  {/* Right Side: Buttons */}
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100">
                      Species
                      <ListFilter className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100">
                      Location
                      <ListFilter className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <Search
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4"
                        style={{ color: "#9da4b0" }}
                      />
                      <input
                        type="text"
                        placeholder="Search Trees..."
                        className="pl-8 pr-3 py-1 text-sm border rounded text-black placeholder-[#9da4b0]"
                      />
                    </div>
                    <button className="p-2 border rounded hover:bg-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13v6a1 1 0 01-2 0v-6a1 1 0 00-.293-.707L5.293 6.707A1 1 0 015 6V4z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading...</p>
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[100px]">Tree ID</TableHead>
                        <TableHead>Tree Name</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Planted On</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Next Inspection Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Planted By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTrees.map((tree) => (
                        <TableRow key={tree.id}>
                          <TableCell className="font-medium">
                            {tree.id}
                          </TableCell>
                          <TableCell>{tree.name}</TableCell>
                          <TableCell>{tree.species}</TableCell>
                          <TableCell>{tree.plantedOn}</TableCell>
                          <TableCell>{tree.location}</TableCell>
                          <TableCell>{tree.nextinspectiondate}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                tree.status
                              )}`}
                            >
                              {tree.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={tree.plantedBy.image || "/placeholder.svg"}
                                alt={tree.plantedBy.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="text-sm leading-tight">
                                <div className="font-medium text-gray-900">
                                  {tree.plantedBy.name}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  ID: {tree.plantedBy.id}
                                </div>
                              </div>
                            </div>
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
                </div>

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
                    onClick={() =>
                      paginate(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages || isLoading}
                    className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case "main":
        return <MainView />;
      case "tree-details":
        return <TreeDetailsView />;
      case "volunteer":
        return <VolunteerProfileView />;
      case "organization":
        return <OrganizationProfileView />;
      default:
        return <MainView />;
    }
  };

  return (
    <div className="w-full">
      {renderCurrentView()}

      {/* Image Modal */}
      {isImageExpanded && selectedTree && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedTree.image || "/placeholder.svg"}
              alt={selectedTree.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeApp;
