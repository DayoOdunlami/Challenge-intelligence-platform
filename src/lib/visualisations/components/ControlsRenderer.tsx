'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ControlDefinition, ControlState, Domain } from '../types';

interface ControlsRendererProps {
  controls: ControlDefinition[];
  state: ControlState;
  onChange: (controlId: string, value: any) => void;
  activeDomain: Domain | 'all';
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  className?: string;
}

// Group controls by their 'group' property
function groupControls(controls: ControlDefinition[]) {
  const groups: Record<string, ControlDefinition[]> = {
    data: [],
    layout: [],
    display: [],
    filters: [],
    advanced: [],
  };
  
  controls.forEach((control) => {
    const group = control.advanced ? 'advanced' : control.group;
    if (!groups[group]) groups[group] = [];
    groups[group].push(control);
  });
  
  return groups;
}

const GROUP_LABELS: Record<string, string> = {
  data: 'Data Source',
  layout: 'Layout',
  display: 'Display',
  filters: 'Filters',
  advanced: 'Advanced',
};

export function ControlsRenderer({
  controls,
  state,
  onChange,
  activeDomain,
  showAdvanced = false,
  onToggleAdvanced,
  className = '',
}: ControlsRendererProps) {
  // Filter controls by domain
  const filteredControls = useMemo(() => {
    return controls.filter((c) => {
      if (!c.domains) return true;
      if (activeDomain === 'all') return true;
      return c.domains.includes(activeDomain);
    });
  }, [controls, activeDomain]);

  // Group controls
  const grouped = useMemo(() => groupControls(filteredControls), [filteredControls]);

  // Render individual control based on type
  const renderControl = (control: ControlDefinition) => {
    const value = state[control.id] ?? control.defaultValue;

    return (
      <div key={control.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            {control.label}
            {control.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{control.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
        </div>

        {/* Toggle */}
        {control.type === 'toggle' && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(control.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#006E51]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006E51]"></div>
            <span className="ml-3 text-sm text-gray-700">{value ? 'On' : 'Off'}</span>
          </label>
        )}

        {/* Slider */}
        {control.type === 'slider' && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={control.min ?? 0}
              max={control.max ?? 100}
              step={control.step ?? 1}
              value={value}
              onChange={(e) => onChange(control.id, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #006E51 0%, #006E51 ${((value - (control.min ?? 0)) / ((control.max ?? 100) - (control.min ?? 0))) * 100}%, #e5e7eb ${((value - (control.min ?? 0)) / ((control.max ?? 100) - (control.min ?? 0))) * 100}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-xs text-gray-500 w-12 text-right">{value}</span>
          </div>
        )}

        {/* Range Slider */}
        {control.type === 'range' && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={control.min ?? 0}
                max={control.max ?? 100}
                step={control.step ?? 1}
                value={Array.isArray(value) ? value[0] : value}
                onChange={(e) => {
                  const newMin = parseFloat(e.target.value);
                  const currentMax = Array.isArray(value) ? value[1] : (control.max ?? 100);
                  onChange(control.id, [newMin, Math.max(newMin, currentMax)]);
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={control.min ?? 0}
                max={control.max ?? 100}
                step={control.step ?? 1}
                value={Array.isArray(value) ? value[1] : value}
                onChange={(e) => {
                  const newMax = parseFloat(e.target.value);
                  const currentMin = Array.isArray(value) ? value[0] : (control.min ?? 0);
                  onChange(control.id, [Math.min(newMax, currentMin), newMax]);
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Array.isArray(value) ? value[0] : value}</span>
              <span>{Array.isArray(value) ? value[1] : value}</span>
            </div>
          </div>
        )}

        {/* Select */}
        {control.type === 'select' && (
          <Select value={String(value)} onValueChange={(v) => onChange(control.id, v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {control.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Segmented Control */}
        {control.type === 'segmented' && (
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {control.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange(control.id, opt.value)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  value === opt.value
                    ? 'bg-[#006E51] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Multiselect (simplified - could use a proper multiselect component) */}
        {control.type === 'multiselect' && (
          <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {control.options && control.options.length > 0 ? (
              control.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(opt.value)}
                    onChange={(e) => {
                      const current = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onChange(control.id, [...current, opt.value]);
                      } else {
                        onChange(control.id, current.filter((v) => v !== opt.value));
                      }
                    }}
                    className="rounded border-gray-300 text-[#006E51] focus:ring-[#006E51]"
                  />
                  {opt.label}
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No options available</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(grouped).map(([groupKey, groupControls]) => {
        if (groupControls.length === 0) return null;
        if (groupKey === 'advanced' && !showAdvanced) return null;

        return (
          <div key={groupKey}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {GROUP_LABELS[groupKey] || groupKey}
            </h4>
            <div className="space-y-4">
              {groupControls.map(renderControl)}
            </div>
          </div>
        );
      })}

      {/* Advanced Toggle */}
      {grouped.advanced.length > 0 && onToggleAdvanced && (
        <button
          onClick={onToggleAdvanced}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
      )}
    </div>
  );
}

