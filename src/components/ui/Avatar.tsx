"use client";

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name: string): string {
  const colors = [
    "bg-brand-200 text-brand-800",
    "bg-amber-200 text-amber-800",
    "bg-blue-200 text-blue-800",
    "bg-purple-200 text-purple-800",
    "bg-rose-200 text-rose-800",
    "bg-teal-200 text-teal-800",
    "bg-orange-200 text-orange-800",
  ];
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export default function Avatar({ name, url, size = "md" }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getColor(name)} rounded-full flex items-center justify-center font-medium`}
    >
      {getInitials(name)}
    </div>
  );
}
