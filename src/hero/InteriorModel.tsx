import { useGLTF, Html } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { MATERIAL_TO_DEVICE, PARENT_NODE_TO_DEVICE } from '../config/meshDeviceMap'
import { DancingDino } from '../components/DancingDino'

const HOTSPOT_CONFIGS: Record<string, { pos: [number, number, number]; label: string; icon: string; color: string }> = {
  air_conditioner: { pos: [-0.8, 1.8, 0.2], label: 'Klima', icon: '❄️', color: '#06b6d4' },
  washing_machine: { pos: [1.6, 0.4, -1.4], label: 'Çamaşır M.', icon: '🧺', color: '#a855f7' },
  dishwasher: { pos: [-1.8, 0.4, 0.8], label: 'Bulaşık M.', icon: '🍽️', color: '#38bdf8' },
  refrigerator: { pos: [-1.45, 0.8, 0.3], label: 'Buzdolabı', icon: '🧊', color: '#38bdf8' },
  computer: { pos: [0.18, 0.8, -0.98], label: 'Bilgisayar', icon: '💻', color: '#818cf8' },
  television: { pos: [-0.22, 0.6, 0.48], label: 'Televizyon', icon: '📺', color: '#c084fc' },
  lights: { pos: [0.2, 1.6, 0.2], label: 'Aydınlatma', icon: '💡', color: '#fbbf24' },
  oven: { pos: [-1.2, 0.6, 0.5], label: 'Fırın', icon: '🍳', color: '#fb923c' },
}

type InteriorModelProps = Pick<ThreeElements['group'], 'position' | 'rotation' | 'scale'> & {
  onMeshClick?: (deviceId: string) => void
  activeDeviceId?: string | null
  hoveredDeviceId?: string | null
  onHoverChange?: (deviceId: string | null) => void
  deviceStates: Record<string, any>
}

/**
 * Walk up the parent chain of a Three.js object to find
 * the first ancestor with a deviceId in userData.
 */
function findDeviceId(object: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = object
  while (current) {
    if (current.userData?.deviceId) return current.userData.deviceId
    current = current.parent
  }
  return null
}

/**
 * Collect all meshes in the scene belonging to a given deviceId.
 */
function collectDeviceMeshes(root: THREE.Object3D, deviceId: string): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = []
  root.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData.deviceId === deviceId) {
      meshes.push(child)
    }
  })
  return meshes
}

// Shared outline material (back-face scaled shell)
const outlineMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#38bdf8'),
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.6,
  depthWrite: false,
})

const activeOutlineMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#818cf8'),
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
})
// Helper to get device-specific colors
const DEVICE_COLORS: Record<string, string> = {
  refrigerator: '#38bdf8', // Ice Blue
  computer: '#818cf8',     // Indigo
  television: '#c084fc',   // Lavender
  oven: '#fb923c',         // Warm Orange
  lights: '#fbbb24',       // Gold / Warm Yellow
}

export function InteriorModel({
  position,
  rotation,
  scale,
  onMeshClick,
  activeDeviceId,
  hoveredDeviceId,
  onHoverChange,
  deviceStates
}: InteriorModelProps) {
  const { scene } = useGLTF('/models/low_poly.glb')
  const outlineMeshesRef = useRef<THREE.Mesh[]>([])
  const groupRef = useRef<THREE.Group>(null)

  // Tag every mesh with its deviceId based on material and parent-node lookups
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Try material name first
        const matName = (child.material as THREE.Material)?.name
        if (matName && MATERIAL_TO_DEVICE[matName]) {
          child.userData.deviceId = MATERIAL_TO_DEVICE[matName]
          return
        }

        // Try parent node name
        let parent: THREE.Object3D | null = child.parent
        while (parent) {
          if (parent.name && PARENT_NODE_TO_DEVICE[parent.name]) {
            child.userData.deviceId = PARENT_NODE_TO_DEVICE[parent.name]
            return
          }
          parent = parent.parent
        }
      }
    })
  }, [scene])


  const { center, min } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const c = new THREE.Vector3()
    box.getCenter(c)
    return { center: c, min: box.min }
  }, [scene])

  const activeDeviceStatus = activeDeviceId ? deviceStates[activeDeviceId]?.status : undefined
  const hoveredDeviceStatus = hoveredDeviceId ? deviceStates[hoveredDeviceId]?.status : undefined

  const activeLightInfo = useMemo(() => {
    if (!activeDeviceId) return null
    if (activeDeviceStatus !== 'online') return null
    const color = DEVICE_COLORS[activeDeviceId] || '#ffffff'
    const meshes = collectDeviceMeshes(scene, activeDeviceId)
    if (meshes.length === 0) return null

    const box = new THREE.Box3()
    meshes.forEach((m) => box.expandByObject(m))
    const centerVec = new THREE.Vector3()
    box.getCenter(centerVec)

    return {
      position: [centerVec.x - center.x, centerVec.y - min.y + 0.8, centerVec.z - center.z] as [number, number, number],
      color
    }
  }, [scene, activeDeviceId, center, min, activeDeviceStatus])

  useEffect(() => {
    // Clean up previous outlines
    outlineMeshesRef.current.forEach((m) => {
      m.parent?.remove(m)
      m.geometry.dispose()
    })
    outlineMeshesRef.current = []

    const devicesToHighlight = new Set<string>()
    if (activeDeviceId) devicesToHighlight.add(activeDeviceId)
    if (hoveredDeviceId) devicesToHighlight.add(hoveredDeviceId)

    devicesToHighlight.forEach((deviceId) => {
      const status = deviceId === activeDeviceId ? activeDeviceStatus : hoveredDeviceStatus
      if (status !== 'online') return

      const meshes = collectDeviceMeshes(scene, deviceId)
      const isActive = deviceId === activeDeviceId
      const deviceColor = DEVICE_COLORS[deviceId] || '#38bdf8'

      // Custom color-tinted outline material for this device
      const customOutlineMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(deviceColor),
        side: THREE.BackSide,
        transparent: true,
        opacity: isActive ? 0.75 : 0.45,
        depthWrite: false,
      })

      meshes.forEach((mesh) => {
        const outlineMesh = new THREE.Mesh(mesh.geometry.clone(), customOutlineMat)
        outlineMesh.position.copy(mesh.position)
        outlineMesh.rotation.copy(mesh.rotation)
        outlineMesh.quaternion.copy(mesh.quaternion)
        outlineMesh.scale.copy(mesh.scale).multiplyScalar(1.04)
        outlineMesh.renderOrder = -1
        outlineMesh.userData._isOutline = true

        // Apply device-specific emissive highlight to original mesh
        if (mesh.material && 'emissive' in mesh.material) {
          const meshMat = mesh.material as THREE.MeshStandardMaterial
          if (!mesh.userData._origEmissive) {
            mesh.userData._origEmissive = meshMat.emissive.clone()
            mesh.userData._origEmissiveIntensity = meshMat.emissiveIntensity
          }
          meshMat.emissive.set(deviceColor)
          meshMat.emissiveIntensity = isActive ? 0.4 : 0.2
        }

        mesh.parent?.add(outlineMesh)
        outlineMeshesRef.current.push(outlineMesh)
      })
    })

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.deviceId) {
        const id = child.userData.deviceId
        const isHighlighted = devicesToHighlight.has(id)

        if (!isHighlighted && child.userData._origEmissive) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissive.copy(child.userData._origEmissive)
          mat.emissiveIntensity = child.userData._origEmissiveIntensity
          delete child.userData._origEmissive
          delete child.userData._origEmissiveIntensity
        }
      }
    })

    return () => {
      // Cleanup on unmount
      outlineMeshesRef.current.forEach((m) => {
        m.parent?.remove(m)
        m.geometry.dispose()
      })
      outlineMeshesRef.current = []
    }
  }, [scene, activeDeviceId, hoveredDeviceId, activeDeviceStatus, hoveredDeviceStatus])

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation()
    // Skip outline meshes
    if (e.object?.userData?._isOutline) return
    const deviceId = findDeviceId(e.object)
    if (deviceId) {
      document.body.style.cursor = 'pointer'
      onHoverChange?.(deviceId)
    }
  }, [onHoverChange])

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation()
    if (e.object?.userData?._isOutline) return
    document.body.style.cursor = 'auto'
    onHoverChange?.(null)
  }, [onHoverChange])

  const handleClick = useCallback((e: any) => {
    e.stopPropagation()
    if (e.object?.userData?._isOutline) return
    const deviceId = findDeviceId(e.object)
    if (deviceId) {
      onMeshClick?.(deviceId)
    }
  }, [onMeshClick])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive
        object={scene}
        position={[-center.x, -min.y, -center.z]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      {activeLightInfo && (
        <pointLight
          position={activeLightInfo.position}
          color={activeLightInfo.color}
          intensity={8}
          distance={4}
          decay={1.6}
        />
      )}
      <spotLight
        position={[25, 10, -34]}
        intensity={2.5}
        distance={8}
        angle={Math.PI / 6}
        penumbra={0.8}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      {/* Floor Lamp warm spotlight */}
      {deviceStates['lights']?.status === 'online' && (
        <spotLight
          position={[-108.93, 36.5, -90.38]}
          intensity={4}
          distance={30}
          angle={Math.PI / 3.5}
          penumbra={0.8}
          color="#fbbf24"
          castShadow
          shadow-mapSize={[512, 512]}
        />
      )}
      <DancingDino />
    </group>
  )
}

useGLTF.preload('/models/low_poly.glb')
