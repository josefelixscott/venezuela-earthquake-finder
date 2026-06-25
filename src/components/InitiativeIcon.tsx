import {
  IconBuildingWarehouse,
  IconGift,
  IconHome,
  IconBus,
  IconUsersGroup,
  IconHelpCircle,
} from "@tabler/icons-react";

const ICONS: Record<string, typeof IconBuildingWarehouse> = {
  centro_de_acopio: IconBuildingWarehouse,
  donaciones: IconGift,
  refugio: IconHome,
  transporte: IconBus,
  voluntariado: IconUsersGroup,
  otro: IconHelpCircle,
};

export default function InitiativeIcon({
  category,
  size = 40,
}: {
  category: string;
  size?: number;
}) {
  const Icon = ICONS[category] ?? IconHelpCircle;
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0"
    >
      <Icon size={size * 0.45} stroke={1.75} />
    </div>
  );
}
