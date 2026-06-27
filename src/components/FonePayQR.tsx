import { QRCodeSVG } from 'qrcode.react';

interface FonePayQRProps {
  merchantId: string;
  merchantName: string;
  amount: number;
  refId: string;
  expiresIn?: number;
}

export default function FonePayQR({ merchantId, merchantName, amount, refId, expiresIn = 300 }: FonePayQRProps) {
  // FonePay dynamic QR payload format (simulated)
  const payload = JSON.stringify({
    type: 'fonepay-qr',
    merchantId,
    merchantName,
    amount: amount.toString(),
    refId,
    currency: 'NPR',
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#1E88E5]/20 shadow-sm">
          <QRCodeSVG
            value={payload}
            size={200}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#0F1B3D"
            imageSettings={{
              src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxRTg4RTUiLz48L3N2Zz4=',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>
        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#1E88E5] rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#1E88E5] rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#1E88E5] rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#1E88E5] rounded-br-lg" />
      </div>

      <div className="text-center">
        <p className="text-2xl font-extrabold text-[#000000]">रू {amount.toLocaleString('en-IN')}</p>
        <p className="text-xs text-[#6C757D] mt-1">Scan with any Nepal bank app</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#6C757D]">
        <span className="w-2 h-2 rounded-full bg-[#28A745] animate-pulse" />
        QR expires in {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {['NIC Asia', 'Global IME', 'NMB', 'Everest', 'Nabil', 'Prabhu'].map(b => (
          <span key={b} className="text-[10px] bg-[#F8F9FA] text-[#6C757D] px-2 py-0.5 rounded-full">{b}</span>
        ))}
      </div>
    </div>
  );
}
