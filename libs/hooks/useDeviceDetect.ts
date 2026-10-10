import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 767;

const useDeviceDetect = (): string => {
	const [device, setDevice] = useState<string>('desktop');

	useEffect(() => {
		const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
		const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

		const updateDevice = () => {
			setDevice(mobileUserAgent || mediaQuery.matches ? 'mobile' : 'desktop');
		};

		updateDevice();
		mediaQuery.addEventListener('change', updateDevice);

		return () => mediaQuery.removeEventListener('change', updateDevice);
	}, []);

	return device;
};

export default useDeviceDetect;
