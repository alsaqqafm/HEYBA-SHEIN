/**
 * Phone Number Normalization and Matching Utilities
 * Handles Yemen and International phone numbers, Arabic/English numerals, spaces, country codes.
 */

// Convert Eastern Arabic / Persian digits to standard ASCII digits
export const toEnglishDigits = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
};

/**
 * Normalizes phone numbers to standard format (for Yemen: 9 digits starting with 7X)
 * Removes: +967, 00967, 967, leading 0, spaces, dashes, parentheses, special characters.
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  let digits = toEnglishDigits(phone).replace(/\D/g, '');

  if (!digits) return '';

  // Yemen country codes stripping
  if (digits.startsWith('00967')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('967') && digits.length > 9) {
    digits = digits.slice(3);
  }

  // Local leading 0 (e.g. 0771234567 -> 771234567)
  if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }

  return digits;
};

/**
 * Determines whether an input string is a phone number rather than an email
 */
export const isPhoneNumber = (identifier: string): boolean => {
  if (!identifier) return false;
  const clean = identifier.trim();
  if (clean.includes('@')) return false;
  const digits = toEnglishDigits(clean).replace(/\D/g, '');
  return digits.length >= 6;
};

/**
 * Returns all possible string variants of a phone number for matching in DB/Local storage
 */
export const getPhoneSearchVariants = (phone: string): string[] => {
  const norm = normalizePhone(phone);
  const rawDigits = toEnglishDigits(phone).replace(/\D/g, '');
  
  if (!norm) return [phone.trim()];

  const variants = new Set<string>();
  variants.add(norm); // e.g. 771234567
  variants.add(rawDigits); // raw digits
  variants.add(`+967${norm}`); // +967771234567
  variants.add(`967${norm}`); // 967771234567
  variants.add(`00967${norm}`); // 00967771234567
  variants.add(`0${norm}`); // 0771234567
  variants.add(`${norm}@whatsapp.user`);
  variants.add(`${rawDigits}@whatsapp.user`);
  variants.add(`${norm}@heybashein.user`);

  return Array.from(variants);
};

/**
 * Compares two phone numbers for equality across all variations
 */
export const isPhoneMatching = (phone1?: string, phone2?: string): boolean => {
  if (!phone1 || !phone2) return false;
  const n1 = normalizePhone(phone1);
  const n2 = normalizePhone(phone2);
  
  if (n1 && n2 && n1 === n2) return true;

  const raw1 = toEnglishDigits(phone1).replace(/\D/g, '');
  const raw2 = toEnglishDigits(phone2).replace(/\D/g, '');
  if (raw1 && raw2 && raw1 === raw2) return true;

  return false;
};
