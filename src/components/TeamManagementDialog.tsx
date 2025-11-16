import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Request } from '@/types/request';
import { Badge } from '@/components/ui/badge';

interface TeamManagementDialogProps {
  teamMembers: User[];
  requests: Request[];
}

export function TeamManagementDialog({ teamMembers = [], requests = [] }: TeamManagementDialogProps) {
  const [open, setOpen] = useState(false);

  const getRequestsForUser = (userId: string) => {
    return requests.filter(r => r.assignedTo === userId);
  };

  const getCompletedRequests = (userId: string) => {
    return requests.filter(r => r.assignedTo === userId && r.status === 'completed').length;
  };

  const getActiveRequests = (userId: string) => {
    return requests.filter(r => 
      r.assignedTo === userId && 
      r.status !== 'completed' && 
      r.status !== 'rejected' && 
      r.status !== 'cancelled'
    ).length;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Team Management
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Team Management</DialogTitle>
          <DialogDescription>
            View team members and their workload
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-4 max-h-[60vh] overflow-y-auto">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge>{member.role.replace('_', ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {getActiveRequests(member.id)}
                      </div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {getCompletedRequests(member.id)}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        {getRequestsForUser(member.id).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="systems" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Systems Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['CRM System', 'Inventory System', 'HR Portal', 'Analytics Platform'].map((system) => {
                    const systemRequests = requests.filter(r => r.system === system);
                    return (
                      <div key={system} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{system}</span>
                        <Badge variant="outline">{systemRequests.length} requests</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
