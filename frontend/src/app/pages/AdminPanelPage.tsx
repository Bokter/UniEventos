import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { FileText, Users, Tag, Flag, Check, X } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "../components/Navbar";
import { StatusBadge } from "../components/StatusBadge";
import { CategoryBadge } from "../components/CategoryBadge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { DashboardSidebar, SidebarTab } from "../components/DashboardSidebar";
import { EditUserModal } from "../components/EditUserModal";
import { EditCategoryModal } from "../components/EditCategoryModal";
import { useAuth } from "../../context/AuthContext";
import { eventosApi, usuariosApi, categoriasApi } from "../services/api.service";
import { UserRole } from "../data/mockData";
import { toast } from "sonner";

interface EventoBackend {
  id: number;
  titulo: string;
  categoria: { id: number; nombre: string } | string;
  fecha: string;
  estado: string;
  observacion?: string;
  created_at?: string;
  organizador?: { id: number; nombre_completo: string; email: string };
  coorganizadores?: { id: number; nombre_completo: string; email: string }[];
  [key: string]: unknown;
}

interface UsuarioBackend {
  id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  activo: boolean;
  [key: string]: unknown;
}

interface CategoriaBackend {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  eventCount?: number;
  [key: string]: unknown;
}

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SidebarTab>('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventoBackend | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<any | null>(null);

  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<any | null>(null);

  const [pendingEvents, setPendingEvents] = useState<EventoBackend[]>([]);
  const [allEvents, setAllEvents] = useState<EventoBackend[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioBackend[]>([]);
  const [categorias, setCategorias] = useState<CategoriaBackend[]>([]);

  const { usuario, isLoading, logout } = useAuth();

  // Carga de datos al montar o cambiar de tab
  useEffect(() => {
    if (!usuario || usuario.rol !== 'admin') return;
    
    if (activeTab === 'pending') {
      eventosApi.getPendientes()
        .then(data => setPendingEvents(data as EventoBackend[]))
        .catch(() => toast.error("Error al cargar eventos pendientes"));
    }
    if (activeTab === 'all') {
      eventosApi.getAll()
        .then(data => setAllEvents(data as EventoBackend[]))
        .catch(() => toast.error("Error al cargar los eventos"));
    }
    if (activeTab === 'users') {
      usuariosApi.getAll()
        .then(data => setUsuarios(data as UsuarioBackend[]))
        .catch(() => toast.error("Error al cargar los usuarios"));
    }
    if (activeTab === 'categories') {
      categoriasApi.getAll()
        .then(data => setCategorias(data as CategoriaBackend[]))
        .catch(() => toast.error("Error al cargar las categorías"));
    }
  }, [activeTab, usuario]);

  if (isLoading) return null;
  if (!usuario || usuario.rol !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleApprove = async (eventId: number) => {
    try {
      await eventosApi.aprobar(eventId);
      toast.success("Evento aprobado");
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error: unknown) {
      toast.error((error as Error).message || "Error al aprobar el evento");
    }
  };

  const handleRejectClick = (event: EventoBackend) => {
    setSelectedEvent(event);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedEvent || !rejectionReason.trim()) {
      toast.error("Por favor ingresa un motivo de rechazo");
      return;
    }
    try {
      await eventosApi.rechazar(selectedEvent.id, rejectionReason);
      toast.success(`Evento "${selectedEvent.titulo}" rechazado`);
      setPendingEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
    } catch (error: unknown) {
      toast.error((error as Error).message || "Error al rechazar el evento");
    }
    setRejectDialogOpen(false);
    setSelectedEvent(null);
    setRejectionReason("");
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  void handleLogout;

  const handleEditUserClick = (user: UsuarioBackend) => {
    setSelectedUserToEdit(user);
    setEditUserDialogOpen(true);
  };

  const handleSaveUserRole = async (userId: string, newRole: UserRole) => {
    // Map frontend UserRole enum to backend rol string
    const rolMap: Record<UserRole, string> = {
      Admin: 'admin',
      Organizer: 'organizador',
      Attendee: 'miembro',
    };
    try {
      await usuariosApi.cambiarRol(userId, rolMap[newRole]);
      toast.success("Rol de usuario actualizado");
      setUsuarios(prev =>
        prev.map(u => u.id === Number(userId) ? { ...u, rol: rolMap[newRole] } : u)
      );
    } catch (error: unknown) {
      toast.error((error as Error).message || "Error al actualizar el rol");
    }
  };

  const handleEditCategoryClick = (category: CategoriaBackend) => {
    setSelectedCategoryToEdit(category);
    setEditCategoryDialogOpen(true);
  };

  const handleSaveCategory = async (categoryId: string | null, newName: string, newDescription: string) => {
    try {
      if (categoryId) {
        await categoriasApi.update(categoryId, newName);
        toast.success("Categoría actualizada");
        setCategorias(prev =>
          prev.map(c => c.id === Number(categoryId) ? { ...c, nombre: newName, descripcion: newDescription } : c)
        );
      } else {
        const created = await categoriasApi.create(newName) as CategoriaBackend;
        toast.success("Categoría creada");
        setCategorias(prev => [...prev, created]);
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Error al procesar la categoría");
    }
  };

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await usuariosApi.desactivar(userId);
        toast.success("Usuario desactivado");
      } else {
        await usuariosApi.activar(userId);
        toast.success("Usuario activado");
      }
      setUsuarios(prev =>
        prev.map(u => u.id === userId ? { ...u, activo: !isActive } : u)
      );
    } catch (error: unknown) {
      toast.error((error as Error).message || "No se pudo cambiar el estado del usuario");
    }
  };

  const handleToggleCategoryStatus = async (categoryId: number, isActive: boolean) => {
    try {
      await categoriasApi.update(categoryId, undefined, !isActive);
      toast.success(`Categoría ${!isActive ? 'activada' : 'desactivada'}`);
      setCategorias(prev =>
        prev.map(c => c.id === categoryId ? { ...c, activa: !isActive } : c)
      );
    } catch (error: unknown) {
      toast.error((error as Error).message || "No se pudo cambiar el estado de la categoría");
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
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Eventos Pendientes</h1>
                <p className="text-muted-foreground">
                  Revisa y aprueba o rechaza los eventos enviados
                </p>
              </div>

              {pendingEvents.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Organizador</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Enviado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
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
                              {event.titulo}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {event.organizador?.nombre_completo ?? '—'}
                            {event.coorganizadores && event.coorganizadores.length > 0 && 
                              `, ${event.coorganizadores.map(c => c.nombre_completo).join(', ')}`}
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={event.categoria as any} />
                          </TableCell>
                          <TableCell>
                            {event.created_at ? format(new Date(event.created_at), 'dd/MM/yyyy') : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(event.id)}
                                className="bg-[#1D9E75] hover:bg-[#188c66] text-white"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectClick(event)}
                                className="border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rechazar
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
                    Sin eventos pendientes
                  </h3>
                  <p className="text-muted-foreground">
                    Todos los eventos han sido revisados
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'all' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Todos los Eventos</h1>
                <p className="text-muted-foreground">
                  Visualiza y gestiona todos los eventos del sistema
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Organizador</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
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
                            {event.titulo}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {event.organizador?.nombre_completo ?? '—'}
                          {event.coorganizadores && event.coorganizadores.length > 0 && 
                            ` (+${event.coorganizadores.length})`}
                        </TableCell>
                        <TableCell>
                          <CategoryBadge category={event.categoria as any} />
                        </TableCell>
                          <TableCell>
                            {(() => {
                              if (!event.fecha) return '—';
                              const d = new Date(event.fecha);
                              return isNaN(d.getTime()) ? 'Fecha inválida' : format(d, 'dd/MM/yyyy');
                            })()}
                          </TableCell>
                        <TableCell>
                          <StatusBadge status={event.estado as any} />
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
                    {usuarios.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell style={{ fontWeight: 500 }}>{user.nombre_completo}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.rol === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.rol === 'organizador' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                            {user.rol === 'admin' ? 'Administrador' : user.rol === 'organizador' ? 'Organizador' : 'Asistente'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleToggleUserStatus(user.id, user.activo)}>
                            {user.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditUserClick(user)}>Editar</Button>
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
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorias.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <CategoryBadge category={category.nombre as any} />
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${category.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {category.activa ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleToggleCategoryStatus(category.id, category.activa)}>
                            {category.activa ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditCategoryClick(category)}>Editar</Button>
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
                <h1 className="text-2xl mb-1" style={{ fontWeight: 600 }}>Reportes</h1>
                <p className="text-muted-foreground">
                  Ver contenido reportado
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Sin reportes por el momento</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Evento</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo del rechazo. El organizador verá este mensaje.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEvent && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm" style={{ fontWeight: 600 }}>{selectedEvent.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  por {selectedEvent.organizadores?.map(o => o.nombre_completo).join(', ') ?? '—'}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="rejection-reason">Motivo de rechazo *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué este evento no puede ser aprobado..."
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
              Cancelar
            </Button>
            <Button
              onClick={handleRejectConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Confirmar Rechazo
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