import { Environment, Float, OrbitControls, SpotLight, useTexture } from "@react-three/drei";
import { Book } from "./Book";
import { Disco } from "./Disco";
import { CandleHolder } from "./Candle-holder";
import * as THREE from "three";
import { useRef } from 'react';
import { useFrame } from "@react-three/fiber";

const BREAKPOINTS = {
  mobile: 480,
  tablet: 768
}

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
  

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <Float 
        rotation-x={-Math.PI / 4.0} // tilt the book a bit
        floatIntensity={0.2}
        speed={0.9}
        rotationIntensity={0.1}
      >
        <Book />
      </Float>
      <OrbitControls minDistance={4.5} maxDistance={4.5} minAzimuthAngle={-0.3} maxAzimuthAngle={0.3} minPolarAngle={0.9} maxPolarAngle={1.7} />
      <Environment preset="studio" environmentIntensity={0.46}></Environment>
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
        anglePower={5} // Diffuse-cone anglePower (default: 5)
        color={'#f74a4a'}
      />
      <pointLight 
        position={[-2.5, -0.7, -1.3]} 
        intensity={2}
        distance={3}
        color="#FFA500" 
        
        />
      

      <Disco position={[2.4, 1.5, -0.9]} />
      <CandleHolder position={[-2.9, -1.5, -1.3]} />
      {/* <Flame position={[-2.9, -0.6, -1.3]} /> */}
      
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
