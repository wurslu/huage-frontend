// src/components/AttachmentList.tsx - 附件列表组件
import React, { useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	IconButton,
	Menu,
	MenuItem,
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
	Delete,
	Image as ImageIcon,
	InsertDriveFile,
	Visibility,
	OpenInNew,
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
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

	// 处理菜单点击
	const handleMenuClick = (
		event: React.MouseEvent<HTMLElement>,
		attachment: Attachment
	) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedAttachment(attachment);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedAttachment(null);
	};

	// 预览文件
	const handlePreview = () => {
		if (selectedAttachment?.is_image) {
			setPreviewDialogOpen(true);
		} else {
			// 对于非图片文件，直接打开
			window.open(selectedAttachment?.urls?.original, "_blank");
		}
		handleMenuClose();
	};

	// 下载文件
	const handleDownload = () => {
		if (selectedAttachment?.urls?.original) {
			const link = document.createElement("a");
			link.href = selectedAttachment.urls.original;
			link.download = selectedAttachment.original_filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			showSuccess("文件下载已开始");
		}
		handleMenuClose();
	};

	// 删除文件
	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const handleDeleteConfirm = async () => {
		if (selectedAttachment) {
			try {
				// 调用删除API
				const response = await fetch(
					`/api/attachments/${selectedAttachment.id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${localStorage.getItem("notes_token")}`,
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
			}
		}
		setDeleteDialogOpen(false);
		setSelectedAttachment(null);
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
										onClick={() => {
											setSelectedAttachment(attachment);
											setPreviewDialogOpen(true);
										}}
									/>
									<ImageListItemBar
										title={attachment.original_filename}
										subtitle={formatFileSize(attachment.file_size)}
										actionIcon={
											showActions && (
												<IconButton
													sx={{ color: "rgba(255, 255, 255, 0.54)" }}
													onClick={(e) => handleMenuClick(e, attachment)}
												>
													<MoreVert />
												</IconButton>
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
									onClick={() =>
										window.open(attachment.urls?.original, "_blank")
									}
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
											<Box sx={{ mt: 1 }}>
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation();
														handleMenuClick(e, attachment);
													}}
												>
													<MoreVert />
												</IconButton>
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
										color={getFileTypeColor(attachment.file_type) as any}
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
											onClick={() => {
												setSelectedAttachment(attachment);
												handlePreview();
											}}
										>
											<Visibility />
										</IconButton>
									</Tooltip>
									<Tooltip title="下载">
										<IconButton
											size="small"
											onClick={() => {
												setSelectedAttachment(attachment);
												handleDownload();
											}}
										>
											<Download />
										</IconButton>
									</Tooltip>
									<IconButton
										size="small"
										onClick={(e) => handleMenuClick(e, attachment)}
									>
										<MoreVert />
									</IconButton>
								</Box>
							)}
						</Box>
					</CardContent>
				</Card>
			))}
		</Stack>
	);

	if (attachments.length === 0) {
		return (
			<Box sx={{ textAlign: "center", py: 4 }}>
				<InsertDriveFile
					sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
				/>
				<Typography variant="h6" color="text.secondary" gutterBottom>
					暂无附件
				</Typography>
				<Typography variant="body2" color="text.secondary">
					上传文件后将在这里显示
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* 附件列表 */}
			{viewMode === "grid" ? renderGridView() : renderListView()}

			{/* 操作菜单 */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handlePreview}>
					<Visibility sx={{ mr: 1 }} />
					{selectedAttachment?.is_image ? "预览" : "打开"}
				</MenuItem>
				<MenuItem onClick={handleDownload}>
					<Download sx={{ mr: 1 }} />
					下载
				</MenuItem>
				<MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
					<Delete sx={{ mr: 1 }} />
					删除
				</MenuItem>
			</Menu>

			{/* 删除确认对话框 */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>确认删除附件</DialogTitle>
				<DialogContent>
					{selectedAttachment && (
						<Box>
							<Typography gutterBottom>
								确定要删除附件 "{selectedAttachment.original_filename}" 吗？
							</Typography>
							<Typography variant="body2" color="text.secondary">
								删除后将无法恢复，笔记中的相关引用也会失效。
							</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel}>取消</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
					>
						删除
					</Button>
				</DialogActions>
			</Dialog>

			{/* 图片预览对话框 */}
			<Dialog
				open={previewDialogOpen}
				onClose={() => setPreviewDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography variant="h6">
							{selectedAttachment?.original_filename}
						</Typography>
						<IconButton
							onClick={() =>
								window.open(selectedAttachment?.urls?.original, "_blank")
							}
						>
							<OpenInNew />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					{selectedAttachment?.is_image && (
						<Box sx={{ textAlign: "center" }}>
							<img
								src={selectedAttachment.urls?.original}
								alt={selectedAttachment.original_filename}
								style={{
									maxWidth: "100%",
									maxHeight: "70vh",
									objectFit: "contain",
								}}
							/>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setPreviewDialogOpen(false)}>关闭</Button>
					<Button
						onClick={() => {
							setPreviewDialogOpen(false);
							handleDownload();
						}}
						startIcon={<Download />}
					>
						下载
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AttachmentList;

// src/components/StorageUsage.tsx - 存储使用情况组件
import React from "react";
import {
	Box,
	Typography,
	LinearProgress,
	Card,
	CardContent,
	Stack,
	Chip,
} from "@mui/material";
import {
	Storage,
	Image as ImageIcon,
	InsertDriveFile,
	Folder,
} from "@mui/icons-material";

interface StorageUsageProps {
	usedSpace: number;
	maxSpace: number;
	fileCount: number;
	imageCount: number;
	documentCount: number;
}

const StorageUsage: React.FC<StorageUsageProps> = ({
	usedSpace,
	maxSpace,
	fileCount,
	imageCount,
	documentCount,
}) => {
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const usagePercentage = (usedSpace / maxSpace) * 100;
	const getUsageColor = (percentage: number) => {
		if (percentage >= 90) return "error";
		if (percentage >= 75) return "warning";
		return "primary";
	};

	return (
		<Card>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<Storage sx={{ mr: 1, color: "primary.main" }} />
					<Typography variant="h6">存储使用情况</Typography>
				</Box>

				{/* 存储进度条 */}
				<Box sx={{ mb: 3 }}>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
						<Typography variant="body2" color="text.secondary">
							已使用 {formatFileSize(usedSpace)} / {formatFileSize(maxSpace)}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{usagePercentage.toFixed(1)}%
						</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={usagePercentage}
						color={getUsageColor(usagePercentage)}
						sx={{ height: 8, borderRadius: 4 }}
					/>
				</Box>

				{/* 文件统计 */}
				<Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
					<Chip
						icon={<Folder />}
						label={`总文件 ${fileCount}`}
						variant="outlined"
						size="small"
					/>
					<Chip
						icon={<ImageIcon />}
						label={`图片 ${imageCount}`}
						variant="outlined"
						size="small"
						color="secondary"
					/>
					<Chip
						icon={<InsertDriveFile />}
						label={`文档 ${documentCount}`}
						variant="outlined"
						size="small"
						color="primary"
					/>
				</Stack>

				{/* 存储警告 */}
				{usagePercentage >= 90 && (
					<Box sx={{ mt: 2 }}>
						<Typography variant="body2" color="error.main">
							⚠️ 存储空间不足，建议清理不需要的文件
						</Typography>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};
