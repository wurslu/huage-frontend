import { useAppDispatch } from "../store/hook";
import { addNotification } from "@/store/slices/uiSlice";

export const useNotification = () => {
	const dispatch = useAppDispatch();

	const showNotification = (
		type: "success" | "error" | "info" | "warning",
		message: string
	) => {
		dispatch(addNotification({ type, message }));
	};

	const showSuccess = (message: string) => showNotification("success", message);
	const showError = (message: string) => showNotification("error", message);
	const showInfo = (message: string) => showNotification("info", message);
	const showWarning = (message: string) => showNotification("warning", message);

	return {
		showNotification,
		showSuccess,
		showError,
		showInfo,
		showWarning,
	};
};
