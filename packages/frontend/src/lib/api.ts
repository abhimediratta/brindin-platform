const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Add API key if available
  const apiKey = typeof window !== 'undefined'
    ? localStorage.getItem('brindin-api-key')
    : null;
  if (apiKey) {
    (config.headers as Record<string, string>)['X-API-Key'] = apiKey;
  }

  const response = await fetch(`${API_BASE}${path}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

async function uploadFile<T>(path: string, file: File, onProgress?: (percent: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    const apiKey = localStorage.getItem('brindin-api-key');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('POST', `${API_BASE}${path}`);
    if (apiKey) xhr.setRequestHeader('X-API-Key', apiKey);
    xhr.send(formData);
  });
}

// === Brands ===
export const getBrands = () => request<any[]>('/api/brands');
export const getBrand = (id: string) => request<any>(`/api/brands/${id}`);
export const createBrand = (data: { name: string; categoryVertical?: string; categorySub?: string; targetGeographies?: string[]; description?: string }) =>
  request<any>('/api/brands', { method: 'POST', body: data });

// === Creatives ===
export const uploadCreative = (brandId: string, file: File, onProgress?: (percent: number) => void) =>
  uploadFile<any>(`/api/brands/${brandId}/creatives/upload`, file, onProgress);
export const getCreatives = (brandId: string, limit = 50, offset = 0) =>
  request<any>(`/api/brands/${brandId}/creatives?limit=${limit}&offset=${offset}`);

// === Design System ===
export const getDesignSystem = (brandId: string) =>
  request<any>(`/api/brands/${brandId}/design-system`);
export const updateDesignSystem = (brandId: string, updates: Record<string, unknown>) =>
  request<any>(`/api/brands/${brandId}/design-system`, { method: 'PATCH', body: updates });
export const updateDesignSystemStatus = (brandId: string, status: string) =>
  request<any>(`/api/brands/${brandId}/design-system/status`, { method: 'PATCH', body: { status } });
export const triggerExtraction = (brandId: string) =>
  request<any>(`/api/brands/${brandId}/design-system/extract`, { method: 'POST' });

// === Jobs ===
export const getExtractionJob = (brandId: string, jobId: string) =>
  request<any>(`/api/brands/${brandId}/extraction-jobs/${jobId}`);

// === Variants ===
export const createVariant = (brandId: string, data: { regionCode: string; language: string; tier: string }) =>
  request<any>(`/api/brands/${brandId}/design-system/variants`, { method: 'POST', body: data });
export const getVariants = (brandId: string) =>
  request<any>(`/api/brands/${brandId}/design-system/variants`);

// === Design System Versions ===
export const getDesignSystemVersions = (brandId: string) =>
  request<any>(`/api/brands/${brandId}/design-system/versions`);
export const createDesignSystemVersion = (brandId: string) =>
  request<any>(`/api/brands/${brandId}/design-system/versions`, { method: 'POST' });
export const getDesignSystemVersion = (brandId: string, versionId: string) =>
  request<any>(`/api/brands/${brandId}/design-system/versions/${versionId}`);
export const restoreDesignSystemVersion = (brandId: string, versionId: string) =>
  request<any>(`/api/brands/${brandId}/design-system/versions/${versionId}/restore`, { method: 'POST' });
export const updateVariant = (brandId: string, variantId: string, overrides: Record<string, unknown>) =>
  request<any>(`/api/brands/${brandId}/design-system/variants/${variantId}`, { method: 'PATCH', body: overrides });

// === Cultural/Regional ===
export const getRegions = () => request<any[]>('/api/cultural/regions');
export const getRegion = (code: string) => request<any>(`/api/cultural/regions/${code}`);
