import { useMemo } from 'react';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
// @ts-ignore
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { AUTH_TOKEN_ERRORS, clearAuthSession, getJwtToken } from '../libs/auth';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { getActiveLocale, translateActive, translateServerMessage } from '../libs/i18n';
import { Message } from '../libs/enums/common.enum';
import { socketVar } from './store';

/** Auth forms and like/follow/comment handlers show their own error messages **/
const SILENT_ERROR_OPERATIONS = [
	'Login',
	'Signup',
	'GoogleAuth',
	'KakaoAuth',
	'TelegramAuth',
	'ChangePassword',
	'LikeTargetProperty',
	'LikeTargetTour',
	'LikeTargetDestination',
	'LikeTargetArticle',
	'Subscribe',
	'Unsubscribe',
	'CreateComment',
	'CreateDestinationReview',
	'VerifyMemberSession',
];
/** Credential exchanges legitimately answer UNAUTHENTICATED without meaning the stored session expired **/
const AUTH_EXCHANGE_OPERATIONS = ['Login', 'Signup', 'GoogleAuth', 'KakaoAuth', 'TelegramAuth'];

let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers: Record<string, string> = {
		'apollo-require-preflight': 'true',
	};
	const token = getJwtToken();
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		socketVar(this.socket);
		this.socket.onopen = () => {
			console.log('WebSocket connected!');
		};
		this.socket.onerror = (error) => {
			console.log('WebSocket error:', error);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data as string);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	const graphqlUri = process.env.NEXT_PUBLIC_AURORA_GRAPHQL_URL || process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';

	if (typeof window === 'undefined') {
		return new HttpLink({
			uri: graphqlUri,
			headers: { 'apollo-require-preflight': 'true' },
		});
	}

	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: graphqlUri,
			headers: { 'apollo-require-preflight': 'true' },
		});

		const wsLink = new WebSocketLink({
			uri: process.env.NEXT_PUBLIC_AURORA_SOCKET_URL || process.env.REACT_APP_API_WS || 'ws://127.0.0.1:3007',
			options: {
				lazy: true,
				reconnect: false,
				timeout: 30000,
				connectionParams: () => ({ headers: getHeaders() }),
			},
			webSocketImpl: LoggingWebSocket,
		});

		const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
			if (graphQLErrors) {
				const isSilent = SILENT_ERROR_OPERATIONS.includes(operation.operationName);
				const hadToken = !!operation.getContext().headers?.Authorization;
				let sessionExpired = false;
				const isAuthExchange = AUTH_EXCHANGE_OPERATIONS.includes(operation.operationName);
				graphQLErrors.forEach(({ message, extensions }) => {
					console.log(`[GraphQL error]: ${message}`);
					const isAuthError = AUTH_TOKEN_ERRORS.includes(message) || extensions?.code === 'UNAUTHENTICATED';
					if (hadToken && !isAuthExchange && isAuthError) {
						sessionExpired = true;
						return;
					}
					if (!isSilent && !message.includes('input')) sweetErrorAlert(translateServerMessage(getActiveLocale(), message));
				});
				if (sessionExpired) {
					clearAuthSession();
					sweetErrorAlert(translateActive(Message.SESSION_EXPIRED));
				}
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(link),
		);

		return from([errorLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;
	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
