import type { IconType } from "react-icons";
import {
    FiBox,
    FiDroplet,
    FiGrid,
    FiHome,
    FiLayers,
    FiMaximize,
    FiSquare,
    FiSun,
    FiTool,
    FiZap,
    FiFeather,
    FiLayout,
} from "react-icons/fi";

/** Icons a service can use. The key is what the services table stores. */
export const SERVICE_ICONS: Record<string, IconType> = {
    FiLayers,
    FiGrid,
    FiDroplet,
    FiMaximize,
    FiBox,
    FiSun,
    FiSquare,
    FiHome,
    FiTool,
    FiZap,
    FiFeather,
    FiLayout,
};

export function serviceIcon(name: string): IconType {
    return SERVICE_ICONS[name] ?? FiBox;
}
