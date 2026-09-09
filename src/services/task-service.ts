import { apiClient } from "@/lib/api-client";
import { MessageResponse, DataResponse} from "@/types/api";
import { CreateTaskInput, Task, UpdateTaskInput } from "@/types/task";

const TASK_ENDPOINT = "/api/tasks";

export const taskService = {
    async getAll() {
        const response = await apiClient.get<DataResponse<Task[]>>(
            TASK_ENDPOINT,
            {
                cache: "no-store",
            },
        );
        return response.data;
    },
    async create(input: CreateTaskInput) {
        const response = await apiClient.post<DataResponse<Task>, CreateTaskInput>(TASK_ENDPOINT, input);
        
        return response.data;
    },
    async update(id: string, input: UpdateTaskInput) {
        const response = await apiClient.patch<DataResponse<Task>, UpdateTaskInput>(`${TASK_ENDPOINT}/${id}`, input);

        return response.data;
    },
    async delete(id: string) {
        return apiClient.delete<MessageResponse>(`${TASK_ENDPOINT}/${id}`);
    },
};