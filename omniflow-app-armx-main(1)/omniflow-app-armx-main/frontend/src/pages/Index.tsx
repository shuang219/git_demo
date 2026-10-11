// TODO: import Components here
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: put Components here */}
      {/* Omniflow Badge - always put this at the bottom right corner of the page*/}
      <OmniflowBadge />
      <Toaster />
    </div>
  );
};

export default Index;
