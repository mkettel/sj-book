import { Environment, Float, OrbitControls, SpotLight, useTexture } from "@react-three/drei";
import { Book } from "./Book";
import { Disco } from "./Disco";
import { CandleHolder } from "./Candle-holder";
import * as THREE from "three";
import { useRef, useState, useEffect } from 'react';
import { useFrame } from "@react-three/fiber";

const BREAKPOINTS = {
  mobile: 580,
  tablet: 768,
  desktop: 1024
}

// Define positions for different screen sizes
const RESPONSIVE_POSITIONS = {
  mobile: {
    disco: [1.0, 1.25, -0.7],
    candle: [-0.6, -1.6, 0.0],
    pointLight: [-1.8, -0.5, -1.0]
  },
  tablet: {
    disco: [2.1, 1.3, -0.8],
    candle: [-2.5, -1.3, -1.1],
    pointLight: [-2.1, -0.6, -1.1]
  },
  desktop: {
    disco: [2.4, 1.5, -0.9],
    candle: [-2.9, -1.5, -1.3],
    pointLight: [-2.5, -0.7, -1.3]
  }
};

const CAMERA_CONTROLS = {
  mobile: {
    minDistance: 2.0,
    maxDistance: 4.5,
  },
  tablet: {
    minDistance: 3.5,
    maxDistance: 4.5,
  },
  desktop: {
    minDistance: 3.5,
    maxDistance: 4.5,
  }
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

const Flame = ({ position }) => {
  const flameRef = useRef();
  
  useFrame(({ clock }) => {
    if (flameRef.current) {
      flameRef.current.scale.x = 1 + Math.sin(clock.elapsedTime * 10) * 0.1;
      flameRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 10 + 1) * 0.1;
    }
  });

  return (
    <group position={position}>
      <pointLight
        intensity={2}
        distance={3}
        color="#FFA500"
      />
      <mesh ref={flameRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#FFA500" opacity={0.7} />
      </mesh>
    </group>
  );
};

export const Experience = () => {
  const backgroundColor = new THREE.Color("#87CEEB");
  const { deviceType } = useScreenSize();
  const positions = RESPONSIVE_POSITIONS[deviceType];
  const cameraControls = CAMERA_CONTROLS[deviceType];
  
  const discoRef = useRef();
  const candleRef = useRef();
  
  // Use useFrame to smoothly transition positions when screen size changes
  useFrame(() => {
    if (discoRef.current) {
      discoRef.current.position.lerp(new THREE.Vector3(...positions.disco), 0.05);
    }
    if (candleRef.current) {
      candleRef.current.position.lerp(new THREE.Vector3(...positions.candle), 0.05);
    }
  });

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <Float 
        rotation-x={-Math.PI / 4.0}
        floatIntensity={0.2}
        speed={0.9}
        rotationIntensity={0.1}
      >
        <Book />
      </Float>
      <OrbitControls 
        minDistance={cameraControls.minDistance} 
        maxDistance={4.5} 
        minAzimuthAngle={-0.3} 
        maxAzimuthAngle={0.3} 
        minPolarAngle={0.9} 
        maxPolarAngle={1.7} 
      />
      <Environment preset="studio" environmentIntensity={0.46} />
      <directionalLight
        position={[1, 4, 2]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <SpotLight
        position={[-4, 2, 0]}
        distance={6}
        angle={0.35}
        attenuation={5}
        anglePower={5}
        color={'#f74a4a'}
      />
      <pointLight 
        position={positions.pointLight}
        intensity={2}
        distance={3}
        color="#FFA500" 
      />

      <group ref={discoRef}>
        <Disco position={[0, 0, 0]} />
      </group>
      <group ref={candleRef}>
        <CandleHolder position={[0, 0, 0]} />
      </group>
      
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};