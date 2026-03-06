import { useAuthStore } from '../stores/auth';

const baseURL = '/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: any;
  header?: Record<string, string>;
}

interface ResponseData<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
}

const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<ResponseData<T>> => {
  const authStore = useAuthStore();
  const token = authStore.token;

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header
  };

  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : baseURL + url;

  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || options.params,
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as ResponseData<T>);
        } else if (res.statusCode === 401) {
          authStore.logout();
          uni.reLaunch({ url: '/pages/login/login' });
          reject(new Error('未授权，请重新登录'));
        } else {
          reject(new Error((res.data as any)?.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

const api = {
  get: <T = any>(url: string, config?: { params?: any; header?: Record<string, string> }) => 
    request<T>(url, { method: 'GET', params: config?.params, header: config?.header }),
  
  post: <T = any>(url: string, data?: any, header?: Record<string, string>) => 
    request<T>(url, { method: 'POST', data, header }),
  
  put: <T = any>(url: string, data?: any, header?: Record<string, string>) => 
    request<T>(url, { method: 'PUT', data, header }),
  
  delete: <T = any>(url: string, data?: any, header?: Record<string, string>) => 
    request<T>(url, { method: 'DELETE', data, header })
};

export default api;
