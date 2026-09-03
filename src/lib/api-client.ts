type RequestOptions = Omit<RequestInit, "method" | "body">;

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

function getErrorMessage(payload: unknown) {
    if(typeof payload === "object" && payload !== null && "message" in payload) {
        const message = (payload as { message?: unknown }).message;

        if(typeof message === "string") {
            return message;
        }
    }
    return null;
}

async function request<T>(
    url: string,
    options: RequestInit = {},
) : Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");

    if(options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const payload: unknown = await response.json().catch(() => null);

    if(!response.ok) {
        throw new ApiError(
            getErrorMessage(payload) ?? `Permintaan gagal dengan status ${response.status}`, response.status,
        );
    }
    return payload as T;
}

export const apiClient = {
    get<T>(url: string, options?: RequestOptions) {
        return request<T>(url, {
            ...options,
            method: "GET",
        });
    },
    post<TResponse, TBody>(url: string, body: TBody, options?: RequestOptions) {
        return request<TResponse>(url, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    patch<TResponse, TBody>(url: string, body: TBody, options?: RequestOptions) {
        return request<TResponse>(url, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(body),
        });
    },
    delete<T>(url: string, options?: RequestOptions) {
        return request<T>(url, {
            ...options,
            method: "DELETE",
        })
    }
}
    
