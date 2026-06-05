type SocialIconName = "facebook" | "instagram";

interface SocialIconProps {
  name: SocialIconName;
  className?: string;
}

export default function SocialIcon({ name, className }: SocialIconProps) {
  if (name === "facebook") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="11" fill="#1877F2" />
        <path
          fill="#fff"
          d="M14.78 12.64h-1.86v6.81h-2.84v-6.81H8.74v-2.42h1.34V8.66c0-1.12.53-2.87 2.87-2.87l2.11.01v2.35h-1.53c-.25 0-.61.13-.61.67v1.4h2.19l-.33 2.42Z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="instagram-gradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.28" stopColor="#FA7E1E" />
          <stop offset="0.55" stopColor="#D62976" />
          <stop offset="0.78" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#instagram-gradient)" />
      <path
        fill="#fff"
        d="M12 7.35A4.65 4.65 0 1 0 12 16.65 4.65 4.65 0 0 0 12 7.35Zm0 7.62A2.97 2.97 0 1 1 12 9.03a2.97 2.97 0 0 1 0 5.94Zm5.96-7.81a1.08 1.08 0 1 1-2.16 0 1.08 1.08 0 0 1 2.16 0Z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M7.76 4.62h8.48a3.15 3.15 0 0 1 3.14 3.14v8.48a3.15 3.15 0 0 1-3.14 3.14H7.76a3.15 3.15 0 0 1-3.14-3.14V7.76a3.15 3.15 0 0 1 3.14-3.14Zm8.48 1.76H7.76c-.76 0-1.38.62-1.38 1.38v8.48c0 .76.62 1.38 1.38 1.38h8.48c.76 0 1.38-.62 1.38-1.38V7.76c0-.76-.62-1.38-1.38-1.38Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
