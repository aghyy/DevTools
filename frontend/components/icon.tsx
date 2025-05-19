import Image from 'next/image';
import React from 'react';
interface IconProps {
  icon: string | React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function Icon({ icon, className }: IconProps) {
  if (typeof icon === 'string') {
    return (
      <div className={`size-5 ${className}`}>
        <Image
          src={icon}
          alt="icon"
          width={16}
          height={16}
          unoptimized
        />
      </div>
    );
  }

  return React.createElement(icon, { className });
}