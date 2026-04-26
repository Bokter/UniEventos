import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Category {
  id: string;
  name: string;
  description: string;
  eventCount: number;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (categoryId: string | null, newName: string, newDescription: string) => void;
}

export function EditCategoryModal({ isOpen, onClose, category, onSave }: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [category, isOpen]);

  const handleSave = () => {
    if (name.trim() === '') return;
    onSave(category ? category.id : null, name, description);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de la Categoría</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej. Cultural" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Descripción de la categoría" 
              className="min-h-[100px]"
            />
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
