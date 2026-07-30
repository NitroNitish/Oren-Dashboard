import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '../components/SEO';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Oren Dashboard",
    "url": "https://oren-dashboard.com",
    "description": "Professional quotation, billing, and portfolio management for your digital business."
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white font-sans">
      <SEO 
        title="Home" 
        description="Professional quotation, billing, and portfolio management for your digital business." 
        schema={schema}
      />
      {/* Background Video */}
      <video
        className="fixed inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4" type="video/mp4" />
      </video>

      {/* Bottom Blur Overlay */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none backdrop-blur-xl"
        style={{
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
        }}
      />

      {/* ASCII/Dot-Matrix Texture Overlay */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none mix-blend-overlay opacity-50"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
      />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
        {/* Left: Logo */}
        <div 
          className="flex items-center gap-2 h-8 md:h-10 opacity-0 animate-blur-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          <img 
            src="/favicon.png" 
            alt="Oren Icon" 
            className="h-full w-auto object-contain"
          />
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-primary mt-1">
            Oren
          </span>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-end h-[calc(100%-80px)] px-4 sm:px-6 md:px-12 pb-8 md:pb-16 pointer-events-none">
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 pointer-events-auto">
          
          {/* Left Side Content */}
          <div className="flex-1 max-w-4xl">


            {/* Title */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-[-0.04em] mb-4 md:mb-6 opacity-0 animate-blur-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              Manage Your Business.<br />Work Smarter.
            </h1>

            {/* Description */}
            <p 
              className="text-sm sm:text-base md:text-lg text-gray-400 mb-6 md:mb-12 max-w-2xl opacity-0 animate-blur-fade-up"
              style={{ animationDelay: '500ms' }}
            >
              Professional quotation, billing, and portfolio management for your digital business.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                to="/auth"
                className="bg-white text-black rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2 hover:bg-gray-200 transition-colors opacity-0 animate-blur-fade-up"
                style={{ animationDelay: '600ms' }}
              >
                <span>Get Started</span>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
