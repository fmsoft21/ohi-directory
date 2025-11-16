// app/dashboard/messages/page.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "@/components/hooks/use-toast";
import DashboardShell from "@/assets/components/DashboardShell";
import Image from "next/image";

export default function MessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Auto-select conversation from URL params
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  // Fetch conversations
  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoading(true);

    try {
      const res = await fetch(`/api/messages/${conversation._id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // Update conversation unread count to 0
        setConversations(prev =>
          prev.map(c =>
            c._id === conversation._id ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selectedConversation._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages([...messages, message]);
        setNewMessage("");
        
        // Update conversation list
        setConversations(prev =>
          prev.map(c =>
            c._id === selectedConversation._id
              ? {
                  ...c,
                  lastMessage: {
                    content: newMessage.trim(),
                    sender: session.user.id,
                    timestamp: new Date(),
                  },
                }
              : c
          )
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!confirm("Delete this conversation?")) return;

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConversations(prev => prev.filter(c => c._id !== conversationId));
        if (selectedConversation?._id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
        toast({
          title: "Success",
          description: "Conversation deleted",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(
      (p) => p._id !== session?.user?.id
    );
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <DashboardShell>
      <div className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Conversations List */}
          <Card className="md:col-span-1 border-none bg-zinc-100 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Messages</span>
                <Badge variant="secondary">{conversations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                {loading && conversations.length === 0 ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start chatting with sellers from product pages
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b dark:border-zinc-800 ${
                          selectedConversation?._id === conversation._id
                            ? "bg-muted"
                            : ""
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={otherUser?.image || "/profile.png"} />
                          <AvatarFallback>
                            {otherUser?.storename?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {otherUser?.storename}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="ml-2 rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || "No messages yet"}
                          </p>
                          {conversation.product && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              Re: {conversation.product.title}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.lastMessage?.timestamp)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2 border-none bg-zinc-100 dark:bg-zinc-900 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            getOtherParticipant(selectedConversation)?.image ||
                            "/profile.png"
                          }
                        />
                        <AvatarFallback>
                          {getOtherParticipant(selectedConversation)?.storename?.[0] ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {getOtherParticipant(selectedConversation)?.storename}
                        </CardTitle>
                        {selectedConversation.product && (
                          <p className="text-sm text-muted-foreground">
                            About: {selectedConversation.product.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteConversation(selectedConversation._id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-800">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mb-4" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.sender._id === session?.user?.id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwn
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? "text-emerald-100" : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="p-4 border-t dark:border-zinc-800">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}