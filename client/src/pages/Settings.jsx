import { Settings as SettingsIcon, Wrench } from 'lucide-react';

const Settings = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Dynamic Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white pt-10 pb-24 px-4 md:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-200 mb-6 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <SettingsIcon className="w-4 h-4" /> System Configuration
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-sm">Global Settings</h1>
              <p className="text-indigo-200 font-medium flex items-center gap-2">
                Hospital configurations and API integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-14">
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Wrench className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Configuration Hub (Coming Soon)</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              This advanced section will allow you to configure WhatsApp Cloud API credentials, manage staff roles across departments, and define custom AI escalation delays.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;