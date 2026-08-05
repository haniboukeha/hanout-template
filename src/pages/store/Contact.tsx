import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import { validateEmail, validateName, validateRequired } from '../../lib/validators';

const Contact = () => {
  const { addToast } = useToastStore();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(form.name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) newErrors.email = emailErr;
    const subErr = validateRequired(form.subject, 'Subject');
    if (subErr) newErrors.subject = subErr;
    const msgErr = validateRequired(form.message, 'Message');
    if (msgErr) newErrors.message = msgErr;
    else if (form.message.length < 10) newErrors.message = 'Message must be at least 10 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({ message: "Message sent! We'll get back to you within 24 hours", type: 'success', title: 'Sent!' });
      setForm({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900">Get in Touch</h1>
        <p className="text-slate-500 mt-3">Have questions? We love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          {[
            { icon: Mail, title: 'Email Us', desc: 'support@hanout.com', sub: 'We reply within 24 hours', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { icon: Phone, title: 'Call Us', desc: '+213 555 12 34 56', sub: 'Sat - Thu, 9AM - 6PM', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { icon: MapPin, title: 'Visit Us', desc: 'Alger Centre, Algiers', sub: '16 Rue Didouche Mourad', color: 'bg-purple-50 text-purple-600 border-purple-100' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-4">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${c.color}`}>
                <c.icon size={20} />
              </div>
              <div>
                <p className="font-black text-slate-900">{c.title}</p>
                <p className="font-bold text-slate-900 mt-1">{c.desc}</p>
                <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
              </div>
            </div>
          ))}

          <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-primary-400" />
              <p className="font-bold">Working Hours</p>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between"><span>Saturday - Thursday</span><span className="font-bold text-white">9AM - 6PM</span></div>
              <div className="flex justify-between"><span>Friday</span><span className="font-bold text-white">Closed</span></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Send a Message</h2>
              <p className="text-xs text-slate-500">We'll get back to you within 24 hours</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={`w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${errors.subject ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                placeholder="How can we help?"
              />
              {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className={`w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none ${errors.message ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                placeholder="Tell us more..."
              />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-xl shadow-slate-900/20"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send size={18} /> Send Message
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 font-medium">
              By submitting, you agree to our Privacy Policy and Terms of Service
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
