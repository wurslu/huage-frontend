import React from "react";
import { Alert, Snackbar, Stack } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { removeNotification } from "@/store/slices/uiSlice";

const NotificationContainer: React.FC = () => {
	const { notifications } = useAppSelector((state) => state.ui);
	const dispatch = useAppDispatch();

	const handleClose = (id: string) => {
		dispatch(removeNotification(id));
	};

	return (
		<Stack
			spacing={1}
			sx={{ position: "fixed", top: 16, right: 16, zIndex: 2000 }}
		>
			{notifications.map((notification) => (
				<Snackbar
					key={notification.id}
					open={true}
					autoHideDuration={5000}
					onClose={() => handleClose(notification.id)}
				>
					<Alert
						onClose={() => handleClose(notification.id)}
						severity={notification.type}
						variant="filled"
						sx={{ minWidth: 300 }}
					>
						{notification.message}
					</Alert>
				</Snackbar>
			))}
		</Stack>
	);
};

export default NotificationContainer;
