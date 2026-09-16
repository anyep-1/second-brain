export type ResourceType = | "ARTICLE" | "VIDEO" | "COURSE" | "BOOK" | "TOOL" | "OTHER";

export type ResourceStatus = | "TO_REVIEW" | "IN_PROGRESS" | "COMPLETED";

export type ResourceArea = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

export type Resource = {
    id: string;
    title: string;
    description: string;
    url: string;
    type: ResourceType;
    status: ResourceStatus;
    isFavorite: boolean;
    isArchived: boolean;
    areaId: string | null;
    area: ResourceArea | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateResourceInput = {
    title: string;
    description?: string;
    url?: string;
    type?: ResourceType;
    status?: ResourceStatus;
    areaId?: string | null;
};

export type UpdateResourceInput = {
    title?: string;
    description?: string;
    url?: string;
    type?: ResourceType;
    status?: ResourceStatus;
    isFavorite?: boolean;
    isArchived?: boolean;
    areaId?: string | null;   
};