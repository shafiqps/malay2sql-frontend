import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text3D, Center, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from "next-themes" 

function Malay2SQLText() {
  const { theme } = useTheme()
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.center()
    }
    camera.position.z = 8
  }, [camera])

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Subtle continuous rotation
      meshRef.current.rotation.y += delta * 0.15

      // Smooth scale animation on hover
      meshRef.current.scale.x = THREE.MathUtils.lerp(
        meshRef.current.scale.x,
        hovered ? 1.05 : 1,
        0.1
      )
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        hovered ? 1.05 : 1,
        0.1
      )
      meshRef.current.scale.z = THREE.MathUtils.lerp(
        meshRef.current.scale.z,
        hovered ? 1.05 : 1,
        0.1
      )
    }
  })

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.5} // XYZ rotation intensity
      floatIntensity={0.5} // Up/down float intensity
    >
      <Text3D
        ref={meshRef}
        font="/fonts/Geist_Regular.json"
        size={1}
        height={0.1}
        curveSegments={32}
        bevelEnabled
        bevelThickness={0.01}
        bevelSize={0.01}
        bevelOffset={0}
        bevelSegments={10}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        Malay2SQL
        <meshPhysicalMaterial
          metalness={0.8}
          roughness={0.2}
          color={theme === "dark" ? "#64748b" : "#334155"}
          emissive={theme === "dark" ? "#0ea5e9" : "#0284c7"}
          emissiveIntensity={hovered ? 0.6 : 0.3}
        />
      </Text3D>
    </Float>
  )
}

export default function Malay2SQLScene() {
  const { theme } = useTheme()
  
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas dpr={[1, 2]} camera={{ fov: 75, position: [0, 0, 20] }}>
        <fog attach="fog" args={[theme === "dark" ? '#030712' : '#f8fafc', 5, 20]} />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <Malay2SQLText />
      </Canvas>
    </div>
  )
}