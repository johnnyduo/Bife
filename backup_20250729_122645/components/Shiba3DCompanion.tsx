import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useFBX } from '@react-three/drei';
import { View } from 'react-native';
import * as THREE from 'three';

interface Shiba3DProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onPet?: () => void;
}

// 3D Shiba Model Component
const ShibaModel: React.FC<Shiba3DProps> = ({ isListening, isSpeaking, onPet }) => {
  const shibaRef = useRef<THREE.Group>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  
  // Load the FBX model
  const fbx = useFBX('/models/Shiba.fbx');
  
  useEffect(() => {
    if (fbx && fbx.animations.length > 0) {
      // Set up animation mixer
      const animationMixer = new THREE.AnimationMixer(fbx);
      setMixer(animationMixer);
      
      // Play idle animation by default
      const idleAction = animationMixer.clipAction(fbx.animations[0]);
      idleAction.play();
      
      return () => {
        animationMixer.stopAllAction();
      };
    }
    
    return undefined;
  }, [fbx]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    
    if (shibaRef.current) {
      // Gentle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02 + 1;
      shibaRef.current.scale.setScalar(breathe);
      
      // Head tilt when listening
      if (isListening) {
        shibaRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      } else {
        shibaRef.current.rotation.z = THREE.MathUtils.lerp(shibaRef.current.rotation.z, 0, 0.1);
      }
      
      // Tail wag when speaking
      if (isSpeaking) {
        shibaRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 8) * 0.1;
      } else {
        shibaRef.current.rotation.y = THREE.MathUtils.lerp(shibaRef.current.rotation.y, 0, 0.1);
      }
    }
  });
  
  // Set up the model
  const clonedFbx = fbx.clone();
  clonedFbx.scale.setScalar(0.01); // Scale down the model
  clonedFbx.position.set(0, -1, 0);
  
  // Apply natural colors and materials
  clonedFbx.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Create natural Shiba Inu colors
      const material = new THREE.MeshLambertMaterial({
        color: new THREE.Color('#D4A574'), // Warm golden brown
        transparent: false,
      });
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  const handleClick = () => {
    if (onPet) {
      onPet();
    }
  };

  return (
    <group 
      ref={shibaRef} 
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={clonedFbx} />
    </group>
  );
};

// Main 3D Shiba Companion Component
const Shiba3DCompanion: React.FC<Shiba3DProps> = ({ isListening, isSpeaking, onPet }) => {
  return (
    <View style={{
      width: 300,
      height: 300,
      backgroundColor: 'transparent',
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: 'transparent'
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* 3D Shiba Model */}
        <ShibaModel
          isListening={isListening ?? false}
          isSpeaking={isSpeaking ?? false}
          {...(onPet && { onPet })}
        />        {/* Optional: Ground plane for shadows */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -1.5, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.1} />
        </mesh>
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Status indicator */}
      {(isListening || isSpeaking) && (
        <View style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 15,
          padding: 8,
          shadowColor: 'rgba(44, 24, 16, 0.1)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isListening ? '#7A8471' : '#C7956D', // Sage green for listening, amber for speaking
          }} />
        </View>
      )}
    </View>
  );
};

export default Shiba3DCompanion;
