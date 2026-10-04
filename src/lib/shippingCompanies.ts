import type { ShippingCompany } from '../types';

const SHIPPING_COMPANIES_KEY = 'heyba_shipping_companies_v1';

const SEEDED_COMPANIES: ShippingCompany[] = [
  {
    id: 'ship-co-01',
    name: 'شركة هيبة اكسبريس للتوصيل السريع',
    phone: '772606709',
    whatsapp: '772606709',
    governorate: 'إب',
    area: 'الظهار',
    address: 'اليمن - إب - شارع العدين - برج هيبة',
    latitude: 13.9667,
    longitude: 44.1833,
    status: 'active',
    notes: 'الشركة الرئيسية المعتمدة لتوصيل الطلبات داخل محافظة إب والجمهورية اليمنية.',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ship-co-02',
    name: 'شركة النجم السريع للتوصيل الشامل',
    phone: '771234567',
    whatsapp: '771234567',
    governorate: 'إب',
    area: 'المشنة',
    address: 'اليمن - إب - شارع تعز - قرب الجسر',
    latitude: 13.9612,
    longitude: 44.1895,
    status: 'active',
    notes: 'متخصصة في توصيل الشحنات السريعة والمحفظة.',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

export const getStoredShippingCompanies = (): ShippingCompany[] => {
  try {
    const raw = localStorage.getItem(SHIPPING_COMPANIES_KEY);
    if (!raw) {
      localStorage.setItem(SHIPPING_COMPANIES_KEY, JSON.stringify(SEEDED_COMPANIES));
      return SEEDED_COMPANIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading shipping companies:', e);
    return SEEDED_COMPANIES;
  }
};

export const saveShippingCompanies = (companies: ShippingCompany[]) => {
  try {
    localStorage.setItem(SHIPPING_COMPANIES_KEY, JSON.stringify(companies));
  } catch (e) {
    console.error('Error saving shipping companies:', e);
  }
};

export const addShippingCompany = (
  companyData: Omit<ShippingCompany, 'id' | 'created_at'>
): ShippingCompany => {
  const current = getStoredShippingCompanies();
  const newCompany: ShippingCompany = {
    ...companyData,
    id: `ship-co-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const updated = [newCompany, ...current];
  saveShippingCompanies(updated);
  return newCompany;
};

export const updateShippingCompany = (
  id: string,
  updatedData: Partial<ShippingCompany>
): ShippingCompany | null => {
  const current = getStoredShippingCompanies();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updatedCompany = { ...current[index], ...updatedData, updated_at: new Date().toISOString() };
  current[index] = updatedCompany;
  saveShippingCompanies(current);
  return updatedCompany;
};

export const toggleShippingCompanyStatus = (id: string): ShippingCompany | null => {
  const current = getStoredShippingCompanies();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const newStatus = current[index].status === 'active' ? 'inactive' : 'active';
  current[index].status = newStatus;
  current[index].updated_at = new Date().toISOString();
  saveShippingCompanies(current);
  return current[index];
};

export const deleteShippingCompany = (id: string): boolean => {
  const current = getStoredShippingCompanies();
  const filtered = current.filter((c) => c.id !== id);
  saveShippingCompanies(filtered);
  return true;
};
