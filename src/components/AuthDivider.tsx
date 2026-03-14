const FONT = "'DM Sans', Arial, sans-serif";

export default function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-muted-foreground" style={{ fontFamily: FONT, fontSize: '13px' }}>or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
