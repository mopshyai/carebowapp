import { Clock, Video, Calendar, Home, Bell, FileText, Share2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';

interface ComingSoonSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
}

const actionDetails: Record<string, { title: string; description: string; icon: typeof Clock }> = {
  connect_doctor: {
    title: 'Connect to Doctor',
    description: 'Video consultations with verified doctors will be available soon.',
    icon: Video,
  },
  book_home_visit: {
    title: 'Book Home Visit',
    description: 'Schedule a healthcare professional to visit you at home.',
    icon: Home,
  },
  schedule_teleconsult: {
    title: 'Schedule Teleconsult',
    description: 'Book video appointments at your preferred time.',
    icon: Calendar,
  },
  home_visit_options: {
    title: 'Home Visit Options',
    description: 'Browse available home healthcare services.',
    icon: Home,
  },
  set_reminder: {
    title: 'Set Check-in Reminder',
    description: 'Get reminded to check your symptoms and follow up.',
    icon: Bell,
  },
  home_remedies: {
    title: 'Home Remedies Checklist',
    description: 'Personalized self-care tips based on your symptoms.',
    icon: FileText,
  },
  save_share: {
    title: 'Save / Share Summary',
    description: 'Export your assessment to share with your doctor.',
    icon: Share2,
  },
};

export function ComingSoonSheet({ open, onOpenChange, action }: ComingSoonSheetProps) {
  const details = actionDetails[action] || {
    title: 'Coming Soon',
    description: 'This feature is being built.',
    icon: Clock,
  };

  const Icon = details.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
        <SheetHeader className="text-center pt-2">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon className="w-7 h-7 text-purple-600" strokeWidth={2} />
          </div>
          <SheetTitle className="text-lg text-gray-900">{details.title}</SheetTitle>
          <SheetDescription className="text-sm text-gray-600 leading-relaxed">
            {details.description}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pt-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Coming Soon</span>
            </div>
            <p className="text-xs text-purple-700 leading-relaxed">
              We're working hard to bring this feature to you. Check back soon!
            </p>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
