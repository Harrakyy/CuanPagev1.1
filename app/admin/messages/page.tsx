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
import {
  getMessages,
  getCustomers,
  createMessage,
  markMessagesAsRead,
  getRelativeTime,
  type Message,
  type Profile,
} from "@/lib/supabase/queries"
import { useAuth } from "@/contexts/auth-context"

interface Conversation {
  customerId: string
  customerName: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [msgs, custs] = await Promise.all([getMessages(), getCustomers()])
        setMessages(msgs)
        setCustomers(custs)
        if (msgs.length > 0 && !selectedCustomerId) {
          // Auto-select first conversation
          const firstSenderId = msgs[0].sender_id || msgs[0].receiver_id
          if (firstSenderId) setSelectedCustomerId(firstSenderId)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
        toast.error("Gagal memuat pesan")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Build conversations list from messages
  const conversations = useMemo<Conversation[]>(() => {
    const grouped: Record<string, Message[]> = {}

    messages.forEach((msg) => {
      // Determine which party is the customer
      const customerId =
        msg.sender_id && msg.sender_id !== user?.id
          ? msg.sender_id
          : msg.receiver_id && msg.receiver_id !== user?.id
          ? msg.receiver_id
          : msg.sender_id || msg.receiver_id

      if (!customerId) return
      if (!grouped[customerId]) grouped[customerId] = []
      grouped[customerId].push(msg)
    })

    return Object.entries(grouped)
      .map(([customerId, msgs]) => {
        const sortedMsgs = [...msgs].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        const lastMsg = sortedMsgs[sortedMsgs.length - 1]
        const unreadCount = msgs.filter(
          (m) => !m.is_read && m.sender_id !== user?.id
        ).length
        const customer = customers.find((c) => c.id === customerId)

        return {
          customerId,
          customerName: customer?.full_name || customer?.email || "Unknown",
          lastMessage:
            lastMsg.content.slice(0, 50) +
            (lastMsg.content.length > 50 ? "..." : ""),
          timestamp: getRelativeTime(lastMsg.created_at),
          unread: unreadCount > 0,
        }
      })
      .sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0))
  }, [messages, customers, user?.id])

  const filteredConversations = conversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Messages for selected conversation
  const currentMessages = useMemo(() => {
    if (!selectedCustomerId) return []
    return messages
      .filter(
        (m) =>
          m.sender_id === selectedCustomerId ||
          m.receiver_id === selectedCustomerId
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
  }, [messages, selectedCustomerId])

  const selectedConversation = conversations.find(
    (c) => c.customerId === selectedCustomerId
  )

  const handleSelectConversation = async (customerId: string) => {
    setSelectedCustomerId(customerId)
    try {
      await markMessagesAsRead(customerId)
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === customerId ? { ...m, is_read: true } : m
        )
      )
    } catch (e) {
      // silent
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomerId) return
    setIsSending(true)
    try {
      const sent = await createMessage({
        sender_id: user?.id,
        receiver_id: selectedCustomerId,
        content: newMessage.trim(),
        is_internal: isInternal,
      })
      setMessages((prev) => [...prev, sent])
      setNewMessage("")
      toast.success(isInternal ? "Catatan internal ditambahkan" : "Pesan terkirim")
    } catch (error) {
      toast.error("Gagal mengirim pesan")
    } finally {
      setIsSending(false)
    }
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
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Belum ada percakapan
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.customerId}
                    onClick={() => handleSelectConversation(conv.customerId)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 text-left hover:bg-accent transition-colors border-b border-border",
                      selectedCustomerId === conv.customerId &&
                        "bg-indigo-50 dark:bg-indigo-900/20"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {conv.customerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conv.customerName}</p>
                        <span className="text-xs text-muted-foreground">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Thread */}
        <Card className="lg:col-span-2 bg-card border rounded-xl flex flex-col overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {selectedConversation?.customerName.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {selectedConversation?.customerName || "Pilih percakapan"}
                </CardTitle>
                {selectedConversation && (
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                )}
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {selectedCustomerId
                  ? "Belum ada pesan"
                  : "Pilih percakapan untuk mulai"}
              </div>
            ) : (
              <div className="space-y-4">
                {currentMessages.map((msg) => {
                  const isAdmin = msg.sender_id === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isAdmin ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-4 py-2",
                          isAdmin
                            ? msg.is_internal
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800"
                              : "bg-indigo-600 text-white"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span
                            className={cn(
                              "text-xs",
                              isAdmin && !msg.is_internal
                                ? "text-indigo-200"
                                : "text-muted-foreground"
                            )}
                          >
                            {getRelativeTime(msg.created_at)}
                          </span>
                          {isAdmin && (
                            msg.is_internal ? (
                              <Lock className="h-3 w-3 text-yellow-600" />
                            ) : (
                              <Eye className="h-3 w-3 text-green-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

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
                placeholder={
                  isInternal ? "Tulis catatan internal..." : "Tulis pesan..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className={cn(
                  isInternal &&
                    "border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                )}
                disabled={!selectedCustomerId}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!selectedCustomerId || !newMessage.trim() || isSending}
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