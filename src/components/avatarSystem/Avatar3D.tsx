import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { supabase } from '../../utils/supabaseClient';
import * as THREE from 'three';

interface Avatar3DModelProps {
  url: string;
}

function Avatar3DModel({ url }: Avatar3DModelProps) {
  const { scene, error } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  // Handle loading errors
  if (error) {
    throw error;
  }

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

// Fallback 3D Avatar component
function FallbackAvatar() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 2, 0.8]} />
      <meshStandardMaterial color="#8B4513" />
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>
      {/* Helmet/Crown */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.45, 0.35, 0.3, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.9, 0.3, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.9, 0.3, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.4, -1.5, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.4, -1.5, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </mesh>
  );
}

interface Avatar3DProps {
  className?: string;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ className = '' }) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usesFallback, setUsesFallback] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        if (!supabase) {
          console.warn('Supabase client not configured, using fallback avatar');
          setUsesFallback(true);
          setLoading(false);
          return;
        }

        // Check if the bucket exists first
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.warn('Failed to list storage buckets:', bucketsError.message);
          setUsesFallback(true);
          setLoading(false);
          return;
        }

        const idleBucket = buckets?.find(bucket => bucket.name === 'idle');
        if (!idleBucket) {
          console.warn('Storage bucket "idle" not found. Available buckets:', buckets?.map(b => b.name));
          setUsesFallback(true);
          setLoading(false);
          return;
        }

        // Check if the file exists in the bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('idle')
          .list('', { limit: 100 });

        if (filesError) {
          console.warn('Failed to list files in idle bucket:', filesError.message);
          setUsesFallback(true);
          setLoading(false);
          return;
        }

        const modelFile = files?.find(file => file.name === 'Warrior idle.glb');
        if (!modelFile) {
          console.warn('Model file "Warrior idle.glb" not found in idle bucket. Available files:', files?.map(f => f.name));
          setUsesFallback(true);
          setLoading(false);
          return;
        }

        // Get the public URL for the 3D model
        const { data } = supabase.storage
          .from('idle')
          .getPublicUrl('Warrior idle.glb');

        if (!data?.publicUrl) {
          console.warn('Failed to get public URL for 3D model');
          setUsesFallback(true);
          setLoading(false);
          return;
        }

        // Test if the URL is actually accessible
        try {
          const response = await fetch(data.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log('3D model loaded successfully from:', data.publicUrl);
            setModelUrl(data.publicUrl);
          } else {
            console.warn('Model file not accessible via public URL. Status:', response.status);
            setUsesFallback(true);
          }
        } catch (fetchError) {
          console.warn('Failed to fetch 3D model:', fetchError);
          setUsesFallback(true);
        }
      } catch (err) {
        console.warn('Error loading 3D model, using fallback avatar:', err);
        setError(err instanceof Error ? err.message : 'Failed to load 3D model');
        setUsesFallback(true);
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

  return (
    <div className={`w-48 h-48 sm:w-56 sm:h-56 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        onError={(error) => {
          console.warn('Canvas error, switching to fallback:', error);
          setUsesFallback(true);
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />
        
        <React.Suspense fallback={null}>
          {!usesFallback && modelUrl ? (
            <ErrorBoundary onError={() => {
              console.warn('3D model failed to load, switching to fallback avatar');
              setUsesFallback(true);
            }}>
              <Avatar3DModel url={modelUrl} />
            </ErrorBoundary>
          ) : (
            <FallbackAvatar />
          )}
        </React.Suspense>
        
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

// Simple Error Boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Avatar3D Error Boundary caught an error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default Avatar3D;