export type CollaboratorType = {
  id: string;
  username: string;
  photo_profile?: string | null;
  status?: "accepted" | "pending" | "rejected";
};

export type CategoryType = {
  id: string;
  name: string;
};

export type TodoType = {
  id: string;
  task: string;
  description?: string;
  completed: boolean;
  favorites: boolean;
  priority: "low" | "medium" | "high";
  category?: CategoryType | null;
  category_id?: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  collaborators?: CollaboratorType[];
};
