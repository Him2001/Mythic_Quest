import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      {/* Magical particle effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="magical-particles" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full mb-4 magical-glow border-4 border-amber-300">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-cinzel font-bold text-amber-100 magical-glow mb-2">
            Mythic Quest
          </h1>
          <p className="text-amber-200/80 font-merriweather text-sm">
            Your wellness adventure awaits
          </p>
        </div>

        {/* Auth card */}
        <div className="fantasy-card p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-cinzel font-bold text-mystic-dark magical-glow mb-2">
              {title}
            </h2>
            <p className="text-amber-700 font-merriweather text-sm">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center text-amber-200/60 text-xs font-merriweather">
            <Sparkles size={12} className="mr-1" />
            <span>Secured by ancient magic</span>
            <Sparkles size={12} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;