export interface GovernorateOption {
  id: string;
  name: string;
  deliveryFee: number;
  popularAreas: string[];
}

export const YEMEN_GOVERNORATES: GovernorateOption[] = [
  {
    id: 'ibb',
    name: 'إب',
    deliveryFee: 1000,
    popularAreas: ['الظهار', 'المشنة', 'جبلة', 'سحول إب', 'القفر', 'العدين', 'ياريم'],
  },
  {
    id: 'sanaa',
    name: 'أمانة العاصمة / صنعاء',
    deliveryFee: 1500,
    popularAreas: ['السبعين', 'التحرير', 'حدة', 'الصافية', 'شعوب', 'معين', 'أزعل'],
  },
  {
    id: 'aden',
    name: 'عدن',
    deliveryFee: 2000,
    popularAreas: ['كريتر', 'خور مكسر', 'المنصورة', 'الشيخ عثمان', 'المعلا', 'التواهي', 'دار سعد'],
  },
  {
    id: 'taiz',
    name: 'تعز',
    deliveryFee: 1500,
    popularAreas: ['المظفر', 'القاهرة', 'صالة', 'الحوبان', 'التربة', 'دمنة خدير'],
  },
  {
    id: 'hodeidah',
    name: 'الحديدة',
    deliveryFee: 2000,
    popularAreas: ['الحوك', 'الحالي', 'المينا', 'باجل', 'الزبيد'],
  },
  {
    id: 'hadramout',
    name: 'حضرموت (المكلا / سيئون)',
    deliveryFee: 2500,
    popularAreas: ['المكلا', 'سيئون', 'الشحر', 'تريم', 'قطن'],
  },
  {
    id: 'dhamar',
    name: 'ذمار',
    deliveryFee: 1500,
    popularAreas: ['مدينة ذمار', 'عنس', 'معبر', 'جهران'],
  },
  {
    id: 'marib',
    name: 'مأرب',
    deliveryFee: 2000,
    popularAreas: ['مدينة مأرب', 'الوادي', 'الجوبة'],
  },
  {
    id: 'amran',
    name: 'عمران',
    deliveryFee: 1500,
    popularAreas: ['مدينة عمران', 'خمر', 'ريدة'],
  },
  {
    id: 'saada',
    name: 'صعدة',
    deliveryFee: 2000,
    popularAreas: ['مدينة صعدة', 'سحار', 'مجز'],
  },
  {
    id: 'hajjah',
    name: 'حجة',
    deliveryFee: 2000,
    popularAreas: ['مدينة حجة', 'عبس', 'المحابشة'],
  },
  {
    id: 'bayda',
    name: 'البيضاء',
    deliveryFee: 2000,
    popularAreas: ['مدينة البيضاء', 'رداع', 'مكيراس'],
  },
  {
    id: 'abyan',
    name: 'أبين',
    deliveryFee: 2000,
    popularAreas: ['زنجبار', 'خنفر (جعار)', 'لودر'],
  },
  {
    id: 'shabwah',
    name: 'شبوة',
    deliveryFee: 2500,
    popularAreas: ['عتق', 'بيحان', 'عزان'],
  },
  {
    id: 'mahrah',
    name: 'المهرة',
    deliveryFee: 3000,
    popularAreas: ['الغيمة', 'شحن', 'سيحوت'],
  },
  {
    id: 'socotra',
    name: 'سقطرى',
    deliveryFee: 3000,
    popularAreas: ['حديبو', 'قلنسية'],
  },
  {
    id: 'raymah',
    name: 'ريمة',
    deliveryFee: 2000,
    popularAreas: ['الجبين', 'بلاد الطعام'],
  },
  {
    id: 'dali',
    name: 'الضالع',
    deliveryFee: 1500,
    popularAreas: ['مدينة الضالع', 'قعطبة', 'دمت'],
  },
  {
    id: 'lahj',
    name: 'لحج',
    deliveryFee: 2000,
    popularAreas: ['الحوطة', 'تبن', 'طور الباحة'],
  },
];
