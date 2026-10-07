import React, { useState, useRef, useEffect } from 'react';
import { ChatConversation, ChatMessage } from './chat.types';

interface ChatThreadProps {
	conversation: ChatConversation;
	onSendMessage: (conversationId: string, text: string) => void;
}

const ChatThread: React.FC<ChatThreadProps> = ({ conversation, onSendMessage }) => {
	const [textInput, setTextInput] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [conversation.messages]);

	const handleSend = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!textInput.trim()) return;
		onSendMessage(conversation.id, textInput.trim());
		setTextInput('');
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleDownloadAttachment = (fileName: string) => {
		alert(`Downloading ${fileName}... (Verified Concierge File)`);
	};

	const isGlobal = conversation.role === 'global';

	return (
		<main aria-label="Conversation Thread" className="chat-thread-panel">
			{/* Chat Header */}
			<header className="thread-header">
				<div className="header-info">
					<div className="avatar-wrapper">
						{conversation.avatar ? (
							<img src={conversation.avatar} alt={conversation.name} className="header-avatar" />
						) : (
							<div className="avatar-placeholder">
								<span className="material-symbols-outlined">{conversation.icon || 'person'}</span>
							</div>
						)}
						{conversation.isOnline && <span className="online-indicator" />}
					</div>

					<div className="name-details">
						<div className="title-row">
							<h1>{conversation.name}</h1>
							{conversation.verified && (
								<span className="material-symbols-outlined verified-icon">verified</span>
							)}
							{conversation.roleBadge && (
								<span className="role-badge">{conversation.roleBadge}</span>
							)}
						</div>

						<div className="meta-status-row">
							<span className="active-status">
								<span className="pulse-dot" />
								{conversation.isOnline ? 'Active Now' : 'Offline'}
							</span>
							<span className="bullet">·</span>
							<span className="sub-detail">{conversation.subtitle}</span>
							{conversation.location && (
								<>
									<span className="bullet">·</span>
									<span className="location-tag">
										<span className="material-symbols-outlined">location_on</span>
										{conversation.location}
									</span>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Header Actions */}
				<div className="header-actions">
					<button
						type="button"
						className="action-icon-btn"
						aria-label="Audio call with host"
						onClick={() => alert(`Initiating encrypted audio call with ${conversation.name}...`)}
					>
						<span className="material-symbols-outlined">call</span>
					</button>
					<button
						type="button"
						className="action-icon-btn"
						aria-label="Video consultation"
						onClick={() => alert(`Initiating 4K video consultation with ${conversation.name}...`)}
					>
						<span className="material-symbols-outlined">videocam</span>
					</button>
					<button
						type="button"
						className="action-icon-btn"
						aria-label="Toggle profile details"
						onClick={() => alert(`Showing profile dossier for ${conversation.name}`)}
					>
						<span className="material-symbols-outlined">info</span>
					</button>
					<button
						type="button"
						className="action-icon-btn"
						aria-label="More conversation options"
						onClick={() => alert('Options: Mute Notifications, Export Transcript, Block Contact.')}
					>
						<span className="material-symbols-outlined">more_vert</span>
					</button>
				</div>
			</header>

			{/* Message History Feed */}
			<div className="thread-messages-feed">
				{/* Date Separator */}
				<div className="date-separator">
					<span className="separator-badge">Today, October 24</span>
				</div>

				{/* Messages List */}
				{conversation.messages.map((msg: ChatMessage) => {
					const isMe = msg.isOutgoing || msg.senderId === 'me';
					return (
						<div
							key={msg.id}
							className={`message-group ${isMe ? 'outgoing' : 'incoming'}`}
						>
							{!isMe && (
								<img
									src={msg.senderAvatar || conversation.avatar || '/img/profile/defaultUser.svg'}
									alt={msg.senderName}
									className="msg-avatar"
								/>
							)}

							<div className="msg-content-col">
								<div className={`message-bubble ${isMe ? 'me-bubble' : 'peer-bubble'}`}>
									<p>{msg.text}</p>

									{/* PDF Attachment Card if present */}
									{msg.attachment && (
										<div
											className="pdf-attachment-card"
											onClick={() => handleDownloadAttachment(msg.attachment!.fileName)}
										>
											<div className="attachment-icon-box">
												<span className="material-symbols-outlined">picture_as_pdf</span>
											</div>
											<div className="attachment-info">
												<p className="file-name">{msg.attachment.fileName}</p>
												<p className="file-meta">{msg.attachment.fileSize}</p>
											</div>
											<button
												type="button"
												className="dl-btn"
												aria-label="Download attachment"
											>
												<span className="material-symbols-outlined">arrow_downward</span>
											</button>
										</div>
									)}
								</div>

								<div className="msg-meta-row">
									<span className="msg-time">{msg.time}</span>
									{isMe && (
										<span className="material-symbols-outlined check-icon">done_all</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>

			{/* Message Composer Footer */}
			<footer className="thread-composer">
				<form onSubmit={handleSend} className="composer-inner">
					<div className="attachment-actions">
						<button
							type="button"
							className="composer-icon-btn"
							aria-label="Attach documents"
							onClick={() => alert('Attachment: Select file to send (PDF, DOCX, HEIC).')}
						>
							<span className="material-symbols-outlined">add_circle</span>
						</button>
						<button
							type="button"
							className="composer-icon-btn"
							aria-label="Attach imagery"
							onClick={() => alert('Select photo from gallery.')}
						>
							<span className="material-symbols-outlined">image</span>
						</button>
						<button
							type="button"
							className="composer-icon-btn"
							aria-label="Select emoji"
							onClick={() => setTextInput((prev) => prev + ' 😊')}
						>
							<span className="material-symbols-outlined">mood</span>
						</button>
					</div>

					<input
						type="text"
						id="chat-input"
						value={textInput}
						onChange={(e) => setTextInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message or press '/' for concierge shortcuts..."
						className="composer-input"
					/>

					<div className="send-actions">
						<button
							type="button"
							className="composer-icon-btn"
							aria-label="Record voice note"
							onClick={() => alert('Recording voice note... Release to send.')}
						>
							<span className="material-symbols-outlined">mic</span>
						</button>
						<button
							type="submit"
							id="btn-send-message"
							className="send-btn"
							aria-label="Send message"
						>
							<span className="material-symbols-outlined">send</span>
						</button>
					</div>
				</form>

				<div className="composer-submeta">
					<span className="encrypted-notice">
						<span className="material-symbols-outlined">lock</span>
						End-to-End Encrypted Concierge Channel
					</span>
					<span className="shortcut-hint">Shift + Return for new line</span>
				</div>
			</footer>
		</main>
	);
};

export default ChatThread;
