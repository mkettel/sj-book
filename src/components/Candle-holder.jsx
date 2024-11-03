import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BREAKPOINTS = {
  mobile: 580,
  tablet: 768,
  desktop: 1024
};

const SCALE_FACTORS = {
  mobile: 0.006,
  tablet: 0.008,
  desktop: 0.009
};

// Custom hook to handle screen size detection
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceType = () => {
    if (screenSize.width <= BREAKPOINTS.mobile) return 'mobile';
    if (screenSize.width <= BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  };

  return {
    screenSize,
    deviceType: getDeviceType()
  };
};

export function CandleHolder(props) {
  const { nodes, materials } = useGLTF('/3d-model/candle-holder.glb');
  const groupRef = useRef();
  const { deviceType } = useScreenSize();
  
  // Create a ref to store the current scale for smooth transitions
  const currentScale = useRef(SCALE_FACTORS[deviceType]);

  useFrame(() => {
    if (groupRef.current) {
      // Smoothly interpolate to the target scale
      const targetScale = SCALE_FACTORS[deviceType];
      currentScale.current = THREE.MathUtils.lerp(
        currentScale.current,
        targetScale,
        0.1
      );
      
      groupRef.current.scale.setScalar(currentScale.current);
    }
  });

  return (
    <group ref={groupRef} rotation={[0.0, 0.7, 0.0]} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.defaultMaterial.geometry}
        material={materials.fire}
        position={[10.955, 106.092, -5.187]}
        rotation={[-Math.PI / 2, 0, 1.261]}
        scale={[100, 100, 121.073]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.defaultMaterial_1.geometry}
        material={materials.candlestick}
        position={[0, 19.686, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.defaultMaterial_2.geometry}
        material={materials.candles}
        position={[1.329, 50.636, -0.736]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
    </group>
  );
}

useGLTF.preload('/3d-model/candle-holder.glb');