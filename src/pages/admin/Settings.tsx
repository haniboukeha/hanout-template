import { Save, Globe, Bell, Shield, Palette } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your storefront preferences and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: 'General', icon: Globe, active: true },
            { label: 'Notifications', icon: Bell },
            { label: 'Security', icon: Shield },
            { label: 'Appearance', icon: Palette },
          ].map((item, i) => (
            <button 
              key={i} 
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                item.active ? 'bg-white text-primary-600 shadow-xl shadow-slate-200/50' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card bg-white p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-8 border-b border-slate-50 pb-4">Store Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Store Name</label>
                  <input type="text" defaultValue="HANOUT Premium Store" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact Email</label>
                  <input type="email" defaultValue="support@hanout.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>USD ($) - US Dollar</option>
                  <option>EUR (€) - Euro</option>
                  <option>GBP (£) - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card bg-white p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-8 border-b border-slate-50 pb-4">Localization</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Timezone</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>(GMT+01:00) Central European Time</option>
                  <option>(GMT-05:00) Eastern Time</option>
                  <option>(GMT+00:00) London</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="btn-secondary px-8 font-bold">Discard Changes</button>
            <button className="btn-primary flex items-center gap-2 px-10">
              <Save size={20} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
