import { BaseConfig, ManagementTypeDetail } from '../types';

const API_BASE = '';

export async function loadSharedConfig(): Promise<{
  baseConfig: BaseConfig | null;
  managementConfigs: Record<string, ManagementTypeDetail> | null;
  updatedAt: string | null;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) throw new Error('Failed to load shared config');
    const json = await res.json();
    return {
      baseConfig: json.baseConfig ?? null,
      managementConfigs: json.managementConfigs ?? null,
      updatedAt: json.updatedAt ?? null,
    };
  } catch {
    return { baseConfig: null, managementConfigs: null, updatedAt: null };
  }
}

export async function saveSharedConfig(params: {
  baseConfig?: BaseConfig;
  managementConfigs?: Record<string, ManagementTypeDetail>;
}) {
  await fetch(`${API_BASE}/api/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
}


