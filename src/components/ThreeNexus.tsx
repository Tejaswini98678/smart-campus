'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Crystal() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.x += 0.005;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[1.5, 0]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          speed={3}
          distort={0.4}
          envMapIntensity={2}
          transparent
          opacity={0.7}
          roughness={0}
          metalness={1}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeNexus() {
  return (
    <div className="w-full h-[240px] cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} color="#10b981" intensity={0.5} />
        <Crystal />
      </Canvas>
    </div>
  );
}
