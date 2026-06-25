import { EXTERIOR_OPTION } from "@/lib/venezuelaStates";

export function getStateFlag(state: string | null): string {
  if (!state) return "";
  return state === EXTERIOR_OPTION ? "🌎" : "🇻🇪";
}
