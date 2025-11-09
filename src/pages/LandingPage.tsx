import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Shield, 
  Map, 
  Users, 
  Trophy, 
  Coins, 
  ArrowRight,
  CheckCircle,
  Star,
  Camera,
  Footprints,
  Target,
  Crown
} from 'lucide-react';
import Button from '../components/ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    users: 0,
    quests: 0,
    coins: 0
  });

  const features = [
    {
      icon: <Map className="text-amber-500" size={32} />,
      title: "Epic Adventure Maps",
      description: "Explore real-world locations with GPS-tracked wellness quests and mysterious discoveries"
    },
    {
      icon: <Camera className="text-purple-500" size={32} />,
      title: "Face Recognition Login",
      description: "Secure access with cutting-edge facial recognition technology - your face is your key"
    },
    {
      icon: <Footprints className="text-green-500" size={32} />,
      title: "Smart Step Tracking",
      description: "Advanced step counting using your phone's sensors for precise distance and wellness tracking"
    },
    {
      icon: <Trophy className="text-yellow-500" size={32} />,
      title: "Level Up System",
      description: "Gain XP, unlock achievements, and level up your hero as you complete wellness challenges"
    },
    {
      icon: <Coins className="text-amber-500" size={32} />,
      title: "Mythic Coin Rewards",
      description: "Earn valuable Mythic Coins for completing quests and trade them in the magical marketplace"
    },
    {
      icon: <Users className="text-blue-500" size={32} />,
      title: "Social Adventures",
      description: "Connect with fellow adventurers, share achievements, and embark on group wellness quests"
    }
  ];

  const stats = [
    { icon: <Users size={24} />, label: "Active Heroes", value: 10000, suffix: "+" },
    { icon: <Target size={24} />, label: "Quests Completed", value: 150000, suffix: "+" },
    { icon: <Coins size={24} />, label: "Coins Earned", value: 2500000, suffix: "+" }
  ];

  const testimonials = [
    {
      name: "Sarah the Brave",
      level: "Level 47 Wellness Warrior",
      text: "This app transformed my fitness journey into an epic adventure! I've never been more motivated to stay active.",
      rating: 5
    },
    {
      name: "Marcus Questseeker",
      level: "Level 33 Adventure Master", 
      text: "The face recognition login is amazing, and earning Mythic Coins for walking makes every step feel rewarding!",
      rating: 5
    },
    {
      name: "Luna Stormwalker",
      level: "Level 52 Champion",
      text: "I love the real-world quest system. It turned my daily walks into magical adventures around my city.",
      rating: 5
    }
  ];

  useEffect(() => {
    // Animate feature carousel
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate numbers
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    stats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const timer = setInterval(() => {
        currentStep++;
        const value = Math.min(Math.floor(increment * currentStep), stat.value);
        
        setAnimatedNumbers(prev => ({
          ...prev,
          [index === 0 ? 'users' : index === 1 ? 'quests' : 'coins']: value
        }));

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    });
  }, []);

  return (
    <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      
      {/* Magical particle effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="magical-particles" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-amber-900/80 to-yellow-800/80 backdrop-blur-sm border-b border-amber-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center magical-glow border-2 border-amber-300">
                <Crown className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-cinzel font-bold text-amber-100 magical-glow">
                  Mythic Quest
                </h1>
                <p className="text-amber-200/80 text-sm font-merriweather">
                  Wellness Adventure Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onSignIn}
                className="text-amber-100 hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold magical-glow"
              >
                Start Quest
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-amber-100 magical-glow mb-6">
                Transform Your Wellness
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                  Into Epic Adventures
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-amber-200/90 font-merriweather mb-8 leading-relaxed">
                Embark on real-world wellness quests, earn Mythic Coins, level up your hero,
                and join a community of adventurers transforming their health through gamification.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  variant="primary"
                  onClick={onGetStarted}
                  icon={<Sparkles size={20} />}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-4 px-8 text-lg magical-glow"
                >
                  Begin Your Legend
                </Button>
                <Button
                  variant="outline"
                  onClick={onSignIn}
                  icon={<Shield size={20} />}
                  className="border-amber-400 text-amber-100 hover:bg-amber-400 hover:text-amber-900 py-4 px-8 text-lg"
                >
                  Hero Login
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {stats.map((stat, index) => (
                  <div key={index} className="fantasy-card p-6">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full text-white magical-glow">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-3xl font-cinzel font-bold text-amber-800 mb-2">
                      {index === 0 ? animatedNumbers.users.toLocaleString() : 
                       index === 1 ? animatedNumbers.quests.toLocaleString() : 
                       animatedNumbers.coins.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-amber-700 font-merriweather">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-amber-900/20 to-amber-800/20 backdrop-blur-sm">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-amber-100 magical-glow mb-6">
                Legendary Features
              </h2>
              <p className="text-xl text-amber-200/90 font-merriweather max-w-3xl mx-auto">
                Discover the magical powers that make Mythic Quest the ultimate wellness adventure platform
              </p>
            </div>

            {/* Interactive Feature Showcase */}
            <div className="max-w-6xl mx-auto mb-16">
              <div className="fantasy-card p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-4">
                      {features[currentFeature].icon}
                      <h3 className="text-2xl font-cinzel font-bold text-amber-800 ml-4">
                        {features[currentFeature].title}
                      </h3>
                    </div>
                    <p className="text-lg text-amber-700 font-merriweather mb-6">
                      {features[currentFeature].description}
                    </p>
                    <div className="flex space-x-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentFeature(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentFeature 
                              ? 'bg-amber-500 w-8' 
                              : 'bg-amber-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg p-6 flex items-center justify-center border-4 border-amber-300">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center magical-glow">
                          {features[currentFeature].icon}
                        </div>
                        <div className="text-amber-800 font-cinzel font-bold">
                          {features[currentFeature].title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`fantasy-card p-6 transition-all duration-300 cursor-pointer ${
                    index === currentFeature ? 'ring-2 ring-amber-400 magical-glow' : 'hover:shadow-xl'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="font-cinzel font-bold text-amber-800 ml-3">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-amber-700 font-merriweather text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-amber-100 magical-glow mb-6">
                Your Hero's Journey
              </h2>
              <p className="text-xl text-amber-200/90 font-merriweather max-w-3xl mx-auto">
                From novice adventurer to legendary wellness champion in four simple steps
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "1",
                    icon: <Camera className="text-purple-500" size={32} />,
                    title: "Face Registration",
                    description: "Register with advanced facial recognition for secure, keyless access to your adventure realm"
                  },
                  {
                    step: "2", 
                    icon: <Map className="text-blue-500" size={32} />,
                    title: "Choose Your Quest",
                    description: "Select from walking, running, or location-based wellness challenges tailored to your level"
                  },
                  {
                    step: "3",
                    icon: <Footprints className="text-green-500" size={32} />,
                    title: "Adventure Awaits", 
                    description: "Use GPS tracking and step counting to complete real-world quests and discover new locations"
                  },
                  {
                    step: "4",
                    icon: <Trophy className="text-amber-500" size={32} />,
                    title: "Reap Rewards",
                    description: "Earn XP, level up, collect Mythic Coins, and unlock achievements for your wellness victories"
                  }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto magical-glow border-4 border-amber-300">
                        {item.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-800 text-amber-100 rounded-full flex items-center justify-center text-sm font-bold font-cinzel">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-cinzel font-bold text-amber-100 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-amber-200/80 font-merriweather text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-gradient-to-b from-amber-900/20 to-amber-800/20 backdrop-blur-sm">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-amber-100 magical-glow mb-6">
                Heroes Speak
              </h2>
              <p className="text-xl text-amber-200/90 font-merriweather max-w-3xl mx-auto">
                Join thousands of adventurers who have transformed their wellness journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="fantasy-card p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-amber-500 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="text-amber-700 font-merriweather mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t border-amber-300 pt-4">
                    <div className="font-cinzel font-bold text-amber-800">
                      {testimonial.name}
                    </div>
                    <div className="text-amber-600 text-sm">
                      {testimonial.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-cinzel font-bold text-amber-100 magical-glow mb-6">
                Your Legend
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                  Begins Today
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-amber-200/90 font-merriweather mb-8 leading-relaxed">
                Join the ranks of wellness warriors and embark on your most epic adventure yet.
                Your healthiest, strongest self awaits in the realm of Mythic Quest.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={onGetStarted}
                  icon={<ArrowRight size={20} />}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-4 px-8 text-lg magical-glow"
                >
                  Start Your Adventure
                </Button>
                <Button
                  variant="outline"
                  onClick={onSignIn}
                  className="border-amber-400 text-amber-100 hover:bg-amber-400 hover:text-amber-900 py-4 px-8 text-lg"
                >
                  Continue Your Quest
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center text-amber-200/60 text-sm font-merriweather">
                <CheckCircle size={16} className="mr-2" />
                Free to start • No credit card required • Join 10,000+ heroes
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-amber-900/90 to-yellow-800/90 backdrop-blur-sm border-t border-amber-500/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="text-white" size={16} />
              </div>
              <div>
                <div className="font-cinzel font-bold text-amber-100">Mythic Quest</div>
                <div className="text-amber-200/80 text-sm">© 2025 Wellness Adventures</div>
              </div>
            </div>
            
            <div className="flex items-center text-amber-200/60 text-sm font-merriweather">
              <Sparkles size={12} className="mr-1" />
              <span>Powered by ancient wellness magic</span>
              <Sparkles size={12} className="ml-1" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;