import React, { ReactNode, useEffect, useRef, useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useI18n } from '../../i18n';

interface MobileFilterPanelProps {
	children: ReactNode;
	title: string;
}

const MobileFilterPanel = ({ children, title }: MobileFilterPanelProps) => {
	const { t } = useI18n();
	const device = useDeviceDetect();
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLElement>(null);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false);
				triggerRef.current?.focus();
				return;
			}
			if (event.key === 'Tab') {
				const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
					'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
				);
				if (!focusable?.length) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		};

		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', handleKeyDown);
		window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('button, input, select')?.focus());
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	/** HANDLERS **/
	const closePanel = () => {
		setOpen(false);
		triggerRef.current?.focus();
	};

	if (device !== 'mobile') return <>{children}</>;

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				className="mobile-filter-trigger"
				aria-expanded={open}
				aria-controls="mobile-filter-panel"
				onClick={() => setOpen(true)}
			>
				<span className="material-symbols-outlined" aria-hidden="true">tune</span>
				<span>{title}</span>
			</button>
			<button
				type="button"
				className={`mobile-filter-backdrop ${open ? 'open' : ''}`}
				aria-label={t('common.close')}
				tabIndex={open ? 0 : -1}
				onClick={closePanel}
			/>
			<section
				ref={panelRef}
				id="mobile-filter-panel"
				className={`mobile-filter-panel ${open ? 'open' : ''}`}
				aria-hidden={!open}
			>
				<header className="mobile-filter-panel-header">
					<h2>{title}</h2>
					<button type="button" aria-label={t('common.close')} onClick={closePanel}>
						<span className="material-symbols-outlined" aria-hidden="true">close</span>
					</button>
				</header>
				<div className="mobile-filter-panel-body">{children}</div>
			</section>
		</>
	);
};

export default MobileFilterPanel;
