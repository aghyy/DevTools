import Image from 'next/image';
import React from 'react';
interface IconProps {
  icon: string | React.ComponentType<{ className?: string }>;
}

export default function Icon({ icon }: IconProps) {
  if (typeof icon === 'string') {
    return (
      <div className="size-5">
        <Image
          src={icon}
          alt="icon"
          width={20}
          height={20}
          unoptimized
        />
      </div>
    );
  }

  return React.createElement(icon);
}