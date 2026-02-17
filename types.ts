
export enum TaskStatus {
  TODO = 'Por hacer',
  IN_PROGRESS = 'En progreso',
  DONE = 'Completado',
  PENDING_PAYMENT = 'Pago pendiente'
}

export enum TaskCategory {
  VENUE = 'Lugar y Catering',
  ATTIRE = 'Vestimenta y Belleza',
  GUESTS = 'Invitados e Invitaciones',
  PHOTO_VIDEO = 'Foto y Video',
  DECOR = 'Flores y Decoración',
  MUSIC = 'Música y Entretenimiento',
  LEGAL = 'Legal y Trámites',
  OTHER = 'Otros'
}

export interface WeddingTask {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  budget: number;
  actualCost: number;
  dueDate: string;
  notes: string;
  color: string;
  icon: string;
  supplier?: string;
}

export interface Guest {
  id: string;
  name: string;
  group: 'Familia' | 'Amigos' | 'Trabajo' | 'Otros';
  side: 'Novia' | 'Novio' | 'Ambos';
  confirmed: boolean;
  dietaryNotes: string;
  tableId?: string;
  // tableNumber is used for quick numeric table assignment in GuestManager
  tableNumber?: number;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
}

export interface TimelineItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  notes: string;
}

export interface WeddingStats {
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  spentAmount: number;
  daysRemaining: number;
}

export interface WeddingData {
  weddingDate: string;
  weddingTheme: string;
  vows?: string;
  coupleImage?: string | null;
  tasks: WeddingTask[];
  guests: Guest[];
  timeline: TimelineItem[];
  tables: Table[];
  updatedAt: number;
}
