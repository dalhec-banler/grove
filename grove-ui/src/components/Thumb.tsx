import { IMAGE_MARKS } from '../format';
import FileIcon from './FileIcon';

const dims = {
  sm:  'w-6 h-6',
  md:  'w-10 h-10',
  lg:  'w-12 h-12',
  xl:  'w-16 h-16',
  fill: 'w-full h-full',
} as const;

const iconDims = {
  sm:  'w-5 h-5',
  md:  'w-7 h-7',
  lg:  'w-9 h-9',
  xl:  'w-12 h-12',
  fill: 'w-16 h-16',
} as const;

type Size = keyof typeof dims;

export default function Thumb({ mark, src, size = 'md' }: { mark: string; src?: string; size?: Size }) {
  const isImage = IMAGE_MARKS.has(mark.toLowerCase());
  if (isImage && src) {
    return <img src={src} alt="" className={`${dims[size]} object-cover ${size === 'fill' ? '' : 'rounded shrink-0'}`} loading="lazy" />;
  }
  return (
    <span className={`${dims[size]} flex items-center justify-center ${size === 'fill' ? '' : 'shrink-0'}`}>
      <FileIcon mark={mark} className={iconDims[size]} />
    </span>
  );
}
