import { cn } from '../../utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

const Loading = ({ size = 'md', className, text, fullScreen }: LoadingProps) => {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-primary-600 border-t-transparent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
        {text && (
          <p className="mt-4 text-sm font-bold text-slate-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      {spinner}
      {text && <p className="text-sm font-bold text-slate-500">{text}</p>}
    </div>
  );
};

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-slate-100 rounded-xl', className)} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 p-0">
    <Skeleton className="aspect-square w-full" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-10 w-full rounded-2xl mt-4" />
    </div>
  </div>
);

export default Loading;
