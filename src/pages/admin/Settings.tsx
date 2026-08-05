import { useState } from 'react';
import { Save, Globe, Bell, Shield, Palette, DollarSign, Truck, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';

const Settings = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    addToast({ message: 'Settings saved successfully', type: 'success', title: 'Saved' });
  };

  const handleChange = (key: string, value: string | number | boolean) => {
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure store preferences and system settings</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-8 py-3 self-start">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all text-left ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-white hover:text-slate-700'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Maintenance Mode</p>
              <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">When enabled, customers will see a maintenance page</p>
              <label className="mt-3 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={localSettings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} className="rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                <span className="text-xs font-bold text-amber-800">Enable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'general' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-6">
                  <Globe size={18} className="text-primary-600" /> Store Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Store Name</label>
                    <input type="text" value={localSettings.storeName} onChange={(e) => handleChange('storeName', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Contact Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={localSettings.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Contact Phone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={localSettings.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Currency</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={localSettings.currency} onChange={(e) => handleChange('currency', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white">
                        <option value="DZD">DZD (DA) - Algerian Dinar</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-6">
                  <MapPin size={18} className="text-primary-600" /> Localization
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Timezone</label>
                    <select value={localSettings.timezone} onChange={(e) => handleChange('timezone', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white">
                      <option value="Africa/Algiers">Africa/Algiers (GMT+1)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Logo URL</label>
                    <input type="text" value={localSettings.logoUrl || ''} onChange={(e) => handleChange('logoUrl', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" placeholder="/logo.png" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-6">
                <Truck size={18} className="text-primary-600" /> Shipping Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Free Shipping Threshold (DA)</label>
                  <input type="number" value={localSettings.freeShippingThreshold} onChange={(e) => handleChange('freeShippingThreshold', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
                  <p className="text-[11px] text-slate-400 mt-2">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Default Desk Price (DA)</label>
                  <input type="number" value={localSettings.defaultDeskPrice} onChange={(e) => handleChange('defaultDeskPrice', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Default Home Price (DA)</label>
                  <input type="number" value={localSettings.defaultHomePrice} onChange={(e) => handleChange('defaultHomePrice', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs font-bold text-slate-700">Shipping Logic</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Based on wilaya: Algiers (local) cheaper, far south wilayas more expensive. Free shipping threshold automatically applied.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-6">
                <Bell size={18} className="text-primary-600" /> Notification Preferences
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'notificationsEmail', label: 'Email Notifications', desc: 'Receive order updates via email' },
                  { key: 'notificationsPush', label: 'Push Notifications', desc: 'Browser push notifications for new orders' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={localSettings[item.key as keyof typeof localSettings] as boolean} onChange={(e) => handleChange(item.key, e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'appearance') && (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <Shield size={32} className="mx-auto text-slate-300 mb-4" />
              <h3 className="font-black text-slate-900">Coming Soon</h3>
              <p className="text-sm text-slate-500 mt-2">This section is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
