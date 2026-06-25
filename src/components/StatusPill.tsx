export default function StatusPill({ status }: { status: "looking" | "found" }) {
  if (status === "found") {
    return (
      <span className="text-[10px] font-medium bg-green-50 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">
        Encontrado/a
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium bg-red-50 text-red-800 px-2 py-0.5 rounded-full whitespace-nowrap">
      Buscando
    </span>
  );
}
