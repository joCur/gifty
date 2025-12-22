import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getMyFriends, getPendingRequests } from "@/lib/actions/friends";
import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequests } from "@/components/friends/friend-requests";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default async function FriendsPage() {
  const [friends, requests] = await Promise.all([
    getMyFriends(),
    getPendingRequests(),
  ]);

  const pendingCount = requests.incoming.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Friends</h1>
        <AddFriendDialog>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </AddFriendDialog>
      </div>

      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Requests
            {pendingCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="friends" className="mt-4">
          <FriendsList friends={friends} />
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
          <FriendRequests
            incoming={requests.incoming}
            outgoing={requests.outgoing}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
