export type AreaIcon = | "Layers" | "Briefcase" | "HeartPulse" | "WalletCards" | "GraduationCap" | "Code2" | "House" | "BookOpen" | "Dumbbell" | "Palette";

export type Area = {
    id: string;
    name: string;
    description: string;
    icon: AreaIcon;
    color: string;
    isArchived: boolean;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    createdAt: string;
    updatedAt: string;
};

export type CreateAreaInput = {
    name: string;
    description?: string;
    icon?: AreaIcon;
    color?: string;
};

export type UpdateAreaInput = {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    isArchived?: boolean;
};