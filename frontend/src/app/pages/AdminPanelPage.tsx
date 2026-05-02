import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router";
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
import { getPendingEvents, mockEvents, Event, mockUsers, mockCategories, User, UserRole } from "../data/mockData";
import { DashboardSidebar, SidebarTab } from "../components/DashboardSidebar";
import { EditUserModal } from "../components/EditUserModal";
import { EditCategoryModal } from "../components/EditCategoryModal";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SidebarTab>('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);

  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<any | null>(null);

  const [refresh, setRefresh] = useState(0);

  const { usuario, isLoading, logout } = useAuth();

  if (isLoading) return null;
  if (!usuario || usuario.rol !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const pendingEvents = getPendingEvents();
  const allEvents = mockEvents;

  const handleApprove = async (eventId: string) => {
    /* 
    // CONEXIÓN CON BACKEND
    try {
      const response = await fetch(`${API_URL}/eventos/${eventId}/aprobar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al aprobar');
      toast.success("Evento aprobado!");
    } catch (error) {
      toast.error("Error al conectar con el servidor");
      return;
    }
    */

    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.status = 'Approved';
      toast.success(`Event "${event.title}" approved!`);
      setRefresh(prev => prev + 1);
    }
  };

  const handleRejectClick = (event: Event) => {
    setSelectedEvent(event);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedEvent || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    /* 
    // CONEXIÓN CON BACKEND
    try {
      const response = await fetch(`${API_URL}/eventos/${selectedEvent.id}/rechazar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ observacion: rejectionReason })
      });
      if (!response.ok) throw new Error('Error al rechazar');
      toast.success("Evento rechazado");
    } catch (error) {
      toast.error("Error al procesar el rechazo");
      return;
    }
    */

    selectedEvent.status = 'Rejected';
    selectedEvent.rejectionReason = rejectionReason;
    toast.success(`Event "${selectedEvent.title}" rejected`);

    setRejectDialogOpen(false);
    setSelectedEvent(null);
    setRejectionReason("");
    setRefresh(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const handleEditUserClick = (user: User) => {
    setSelectedUserToEdit(user);
    setEditUserDialogOpen(true);
  };

  const handleSaveUserRole = async (userId: string, newRole: UserRole) => {
    /* 
    // CONEXIÓN CON BACKEND (Ejemplo de implementación)
    try {
      const response = await fetch(`${API_URL}/admin/usuarios/${userId}/rol`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rol: newRole })
      });
      if (!response.ok) throw new Error('Error al actualizar rol');
    } catch (error) {
      toast.error("Error al actualizar el rol");
      return;
    }
    */

    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      toast.success("Rol de usuario actualizado");
      setRefresh(prev => prev + 1);
    }
  };

  const handleEditCategoryClick = (category: any) => {
    setSelectedCategoryToEdit(category);
    setEditCategoryDialogOpen(true);
  };

  const handleSaveCategory = async (categoryId: string | null, newName: string, newDescription: string) => {
    /* 
    // CONEXIÓN CON BACKEND
    try {
      const url = categoryId ? `${API_URL}/categorias/${categoryId}` : `${API_URL}/categorias`;
      const method = categoryId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: newName, descripcion: newDescription })
      });
      if (!response.ok) throw new Error('Error al guardar categoría');
    } catch (error) {
      toast.error("Error al procesar la categoría");
      return;
    }
    */

    if (categoryId) {
      const category = mockCategories.find(c => c.id === categoryId);
      if (category) {
        category.name = newName as any;
        category.description = newDescription;
        toast.success("Categoría actualizada");
      }
    } else {
      const newCategory = {
        id: String(mockCategories.length + 1),
        name: newName,
        description: newDescription,
        eventCount: 0,
        isActive: true
      };
      mockCategories.push(newCategory);
      toast.success("Categoría creada");
    }
    setRefresh(prev => prev + 1);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      /* 
      // CONEXIÓN CON BACKEND
      try {
        const response = await fetch(`${API_URL}/admin/usuarios/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar');
      } catch (error) {
        toast.error("Error al eliminar el usuario");
        return;
      }
      */

      const index = mockUsers.findIndex(u => u.id === userId);
      if (index > -1) {
        mockUsers.splice(index, 1);
        toast.success("Usuario eliminado");
        setRefresh(prev => prev + 1);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      /* 
      // CONEXIÓN CON BACKEND
      try {
        const response = await fetch(`${API_URL}/categorias/${categoryId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar');
      } catch (error) {
        toast.error("Error al eliminar la categoría");
        return;
      }
      */

      const index = mockCategories.findIndex(c => c.id === categoryId);
      if (index > -1) {
        mockCategories.splice(index, 1);
        toast.success("Categoría eliminada");
        setRefresh(prev => prev + 1);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    // Lógica para Mock (Actual)
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      const newStatus = user.isActive === false ? true : false;

      /* 
      // CONEXIÓN CON BACKEND 
      try {
        const response = await fetch(`${API_URL}/admin/usuarios/${userId}/estado`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ activo: newStatus })
        });
        if (!response.ok) throw new Error('Error al actualizar estado');
        toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'}`);
      } catch (error) {
        toast.error("No se pudo cambiar el estado del usuario");
        return;
      }
      */

      user.isActive = newStatus;
      toast.success(`Usuario ${user.isActive ? 'activado' : 'desactivado'}`);
      setRefresh(prev => prev + 1);
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    // Lógica para Mock (Actual)
    const category = mockCategories.find(c => c.id === categoryId);
    if (category) {
      const newStatus = category.isActive === false ? true : false;

      /* 
      // CONEXIÓN CON BACKEND 
      try {
        const response = await fetch(`${API_URL}/admin/categorias/${categoryId}/estado`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ activo: newStatus })
        });
        if (!response.ok) throw new Error('Error al actualizar estado');
        toast.success(`Categoría ${newStatus ? 'activada' : 'desactivada'}`);
      } catch (error) {
        toast.error("No se pudo cambiar el estado de la categoría");
        return;
      }
      */

      category.isActive = newStatus;
      toast.success(`Categoría ${category.isActive ? 'activada' : 'desactivada'}`);
      setRefresh(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingEventsCount={pendingEvents.length} />

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
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
                          <TableCell>{event.organizers.map(o => o.name).join(', ')}</TableCell>
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

              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
                        <TableCell>{event.organizers.map(o => o.name).join(', ')}</TableCell>
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
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Usuarios</h1>
                <p className="text-muted-foreground">
                  Gestionar usuarios del sistema
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell style={{ fontWeight: 500 }}>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'Organizer' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.isActive !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleToggleUserStatus(user.id)}>
                            {user.isActive !== false ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditUserClick(user)}>Editar</Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteUser(user.id)}>Eliminar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Categorías</h1>
                  <p className="text-muted-foreground">
                    Gestionar categorías de eventos
                  </p>
                </div>
                <Button
                  className="bg-primary text-white"
                  onClick={() => {
                    setSelectedCategoryToEdit(null);
                    setEditCategoryDialogOpen(true);
                  }}
                >
                  Nueva Categoría
                </Button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Eventos Totales</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <CategoryBadge category={category.name as any} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{category.description}</TableCell>
                        <TableCell>{category.eventCount}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${category.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {category.isActive !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleToggleCategoryStatus(category.id)}>
                            {category.isActive !== false ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditCategoryClick(category)}>Editar</Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCategory(category.id)}>Eliminar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <p className="text-xs text-muted-foreground">by {selectedEvent.organizers.map(o => o.name).join(', ')}</p>
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

      {/* Modales de edición */}
      <EditUserModal
        isOpen={editUserDialogOpen}
        onClose={() => setEditUserDialogOpen(false)}
        user={selectedUserToEdit}
        onSave={handleSaveUserRole}
      />
      <EditCategoryModal
        isOpen={editCategoryDialogOpen}
        onClose={() => setEditCategoryDialogOpen(false)}
        category={selectedCategoryToEdit}
        onSave={handleSaveCategory}
      />
    </div>
  );
}