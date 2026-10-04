import type { DeliveryAgent, DeliveryAgentStatus } from '../types';

const DELIVERY_AGENTS_KEY = 'heyba_delivery_agents_v1';

const SEEDED_AGENTS: DeliveryAgent[] = [
  {
    id: 'agent-01',
    name: 'الكابتن أحمد الخولاني',
    phone: '770001122',
    whatsapp: '770001122',
    shipping_company_id: 'ship-co-01',
    shipping_company_name: 'شركة هيبة اكسبريس للتوصيل السريع',
    governorate: 'إب',
    area: 'الظهار',
    status: 'available',
    notes: 'مندوب رسمي متوفر لتوصيل الطلبات العاجلة في خط شارع العدين والظهار.',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'agent-02',
    name: 'الكابتن سامي العبسي',
    phone: '773334455',
    whatsapp: '773334455',
    shipping_company_id: 'ship-co-01',
    shipping_company_name: 'شركة هيبة اكسبريس للتوصيل السريع',
    governorate: 'إب',
    area: 'المشنة',
    status: 'available',
    notes: 'تغطية خط المشنة وجبل ربي.',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'agent-03',
    name: 'الكابتن ياسر الحميري',
    phone: '775556677',
    whatsapp: '775556677',
    shipping_company_id: 'ship-co-02',
    shipping_company_name: 'شركة النجم السريع للتوصيل الشامل',
    governorate: 'إب',
    area: 'شارع تعز',
    status: 'available',
    notes: 'مندوب شحن وتوصيل الطلبات المحفظة.',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

export const getStoredDeliveryAgents = (): DeliveryAgent[] => {
  try {
    const raw = localStorage.getItem(DELIVERY_AGENTS_KEY);
    if (!raw) {
      localStorage.setItem(DELIVERY_AGENTS_KEY, JSON.stringify(SEEDED_AGENTS));
      return SEEDED_AGENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading delivery agents:', e);
    return SEEDED_AGENTS;
  }
};

export const getDeliveryAgentsByCompany = (companyId: string): DeliveryAgent[] => {
  const all = getStoredDeliveryAgents();
  return all.filter((agent) => agent.shipping_company_id === companyId);
};

export const saveDeliveryAgents = (agents: DeliveryAgent[]) => {
  try {
    localStorage.setItem(DELIVERY_AGENTS_KEY, JSON.stringify(agents));
  } catch (e) {
    console.error('Error saving delivery agents:', e);
  }
};

export const addDeliveryAgent = (
  agentData: Omit<DeliveryAgent, 'id' | 'created_at'>
): DeliveryAgent => {
  const current = getStoredDeliveryAgents();
  const newAgent: DeliveryAgent = {
    ...agentData,
    id: `agent-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const updated = [newAgent, ...current];
  saveDeliveryAgents(updated);
  return newAgent;
};

export const updateDeliveryAgent = (
  id: string,
  updatedData: Partial<DeliveryAgent>
): DeliveryAgent | null => {
  const current = getStoredDeliveryAgents();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const updatedAgent = { ...current[index], ...updatedData, updated_at: new Date().toISOString() };
  current[index] = updatedAgent;
  saveDeliveryAgents(current);
  return updatedAgent;
};

export const toggleDeliveryAgentStatus = (
  id: string,
  newStatus: DeliveryAgentStatus
): DeliveryAgent | null => {
  const current = getStoredDeliveryAgents();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;

  current[index].status = newStatus;
  current[index].updated_at = new Date().toISOString();
  saveDeliveryAgents(current);
  return current[index];
};

export const deleteDeliveryAgent = (id: string): boolean => {
  const current = getStoredDeliveryAgents();
  const filtered = current.filter((a) => a.id !== id);
  saveDeliveryAgents(filtered);
  return true;
};
