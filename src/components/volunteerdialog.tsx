
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AssignVolunteerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerId?: string;
  volunteerName?: string;
}

const AssignVolunteerDialog: React.FC<AssignVolunteerDialogProps> = ({
  open,
  onOpenChange,
  volunteerId,
  volunteerName,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Assignment submitted');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Volunteer</DialogTitle>
          <DialogDescription>
            View, add and manage volunteers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Volunteer/Organisation Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Volunteer/Organisation Name
            </label>
            <Input 
              defaultValue={volunteerName || "Sahul Kumar"}
              placeholder="Enter volunteer/organisation name"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the name of the volunteer/Organisation
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <Input 
              defaultValue="+91-9876543210"
              placeholder="Enter phone number"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the Phone Number of Volunteer
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input 
              type="email"
              defaultValue="rahul@gmail.com"
              placeholder="Enter email address"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the Email of Volunteer
            </p>
          </div>

          {/* Scheme Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Scheme Name
            </label>
            <Input 
              defaultValue="Miyawaki afforestation Rashtra Paryavara"
              placeholder="Enter scheme name"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the name of the assignment
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea 
              defaultValue="Assigning volunteer to plant trees near the south side of the harbour"
              placeholder="Write a clear description for the assignment"
              rows={3}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Location
            </label>
            <div className="flex items-center gap-2">
              <Input 
                defaultValue="Lakshmipet Colony, Sector 12 Harbour, Tuticorin"
                placeholder="Enter location"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                + Add Locations
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Specify the location for the assignment
            </p>
          </div>

          {/* Tree Species */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tree Species
            </label>
            <div className="flex items-center gap-2">
              <Select defaultValue="neem">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select tree species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neem">Neem</SelectItem>
                  <SelectItem value="banyan">Banyan</SelectItem>
                  <SelectItem value="oak">Oak</SelectItem>
                  <SelectItem value="pine">Pine</SelectItem>
                  <SelectItem value="mango">Mango</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="banyan">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select second species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neem">Neem</SelectItem>
                  <SelectItem value="banyan">Banyan</SelectItem>
                  <SelectItem value="oak">Oak</SelectItem>
                  <SelectItem value="pine">Pine</SelectItem>
                  <SelectItem value="mango">Mango</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Specify the type of species of the plant
            </p>
          </div>

          {/* Number Of Trees */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number Of Trees
            </label>
            <Input 
              type="number"
              defaultValue="20"
              placeholder="Enter number of trees"
            />
            <p className="text-xs text-gray-500 mt-1">
              Specify the number of trees for the assignment
            </p>
          </div>

          {/* Inspection Cycle */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Inspection Cycle
            </label>
            <Select defaultValue="every-week">
              <SelectTrigger>
                <SelectValue placeholder="Select inspection cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="every-week">Every Week</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Specify the inspection cycle for the assignment
            </p>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <Input 
                type="date"
                defaultValue="2025-04-22"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the start date for the assignment
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                End Date
              </label>
              <Input 
                type="date"
                defaultValue="2025-04-22"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the end date for the assignment
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit"
              className="bg-[#0e3624] hover:bg-[#0e3624]/90 text-white px-8"
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignVolunteerDialog;