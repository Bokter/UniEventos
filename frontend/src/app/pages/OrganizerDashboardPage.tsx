import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Calendar, Plus, Bell, User, FileText, LogOut, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { StatusBadge } from "../components/StatusBadge";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { currentUser, getEventsByOrganizer, setCurrentUser, Event } from "../data/mockData";
import { toast } from "sonner";

export function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'notifications' | 'profile'>('events');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Organizer') {
      navigate("/login");
    }
  }, [navigate]);

  if (!currentUser || currentUser.role !== 'Organizer') {
    return null;
  }

  const organizerEvents = getEventsByOrganizer(currentUser.id);

  const handleEdit = (eventId: string) => {
    toast.info("Edit functionality would open the publish form with existing data");
  };

  const handleCancel = (eventId: string) => {
    toast.success("Event cancelled");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            <h2 className="text-sm text-muted-foreground mb-4">ORGANIZER DASHBOARD</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'events'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>My events</span>
              </button>
              <button
                onClick={() => navigate("/organizer/publish")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 text-muted-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Publish new event</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <User className="h-4 w-4" />
                <span>My profile</span>
              </button>
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-red-50 text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'events' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>My Events</h1>
                  <p className="text-muted-foreground">
                    Manage and track your published events
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/organizer/publish")}
                  className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publish new event
                </Button>
              </div>

              {organizerEvents.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizerEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Link
                              to={`/event/${event.id}`}
                              className="hover:text-accent hover:underline"
                              style={{ fontWeight: 600 }}
                            >
                              {event.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={event.category} />
                          </TableCell>
                          <TableCell>
                            {format(event.dateStart, 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={event.status} />
                            {event.status === 'Rejected' && event.rejectionReason && (
                              <div className="text-xs text-destructive mt-1">
                                Reason: {event.rejectionReason}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(event.id)}
                                disabled={event.status === 'Approved' || event.status === 'Cancelled'}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancel(event.id)}
                                disabled={event.status === 'Cancelled'}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                    No events yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Publish your first event to get started!
                  </p>
                  <Button
                    onClick={() => navigate("/organizer/publish")}
                    className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publish new event
                  </Button>
                </div>
              )}
            </>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>Notifications</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                  No notifications
                </h3>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>My Profile</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl" style={{ fontWeight: 600 }}>{currentUser.name}</h2>
                    <p className="text-muted-foreground">{currentUser.email}</p>
                    <p className="text-sm text-accent">{currentUser.role}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Total Events Published</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>{organizerEvents.length}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Approved Events</label>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>
                      {organizerEvents.filter(e => e.status === 'Approved').length}
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
}