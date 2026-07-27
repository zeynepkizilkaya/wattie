import { type Home } from '@/types/home'
import { type User } from '@/types/auth'

export const mockUsers: Array<User & { password: string }> = [
  { id: '1', name: 'Efe Koç', email: 'efe@wattie.io', password: '123456' },
  { id: '2', name: 'Efe Koç', email: 'efe@voltwise.io', password: '123456' },
]

export const mockHomes: Home[] = [
  {
    id: 'h1',
    name: 'Ev - Kadıköy',
    quotaUsagePercent: 45.2,
    totalConsumptionKwh: 128.5,
    billingAmountTry: 266.00,
    penaltyActive: false,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'refrigerator', name: 'Buzdolabı', currentWatt: 140, safeLimit: 250, consecutiveBreaches: 0 },
      { id: 'computer', name: 'Bilgisayar', currentWatt: 220, safeLimit: 400, consecutiveBreaches: 0 },
      { id: 'television', name: 'Televizyon', currentWatt: 120, safeLimit: 200, consecutiveBreaches: 0 },
      { id: 'oven', name: 'Fırın', currentWatt: 1850, safeLimit: 2200, consecutiveBreaches: 0 },
      { id: 'lights', name: 'Genel Aydınlatma', currentWatt: 32, safeLimit: 80, consecutiveBreaches: 0 },
    ],
  },
  {
    id: 'h2',
    name: 'Yazlık - Bodrum',
    quotaUsagePercent: 82.7,
    totalConsumptionKwh: 245.1,
    billingAmountTry: 507.36,
    penaltyActive: false,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a5', name: 'Klima (Salon)', currentWatt: 2100, safeLimit: 2000, consecutiveBreaches: 3 },
      { id: 'a6', name: 'Klima (Yatak Odası)', currentWatt: 1400, safeLimit: 1500, consecutiveBreaches: 0 },
      { id: 'a7', name: 'Havuz Motoru', currentWatt: 1100, safeLimit: 1400, consecutiveBreaches: 0 },
      { id: 'a8', name: 'Şofben', currentWatt: 2100, safeLimit: 2500, consecutiveBreaches: 0 },
    ],
  },
  {
    id: 'h3',
    name: 'Ofis - Levent',
    quotaUsagePercent: 112.5,
    totalConsumptionKwh: 412.6,
    billingAmountTry: 906.50,
    penaltyActive: true,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a9', name: 'Sunucu Odası', currentWatt: 3500, safeLimit: 3000, consecutiveBreaches: 5 },
      { id: 'a10', name: 'Merkezi Klima', currentWatt: 4200, safeLimit: 4500, consecutiveBreaches: 0 },
      { id: 'a11', name: 'Aydınlatma', currentWatt: 800, safeLimit: 1000, consecutiveBreaches: 0 },
      { id: 'a12', name: 'UPS Sistemi', currentWatt: 1200, safeLimit: 1500, consecutiveBreaches: 4 },
    ],
  },
  {
    id: 'h4',
    name: 'Daire - Beşiktaş',
    quotaUsagePercent: 67.4,
    totalConsumptionKwh: 189.3,
    billingAmountTry: 391.85,
    penaltyActive: false,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a13', name: 'Klima', currentWatt: 1450, safeLimit: 2000, consecutiveBreaches: 0 },
      { id: 'a14', name: 'Elektrikli Fırın', currentWatt: 1850, safeLimit: 2200, consecutiveBreaches: 0 },
      { id: 'a15', name: 'TV + Ses Sistemi', currentWatt: 180, safeLimit: 300, consecutiveBreaches: 0 },
    ],
  },
  {
    id: 'h5',
    name: 'Müstakil - Çekmeköy',
    quotaUsagePercent: 133.6,
    totalConsumptionKwh: 520.4,
    billingAmountTry: 1212.30,
    penaltyActive: true,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a16', name: 'Isı Pompası', currentWatt: 2800, safeLimit: 2500, consecutiveBreaches: 3 },
      { id: 'a17', name: 'Garaj Kapısı', currentWatt: 200, safeLimit: 300, consecutiveBreaches: 0 },
      { id: 'a18', name: 'Bahçe Aydınlatma', currentWatt: 450, safeLimit: 500, consecutiveBreaches: 0 },
      { id: 'a19', name: 'Kurutma Makinesi', currentWatt: 2200, safeLimit: 2500, consecutiveBreaches: 1 },
      { id: 'a20', name: 'Elektrikli Şömine', currentWatt: 1500, safeLimit: 1800, consecutiveBreaches: 0 },
    ],
  },
  {
    id: 'h6',
    name: 'Stüdyo - Cihangir',
    quotaUsagePercent: 23.1,
    totalConsumptionKwh: 45.2,
    billingAmountTry: 93.56,
    penaltyActive: false,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a21', name: 'Mini Buzdolabı', currentWatt: 110, safeLimit: 180, consecutiveBreaches: 0 },
      { id: 'a22', name: 'Dizüstü Bilgisayar', currentWatt: 65, safeLimit: 120, consecutiveBreaches: 0 },
    ],
  },
  {
    id: 'h7',
    name: 'Villa - Sarıyer',
    quotaUsagePercent: 152.3,
    totalConsumptionKwh: 685.2,
    billingAmountTry: 1905.40,
    penaltyActive: true,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a23', name: 'Merkezi Isıtma', currentWatt: 4500, safeLimit: 4000, consecutiveBreaches: 6 },
      { id: 'a24', name: 'Jakuzi', currentWatt: 3200, safeLimit: 3000, consecutiveBreaches: 4 },
      { id: 'a25', name: 'Klima (Salon)', currentWatt: 2400, safeLimit: 2500, consecutiveBreaches: 0 },
      { id: 'a26', name: 'Elektrikli Araç Şarjı', currentWatt: 7200, safeLimit: 7500, consecutiveBreaches: 1 },
      { id: 'a27', name: 'Sauna', currentWatt: 3800, safeLimit: 3500, consecutiveBreaches: 3 },
    ],
  },
  {
    id: 'h8',
    name: 'Depo - Tuzla',
    quotaUsagePercent: 174.8,
    totalConsumptionKwh: 1240.5,
    billingAmountTry: 4213.30,
    penaltyActive: true,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a28', name: 'Soğuk Hava Deposu', currentWatt: 8500, safeLimit: 7000, consecutiveBreaches: 8 },
      { id: 'a29', name: 'Forklift Şarj İstasyonu', currentWatt: 5400, safeLimit: 5000, consecutiveBreaches: 5 },
      { id: 'a30', name: 'Aydınlatma Sistemi', currentWatt: 2200, safeLimit: 2500, consecutiveBreaches: 0 },
      { id: 'a31', name: 'Havalandırma', currentWatt: 3100, safeLimit: 3000, consecutiveBreaches: 3 },
    ],
  },
  {
    id: 'h9',
    name: 'Dükkan - Nişantaşı',
    quotaUsagePercent: 91.4,
    totalConsumptionKwh: 198.7,
    billingAmountTry: 411.31,
    penaltyActive: false,
    powerQuotaKwh: 300,
    financialQuota: 750,
    normalTariffRate: 2.07,
    penaltyTariffRate: 5.18,
    appliances: [
      { id: 'a32', name: 'Vitrin Aydınlatma', currentWatt: 900, safeLimit: 1000, consecutiveBreaches: 0 },
      { id: 'a33', name: 'Klima', currentWatt: 1800, safeLimit: 2000, consecutiveBreaches: 1 },
      { id: 'a34', name: 'Kasa Sistemi', currentWatt: 150, safeLimit: 200, consecutiveBreaches: 0 },
    ],
  },
]

export function generateHistory(homeId: string) {
  const baseConsumption: Record<string, number> = {
    h1: 18, h2: 35, h3: 58, h4: 27, h5: 72, h6: 6, h7: 95, h8: 165, h9: 28,
  }
  const base = baseConsumption[homeId] ?? 20
  const days = 14
  const history = []

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const variation = (Math.sin(i * 0.7) * 0.3 + 1) * base + (i % 3) * 2
    history.push({
      date: date.toISOString().split('T')[0],
      consumptionKwh: Math.round(variation * 100) / 100,
    })
  }

  return history
}

let nextApplianceId = 100
export function generateApplianceId() {
  return `a${nextApplianceId++}`
}

let nextHomeId = 100
export function generateHomeId() {
  return `h${nextHomeId++}`
}
