import React, { useEffect, useRef, useState } from "react";
import { ChatConversation, ChatMessage, ChatMember } from "./chat.types";
import { DEFAULT_USER_AVATAR, getImageUrl } from "../../config";
import router from "next/router";
import { useI18n } from "../../i18n";

interface ChatThreadProps {
  conversation?: ChatConversation;
  messages: ChatMessage[];
  currentMemberId: string;
  loading: boolean;
  error?: string;
  hasOlderMessages: boolean;
  socketStatus: "connected" | "reconnecting" | "disconnected";
  onLoadOlder: () => Promise<void>;
  onSendMessage: (text: string) => Promise<boolean>;
  onBackToConversations?: () => void;
}

const getPeer = (
  conversation: ChatConversation,
  currentMemberId: string,
): ChatMember | undefined =>
  conversation.memberOneId === currentMemberId
    ? conversation.memberTwoData
    : conversation.memberOneData;

const ChatThread: React.FC<ChatThreadProps> = ({
  conversation,
  messages,
  currentMemberId,
  loading,
  error,
  hasOlderMessages,
  socketStatus,
  onLoadOlder,
  onSendMessage,
  onBackToConversations,
}) => {
  const { t, formatDate } = useI18n();
  const [textInput, setTextInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const previousConversationIdRef = useRef("");

  useEffect(() => {
    if (!conversation || previousConversationIdRef.current === conversation._id)
      return;
    previousConversationIdRef.current = conversation._id;
    setTextInput("");
    setSendError("");
  }, [conversation]);

  useEffect(() => {
    if (!feedRef.current || !messages.length) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [conversation?._id, messages.length]);

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const content = textInput.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError("");
    try {
      const wasSent = await onSendMessage(content);
      if (wasSent) setTextInput("");
      else
        setSendError(
          socketStatus === "disconnected"
            ? t("chat.thread.reconnectingNotice")
            : t("chat.thread.sendFailed"),
        );
    } catch {
      setSendError(t("chat.thread.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleLoadOlder = async () => {
    const feed = feedRef.current;
    const previousHeight = feed?.scrollHeight || 0;
    await onLoadOlder();
    requestAnimationFrame(() => {
      if (feed) feed.scrollTop = feed.scrollHeight - previousHeight;
    });
  };

  if (!conversation)
    return (
      <main className="chat-thread-panel">
        <div className="no-conversations-empty">
          {onBackToConversations ? (
            <button
              type="button"
              className="mobile-thread-back-btn"
              onClick={onBackToConversations}
              aria-label={t("chat.thread.selectConversation")}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_back
              </span>
            </button>
          ) : null}
          <p>{t("chat.thread.selectConversation")}</p>
        </div>
      </main>
    );
  const isGlobal = conversation.chatType === "GLOBAL";
  const peer = getPeer(conversation, currentMemberId);
  const name = isGlobal
    ? t("common.globalChat")
    : peer?.memberNick || peer?.memberFullName || t("common.unavailableMember");
  const subtitle = isGlobal
    ? t("chat.thread.communityConversation")
    : peer?.memberType === "AGENT"
    ? t("chat.travelPartner")
    : t("common.travelerLabel");
  let previousDate = "";

  return (
    <main aria-label={t("chat.thread.conversationThread")} className="chat-thread-panel">
      <header className="thread-header">
        <div className="header-info">
          {onBackToConversations ? (
            <button
              type="button"
              className="mobile-thread-back-btn"
              onClick={onBackToConversations}
              aria-label={t("chat.thread.selectConversation")}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_back
              </span>
            </button>
          ) : null}
          <div className="avatar-wrapper">
            {isGlobal ? (
              <div className="avatar-placeholder">
                <span className="material-symbols-outlined">public</span>
              </div>
            ) : (
              <img
                src={getImageUrl(peer?.memberImage, DEFAULT_USER_AVATAR)}
                alt={name}
                className="header-avatar"
              />
            )}
          </div>
          <div className="name-details">
            <div className="title-row">
              <h1>{name}</h1>
              {isGlobal ? <span className="role-badge">{t("navigation.community")}</span> : null}
            </div>
            <div className="meta-status-row">
              <span className="active-status">
                <span className={`pulse-dot ${socketStatus}`} />
                {socketStatus === "connected"
                  ? t("chat.thread.connected")
                  : socketStatus === "reconnecting"
                  ? t("chat.thread.reconnecting")
                  : t("chat.thread.offline")}
              </span>
              <span className="bullet">·</span>
              <span className="sub-detail">{subtitle}</span>
            </div>
          </div>
        </div>
      </header>
      <div ref={feedRef} className="thread-messages-feed">
        {hasOlderMessages ? (
          <button
            type="button"
            className="load-older-btn"
            onClick={handleLoadOlder}
          >
            {t("chat.thread.loadOlderMessages")}
          </button>
        ) : null}
        {loading && !messages.length ? (
          <div className="no-conversations-empty">
            <p>{t("chat.thread.loadingMessages")}</p>
          </div>
        ) : null}
        {error ? (
          <div className="no-conversations-empty">
            <p>{error}</p>
          </div>
        ) : null}
        {!loading && !error && !messages.length ? (
          <div className="no-conversations-empty">
            <p>{t("chat.thread.empty")}</p>
          </div>
        ) : null}
        {messages.map((message) => {
          const date = formatDate(message.createdAt);
          const showDate = date !== previousDate;
          previousDate = date;
          const isMe = message.senderId === currentMemberId;
          const senderName =
            message.senderData?.memberNick ||
            message.senderData?.memberFullName ||
            t("common.member");
          return (
            <React.Fragment key={message._id}>
              {showDate ? (
                <div className="date-separator">
                  <span className="separator-badge">{date}</span>
                </div>
              ) : null}
              <div
                className={`message-group ${isMe ? "outgoing" : "incoming"}`}
              >
                {!isMe ? (
                  <img
                    src={getImageUrl(
                      message.senderData?.memberImage,
                      DEFAULT_USER_AVATAR,
                    )}
                    alt={senderName}
                    className="msg-avatar"
                    onClick={() => {
                      console.log(senderName);
                      router.push(
                        `/member?memberId=${message.senderData?._id}`,
                      );
                    }}
                  />
                ) : null}
                <div className="msg-content-col">
                  {isGlobal && !isMe ? (
                    <span className="message-sender-name">{senderName}</span>
                  ) : null}
                  <div
                    className={`message-bubble ${
                      isMe ? "me-bubble" : "peer-bubble"
                    }`}
                  >
                    <p>{message.messageContent}</p>
                  </div>
                  <div className="msg-meta-row">
                    <span className="msg-time">
                      {formatDate(message.createdAt, "time")}
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <footer className="thread-composer">
        <form onSubmit={handleSend} className="composer-inner">
          <textarea
            id="chat-input"
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder={t("chat.thread.typeAMessage")}
            className="composer-input"
            maxLength={1000}
            disabled={sending || socketStatus === "disconnected"}
          />
          <div className="send-actions">
            <button
              type="submit"
              id="btn-send-message"
              className="send-btn"
              aria-label={t("chat.thread.sendMessage")}
              disabled={
                !textInput.trim() || sending || socketStatus === "disconnected"
              }
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </form>
        <div className="composer-submeta">
          <span>
            {sendError ||
              (socketStatus === "connected"
                ? t("chat.thread.deliveredNote")
                : t("chat.thread.waitingConnection"))}
          </span>
          <span className="shortcut-hint">{t("chat.thread.newLineHint")}</span>
        </div>
      </footer>
    </main>
  );
};

export default ChatThread;
