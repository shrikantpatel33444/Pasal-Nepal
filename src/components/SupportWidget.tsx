import { useState, useEffect } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(false);

  // Show after 3 seconds on page
  useEffect(() => {
    const timer = setTimeout(() => setDeferredPrompt(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const supportChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      bg: '#25D36615',
      url: 'https://wa.me/9779800000000?text=Hello%20Pasal%20Nepal,%20I%20need%20help%20with%20my%20order',
      desc: 'Chat with us on WhatsApp',
    },
    {
      id: 'viber',
      name: 'Viber',
      icon: '📞',
      color: '#7360F2',
      bg: '#7360F215',
      url: 'viber://chat?number=9779800000000',
      desc: 'Message us on Viber',
    },
    {
      id: 'phone',
      name: 'Phone Call',
      icon: '📱',
      color: '#28A745',
      bg: '#28A74515',
      url: 'tel:+9779800000000',
      desc: 'Call our support line',
    },
    {
      id: 'messenger',
      name: 'Messenger',
      icon: '✉️',
      color: '#0084FF',
      bg: '#0084FF15',
      url: 'https://m.me/pasalnepal',
      desc: 'Facebook Messenger',
    },
  ];

  return (
    <>
      {/* Floating button */}
      {deferredPrompt && (
        <button
          onClick={() => setOpen(!open)}
          className={`fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${open ? 'bg-[#DC3545] rotate-90' : 'bg-[#25D366] animate-pulse'}`}
          aria-label="Customer Support"
        >
          {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
          {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC3545] rounded-full border-2 border-white" />}
        </button>
      )}

      {/* Support panel */}
      {open && (
        <div className="fixed bottom-36 md:bottom-24 right-4 z-40 bg-white rounded-2xl shadow-2xl border border-[#E9ECEF] w-72 overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0F1B3D] to-[#1A2B5C] text-white p-4">
            <h3 className="font-bold text-lg">Customer Support 🇳🇵</h3>
            <p className="text-xs text-white/70 mt-0.5">We're here to help! Choose your preferred channel.</p>
          </div>
          <div className="p-3 space-y-2">
            {supportChannels.map(ch => (
              <a
                key={ch.id}
                href={ch.url}
                target={ch.id === 'phone' ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F9FA] transition-colors border border-transparent hover:border-[#E9ECEF]"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: ch.bg }}>
                  {ch.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#212529]">{ch.name}</p>
                  <p className="text-xs text-[#6C757D]">{ch.desc}</p>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: ch.color }} />
              </a>
            ))}
          </div>
          <div className="bg-[#F8F9FA] px-4 py-3 text-center">
            <p className="text-xs text-[#6C757D] flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" /> Support hours: 9 AM - 8 PM (NPT)
            </p>
            <p className="text-[10px] text-[#ADB5BD] mt-1">Average response time: 5 minutes</p>
          </div>
        </div>
      )}
    </>
  );
}
