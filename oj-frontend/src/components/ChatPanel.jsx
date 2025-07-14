import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Users, MessageSquare, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl, cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChatPanel = ({ messages, onSendMessage, participants, hostId, isSessionActive = true }) => {
  const [text, setText] = useState('');
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() && isSessionActive) {
      onSendMessage(text);
      setText('');
    }
  };

  const participantList = Object.entries(participants);

  return (
    <Tabs defaultValue="chat" className="h-full flex flex-col bg-gray-800/50 rounded-lg border border-gray-700">
      <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 rounded-t-lg rounded-b-none border-b border-gray-700">
        <TabsTrigger value="chat" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-purple-900/30 transition-colors duration-200">
          <MessageSquare className="h-4 w-4 mr-2" />Chat
        </TabsTrigger>
        <TabsTrigger value="participants" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-purple-900/30 transition-colors duration-200">
          <Users className="h-4 w-4 mr-2" />Participants ({participantList.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="flex-grow flex flex-col m-0">
        <div className="flex-grow p-4 overflow-y-auto">
          {messages.map((msg, index) =>
            msg.isSystem ? (
              <div key={index} className="text-center my-3">
                <span className="text-xs text-slate-400 italic bg-slate-700/50 px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            ) : (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 my-3',
                  msg.user?._id === currentUser?._id && 'flex-row-reverse'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl(msg.user?.email)} alt={msg.user?.UserName} />
                  <AvatarFallback>{msg.user?.UserName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'rounded-lg p-3 max-w-xs',
                    msg.user?._id === currentUser?._id
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-700 text-slate-200'
                  )}
                >
                  <p className="font-bold text-sm">{msg.user?.UserName}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-slate-400 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="p-4 border-t border-gray-700 flex items-center gap-2">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isSessionActive ? "Type a message..." : "Session has ended."}
            className="bg-slate-900 border-slate-600 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isSessionActive}
          />
          <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600" disabled={!isSessionActive}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="participants" className="flex-grow overflow-y-auto m-0">
        <div className="p-4 space-y-4">
          {participantList.map(([socketId, participant]) => (
            <div key={socketId} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAvatarUrl(participant.email)} alt={participant.UserName} />
                  <AvatarFallback>{participant.UserName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{participant.UserName}</p>
                  <p className="text-xs text-slate-400">{participant._id === currentUser._id ? 'You' : 'Participant'}</p>
                </div>
              </div>
              {socketId === hostId && (
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Crown className="h-4 w-4" />
                  <span>Host</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ChatPanel;
