import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DModelProps {
  url: string;
}

function Avatar3DModel({ url }: Avatar3DModelProps) {
  const { scene, animations, error } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Handle loading errors
  if (error) {
    throw error;
  }

  // Set up animations
  useEffect(() => {
    if (scene && animations && animations.length > 0) {
      // Create animation mixer
      const mixer = new THREE.AnimationMixer(scene);
      mixerRef.current = mixer;

      // Find and play the idle animation (or first animation)
      const idleAnimation = animations.find(clip => 
        clip.name.toLowerCase().includes('idle') || 
        clip.name.toLowerCase().includes('animation')
      ) || animations[0];

      if (idleAnimation) {
        const action = mixer.clipAction(idleAnimation);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
        console.log('Playing animation:', idleAnimation.name);
      }

      // Cleanup function
      return () => {
        if (mixerRef.current) {
          mixerRef.current.stopAllAction();
          mixerRef.current = null;
        }
      };
    }
  }, [scene, animations]);

  // Update animation mixer
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Optional: slight rotation for better viewing
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  // Scale and position the model
  useEffect(() => {
    if (scene) {
      // Scale up the avatar
      scene.scale.setScalar(2.2);
      scene.position.set(0, -2, 0);
      
      // Ensure all materials are properly set up
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene]);

  return <primitive ref={meshRef} object={scene} />;
}

// Fallback 3D Avatar component with animation
function FallbackAvatar() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += delta * 0.2;
      // Breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
      meshRef.current.scale.setScalar(breathe);
      // Slight head bob
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.8, 2.4, 0.9]} />
      <meshStandardMaterial color="#8B4513" />
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>
      {/* Helmet/Crown */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.55, 0.4, 0.35, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Arms */}
      <mesh position={[-1.1, 0.4, 0]}>
        <boxGeometry args={[0.35, 1.4, 0.35]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[1.1, 0.4, 0]}>
        <boxGeometry args={[0.35, 1.4, 0.35]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.5, -1.8, 0]}>
        <boxGeometry args={[0.35, 1.8, 0.35]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.5, -1.8, 0]}>
        <boxGeometry args={[0.35, 1.8, 0.35]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </mesh>
  );
}

interface Avatar3DProps {
  className?: string;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [usesFallback, setUsesFallback] = useState(false);

  // Use the direct public URL you provided
  const modelUrl = "https://vyyldfxldzgmgbvgynbh.supabase.co/storage/v1/object/public/idle//Warrior%20Idle.glb";

  useEffect(() => {
    const testModelUrl = async () => {
      try {
        // Test if the URL is accessible
        const response = await fetch(modelUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('3D model accessible at:', modelUrl);
          setUsesFallback(false);
        } else {
          console.warn('Model file not accessible. Status:', response.status);
          setUsesFallback(true);
        }
      } catch (fetchError) {
        console.warn('Failed to fetch 3D model:', fetchError);
        setUsesFallback(true);
      } finally {
        setLoading(false);
      }
    };

    testModelUrl();
  }, [modelUrl]);

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
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        onError={(error) => {
          console.warn('Canvas error, switching to fallback:', error);
          setUsesFallback(true);
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.3} />
        
        <React.Suspense fallback={null}>
          {!usesFallback ? (
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
          enableRotate={false}
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