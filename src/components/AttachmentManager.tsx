import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	IconButton,
	ToggleButton,
	ToggleButtonGroup,
	Tabs,
	Tab,
	Alert,
	LinearProgress,
} from "@mui/material";
import {
	Close,
	ViewList,
	ViewModule,
	CloudUpload,
	Folder,
	Image as ImageIcon,
	InsertDriveFile,
} from "@mui/icons-material";
import {
	useGetAttachmentsQuery,
	useGetUserStorageQuery,
} from "../store/api/notesApi";
import FileUpload from "./FileUpload";
import AttachmentList from "./AttatchmentList";

interface AttachmentManagerProps {
	open: boolean;
	onClose: () => void;
	noteId: number;
	noteTitle?: string;
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div role="tabpanel" hidden={value !== index} {...other}>
			{value === index && <Box>{children}</Box>}
		</div>
	);
}

const AttachmentManager: React.FC<AttachmentManagerProps> = ({
	open,
	onClose,
	noteId,
	noteTitle,
}) => {
	const [viewMode, setViewMode] = useState<"list" | "grid">("list");
	const [tabValue, setTabValue] = useState(0);

	const { data: attachmentsData, refetch: refetchAttachments } =
		useGetAttachmentsQuery(noteId, {
			skip: !noteId,
		});

	const { data: storageData, refetch: refetchStorage } = useGetUserStorageQuery(
		undefined,
		{
			refetchOnMountOrArgChange: true,
			refetchOnFocus: true,
		}
	);

	const attachments = attachmentsData?.data || [];
	const storage = storageData?.data;

	const handleViewModeChange = (
		event: React.MouseEvent<HTMLElement>,
		newViewMode: "list" | "grid" | null
	) => {
		if (newViewMode !== null) {
			setViewMode(newViewMode);
		}
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleUploadSuccess = () => {
		refetchAttachments();
		refetchStorage();
	};

	const handleDeleteAttachment = (attachmentId: number) => {
		refetchAttachments();
		refetchStorage();

		console.log(`Attachment ${attachmentId} deleted, refreshing data...`);
	};

	const imageAttachments = attachments.filter((att) => att.is_image);
	const documentAttachments = attachments.filter((att) => !att.is_image);

	const getStorageUsagePercent = (): number => {
		if (!storage || !storage.used_space || !storage.max_space) {
			return 0;
		}
		const percent = (storage.used_space / storage.max_space) * 100;
		return Math.min(Math.max(percent, 0), 100);
	};

	const storageUsagePercent = getStorageUsagePercent();

	const formatFileSize = (bytes: number | undefined | null): string => {
		if (!bytes || bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const getStorageInfo = () => {
		const defaultStorage = {
			used_space: 0,
			max_space: 524288000,
			file_count: 0,
			image_count: 0,
			document_count: 0,
		};

		if (!storage) {
			console.warn("Storage data not available, using defaults");
			return defaultStorage;
		}

		return {
			used_space: storage.used_space || 0,
			max_space: storage.max_space || defaultStorage.max_space,
			file_count: storage.file_count || 0,
			image_count: storage.image_count || 0,
			document_count: storage.document_count || 0,
		};
	};

	const storageInfo = getStorageInfo();

	console.log("Storage data:", storage);
	console.log("Storage info:", storageInfo);
	console.log("Usage percent:", storageUsagePercent);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { height: "80vh" },
			}}
		>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Box>
						<Typography variant="h6">附件管理</Typography>
						{noteTitle && (
							<Typography variant="body2" color="text.secondary">
								{noteTitle}
							</Typography>
						)}
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<ToggleButtonGroup
							value={viewMode}
							exclusive
							onChange={handleViewModeChange}
							size="small"
						>
							<ToggleButton value="list">
								<ViewList />
							</ToggleButton>
							<ToggleButton value="grid">
								<ViewModule />
							</ToggleButton>
						</ToggleButtonGroup>
						<IconButton onClick={onClose}>
							<Close />
						</IconButton>
					</Box>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				<Box sx={{ mb: 3 }}>
					<Tabs value={tabValue} onChange={handleTabChange}>
						<Tab
							label={`全部 (${attachments.length})`}
							icon={<Folder />}
							iconPosition="start"
						/>
						<Tab
							label={`图片 (${imageAttachments.length})`}
							icon={<ImageIcon />}
							iconPosition="start"
						/>
						<Tab
							label={`文档 (${documentAttachments.length})`}
							icon={<InsertDriveFile />}
							iconPosition="start"
						/>
						<Tab label="上传" icon={<CloudUpload />} iconPosition="start" />
					</Tabs>
				</Box>

				<TabPanel value={tabValue} index={0}>
					<AttachmentList
						attachments={attachments}
						onDelete={handleDeleteAttachment}
						viewMode={viewMode}
						showActions={true}
					/>
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					<AttachmentList
						attachments={imageAttachments}
						onDelete={handleDeleteAttachment}
						viewMode={viewMode}
						showActions={true}
					/>
				</TabPanel>

				<TabPanel value={tabValue} index={2}>
					<AttachmentList
						attachments={documentAttachments}
						onDelete={handleDeleteAttachment}
						viewMode={viewMode}
						showActions={true}
					/>
				</TabPanel>

				<TabPanel value={tabValue} index={3}>
					<FileUpload
						noteId={noteId}
						onUploadSuccess={handleUploadSuccess}
						maxFileSize={50}
						multiple={true}
					/>
				</TabPanel>

				<Box sx={{ mt: 3 }}>
					<Alert
						severity={storageUsagePercent > 80 ? "warning" : "info"}
						sx={{ mb: 2 }}
					>
						<Box>
							<Typography variant="body2" gutterBottom>
								存储空间使用情况：{formatFileSize(storageInfo.used_space)} /{" "}
								{formatFileSize(storageInfo.max_space)}
							</Typography>
							<LinearProgress
								variant="determinate"
								value={storageUsagePercent}
								sx={{ height: 6, borderRadius: 3, mb: 1 }}
								color={storageUsagePercent > 80 ? "warning" : "primary"}
							/>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 1, display: "block" }}
							>
								使用率：{storageUsagePercent.toFixed(1)}% | 文件总数：
								{storageInfo.file_count} | 图片：{storageInfo.image_count} |
								文档：{storageInfo.document_count}
							</Typography>
						</Box>
					</Alert>

					{process.env.NODE_ENV === "development" && (
						<Box sx={{ mt: 2 }}>
							<Button
								size="small"
								variant="outlined"
								onClick={() => {
									console.log("Refreshing storage data...");
									refetchStorage();
								}}
							>
								刷新存储数据 (开发模式)
							</Button>
						</Box>
					)}
				</Box>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>关闭</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AttachmentManager;
