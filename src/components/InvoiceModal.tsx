import { useState, useEffect } from 'react';
import { X, Printer, FileText, Building2, Phone, Calendar, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatNPR } from '../lib/tax';

interface InvoiceData {
  invoice: any;
  order: any;
  store: any;
  compliance: any;
}

export default function InvoiceModal({ orderId, storeId, onClose }: { orderId: string; storeId: string; onClose: () => void }) {
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices?order_id=${orderId}&store_id=${storeId}`)
      .then(r => r.json())
      .then(d => {
        if (d.invoice) setData(d);
        else { setData(null); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId, storeId]);

  const generateInvoice = async () => {
    setGenerating(true);
    try {
      // Fetch order details
      const ordersRes = await fetch(`/api/orders?store_id=${storeId}`).then(r => r.json());
      const order = (Array.isArray(ordersRes) ? ordersRes : []).find((o: any) => String(o.id) === String(orderId));
      if (!order) { alert('Order not found'); return; }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          store_id: storeId,
          subtotal: Number(order.subtotal),
          vat_amount: Number(order.total) - Number(order.subtotal) > 0 ? Number(order.total) - Number(order.subtotal) : 0,
          total: Number(order.total),
          items: order.items,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
        }),
      });
      const invoice = await res.json();
      if (invoice.invoice_number) {
        // Re-fetch full invoice data
        const fullRes = await fetch(`/api/invoices?order_id=${orderId}&store_id=${storeId}`).then(r => r.json());
        setData(fullRes);
      }
    } catch (e) { alert('Failed to generate invoice'); }
    setGenerating(false);
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-white border-t-[#FF6600] rounded-full animate-spin" style={{ borderWidth: '3px' }} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:bg-white print:p-0 print:static">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl max-h-[95vh] overflow-y-auto print:max-h-none print:rounded-none print:shadow-none">
        {/* Header bar (hidden in print) */}
        <div className="sticky top-0 bg-white border-b border-[#E9ECEF] px-5 py-3 flex items-center justify-between z-10 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF6600]" />
            <h2 className="font-bold text-[#212529]">Tax Invoice</h2>
          </div>
          <div className="flex items-center gap-2">
            {data?.invoice && (
              <button onClick={handlePrint} className="text-sm font-semibold text-[#17A2B8] flex items-center gap-1 hover:underline">
                <Printer className="w-4 h-4" /> Print
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-lg"><X className="w-5 h-5 text-[#6C757D]" /></button>
          </div>
        </div>

        {!data?.invoice ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-[#ADB5BD] mx-auto mb-4" />
            <h3 className="font-bold text-[#212529] mb-2">No invoice generated yet</h3>
            <p className="text-sm text-[#6C757D] mb-4">Generate an IRD-compliant tax invoice for this order.</p>
            <button onClick={generateInvoice} disabled={generating} className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-5 py-2.5 rounded-lg disabled:opacity-60">
              {generating ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-[#0F1B3D]">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0F1B3D]">{data.store?.name || 'Store'}</h1>
                {data.store?.district && <p className="text-xs text-[#6C757D] mt-1">{data.store.district}, {data.store.province}, Nepal</p>}
                {data.store?.owner_phone && <p className="text-xs text-[#6C757D]">Tel: {data.store.owner_phone}</p>}
                {data.compliance?.pan_number && (
                  <p className="text-xs text-[#6C757D] mt-1 font-semibold">PAN: {data.compliance.pan_number}</p>
                )}
                {data.compliance?.vat_number && (
                  <p className="text-xs text-[#6C757D] font-semibold">VAT: {data.compliance.vat_number}</p>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-lg font-extrabold text-[#212529] uppercase tracking-wide">Tax Invoice</h2>
                <p className="text-xs text-[#6C757D] mt-1">
                  <Hash className="w-3 h-3 inline" /> {data.invoice.invoice_number}
                </p>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  <Calendar className="w-3 h-3 inline" /> {new Date(data.invoice.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kathmandu' })}
                </p>
                <p className="text-xs text-[#6C757D] mt-0.5">FY: {data.invoice.fiscal_year}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F8F9FA] rounded-lg p-3">
                <p className="text-[10px] font-bold text-[#6C757D] uppercase mb-1">Bill To</p>
                <p className="text-sm font-bold text-[#212529]">{data.invoice.customer_name}</p>
                <p className="text-xs text-[#6C757D] flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {data.invoice.customer_phone}</p>
                {data.order && (
                  <p className="text-xs text-[#6C757D] mt-1">{data.order.address_line}, Ward {data.order.ward}</p>
                )}
                {data.order && (
                  <p className="text-xs text-[#6C757D]">{data.order.municipality}, {data.order.district}</p>
                )}
              </div>
              <div className="bg-[#F8F9FA] rounded-lg p-3">
                <p className="text-[10px] font-bold text-[#6C757D] uppercase mb-1">Order Details</p>
                <p className="text-sm font-bold text-[#212529]">{data.order?.order_number || 'N/A'}</p>
                <p className="text-xs text-[#6C757D] mt-1">Payment: <span className="uppercase font-semibold">{data.order?.payment_method}</span></p>
                <p className="text-xs text-[#6C757D]">Status: <span className="capitalize font-semibold">{data.order?.status}</span></p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b-2 border-[#0F1B3D] text-left">
                  <th className="py-2 text-xs font-bold text-[#6C757D] uppercase">Item</th>
                  <th className="py-2 text-xs font-bold text-[#6C757D] uppercase text-center">Qty</th>
                  <th className="py-2 text-xs font-bold text-[#6C757D] uppercase text-right">Price</th>
                  <th className="py-2 text-xs font-bold text-[#6C757D] uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(data.invoice.items || data.order?.items || []).map((item: any, i: number) => (
                  <tr key={i} className="border-b border-[#E9ECEF]">
                    <td className="py-2 text-sm text-[#212529]">{item.name}</td>
                    <td className="py-2 text-center text-sm text-[#6C757D]">{item.qty}</td>
                    <td className="py-2 text-right text-sm text-[#6C757D]">{formatNPR(Number(item.price))}</td>
                    <td className="py-2 text-right text-sm font-semibold text-[#212529]">{formatNPR(Number(item.price) * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tax Breakup */}
            <div className="ml-auto w-full sm:w-64 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6C757D]">Taxable Amount</span>
                <span className="font-semibold text-[#212529]">{formatNPR(Number(data.invoice.subtotal))}</span>
              </div>
              {Number(data.invoice.vat_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">VAT (13%)</span>
                  <span className="font-semibold text-[#212529]">{formatNPR(Number(data.invoice.vat_amount))}</span>
                </div>
              )}
              {data.order && Number(data.order.shipping) > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Shipping</span>
                  <span className="font-semibold text-[#212529]">{formatNPR(Number(data.order.shipping))}</span>
                </div>
              )}
              {data.order && Number(data.order.discount) > 0 && (
                <div className="flex justify-between text-[#28A745]">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatNPR(Number(data.order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-[#0F1B3D] pt-2">
                <span className="font-extrabold text-[#212529]">Total</span>
                <span className="font-extrabold text-[#0F1B3D] text-lg">{formatNPR(Number(data.invoice.total))}</span>
              </div>
              <p className="text-[10px] text-[#6C757D] text-right mt-1">All amounts in NPR (रू)</p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-[#E9ECEF] text-center">
              <p className="text-xs text-[#6C757D] mb-2">This is a computer-generated invoice and is valid as per IRD Nepal regulations.</p>
              <div className="flex items-center justify-center gap-2 text-xs">
                {data.compliance?.pan_number ? (
                  <span className="flex items-center gap-1 text-[#28A745]"><CheckCircle2 className="w-3.5 h-3.5" /> PAN Verified</span>
                ) : (
                  <span className="flex items-center gap-1 text-[#DC3545]"><AlertCircle className="w-3.5 h-3.5" /> PAN Not Registered</span>
                )}
                {Number(data.invoice.vat_amount) > 0 && (
                  <span className="flex items-center gap-1 text-[#28A745]"><CheckCircle2 className="w-3.5 h-3.5" /> VAT Included</span>
                )}
              </div>
              <p className="text-[10px] text-[#ADB5BD] mt-2">Thank you for your business! — Pasal Nepal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
