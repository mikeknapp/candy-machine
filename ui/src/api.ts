export const API_BASE_URL = "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };
  options = { ...defaultOptions, ...options };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, errors: errorData.errors };
  }

  const data = await response.json();
  return { success: true, data };
};

export const eventRequest = async (
  endpoint: string,
  onMessage: (msg: string) => void,
): Promise<boolean> => {
  const eventSource = new EventSource(`${API_BASE_URL}${endpoint}`);

  eventSource.addEventListener("message", (event) => {
    onMessage(event.data);
  });

  eventSource.addEventListener("error", (event) => {
    console.error("EventSource failed:", event);
    eventSource.close();
  });

  // Return a promise that resolves when the event source is closed.
  return new Promise(async (resolve) => {
    while (eventSource.readyState !== EventSource.CLOSED) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    resolve(true);
  });
};
