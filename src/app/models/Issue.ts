export interface Issue {
  id?: string;
  title: string;
  description: string;
  status: 'Abierto' | 'En Progreso' | 'Resuelto' | 'Cerrado';
  priority: 'Baja' | 'Media' | 'Alta' | 'Critica';
  tecnico?: string; // This was here, let's clarify its purpose later, or use assignedToUsername consistently.
  assignedToUsername?: string; // New field for specific user assignment
  createdAt?: Date;
  updatedAt?: Date;
  matricula: string;
  recinto: string;
}
