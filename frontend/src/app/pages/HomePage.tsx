import { useState } from "react";
import { useNavigate } from "react-router";
import { Grid3x3, MapIcon, Calendar as CalendarIcon, Search } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { EventCard } from "../components/EventCard";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { getApprovedEvents, EventCategory } from "../data/mockData";

export function HomePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const events = getApprovedEvents();

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    
    const now = new Date();
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && event.dateStart.toDateString() === now.toDateString()) ||
      (dateFilter === "week" && event.dateStart.getTime() < now.getTime() + 7 * 24 * 60 * 60 * 1000) ||
      (dateFilter === "month" && event.dateStart.getTime() < now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleViewMap = () => {
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar showSearch={true} onSearchChange={setSearchQuery} searchValue={searchQuery} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl mb-4" style={{ fontWeight: 700 }}>
              All university events in one place
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover, attend, and organize events happening at your university. 
              Stay connected with your campus community.
            </p>
            <Button
              size="lg"
              className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
              onClick={() => {
                document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore events
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-9 bg-white border-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white border-gray-300">
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
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white border-gray-300">
                <CalendarIcon className="h-4 w-4 mr-2" />
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
      </div>

      {/* Events Section */}
      <div id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl" style={{ fontWeight: 600 }}>
            Upcoming Events ({filteredEvents.length})
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
              className={view === 'grid' ? 'bg-primary text-white' : ''}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={view === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={handleViewMap}
              className={view === 'map' ? 'bg-primary text-white' : ''}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {/* Event Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl mb-2" style={{ fontWeight: 600 }}>No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
