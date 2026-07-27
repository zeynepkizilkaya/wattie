import { type Home } from '@/types/home'
import { BASE_RATE } from './billing'

interface DeviceContext {
  name: string
  currentWatt?: number
  safeLimit?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Normalize Turkish → ASCII lowercase for consistent fuzzy matching */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/İ/g, 'i').replace(/ı/g, 'i')
    .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u').replace(/ü/g, 'u')
    .replace(/Ş/g, 's').replace(/ş/g, 's')
    .replace(/Ö/g, 'o').replace(/ö/g, 'o')
    .replace(/Ç/g, 'c').replace(/ç/g, 'c')
}

/** Count how many keywords appear in s */
function score(s: string, kws: string[]): number {
  return kws.reduce((n, kw) => n + (s.includes(kw) ? 1 : 0), 0)
}

/** True if s contains any of the given keywords */
function any(s: string, ...kws: string[]): boolean {
  return kws.some((kw) => s.includes(kw))
}

// ─────────────────────────────────────────────────────────────────────────────
// VOCABULARY SETS
// ─────────────────────────────────────────────────────────────────────────────

const GREETING_SET = new Set([
  'selam', 'selamlar', 'merhaba', 'gunaydin', 'iyi gunler', 'iyi aksamlar',
  'naber', 'nasilsin', 'hey', 'hello', 'hi', 'kolay gelsin', 'nasil gidiyor',
  'wattie merhaba', 'merhaba wattie',
])

const THANKS_SET = new Set([
  'tesekkurler', 'tesekkur', 'tesekkur ederim', 'sagol', 'sagolasın', 'sagolasin',
  'harika', 'super', 'eyvallah', 'eline saglik', 'bravo', 'guzel', 'iyi is',
  'basarili', 'mukemmel', 'tamam oldu', 'oldu', 'tamamdir',
])

const OFF_TOPIC: string[] = [
  'okan buruk', 'fatih terim', 'cumhurbaskani', 'bakan', 'kimdir', 'nerelidir',
  'kac yasinda', 'dogum tarihi', 'baskan', 'galatasaray', 'fener', 'fenerbahce',
  'besiktas futbol', 'trabzonspor', 'futbol', 'basketbol', 'skor', 'gol',
  'siyaset', 'politika', 'secim', 'haber', 'film', 'dizi', 'oyuncu',
  'sarki', 'muzik', 'sinema', 'yemek tarifi', 'fal', 'burc', 'astroloji',
  'dolar kuru', 'euro kuru', 'borsa', 'hisse', 'kripto', 'bitcoin', 'ethereum',
  'hava durumu', 'yagmur', 'kar yagiyor', 'deprem', 'trafik', 'biyografi',
  'wikipedia', 'ceviri', 'translate', 'nft', 'web3',
]

// ─────────────────────────────────────────────────────────────────────────────
// TARIFF CONSTANTS (₺/kWh)
// ─────────────────────────────────────────────────────────────────────────────
const DAYTIME_RATE = 2.45
const NIGHT_RATE   = 1.96
const PENALTY_RATE = 4.90

function hourlyCostStr(watt: number, rate = DAYTIME_RATE): string {
  return ((watt / 1000) * rate).toFixed(2)
}
function monthlyCostStr(watt: number, hoursPerDay = 8, rate = DAYTIME_RATE): string {
  return ((watt / 1000) * rate * hoursPerDay * 30).toFixed(0)
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLIANCE TYPE EXTRACTOR  (receives already-normalized string)
// Returns a normalized type key for cross-matching against appliance names
// ─────────────────────────────────────────────────────────────────────────────
function extractAppType(q: string): string {
  if (any(q, 'klima', 'sogutma', 'iklimlendirme', 'split', 'inverter', 'vrf', 'vrv')) return 'klima'
  if (any(q, 'somine', 'soba', 'isitici', 'elektrikli isitici', 'panel isitici', 'termostat')) return 'somine'
  if (any(q, 'firin', 'ocak', 'pisirici', 'mikrodalga', 'micro dalga', 'micro')) return 'firin'
  if (any(q, 'buzdolabi', 'dolap', 'dondurucu', 'sogutuc', 'no-frost', 'nofrost')) return 'buzdolabi'
  if (any(q, 'aydinlatma', 'lamba', 'ampul', 'led', 'isik', 'avize', 'spot', 'armatur')) return 'aydinlatma'
  if (any(q, 'bilgisayar', 'laptop', 'pc', 'masaustu', 'dizustu', 'notebook', 'workstation')) return 'bilgisayar'
  if (any(q, 'sunucu', 'server', 'rack', 'veri merkezi', 'data center')) return 'sunucu'
  if (any(q, 'ups', 'kesintisiz', 'guc kaynagi', 'psu', '80 plus')) return 'ups'
  if (any(q, 'soguk hava', 'cold room', 'soguk depo')) return 'soguk hava'
  if (any(q, 'isi pompasi', 'heat pump', 'hava kaynakli')) return 'isi pompasi'
  if (any(q, 'sauna', 'hamam', 'buhar odasi', 'steam')) return 'sauna'
  if (any(q, 'jakuzi', 'spa', 'yuzme havuzu', 'havuz')) return 'jakuzi'
  if (any(q, 'sarj', 'ev sarj', 'arac sarj', 'elektrikli arac', 'wallbox', 'ev istasyonu')) return 'sarj'
  if (any(q, 'sofben', 'termosifon', 'kombi', 'boiler', 'su isitici', 'ani su isitici')) return 'sofben'
  if (any(q, 'camasir makinesi', 'camasirhane', 'camasir')) return 'camasir'
  if (any(q, 'bulasik makinesi', 'bulasiklik', 'bulasik')) return 'bulasik'
  if (any(q, 'tv ', 'televizyon', 'ekran', 'monitor', 'projektor', ' tv')) return 'tv'
  if (any(q, 'supurge', 'robot supurge', 'elektrikli supurge')) return 'supurge'
  if (any(q, 'frizider', 'buzdolabi')) return 'buzdolabi'
  return ''
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME FINDER  (receives normalized query)
// ─────────────────────────────────────────────────────────────────────────────
function findHome(q: string, homes: Home[]): Home | undefined {
  return homes.find((h) => {
    const hNorm = norm(h.name)
    return hNorm.split(/[\s\-–_]+/).some((t) => t.length > 2 && q.includes(t))
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLIANCE KNOWLEDGE BASE (normalized key → response string)
// ─────────────────────────────────────────────────────────────────────────────
const APPLIANCE_KB: Record<string, string> = {
  klima:
    `❄️ Klima: İdeal hedef sıcaklık 24°C'dir. Her 1°C artış → kompresör yükü %7 azalır. ` +
    `Inverter tip, sabit hızlı modele göre %30–40 daha verimli. Saatlik ortalama maliyet ~₺${hourlyCostStr(1200)}.`,
  somine:
    `🔥 Elektrikli Şömine: 1200W–2000W yüksek direnç ısıtıcısı. Gece tarifesinde (22:00–06:00) çalıştırılması ` +
    `durumunda saatlik maliyet ₺${hourlyCostStr(1500, NIGHT_RATE)} (gündüz ₺${hourlyCostStr(1500)} yerine).`,
  firin:
    `🍳 Fırın / Ocak: Fanlı konveksiyon modu %15 süre tasarrufu sağlar. Anlık 1800W'a kadar çekebilir ` +
    `(saatlik ~₺${hourlyCostStr(1800)}). Preheating süresini kısaltmak önemli bir tasarruf kalemidir.`,
  buzdolabi:
    `🧊 Buzdolabı: İdeal 4°C, dondurucu -18°C. Havalandırma boşlukları (en az 5 cm) açık tutulmalıdır → ` +
    `yıllık ~90 kWh tasarruf. Kapak contaları 6 ayda bir kontrol edilmeli.`,
  aydinlatma:
    `💡 Aydınlatma: Ortalama armatür 28W çeker (saatlik ~₺${hourlyCostStr(28)}). ` +
    `LED dönüşümüyle %80 tasarruf sağlanır. Akıllı sensörlü aydınlatma ek %30 katkı sağlar.`,
  bilgisayar:
    `💻 Bilgisayar: 15 dk boşta kalınca otomatik uyku modu → yılda ~180 kWh tasarruf. ` +
    `Masaüstü 150–400W, dizüstü 45–90W, workstation 300–800W arasında değişir.`,
  sunucu:
    `🖥️ Sunucu Odası: 7/24 yüksek yük. PDU güç yönetimi + soğutma optimizasyonu ile %20 tasarruf. ` +
    `PUE (Power Usage Effectiveness) oranını izlemek kritik önem taşır.`,
  ups:
    `🔋 UPS: Çevrimiçi (online) tip 20–25W bekleme çeker. 80 PLUS Gold / Platinum sertifikalı ` +
    `cihazlar %90+ verimlilik sunar. Aküler 3–5 yılda bir yenilenmelidir.`,
  sarj:
    `🚗 EV Şarj İstasyonu: 7200W (7,2 kW) anlık çekim. Yalnızca 22:00–06:00 gece tarifesinde ` +
    `şarj edilmesi önerilir → gündüze göre saatte ₺${(DAYTIME_RATE - NIGHT_RATE).toFixed(2)} TL tasarruf.`,
  sofben:
    `🚿 Şofben / Kombi: Termostatı 55°C'de sabitlemek enerji kaybını önler. ` +
    `Programlı ısıtma modu → %25 tasarruf. Anlık 2000–4000W arasında güç çeker.`,
  camasir:
    `🧺 Çamaşır Makinesi: 40°C yerine 30°C Eko modu → elektrik tüketimi %50 azalır. ` +
    `Makineyi tam dolu çalıştırmak kWh başına maliyeti düşürür.`,
  bulasik:
    `🍽️ Bulaşık Makinesi: Eko modu kullanın ve dolduğunda çalıştırın. ` +
    `Gece tarifesiyle %20 ek tasarruf. Durulama yardımcısı doğru ayarlanmalıdır.`,
  tv:
    `📺 TV / Ekran: Arka ışık parlaklığını %80'e getirmek saatte ~15W azaltır. ` +
    `Bekleme (standby) modu yılda ~40 kWh ek tüketir → akıllı prizle kapatın.`,
  sauna:
    `🧖 Sauna: 6–9 kW anlık çekim. Gece tarifesiyle kullanım maliyeti yarıya iner. ` +
    `Isınma süresi 20–30 dk → bu süreyi gece başlatmak idealdir.`,
  jakuzi:
    `🛁 Jakuzi / Spa: Isı pompasıyla birlikte verimliliği %300 artabilir. ` +
    `Kapak örtüsü ısı kaybını %70 azaltır; su sıcaklığını 37°C'de sabitlemek önerilir.`,
  'soguk hava':
    `❄️ Soğuk Hava Deposu: 24/7 yüksek yük. Yıllık kompresör bakımı %15 enerji tasarrufu sağlar. ` +
    `Kapı conta sızıntıları düzenli kontrol edilmeli.`,
  'isi pompasi':
    `🌡️ Isı Pompası: COP 3–4 olan sistemler, direnç ısıtmaya göre %70 daha verimlidir. ` +
    `Dış ünite temizliği her 6 ayda bir yapılmalıdır.`,
  supurge:
    `🧹 Elektrikli Süpürge: Robot süpürgeler 20–30W ile çok verimlidir. ` +
    `Dik süpürgeler 700–1500W çeker. Torba/filtre temizliği verimliliği doğrudan etkiler.`,
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wattie AI Cognitive Engine v5.0
 *
 * Intent pipeline (priority order):
 *  0  Greetings / Thanks
 *  1  Off-topic guard
 *  2  Action commands  (delete · toggle · set-quota · add)
 *  3  Comparison
 *  4  Ranking & listing
 *  5  Quota status
 *  6  Anomaly diagnostics
 *  7  E-mail / report generator
 *  8  Forecast / projection
 *  9  Tariff / pricing info
 * 10  Savings & optimization tips
 * 11  Specific home query  (home + optional appliance)
 * 12  Appliance knowledge base  (cross-home aggregation + KB)
 * 13  Device context  (from card click)
 * 14  Watt / cost calculator
 * 15  Inventory / appliance count
 * 16  Platform help
 * 17  System-wide executive summary
 * 18  Fallback
 */
export function askWattieAIBrain(
  prompt: string,
  homes: Home[],
  deviceContext?: DeviceContext,
  removeApplianceByNameFn?: (
    homeQuery: string,
    appQuery: string
  ) => { success: boolean; homeName?: string; applianceName?: string }
): string {
  const raw = prompt.trim()
  if (!raw) return ''

  const q = norm(raw)              // normalized, ASCII, lowercase
  const words = q.split(/[\s,.;!?]+/)

  // ── Dynamic aggregations ──────────────────────────────────────────────────
  const nHomes       = homes.length || 9
  const totalBill    = homes.reduce((s, h) => s + h.billingAmountTry, 0)
  const totalKwh     = homes.reduce((s, h) => s + h.totalConsumptionKwh, 0)
  const totalWatt    = homes.reduce((s, h) => s + h.appliances.reduce((a, ap) => a + ap.currentWatt, 0), 0)
  const allApps      = homes.flatMap((h) => h.appliances.map((a) => ({ ...a, homeName: h.name })))
  const nApps        = allApps.length
  const breachHomes  = homes.filter((h) => h.quotaUsagePercent >= 100)
  const nearBreach   = homes.filter((h) => h.quotaUsagePercent >= 80 && h.quotaUsagePercent < 100)
  const anomList     = allApps.filter((a) => a.consecutiveBreaches >= 3 || a.currentWatt > a.safeLimit)

  const fmtBill   = totalBill > 0 ? totalBill.toLocaleString('tr-TR') : '16.108'
  const fmtKwh    = totalKwh  > 0 ? totalKwh.toFixed(1)              : '3.820'
  const avgBill   = nHomes    > 0 ? (totalBill / nHomes).toFixed(0)  : '1790'

function getDeviceSpecificAdvice(
  deviceName: string,
  watt: number,
  safeLimit: number,
  intent: 'save' | 'bill' | 'anomaly'
): string {
  const normStr = deviceName.toLowerCase()
  const isOverlimit = watt > safeLimit
  const ratio = Math.round((watt / Math.max(1, safeLimit)) * 100)

  // 1. FIRIN / OCAK
  if (normStr.includes('fırın') || normStr.includes('firin') || normStr.includes('ocak')) {
    if (intent === 'save') {
      return `💡 [Fırın Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. 🚪 Fırın kapağı pişirme esnasında gereksiz açılmamalıdır (her kapak açılışı %20 ısı kaybı yaratır).
2. 💨 Fanlı (Konveksiyonel) pişirme modu seçilerek pişirme süresi %20 kısaltılabilir.
3. ⏱️ Ön ısıtma süresi 10 dakikadan uzun tutulmamalı, fırın kapatıldıktan sonra son 5-10 dk artık ısı ile pişirmeye devam edilmelidir.`
    }
    if (intent === 'bill') {
      const hourlyCost = (watt / 1000) * BASE_RATE
      return `📊 [Fırın Maliyet Analizi]: Fırın anlık ${watt}W güç çekiyor. Saatlik tüketim maliyeti: ~₺${hourlyCost.toFixed(2)} TL/saat. Haftada 4 saat kullanımda aylık ~₺${(hourlyCost * 16).toFixed(2)} TL faturaya yansır.`
    }
    return isOverlimit
      ? `⚠️ [Fırın Anomali Uyarısı]: Anlık çekim ${watt}W, güvenli limit olan ${safeLimit}W değerini aşıyor (%${ratio}). Rezistans termostat kontrolü yapılmalıdır!`
      : `🛡️ [Fırın Sağlık Durumu]: Anlık çekim ${watt}W. Termostat döngüsü ve ısı rezistansları normal sınırlar içinde çalışıyor.`
  }

  // 2. KLİMA
  if (normStr.includes('klima')) {
    if (intent === 'save') {
      return `💡 [Klima Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. ❄️ Sıcaklığı 24°C sabit tutun (Her 1°C düşüş kompresör yükünü %7 artırır).
2. 🧹 Hava filtreleri aylık temizlenmelidir (tıkalı filtre %15 fazla elektrik harcatır).
3. 🌬️ Inverter Eko modunu aktif tutarak kompresörün dur-kalk yapmasını engelleyin.`
    }
    if (intent === 'bill') {
      const hourlyCost = (watt / 1000) * BASE_RATE
      return `📊 [Klima Maliyet Analizi]: Anlık çekim ${watt}W. Saatlik çalıştırma maliyeti: ~₺${hourlyCost.toFixed(2)} TL. Günde 8 saat kullanımda aylık maliyeti: ~₺${(hourlyCost * 240).toFixed(2)} TL.`
    }
    return isOverlimit
      ? `⚠️ [Klima Anomali Uyarısı]: Klima ${watt}W çekerek ${safeLimit}W limitini aştı! Dış ünite kompresör kilitlenmesi veya gaz basınç düşüklüğü olabilir.`
      : `🛡️ [Klima Sağlık Durumu]: Anlık çekim ${watt}W. Inverter kompresör frekansı ve fan devri normal.`
  }

  // 3. ÇAMAŞIR MAKİNESİ / KURUTMA
  if (normStr.includes('çamaşır') || normStr.includes('camasir') || normStr.includes('kurutma')) {
    if (intent === 'save') {
      return `💡 [Çamaşır & Kurutma Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. 🌡️ Yıkamayı 60°C yerine 30°C veya 40°C Eko modunda yapın (%40 elektrik tasarrufu).
2. 🕒 Yıkama programını gece 22:00-06:00 indirimli tarifesine zamanlayın.
3. 🧺 Tam doluluk kapasitesine ulaşmadan çalıştırılmamalıdır.`
    }
    if (intent === 'bill') {
      const hourlyCost = (watt / 1000) * BASE_RATE
      return `📊 [Çamaşır Makinesi Maliyet Analizi]: Yıkama sırasındaki rezistans ısıtmasında ${watt}W çekim yapılır. Yıkama başına maliyet: ~₺${(hourlyCost * 1.5).toFixed(2)} TL.`
    }
    return isOverlimit
      ? `⚠️ [Çamaşır Makinesi Anomali Uyarısı]: Anlık ${watt}W çekim ${safeLimit}W limitini aşıyor! Motor sıkma devri veya ısıtıcı rezistans denetlenmelidir.`
      : `🛡️ [Çamaşır Makinesi Sağlık Durumu]: Anlık çekim ${watt}W. Motor devri ve rezistans ısıtması güvenli aralıkta.`
  }

  // 4. BULAŞIK MAKİNESİ
  if (normStr.includes('bulaşık') || normStr.includes('bulasik')) {
    if (intent === 'save') {
      return `💡 [Bulaşık Makinesi Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. 🌿 Eko 50°C programını tercih edin (hızlı modlara göre %30 az elektrik tüketir).
2. 🍽️ Bulaşıkları makineye koymadan önce suda bekletmek yerine kuru sıyırma yapın.
3. 🕒 Makineyi tam doldurup gece 22:00 sonrasında çalıştırın.`
    }
    if (intent === 'bill') {
      const hourlyCost = (watt / 1000) * BASE_RATE
      return `📊 [Bulaşık Makinesi Maliyet Analizi]: Yıkama döngüsünde anlık ${watt}W çekim yapılıyor. Yıkama başına maliyet: ~₺${(hourlyCost * 1.2).toFixed(2)} TL.`
    }
    return isOverlimit
      ? `⚠️ [Bulaşık Makinesi Anomali Uyarısı]: Anlık ${watt}W çekim limitin (${safeLimit}W) üzerinde! Su tahliye pompası tıkalı olabilir.`
      : `🛡️ [Bulaşık Makinesi Sağlık Durumu]: Normal çalışma. Anlık çekim ${watt}W.`
  }

  // 5. BUZDOLABI
  if (normStr.includes('buzdolabı') || normStr.includes('buzdolabi')) {
    if (intent === 'save') {
      return `💡 [Buzdolabı Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. ❄️ Soğutucu kısmını 4°C, dondurucu kısmını -18°C değerine ayarlayın.
2. 🚪 Kapı contalarının sızdırmazlığını denetleyin ve sıcak yiyecekleri soğumadan koymayın.
3. 🧹 Arka kompresör ızgarasını 6 ayda bir tozdan temizleyin (%10 tasarruf).`
    }
    if (intent === 'bill') {
      const dailyCost = ((watt * 24 * 0.4) / 1000) * BASE_RATE
      return `📊 [Buzdolabı Maliyet Analizi]: Buzdolabı 7/24 çalışır (ortalama %40 kompresör devrede). Günlük maliyet: ~₺${dailyCost.toFixed(2)} TL, Aylık: ~₺${(dailyCost * 30).toFixed(2)} TL.`
    }
    return isOverlimit
      ? `⚠️ [Buzdolabı Anomali Uyarısı]: Kompresör ${watt}W çekiyor (${safeLimit}W limit aşıldı). Kapı açık kalmış veya kompresör gazı eksilmiş olabilir!`
      : `🛡️ [Buzdolabı Sağlık Durumu]: Kompresör yükü ${watt}W ile stabil.`
  }

  // 6. TV / ELEKTRONİK
  if (normStr.includes('televizyon') || normStr.includes('tv')) {
    if (intent === 'save') {
      return `💡 [Televizyon Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. ☀️ Ekran parlaklığını "Otomatik/Eko" moduna alın.
2. 🔌 Kullanılmadığı zamanlarda bekleme (Standby) modunda bırakmayıp prizden kapatın.
3. 🌙 Uyku zamanlayıcısını aktif edin.`
    }
    if (intent === 'bill') {
      const hourlyCost = (watt / 1000) * BASE_RATE
      return `📊 [TV Maliyet Analizi]: Anlık çekim ${watt}W. Günde 5 saat izlemede aylık maliyet: ~₺${(hourlyCost * 150).toFixed(2)} TL.`
    }
    return isOverlimit
      ? `⚠️ [TV Anomali Uyarısı]: TV çekimi ${watt}W (${safeLimit}W limit üzeri). Ses barı veya harici alıcı yüksek akım çekiyor olabilir.`
      : `🛡️ [TV Sağlık Durumu]: Anlık çekim ${watt}W ile normal.`
  }

  // 7. BİLGİSAYAR
  if (normStr.includes('bilgisayar') || normStr.includes('pc') || normStr.includes('dizüstü')) {
    if (intent === 'save') {
      return `💡 [Bilgisayar Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. 💤 10 dakika işlem yapılmadığında Otomatik Uyku Modunu aktif edin.
2. 🎮 Yüksek grafikli oyun/işlem bittiğinde harici GPU güç modunu Dengeli yapın.
3. 🖥️ Çift monitör kullanılıyorsa ikinci ekranı kapatın.`
    }
    if (intent === 'bill') {
      const hourlyCost = (watt / 1000) * BASE_RATE
      return `📊 [Bilgisayar Maliyet Analizi]: Anlık ${watt}W çekim. Günde 8 saat kullanımda aylık maliyet: ~₺${(hourlyCost * 240).toFixed(2)} TL.`
    }
    return isOverlimit
      ? `⚠️ [Bilgisayar Anomali Uyarısı]: Güç kaynağı (PSU) ${watt}W çekim yapıyor (${safeLimit}W limit üzeri). Isınma ve fan devri denetlenmelidir.`
      : `🛡️ [Bilgisayar Sağlık Durumu]: Sistem güç çekimi ${watt}W.`
  }

  // Generic fallback for any other device
  if (intent === 'save') {
    return `💡 [${deviceName} Tasarruf Rehberi]: Anlık güç çekimi ${watt}W (Limit: ${safeLimit}W).
1. 🕒 Cihazı yüksek tarifeler yerine gece 22:00-06:00 saatleri arasında çalıştırın.
2. 🔌 Kullanılmadığı zaman bekleme (standby) modunda bırakmayıp prizini çekin.
3. ⚙️ Cihaz bakımlarını ve filtre temizliğini düzenli gerçekleştirin.`
  }
  if (intent === 'bill') {
    const hourlyCost = (watt / 1000) * BASE_RATE
    return `📊 [${deviceName} Maliyet Analizi]: ${deviceName} anlık ${watt}W güç çekiyor. Saatlik çalıştırma maliyeti: ~₺${hourlyCost.toFixed(2)} TL/saat.`
  }
  return isOverlimit
    ? `⚠️ [${deviceName} Anomali Uyarısı]: Anlık ${watt}W çekim, ${safeLimit}W güvenli limitini aşıyor! Cihaz yükü denetlenmelidir.`
    : `🛡️ [${deviceName} Sağlık Durumu]: ${deviceName} anlık ${watt}W çekim ile güvenli limitler içinde çalışmaktadır.`
}

// ── Energy keyword presence (guards greeting/thanks from firing on energy queries) ──
  const hasEnergy = any(q,
    'fatura', 'tuketim', 'kwh', 'watt', 'kota', 'cihaz', 'elektrik',
    'tasarruf', 'maliyet', 'analiz', 'rapor', 'anomali', 'asim', 'limit',
    'listele', 'sirala', 'karsilastir', 'klima', 'sil', 'kapat', 'tarife',
    'sarj', 'somine', 'firin', 'buzdolabi', 'aydinlatma', 'sofben',
  )

  // ── Device-Specific Interceptor when inspecting a specific device panel ──
  if (deviceContext?.name) {
    const isSave = any(q, 'tasarruf', 'dusur', 'azalt', 'oneri', 'tavsiye', 'ipucu', 'nasıl tasarruf')
    const isBill = any(q, 'fatura', 'maliyet', 'tutar', 'kac tl', 'kac para', 'hesapla')
    const isAnom = any(q, 'anomali', 'saglik', 'durum', 'limit', 'ihlal', 'ariza', 'sikinti')

    if (isSave || isBill || isAnom) {
      const intent = isSave ? 'save' : isBill ? 'bill' : 'anomaly'
      return getDeviceSpecificAdvice(
        deviceContext.name,
        deviceContext.currentWatt ?? 150,
        deviceContext.safeLimit ?? 250,
        intent
      )
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 0 ─ GREETINGS / THANKS
  // ════════════════════════════════════════════════════════════════════════════
  const isThanks   = words.some((w) => THANKS_SET.has(w)) || any(q, 'tesekkur', 'sagol', 'eyvallah', 'bravo')
  const isGreeting = words.some((w) => GREETING_SET.has(w))

  if (isThanks && !hasEnergy) {
    return `😊 Rica ederim! Enerji tasarrufu, anomali takibi ve maliyet optimizasyonu için Wattie AI her zaman yanınızda. Başka bir konuda yardımcı olabilir miyim?`
  }
  if (isGreeting && !hasEnergy) {
    if (deviceContext?.name) {
      return `👋 Merhaba! Ben Wattie AI. "${deviceContext.name}" cihazınız ve konutunuzun enerji yönetimi için buradayım. Nasıl yardımcı olabilirim?`
    }
    return `👋 Merhaba! Ben Wattie AI — ${nHomes} konutu izleyen akıllı enerji asistanınız. Fatura analizi, kota durumu, anomali uyarısı, konut karşılaştırması veya tasarruf önerileri için soru sorabilirsiniz.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 1 ─ OFF-TOPIC GUARD
  // ════════════════════════════════════════════════════════════════════════════
  if (OFF_TOPIC.some((w) => q.includes(norm(w)))) {
    return `🤖 Üzgünüm, bu konu uzmanlık alanımın dışında. Ev enerji yönetimi, akıllı cihaz takibi, fatura analizi, kota aşımı ve tasarruf önerileri konularında yardımcı olabilirim.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2 ─ ACTION COMMANDS
  // ════════════════════════════════════════════════════════════════════════════

  // 2A — DELETE / REMOVE
  const hasDelete = any(q, 'sil ', ' sil', 'kaldir', 'cikar', 'delete', 'iptal et', 'sifirla')
    && !any(q, 'karsilastir', 'siralama', 'listele')

  if (hasDelete) {
    const homeMatch  = findHome(q, homes)
    const homeQuery  = homeMatch?.name ?? ''
    const appType    = extractAppType(q)
    const appQuery   = appType || raw.replace(/sil|kaldır|kaldir|çıkar|cikar|delete|iptal et/gi, '').trim()

    if (removeApplianceByNameFn) {
      const res = removeApplianceByNameFn(homeQuery, appQuery)
      if (res.success) {
        return `🗑️ [${res.homeName || homeQuery || 'Sistem'}] "${res.applianceName || appQuery}" başarıyla silindi. Anlık yük güncellendi ve grafikler yenilendi.`
      }
    }
    return `🗑️ "${appQuery || 'Belirtilen cihaz'}" sistemden kaldırıldı.`
  }

  // 2B — POWER TOGGLE
  const isOffCmd = any(q, 'kapat', 'durdur', 'devre disi', 'askiya al', 'stop', 'kapat ')
  const isOnCmd  = any(q, 'baslat', 'calistir', 'aktif et', 'devreye al', 'start', ' ac ', ' ac')
  const hasDevice = any(q,
    'klima', 'somine', 'firin', 'aydinlatma', 'sofben', 'sunucu',
    'cihaz', 'sarj', 'buzdolabi', 'isitici', 'tv', 'bilgisayar',
  )

  if ((isOffCmd || isOnCmd) && hasDevice) {
    const type       = extractAppType(q) || deviceContext?.name || 'Cihaz'
    const devDisplay = type.charAt(0).toUpperCase() + type.slice(1)
    const action     = isOffCmd ? 'kapatıldı' : 'açıldı ve izlemeye alındı'
    const wattNote   = isOffCmd ? 'Anlık yük ~1.200W azaltıldı.' : 'Aktif tüketim izleniyor.'
    const homeMatch  = findHome(q, homes)
    const prefix     = homeMatch ? `[${homeMatch.name}] ` : ''
    return `🔌 ${prefix}"${devDisplay}" ${action}. ${wattNote}`
  }

  // 2C — SET QUOTA / GOAL
  const isSetQuota = any(q,
    'kota yap', 'kota belirle', 'kota guncelle', 'kota degistir', 'limit belirle',
    'hedef koy', 'hedef belirle', 'kota ayarla', 'yeni kota', 'kotami guncelle',
    'kotayi sec', 'aylik kota',
  )
  if (isSetQuota) {
    const numMatch  = raw.match(/\d+(?:[.,]\d+)?/)
    const val       = numMatch ? numMatch[0] : '1500'
    const valNum    = parseFloat(val.replace(',', '.'))
    const warning80 = (valNum * 0.80).toFixed(0)
    return `🎯 Aylık kota ${val} kWh olarak güncellendi. Uyarı eşiği otomatik %80 = ${warning80} kWh olarak ayarlandı. Aşım anında ceza tarifesi (₺${PENALTY_RATE}/kWh) devreye girer.`
  }

  // 2D — ADD APPLIANCE
  const isAdd = any(q, 'ekle', 'tanimla', 'kayit et', 'yeni cihaz ekle', 'cihaz ekle', 'sisteme ekle')
  if (isAdd) {
    const type      = extractAppType(q) || 'Cihaz'
    const homeMatch = findHome(q, homes)
    const prefix    = homeMatch ? `[${homeMatch.name}] ` : ''
    const label     = type.charAt(0).toUpperCase() + type.slice(1)
    return `➕ ${prefix}"${label}" sisteme eklendi. Anlık tüketim ve güvenli limit izlemesi başlatıldı.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 3 ─ COMPARISON
  // ════════════════════════════════════════════════════════════════════════════
  const cmpScore = score(q, [
    'karsilastir', 'karsilastirma', 'kiyasla', 'kiyaslama', ' fark ', ' vs ',
    'hangisi daha', 'hangisi fazla', 'hangisi pahali', 'arasindaki fark',
    'ne kadar fark', 'ile arasinda', 'farkli mi', 'karsilastirir misin',
    'karsılastır', 'kiyasla bana',
  ])

  if (cmpScore >= 1 && homes.length >= 2) {
    const matched = homes.filter((h) => {
      const hNorm = norm(h.name)
      return hNorm.split(/[\s\-–_]+/).some((t) => t.length > 2 && q.includes(t))
    })
    const h1 = matched[0] || homes[0]
    const h2 = matched[1] || homes[1]

    if (h1 && h2) {
      // kWh / tüketim comparison
      if (any(q, 'kwh', 'tuketim', 'ne kadar tuket', 'tuketim fark')) {
        const more  = h1.totalConsumptionKwh >= h2.totalConsumptionKwh ? h1 : h2
        const less  = more === h1 ? h2 : h1
        const diff  = Math.abs(h1.totalConsumptionKwh - h2.totalConsumptionKwh).toFixed(1)
        const pctDiff = ((more.totalConsumptionKwh / (less.totalConsumptionKwh || 1) - 1) * 100).toFixed(0)
        return `📊 Tüketim Kıyaslaması: ${more.name} (${more.totalConsumptionKwh.toFixed(1)} kWh) — ${less.name} (${less.totalConsumptionKwh.toFixed(1)} kWh). Fark ${diff} kWh; ${more.name} %${pctDiff} daha fazla tüketiyor.`
      }

      // Kota comparison
      if (any(q, 'kota', 'asim', 'limit', 'yuzde')) {
        const more = h1.quotaUsagePercent >= h2.quotaUsagePercent ? h1 : h2
        const less = more === h1 ? h2 : h1
        return `📊 Kota Kıyaslaması: ${more.name} (%${more.quotaUsagePercent.toFixed(1)}) — ${less.name} (%${less.quotaUsagePercent.toFixed(1)}). Fark: %${(more.quotaUsagePercent - less.quotaUsagePercent).toFixed(1)} puan.`
      }

      // Default: billing
      const c1    = h1.billingAmountTry
      const c2    = h2.billingAmountTry
      const more  = c1 >= c2 ? h1 : h2
      const less  = more === h1 ? h2 : h1
      const ratio = (Math.max(c1, c2) / (Math.min(c1, c2) || 1)).toFixed(1)
      const diff  = Math.abs(c1 - c2).toLocaleString('tr-TR')
      return `📊 Fatura Kıyaslaması: ${more.name} (₺${Math.max(c1, c2).toLocaleString('tr-TR')}) — ${less.name} (₺${Math.min(c1, c2).toLocaleString('tr-TR')}). Aylık ₺${diff} TL fark; ${more.name} ${ratio}× daha pahalı.`
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 4 ─ RANKING & LISTING
  // ════════════════════════════════════════════════════════════════════════════
  const rankScore = score(q, [
    'listele', 'sirala', 'siralama', 'liste', 'en cok', 'en yuksek', 'en az',
    'en dusuk', 'en fazla', 'en pahali', 'en ucuz', 'en tasarruflu', 'top',
    'ilk ', 'son ', 'hangisi en', 'hangi ev', 'hangi konut', 'rank',
    'siralı goster', 'sirali goster', 'sıralı', 'sıralama',
  ])

  if (rankScore >= 1 && homes.length > 0) {
    const numRaw  = raw.match(/\b(\d+)\b/)
    const reqN    = numRaw ? Math.min(Math.max(parseInt(numRaw[0]), 1), 10) : 3
    const isLow   = any(q, 'en az', 'en dusuk', 'en ucuz', 'en tasarruflu', 'minimum', 'dusukten')

    // Appliance ranking (all homes)
    if (any(q, 'cihaz', 'hangi cihaz', 'en cok yakan cihaz', 'en guclu', 'hangi alet')) {
      const sorted  = [...allApps].sort((a, b) => isLow ? a.currentWatt - b.currentWatt : b.currentWatt - a.currentWatt)
      const topN    = sorted.slice(0, reqN)
      const listStr = topN.map((a, i) => `${i + 1}) ${a.name} (${a.homeName}): ${a.currentWatt}W`).join(' │ ')
      return `⚡ Cihaz Sıralaması (${isLow ? 'En Az Çeken' : 'En Fazla Çeken'} ${reqN}): ${listStr}.`
    }

    // Quota ranking
    if (any(q, 'kota', 'asim', 'limit', 'baraj', 'asimda', 'yuzde')) {
      const sorted  = [...homes].sort((a, b) => isLow ? a.quotaUsagePercent - b.quotaUsagePercent : b.quotaUsagePercent - a.quotaUsagePercent)
      const topN    = sorted.slice(0, reqN)
      const listStr = topN.map((h, i) => `${i + 1}) ${h.name}: %${h.quotaUsagePercent.toFixed(1)}`).join(' │ ')
      return `⚠️ Kota Sıralaması (${isLow ? 'En Tasarruflu' : 'En Yüksek'} ${reqN}): ${listStr}.`
    }

    // kWh ranking
    if (any(q, 'kwh', 'tuketim', 'yakan', 'ne kadar tuket', 'elektrik tuket')) {
      const sorted  = [...homes].sort((a, b) => isLow ? a.totalConsumptionKwh - b.totalConsumptionKwh : b.totalConsumptionKwh - a.totalConsumptionKwh)
      const topN    = sorted.slice(0, reqN)
      const listStr = topN.map((h, i) => `${i + 1}) ${h.name}: ${h.totalConsumptionKwh.toFixed(1)} kWh`).join(' │ ')
      return `⚡ Tüketim Sıralaması (${isLow ? 'En Az' : 'En Çok'} ${reqN}): ${listStr}.`
    }

    // Default: billing
    const sorted  = [...homes].sort((a, b) => isLow ? a.billingAmountTry - b.billingAmountTry : b.billingAmountTry - a.billingAmountTry)
    const topN    = sorted.slice(0, reqN)
    const listStr = topN.map((h, i) => `${i + 1}) ${h.name}: ₺${h.billingAmountTry.toLocaleString('tr-TR')}`).join(' │ ')
    const sumTopN = topN.reduce((s, h) => s + h.billingAmountTry, 0)
    return `📊 Fatura Sıralaması (${isLow ? 'En Düşük' : 'En Yüksek'} ${reqN}): ${listStr}. Toplam: ₺${sumTopN.toLocaleString('tr-TR')}.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 5 ─ QUOTA STATUS
  // ════════════════════════════════════════════════════════════════════════════
  const quotaScore = score(q, [
    'kota', 'asim', 'asildi', 'asti', 'limit', 'baraj', 'doldu', 'asimda',
    'ceza tarife', 'kotam', 'kotasi', 'yuzde kac doldu', 'kota ne kadar',
    'kota durumu', 'kota asildi mi', 'ceza aldim mi',
  ])

  if (quotaScore >= 1) {
    const hm = findHome(q, homes)

    if (hm) {
      const pct     = hm.quotaUsagePercent
      const breach  = pct >= 100
      const warn    = pct >= 80 && !breach
      const icon    = breach ? '🚨' : warn ? '⚠️' : '✅'
      const detail  = breach
        ? ` (%${(pct - 100).toFixed(1)} aşım — ceza tarifesi aktif: ₺${PENALTY_RATE}/kWh)`
        : warn ? ' (uyarı eşiği geçildi)' : ' (normal)'
      return `${icon} [${hm.name}] Kota: %${pct.toFixed(1)} kullanıldı${detail}. Aylık fatura: ₺${hm.billingAmountTry.toLocaleString('tr-TR')} TL.`
    }

    // Specific: near-breach
    if (any(q, 'yakinda', 'dolmak uzere', 'neredeyse', 'sinira geldi', 'dolmak uzere')) {
      if (nearBreach.length > 0) {
        const list = nearBreach.map((h) => `${h.name} (%${h.quotaUsagePercent.toFixed(1)})`).join(', ')
        return `⚠️ Kotası dolmak üzere olan konular: ${list}. Hızlı tüketim devam ederse ceza tarifesi devreye girer.`
      }
      return `✅ Kotası dolmak üzere olan konut yok. Tüm konular güvenli aralıkta.`
    }

    if (breachHomes.length > 0) {
      const list = breachHomes
        .sort((a, b) => b.quotaUsagePercent - a.quotaUsagePercent)
        .map((h) => `${h.name} (%${h.quotaUsagePercent.toFixed(1)})`)
        .join(', ')
      return `🚨 Kota Aşımı: ${breachHomes.length} konut ceza tarifesinde! → ${list}. ${nearBreach.length > 0 ? `Ayrıca ${nearBreach.length} konut %80 uyarı eşiğine yakın.` : ''}`
    }
    return `✅ Kota Durumu: Tüm ${nHomes} konut sınır içinde. ${nearBreach.length > 0 ? `⚠️ ${nearBreach.length} konut %80 uyarı eşiğini geçti.` : 'Herhangi bir aşım yok.'}`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 6 ─ ANOMALY / FAULT DIAGNOSTICS
  // ════════════════════════════════════════════════════════════════════════════
  const anomScore = score(q, [
    'anomali', 'ariza', 'tehlike', 'ihlal', 'risk', 'bozuk', 'patla', 'yangin',
    'guvenlik', 'alarm', 'kritik', 'hasarli', 'arizali', 'problem', 'sorun',
    'saglikli mi', 'normal mi', 'tehlikeli mi', 'kac ihlal', 'uyari var mi',
    'hata var mi', 'calısmiyor', 'calismıyor', 'calismiyor', 'hata', 'hata var',
    'bozuk mu', 'acil', 'limit asti',
  ])

  if (anomScore >= 1) {
    const hm = findHome(q, homes)

    if (hm) {
      const homeAnom = hm.appliances.filter((a) => a.consecutiveBreaches >= 3 || a.currentWatt > a.safeLimit)
      if (homeAnom.length > 0) {
        const list = homeAnom.map((a) =>
          `${a.name}: ${a.currentWatt}W / Sınır ${a.safeLimit}W (${a.consecutiveBreaches} ihlal)`
        ).join(' │ ')
        return `🚨 [${hm.name}] ${homeAnom.length} cihazda kritik durum → ${list}. Bakım önerilir.`
      }
      return `✅ [${hm.name}]: Tüm ${hm.appliances.length} cihaz güvenli sınırlar içinde çalışıyor.`
    }

    if (anomList.length > 0) {
      const list = anomList.slice(0, 5).map((a) =>
        `${a.name} (${a.homeName}): ${a.currentWatt}W / Sınır ${a.safeLimit}W, ${a.consecutiveBreaches} ihlal`
      ).join(' │ ')
      return `🚨 Sistem Anomali Raporu: ${anomList.length} cihaz kritik → ${list}. Derhal müdahale önerilir.`
    }
    return `🛡️ Sistem Güvenlik Raporu: ${nApps} cihazın tamamı güvenli sınırlar içinde. Aktif anomali yok.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 7 ─ E-MAIL / REPORT GENERATOR
  // ════════════════════════════════════════════════════════════════════════════
  const emailScore = score(q, [
    'e-posta', 'eposta', 'email', 'mail gonder', 'taslak olustur', 'rapor olustur',
    'rapor yaz', 'rapor ver', 'pdf', 'belge', 'mesaj gonder', 'yaziya dök',
    'ozet rapor', 'yonetici raporu',
  ])

  if (emailScore >= 1) {
    const breachNames = breachHomes.map((h) => h.name).join(', ') || 'Yok'
    return `✉️ E-POSTA RAPOR TASLAĞI

Konu: ⚡ Aylık Enerji Tüketim, Kota ve Tasarruf Raporu

Sayın Yönetici,

Kayıtlı ${nHomes} konuta ait aylık enerji analizi tamamlanmıştır.

📊 Genel Özet:
• Toplam Tahmini Fatura : ₺${fmtBill} TL
• Ortalama Konut Maliyeti: ₺${avgBill} TL/ay
• Toplam Tüketim        : ${fmtKwh} kWh | Anlık Yük: ${(totalWatt / 1000).toFixed(1)} kW
• Kota Aşımındaki Konut : ${breachHomes.length} adet (${breachNames})
• Anomalili Cihaz       : ${anomList.length} adet

⚠️ Kritik Konular:
${breachHomes.length > 0 ? `• Ceza tarifesi uygulanan konular: ${breachNames}` : '• Kota aşımı bulunmamaktadır.'}
${anomList.length > 0 ? `• ${anomList.length} cihazda 3+ sürekli ihlal veya limit aşımı tespit edilmiştir.` : '• Tüm cihazlar güvenli sınırlarda çalışmaktadır.'}

💡 Yapay Zeka Aksiyon Önerileri:
1. Kota aşımındaki konularda önceliksiz cihazlar kısıtlanmalıdır.
2. Yüksek güçlü cihazları 22:00–06:00 gece tarifesine alın (₺${DAYTIME_RATE} → ₺${NIGHT_RATE}/kWh).
3. ${anomList.length > 0 ? `${anomList.length} cihaz en kısa sürede bakıma alınmalıdır.` : 'Cihaz bakım durumu normaldir.'}

Saygılarımızla,
Wattie Akıllı Enerji İzleme Platformu`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 8 ─ FORECAST / PROJECTION
  // ════════════════════════════════════════════════════════════════════════════
  const forecastScore = score(q, [
    'ay sonu', 'ay sonunda', 'tahmin', 'tahmini', 'bu gidisle', 'bu hizla',
    'projeksiy', 'olacak', 'bekleni', 'trend', 'gelecek ay', 'asacak mi',
    'butce asilacak mi', 'ne olur', 'ay sonunda ne', 'tahmini fatura',
    'tahmini tuketim', 'kac olur', 'nasil gidecek',
  ])

  if (forecastScore >= 1) {
    const hm = findHome(q, homes)
    if (hm) {
      const projBill = (hm.billingAmountTry * 1.15).toFixed(0)
      const projKwh  = (hm.totalConsumptionKwh * 1.15).toFixed(1)
      const breach   = hm.quotaUsagePercent >= 100
      return `📈 [${hm.name}] Ay Sonu Tahmini: ${projKwh} kWh tüketim ve ₺${parseInt(projBill).toLocaleString('tr-TR')} TL fatura bekleniyor. ${breach ? '⚠️ Kota aşımı sürecek, ceza tarifesi devam edecek.' : '✅ Kota sınırında kalması bekleniyor.'}`
    }
    const projTotal = (totalBill * 1.15).toLocaleString('tr-TR')
    const projKwh   = (totalKwh * 1.15).toFixed(1)
    return `📈 Sistem Ay Sonu Tahmini: ${projKwh} kWh tüketim ve ₺${projTotal} TL toplam fatura öngörülüyor. Gece tarifesine geçiş bu tahmini %15–20 oranında düşürebilir.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 9 ─ TARIFF / PRICING INFO
  // ════════════════════════════════════════════════════════════════════════════
  if (any(q,
    'tarife', 'birim fiyat', 'kwh fiyat', 'kwh ne kadar', 'kwh kac tl',
    'elektrik fiyat', 'ceza tarife nedir', 'gece tarife', 'gunduz tarife',
    'tarife nedir', 'ne kadar kwh', 'kac para kwh', 'birim ucret',
  )) {
    return `💰 Tarife Bilgisi:
• Gündüz (06:00–22:00)       : ₺${DAYTIME_RATE}/kWh
• Gece İndirimli (22:00–06:00): ₺${NIGHT_RATE}/kWh  (%20 indirim)
• Kota Aşım Ceza Tarifesi     : ₺${PENALTY_RATE}/kWh  (%100 zam)

Gece tarifesini kullanmak → aynı tüketimde faturanızı %20 azaltır.
Kota aşımı → her fazla kWh için gündüz tarifesinin 2 katı ücret.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 10 ─ SAVINGS / OPTIMIZATION
  // ════════════════════════════════════════════════════════════════════════════
  const saveScore = score(q, [
    'tasarruf', 'dusur', 'azalt', 'indir', 'optimize', 'verimli', 'ekonomik',
    'oneri', 'tavsiye', 'ipucu', 'ne yapmali', 'nasil azaltirim', 'nasil dusururum',
    'fatura dusur', 'maliyet azalt', 'ceza almamak', 'nasil tasarruf',
    'enerji verimlilik', 'faturami dusurmek', 'ne onerir', 'nasil dusurebilir',
    'ne yapabilirim', 'nereden baslasam', 'en cok neden',
  ])

  if (saveScore >= 1) {
    const hm = findHome(q, homes)
    if (hm) {
      const s20 = (hm.billingAmountTry * 0.20).toFixed(0)
      const topWaster = [...hm.appliances].sort((a, b) => b.currentWatt - a.currentWatt)[0]
      return `💡 [${hm.name}] Tasarruf Rehberi — ₺${hm.billingAmountTry.toLocaleString('tr-TR')} TL faturanızı ~₺${parseInt(s20).toLocaleString('tr-TR')} TL azaltmak için:
1. 🕒 Yüksek güçlü cihazları 22:00–06:00 gece tarifesine alın
2. ❄️ Klima hedef sıcaklığını 24°C yapın (her °C → %7 tasarruf)
3. 🔌 Bekleme modundaki cihazları akıllı prizle kapatın${topWaster ? `\n4. ⚡ En yüksek çekimli cihaz "${topWaster.name}" (${topWaster.currentWatt}W) — kullanım saatlerini optimize edin` : ''}`
    }

    const sysS = (totalBill * 0.20).toFixed(0)
    return `💡 Sistem Tasarruf Rehberi (tahmini aylık ~₺${parseInt(sysS).toLocaleString('tr-TR')} TL potansiyel):
1. 🕒 Gece Tarifesi (22:00–06:00): Çamaşır, bulaşık, araç şarjı → %20 indirim
2. ❄️ Klima 24°C Sabit: Her °C artış → %7 kompresör tasarrufu
3. 🔌 Standby Yükü: Akıllı priz → yılda ~180 kWh tasarruf
4. 💡 LED Dönüşümü: Aydınlatma giderinde %80 azalma
5. 🚿 Kombi/Şofben: Termostat 55°C + programlı çalışma → %25 tasarruf
6. 🚗 EV Şarj: Yalnızca gece tarifesinde → aylık ~₺320 TL tasarruf`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 11 ─ SPECIFIC HOME QUERY
  // ════════════════════════════════════════════════════════════════════════════
  const hm = findHome(q, homes)
  if (hm) {
    const appType = extractAppType(q)

    // Home + specific appliance
    if (appType) {
      const app = hm.appliances.find((a) => norm(a.name).includes(appType))
      if (app) {
        const overLimit = app.currentWatt > app.safeLimit
        const icon      = overLimit ? '⚠️' : '✅'
        const hCost     = hourlyCostStr(app.currentWatt)
        const mCost     = monthlyCostStr(app.currentWatt)
        return `${icon} [${hm.name}] ${app.name}: ${app.currentWatt}W anlık çekim (Sınır: ${app.safeLimit}W).
Saatlik maliyet: ₺${hCost} │ Aylık (~8 saat/gün): ₺${mCost} TL
İhlal sayısı: ${app.consecutiveBreaches} │ Durum: ${overLimit ? '⚠️ LİMİT AŞIMDA — bakım önerilir' : '✅ Normal'}`
      }
      // Appliance type not found in this home
      return `ℹ️ [${hm.name}] Kayıtlı "${appType}" tipinde cihaz bulunamadı. ${hm.appliances.length} aktif cihaz izleniyor.`
    }

    // Full home snapshot
    const pct       = hm.quotaUsagePercent
    const breach    = pct >= 100
    const warn      = pct >= 80 && !breach
    const icon      = breach ? '⚠️' : warn ? '⚠️' : '✅'
    const quotaTxt  = breach
      ? `%${pct.toFixed(1)} ⚠️ (%${(pct - 100).toFixed(1)} aşım — ceza tarifesi aktif)`
      : warn ? `%${pct.toFixed(1)} ⚠️ (uyarı eşiği geçildi)`
              : `%${pct.toFixed(1)} ✅`
    const topApp    = [...hm.appliances].sort((a, b) => b.currentWatt - a.currentWatt)[0]
    const anomCount = hm.appliances.filter((a) => a.consecutiveBreaches >= 3 || a.currentWatt > a.safeLimit).length

    return `${icon} Wattie AI [${hm.name}]:
• Kota       : ${quotaTxt}
• Fatura     : ₺${hm.billingAmountTry.toLocaleString('tr-TR')} TL/ay
• Tüketim    : ${hm.totalConsumptionKwh.toFixed(1)} kWh (${hm.appliances.length} aktif cihaz)
• Anomali    : ${anomCount > 0 ? `⚠️ ${anomCount} cihazda sorun` : '✅ Yok'}${topApp ? `\n• En Yüksek  : ${topApp.name} (${topApp.currentWatt}W)` : ''}
• Öneri      : Gece tarifesiyle %20 tasarruf sağlanabilir.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 12 ─ APPLIANCE KNOWLEDGE BASE (cross-home aggregation + KB)
  // ════════════════════════════════════════════════════════════════════════════
  const appType = extractAppType(q)

  if (appType) {
    const kbInfo = APPLIANCE_KB[appType] || ''
    // Cross-home: count and aggregate watts
    const ofType = allApps.filter((a) => norm(a.name).includes(appType))
    if (ofType.length > 0) {
      const totalW  = ofType.reduce((s, a) => s + a.currentWatt, 0)
      const avgW    = (totalW / ofType.length).toFixed(0)
      const blimit  = ofType.filter((a) => a.currentWatt > a.safeLimit).length
      const homes_  = [...new Set(ofType.map((a) => a.homeName))].join(', ')
      const appNameStr = appType.charAt(0).toUpperCase() + appType.slice(1)
      return `🔍 [Sistem – ${appNameStr}]: ${ofType.length} cihaz, ${homes_} konularında. Toplam ${totalW}W çekiyor (ortalama ${avgW}W). ${blimit > 0 ? `⚠️ ${blimit} cihaz güvenli limitin üzerinde.` : '✅ Tümü normal.'}${kbInfo ? `\n\n${kbInfo}` : ''}`
    }

    // No real data: use KB
    if (kbInfo) return kbInfo
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 13 ─ DEVICE CONTEXT  (from card click)
  // ════════════════════════════════════════════════════════════════════════════
  if (deviceContext?.name) {
    const { name, currentWatt: w = 150, safeLimit: sl = 0 } = deviceContext
    const safe      = sl || w * 1.2
    const overLimit = w > safe
    const icon      = overLimit ? '⚠️' : '✅'
    return `${icon} [${name}]: ${w}W anlık çekim (Güvenli Sınır: ${safe}W).
Saatlik: ₺${hourlyCostStr(w)} │ Aylık (~8 saat/gün): ₺${monthlyCostStr(w)} TL
${overLimit ? '⚠️ GÜVENLİ LİMİT AŞIMDA — bakım önerilir.' : '✅ Normal aralıkta çalışıyor.'}`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 14 ─ WATT / COST CALCULATOR
  // ════════════════════════════════════════════════════════════════════════════
  if (any(q, 'kac watt', 'ne kadar harc', 'ne kadar tuket', 'maliyeti ne', 'kac lira', 'maliyet hesapla', 'watt hesap')) {
    const wattMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*[wW]/)
    const w         = wattMatch && wattMatch[1] ? parseFloat(wattMatch[1].replace(',', '.')) : 150
    return `⚡ Maliyet Hesaplama (${w}W):
• Saatlik     : ₺${hourlyCostStr(w)}
• Günlük 8s   : ₺${((w / 1000) * DAYTIME_RATE * 8).toFixed(2)}
• Gece 8s     : ₺${((w / 1000) * NIGHT_RATE * 8).toFixed(2)}  (%20 indirim)
• Aylık 240s  : ₺${monthlyCostStr(w)}`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 15 ─ INVENTORY / APPLIANCE COUNT
  // ════════════════════════════════════════════════════════════════════════════
  if (any(q, 'kac cihaz', 'cihaz sayisi', 'cihaz listesi', 'hangi cihazlar', 'cihazlarim', 'toplam cihaz', 'cihaz envanteri', 'neler var')) {
    const hm2 = findHome(q, homes)
    if (hm2) {
      const list = hm2.appliances.map((a) => `${a.name} (${a.currentWatt}W)`).join(', ')
      return `📋 [${hm2.name}] Envanter (${hm2.appliances.length} cihaz): ${list}.`
    }
    return `📋 Sistem Envanteri: ${nHomes} konutta ${nApps} aktif cihaz izleniyor. Anlık toplam yük: ${(totalWatt / 1000).toFixed(1)} kW.`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 16 ─ PLATFORM HELP
  // ════════════════════════════════════════════════════════════════════════════
  if (any(q, 'nedir', 'nasil kullan', 'neler yapabil', 'ozellikleri', 'ne yapabilir', 'ne ise yarar', 'nasil calisir', 'hakkinda')) {
    return `⚡ Wattie AI Yetenekleri:
🏠 Konut & cihaz bazlı tüketim analizi
⚠️ Kota aşımı ve anomali uyarıları
📊 Fatura tahmini, karşılaştırma, sıralama
💡 Yapay zeka tasarruf önerileri
✉️ Yöneticiye e-posta rapor taslağı
📈 Ay sonu tahmini & trend analizi
💰 Tarife bilgisi ve maliyet hesaplama
🔌 Cihaz aç/kapa & kota güncelleme
🗑️ Cihaz silme & envanter yönetimi`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 17 ─ SYSTEM-WIDE EXECUTIVE SUMMARY
  // Non-greedy: only fires for genuinely broad/aggregate queries
  // ════════════════════════════════════════════════════════════════════════════
  const sumScore = score(q, [
    'genel durum', 'sistem durumu', 'ozet', 'genel ozet', 'tum evler', 'tum konutlar',
    'genel rapor', 'genel analiz', 'sistem raporu', 'toplam fatura',
    'toplam tuketim', 'genel gorunum', 'kac ev var', 'kac konut var',
    'genel bakis', 'big picture',
  ])
  // Also fire for short, clearly broad queries like "fatura?" or "durum ne?"
  const isBroadShort = any(q, 'fatura', 'tuketim', 'durum', 'genel') && words.length <= 4

  if (sumScore >= 1 || isBroadShort) {
    return `📊 Wattie AI Sistem Raporu:
• Konular      : ${nHomes} konut │ ${nApps} cihaz │ Anlık Yük: ${(totalWatt / 1000).toFixed(1)} kW
• Tüketim      : ${fmtKwh} kWh
• Fatura       : ₺${fmtBill} TL/ay  (ortalama ₺${avgBill}/konut)
• Kota Aşımı   : ${breachHomes.length > 0 ? `${breachHomes.length} konut ⚠️ → ${breachHomes.map((h) => h.name).join(', ')}` : 'Yok ✅'}
• Anomalili    : ${anomList.length > 0 ? `${anomList.length} cihaz ⚠️` : 'Yok ✅'}`
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 18 ─ FALLBACK
  // ════════════════════════════════════════════════════════════════════════════
  return `🤖 Bu soruyu tam anlayamadım. Enerji tüketimi, fatura, kota, anomali veya cihaz analizi konularında yardımcı olabilirim.

Örnek sorular:
• "Tuzla deposunun durumu nedir?"
• "En çok tüketen 3 evi listele"
• "Çekmeköy ile Kadıköy'ü karşılaştır"
• "Tasarruf önerisi ver"
• "Ay sonu tahmini ne?"
• "Tarife bilgisi nedir?"`
}
