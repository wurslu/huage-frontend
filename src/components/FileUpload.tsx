// src/components/FileUpload.tsx - 文件上传组件
import React, { useState, useRef } from "react";
import {
	Box,
	Button,
	Typography,
	LinearProgress,
	Alert,
	IconButton,
	Chip,
	Card,
	CardContent,
	Stack,
	Tooltip,
} from "@mui/material";
import {
	CloudUpload,
	AttachFile,
	Image as ImageIcon,
	Delete,
	InsertDriveFile,
} from "@mui/icons-material";
import { useNotification } from "../hooks/useNotification";

interface FileUploadProps {
	noteId?: number;
	onUploadSuccess?: (attachment: Attachment) => void;
	onUploadError?: (error: string) => void;
	maxFileSize?: number; // in MB
	acceptedTypes?: string[];
	multiple?: boolean;
}

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

interface UploadProgress {
	file: File;
	progress: number;
	status: "uploading" | "success" | "error";
	error?: string;
	attachment?: Attachment;
}

const FileUpload: React.FC<FileUploadProps> = ({
	noteId,
	onUploadSuccess,
	onUploadError,
	maxFileSize = 50, // 50MB default
	acceptedTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	],
	multiple = true,
}) => {
	const { showSuccess, showError } = useNotification();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);

	// 格式化文件大小
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
				return <AttachFile color="action" />;
		}
	};

	// 验证文件
	const validateFile = (file: File): string | null => {
		// 检查文件类型
		if (!acceptedTypes.includes(file.type)) {
			return `不支持的文件类型: ${file.type}`;
		}

		// 检查文件大小
		const maxBytes = maxFileSize * 1024 * 1024;
		if (file.size > maxBytes) {
			return `文件太大，最大支持 ${maxFileSize}MB`;
		}

		return null;
	};

	// 上传文件
	// 上传文件
	const uploadFile = async (file: File): Promise<Attachment> => {
		if (!noteId) {
			throw new Error("缺少笔记ID");
		}

		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(`/api/notes/${noteId}/attachments`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("notes_token")}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "上传失败");
		}

		const result = await response.json();
		return result.data; // 确保返回的是 Attachment 类型
	};

	// 处理文件选择
	const handleFiles = (files: FileList | File[]) => {
		const fileArray = Array.from(files);

		fileArray.forEach((file) => {
			const validationError = validateFile(file);
			if (validationError) {
				showError(validationError);
				return;
			}

			// 添加到上传队列
			const uploadItem: UploadProgress = {
				file,
				progress: 0,
				status: "uploading",
			};

			setUploadQueue((prev) => [...prev, uploadItem]);

			// 开始上传
			uploadFile(file)
				.then((attachment) => {
					setUploadQueue((prev) =>
						prev.map((item) =>
							item.file === file
								? { ...item, progress: 100, status: "success", attachment }
								: item
						)
					);
					showSuccess(`${file.name} 上传成功`);
					onUploadSuccess?.(attachment);
				})
				.catch((error) => {
					setUploadQueue((prev) =>
						prev.map((item) =>
							item.file === file
								? { ...item, status: "error", error: error.message }
								: item
						)
					);
					showError(`${file.name} 上传失败: ${error.message}`);
					onUploadError?.(error.message);
				});
		});
	};

	// 拖拽处理
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFiles(files);
		}
	};

	// 点击上传
	const handleClick = () => {
		fileInputRef.current?.click();
	};

	// 文件输入改变
	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			handleFiles(files);
		}
		// 清空input值，允许重复选择同一文件
		e.target.value = "";
	};

	// 移除上传项
	const removeUploadItem = (file: File) => {
		setUploadQueue((prev) => prev.filter((item) => item.file !== file));
	};

	// 清除已完成的上传
	const clearCompleted = () => {
		setUploadQueue((prev) =>
			prev.filter((item) => item.status === "uploading")
		);
	};

	const hasCompletedUploads = uploadQueue.some(
		(item) => item.status === "success" || item.status === "error"
	);

	return (
		<Box>
			{/* 拖拽上传区域 */}
			<Box
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
				sx={{
					border: `2px dashed ${isDragging ? "primary.main" : "grey.300"}`,
					borderRadius: 2,
					p: 4,
					textAlign: "center",
					cursor: "pointer",
					backgroundColor: isDragging ? "action.hover" : "background.paper",
					transition: "all 0.2s ease-in-out",
					"&:hover": {
						borderColor: "primary.main",
						backgroundColor: "action.hover",
					},
				}}
			>
				<CloudUpload
					sx={{
						fontSize: 48,
						color: isDragging ? "primary.main" : "grey.400",
						mb: 2,
					}}
				/>
				<Typography variant="h6" gutterBottom>
					{isDragging ? "释放文件开始上传" : "拖拽文件到这里，或点击选择文件"}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					支持图片、PDF、Word、Excel文档，最大 {maxFileSize}MB
				</Typography>
				<Button variant="outlined" startIcon={<AttachFile />}>
					选择文件
				</Button>
			</Box>

			{/* 隐藏的文件输入 */}
			<input
				ref={fileInputRef}
				type="file"
				multiple={multiple}
				accept={acceptedTypes.join(",")}
				onChange={handleFileInputChange}
				style={{ display: "none" }}
			/>

			{/* 上传队列 */}
			{uploadQueue.length > 0 && (
				<Box sx={{ mt: 3 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography variant="h6">
							上传队列 ({uploadQueue.length})
						</Typography>
						{hasCompletedUploads && (
							<Button size="small" onClick={clearCompleted}>
								清除已完成
							</Button>
						)}
					</Box>

					<Stack spacing={2}>
						{uploadQueue.map((item, index) => (
							<Card key={index} variant="outlined">
								<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
										}}
									>
										{/* 文件图标 */}
										<Box sx={{ display: "flex", alignItems: "center" }}>
											{getFileIcon(
												item.file.type,
												item.file.type.startsWith("image/")
											)}
										</Box>

										{/* 文件信息 */}
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 500,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{item.file.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{formatFileSize(item.file.size)}
											</Typography>
										</Box>

										{/* 状态 */}
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											{item.status === "uploading" && (
												<Chip label="上传中" size="small" color="primary" />
											)}
											{item.status === "success" && (
												<Chip label="已完成" size="small" color="success" />
											)}
											{item.status === "error" && (
												<Chip label="失败" size="small" color="error" />
											)}

											{/* 删除按钮 */}
											<Tooltip title="移除">
												<IconButton
													size="small"
													onClick={() => removeUploadItem(item.file)}
												>
													<Delete fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									</Box>

									{/* 进度条 */}
									{item.status === "uploading" && (
										<LinearProgress
											variant="indeterminate"
											sx={{ mt: 1, borderRadius: 1 }}
										/>
									)}

									{/* 错误信息 */}
									{item.status === "error" && item.error && (
										<Alert severity="error" sx={{ mt: 1 }}>
											{item.error}
										</Alert>
									)}
								</CardContent>
							</Card>
						))}
					</Stack>
				</Box>
			)}
		</Box>
	);
};

export default FileUpload;
