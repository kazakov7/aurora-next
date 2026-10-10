import Swal from 'sweetalert2';
import 'animate.css';
import { Messages } from './config';
import { translateActive, translateActiveError } from './i18n';

export const sweetErrorHandling = async (err: any) => {
	await Swal.fire({
		icon: 'error',
		text: translateActiveError(err, Messages.error1),
		showConfirmButton: false,
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		position: 'center',
		icon: 'success',
		title: msg.replace('Definer: ', ''),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: duration,
		timerProgressBar: true,
	});

	Toast.fire({
		icon: 'success',
		title: msg,
	}).then(() => {
		if (enable_forward) {
			window.location.reload();
		}
	});
};

export const sweetConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		await Swal.fire({
			icon: 'question',
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonColor: '#e92C28',
			cancelButtonColor: '#bdbdbd',
			confirmButtonText: translateActive('common.ok'),
			cancelButtonText: translateActive('common.cancel'),
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		await Swal.fire({
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			color: '#212121',
			confirmButtonColor: '#006194',
			cancelButtonColor: '#bdbdbd',
			confirmButtonText: translateActive('auth.login'),
			cancelButtonText: translateActive('common.cancel'),
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		icon: 'success',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	Swal.fire(text);
};

export const sweetLoginRequiredAlert = async (msg: string) => {
	await Swal.fire({
		icon: 'info',
		text: msg,
		color: '#212121',
		confirmButtonColor: '#006194',
		confirmButtonText: translateActive('common.ok'),
		allowOutsideClick: false,
		allowEscapeKey: false,
	});
};
