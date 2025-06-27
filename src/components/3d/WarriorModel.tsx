import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { Group, AnimationMixer } from 'three';
import { supabase } from '../../utils/supabaseClient';

interface WarriorModelProps {
  className?: string;
}

function WarriorScene() {
  const groupRef = useRef<Group>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the model URL from Supabase storage
  useEffect(() => {
    const getModelUrl = async () => {
      try {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          // Fallback to a placeholder 3D model or simple geometry
          setError('Supabase not configured - using fallback model');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.storage
          .from('idle')
          .getPublicUrl('Warrior Idle.glb');

        if (error) {
          console.error('Error getting model URL:', error);
          setError('Failed to load 3D model');
        } else {
          setModelUrl(data.publicUrl);
        }
      } catch (err) {
        console.error('Error accessing Supabase storage:', err);
        setError('Failed to access model storage');
      } finally {
        setIsLoading(false);
      }
    };

    getModelUrl();
  }, []);

  if (isLoading) {
    return (
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    );
  }

  if (error || !modelUrl) {
    return <FallbackWarrior />;
  }

  return <WarriorModel url={modelUrl} />;
}

function WarriorModel({ url }: { url: string }) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, groupRef);

  useEffect(() => {
    // Play the idle animation if it exists
    if (actions && Object.keys(actions).length > 0) {
      const idleAction = actions[Object.keys(actions)[0]]; // Get first animation
      if (idleAction) {
        idleAction.play();
      }
    }
  }, [actions]);

  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    
    // Gentle rotation animation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={[1.5, 1.5, 1.5]} position={[0, -1, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function FallbackWarrior() {
  const meshRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={meshRef} scale={[1.2, 1.2, 1.2]}>
      {/* Warrior body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 1.6, 0.4]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>
      
      {/* Warrior head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#D69E2E" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, 0.3, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>
      <mesh position={[0.6, 0.3, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.3, -1.2, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>
      <mesh position={[0.3, -1.2, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>
      
      {/* Sword */}
      <mesh position={[0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 1.5, 0.05]} />
        <meshStandardMaterial color="#C53030" />
      </mesh>
      
      {/* Shield */}
      <mesh position={[-0.8, 0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
        <meshStandardMaterial color="#2B6CB0" />
      </mesh>
    </group>
  );
}

const WarriorModelViewer: React.FC<WarriorModelProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#FFD700" />
        <pointLight position={[5, -5, -5]} intensity={0.3} color="#8A2BE2" />
        
        {/* 3D Model */}
        <WarriorScene />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
        
        {/* Environment */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1A202C" opacity={0.8} transparent />
        </mesh>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute bottom-2 left-2 text-white text-xs font-cinzel bg-black/50 px-2 py-1 rounded">
        Click and drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default WarriorModelViewer;