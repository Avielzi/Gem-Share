import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

// A type-safe way to get the icon component.
const getIcon = (name: string): React.ComponentType<LucideProps> => {
    // Cast to unknown first to handle the mixed exports in the lucide-react module.
    const icons = LucideIcons as unknown as { [key: string]: unknown };
    const IconComponent = icons[name];

    // Explicitly check if the retrieved export is a function before treating it as a component.
    // This is more robust than a simple truthiness check and prevents runtime errors.
    if (typeof IconComponent === 'function') {
        return IconComponent as React.ComponentType<LucideProps>;
    }

    // Fallback to a default icon if the requested one doesn't exist or is not a valid component.
    return LucideIcons.Sparkles;
};

interface IconProps extends LucideProps {
  name: string;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = getIcon(name);
  return <LucideIcon {...props} />;
};

export default Icon;