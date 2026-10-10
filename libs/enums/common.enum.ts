export enum Direction {
	ASC = 'ASC',
	DESC = 'DESC',
}

/** Values are dictionary keys (libs/i18n/messages); render them with `t(Message.X)` **/
export enum Message {
	SOMETHING_WENT_WRONG = 'errors.somethingWentWrong',
	NO_DATA_FOUND = 'errors.noDataFound',
	CREATE_FAILED = 'errors.createFailed',
	UPDATE_FAILED = 'errors.updateFailed',
	REMOVE_FAILED = 'errors.removeFailed',
	NOT_AUTHENTICATED = 'errors.notAuthenticated',
	SESSION_EXPIRED = 'errors.sessionExpired',
	INSERT_ALL_INPUTS = 'errors.insertAllInputs',
}
