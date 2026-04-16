const COLORS: Record<string, string> = {
  image:   '#3A6BC5',
  video:   '#7C3AED',
  audio:   '#D97706',
  pdf:     '#DC2626',
  text:    '#64748B',
  archive: '#92400E',
  default: '#9CA3AF',
};

function category(mark: string): string {
  const m = mark.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(m)) return 'image';
  if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(m)) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(m)) return 'audio';
  if (m === 'pdf') return 'pdf';
  if (['txt', 'md', 'json', 'yaml', 'yml', 'toml', 'csv', 'xml', 'html', 'css', 'js', 'ts', 'hoon'].includes(m)) return 'text';
  if (['zip', 'tar', 'gz', '7z', 'rar', 'bz2'].includes(m)) return 'archive';
  return 'default';
}

function Icon({ cat }: { cat: string }) {
  switch (cat) {
    case 'image':
      return (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </>
      );
    case 'video':
      return (
        <>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M10 8.5v7l6-3.5-6-3.5z" />
        </>
      );
    case 'audio':
      return (
        <>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </>
      );
    case 'pdf':
      return (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h3a1.5 1.5 0 0 0 0-3H8v6" />
        </>
      );
    case 'text':
      return (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h5" />
        </>
      );
    case 'archive':
      return (
        <>
          <rect x="2" y="7" width="20" height="15" rx="2" />
          <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
          <path d="M10 12h4" />
        </>
      );
    default:
      return (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
        </>
      );
  }
}

export default function FileIcon({ mark, className }: { mark: string; className?: string }) {
  const cat = category(mark);
  const color = COLORS[cat];
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Icon cat={cat} />
    </svg>
  );
}
