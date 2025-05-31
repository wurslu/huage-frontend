import React, { useState } from "react";
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
} from "@mui/material";
import {
	Close,
	ContentCopy,
	Share,
	Lock,
	AccessTime,
	Link as LinkIcon,
} from "@mui/icons-material";
import { useCreateShareLinkMutation } from "../store/api/notesApi";
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
	const [createShareLink, { isLoading }] = useCreateShareLinkMutation();

	const [shareData, setShareData] = useState<{
		shareCode: string;
		shareUrl: string;
		password?: string;
		expireTime?: string;
	} | null>(null);

	const [formData, setFormData] = useState({
		password: "",
		usePassword: false,
		expireTime: "",
		useExpiration: false,
	});

	const handleCreateShareLink = async () => {
		if (!noteId) return;

		try {
			const requestData: any = {};

			if (formData.usePassword && formData.password) {
				requestData.password = formData.password;
			}

			if (formData.useExpiration && formData.expireTime) {
				requestData.expire_time = new Date(formData.expireTime).toISOString();
			}

			const result = await createShareLink({
				noteId,
				...requestData,
			}).unwrap();

			setShareData(result.data);
			showSuccess("分享链接创建成功！");
		} catch (error: any) {
			console.error("Create share link error:", error);
			const message = error.data?.message || "创建分享链接失败";
			showError(message);
		}
	};

	const handleCopyLink = async () => {
		if (shareData?.shareUrl) {
			try {
				await navigator.clipboard.writeText(shareData.shareUrl);
				showSuccess("链接已复制到剪贴板！");
			} catch (e) {
				showError("复制失败，请手动复制链接");
				console.log(e);
			}
		}
	};

	const handleClose = () => {
		setShareData(null);
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

				{shareData ? (
					// 显示分享结果
					<Box>
						<Alert severity="success" sx={{ mb: 3 }}>
							分享链接创建成功！请复制链接分享给他人。
						</Alert>

						<Box sx={{ mb: 3 }}>
							<Typography variant="subtitle2" gutterBottom>
								分享链接
							</Typography>
							<TextField
								fullWidth
								value={shareData.shareUrl}
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
								label={shareData.shareCode}
								variant="outlined"
								icon={<LinkIcon />}
								sx={{ fontFamily: "monospace" }}
							/>
						</Box>

						{shareData.password && (
							<Box sx={{ mb: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									访问密码
								</Typography>
								<Chip
									label={shareData.password}
									variant="outlined"
									icon={<Lock />}
									color="warning"
									sx={{ fontFamily: "monospace" }}
								/>
							</Box>
						)}

						{shareData.expireTime && (
							<Box sx={{ mb: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									过期时间
								</Typography>
								<Chip
									label={formatExpireTime(shareData.expireTime)}
									variant="outlined"
									icon={<AccessTime />}
									color="info"
								/>
							</Box>
						)}
					</Box>
				) : (
					// 分享设置表单
					<Box>
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
								/>
							)}
						</Box>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 3 }}>
				<Button onClick={handleClose} variant="outlined">
					{shareData ? "关闭" : "取消"}
				</Button>

				{shareData ? (
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
						disabled={isLoading}
						variant="contained"
						startIcon={<Share />}
					>
						{isLoading ? "创建中..." : "创建分享链接"}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default ShareDialog;
