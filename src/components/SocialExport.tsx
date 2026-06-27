import { useState } from 'react';
import { Download, Share2, Instagram, Facebook, MessageCircle, X, Loader2, Check, Copy } from 'lucide-react';

export default function SocialExport({ storeId, storeName }: { storeId: string; storeName: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [whatsappLinks, setWhatsappLinks] = useState<any[]>([]);
  const [showCaptions, setShowCaptions] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const downloadCSV = async () => {
    setLoading('csv');
    try {
      const res = await fetch(`/api/social-export?store_id=${storeId}&format=facebook_csv`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facebook_catalog_${storeId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Download failed'); }
    setLoading(null);
  };

  const loadCaptions = async () => {
    setLoading('captions');
    try {
      const res = await fetch(`/api/social-export?store_id=${storeId}&format=instagram_caption`);
      const data = await res.json();
      setCaptions(data.captions || []);
      setShowCaptions(true);
    } catch (e) { alert('Failed to load captions'); }
    setLoading(null);
  };

  const loadWhatsApp = async () => {
    setLoading('whatsapp');
    try {
      const res = await fetch(`/api/social-export?store_id=${storeId}&format=whatsapp_links`);
      const data = await res.json();
      setWhatsappLinks(data.links || []);
      setShowWhatsApp(true);
    } catch (e) { alert('Failed to load links'); }
    setLoading(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportOptions = [
    {
      id: 'facebook_csv',
      name: 'Facebook Catalog',
      icon: Facebook,
      color: '#1877F2',
      bg: '#1877F215',
      desc: 'Download CSV for Facebook Business Manager product catalog upload',
      action: downloadCSV,
      actionLabel: 'Download CSV',
    },
    {
      id: 'instagram',
      name: 'Instagram Captions',
      icon: Instagram,
      color: '#E4405F',
      bg: '#E4405F15',
      desc: 'Generate ready-to-post captions with hashtags for each product',
      action: loadCaptions,
      actionLabel: 'Generate Captions',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Share',
      icon: MessageCircle,
      color: '#25D366',
      bg: '#25D36615',
      desc: 'Create direct WhatsApp share links for each product',
      action: loadWhatsApp,
      actionLabel: 'Get Links',
    },
  ];

  return (
    <div>
      <h3 className="font-bold text-[#212529] mb-1 flex items-center gap-2">
        <Share2 className="w-4 h-4 text-[#FF6600]" /> Social Commerce Export
      </h3>
      <p className="text-xs text-[#6C757D] mb-4">Export products to Facebook, Instagram & WhatsApp — where Nepali customers shop</p>

      <div className="grid sm:grid-cols-3 gap-3">
        {exportOptions.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={opt.action}
              disabled={loading !== null}
              className="bg-white border border-[#E9ECEF] rounded-lg p-4 text-left hover:border-[#FF6600] hover:shadow-md transition-all disabled:opacity-60"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: opt.bg }}>
                <Icon className="w-5 h-5" style={{ color: opt.color }} />
              </div>
              <p className="text-sm font-bold text-[#212529]">{opt.name}</p>
              <p className="text-xs text-[#6C757D] mt-1 mb-3">{opt.desc}</p>
              <span className="text-xs font-bold flex items-center gap-1" style={{ color: opt.color }}>
                {loading === opt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : opt.actionLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Instagram Captions Modal */}
      {showCaptions && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF] sticky top-0 bg-white">
              <h3 className="font-bold text-[#212529] flex items-center gap-2"><Instagram className="w-4 h-4 text-[#E4405F]" /> Instagram Captions</h3>
              <button onClick={() => setShowCaptions(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              {captions.map((c: any) => (
                <div key={c.product_id} className="border border-[#E9ECEF] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={c.image_url} className="w-10 h-10 rounded object-cover" />
                    <p className="text-sm font-semibold text-[#212529] flex-1">{c.name}</p>
                    <button onClick={() => copyToClipboard(c.caption, c.product_id)} className="text-xs text-[#17A2B8] font-bold flex items-center gap-1">
                      {copied === c.product_id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="text-xs text-[#6C757D] whitespace-pre-wrap font-sans bg-[#F8F9FA] rounded-md p-2">{c.caption}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Links Modal */}
      {showWhatsApp && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF] sticky top-0 bg-white">
              <h3 className="font-bold text-[#212529] flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp Share Links</h3>
              <button onClick={() => setShowWhatsApp(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-2">
              {whatsappLinks.map((l: any) => (
                <div key={l.product_id} className="flex items-center gap-3 border border-[#E9ECEF] rounded-lg p-3">
                  <img src={l.image_url} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#212529] truncate">{l.name}</p>
                  </div>
                  <a href={l.whatsapp_url} target="_blank" className="bg-[#25D366] text-white text-xs font-bold px-3 py-2 rounded-md flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Share
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
