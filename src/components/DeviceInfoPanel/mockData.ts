export interface DeviceTelemetry {
  id: string
  name: string
  room: string
  status: 'online' | 'offline'
  lastUpdated: string
  currentPower: number // W
  todayConsumption: number // kWh
  monthlyConsumption: number // kWh
  estimatedCost: number // USD
  efficiencyRating: string // e.g., 'A+++'
  peakTime: string
  aiRecommendation: string
  healthScore: number // 0-100
  temperature?: number // °C
  anomalies: string[]
  maintenancePrediction: string
  historyData: Array<{ time: string; value: number }>
  imageUrl?: string
  iconName: string
}

export const MOCK_TELEMETRY: Record<string, DeviceTelemetry> = {
  refrigerator: {
    id: 'refrigerator',
    name: 'Buzdolabı',
    room: 'Mutfak',
    status: 'online',
    lastUpdated: '1 dakika önce',
    currentPower: 85,
    todayConsumption: 1.84,
    monthlyConsumption: 55.2,
    estimatedCost: 6.62,
    efficiencyRating: 'A+++',
    peakTime: '12:00 - 14:00',
    aiRecommendation: 'Optimal Soğutma Analizi: İç sıcaklık 3.2°C seviyesinde sabit. Haftalık tüketim ortalamanın %4 altında. Kapağın uzun süre açık tutulmaması verimliliği korur.',
    healthScore: 100,
    temperature: 3.2,
    anomalies: [],
    maintenancePrediction: 'Gelecek 12 ay boyunca bakım gerekmiyor',
    historyData: [
      { time: '08:00', value: 80 },
      { time: '10:00', value: 85 },
      { time: '12:00', value: 110 },
      { time: '14:00', value: 90 },
      { time: '16:00', value: 85 },
      { time: '18:00', value: 85 },
      { time: '20:00', value: 80 }
    ],
    iconName: 'Refrigerator'
  },
  dishwasher: {
    id: 'dishwasher',
    name: 'Bulaşık Makinesi',
    room: 'Mutfak',
    status: 'offline',
    lastUpdated: '2 saat önce',
    currentPower: 0,
    todayConsumption: 0.95,
    monthlyConsumption: 28.5,
    estimatedCost: 3.42,
    efficiencyRating: 'A++',
    peakTime: '20:00 - 21:30',
    aiRecommendation: 'Yıkama Değerlendirmesi: Son yıkamada Eko mod aktif edilerek 0.4 kWh tasarruf sağlandı. Makineyi tam doldurarak çalıştırmak maksimum verimlilik sağlar.',
    healthScore: 98,
    anomalies: [],
    maintenancePrediction: 'Filtre temizliği 3 ay içinde yapılmalı',
    historyData: [
      { time: '08:00', value: 0 },
      { time: '10:00', value: 0 },
      { time: '12:00', value: 0 },
      { time: '14:00', value: 1200 },
      { time: '16:00', value: 0 },
      { time: '18:00', value: 0 },
      { time: '20:00', value: 0 }
    ],
    iconName: 'CookingPot'
  },
  oven: {
    id: 'oven',
    name: 'Fırın',
    room: 'Mutfak',
    status: 'offline',
    lastUpdated: '10 dakika önce',
    currentPower: 0,
    todayConsumption: 1.45,
    monthlyConsumption: 43.5,
    estimatedCost: 5.22,
    efficiencyRating: 'A',
    peakTime: '18:00 - 19:30',
    aiRecommendation: 'Pişirme Analizi: Fanlı konveksiyon modu son pişirmede %15 süre tasarrufu sağladı. Fırın kapağını sık açmamak 0.25 kWh ısı kaybını önler.',
    healthScore: 95,
    temperature: 22,
    anomalies: [],
    maintenancePrediction: 'Isıtıcı rezistans kontrolü 6 ay sonra',
    historyData: [
      { time: '08:00', value: 0 },
      { time: '10:00', value: 0 },
      { time: '12:00', value: 0 },
      { time: '14:00', value: 0 },
      { time: '16:00', value: 0 },
      { time: '18:00', value: 2400 },
      { time: '20:00', value: 0 }
    ],
    iconName: 'Flame'
  },
  cooktop: {
    id: 'cooktop',
    name: 'Ocak',
    room: 'Mutfak',
    status: 'online',
    lastUpdated: 'Şimdi',
    currentPower: 1200,
    todayConsumption: 0.85,
    monthlyConsumption: 25.5,
    estimatedCost: 3.06,
    efficiencyRating: 'A',
    peakTime: '17:30 - 19:00',
    aiRecommendation: 'İndüksiyon Yüzey Uyarısı: Tabanı düz tencere kullanımı ısı kaybını önler. Pişirme bitimine 2 dk kala ocağı kapatıp kalan ısıdan faydalanabilirsiniz.',
    healthScore: 97,
    temperature: 145,
    anomalies: [],
    maintenancePrediction: 'Sağlıklı',
    historyData: [
      { time: '14:00', value: 0 },
      { time: '15:00', value: 0 },
      { time: '16:00', value: 0 },
      { time: '17:00', value: 0 },
      { time: '18:00', value: 1500 },
      { time: '19:00', value: 1200 },
      { time: '20:00', value: 0 }
    ],
    iconName: 'Flame'
  },
  range_hood: {
    id: 'range_hood',
    name: 'Aspiratör',
    room: 'Mutfak',
    status: 'online',
    lastUpdated: 'Şimdi',
    currentPower: 45,
    todayConsumption: 0.12,
    monthlyConsumption: 3.6,
    estimatedCost: 0.43,
    efficiencyRating: 'B',
    peakTime: '17:30 - 19:00',
    aiRecommendation: 'Hava Akış Analizi: Yağ filtresinin temizliği motor direncini düşürebilir. Düzenli temizlik sürekli tüketimi 4W azaltır.',
    healthScore: 89,
    anomalies: ['Filtre verim skoru %90 altında'],
    maintenancePrediction: 'Filtre temizliği 2 hafta içinde yapılmalı',
    historyData: [
      { time: '08:00', value: 0 },
      { time: '10:00', value: 0 },
      { time: '12:00', value: 0 },
      { time: '14:00', value: 0 },
      { time: '16:00', value: 0 },
      { time: '18:00', value: 45 },
      { time: '20:00', value: 45 }
    ],
    iconName: 'Wind'
  },
  washing_machine: {
    id: 'washing_machine',
    name: 'Çamaşır Makinesi',
    room: 'Çamaşır Odası',
    status: 'offline',
    lastUpdated: '3 saat önce',
    currentPower: 0,
    todayConsumption: 0.88,
    monthlyConsumption: 17.6,
    estimatedCost: 2.11,
    efficiencyRating: 'A+++',
    peakTime: '09:00 - 11:00',
    aiRecommendation: 'EkoYıkama Analizi: Yıkamayı 40°C yerine 30°C ayarında çalıştırmak elektrik tüketimini yarıya indirir. Tam kapasite çalıştırmanız önerilir.',
    healthScore: 99,
    anomalies: [],
    maintenancePrediction: 'Kazan temizleme döngüsü 1 ay sonra',
    historyData: [
      { time: '08:00', value: 0 },
      { time: '10:00', value: 480 },
      { time: '12:00', value: 0 },
      { time: '14:00', value: 0 },
      { time: '16:00', value: 0 },
      { time: '18:00', value: 0 },
      { time: '20:00', value: 0 }
    ],
    iconName: 'WashingMachine'
  },
  dryer: {
    id: 'dryer',
    name: 'Kurutma Makinesi',
    room: 'Çamaşır Odası',
    status: 'offline',
    lastUpdated: '2 saat önce',
    currentPower: 0,
    todayConsumption: 2.1,
    monthlyConsumption: 31.5,
    estimatedCost: 3.78,
    efficiencyRating: 'B',
    peakTime: '10:30 - 12:00',
    aiRecommendation: 'Filtre Uyarısı: Hav filtresini her kurutma sonrası temizlemek hava akışını artırarak kurutma süresini 10 dakika kısaltır.',
    healthScore: 94,
    anomalies: [],
    maintenancePrediction: 'Sağlıklı',
    historyData: [
      { time: '08:00', value: 0 },
      { time: '10:00', value: 0 },
      { time: '11:00', value: 1800 },
      { time: '12:00', value: 0 },
      { time: '14:00', value: 0 },
      { time: '16:00', value: 0 },
      { time: '18:00', value: 0 }
    ],
    iconName: 'Wind'
  },
  television: {
    id: 'television',
    name: 'Televizyon',
    room: 'Salon',
    status: 'online',
    lastUpdated: '5 dakika önce',
    currentPower: 110,
    todayConsumption: 1.15,
    monthlyConsumption: 34.5,
    estimatedCost: 4.14,
    efficiencyRating: 'A+',
    peakTime: '19:00 - 22:30',
    aiRecommendation: 'Akıllı Karartma Analizi: Ekran arka ışığı %90 seviyesinde. Ortam ışık sensörünü aktif ederek tüketimi 15W düşürebilirsiniz.',
    healthScore: 98,
    temperature: 34,
    anomalies: [],
    maintenancePrediction: 'Sağlıklı',
    historyData: [
      { time: '08:00', value: 0 },
      { time: '10:00', value: 0 },
      { time: '12:00', value: 110 },
      { time: '14:00', value: 110 },
      { time: '16:00', value: 0 },
      { time: '18:00', value: 110 },
      { time: '20:00', value: 115 }
    ],
    iconName: 'Tv'
  },
  computer: {
    id: 'computer',
    name: 'Bilgisayar',
    room: 'Çalışma Odası',
    status: 'online',
    lastUpdated: '12 dakika önce',
    currentPower: 145,
    todayConsumption: 1.68,
    monthlyConsumption: 50.4,
    estimatedCost: 6.05,
    efficiencyRating: 'A',
    peakTime: '09:00 - 17:00',
    aiRecommendation: 'Enerji Tasarrufu Değerlendirmesi: Bilgisayar 15 dk boşta kaldığında uyku moduna geçiyor. Ekran parlaklığını %70 yapmak saatte 12W tasarruf sağlar.',
    healthScore: 100,
    temperature: 42,
    anomalies: [],
    maintenancePrediction: 'İşlemci termal macun kontrolü 8 ay sonra',
    historyData: [
      { time: '08:00', value: 50 },
      { time: '10:00', value: 150 },
      { time: '12:00', value: 145 },
      { time: '14:00', value: 155 },
      { time: '16:00', value: 140 },
      { time: '18:00', value: 80 },
      { time: '20:00', value: 50 }
    ],
    iconName: 'Monitor'
  },
  lights: {
    id: 'lights',
    name: 'Genel Aydınlatma',
    room: 'Salon',
    status: 'online',
    lastUpdated: 'Şimdi',
    currentPower: 28,
    todayConsumption: 0.42,
    monthlyConsumption: 18.4,
    estimatedCost: 1.85,
    efficiencyRating: 'A++',
    peakTime: '19:00 - 23:00',
    aiRecommendation: 'Akıllı Gece Parlaklığı: Saat 00:00 sonrasında parlaklığı %82 seviyesinden %50 seviyesine düşürerek sürekli 12W enerji tasarrufu yapabilirsiniz.',
    healthScore: 100,
    anomalies: [],
    maintenancePrediction: 'Tüm modüller sorunsuz çalışıyor',
    historyData: [
      { time: '08:00', value: 0 },
      { time: '10:00', value: 0 },
      { time: '12:00', value: 0 },
      { time: '14:00', value: 0 },
      { time: '16:00', value: 8 },
      { time: '18:00', value: 22 },
      { time: '20:00', value: 28 }
    ],
    iconName: 'Lightbulb'
  },
  air_conditioner: {
    id: 'air_conditioner',
    name: 'Klima',
    room: 'İklimlendirme',
    status: 'online',
    lastUpdated: 'Şimdi',
    currentPower: 820,
    todayConsumption: 6.42,
    monthlyConsumption: 192.6,
    estimatedCost: 23.11,
    efficiencyRating: 'A++',
    peakTime: '13:00 - 17:00',
    aiRecommendation: 'Termostat Ayar Değerlendirmesi: Hedef sıcaklık 21°C. Ayarı 23°C seviyesine getirmek konforu bozmadan kompresör yükünü %15 düşürür.',
    healthScore: 93,
    temperature: 21,
    anomalies: [],
    maintenancePrediction: 'Hava filtresi kontrolü 1 ay sonra',
    historyData: [
      { time: '08:00', value: 300 },
      { time: '10:00', value: 650 },
      { time: '12:00', value: 820 },
      { time: '14:00', value: 850 },
      { time: '16:00', value: 800 },
      { time: '18:00', value: 720 },
      { time: '20:00', value: 400 }
    ],
    iconName: 'AirVent'
  }
}
