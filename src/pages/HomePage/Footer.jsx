import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, X } from 'lucide-react';

// ─── Modal Component ───────────────────────────────────────────────
export function PolicyModal({ item, onClose }) {
  const { t } = useTranslation();
  if (!item) return null;

  const getModalData = (key) => {
    switch (key) {
      case 'personal_data':
        return {
          title: t('footer.modal.personal_data.title'),
          content: [
            { heading: t('footer.modal.personal_data.h1'), body: t('footer.modal.personal_data.b1') },
            { heading: t('footer.modal.personal_data.h2'), body: t('footer.modal.personal_data.b2') },
            { heading: t('footer.modal.personal_data.h3'), body: t('footer.modal.personal_data.b3') },
            { heading: t('footer.modal.personal_data.h4'), body: t('footer.modal.personal_data.b4') }
          ]
        };
      case 'account_security':
        return {
          title: t('footer.modal.account_security.title'),
          content: [
            { heading: t('footer.modal.account_security.h1'), body: t('footer.modal.account_security.b1') },
            { heading: t('footer.modal.account_security.h2'), body: t('footer.modal.account_security.b2') },
            { heading: t('footer.modal.account_security.h3'), body: t('footer.modal.account_security.b3') },
            { heading: t('footer.modal.account_security.h4'), body: t('footer.modal.account_security.b4') }
          ]
        };
      case 'cookie_policy':
        return {
          title: t('footer.modal.cookie_policy.title'),
          content: [
            { heading: t('footer.modal.cookie_policy.h1'), body: t('footer.modal.cookie_policy.b1') },
            { heading: t('footer.modal.cookie_policy.h2'), body: t('footer.modal.cookie_policy.b2') },
            { heading: t('footer.modal.cookie_policy.h3'), body: t('footer.modal.cookie_policy.b3') }
          ]
        };
      case 'api_access':
        return {
          title: t('footer.modal.api_access.title'),
          content: [
            { heading: t('footer.modal.api_access.h1'), body: t('footer.modal.api_access.b1') },
            {
              heading: t('footer.modal.api_access.h2'),
              body: [
                t('footer.modal.api_access.b2_1'),
                t('footer.modal.api_access.b2_2'),
                t('footer.modal.api_access.b2_3')
              ]
            },
            { heading: t('footer.modal.api_access.h3'), body: t('footer.modal.api_access.b3') }
          ]
        };
      case 'terms_of_use':
        return {
          title: t('footer.modal.terms_of_use.title'),
          content: [
            { heading: t('footer.modal.terms_of_use.h1'), body: t('footer.modal.terms_of_use.b1') },
            { heading: t('footer.modal.terms_of_use.h2'), body: t('footer.modal.terms_of_use.b2') },
            { heading: t('footer.modal.terms_of_use.h3'), body: t('footer.modal.terms_of_use.b3') },
            { heading: t('footer.modal.terms_of_use.h4'), body: t('footer.modal.terms_of_use.b4') }
          ]
        };
      case 'liability':
        return {
          title: t('footer.modal.liability.title'),
          content: [
            { heading: t('footer.modal.liability.h1'), body: t('footer.modal.liability.b1') },
            { heading: t('footer.modal.liability.h2'), body: t('footer.modal.liability.b2') },
            { heading: t('footer.modal.liability.h3'), body: t('footer.modal.liability.b3') }
          ]
        };
      case 'refund':
        return {
          title: t('footer.modal.refund.title'),
          content: [
            { heading: t('footer.modal.refund.h1'), body: t('footer.modal.refund.b1') },
            { heading: t('footer.modal.refund.h2'), body: t('footer.modal.refund.b2') },
            { heading: t('footer.modal.refund.h3'), body: t('footer.modal.refund.b3') }
          ]
        };
      case 'ai_rules':
        return {
          title: t('footer.modal.ai_rules.title'),
          content: [
            { heading: t('footer.modal.ai_rules.h1'), body: t('footer.modal.ai_rules.b1') },
            { heading: t('footer.modal.ai_rules.h2'), body: t('footer.modal.ai_rules.b2') },
            { heading: t('footer.modal.ai_rules.h3'), body: t('footer.modal.ai_rules.b3') }
          ]
        };
      case 'tech_support':
        return {
          title: t('footer.modal.tech_support.title'),
          content: [
            { heading: t('footer.modal.tech_support.h1'), body: t('footer.modal.tech_support.b1') },
            { heading: t('footer.modal.tech_support.h2'), body: t('footer.modal.tech_support.b2') },
            {
              heading: t('footer.modal.tech_support.h3'),
              body: [
                t('footer.modal.tech_support.b3_1'),
                t('footer.modal.tech_support.b3_2'),
                t('footer.modal.tech_support.b3_3')
              ]
            }
          ]
        };
      case 'business':
        return {
          title: t('footer.modal.business.title'),
          content: [
            { heading: t('footer.modal.business.h1'), body: t('footer.modal.business.b1') },
            { heading: t('footer.modal.business.h2'), body: t('footer.modal.business.b2') },
            { heading: t('footer.modal.business.h3'), body: t('footer.modal.business.b3') }
          ]
        };
      case 'bug_report':
        return {
          title: t('footer.modal.bug_report.title'),
          content: [
            { heading: t('footer.modal.bug_report.h1'), body: t('footer.modal.bug_report.b1') },
            { heading: t('footer.modal.bug_report.h2'), body: t('footer.modal.bug_report.b2') },
            { heading: t('footer.modal.bug_report.h3'), body: t('footer.modal.bug_report.b3') }
          ]
        };
      case 'careers':
        return {
          title: t('footer.modal.careers.title'),
          content: [
            { heading: t('footer.modal.careers.h1'), body: t('footer.modal.careers.b1') },
            { heading: t('footer.modal.careers.h2'), body: t('footer.modal.careers.b2') },
            { heading: t('footer.modal.careers.h3'), body: t('footer.modal.careers.b3') }
          ]
        };
      default:
        return null;
    }
  };

  const data = getModalData(item);
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal box */}
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-violet-900/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white pr-4">{data.title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {data.content.map((section, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-violet-400 mb-1">{section.heading}</p>
              {Array.isArray(section.body)
                ? section.body.map((line, j) => (
                    <p key={j} className="text-sm text-gray-400 leading-relaxed">{line}</p>
                  ))
                : <p className="text-sm text-gray-400 leading-relaxed">{section.body}</p>
              }
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('footer.modal.understand')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer Component ──────────────────────────────────────────────
export default function Footer() {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (key) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);

  const privacyLinks = [
    { key: 'personal_data', label: t('footer.links.personal_data') },
    { key: 'account_security', label: t('footer.links.account_security') },
    { key: 'cookie_policy', label: t('footer.links.cookie_policy') },
    { key: 'api_access', label: t('footer.links.api_access') }
  ];

  const termsLinks = [
    { key: 'terms_of_use', label: t('footer.links.terms_of_use') },
    { key: 'liability', label: t('footer.links.liability') },
    { key: 'refund', label: t('footer.links.refund') },
    { key: 'ai_rules', label: t('footer.links.ai_rules') }
  ];

  const contactLinks = [
    { key: 'tech_support', label: t('footer.links.tech_support') },
    { key: 'business', label: t('footer.links.business') },
    { key: 'bug_report', label: t('footer.links.bug_report') },
    { key: 'careers', label: t('footer.links.careers') }
  ];

  return (
    <>
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo + contact */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">AI Backend Builder</span>
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex gap-12 text-sm">
            {/* Chính sách bảo mật */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-white">{t('footer.sections.privacy')}</p>
              {privacyLinks.map((link) => (
                <button key={link.key} onClick={() => openModal(link.key)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left">
                  {link.label}
                </button>
              ))}
            </div>

            {/* Điều khoản dịch vụ */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-white">{t('footer.sections.terms')}</p>
              {termsLinks.map((link) => (
                <button key={link.key} onClick={() => openModal(link.key)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left">
                  {link.label}
                </button>
              ))}
            </div>

            {/* Liên hệ */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-white">{t('footer.sections.contact')}</p>
              {contactLinks.map((link) => (
                <button key={link.key} onClick={() => openModal(link.key)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left">
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company info */}
          <div className="text-xs text-gray-500 text-center md:text-right space-y-0.5">
            <p>© 2026 DMP. All rights reserved.</p>
            <p>{t('footer.company.desc')}</p>
            <p>{t('footer.company.address')}</p>
          </div>

        </div>
      </footer>

      {/* Modal */}
      <PolicyModal item={activeModal} onClose={closeModal} />
    </>
  );
}
