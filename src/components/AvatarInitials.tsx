function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export default function AvatarInitials({
  name,
  size = 40,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-red-50 text-red-800 flex items-center justify-center font-medium shrink-0 ${className}`}
    >
      <span style={{ fontSize: size * 0.35 }}>{getInitials(name)}</span>
    </div>
  );
}
