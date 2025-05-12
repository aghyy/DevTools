import Image from 'next/image';

interface IconProps {
  src: string;
}

export default function Icon({ src }: IconProps) {
  return (
    <div className="size-5">
      <Image 
        src={src} 
        alt="icon" 
        width={20} 
        height={20}
        unoptimized 
      />
    </div>
  );
}