export interface HotspotPreset {
  id: string
  position: [number, number, number]
  label: string
}

export interface DevicePreset {
  id: string
  position: [number, number, number]
  type: string
  label: string
}

export interface CameraPreset {
  cameraPosition: [number, number, number]
  targetPosition: [number, number, number]
  cameraFov?: number
  hotspots?: HotspotPreset[]
  devices?: DevicePreset[]
}

export interface DeviceConfig {
  id: string
  name: string
  room: string
  cameraPresetId: string
  iconName: string // Lucide icon identifier
}

// CAMERA_PRESETS maps coordinates to elegant, wide room-based locations without extreme zoom.
export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  'kitchen': {
    cameraPosition: [-4.2, 4.5, 3.8],
    targetPosition: [-1.4, 0.2, 0.5],
    cameraFov: 38,
    hotspots: [],
    devices: []
  },
  'laundry': {
    cameraPosition: [4.2, 4.5, -3.2],
    targetPosition: [1.2, 0.2, -1.0],
    cameraFov: 38,
    hotspots: [],
    devices: []
  },
  'living_room': {
    cameraPosition: [3.8, 4.2, 4.5],
    targetPosition: [-0.2, 0.2, 0.5],
    cameraFov: 38,
    hotspots: [],
    devices: []
  },
  'office': {
    cameraPosition: [2.5, 4.5, -4.2],
    targetPosition: [0.2, 0.2, -1.0],
    cameraFov: 38,
    hotspots: [],
    devices: []
  },
  'climate': {
    cameraPosition: [5.0, 5.5, 5.0],
    targetPosition: [0.0, 0.0, 0.0],
    cameraFov: 38,
    hotspots: [],
    devices: []
  },
  'whole_house': {
    cameraPosition: [7.5, 7.0, 7.5],
    targetPosition: [0.0, 0.0, 0.0],
    cameraFov: 38,
    hotspots: [],
    devices: []
  }
}

export const DEVICES_CONFIG: DeviceConfig[] = [
  {
    id: 'refrigerator',
    name: 'Buzdolabı',
    room: 'Mutfak',
    cameraPresetId: 'kitchen',
    iconName: 'Refrigerator'
  },
  {
    id: 'computer',
    name: 'Bilgisayar',
    room: 'Çalışma Odası',
    cameraPresetId: 'office',
    iconName: 'Monitor'
  },
  {
    id: 'television',
    name: 'Televizyon',
    room: 'Salon',
    cameraPresetId: 'living_room',
    iconName: 'Tv'
  },
  {
    id: 'oven',
    name: 'Fırın',
    room: 'Mutfak',
    cameraPresetId: 'kitchen',
    iconName: 'Flame'
  },
  {
    id: 'lights',
    name: 'Genel Aydınlatma',
    room: 'Salon',
    cameraPresetId: 'living_room',
    iconName: 'Lightbulb'
  }
]
