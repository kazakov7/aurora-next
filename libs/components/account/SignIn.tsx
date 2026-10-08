import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../../../apollo/user/mutation';
import { setJwtToken, updateUserInfo } from '../../auth';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface SignInProps {
	onSwitchToSignUp?: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp }) => {
	const router = useRouter();

	const [identifier, setIdentifier] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [rememberMe, setRememberMe] = useState<boolean>(true);
	const [identifierHint, setIdentifierHint] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [loginMutation, { loading }] = useMutation(LOGIN);

	/** HANDLERS **/
	const handleIdentifierChange = (val: string) => {
		setIdentifier(val);
		if (val.includes('@') && val.includes('.')) {
			setIdentifierHint('Valid Email');
		} else if (val.startsWith('@') && val.length > 2) {
			setIdentifierHint('Valid Handle');
		} else if (val.trim().length >= 3) {
			setIdentifierHint('Valid Nickname');
		} else {
			setIdentifierHint('');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!identifier.trim() || !password) {
			sweetMixinErrorAlert('Please enter your email/nickname and password.');
			return;
		}

		try {
			const { data } = await loginMutation({
				variables: {
					input: {
						memberNick: identifier.trim(),
						memberPassword: password,
					},
				},
			});

			if (data?.login?.accessToken) {
				setJwtToken(data.login.accessToken);
				updateUserInfo(data.login.accessToken);
				await sweetTopSmallSuccessAlert(`Welcome back, ${data.login.memberNick}!`, 800);
				const target = (router.query.referrer as string) || '/mypage';
				await router.push(target);
			}
		} catch (err: any) {
			console.error('Login error:', err);
			sweetMixinErrorAlert(err?.message || 'Login failed. Please check your credentials.');
		}
	};

	const handleSocialClick = (provider: string) => {
		sweetMixinErrorAlert(`${provider} login is currently integrating with production OAuth.`);
	};

	return (
		<div className="auth-split-card">
			{/* Left Column: Authentication Form */}
			<div className="form-panel">
				{/* Top Bar / Breadcrumb Micro-Nav */}
				<div className="top-meta-bar">
					<div className="meta-left">
						<span className="pulse-dot"></span>
						<span className="meta-title">Account Access</span>
					</div>
					<span className="meta-version">Auth Portal v2.4</span>
				</div>

				{/* Main Form Header & Interactive Body */}
				<div style={{ maxWidth: '440px', width: '100%', margin: 'auto 0', padding: '10px 0' }}>
					{/* Eyebrow & Title */}
					<div className="heading-group">
						<span className="eyebrow">Welcome Back</span>
						<h1>Sign in to your account</h1>
						<p>Sign in to continue your curated journey with AURA.</p>
					</div>

					{/* Form Elements */}
					<form className="auth-form" onSubmit={handleSubmit}>
						{/* Identity Field */}
						<div className="field-group">
							<div className="field-header">
								<label htmlFor="identifier">Email or Nickname</label>
								{identifierHint && (
									<span className="field-hint" style={{ opacity: 1 }}>
										{identifierHint}
									</span>
								)}
							</div>
							<div className="input-wrapper">
								<input
									id="identifier"
									name="identifier"
									type="text"
									required
									value={identifier}
									onChange={(e) => handleIdentifierChange(e.target.value)}
									placeholder="name@example.com or @handle"
									className="with-suffix"
								/>
								<span className="material-symbols-outlined suffix-icon">person_outline</span>
							</div>
						</div>

						{/* Password Field */}
						<div className="field-group">
							<div className="field-header">
								<label htmlFor="password">Password</label>
								<a
									href="#"
									className="forgot-link"
									onClick={(e) => {
										e.preventDefault();
										sweetMixinErrorAlert('Password recovery link has been sent to your registered email.');
									}}
								>
									Forgot password?
								</a>
							</div>
							<div className="input-wrapper">
								<input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••••••"
									className="with-suffix"
								/>
								<button
									type="button"
									className="toggle-eye-btn"
									onClick={() => setShowPassword(!showPassword)}
									aria-label="Toggle password visibility"
								>
									<span className="material-symbols-outlined">
										{showPassword ? 'visibility_off' : 'visibility'}
									</span>
								</button>
							</div>
						</div>

						{/* Utilities Row: Remember Me & Security Meta */}
						<div className="utilities-row">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
								/>
								<span>Remember this device</span>
							</label>
							<div className="security-badge">
								<span className="material-symbols-outlined">lock</span>
								<span>256-bit SSL</span>
							</div>
						</div>

						{/* Submit CTA Button */}
						<button type="submit" className="submit-btn" disabled={loading}>
							{loading ? (
								<>
									<span>Authenticating...</span>
									<span className="spinner"></span>
								</>
							) : (
								<>
									<span>Sign In</span>
									<span className="material-symbols-outlined">east</span>
								</>
							)}
						</button>
					</form>

					{/* Social Separator */}
					<div className="social-divider">
						<span>or continue with</span>
					</div>

					{/* Social Authentication Triad */}
					<div className="social-grid">
						{/* Google */}
						<button
							type="button"
							className="social-btn"
							title="Continue with Google"
							onClick={() => handleSocialClick('Google')}
						>
							<svg viewBox="0 0 24 24">
								<path
									d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
									fill="#4285F4"
								></path>
								<path
									d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
									fill="#34A853"
								></path>
								<path
									d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
									fill="#FBBC05"
								></path>
								<path
									d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
									fill="#EA4335"
								></path>
							</svg>
							<span>Google</span>
						</button>

						{/* Kakao */}
						<button
							type="button"
							className="social-btn"
							title="Continue with Kakao"
							onClick={() => handleSocialClick('Kakao')}
						>
							<svg fill="#381E1F" viewBox="0 0 24 24">
								<path d="M12 3C6.477 3 2 6.477 2 10.767c0 2.775 1.884 5.21 4.724 6.56l-1.2 4.41c-.105.386.326.697.66.476l5.228-3.468c.192.013.388.022.588.022 5.523 0 10-3.477 10-7.767C22 6.477 17.523 3 12 3z"></path>
							</svg>
							<span>Kakao</span>
						</button>

						{/* Telegram */}
						<button
							type="button"
							className="social-btn"
							title="Continue with Telegram"
							onClick={() => handleSocialClick('Telegram')}
						>
							<svg fill="#229ED9" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"></path>
							</svg>
							<span>Telegram</span>
						</button>
					</div>
				</div>

				{/* Bottom Sign-Up Link */}
				<div className="bottom-redirect">
					<p>
						New to AURA?
						<button
							type="button"
							onClick={() => {
								if (onSwitchToSignUp) onSwitchToSignUp();
								else router.push('/account/join?view=signup');
							}}
						>
							Create an account
						</button>
					</p>
				</div>
			</div>

			{/* Right Column: Immersive Luxury Editorial Feature */}
			<div className="editorial-panel">
				<img
					alt="Swiss Alps sanctuary luxury retreat"
					className="bg-visual-img"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkvikJZPxn7yNSStoZcrIZiB9AtnKNq6QmfTprY_UCYBPyotZKq5F1P_-rWXJYgWpYKPkDXR5PlGZzy1pp8G8YEWrl-Vl3ZwzQ5LVxuqo_EOmUc-tLbl-2emPIA9q9I4Eeot93ADLf263PGUWrleJirgxadKRfye7QuCgIygtkavdIU4MytCH7a0E7ueii6KfAknxKjPicub1MI4auuIH0QNF_uxkQzwGxUUX30_BmJIvBodlYQfYA"
				/>
				<div className="scrim-overlay"></div>
				<div className="scrim-side"></div>

				{/* Top Tag Row */}
				<div className="top-badge-row">
					<div className="collection-tag">
						<span className="material-symbols-outlined">verified</span>
						<span>Swiss Alps · Sanctuary Collection</span>
					</div>
					<button type="button" className="info-btn" aria-label="Explore sanctuary">
						<span className="material-symbols-outlined">explore</span>
					</button>
				</div>

				{/* Bottom Content Narrative */}
				<div className="bottom-content">
					<span className="feature-eyebrow">Editorial Feature</span>
					<h2>Your next journey starts here.</h2>
					<p>Curated stays, bespoke expeditions, and private alpine retreats across the world.</p>
					<div className="indicator-pills">
						<span className="pill active"></span>
						<span className="pill inactive"></span>
						<span className="pill inactive"></span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignIn;
