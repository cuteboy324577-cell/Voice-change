import React, { useState } from 'react';
import { ShieldCheck, Check, AlertCircle, X, FileText, Lock } from 'lucide-react';
import { api } from '../services/api';

interface ConsentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentVerified: () => void;
}

export const ConsentVerificationModal: React.FC<ConsentVerificationModalProps> = ({
  isOpen,
  onClose,
  onConsentVerified,
}) => {
  const [speakerName, setSpeakerName] = useState('');
  const [idDocRef, setIdDocRef] = useState('');
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!speakerName.trim()) {
      setError('Please provide the original speaker or creator full name.');
      return;
    }
    if (!agree1 || !agree2 || !agree3) {
      setError('You must confirm all three legal declarations.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.verifyConsent(speakerName, true);
      if (res.success) {
        onConsentVerified();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Speaker Voice Cloning Consent
              </h3>
              <p className="text-xs text-slate-500">Legal Authorization Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          To prevent unauthorized deepfakes and intellectual property misuse, voice timbre cloning requires verifiable authorization from the original voice owner or creator.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Speaker / Content Creator Full Name
            </label>
            <input
              type="text"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              placeholder="e.g. Marcus Vance / Content Owner"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Document / Channel Authorization Ref (Optional)
            </label>
            <input
              type="text"
              value={idDocRef}
              onChange={(e) => setIdDocRef(e.target.value)}
              placeholder="e.g. YouTube Channel ID or Signed Consent Reference"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Legal Checklist */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agree1}
                onChange={(e) => setAgree1(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5"
              />
              <span>I confirm I am the speaker or hold authorized permission to duplicate their vocal profile into Tamil.</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agree2}
                onChange={(e) => setAgree2(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5"
              />
              <span>The cloned Tamil audio will strictly be used for the authorized video dubbing and legitimate translation.</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agree3}
                onChange={(e) => setAgree3(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5"
              />
              <span>I agree to cryptographically log this consent in TamilDub AI audit records.</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirm & Sign Consent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
