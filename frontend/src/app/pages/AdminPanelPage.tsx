import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { FileText, Users, Tag, Flag, LogOut, Check, X } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { StatusBadge } from "../components/StatusBadge";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { currentUser, getPendingEvents, mockEvents, setCurrentUser, Event } from "../data/mockData";
import { toast } from "sonner";

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'users' | 'categories' | 'reports'>('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Admin') {
      navigate("/login");
    }
  }, [navigate]);

  if (!currentUser || currentUser.role !== 'Admin') {
    return null;
  }

  const pendingEvents = getPendingEvents();
  const allEvents = mockEvents;

  const handleApprove = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.status = 'Approved';
      toast.success(`Event "${event.title}" approved!`);
    }
  };

  const handleRejectClick = (event: Event) => {
    setSelectedEvent(event);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedEvent || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    selectedEvent.status = 'Rejected';
    selectedEvent.rejectionReason = rejectionReason;
    toast.success(`Event "${selectedEvent.title}" rejected`);
    
    setRejectDialogOpen(false);
    setSelectedEvent(null);
    setRejectionReason("");
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
            <h2 className="text-sm text-muted-foreground mb-4">ADMIN PANEL</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Pending review</span>
                {pendingEvents.length > 0 && (
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                    {pendingEvents.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>All events</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'users'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <Tag className="h-4 w-4" />
                <span>Categories</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'hover:bg-gray-50 text-muted-foreground'
                }`}
              >
                <Flag className="h-4 w-4" />
                <span>Reports</span>
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
          {activeTab === 'pending' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Pending Review</h1>
                <p className="text-muted-foreground">
                  Review and approve or reject submitted events
                </p>
              </div>

              {pendingEvents.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingEvents.map((event) => (
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
                          <TableCell>{event.organizer.name}</TableCell>
                          <TableCell>
                            <CategoryBadge category={event.category} />
                          </TableCell>
                          <TableCell>
                            {event.submittedDate && format(event.submittedDate, 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(event.id)}
                                className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectClick(event)}
                                className="border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
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
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>
                    No pending events
                  </h3>
                  <p className="text-muted-foreground">
                    All events have been reviewed
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'all' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>All Events</h1>
                <p className="text-muted-foreground">
                  View and manage all events in the system
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allEvents.map((event) => (
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
                        <TableCell>{event.organizer.name}</TableCell>
                        <TableCell>
                          <CategoryBadge category={event.category} />
                        </TableCell>
                        <TableCell>
                          {format(event.dateStart, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={event.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Users</h1>
                <p className="text-muted-foreground">
                  Manage system users
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">User management interface</p>
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Categories</h1>
                <p className="text-muted-foreground">
                  Manage event categories
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Category management interface</p>
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Reports</h1>
                <p className="text-muted-foreground">
                  View reported content
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No reports at this time</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this event. The organizer will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEvent && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm" style={{ fontWeight: 600 }}>{selectedEvent.title}</p>
                <p className="text-xs text-muted-foreground">by {selectedEvent.organizer.name}</p>
              </div>
            )}
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this event cannot be approved..."
                className="mt-2 min-h-24"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}