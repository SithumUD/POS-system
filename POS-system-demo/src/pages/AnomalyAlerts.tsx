import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ShieldAlertIcon,
  SearchCheckIcon,
  CheckCircle2Icon,
  XCircleIcon,
  RadarIcon,
  ClockIcon,
  MessageSquarePlusIcon,
  XIcon,
  RotateCcwIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Segmented } from '../components/ui/Toolbar';
import { SlideOver } from '../components/ui/Modal';
import { Field, Textarea } from '../components/ui/Field';
import { useStore } from '../contexts/StoreContext';
import { formatShortDateTime, relativeTime } from '../utils/time';
import { AlertStatus, Severity } from '../types';

const severityTones: Record<Severity, 'red' | 'amber' | 'slate'> = {
  HIGH: 'red',
  MEDIUM: 'amber',
  LOW: 'slate'
};

const statusTones: Record<AlertStatus, 'blue' | 'purple' | 'green' | 'gray'> = {
  NEW: 'blue',
  INVESTIGATING: 'purple',
  REVIEWED: 'green',
  DISMISSED: 'gray'
};

const severities: Severity[] = ['HIGH', 'MEDIUM', 'LOW'];
const statuses: AlertStatus[] = ['NEW', 'INVESTIGATING', 'REVIEWED', 'DISMISSED'];

function getBranchLabel(branch: any): string {
  if (!branch) return '';
  if (typeof branch === 'string') return branch;
  return branch.name || branch.slug || '';
}

function getAuthorLabel(author: any): string {
  if (!author) return '';
  if (typeof author === 'string') return author;
  return author.name || '';
}

export function AnomalyAlerts() {
  const { alerts, setAlertStatus, addAlertNote, runAnomalyScan, settings, updateSettings } =
    useStore();
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const rows = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          (severity === 'All' || alert.severity === severity) &&
          (status === 'All' || alert.status === status)
      ),
    [alerts, severity, status]
  );

  const selected = alerts.find((alert) => alert.id === openId) ?? null;

  const severityTabs = [
    { label: 'All', count: alerts.length },
    ...severities.map((level) => ({
      label: level,
      count: alerts.filter((a) => a.severity === level).length
    }))
  ];

  const statusTabs = [
    { label: 'All', count: alerts.length },
    ...statuses.map((state) => ({
      label: state,
      count: alerts.filter((a) => a.status === state).length
    }))
  ];

  function move(id: string, next: AlertStatus, message: string) {
    setAlertStatus(id, next);
    toast.success(message);
  }

  function handleScan() {
    runAnomalyScan();
    toast.success('Anomaly scan complete', {
      description: 'Rules re-run against the live sales and stock ledger.'
    });
  }

  const openCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'INVESTIGATING').length;

  return (
    <AppShell
      title="Anomaly Alerts"
      actions={
        <>
          <select
            value={settings.alertSensitivity}
            onChange={(e) => {
              updateSettings({ alertSensitivity: e.target.value as typeof settings.alertSensitivity });
              toast.info(`Detection sensitivity set to ${e.target.value}`);
            }}
            aria-label="Detection sensitivity"
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="LOW">Sensitivity: Low</option>
            <option value="BALANCED">Sensitivity: Balanced</option>
            <option value="HIGH">Sensitivity: High</option>
          </select>
          <Button variant="primary" onClick={handleScan}>
            <RadarIcon className="h-4 w-4" aria-hidden="true" />
            Run scan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Open alerts', value: openCount, tone: 'text-brand-600 bg-brand-50', icon: ShieldAlertIcon },
            {
              label: 'High severity',
              value: alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'DISMISSED').length,
              tone: 'text-red-600 bg-red-50',
              icon: ShieldAlertIcon
            },
            {
              label: 'Investigating',
              value: alerts.filter((a) => a.status === 'INVESTIGATING').length,
              tone: 'text-purple-600 bg-purple-50',
              icon: SearchCheckIcon
            },
            {
              label: 'Resolved',
              value: alerts.filter((a) => a.status === 'REVIEWED' || a.status === 'DISMISSED').length,
              tone: 'text-emerald-600 bg-emerald-50',
              icon: CheckCircle2Icon
            }
          ].map((stat) => (
            <Card key={stat.label} className="flex items-center gap-3 p-4">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="font-mono text-lg font-semibold tabular text-slate-900">
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={severityTabs} value={severity} onChange={setSeverity} />
          <Segmented options={statusTabs} value={status} onChange={setStatus} className="ml-auto" />
        </div>

        {rows.length === 0 ? (
          <Card className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-900">Nothing flagged here</p>
            <p className="mt-1 text-sm text-slate-500">
              Adjust the filters or run a fresh scan against today&apos;s activity.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {rows.map((alert) => {
              const bLabel = getBranchLabel(alert.branch);
              const windowTxt = alert.windowDescription || alert.window || '';
              const metricTxt = alert.metricDescription || alert.metric || '';
              const timeTxt = alert.createdAt || alert.at || '';
              const alertNotes = (alert as any).notes || (alert as any).investigationNotes || [];

              return (
                <li key={alert.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-start gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          alert.severity === 'HIGH'
                            ? 'bg-red-50 text-red-600'
                            : alert.severity === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ShieldAlertIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-semibold text-slate-900">{alert.title}</h2>
                          <Badge tone={severityTones[alert.severity]} dot>
                            {alert.severity}
                          </Badge>
                          <Badge tone={statusTones[alert.status]}>{alert.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {alert.explanation}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>{bLabel}</span>
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" aria-hidden="true" />
                            {windowTxt}
                          </span>
                          <span className="font-mono tabular">{metricTxt}</span>
                          <span>{relativeTime(timeTxt)}</span>
                          {alertNotes.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <MessageSquarePlusIcon className="h-3 w-3" aria-hidden="true" />
                              {alertNotes.length} note{alertNotes.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {alert.status === 'NEW' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => move(alert.id, 'INVESTIGATING', 'Marked as investigating')}
                          >
                            <SearchCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Investigate
                          </Button>
                        )}
                        {alert.status !== 'REVIEWED' && alert.status !== 'DISMISSED' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => move(alert.id, 'REVIEWED', 'Alert marked reviewed')}
                          >
                            <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            Mark reviewed
                          </Button>
                        )}
                        {alert.status === 'DISMISSED' || alert.status === 'REVIEWED' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => move(alert.id, 'NEW', 'Alert reopened')}
                          >
                            <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Reopen
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => move(alert.id, 'DISMISSED', 'Alert dismissed')}
                          >
                            <XCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Dismiss
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setOpenId(alert.id);
                            setNote('');
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setOpenId(null)}
        label="Alert detail"
        width="max-w-lg"
      >
        {selected && (
          <div className="flex h-full flex-col">
            <div className="flex items-start gap-3 border-b border-slate-200 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={severityTones[selected.severity]} dot>
                    {selected.severity}
                  </Badge>
                  <Badge tone={statusTones[selected.status]}>{selected.status}</Badge>
                </div>
                <h2 className="mt-2 text-base font-semibold text-slate-900">{selected.title}</h2>
                <p className="text-sm text-slate-500">
                  {getBranchLabel(selected.branch)} · {selected.windowDescription || selected.window}
                </p>
              </div>
              <button
                onClick={() => setOpenId(null)}
                aria-label="Close alert detail"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5 thin-scroll">
              <p className="text-sm leading-relaxed text-slate-700">{selected.explanation}</p>

              <dl className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-sm ring-1 ring-inset ring-slate-100">
                <div>
                  <dt className="text-xs text-slate-500">Signal</dt>
                  <dd className="font-mono tabular text-slate-900">{selected.metricDescription || selected.metric}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Related to</dt>
                  <dd className="text-slate-900">{selected.relatedEntityLabel || selected.related}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Detected</dt>
                  <dd className="text-slate-900">{formatShortDateTime(selected.createdAt || selected.at || '')}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Branch</dt>
                  <dd className="text-slate-900">{getBranchLabel(selected.branch)}</dd>
                </div>
              </dl>

              <div>
                {(() => {
                  const selNotes = (selected as any).notes || (selected as any).investigationNotes || [];
                  return (
                    <>
                      <CardHeader
                        title="Investigation log"
                        subtitle={`${selNotes.length} entr${selNotes.length === 1 ? 'y' : 'ies'}`}
                        className="mb-2"
                      />

                      {selNotes.length === 0 ? (
                        <p className="text-sm text-slate-500">No notes recorded yet.</p>
                      ) : (
                        <ol className="space-y-3">
                          {selNotes.map((entry: any, index: number) => {
                            const text = typeof entry === 'string' ? entry : entry.text || '';
                            const author = typeof entry === 'string' ? '' : getAuthorLabel(entry.author);
                            const at = typeof entry === 'string' ? '' : formatShortDateTime(entry.createdAt || entry.at || '');
                            const key = typeof entry === 'string' ? `note-${index}` : entry.id || `note-${index}`;

                            return (
                              <li key={key} className="rounded-lg border border-slate-200 p-3">
                                <p className="text-sm text-slate-800">{text}</p>
                                {(author || at) && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {author ? `${author} ` : ''}{at ? `· ${at}` : ''}
                                  </p>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </>
                  );
                })()}
              </div>

              <Field label="Add a note">
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reviewed the CCTV for this window and spoke to the cashier…"
                />
              </Field>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!note.trim()) return;
                  addAlertNote(selected.id, note.trim());
                  setNote('');
                  toast.success('Note added to investigation log');
                }}
              >
                <MessageSquarePlusIcon className="h-4 w-4" aria-hidden="true" />
                Save note
              </Button>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-200 p-4">
              <Button
                variant="secondary"
                onClick={() => move(selected.id, 'DISMISSED', 'Alert dismissed')}
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                className="ml-auto"
                onClick={() => {
                  move(selected.id, 'REVIEWED', 'Alert marked reviewed');
                  setOpenId(null);
                }}
              >
                <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
                Resolve alert
              </Button>
            </div>
          </div>
        )}
      </SlideOver>
    </AppShell>
  );
}