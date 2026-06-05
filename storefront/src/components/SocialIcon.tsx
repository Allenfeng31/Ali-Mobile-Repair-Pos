type SocialPlatform = "facebook" | "instagram";

type SocialIconProps = {
  platform: SocialPlatform;
  className?: string;
};

export default function SocialIcon({ platform, className }: SocialIconProps) {
  if (platform === "facebook") {
    return (
      <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="24" height="24" rx="12" fill="#1877F2" />
        <path
          fill="#ffffff"
          d="M15.88 13.47l.35-2.28h-2.18V9.71c0-.62.3-1.23 1.28-1.23h.99V6.54s-.9-.15-1.76-.15c-1.79 0-2.96 1.08-2.96 3.04v1.76H9.61v2.28h1.99V19h2.45v-5.53h1.83z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ali-instagram-gradient" x1="2" x2="22" y1="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.32" stopColor="#FA7E1E" />
          <stop offset="0.58" stopColor="#D62976" />
          <stop offset="0.78" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill="url(#ali-instagram-gradient)" />
      <path
        fill="#ffffff"
        d="M12 7.3c1.53 0 1.71.01 2.31.04.56.03.86.12 1.06.2.27.1.46.23.66.43.2.2.33.39.43.66.08.2.17.5.2 1.06.03.6.04.78.04 2.31s-.01 1.71-.04 2.31c-.03.56-.12.86-.2 1.06-.1.27-.23.46-.43.66-.2.2-.39.33-.66.43-.2.08-.5.17-1.06.2-.6.03-.78.04-2.31.04s-1.71-.01-2.31-.04c-.56-.03-.86-.12-1.06-.2a1.78 1.78 0 0 1-.66-.43 1.78 1.78 0 0 1-.43-.66c-.08-.2-.17-.5-.2-1.06-.03-.6-.04-.78-.04-2.31s.01-1.71.04-2.31c.03-.56.12-.86.2-1.06.1-.27.23-.46.43-.66.2-.2.39-.33.66-.43.2-.08.5-.17 1.06-.2.6-.03.78-.04 2.31-.04zm0-1.03c-1.56 0-1.75.01-2.36.04-.61.03-1.03.13-1.39.27-.38.15-.7.35-1.02.67-.32.32-.52.64-.67 1.02-.14.36-.24.78-.27 1.39-.03.61-.04.8-.04 2.36s.01 1.75.04 2.36c.03.61.13 1.03.27 1.39.15.38.35.7.67 1.02.32.32.64.52 1.02.67.36.14.78.24 1.39.27.61.03.8.04 2.36.04s1.75-.01 2.36-.04c.61-.03 1.03-.13 1.39-.27.38-.15.7-.35 1.02-.67.32-.32.52-.64.67-1.02.14-.36.24-.78.27-1.39.03-.61.04-.8.04-2.36s-.01-1.75-.04-2.36c-.03-.61-.13-1.03-.27-1.39a2.8 2.8 0 0 0-.67-1.02 2.8 2.8 0 0 0-1.02-.67c-.36-.14-.78-.24-1.39-.27-.61-.03-.8-.04-2.36-.04z"
      />
      <path
        fill="#ffffff"
        d="M12 9.03a2.97 2.97 0 1 0 0 5.94 2.97 2.97 0 0 0 0-5.94zm0 4.9a1.93 1.93 0 1 1 0-3.86 1.93 1.93 0 0 1 0 3.86z"
      />
      <circle cx="15.08" cy="8.92" r=".69" fill="#ffffff" />
    </svg>
  );
}
