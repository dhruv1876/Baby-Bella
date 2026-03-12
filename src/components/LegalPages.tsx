import React from 'react';
import { motion } from 'motion/react';
import { X, Mail, Phone, MapPin } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'refund' | 'contact' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      body: (
        <div className="space-y-4 text-sm text-zinc-400">
          <p>Last updated: March 12, 2026</p>
          <p>We value your privacy. This policy explains how we handle your information when you use our service.</p>
          <h3 className="text-white font-bold">1. Information We Collect</h3>
          <p>We collect your mobile number and payment details solely for the purpose of processing your subscription and providing access to the private Telegram group.</p>
          <h3 className="text-white font-bold">2. How We Use Information</h3>
          <p>Your data is used to verify payments and send access links. We do not sell or share your personal data with third parties for marketing purposes.</p>
          <h3 className="text-white font-bold">3. Data Security</h3>
          <p>All payments are processed through Razorpay, a secure and PCI-compliant payment gateway. We do not store your credit card or UPI details on our servers.</p>
        </div>
      )
    },
    terms: {
      title: 'Terms & Conditions',
      body: (
        <div className="space-y-4 text-sm text-zinc-400">
          <p>By subscribing to Baby Bella Private Group, you agree to the following terms:</p>
          <h3 className="text-white font-bold">1. Membership Access</h3>
          <p>Access is granted for the duration specified in your plan. Sharing access links or group content with non-members is strictly prohibited.</p>
          <h3 className="text-white font-bold">2. User Conduct</h3>
          <p>Members must maintain decorum within the group. Any form of harassment, spam, or illegal activity will result in immediate removal without refund.</p>
          <h3 className="text-white font-bold">3. Service Availability</h3>
          <p>While we strive for 100% uptime, we are not responsible for technical issues arising from Telegram's platform.</p>
        </div>
      )
    },
    refund: {
      title: 'Refund & Cancellation',
      body: (
        <div className="space-y-4 text-sm text-zinc-400">
          <h3 className="text-white font-bold">1. Digital Products Policy</h3>
          <p>Since our service provides immediate access to digital content (Private Telegram Group), we generally do not offer refunds once access has been granted.</p>
          <h3 className="text-white font-bold">2. Exceptional Cases</h3>
          <p>If you have been charged twice or face technical issues preventing access, please contact us within 24 hours for a resolution.</p>
          <h3 className="text-white font-bold">3. Cancellation</h3>
          <p>You can choose not to renew your subscription at any time. Your access will continue until the end of the current billing cycle.</p>
        </div>
      )
    },
    contact: {
      title: 'Contact Us',
      body: (
        <div className="space-y-6 text-sm text-zinc-400">
          <p>Have questions? We're here to help.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">Email Support</p>
                <p>support@babybella.in</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">WhatsApp Support</p>
                <p>+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">Office Address</p>
                <p>Futurehometech Solutions, Mumbai, India</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const activeContent = content[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="mb-6 text-2xl font-bold text-white">{activeContent.title}</h2>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {activeContent.body}
        </div>
        
        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-zinc-800 py-3 font-bold text-white hover:bg-zinc-700 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};
