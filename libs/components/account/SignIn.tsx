import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { GOOGLE_AUTH, LOGIN } from '../../../apollo/user/mutation';
import { setJwtToken, updateUserInfo } from '../../auth';
import { getGoogleAuthErrorMessage, getSafeAuthRedirect, renderGoogleSignInButton, startKakaoAuthorization } from '../../auth/social';
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
	const googleButtonRef = useRef<HTMLDivElement>(null);

	/** APOLLO REQUESTS **/
	const [loginMutation, { loading }] = useMutation(LOGIN);
	const [googleAuth, { loading: googleLoading }] = useMutation(GOOGLE_AUTH);
	const [socialLoading, setSocialLoading] = useState<'google' | 'kakao' | ''>('');

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

	const handleGoogleLogin = useCallback(async (credential: string) => {
		if (socialLoading) return;
		try {
			setSocialLoading('google');
			const { data } = await googleAuth({ variables: { input: { credential } } });
			const member = data?.googleAuth;
			if (!member?.accessToken) throw new Error('SOCIAL_AUTH_FAILED');
			setJwtToken(member.accessToken);
			updateUserInfo(member.accessToken);
			await sweetTopSmallSuccessAlert(`Welcome, ${member.memberNick}!`, 800);
			await router.push(getSafeAuthRedirect(router.query.referrer));
		} catch (error) {
			sweetMixinErrorAlert(getGoogleAuthErrorMessage(error, 'sign-in'));
		} finally {
			setSocialLoading('');
		}
	}, [googleAuth, router, socialLoading]);

	useEffect(() => {
		const container = googleButtonRef.current;
		if (!container) return;
		let disposed = false;
		void renderGoogleSignInButton(container, (credential) => {
			if (!disposed) void handleGoogleLogin(credential);
		}).catch((error) => {
			if (!disposed) sweetMixinErrorAlert(getGoogleAuthErrorMessage(error, 'sign-in'));
		});
		return () => {
			disposed = true;
			container.replaceChildren();
		};
	}, [handleGoogleLogin]);

	const handleKakaoLogin = () => {
		if (socialLoading) return;
		try {
			setSocialLoading('kakao');
			startKakaoAuthorization(router.query.referrer);
		} catch {
			setSocialLoading('');
			sweetMixinErrorAlert('Kakao sign-in is not configured.');
		}
	};

	const handleUnsupportedSocial = (provider: string) => {
		sweetMixinErrorAlert(`${provider} sign-in is not available yet.`);
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
						<div
							ref={googleButtonRef}
							className={`google-auth-button ${loading || googleLoading || socialLoading ? 'is-disabled' : ''}`}
							aria-label="Continue with Google"
						/>

						{/* Kakao */}
						<button
							type="button"
							className="social-btn"
							title="Continue with Kakao"
							onClick={handleKakaoLogin}
							disabled={loading || googleLoading || Boolean(socialLoading)}
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
							onClick={() => handleUnsupportedSocial('Telegram')}
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
