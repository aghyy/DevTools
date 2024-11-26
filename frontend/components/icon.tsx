interface IconProps {
  src: string;
}

export default function Icon({ src }: IconProps) {
  return (
    <div className="size-5">
      <img src={src} alt="icon" />
    </div>
  );
}