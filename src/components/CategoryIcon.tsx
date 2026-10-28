import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-5 h-5',
  color,
}) => {
  // Access icon by name or fallback to Tag
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconName] || Icons.Tag;

  return <IconComponent className={className} style={color ? { color } : undefined} />;
};
