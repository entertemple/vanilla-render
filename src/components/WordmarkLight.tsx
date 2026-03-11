import logoSvg from '@/assets/TEMPLE_wordmark_black-nobg.svg';

export default function WordmarkLight({ className = '' }: { className?: string }) {
  return <img src={logoSvg} alt="Temple" className={className} />;
}
