import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
interface UsuarioBackend {
  id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  activo: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UsuarioBackend | null;
  onSave: (userId: string, newRole: string) => void;
}

export function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [role, setRole] = useState<string>('miembro');

  useEffect(() => {
    if (user) {
      setRole(user.rol);
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      onSave(String(user.id), role);
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm font-medium">Nombre</p>
            <p className="text-sm text-muted-foreground">{user.nombre_completo}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Rol</p>
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="organizador">Organizador</SelectItem>
                <SelectItem value="miembro">Miembro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

