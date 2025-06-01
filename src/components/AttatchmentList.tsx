// src/components/AttatchmentList.tsx - 修复版本
import React, { useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	IconButton,
	Chip,
	Avatar,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Tooltip,
	ImageList,
	ImageListItem,
	ImageListItemBar,
} from "@mui/material";
import {
	MoreVert,
	Download,
	Image as ImageIcon,
	InsertDriveFile,
	Visibility,
} from "@mui/icons-material";
import { useNotification } from "../hooks/useNotification";

interface Attachment {
	id: number;
	filename: string;
	original_filename: string;
	file_size: number;
	file_type: string;
	is_image: boolean;
	created_at: string;
	urls?: {
		original: string;
		medium?: string;
		thumbnail?: string;
	};
}

interface AttachmentListProps {
	attachments: Attachment[];
	onDelete?: (attachmentId: number) => void;
	viewMode?: "list" | "grid";
	showActions?: boolean;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
	attachments,
	onDelete,
	viewMode = "list",
	showActions = true,
}) => {
	const { showSuccess, showError } = useNotification();
	const [selectedAttachment, setSelectedAttachment] =
		useState<Attachment | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

	// 格式化文件大小
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	// 格式化日期
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// 获取文件图标
	const getFileIcon = (fileType: string, isImage: boolean) => {
		if (isImage) {
			return <ImageIcon color="primary" />;
		}
		switch (fileType) {
			case "pdf":
				return <InsertDriveFile sx={{ color: "#f40f02" }} />;
			case "doc":
			case "docx":
				return <InsertDriveFile sx={{ color: "#2b579a" }} />;
			case "xls":
			case "xlsx":
				return <InsertDriveFile sx={{ color: "#217346" }} />;
			default:
				return <InsertDriveFile color="action" />;
		}
	};

	// 获取文件类型颜色
	const getFileTypeColor = (fileType: string) => {
		switch (fileType) {
			case "pdf":
				return "error";
			case "doc":
			case "docx":
				return "primary";
			case "xls":
			case "xlsx":
				return "success";
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
			case "webp":
				return "secondary";
			default:
				return "default";
		}
	};

	// 预览文件
	const handlePreview = (attachment: Attachment) => {
		if (attachment.is_image) {
			setSelectedAttachment(attachment);
			setPreviewDialogOpen(true);
		} else {
			// 对于非图片文件，直接在新窗口打开
			window.open(attachment.urls?.original, "_blank");
		}
	};

	// 下载文件
	const handleDownload = (attachment: Attachment) => {
		// 使用下载API
		const downloadUrl = `${attachment.urls?.original}/download`;
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = attachment.original_filename;
		// 设置授权头
		link.setAttribute("target", "_blank");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showSuccess("开始下载文件");
	};

	// 删除附件
	const handleDeleteClick = (attachment: Attachment) => {
		setSelectedAttachment(attachment);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!selectedAttachment) return;

		try {
			const token = localStorage.getItem("notes_token");
			const response = await fetch(
				`/api/attachments/${selectedAttachment.id}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error("删除失败");
			}

			showSuccess("附件删除成功");
			onDelete?.(selectedAttachment.id);
		} catch (error) {
			showError("删除失败");
			console.log(error);
		} finally {
			setDeleteDialogOpen(false);
			setSelectedAttachment(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setSelectedAttachment(null);
	};

	// 网格视图渲染
	const renderGridView = () => {
		const images = attachments.filter((att) => att.is_image);
		const documents = attachments.filter((att) => !att.is_image);

		return (
			<Box>
				{/* 图片网格 */}
				{images.length > 0 && (
					<Box sx={{ mb: 3 }}>
						<Typography variant="h6" gutterBottom>
							图片 ({images.length})
						</Typography>
						<ImageList variant="masonry" cols={3} gap={8}>
							{images.map((attachment) => (
								<ImageListItem key={attachment.id}>
									<img
										src={attachment.urls?.original}
										alt={attachment.original_filename}
										loading="lazy"
										style={{
											borderRadius: 8,
											cursor: "pointer",
										}}
										onClick={() => handlePreview(attachment)}
									/>
									<ImageListItemBar
										title={attachment.original_filename}
										subtitle={formatFileSize(attachment.file_size)}
										actionIcon={
											showActions && (
												<Box sx={{ display: "flex", gap: 0.5 }}>
													<Tooltip title="下载">
														<IconButton
															sx={{ color: "rgba(255, 255, 255, 0.54)" }}
															onClick={(e) => {
																e.stopPropagation();
																handleDownload(attachment);
															}}
														>
															<Download />
														</IconButton>
													</Tooltip>
													<Tooltip title="删除">
														<IconButton
															sx={{ color: "rgba(255, 255, 255, 0.54)" }}
															onClick={(e) => {
																e.stopPropagation();
																handleDeleteClick(attachment);
															}}
														>
															<MoreVert />
														</IconButton>
													</Tooltip>
												</Box>
											)
										}
									/>
								</ImageListItem>
							))}
						</ImageList>
					</Box>
				)}

				{/* 文档网格 */}
				{documents.length > 0 && (
					<Box>
						<Typography variant="h6" gutterBottom>
							文档 ({documents.length})
						</Typography>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
								gap: 2,
							}}
						>
							{documents.map((attachment) => (
								<Card
									key={attachment.id}
									sx={{
										cursor: "pointer",
										"&:hover": { elevation: 4 },
									}}
									onClick={() => handlePreview(attachment)}
								>
									<CardContent sx={{ textAlign: "center", p: 2 }}>
										<Box sx={{ mb: 2 }}>
											{getFileIcon(attachment.file_type, false)}
										</Box>
										<Typography
											variant="body2"
											sx={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{attachment.original_filename}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{formatFileSize(attachment.file_size)}
										</Typography>
										{showActions && (
											<Box
												sx={{
													mt: 1,
													display: "flex",
													justifyContent: "center",
													gap: 1,
												}}
											>
												<Tooltip title="下载">
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation();
															handleDownload(attachment);
														}}
													>
														<Download />
													</IconButton>
												</Tooltip>
												<Tooltip title="删除">
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteClick(attachment);
														}}
													>
														<MoreVert />
													</IconButton>
												</Tooltip>
											</Box>
										)}
									</CardContent>
								</Card>
							))}
						</Box>
					</Box>
				)}
			</Box>
		);
	};

	// 列表视图渲染
	const renderListView = () => (
		<Stack spacing={1}>
			{attachments.map((attachment) => (
				<Card key={attachment.id} variant="outlined">
					<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
							}}
						>
							{/* 文件图标或缩略图 */}
							{attachment.is_image ? (
								<Avatar
									src={attachment.urls?.original}
									variant="rounded"
									sx={{ width: 40, height: 40 }}
								>
									<ImageIcon />
								</Avatar>
							) : (
								<Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
									{getFileIcon(attachment.file_type, false)}
								</Avatar>
							)}

							{/* 文件信息 */}
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography
									variant="body1"
									sx={{
										fontWeight: 500,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{attachment.original_filename}
								</Typography>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mt: 0.5,
									}}
								>
									<Chip
										label={attachment.file_type.toUpperCase()}
										size="small"
										color={getFileTypeColor(attachment.file_type)}
									/>
									<Typography variant="caption" color="text.secondary">
										{formatFileSize(attachment.file_size)}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										•
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{formatDate(attachment.created_at)}
									</Typography>
								</Box>
							</Box>

							{/* 操作按钮 */}
							{showActions && (
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Tooltip title="预览">
										<IconButton
											size="small"
											onClick={() => handlePreview(attachment)}
										>
											<Visibility />
										</IconButton>
									</Tooltip>
									<Tooltip title="下载">
										<IconButton
											size="small"
											onClick={() => handleDownload(attachment)}
										>
											<Download />
										</IconButton>
									</Tooltip>
								</Box>
							)}
						</Box>
					</CardContent>
				</Card>
			))}
		</Stack>
	);

	return (
		<Box>
			{viewMode === "grid" ? renderGridView() : renderListView()}

			{/* 删除确认对话框 */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
			>
				<DialogTitle id="delete-dialog-title">确认删除</DialogTitle>
				<DialogContent>
					{selectedAttachment && (
						<Typography>
							确定要删除附件 "{selectedAttachment.original_filename}" 吗？
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel}>取消</Button>
					<Button onClick={handleDeleteConfirm} color="error">
						删除
					</Button>
				</DialogActions>
			</Dialog>

			{/* 图片预览对话框 */}
			<Dialog
				open={previewDialogOpen}
				onClose={() => setPreviewDialogOpen(false)}
				maxWidth="lg"
				fullWidth
			>
				<DialogTitle>图片预览</DialogTitle>
				<DialogContent>
					{selectedAttachment?.is_image && (
						<img
							src={selectedAttachment.urls?.original}
							alt={selectedAttachment.original_filename}
							style={{
								maxWidth: "100%",
								maxHeight: "80vh",
								objectFit: "contain",
							}}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setPreviewDialogOpen(false)}>关闭</Button>
					<Button
						onClick={() =>
							selectedAttachment && handleDownload(selectedAttachment)
						}
					>
						下载
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AttachmentList;
