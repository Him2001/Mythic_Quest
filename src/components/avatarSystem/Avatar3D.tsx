import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DModelProps {
  url: string;
  isSpeaking: boolean;
}

function Avatar3DModel({ url, isSpeaking }: Avatar3DModelProps) {
  const { scene, animations, error } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const idleActionRef = useRef<THREE.AnimationAction | null>(null);
  const talkingActionRef = useRef<THREE.AnimationAction | null>(null);

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

      // Find idle animation
      const idleAnimation = animations.find(clip => 
        clip.name.toLowerCase().includes('idle') || 
        clip.name.toLowerCase().includes('animation')
      ) || animations[0];

      if (idleAnimation) {
        const idleAction = mixer.clipAction(idleAnimation);
        idleAction.setLoop(THREE.LoopRepeat, Infinity);
        idleAction.play();
        idleActionRef.current = idleAction;
        console.log('Playing idle animation:', idleAnimation.name);
      }

      // Try to find talking animation
      const talkingAnimation = animations.find(clip => 
        clip.name.toLowerCase().includes('talk') || 
        clip.name.toLowerCase().includes('speak')
      );

      if (talkingAnimation) {
        const talkingAction = mixer.clipAction(talkingAnimation);
        talkingAction.setLoop(THREE.LoopRepeat, Infinity);
        talkingActionRef.current = talkingAction;
        console.log('Found talking animation:', talkingAnimation.name);
      }

      // Cleanup function
      return () => {
        if (mixerRef.current) {
          mixerRef.current.stopAllAction();
          mixerRef.current = null;
        }
        idleActionRef.current = null;
        talkingActionRef.current = null;
      };
    }
  }, [scene, animations]);

  // Switch between idle and talking animations based on speaking state
  useEffect(() => {
    if (idleActionRef.current && talkingActionRef.current) {
      if (isSpeaking) {
        // Fade to talking animation
        console.log('🎭 Switching to talking animation');
        idleActionRef.current.fadeOut(0.5);
        talkingActionRef.current.reset().fadeIn(0.5).play();
      } else {
        // Fade back to idle animation
        console.log('🎭 Switching to idle animation');
        if (talkingActionRef.current.isRunning()) {
          talkingActionRef.current.fadeOut(0.5);
        }
        idleActionRef.current.reset().fadeIn(0.5).play();
      }
    } else if (idleActionRef.current && isSpeaking) {
      // If no talking animation, add subtle head movement to idle
      console.log('🎭 No talking animation found, enhancing idle for speaking');
    }
  }, [isSpeaking]);

  // Update animation mixer
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Add subtle head movement when speaking (if no talking animation)
    if (meshRef.current && isSpeaking && !talkingActionRef.current) {
      const time = state.clock.elapsedTime;
      // Subtle head bob and slight rotation when speaking
      meshRef.current.rotation.y = Math.sin(time * 8) * 0.05;
      meshRef.current.position.y = Math.sin(time * 12) * 0.02;
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

// Fallback 3D Avatar component with speaking animation
function FallbackAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
      meshRef.current.scale.setScalar(breathe);
      // Slight body bob
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }

    if (headRef.current && isSpeaking) {
      // Enhanced head movement when speaking
      const time = state.clock.elapsedTime;
      headRef.current.rotation.y = Math.sin(time * 8) * 0.1;
      headRef.current.rotation.x = Math.sin(time * 6) * 0.05;
      headRef.current.position.y = 1.4 + Math.sin(time * 10) * 0.05;
    } else if (headRef.current) {
      // Gentle idle movement
      const time = state.clock.elapsedTime;
      headRef.current.rotation.y = Math.sin(time * 1) * 0.02;
      headRef.current.rotation.x = 0;
      headRef.current.position.y = 1.4;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.8, 2.4, 0.9]} />
      <meshStandardMaterial color="#8B4513" />
      {/* Head with speaking animation */}
      <mesh ref={headRef} position={[0, 1.4, 0]}>
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
  isSpeaking?: boolean;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ className = '', isSpeaking = false }) => {
  const [loading, setLoading] = useState(true);
  const [usesFallback, setUsesFallback] = useState(false);

  // Try multiple model URLs - first the Talking.glb, then fallback to Warrior Idle.glb
  const modelUrls = [
    "https://vyyldfxldzgmgbvgynbh.supabase.co/storage/v1/object/public/idle/Talking.glb",
    "https://vyyldfxldzgmgbvgynbh.supabase.co/storage/v1/object/public/idle/Warrior%20Idle.glb"
  ];
  
  const [currentModelUrl, setCurrentModelUrl] = useState(modelUrls[0]);

  useEffect(() => {
    const testModelUrls = async () => {
      for (const url of modelUrls) {
        try {
          console.log('🎭 Testing model URL:', url);
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            console.log('🎭 Model accessible at:', url);
            setCurrentModelUrl(url);
            setUsesFallback(false);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('🎭 Failed to access model at:', url, error);
        }
      }
      
      // If no models work, use fallback
      console.warn('🎭 No 3D models accessible, using fallback avatar');
      setUsesFallback(true);
      setLoading(false);
    };

    testModelUrls();
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
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent'
        }}
        gl={{ alpha: true, antialias: true }}
        onError={(error) => {
          console.warn('🎭 Canvas error, switching to fallback:', error);
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
              console.warn('🎭 3D model failed to load, switching to fallback avatar');
              setUsesFallback(true);
            }}>
              <Avatar3DModel url={currentModelUrl} isSpeaking={isSpeaking} />
            </ErrorBoundary>
          ) : (
            <FallbackAvatar isSpeaking={isSpeaking} />
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
    console.warn('🎭 Avatar3D Error Boundary caught an error:', error, errorInfo);
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