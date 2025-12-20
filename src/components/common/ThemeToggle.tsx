import { useTheme } from '@/hooks';
import type { ThemeMode } from '@/types';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  className = '',
}) => {
  const { mode, setMode, toggle, isDark } = useTheme();

  const modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">Theme:</span>
      )}

      {/* Simple toggle button */}
      <button
        onClick={toggle}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Mode selector dropdown */}
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as ThemeMode)}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {modes.map((m) => (
          <option key={m.value} value={m.value}>
            {m.icon} {m.label}
          </option>
        ))}
      </select>
    </div>
  );
};
