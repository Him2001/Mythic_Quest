import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { supabase } from '../../utils/supabaseClient';
import * as THREE from 'three';

interface Avatar3DModelProps {
  url: string;
}

function Avatar3DModel({ url }: Avatar3DModelProps) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  // Auto-rotate the model slowly
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  // Scale and position the model
  useEffect(() => {
    if (scene) {
      scene.scale.setScalar(1);
      scene.position.set(0, -1, 0);
    }
  }, [scene]);

  return <primitive ref={meshRef} object={scene} />;
}

interface Avatar3DProps {
  className?: string;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ className = '' }) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        // Get the public URL for the 3D model
        const { data } = supabase.storage
          .from('idle')
          .getPublicUrl('Warrior idle.glb');

        if (data?.publicUrl) {
          setModelUrl(data.publicUrl);
        } else {
          throw new Error('Failed to get model URL');
        }
      } catch (err) {
        console.error('Error loading 3D model:', err);
        setError(err instanceof Error ? err.message : 'Failed to load 3D model');
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  if (loading) {
    return (
      <div className={`w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !modelUrl) {
    return (
      <div className={`w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-gray-100 rounded-full ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">⚔️</div>
          <div className="text-sm">3D Model Unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-48 h-48 sm:w-56 sm:h-56 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        <Avatar3DModel url={modelUrl} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Avatar3D;