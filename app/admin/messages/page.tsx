"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, Eye, Lock, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { messages as dummyMessages, customers, getRelativeTime } from "@/lib/dummy-data"

// Group messages by customer
function groupMessagesByCustomer(msgs: typeof dummyMessages) {
  const grouped: Record<string, typeof dummyMessages> = {}
  msgs.forEach(msg => {
    if (!grouped[msg.customerId]) {
      grouped[msg.customerId] = []
    }
    grouped[msg.customerId].push(msg)
  })
  return grouped
}

// Get conversations from messages
function getConversations(msgs: typeof dummyMessages) {
  const grouped = groupMessagesByCustomer(msgs)
  return Object.entries(grouped).map(([customerId, customerMsgs]) => {
    const lastMsg = customerMsgs[customerMsgs.length - 1]
    const unreadCount = customerMsgs.filter(m => !m.read && m.sender === "customer").length
    return {
      id: customerId,
      customer: lastMsg.customerName,
      lastMessage: lastMsg.content.slice(0, 50) + (lastMsg.content.length > 50 ? "..." : ""),
      timestamp: getRelativeTime(lastMsg.createdAt),
      unread: unreadCount > 0,
    }
  }).sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0))
}

export default function MessagesPage() {
  const conversations = useMemo(() => getConversations(dummyMessages), [])
  const [selectedConversation, setSelectedConversation] = useState<typeof conversations[0] | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0])
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [conversations, selectedConversation])

  const filteredConversations = conversations.filter((conv) =>
    conv.customer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get messages for selected conversation
  const currentMessages = useMemo(() => {
    if (!selectedConversation) return []
    return dummyMessages
      .filter(m => m.customerId === selectedConversation.id)
      .map(m => ({
        id: m.id,
        sender: m.sender,
        message: m.content,
        timestamp: getRelativeTime(m.createdAt),
        visible: !m.isInternal,
      }))
  }, [selectedConversation])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    toast.success(isInternal ? "Catatan internal ditambahkan" : "Pesan terkirim")
    setNewMessage("")
  }

  return (
    <div className="p-6 h-[calc(100vh-48px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pesan</h1>
        <p className="text-muted-foreground">Komunikasi dengan pelanggan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-80px)]">
        {/* Inbox List */}
        <Card className="bg-card border rounded-xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 text-left hover:bg-accent transition-colors border-b border-border",
                      selectedConversation?.id === conv.id && "bg-indigo-50 dark:bg-indigo-900/20"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {conv.customer.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conv.customer}</p>
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Thread */}
        <Card className="lg:col-span-2 bg-card border rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {selectedConversation?.customer.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedConversation?.customer || "Pilih percakapan"}</CardTitle>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === "admin" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-2",
                      msg.sender === "admin"
                        ? msg.visible
                          ? "bg-indigo-600 text-white"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span
                        className={cn(
                          "text-xs",
                          msg.sender === "admin" && msg.visible
                            ? "text-indigo-200"
                            : "text-muted-foreground"
                        )}
                      >
                        {msg.timestamp}
                      </span>
                      {msg.sender === "admin" && (
                        msg.visible ? (
                          <Eye className="h-3 w-3 text-green-400" />
                        ) : (
                          <Lock className="h-3 w-3 text-yellow-600" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsInternal(false)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  !isInternal
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Eye className="h-3 w-3" />
                Terlihat pelanggan
              </button>
              <button
                onClick={() => setIsInternal(true)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  isInternal
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Lock className="h-3 w-3" />
                Catatan internal
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={isInternal ? "Tulis catatan internal..." : "Tulis pesan..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className={cn(
                  isInternal && "border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                )}
                disabled={!selectedConversation}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!selectedConversation || !newMessage.trim()}
                className={cn(
                  isInternal
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-indigo-600 hover:bg-indigo-700",
                  "text-white"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
