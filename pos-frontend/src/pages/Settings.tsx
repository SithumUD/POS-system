import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Building2Icon,
  ReceiptTextIcon,
  ScanBarcodeIcon,
  UsersIcon,
  ShieldAlertIcon,
  SaveIcon,
  SmartphoneIcon,
  PrinterIcon,
  WifiIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Field';
import { Toggle } from '../components/ui/Toggle';
import { UsersSection } from '../components/settings/UsersSection';
import { useStore } from '../contexts/StoreContext';
import { formatCurrency } from '../utils/currency';
import { StoreSettings, AlertSensitivity } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

const sections = [
  { key: 'general', label: 'General', icon: Building2Icon },
  { key: 'tax', label: 'Tax & Receipts', icon: ReceiptTextIcon },
  { key: 'pos', label: 'POS & Discounts', icon: ScanBarcodeIcon },
  { key: 'devices', label: 'Devices & Peripherals', icon: SmartphoneIcon },
  { key: 'users', label: 'Users & Roles', icon: UsersIcon },
  { key: 'security', label: 'Alerts & Security', icon: ShieldAlertIcon }
];

export function Settings() {
  const { settings, updateSettings, branches, products, branch } = useStore();
  const [section, setSection] = useState('general');
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [testBarcode, setTestBarcode] = useState('');
  
  const { connected: mobileConnected, simulateScan } = useWebSocket(branch, () => {});

  useEffect(() => {
    setDraft(settings);
  }, [settings, section]);

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function save(label: string) {
    updateSettings(draft);
    toast.success(`${label} saved`, { description: 'Applied across the POS and reports.' });
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <AppShell title="Settings">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Settings sections">
          <ul className="space-y-1">
            {sections.map((item) => {
              const active = item.key === section;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => setSection(item.key)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? 'bg-brand-50 font-medium text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${active ? 'text-brand-600' : 'text-slate-400'}`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">
          {section === 'general' && (
            <Card className="p-5">
              <CardHeader
                title="Store details"
                subtitle="Shown on receipts, exports and the sign-in screen."
                className="mb-4"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Store name">
                  <Input value={draft.storeName} onChange={(e) => set('storeName', e.target.value)} />
                </Field>
                <Field label="Registered business name">
                  <Input value={draft.legalName} onChange={(e) => set('legalName', e.target.value)} />
                </Field>
                <Field label="Currency">
                  <Select value={draft.currency} onChange={(e) => set('currency', e.target.value)}>
                    <option value="LKR">LKR — Sri Lankan Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </Select>
                </Field>
                <Field label="Timezone">
                  <Select value={draft.timezone} onChange={(e) => set('timezone', e.target.value)}>
                    <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                    <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  </Select>
                </Field>
              </div>

              <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-500">Branches</dt>
                  <dd className="font-mono text-lg font-semibold tabular text-slate-900">
                    {branches.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Active products</dt>
                  <dd className="font-mono text-lg font-semibold tabular text-slate-900">
                    {products.filter((p) => p.active).length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Catalogue value</dt>
                  <dd className="font-mono text-lg font-semibold tabular text-slate-900">
                    {formatCurrency(
                      products.reduce(
                        (sum, p) =>
                          sum +
                          Object.values(p.stock || {}).reduce((n, qty) => n + qty, 0) * (p.costPrice ?? p.cost ?? 0),
                        0
                      )
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex justify-end">
                <Button variant="primary" disabled={!dirty} onClick={() => save('Store details')}>
                  <SaveIcon className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </Button>
              </div>
            </Card>
          )}

          {section === 'tax' && (
            <Card className="p-5">
              <CardHeader
                title="Tax & receipts"
                subtitle="Tax applies to every new sale rung through the POS."
                className="mb-4"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tax label">
                  <Input value={draft.taxLabel} onChange={(e) => set('taxLabel', e.target.value)} />
                </Field>
                <Field label="Tax rate (%)" hint="Applied after discounts.">
                  <Input
                    type="number"
                    min={0}
                    max={40}
                    value={draft.taxRate}
                    onChange={(e) => set('taxRate', Number(e.target.value) || 0)}
                    className="font-mono tabular"
                  />
                </Field>
                <Field label="Cash rounding" hint="Round cash totals to the nearest unit.">
                  <Select
                    value={String(draft.roundCashTo)}
                    onChange={(e) => set('roundCashTo', Number(e.target.value))}
                  >
                    <option value="1">Rs. 1</option>
                    <option value="5">Rs. 5</option>
                    <option value="10">Rs. 10</option>
                  </Select>
                </Field>
                <Field label="Receipt footer" className="sm:col-span-2">
                  <Textarea
                    rows={2}
                    value={draft.receiptFooter}
                    onChange={(e) => set('receiptFooter', e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                <Toggle
                  checked={draft.autoPrintReceipt}
                  onChange={(value) => set('autoPrintReceipt', value)}
                  label="Print receipt automatically"
                  description="Send the receipt to the terminal printer as soon as payment completes."
                />
              </div>

              <div className="mt-5 flex justify-end">
                <Button variant="primary" disabled={!dirty} onClick={() => save('Tax & receipts')}>
                  <SaveIcon className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </Button>
              </div>
            </Card>
          )}

          {section === 'pos' && (
            <Card className="p-5">
              <CardHeader
                title="POS & discounts"
                subtitle="Guardrails for what cashiers can do at the terminal."
                className="mb-4"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Maximum discount without approval (%)"
                  hint="Anomaly monitoring watches sales just under this limit."
                >
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.maxDiscountPercent}
                    onChange={(e) => set('maxDiscountPercent', Number(e.target.value) || 0)}
                    className="font-mono tabular"
                  />
                </Field>
                <Field label="Default low-stock threshold" hint="Used for new products.">
                  <Input
                    type="number"
                    min={0}
                    value={draft.lowStockThreshold}
                    onChange={(e) => set('lowStockThreshold', Number(e.target.value) || 0)}
                    className="font-mono tabular"
                  />
                </Field>
              </div>

              <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                <Toggle
                  checked={draft.requireManagerApproval}
                  onChange={(value) => set('requireManagerApproval', value)}
                  label="Require manager approval for large discounts"
                  description={`Prompts for a manager PIN above ${draft.maxDiscountPercent}%.`}
                />

                <Toggle
                  checked={draft.allowNegativeStock}
                  onChange={(value) => set('allowNegativeStock', value)}
                  label="Allow selling below zero stock"
                  description="Off means the terminal blocks sales once on-hand hits zero."
                />
              </div>

              <div className="mt-5 flex justify-end">
                <Button variant="primary" disabled={!dirty} onClick={() => save('POS settings')}>
                  <SaveIcon className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </Button>
              </div>
            </Card>
          )}

          {section === 'users' && <UsersSection />}

          {section === 'security' && (
            <Card className="p-5">
              <CardHeader
                title="Alerts & security"
                subtitle="Controls how aggressively anomalies are flagged."
                className="mb-4"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Detection sensitivity"
                  hint="Higher sensitivity surfaces more, smaller anomalies."
                >
                  <Select
                    value={draft.alertSensitivity}
                    onChange={(e) =>
                      set('alertSensitivity', e.target.value as AlertSensitivity)
                    }
                  >
                    <option value="LOW">LOW</option>
                    <option value="BALANCED">BALANCED</option>
                    <option value="HIGH">HIGH</option>
                  </Select>
                </Field>
                <Field label="Session timeout (minutes)">
                  <Input
                    type="number"
                    min={5}
                    max={240}
                    value={draft.sessionTimeoutMinutes}
                    onChange={(e) => set('sessionTimeoutMinutes', Number(e.target.value) || 5)}
                    className="font-mono tabular"
                  />
                </Field>
              </div>

              <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                <Toggle
                  checked={draft.emailAlerts}
                  onChange={(value) => set('emailAlerts', value)}
                  label="Email high-severity alerts"
                  description="Sends admins a summary the moment a high-severity anomaly is detected."
                />

                <Toggle
                  checked={draft.twoFactorEnabled ?? draft.twoFactor ?? false}
                  onChange={(value) => {
                    set('twoFactorEnabled' as any, value);
                    set('twoFactor' as any, value);
                  }}
                  label="Require two-factor authentication"
                  description="Applies to admin and manager accounts on new devices."
                />
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  variant="primary"
                  disabled={!dirty}
                  onClick={() => save('Alert & security settings')}
                >
                  <SaveIcon className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </Button>
              </div>
            </Card>
          )}

          {section === 'devices' && (
            <Card className="p-5">
              <CardHeader
                title="Devices & Peripherals"
                subtitle="Manage Bluetooth scanners, mobile apps, and receipt printers."
                className="mb-4"
              />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={`flex flex-col gap-3 rounded-xl border p-4 ${mobileConnected ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${mobileConnected ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
                      <SmartphoneIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Mobile Scanner App</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${mobileConnected ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <p className="text-xs text-slate-600">{mobileConnected ? 'Connected via WebSocket' : 'Disconnected'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 rounded bg-slate-100 p-2 text-[10px] text-slate-500 font-mono flex items-center justify-between overflow-hidden">
                    <span className="truncate" title={branch ?? ''}>Terminal ID: {branch}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(branch ?? '');
                        toast.success('Terminal ID copied');
                      }}
                      className="ml-2 shrink-0 text-brand-600 hover:text-brand-700 font-semibold uppercase tracking-wider"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className={`flex flex-col gap-3 rounded-xl border p-4 ${mobileConnected ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${mobileConnected ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
                      <PrinterIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Bluetooth Receipt Printer</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${mobileConnected ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <p className="text-xs text-slate-600">{mobileConnected ? 'Ready via Mobile App' : 'Waiting for app connection'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="mb-3 text-sm font-medium text-slate-900">Developer Testing</h4>
                <p className="mb-4 text-xs text-slate-500">
                  Use this to test the WebSocket integration before building the React Native app. 
                  Sends a mock scan payload to the backend broker. 
                  Make sure you have a valid product barcode.
                </p>
                <div className="flex max-w-sm gap-2">
                  <Input 
                    placeholder="Enter a product barcode (e.g. 479...)" 
                    value={testBarcode}
                    onChange={(e) => setTestBarcode(e.target.value)}
                  />
                  <Button 
                    variant="primary" 
                    disabled={!mobileConnected || !testBarcode.trim()}
                    onClick={() => {
                      simulateScan(testBarcode.trim());
                      setTestBarcode('');
                      toast.success('Test payload sent to STOMP broker');
                    }}
                  >
                    Simulate
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}