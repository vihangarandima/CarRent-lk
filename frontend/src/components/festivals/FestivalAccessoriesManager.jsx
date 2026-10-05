import React from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";
import ChristmasAccessories from "./ChristmasAccessories";
import VesakAccessories from "./VesakAccessories";

/**
 * Global Festival Accessories Manager
 * Renders the active celebration accessories across the site without changing the base brand colors.
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

  // Future festivals (Avurudu, etc.) will be added here one by one!
  return null;
};

export default FestivalAccessoriesManager;
