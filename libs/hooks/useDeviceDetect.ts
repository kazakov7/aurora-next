import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 767;

let hydratedClientDevice: 'mobile' | 'desktop' | null = null;

const detectClientDevice = (): 'mobile' | 'desktop' => {
	if (typeof window === 'undefined') return 'desktop';
	const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
	const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
	const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
	return mobileUserAgent || mediaQuery.matches ? 'mobile' : 'desktop';
};

const useDeviceDetect = (): string => {
	const [device, setDevice] = useState<string>(() => hydratedClientDevice ?? 'desktop');

	useEffect(() => {
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

		const updateDevice = () => {
			const nextDevice = detectClientDevice();
			hydratedClientDevice = nextDevice;
			setDevice(nextDevice);
		};

		updateDevice();
		mediaQuery.addEventListener('change', updateDevice);

		return () => mediaQuery.removeEventListener('change', updateDevice);
	}, []);

	return device;
};

export default useDeviceDetect;

