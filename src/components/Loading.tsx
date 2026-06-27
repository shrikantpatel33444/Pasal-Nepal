export default function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-3 border-[#E9ECEF] border-t-[#FF6600] rounded-full animate-spin" style={{ borderWidth: '3px' }} />
      <p className="text-sm text-[#6C757D]">{label}</p>
    </div>
  );
}
