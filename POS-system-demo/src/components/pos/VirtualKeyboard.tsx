import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  DeleteIcon,
  SearchIcon,
  XIcon,
  ArrowUpIcon,
  HashIcon,
  TypeIcon,
  CalculatorIcon
} from 'lucide-react';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

type KeyMode = 'qwerty' | 'symbols' | 'numpad';

export function VirtualKeyboard({
  isOpen,
  onClose,
  value,
  onChange,
  onSearch
}: VirtualKeyboardProps) {
  const [mode, setMode] = useState<KeyMode>('qwerty');
  const [isShiftMode, setIsShiftMode] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);

  const handleKeyPress = (char: string) => {
    const nextChar = isShiftMode || isCapsLock ? char.toUpperCase() : char.toLowerCase();
    onChange(value + nextChar);
    if (isShiftMode && !isCapsLock) {
      setIsShiftMode(false);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleToggleShift = () => {
    if (isCapsLock) {
      setIsCapsLock(false);
      setIsShiftMode(false);
    } else if (isShiftMode) {
      setIsCapsLock(true);
    } else {
      setIsShiftMode(true);
    }
  };

  const qwertyRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '.'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const symbolRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '_', '=', '+', '[', ']', '{', '}', ';', ':'],
    ['\'', '"', ',', '<', '.', '>', '/', '?', '\\', '|']
  ];

  const numpadKeys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', '00']
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay for touch focus on mobile/tablets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] lg:hidden"
          />

          {/* Keyboard Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-slate-700/60 bg-slate-900 shadow-2xl select-none"
          >
            {/* Header & Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2 text-white">
              {/* Left: Mode Switchers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode('qwerty')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    mode === 'qwerty'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  <span>ABC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('symbols')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    mode === 'symbols'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <HashIcon className="h-3.5 w-3.5" />
                  <span>123 / #</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('numpad')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    mode === 'numpad'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CalculatorIcon className="h-3.5 w-3.5" />
                  <span>Numpad</span>
                </button>
              </div>

              {/* Center: Live Text Preview */}
              <div className="mx-4 flex max-w-md flex-1 items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-slate-100 font-mono text-sm">
                <div className="truncate">
                  {value ? (
                    <span>
                      {value}
                      <span className="inline-block w-2 h-4 ml-0.5 bg-brand-400 animate-pulse align-middle" />
                    </span>
                  ) : (
                    <span className="text-slate-500 italic text-xs font-sans">
                      Touch keys to type search term...
                    </span>
                  )}
                </div>
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Clear input"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Right: Actions (Search & Close) */}
              <div className="flex items-center gap-2">
                {onSearch && (
                  <button
                    type="button"
                    onClick={onSearch}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                  >
                    <SearchIcon className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                  title="Hide keyboard"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            {/* Keyboard Layout Section */}
            <div className="p-3 bg-slate-900">
              {mode === 'numpad' ? (
                /* Numeric Keypad Layout */
                <div className="mx-auto flex max-w-sm flex-col gap-2.5">
                  {numpadKeys.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-3 gap-2.5">
                      {row.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onChange(value + key)}
                          className="flex h-14 items-center justify-center rounded-xl bg-slate-800 text-xl font-semibold text-white shadow-md transition-all hover:bg-slate-700 active:scale-95 active:bg-brand-600"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="flex h-14 items-center justify-center rounded-xl bg-slate-800 text-amber-400 shadow-md hover:bg-slate-700 active:scale-95"
                    >
                      <DeleteIcon className="h-6 w-6" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onChange(value + ' ')}
                      className="flex h-14 items-center justify-center rounded-xl bg-slate-800 text-sm font-semibold text-slate-300 shadow-md hover:bg-slate-700 active:scale-95"
                    >
                      Space
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSearch) onSearch();
                      }}
                      className="flex h-14 items-center justify-center rounded-xl bg-brand-500 text-base font-bold text-white shadow-lg hover:bg-brand-400 active:scale-95"
                    >
                      Enter
                    </button>
                  </div>
                </div>
              ) : (
                /* QWERTY or Symbols Layout */
                <div className="mx-auto flex max-w-4xl flex-col gap-2">
                  {(mode === 'qwerty' ? qwertyRows : symbolRows).map((row, rIdx) => {
                    const isLetterRow3 = mode === 'qwerty' && rIdx === 3;

                    return (
                      <div key={rIdx} className="flex justify-center gap-1.5">
                        {/* Shift Button on Row 3 for QWERTY */}
                        {isLetterRow3 && (
                          <button
                            type="button"
                            onClick={handleToggleShift}
                            className={`flex h-12 min-w-[56px] px-3 items-center justify-center gap-1 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95 ${
                              isCapsLock
                                ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-300'
                                : isShiftMode
                                ? 'bg-brand-500 text-white shadow-brand-500/40'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                            title={isCapsLock ? 'Caps Lock Active' : isShiftMode ? 'Shift Active' : 'Toggle Shift'}
                          >
                            <ArrowUpIcon
                              className={`h-4 w-4 ${isCapsLock || isShiftMode ? 'stroke-[3]' : ''}`}
                            />
                            <span className="text-xs uppercase">
                              {isCapsLock ? 'CAPS' : 'SHIFT'}
                            </span>
                          </button>
                        )}

                        {row.map((key) => {
                          const displayChar =
                            mode === 'qwerty' && (isShiftMode || isCapsLock)
                              ? key.toUpperCase()
                              : key;

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleKeyPress(key)}
                              className="flex h-12 flex-1 max-w-[70px] min-w-[36px] items-center justify-center rounded-xl bg-slate-800 text-lg font-medium text-white shadow-sm transition-all hover:bg-slate-700 active:scale-95 active:bg-brand-600 active:text-white"
                            >
                              {displayChar}
                            </button>
                          );
                        })}

                        {/* Backspace Button on Row 3 for QWERTY */}
                        {isLetterRow3 && (
                          <button
                            type="button"
                            onClick={handleBackspace}
                            className="flex h-12 min-w-[56px] px-3 items-center justify-center rounded-xl bg-slate-800 text-amber-400 shadow-md transition-all hover:bg-slate-700 hover:text-amber-300 active:scale-95"
                            title="Backspace"
                          >
                            <DeleteIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Bottom Controls Row for QWERTY & Symbols */}
                  <div className="mt-1 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'qwerty' ? 'symbols' : 'qwerty')}
                      className="flex h-12 min-w-[70px] items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-slate-300 shadow-md transition-all hover:bg-slate-700 active:scale-95"
                    >
                      {mode === 'qwerty' ? '?123' : 'ABC'}
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex h-12 min-w-[70px] items-center justify-center rounded-xl bg-slate-800 text-xs font-semibold text-rose-400 shadow-md transition-all hover:bg-slate-700 hover:text-rose-300 active:scale-95"
                    >
                      Clear
                    </button>

                    {/* Spacebar */}
                    <button
                      type="button"
                      onClick={() => onChange(value + ' ')}
                      className="flex h-12 flex-1 max-w-md items-center justify-center rounded-xl bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-300 shadow-md transition-all hover:bg-slate-700 active:scale-95 active:bg-slate-600"
                    >
                      Space
                    </button>

                    {mode === 'symbols' && (
                      <button
                        type="button"
                        onClick={handleBackspace}
                        className="flex h-12 min-w-[64px] items-center justify-center rounded-xl bg-slate-800 text-amber-400 shadow-md transition-all hover:bg-slate-700 active:scale-95"
                        title="Backspace"
                      >
                        <DeleteIcon className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (onSearch) onSearch();
                      }}
                      className="flex h-12 min-w-[100px] items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-xs font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-400 active:scale-95"
                    >
                      <SearchIcon className="h-4 w-4" />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
