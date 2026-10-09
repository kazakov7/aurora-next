import { useEffect, useState } from 'react';
import { ACCESS_TOKEN_KEY, clearAuthSession, getJwtToken, updateUserInfo } from '../auth';

/** Restores userVar from the stored JWT and keeps it in sync across browser tabs **/
const useAuthSession = (): boolean => {
	const [authChecked, setAuthChecked] = useState<boolean>(false);

	/** LIFECYCLES **/
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt && !updateUserInfo(jwt)) clearAuthSession();
		setAuthChecked(true);

		const handleStorage = (event: StorageEvent) => {
			if (event.key !== ACCESS_TOKEN_KEY && event.key !== null) return;
			const token = getJwtToken();
			if (!token || !updateUserInfo(token)) clearAuthSession();
		};

		window.addEventListener('storage', handleStorage);
		return () => {
			window.removeEventListener('storage', handleStorage);
		};
	}, []);

	return authChecked;
};

export default useAuthSession;
