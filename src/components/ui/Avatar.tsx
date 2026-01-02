interface AvatarProps {
  initials?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  className?: string;
}

export function Avatar({ initials, name, size = 'md', online = false, className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const onlineIndicatorSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };

  // Generate initials from name if not provided
  const displayInitials = initials || name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Generate consistent color from initials
  const getBackgroundColor = (str: string) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
      'bg-teal-500'
    ];
    const index = str.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const bgColor = getBackgroundColor(displayInitials);

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center font-medium text-white`}>
        {displayInitials}
      </div>
      {online && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${onlineIndicatorSize[size]} bg-green-500 border-2 border-white rounded-full`} />
      )}
    </div>
  );
}
