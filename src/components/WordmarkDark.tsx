import logoSvg from '@/assets/TEMPLE_wordmark_white-nobg.svg';

export default function WordmarkDark({ className = '' }: { className?: string }) {
  return <img src={logoSvg} alt="Temple" className={className} />;
}
