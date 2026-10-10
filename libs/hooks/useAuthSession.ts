import { useEffect, useState } from 'react';
import { ApolloError, useApolloClient } from '@apollo/client';
import { VERIFY_MEMBER_SESSION } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { ACCESS_TOKEN_KEY, clearAuthSession, getJwtToken, setJwtToken, updateUserFromMember, updateUserInfo } from '../auth';
import { MemberStatus } from '../enums/member.enum';
import { Member } from '../types/member/member';

/**
 * Restores userVar from the stored JWT, then revalidates it with the server.
 * getMember is optional-auth: the server returns a fresh accessToken for an own-profile read
 * only when it verified the bearer token against the current ACTIVE member. A missing
 * accessToken therefore means the token was rejected, even though the public lookup succeeded.
 **/
const useAuthSession = (): boolean => {
	const [authChecked, setAuthChecked] = useState<boolean>(false);
	const apolloClient = useApolloClient();

	/** LIFECYCLES **/
	useEffect(() => {
		let active = true;

		const restoreSession = async () => {
			const jwt = getJwtToken();
			if (!jwt || !updateUserInfo(jwt)) {
				clearAuthSession();
				return;
			}

			const memberId = userVar()._id;
			if (!memberId) {
				clearAuthSession();
				return;
			}

			try {
				const { data } = await apolloClient.query<{ getMember: Member }>({
					query: VERIFY_MEMBER_SESSION,
					variables: { input: memberId },
					fetchPolicy: 'no-cache',
				});

				// Logout, login or account switch happened while the request was in flight
				if (!active || getJwtToken() !== jwt) return;

				const member = data?.getMember;
				if (member?.accessToken && member._id === memberId && member.memberStatus === MemberStatus.ACTIVE) {
					setJwtToken(member.accessToken);
					updateUserFromMember(member);
				} else {
					clearAuthSession();
				}
			} catch (err) {
				if (!active || getJwtToken() !== jwt) return;
				const apolloError = err as ApolloError;
				// Server answered with a GraphQL error (e.g. member deleted): the session is not valid.
				// Pure network failures keep the JWT session; protected APIs still enforce auth server-side.
				if (apolloError?.graphQLErrors?.length) clearAuthSession();
				else console.warn('Session verification skipped: server unreachable');
			}
		};

		void restoreSession().finally(() => {
			if (active) setAuthChecked(true);
		});

		const handleStorage = (event: StorageEvent) => {
			if (event.key !== ACCESS_TOKEN_KEY && event.key !== null) return;
			const token = getJwtToken();
			if (!token || !updateUserInfo(token)) clearAuthSession();
		};

		window.addEventListener('storage', handleStorage);
		return () => {
			active = false;
			window.removeEventListener('storage', handleStorage);
		};
	}, [apolloClient]);

	return authChecked;
};

export default useAuthSession;
