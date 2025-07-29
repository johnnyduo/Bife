// ShibaNativeCompanion.tsx - React Native 3D Shiba Companion using Expo GL
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

interface ShibaNativeProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onPet?: () => void;
}

const ShibaNativeCompanion: React.FC<ShibaNativeProps> = ({ 
  isListening = false, 
  isSpeaking = false, 
  onPet 
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<Renderer>();
  const animationFrameRef = useRef<number>();
  const clockRef = useRef(new THREE.Clock());

  // Create pulse animation for listening/speaking states
  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
    };

    if (isListening || isSpeaking) {
      const animation = createPulseAnimation();
      animation.start();
      return () => animation.stop();
    }
    return undefined;
  }, [isListening, isSpeaking, pulseAnim]);

  const onContextCreate = useCallback(async (gl: any) => {
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xffffff, 0); // Transparent background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Create a simple 3D Shiba representation (since we can't easily load FBX in React Native)
    const shibaGroup = new THREE.Group();
    
    // Body (main cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color('#D4A574') // Warm golden brown
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.5;
    body.castShadow = true;
    shibaGroup.add(body);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color('#E6B885') // Lighter brown for head
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.6;
    head.castShadow = true;
    shibaGroup.add(head);

    // Ears (small cones)
    const earGeometry = new THREE.ConeGeometry(0.12, 0.3, 8);
    const earMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color('#C7956D') // Darker brown for ears
    });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.25, 0.85, 0.1);
    leftEar.rotation.z = 0.3;
    leftEar.castShadow = true;
    shibaGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.25, 0.85, 0.1);
    rightEar.rotation.z = -0.3;
    rightEar.castShadow = true;
    shibaGroup.add(rightEar);

    // Tail (small cylinder)
    const tailGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 8);
    const tailMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color('#D4A574')
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, -0.3, -0.8);
    tail.rotation.x = -0.5;
    tail.castShadow = true;
    shibaGroup.add(tail);

    // Eyes (small black spheres)
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.65, 0.35);
    shibaGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.65, 0.35);
    shibaGroup.add(rightEye);

    // Nose (small black sphere)
    const noseGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const noseMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.55, 0.38);
    shibaGroup.add(nose);

    // Scale and position the entire Shiba
    shibaGroup.scale.setScalar(0.8);
    shibaGroup.position.y = -0.5;
    scene.add(shibaGroup);

    // Add ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current) return;

      const elapsed = clockRef.current.getElapsedTime();

      // Gentle breathing animation
      const breathe = 1 + Math.sin(elapsed * 2) * 0.05;
      shibaGroup.scale.setScalar(0.8 * breathe);

      // Head tilt when listening
      if (isListening) {
        head.rotation.z = Math.sin(elapsed * 3) * 0.2;
        leftEar.rotation.z = 0.3 + Math.sin(elapsed * 4) * 0.1;
        rightEar.rotation.z = -0.3 - Math.sin(elapsed * 4) * 0.1;
      } else {
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, 0.1);
        leftEar.rotation.z = THREE.MathUtils.lerp(leftEar.rotation.z, 0.3, 0.1);
        rightEar.rotation.z = THREE.MathUtils.lerp(rightEar.rotation.z, -0.3, 0.1);
      }

      // Tail wag when speaking
      if (isSpeaking) {
        tail.rotation.y = Math.sin(elapsed * 8) * 0.5;
        body.rotation.y = Math.sin(elapsed * 6) * 0.1;
      } else {
        tail.rotation.y = THREE.MathUtils.lerp(tail.rotation.y, 0, 0.1);
        body.rotation.y = THREE.MathUtils.lerp(body.rotation.y, 0, 0.1);
      }

      // Render the scene
      rendererRef.current.render(scene, camera);
      gl.endFrameEXP();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [isListening, isSpeaking]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handlePress = () => {
    if (onPet) {
      onPet();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.glContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <GLView
            style={styles.glView}
            onContextCreate={onContextCreate}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  glContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  glView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ShibaNativeCompanion;
