import {
  Snowflake,
  Refrigerator,
  WashingMachine,
  CookingPot,
  Tv,
  Laptop,
  Flame,
  Zap,
  Fan,
  Lightbulb,
  Server,
  Battery,
  Heater,
  DoorOpen,
  TreePine,
  Bot,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  klima: Snowflake,
  buzdolabı: Refrigerator,
  'mini buzdolabı': Refrigerator,
  'çamaşır makinesi': WashingMachine,
  'bulaşık makinesi': CookingPot,
  'kurutma makinesi': WashingMachine,
  televizyon: Tv,
  tv: Tv,
  'tv + ses sistemi': Tv,
  'dizüstü bilgisayar': Laptop,
  laptop: Laptop,
  fırın: Flame,
  'elektrikli fırın': Flame,
  'mikrodalga fırın': Flame,
  kettle: Heater,
  şofben: Flame,
  'ısı pompası': Heater,
  'elektrikli şömine': Flame,
  'havuz motoru': Fan,
  'merkezi klima': Snowflake,
  'klima (salon)': Snowflake,
  'klima (yatak odası)': Snowflake,
  aydınlatma: Lightbulb,
  'bahçe aydınlatma': TreePine,
  'sunucu odası': Server,
  'ups sistemi': Battery,
  'garaj kapısı': DoorOpen,
}

const keywords: [string, LucideIcon][] = [
  ['klima', Snowflake],
  ['buzdolabı', Refrigerator],
  ['çamaşır', WashingMachine],
  ['bulaşık', CookingPot],
  ['kurutma', WashingMachine],
  ['televizyon', Tv],
  ['tv', Tv],
  ['bilgisayar', Laptop],
  ['laptop', Laptop],
  ['fırın', Flame],
  ['mikrodalga', Flame],
  ['şofben', Flame],
  ['şömine', Flame],
  ['kettle', Heater],
  ['ısı pompası', Heater],
  ['havuz', Fan],
  ['aspiratör', Fan],
  ['vantilatör', Fan],
  ['aydınlatma', Lightbulb],
  ['lamba', Lightbulb],
  ['sunucu', Server],
  ['ups', Battery],
  ['garaj', DoorOpen],
  ['bahçe', TreePine],
  ['süpürge', Bot],
  ['robot', Bot],
]

export function getApplianceIcon(name: string): LucideIcon {
  const normalized = name.toLowerCase().trim()

  const exact = iconMap[normalized]
  if (exact) return exact

  for (const [keyword, icon] of keywords) {
    if (normalized.includes(keyword)) return icon
  }

  return Zap
}
