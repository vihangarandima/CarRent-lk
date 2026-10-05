import React from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";
import ChristmasAccessories, {
  ChristmasHeroDecorations,
  ChristmasFooterDecorations,
} from "./ChristmasAccessories";
import VesakAccessories, {
  VesakHeroDecorations,
  VesakFooterDecorations,
} from "./VesakAccessories";

/**
 * Hero Section Festival Decorations
 * Renders decorative festival accessories ONLY in the Hero section,
 * carefully placed in the margins/corners so text is NEVER covered.
 */
export const FestivalHeroDecorations = ({ compact = false, previewConfig = null }) => {
  const { config: globalConfig } = useSiteConfig();
  const config = previewConfig || globalConfig;
  const activeFestival = config?.global?.festivalTheme?.active || "none";

  if (activeFestival === "christmas") {
    return <ChristmasHeroDecorations compact={compact} />;
  }

  if (activeFestival === "vesak") {
    return <VesakHeroDecorations compact={compact} />;
  }

  return null;
};

/**
 * Footer Section Festival Decorations
 * Renders decorative festival accessories ONLY in the Footer,
 * framing the CTA banner and footer base without touching links or text.
 */
export const FestivalFooterDecorations = ({ previewConfig = null }) => {
  const { config: globalConfig } = useSiteConfig();
  const config = previewConfig || globalConfig;
  const activeFestival = config?.global?.festivalTheme?.active || "none";

  if (activeFestival === "christmas") {
    return <ChristmasFooterDecorations />;
  }

  if (activeFestival === "vesak") {
    return <VesakFooterDecorations />;
  }

  return null;
};

/**
 * Global Festival Accessories Manager
 * Mounted globally in App.jsx.
 * Renders ONLY the ambient atmosphere (snowflakes for Christmas, glowing golden particles for Vesak)
 * and the top header garland, leaving the rest of the page completely clear of accessory clutter.
 */
const FestivalAccessoriesManager = ({ previewConfig = null, isVirtualPreview = false }) => {
  const { config: globalConfig } = useSiteConfig();
  const config = previewConfig || globalConfig;
  const activeFestival = config?.global?.festivalTheme?.active || "none";

  if (activeFestival === "christmas") {
    return <ChristmasAccessories previewConfig={config} isVirtualPreview={isVirtualPreview} />;
  }

  if (activeFestival === "vesak") {
    return <VesakAccessories previewConfig={config} isVirtualPreview={isVirtualPreview} />;
  }

  return null;
};

export default FestivalAccessoriesManager;
