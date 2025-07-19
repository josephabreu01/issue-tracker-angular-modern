export interface Issue {
  id?: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string; // This was here, let's clarify its purpose later, or use assignedToUsername consistently.
  assignedToUsername?: string; // New field for specific user assignment
  createdAt?: Date;
  updatedAt?: Date;
  matricula: string;
  recinto: string;
}
