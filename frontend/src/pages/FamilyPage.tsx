import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Phone,
  Trash2,
  CheckCircle2,
  Clock,
  Lock,
  Heart,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FamilyContact } from '../types/user';

export const FamilyPage: React.FC = () => {
  const { familyContacts, addFamilyContact, removeFamilyContact, settings } = useApp();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyContact['relationship']>('Parent');
  const [phone, setPhone] = useState('');
  const [notifyOnHighRisk, setNotifyOnHighRisk] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter family member name.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }

    addFamilyContact({
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      notifyOnHighRisk,
      notifyOnMediumRisk: false,
    });

    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 ${settings.seniorMode ? 'text-lg' : ''}`}>
      {/* Top Hero Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-900/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-xs font-bold text-violet-300 mb-2">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Family Guardian Circle</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Protect Loved Ones Together
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Save trusted-contact details locally and review the alert preference. TRUSTLINE does not send messages to contacts.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-900/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add Family Contact'}</span>
        </button>
      </div>

      {/* Local-only trusted-contact notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-purple-950/40 to-amber-950/50 border border-amber-500/40 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-500/40">
            Local contact setup only
          </span>
          <span className="text-xs font-bold text-white">
            No notification delivery is connected
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Contact details and alert preferences stay in this browser. There is no invitation, SMS, or WhatsApp delivery flow connected to the backend.
        </p>
      </div>

      {/* Add Contact Modal / Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddContact}
          className="p-6 rounded-3xl bg-[#0E132A] border border-violet-500/50 shadow-2xl space-y-4 animate-in fade-in duration-200"
        >
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-violet-400" />
            <span>Add Trusted Relative</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram (Son)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as FamilyContact['relationship'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="Parent">Parent</option>
                <option value="Child">Son / Daughter</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other Relative</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 12345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-violet-900/40 text-white text-sm focus:outline-none focus:border-violet-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-violet-900/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Include in a future alert preview</div>
              <p className="text-[11px] text-slate-400">
                This preference is stored on this device. No alert is sent by TRUSTLINE.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyOnHighRisk}
              onChange={(e) => setNotifyOnHighRisk(e.target.checked)}
              className="w-4 h-4 rounded border-violet-700 bg-[#141A38] text-violet-600 focus:ring-violet-500"
            />
          </div>

          {formError && (
            <div className="text-xs text-rose-300 p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/40">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* List of Contacts */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-400" />
          <span>Trusted Contacts on This Device ({familyContacts.length})</span>
        </h2>

        {familyContacts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#0E132A]/50 border border-violet-900/20 text-center space-y-3">
            <div className="p-3 rounded-full bg-violet-600/10 text-violet-400 w-12 h-12 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white">No Family Contacts Added Yet</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Add a trusted person for your own reference. Contact details stay in this browser; no invitation or alert is sent.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs font-semibold hover:bg-violet-600/50 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add First Contact</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-5 rounded-2xl bg-[#0E132A] border border-violet-900/30 hover:border-violet-600/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 font-bold flex items-center justify-center">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{contact.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-950/60 text-violet-300 border border-violet-900/40">
                          {contact.relationship}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {contact.phone}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFamilyContact(contact.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition cursor-pointer"
                    title="Remove relative"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-3 border-t border-violet-900/20 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Configured for High-Risk Alerts</span>
                  </div>
                  <span className="text-slate-500">
                    Added {new Date(contact.addedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How Trusted Family Alerts Will Work */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0D1E] border border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Family Privacy & Security Architecture</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-[#0E132A] border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-white">No Audio Sharing</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Family members will only receive a high-level safety alert and recommended actions. Raw voice files and transcripts are never sent.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0E132A] border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-white">Explicit User Consent</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Alerts will only trigger if the user explicitly authorizes emergency relay for that particular call.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0E132A] border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-white">Zero Cloud Logs</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Family contact entries are stored locally on your device in encrypted browser storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
