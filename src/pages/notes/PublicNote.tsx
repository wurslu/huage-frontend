// src/pages/notes/PublicNote.tsx - 修复密码验证逻辑
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
	const [note, setNote] = useState<PublicNote | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [showPasswordInput, setShowPasswordInput] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	// 添加调试日志
	useEffect(() => {
		console.log("PublicNote mounted, code:", code);
		if (code) {
			fetchPublicNote();
		} else {
			setError("无效的分享链接");
			setLoading(false);
		}
	}, [code]);

	const fetchPublicNote = async () => {
		if (!code) return;

		try {
			setLoading(true);
			setError(null);
			setPasswordError(null);

			// 构建请求URL
			const params = new URLSearchParams();
			if (password) {
				params.append("password", password);
			}

			const apiUrl = `/api/public/notes/${code}${
				params.toString() ? `?${params.toString()}` : ""
			}`;
			console.log("Fetching from:", apiUrl);

			const response = await fetch(apiUrl);
			console.log("Response status:", response.status);

			if (!response.ok) {
				console.log("Response not ok, status:", response.status);

				if (response.status === 401) {
					console.log("401 - Password required");
					setShowPasswordInput(true);
					setPasswordError(password ? "访问密码错误，请重新输入" : null);
					setLoading(false);
					return;
				} else if (response.status === 410) {
					setError("分享链接已过期");
					setLoading(false);
					return;
				} else if (response.status === 404) {
					setError("分享链接不存在或已失效");
					setLoading(false);
					return;
				} else {
					// 尝试解析错误信息
					try {
						const errorData = await response.json();
						console.log("Error data:", errorData);
						setError(errorData.message || "加载失败");
					} catch (parseError) {
						console.log("Failed to parse error response:", parseError);
						setError(`加载失败 (状态码: ${response.status})`);
					}
					setLoading(false);
					return;
				}
			}

			const data = await response.json();
			console.log("Received data:", data);

			// 检查响应格式
			if (data.code === 200 && data.data) {
				setNote(data.data);
				setShowPasswordInput(false);
				setPasswordError(null);
				console.log("Note loaded successfully:", data.data);
			} else {
				console.log("Invalid data format:", data);
				setError(data.message || "数据格式错误");
			}
		} catch (err) {
			console.error("Fetch public note error:", err);
			setError("网络错误，请稍后重试");
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Submitting password:", password);
		if (password.trim()) {
			setPasswordError(null);
			fetchPublicNote();
		} else {
			setPasswordError("请输入访问密码");
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
						"& table": {
							width: "100%",
							borderCollapse: "collapse",
							margin: "16px 0",
						},
						"& th, & td": {
							border: "1px solid #ddd",
							padding: "8px",
							textAlign: "left",
						},
						"& th": {
							backgroundColor: "#f5f5f5",
							fontWeight: "bold",
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
								backgroundColor: "rgba(25, 118, 210, 0.04)",
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

	// 调试渲染状态
	console.log("Render state:", { loading, error, showPasswordInput, note });

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
				{/* 加载状态 */}
				{loading && (
					<Box>
						<Skeleton variant="text" width="60%" height={48} />
						<Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
						<Skeleton variant="rectangular" width="100%" height={400} />
					</Box>
				)}

				{/* 密码输入状态 */}
				{!loading && showPasswordInput && (
					<Box sx={{ textAlign: "center", py: 4 }}>
						<Paper sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
							<Typography variant="h6" gutterBottom>
								<Lock sx={{ mr: 1, verticalAlign: "middle" }} />
								需要访问密码
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
								这是一个受密码保护的分享笔记，请输入正确的访问密码。
							</Typography>
							<Box component="form" onSubmit={handlePasswordSubmit}>
								<TextField
									fullWidth
									label="访问密码"
									type="password"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										if (passwordError) setPasswordError(null);
									}}
									error={!!passwordError}
									helperText={passwordError}
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
					</Box>
				)}

				{/* 错误状态 */}
				{!loading && !showPasswordInput && error && (
					<Box sx={{ textAlign: "center", py: 4 }}>
						<Alert severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>
					</Box>
				)}

				{/* 笔记内容 */}
				{!loading && !error && note && (
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
