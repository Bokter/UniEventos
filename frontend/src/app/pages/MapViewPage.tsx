import { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { InteractiveMap } from "../components/InteractiveMap";
import { getApprovedEvents } from "../data/mockData";

export function MapViewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const events = getApprovedEvents();

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    
    const now = new Date();
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && event.dateStart.toDateString() === now.toDateString()) ||
      (dateFilter === "week" && event.dateStart.getTime() < now.getTime() + 7 * 24 * 60 * 60 * 1000) ||
      (dateFilter === "month" && event.dateStart.getTime() < now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return matchesCategory && matchesDate;
  });

  // Calculate center of all markers
  const center: [number, number] = [
    filteredEvents.reduce((sum, e) => sum + e.location.lat, 0) / filteredEvents.length || 40.7580,
    filteredEvents.reduce((sum, e) => sum + e.location.lng, 0) / filteredEvents.length || -73.9855
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar showSearch={false} />
      
      <div className="flex-1 flex">
        {/* Filter Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontWeight: 600 }}>Filters</h2>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Close Map
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-white border-gray-300">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full bg-white border-gray-300">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm mb-3" style={{ fontWeight: 600 }}>
                Events on Map ({filteredEvents.length})
              </h3>
              <div className="space-y-3">
                {filteredEvents.slice(0, 10).map(event => (
                  <Link
                    key={event.id}
                    to={`/event/${event.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm line-clamp-1" style={{ fontWeight: 600 }}>
                        {event.title}
                      </h4>
                      <CategoryBadge category={event.category} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(event.dateStart, 'MMM d, h:mm a')}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {event.location.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {filteredEvents.length > 0 ? (
            <InteractiveMap events={filteredEvents} center={center} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No events to display on map</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
