// src/pages/notes/PublicNote.tsx - 公开分享笔记页面
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
	Box,
	Container,
	Typography,
	Paper,
	TextField,
	Button,
	Alert,
	Skeleton,
	Chip,
	Divider,
	AppBar,
	Toolbar,
} from "@mui/material";
import {
	Lock,
	Visibility,
	AccessTime,
	Category as CategoryIcon,
	Label as LabelIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

interface PublicNote {
	id: number;
	title: string;
	content: string;
	content_type: "markdown" | "html";
	view_count: number;
	category?: {
		id: number;
		name: string;
	};
	tags?: Array<{
		id: number;
		name: string;
		color: string;
	}>;
	created_at: string;
	updated_at: string;
}

const PublicNote: React.FC = () => {
	const { code } = useParams<{ code: string }>();
	const [searchParams] = useSearchParams();
	const [note, setNote] = useState<PublicNote | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [showPasswordInput, setShowPasswordInput] = useState(false);

	useEffect(() => {
		if (code) {
			fetchPublicNote();
		}
	}, [code]);

	const fetchPublicNote = async () => {
		if (!code) return;

		try {
			setLoading(true);
			setError(null);

			// 构建请求URL
			const params = new URLSearchParams();
			if (password) {
				params.append("password", password);
			}

			const response = await fetch(
				`/public/notes/${code}?${params.toString()}`
			);
			const data = await response.json();

			if (!response.ok) {
				if (response.status === 401) {
					setShowPasswordInput(true);
					setError("需要输入访问密码");
				} else if (response.status === 410) {
					setError("分享链接已过期");
				} else {
					setError(data.message || "加载失败");
				}
				return;
			}

			setNote(data.data);
			setShowPasswordInput(false);
		} catch (err) {
			console.error("Fetch public note error:", err);
			setError("网络错误，请稍后重试");
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (password.trim()) {
			fetchPublicNote();
		}
	};

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

	const formatViewCount = (count: number): string => {
		if (count === 0) return "0";
		if (count < 1000) return count.toString();
		if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
		if (count < 1000000) return `${Math.floor(count / 1000)}k`;
		return `${(count / 1000000).toFixed(1)}M`;
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
				}}
			>
				{content}
			</ReactMarkdown>
		);
	};

	return (
		<Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
			{/* 顶部导航 */}
			<AppBar position="static" color="primary">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						📝 Notes - 分享笔记
					</Typography>
					{note && (
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Visibility sx={{ fontSize: 18 }} />
							<Typography variant="body2">
								{formatViewCount(note.view_count)} 次浏览
							</Typography>
						</Box>
					)}
				</Toolbar>
			</AppBar>

			<Container maxWidth="md" sx={{ py: 4 }}>
				{loading && (
					<Box>
						<Skeleton variant="text" width="60%" height={48} />
						<Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
						<Skeleton variant="rectangular" width="100%" height={400} />
					</Box>
				)}

				{error && !loading && (
					<Box sx={{ textAlign: "center", py: 4 }}>
						<Alert severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>

						{showPasswordInput && (
							<Paper sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
								<Typography variant="h6" gutterBottom>
									<Lock sx={{ mr: 1, verticalAlign: "middle" }} />
									需要访问密码
								</Typography>
								<Box component="form" onSubmit={handlePasswordSubmit}>
									<TextField
										fullWidth
										label="访问密码"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										margin="normal"
										autoFocus
									/>
									<Button
										type="submit"
										fullWidth
										variant="contained"
										sx={{ mt: 2 }}
									>
										查看笔记
									</Button>
								</Box>
							</Paper>
						)}
					</Box>
				)}

				{note && !loading && (
					<Box>
						{/* 笔记元信息 */}
						<Paper
							elevation={0}
							sx={{ p: 3, mb: 3, backgroundColor: "grey.50" }}
						>
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
									<Visibility sx={{ fontSize: 18 }} />
									<Typography
										variant="body2"
										title={`${note.view_count} 次浏览`}
									>
										{formatViewCount(note.view_count)} 次浏览
									</Typography>
								</Box>

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
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
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
												<LabelIcon
													sx={{ fontSize: 16, color: "text.secondary" }}
												/>
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

						{/* 页脚信息 */}
						<Paper
							elevation={0}
							sx={{
								p: 2,
								mt: 3,
								backgroundColor: "grey.50",
								textAlign: "center",
							}}
						>
							<Typography variant="body2" color="text.secondary">
								由 Notes 笔记系统分享 • 创建于 {formatDate(note.created_at)}
							</Typography>
						</Paper>
					</Box>
				)}
			</Container>
		</Box>
	);
};

export default PublicNote;
