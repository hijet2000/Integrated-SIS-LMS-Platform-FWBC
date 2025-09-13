// Simulates a network delay for mock API calls
export const mockApi = <T,>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Simulate an API error
// FIX: Make the function generic to allow for better type inference in calling functions.
export const mockApiError = <T = never,>(status: number, message: string, delay = 500): Promise<T> => {
    return new Promise<T>((_, reject) => {
        setTimeout(() => {
            reject({ status, message, name: 'ApiError' });
        }, delay);
    });
};

// FIX: Implement and export `createMockApi` to resolve import errors.
/**
 * A factory for creating a mock CRUD API for a resource.
 */
export const createMockApi = <T extends { id: string; siteId: string }>(
  resourceName: string,
  initialData: T[]
) => {
  let data = [...initialData];

  return {
    get: (siteId: string): Promise<T[]> => mockApi(data.filter(item => item.siteId === siteId)),
    getById: (id: string): Promise<T | undefined> => mockApi(data.find(item => item.id === id)),
    add: (item: Omit<T, 'id' | 'siteId'>): Promise<T> => {
      const newItem = {
        ...item,
        id: `${resourceName}_${Date.now()}`,
        siteId: 'site_123', // Assuming a single site for this mock
      } as T;
      data.push(newItem);
      return mockApi(newItem);
    },
    update: (id: string, updates: Partial<T>): Promise<T> => {
      const index = data.findIndex(item => item.id === id);
      if (index > -1) {
        data[index] = { ...data[index], ...updates };
        return mockApi(data[index]);
      }
      return Promise.reject(new Error(`${resourceName} not found`));
    },
    delete: (id: string): Promise<{ success: boolean }> => {
      const index = data.findIndex(item => item.id === id);
      if (index > -1) {
        data.splice(index, 1);
        return mockApi({ success: true });
      }
      return Promise.reject(new Error(`${resourceName} not found`));
    },
  };
};
