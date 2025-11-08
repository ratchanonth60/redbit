import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

export function PostSkeleton() {
  return (
    <MotiView className="bg-card p-4 mb-2">
      <Skeleton colorMode="light" width="60%" height={16} />
      <Spacer height={8} />
      <Skeleton colorMode="light" width="100%" height={60} />
      <Spacer height={8} />
      <Skeleton colorMode="light" width="40%" height={14} />
    </MotiView>
  );
}
