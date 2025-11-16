import { Notification } from '@/types/request';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, MessageSquare, UserPlus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface NotificationsPanelProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
}

const notificationIcons = {
  approval: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  status_update: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
  comment: <MessageSquare className="w-5 h-5 text-green-600" />,
  assignment: <UserPlus className="w-5 h-5 text-purple-600" />
};

export function NotificationsPanel({ notifications, onNotificationClick, onMarkAsRead }: NotificationsPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-background hover:bg-accent' 
                      : 'bg-accent/50 hover:bg-accent border-primary/20'
                  }`}
                  onClick={() => {
                    onNotificationClick(notification);
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {notificationIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">{notification.requestTitle}</p>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(notification.createdAt, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
