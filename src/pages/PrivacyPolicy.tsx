import { useTheme } from '../contexts/ThemeContext';

const sections = [
  {
    title: 'What Temple Collects',
    body: `When you create an account, Temple collects your email address for authentication purposes. Your conversation data is stored to maintain continuity across sessions. If you choose to provide birth data for personalisation, that information is also retained. Additionally, Temple stores your theme and font preferences to preserve your chosen experience across devices.`,
  },
  {
    title: 'How It Is Used',
    body: `Your data is used solely to provide and personalise the Temple experience. Conversation history allows Temple to maintain context and offer more reflective, meaningful responses over time. Your information is never sold to third parties, and Temple does not use your data for advertising or any purpose beyond delivering the service itself.`,
  },
  {
    title: 'Third Party Services',
    body: `Temple relies on a small number of third-party services to function. Supabase provides database hosting and authentication infrastructure. You can review their privacy policy at https://supabase.com/privacy. Perplexity powers the AI responses within Temple. Their privacy policy is available at https://www.perplexity.ai/privacy. No other third-party services have access to your data.`,
  },
  {
    title: 'Cookies',
    body: `Temple uses minimal session cookies required for authentication. These cookies allow you to remain signed in across visits. Temple does not use tracking cookies, analytics cookies, or any third-party cookie-based services.`,
  },
  {
    title: 'Your Rights',
    body: `You may request access to, deletion of, or export of your personal data at any time. To exercise any of these rights, contact the address listed below. Requests will be processed within a reasonable timeframe.`,
  },
  {
    title: 'Contact',
    body: `For privacy-related requests or questions, please reach out to privacy@temple.app.`,
  },
  {
    title: 'Changes to This Policy',
    body: `Temple may update this privacy policy from time to time. When changes are made, users will be notified by email. Continued use of the service after notification constitutes acceptance of the updated policy.`,
  },
];

export default function PrivacyPolicy() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-[rgba(255,255,255,0.4)]' : 'text-[rgba(0,0,0,0.4)]';
  const bodyOpacity = 'opacity-75';

  return (
    <div className="flex-1 flex justify-center px-6 md:px-10">
      <div className="w-full max-w-[680px] pt-16 pb-20">
        {/* Header */}
        <h1 className={`font-['Playfair_Display',_serif] text-3xl md:text-4xl font-light ${textColor}`}>
          Privacy Policy
        </h1>
        <p className={`font-['Inter',_sans-serif] text-xs ${mutedColor} mt-2`}>
          Last updated — March 12, 2026
        </p>

        {/* Body */}
        <div className="mt-12 flex flex-col gap-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className={`font-['Inter',_sans-serif] text-[0.65rem] uppercase tracking-[0.15em] ${mutedColor} mb-3`}>
                {section.title}
              </h2>
              <p className={`font-['Inter',_sans-serif] text-[0.85rem] font-light leading-[1.85] ${textColor} ${bodyOpacity}`}>
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
