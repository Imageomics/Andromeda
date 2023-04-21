import { toast, Slide } from 'react-toastify';

export function showError(message: string) {
    toast.error(message, {
        autoClose: false,
        position: "top-center",
        transition: Slide
    });
}