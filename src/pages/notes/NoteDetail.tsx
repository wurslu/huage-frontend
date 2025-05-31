import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Box,
	Container,
	Typography,
	Chip,
	IconButton,
	Paper,
	Tooltip,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Skeleton,
	Divider,
} from "@mui/material";
import {
	ArrowBack,
	Edit,
	Delete,
	Share,
	Public,
	Lock,
	Visibility,
	AccessTime,
	Category as CategoryIcon,
	Label as LabelIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
	useGetNoteByIdQuery,
	useDeleteNoteMutation,
} from "../../store/api/notesApi";
import { useNotification } from "../../hooks/useNotification";
import ShareDialog from "../../components/ShareDialog";
import "highlight.js/styles/github.css"; // 代码高亮样式

const NoteDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { showSuccess, showError } = useNotification();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

	// 获取单个笔记数据
	const { data, isLoading, error } = useGetNoteByIdQuery(Number(id) || 0, {
		skip: !id || isNaN(Number(id)),
	});

	const note = data?.data;

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleBack = () => {
		navigate(-1);
	};

	const handleEdit = () => {
		// 导航到编辑页面或打开编辑对话框
		navigate(`/dashboard?edit=${note?.id}`);
	};

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!note) return;

		try {
			await deleteNote(note.id).unwrap();
			showSuccess("笔记删除成功！");
			navigate("/dashboard");
		} catch (error: any) {
			console.error("Delete note error:", error);
			const message = error.data?.message || "删除失败";
			showError(message);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
	};

	const handleShare = () => {
		setShareDialogOpen(true);
	};

	// 渲染内容
	const renderContent = (content: string, contentType: string) => {
		if (contentType === "html") {
			return (
				<Box
					dangerouslySetInnerHTML={{ __html: content }}
					sx={{
						"& img": { maxWidth: "100%", height: "auto" },
						"& pre": {
							backgroundColor: "grey.100",
							padding: 2,
							borderRadius: 1,
							overflow: "auto",
						},
						"& code": {
							backgroundColor: "grey.100",
							padding: "2px 4px",
							borderRadius: "4px",
							fontFamily: "monospace",
						},
						"& blockquote": {
							borderLeft: "4px solid #ccc",
							paddingLeft: 2,
							margin: "16px 0",
							color: "text.secondary",
						},
					}}
				/>
			);
		}

		// Markdown 渲染
		return (
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeHighlight]}
				components={{
					// 自定义组件样式
					h1: ({ children }) => (
						<Typography
							variant="h3"
							component="h1"
							gutterBottom
							sx={{ mt: 3, mb: 2, fontWeight: 600 }}
						>
							{children}
						</Typography>
					),
					h2: ({ children }) => (
						<Typography
							variant="h4"
							component="h2"
							gutterBottom
							sx={{ mt: 3, mb: 2, fontWeight: 600 }}
						>
							{children}
						</Typography>
					),
					h3: ({ children }) => (
						<Typography
							variant="h5"
							component="h3"
							gutterBottom
							sx={{ mt: 2, mb: 1, fontWeight: 600 }}
						>
							{children}
						</Typography>
					),
					h4: ({ children }) => (
						<Typography
							variant="h6"
							component="h4"
							gutterBottom
							sx={{ mt: 2, mb: 1, fontWeight: 600 }}
						>
							{children}
						</Typography>
					),
					p: ({ children }) => (
						<Typography
							variant="body1"
							paragraph
							sx={{ lineHeight: 1.8, mb: 2 }}
						>
							{children}
						</Typography>
					),
					blockquote: ({ children }) => (
						<Box
							sx={{
								borderLeft: "4px solid #1976d2",
								paddingLeft: 2,
								margin: "16px 0",
								backgroundColor: "grey.50",
								padding: 2,
								borderRadius: 1,
							}}
						>
							{children}
						</Box>
					),
					code: ({ children, className, ...props }: any) => {
						const match = /language-(\w+)/.exec(className || "");
						const isInline = !match;

						if (isInline) {
							return (
								<Box
									component="code"
									sx={{
										backgroundColor: "grey.100",
										padding: "2px 6px",
										borderRadius: "4px",
										fontFamily: "Monaco, Consolas, 'Courier New', monospace",
										fontSize: "0.9em",
									}}
									{...props}
								>
									{children}
								</Box>
							);
						}
						return (
							<Box
								component="pre"
								sx={{
									backgroundColor: "grey.900",
									color: "grey.100",
									padding: 2,
									borderRadius: 1,
									overflow: "auto",
									my: 2,
									"& code": {
										backgroundColor: "transparent",
										padding: 0,
										color: "inherit",
									},
								}}
							>
								<code className={className} {...props}>
									{children}
								</code>
							</Box>
						);
					},
					ul: ({ children }) => (
						<Box component="ul" sx={{ mb: 2, pl: 3 }}>
							{children}
						</Box>
					),
					ol: ({ children }) => (
						<Box component="ol" sx={{ mb: 2, pl: 3 }}>
							{children}
						</Box>
					),
					li: ({ children }) => (
						<Typography component="li" sx={{ mb: 0.5, lineHeight: 1.6 }}>
							{children}
						</Typography>
					),
					table: ({ children }) => (
						<Box sx={{ overflow: "auto", mb: 2 }}>
							<Box
								component="table"
								sx={{
									width: "100%",
									borderCollapse: "collapse",
									border: "1px solid",
									borderColor: "divider",
								}}
							>
								{children}
							</Box>
						</Box>
					),
					th: ({ children }) => (
						<Box
							component="th"
							sx={{
								border: "1px solid",
								borderColor: "divider",
								padding: 1,
								backgroundColor: "grey.100",
								fontWeight: 600,
							}}
						>
							{children}
						</Box>
					),
					td: ({ children }) => (
						<Box
							component="td"
							sx={{
								border: "1px solid",
								borderColor: "divider",
								padding: 1,
							}}
						>
							{children}
						</Box>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		);
	};

	if (isLoading) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Skeleton variant="text" width="60%" height={48} />
				<Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
				<Skeleton variant="rectangular" width="100%" height={400} />
			</Container>
		);
	}

	if (error || !note) {
		return (
			<Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
				<Typography variant="h6" color="error" gutterBottom>
					笔记加载失败或不存在
				</Typography>
				<Button onClick={handleBack} variant="outlined">
					返回
				</Button>
			</Container>
		);
	}

	return (
		<Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
			{/* 顶部工具栏 */}
			<Paper
				elevation={1}
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 100,
					borderRadius: 0,
					px: 3,
					py: 2,
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						maxWidth: "md",
						mx: "auto",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<IconButton onClick={handleBack} color="primary">
							<ArrowBack />
						</IconButton>
						<Typography variant="h6" sx={{ fontWeight: 600 }}>
							{note.title}
						</Typography>
					</Box>

					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Tooltip title="分享">
							<IconButton onClick={handleShare} color="info">
								<Share />
							</IconButton>
						</Tooltip>
						<Tooltip title="编辑">
							<IconButton onClick={handleEdit} color="primary">
								<Edit />
							</IconButton>
						</Tooltip>
						<Tooltip title="删除">
							<IconButton onClick={handleDeleteClick} color="error">
								<Delete />
							</IconButton>
						</Tooltip>
					</Box>
				</Box>
			</Paper>

			{/* 笔记内容 */}
			<Container maxWidth="md" sx={{ py: 4 }}>
				{/* 笔记元信息 */}
				<Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: "grey.50" }}>
					<Typography
						variant="h4"
						component="h1"
						gutterBottom
						sx={{ fontWeight: 600, mb: 3 }}
					>
						{note.title}
					</Typography>

					{/* 元信息行 */}
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: 3,
							alignItems: "center",
							mb: 2,
							color: "text.secondary",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<AccessTime sx={{ fontSize: 18 }} />
							<Typography variant="body2">
								更新于 {formatDate(note.updated_at)}
							</Typography>
						</Box>

						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<Tooltip title={note.is_public ? "公开笔记" : "私人笔记"}>
								{note.is_public ? (
									<Public sx={{ fontSize: 18, color: "success.main" }} />
								) : (
									<Lock sx={{ fontSize: 18 }} />
								)}
							</Tooltip>
							<Typography variant="body2">
								{note.is_public ? "公开" : "私人"}
							</Typography>
						</Box>

						{note.view_count > 0 && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<Visibility sx={{ fontSize: 18 }} />
								<Typography variant="body2">
									{note.view_count} 次浏览
								</Typography>
							</Box>
						)}

						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<Typography variant="body2">
								{note.content_type === "markdown" ? "Markdown" : "HTML"}
							</Typography>
						</Box>
					</Box>

					{/* 分类和标签 */}
					{(note.category || (note.tags && note.tags.length > 0)) && (
						<>
							<Divider sx={{ my: 2 }} />
							<Box
								sx={{
									display: "flex",
									flexWrap: "wrap",
									gap: 2,
									alignItems: "center",
								}}
							>
								{/* 分类 */}
								{note.category && (
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<CategoryIcon
											sx={{ fontSize: 16, color: "text.secondary" }}
										/>
										<Chip
											size="small"
											label={note.category.name}
											variant="outlined"
											color="primary"
										/>
									</Box>
								)}

								{/* 标签 */}
								{note.tags && note.tags.length > 0 && (
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											flexWrap: "wrap",
										}}
									>
										<LabelIcon sx={{ fontSize: 16, color: "text.secondary" }} />
										{note.tags.map((tag) => (
											<Chip
												key={tag.id}
												size="small"
												label={tag.name}
												sx={{
													backgroundColor: tag.color + "20",
													color: tag.color,
													"& .MuiChip-label": {
														fontWeight: 500,
													},
												}}
											/>
										))}
									</Box>
								)}
							</Box>
						</>
					)}
				</Paper>

				{/* 笔记内容 */}
				<Paper elevation={0} sx={{ p: 4, minHeight: 400 }}>
					{note.content ? (
						renderContent(note.content, note.content_type)
					) : (
						<Typography
							color="text.secondary"
							sx={{
								fontStyle: "italic",
								textAlign: "center",
								py: 8,
							}}
						>
							此笔记暂无内容
						</Typography>
					)}
				</Paper>
			</Container>

			{/* 删除确认对话框 */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>确认删除</DialogTitle>
				<DialogContent>
					<Typography>
						确定要删除笔记《{note.title}》吗？删除后将无法恢复。
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} disabled={isDeleting}>
						取消
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						disabled={isDeleting}
						color="error"
						variant="contained"
					>
						{isDeleting ? "删除中..." : "删除"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* 分享对话框 */}
			<ShareDialog
				open={shareDialogOpen}
				onClose={() => setShareDialogOpen(false)}
				noteId={note?.id || null}
				noteTitle={note?.title}
			/>
		</Box>
	);
};

export default NoteDetail;
