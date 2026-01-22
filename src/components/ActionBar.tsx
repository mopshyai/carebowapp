import { useState } from 'react';
import { Share2, Clock } from 'lucide-react';
import {
  TriageLevel,
  getCTAConfig,
  getTertiaryAction
} from '../utils/triageCTAMapping';
import { ComingSoonSheet } from './ComingSoonSheet';

interface ActionBarProps {
  triageLevel: TriageLevel;
  onAction?: (action: string) => void;
}

export function ActionBar({ triageLevel, onAction }: ActionBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAction, setSheetAction] = useState('');

  const config = getCTAConfig(triageLevel);
  const tertiary = getTertiaryAction();

  const handleAction = (action: string) => {
    // Handle actions that have real implementations
    switch (action) {
      case 'emergency_call':
        handleEmergencyCall();
        break;
      case 'find_er':
        handleFindER();
        break;
      default:
        // Show coming soon sheet for stub actions
        setSheetAction(action);
        setSheetOpen(true);
    }

    onAction?.(action);
  };

  const handleEmergencyCall = () => {
    // Use tel: protocol which works on both mobile and desktop
    window.location.href = 'tel:911';
  };

  const handleFindER = () => {
    const query = encodeURIComponent('emergency room near me');
    // Open Google Maps in a new tab
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  const getButtonStyles = (variant: string) => {
    switch (variant) {
      case 'emergency':
        return 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800';
      case 'urgent':
        return 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700';
      case 'primary':
        return 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800';
      default:
        return 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800';
    }
  };

  const PrimaryIcon = config.primary.icon;
  const SecondaryIcon = config.secondary?.icon;

  return (
    <>
      <div className="bg-white border-t border-gray-200 px-4 py-3 animate-fadeIn">
        {/* Hint text */}
        {config.hint && (
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Clock className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500">{config.hint}</p>
          </div>
        )}

        {/* Primary & Secondary buttons */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => handleAction(config.primary.action)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium text-sm transition-colors min-h-[48px] ${getButtonStyles(config.primary.variant)}`}
          >
            <PrimaryIcon className="w-4 h-4" strokeWidth={2} />
            {config.primary.label}
          </button>

          {config.secondary && (
            <button
              onClick={() => handleAction(config.secondary!.action)}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium text-sm bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[48px]"
            >
              <SecondaryIcon className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Tertiary link */}
        <button
          onClick={() => handleAction(tertiary.action)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:text-purple-600 transition-colors"
        >
          <Share2 className="w-3 h-3" />
          {tertiary.label}
        </button>
      </div>

      <ComingSoonSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        action={sheetAction}
      />
    </>
  );
}
