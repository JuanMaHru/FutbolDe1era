const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

export const IconInstagram = () => (
  <svg {...p}><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.1-.1ZM12 2c-2.7 0-3.1 0-4.2.1C4.2 2.2 2.2 4.2 2.1 7.8 2 8.9 2 9.3 2 12s0 3.1.1 4.2c.2 3.6 2.1 5.6 5.7 5.7 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c3.6-.2 5.6-2.1 5.7-5.7.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2c-.2-3.6-2.1-5.6-5.7-5.7C15.1 2 14.7 2 12 2Z" /></svg>
);
export const IconX = () => (
  <svg {...p}><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" /></svg>
);
export const IconTikTok = () => (
  <svg {...p}><path d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.2 6.2 0 1 0 5.3 6.2V8.6a7.9 7.9 0 0 0 4.4 1.3V6.6a4.5 4.5 0 0 1-4.4-4.6Z" /></svg>
);
export const IconSound = ({ on }: { on: boolean }) => (
  <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
    {on ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></> : <><path d="m22 9-6 6" /><path d="m16 9 6 6" /></>}
  </svg>
);
export const IconHelp = () => (
  <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5" /><circle cx="12" cy="18" r="0.6" fill="currentColor" /></svg>
);
export const IconClose = () => (
  <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
);
