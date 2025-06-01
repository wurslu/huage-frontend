import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Box,
	Typography,
	IconButton,
	Switch,
	FormControlLabel,
	InputAdornment,
	Chip,
	Alert,
	Divider,
	CircularProgress,
} from "@mui/material";
import {
	Close,
	ContentCopy,
	Share,
	Lock,
	AccessTime,
	Link as LinkIcon,
} from "@mui/icons-material";
import {
	useCreateShareLinkMutation,
	useGetShareInfoQuery,
	useDeleteShareLinkMutation,
} from "../store/api/notesApi";
import { useNotification } from "../hooks/useNotification";

interface ShareDialogProps {
	open: boolean;
	onClose: () => void;
	noteId: number | null;
	noteTitle?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
	open,
	onClose,
	noteId,
	noteTitle,
}) => {
	const { showSuccess, showError } = useNotification();
	const [createShareLink, { isLoading: isCreating }] =
		useCreateShareLinkMutation();
	const [deleteShareLink, { isLoading: isDeleting }] =
		useDeleteShareLinkMutation();

	const {
		data: shareInfoData,
		refetch: refetchShareInfo,
		isLoading: isLoadingShareInfo,
		error: shareInfoError,
	} = useGetShareInfoQuery(noteId || 0, {
		skip: !noteId || !open,
		refetchOnMountOrArgChange: true,
	});

	const [formData, setFormData] = useState({
		password: "",
		usePassword: false,
		expireTime: "",
		useExpiration: false,
	});

	useEffect(() => {
		if (open && noteId) {
			setFormData({
				password: "",
				usePassword: false,
				expireTime: "",
				useExpiration: false,
			});
			refetchShareInfo();
		}
	}, [open, noteId, refetchShareInfo]);

	const existingShare = shareInfoData?.data;

	const handleCreateShareLink = async () => {
		if (!noteId) return;

		try {
			const requestData: any = {};

			if (formData.usePassword && formData.password.trim()) {
				requestData.password = formData.password.trim();
			}

			if (formData.useExpiration && formData.expireTime) {
				requestData.expire_time = new Date(formData.expireTime).toISOString();
			}

			console.log("Creating share link with data:", requestData);

			const result = await createShareLink({
				noteId,
				...requestData,
			}).unwrap();

			console.log("Share link created:", result);
			showSuccess("分享链接创建成功！");

			await refetchShareInfo();
		} catch (error: any) {
			console.error("Create share link error:", error);
			const message = error.data?.message || "创建分享链接失败";
			showError(message);
		}
	};

	const handleDeleteShareLink = async () => {
		if (!noteId) return;

		try {
			await deleteShareLink(noteId).unwrap();
			showSuccess("分享链接删除成功！");

			// 删除成功后，手动触发重新获取数据以清理缓存
			await refetchShareInfo();

			// 然后关闭对话框
			onClose();
		} catch (error: any) {
			console.error("Delete share link error:", error);
			const message = error.data?.message || "删除分享链接失败";
			showError(message);
		}
	};

	const handleCopyLink = async () => {
		if (existingShare?.share_url) {
			try {
				await navigator.clipboard.writeText(existingShare.share_url);
				showSuccess("链接已复制到剪贴板！");
			} catch (e) {
				showError("复制失败，请手动复制链接");
				console.log(e);
			}
		}
	};

	const handleClose = () => {
		setFormData({
			password: "",
			usePassword: false,
			expireTime: "",
			useExpiration: false,
		});
		onClose();
	};

	const formatExpireTime = (expireTime: string) => {
		const date = new Date(expireTime);
		return date.toLocaleString("zh-CN");
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Share color="primary" />
						<Typography variant="h6">分享笔记</Typography>
					</Box>
					<IconButton onClick={handleClose}>
						<Close />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				{noteTitle && (
					<Box sx={{ mb: 3 }}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							分享笔记
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 500 }}>
							{noteTitle}
						</Typography>
					</Box>
				)}

				{isLoadingShareInfo && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
						<CircularProgress />
					</Box>
				)}

				{/* 如果有现有的分享链接 */}
				{!isLoadingShareInfo && existingShare && (
					<Box>
						<Alert severity="success" sx={{ mb: 3 }}>
							笔记已分享！你可以复制链接分享给他人，或删除分享链接。
						</Alert>

						<Box sx={{ mb: 3 }}>
							<Typography variant="subtitle2" gutterBottom>
								分享链接
							</Typography>
							<TextField
								fullWidth
								value={existingShare.share_url}
								InputProps={{
									readOnly: true,
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={handleCopyLink} edge="end">
												<ContentCopy />
											</IconButton>
										</InputAdornment>
									),
								}}
								sx={{ mb: 2 }}
							/>
						</Box>

						<Box sx={{ mb: 2 }}>
							<Typography variant="subtitle2" gutterBottom>
								分享码
							</Typography>
							<Chip
								label={existingShare.share_code}
								variant="outlined"
								icon={<LinkIcon />}
								sx={{ fontFamily: "monospace" }}
							/>
						</Box>

						{existingShare.password && (
							<Box sx={{ mb: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									访问密码
								</Typography>
								<Chip
									label={existingShare.password}
									variant="outlined"
									icon={<Lock />}
									color="warning"
									sx={{ fontFamily: "monospace" }}
								/>
							</Box>
						)}

						{existingShare.expire_time && (
							<Box sx={{ mb: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									过期时间
								</Typography>
								<Chip
									label={formatExpireTime(existingShare.expire_time)}
									variant="outlined"
									icon={<AccessTime />}
									color="info"
								/>
							</Box>
						)}

						<Divider sx={{ my: 2 }} />

						<Box sx={{ display: "flex", gap: 2 }}>
							<Button
								onClick={handleDeleteShareLink}
								disabled={isDeleting}
								color="error"
								variant="outlined"
								startIcon={
									isDeleting ? <CircularProgress size={16} /> : <Close />
								}
							>
								{isDeleting ? "删除中..." : "删除分享"}
							</Button>
						</Box>
					</Box>
				)}

				{/* 如果没有分享链接或有错误 */}
				{!isLoadingShareInfo && (!existingShare || shareInfoError) && (
					<Box>
						{shareInfoError && (
							<Alert severity="info" sx={{ mb: 3 }}>
								当前笔记还没有分享链接，可以创建一个新的分享链接。
							</Alert>
						)}

						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							创建分享链接，让他人可以查看这篇笔记。你可以设置访问密码和过期时间来保护分享内容。
						</Typography>

						<Box sx={{ mb: 3 }}>
							<FormControlLabel
								control={
									<Switch
										checked={formData.usePassword}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												usePassword: e.target.checked,
											}))
										}
									/>
								}
								label="设置访问密码"
							/>

							{formData.usePassword && (
								<TextField
									fullWidth
									label="访问密码"
									type="password"
									value={formData.password}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											password: e.target.value,
										}))
									}
									placeholder="请输入访问密码"
									sx={{ mt: 2 }}
									helperText="设置密码后，访问者需要输入密码才能查看笔记"
								/>
							)}
						</Box>

						<Divider sx={{ my: 2 }} />

						<Box>
							<FormControlLabel
								control={
									<Switch
										checked={formData.useExpiration}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												useExpiration: e.target.checked,
											}))
										}
									/>
								}
								label="设置过期时间"
							/>

							{formData.useExpiration && (
								<TextField
									fullWidth
									label="过期时间"
									type="datetime-local"
									value={formData.expireTime}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											expireTime: e.target.value,
										}))
									}
									sx={{ mt: 2 }}
									helperText="链接将在指定时间后失效"
									InputLabelProps={{
										shrink: true,
									}}
									inputProps={{
										min: new Date().toISOString().slice(0, 16),
									}}
								/>
							)}
						</Box>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 3 }}>
				<Button onClick={handleClose} variant="outlined">
					关闭
				</Button>

				{existingShare ? (
					<Button
						onClick={handleCopyLink}
						variant="contained"
						startIcon={<ContentCopy />}
					>
						复制链接
					</Button>
				) : (
					<Button
						onClick={handleCreateShareLink}
						disabled={isCreating}
						variant="contained"
						startIcon={isCreating ? <CircularProgress size={16} /> : <Share />}
					>
						{isCreating ? "创建中..." : "创建分享链接"}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default ShareDialog;
