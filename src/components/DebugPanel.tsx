// src/components/DebugPanel.tsx - 开发环境调试组件
import React, { useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Alert,
	Button,
	Chip,
	Divider,
} from "@mui/material";
import { ExpandMore, BugReport, Refresh } from "@mui/icons-material";
import {
	useGetNotesQuery,
	useGetCategoriesQuery,
	useGetTagsQuery,
} from "../store/api/notesApi";
import { useAppSelector } from "../store/hook";

const DebugPanel: React.FC = () => {
	const [expanded, setExpanded] = useState<string | false>(false);
	const { selectedCategoryId, selectedTagId, searchQuery, currentPage } =
		useAppSelector((state) => state.notes);

	// 查询参数
	const queryParams = {
		page: currentPage,
		limit: 20,
		...(selectedCategoryId && { category_id: selectedCategoryId }),
		...(selectedTagId && { tag_id: selectedTagId }),
		...(searchQuery && { search: searchQuery }),
		sort: "updated_at",
		order: "desc" as const,
	};

	// API调用
	const {
		data: notesData,
		error: notesError,
		isLoading: notesLoading,
		refetch: refetchNotes,
	} = useGetNotesQuery(queryParams);
	const {
		data: categoriesData,
		error: categoriesError,
		isLoading: categoriesLoading,
		refetch: refetchCategories,
	} = useGetCategoriesQuery();
	const {
		data: tagsData,
		error: tagsError,
		isLoading: tagsLoading,
		refetch: refetchTags,
	} = useGetTagsQuery();

	const handleAccordionChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

	const renderDataStructure = (data: any, title: string) => {
		if (!data) {
			return <Typography color="text.secondary">No data</Typography>;
		}

		try {
			return (
				<Box>
					<Typography variant="subtitle2" gutterBottom>
						Data Structure:
					</Typography>
					<Box
						component="pre"
						sx={{
							backgroundColor: "grey.100",
							p: 2,
							borderRadius: 1,
							overflow: "auto",
							fontSize: "0.75rem",
							maxHeight: 300,
						}}
					>
						{JSON.stringify(data, null, 2)}
					</Box>
				</Box>
			);
		} catch (error) {
			return (
				<Alert severity="error">Error serializing data: {String(error)}</Alert>
			);
		}
	};

	const renderErrorInfo = (error: any) => {
		if (!error) return null;

		return (
			<Alert severity="error" sx={{ mb: 2 }}>
				<Typography variant="subtitle2">Error Details:</Typography>
				<Box component="pre" sx={{ mt: 1, fontSize: "0.75rem" }}>
					{JSON.stringify(error, null, 2)}
				</Box>
			</Alert>
		);
	};

	const DataAnalysis: React.FC<{ data: any; title: string }> = ({
		data,
		title,
	}) => {
		const analysis = React.useMemo(() => {
			if (!data) return { type: "null", hasData: false };

			const type = typeof data;
			const isArray = Array.isArray(data);
			const hasDataField = data.data !== undefined;
			const hasCodeField = data.code !== undefined;
			const dataType = hasDataField ? typeof data.data : "none";
			const dataIsArray = hasDataField ? Array.isArray(data.data) : false;
			const arrayLength = dataIsArray ? data.data.length : 0;

			return {
				type,
				isArray,
				hasDataField,
				hasCodeField,
				dataType,
				dataIsArray,
				arrayLength,
				hasData: Boolean(data),
				responseCode: hasCodeField ? data.code : "none",
			};
		}, [data]);

		return (
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle2" gutterBottom>
					{title} Analysis:
				</Typography>
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
					<Chip label={`Type: ${analysis.type}`} size="small" />
					<Chip
						label={`Array: ${analysis.isArray}`}
						size="small"
						color={analysis.isArray ? "success" : "default"}
					/>
					<Chip
						label={`Has Data Field: ${analysis.hasDataField}`}
						size="small"
						color={analysis.hasDataField ? "success" : "error"}
					/>
					{analysis.hasCodeField && (
						<Chip label={`Code: ${analysis.responseCode}`} size="small" />
					)}
					{analysis.hasDataField && (
						<>
							<Chip label={`Data Type: ${analysis.dataType}`} size="small" />
							<Chip
								label={`Data Array: ${analysis.dataIsArray}`}
								size="small"
								color={analysis.dataIsArray ? "success" : "default"}
							/>
							{analysis.dataIsArray && (
								<Chip label={`Length: ${analysis.arrayLength}`} size="small" />
							)}
						</>
					)}
				</Box>

				{analysis.hasDataField &&
					analysis.dataIsArray &&
					analysis.arrayLength > 0 && (
						<Box>
							<Typography variant="caption" display="block" gutterBottom>
								First Item Structure:
							</Typography>
							<Box
								component="pre"
								sx={{
									backgroundColor: "grey.50",
									p: 1,
									borderRadius: 1,
									fontSize: "0.7rem",
									maxHeight: 150,
									overflow: "auto",
								}}
							>
								{JSON.stringify(data.data[0], null, 2)}
							</Box>
						</Box>
					)}
			</Box>
		);
	};

	// 只在开发环境显示
	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<Card sx={{ mt: 2, border: "2px solid orange" }}>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<BugReport color="warning" />
					<Typography variant="h6" color="warning.main">
						Debug Panel (Development Only)
					</Typography>
				</Box>

				<Alert severity="info" sx={{ mb: 2 }}>
					This panel shows API responses and data structures to help debug the
					key prop issues.
				</Alert>

				<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
					<Button
						size="small"
						onClick={() => refetchNotes()}
						startIcon={<Refresh />}
					>
						Refresh Notes
					</Button>
					<Button
						size="small"
						onClick={() => refetchCategories()}
						startIcon={<Refresh />}
					>
						Refresh Categories
					</Button>
					<Button
						size="small"
						onClick={() => refetchTags()}
						startIcon={<Refresh />}
					>
						Refresh Tags
					</Button>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Notes Debug */}
				<Accordion
					expanded={expanded === "notes"}
					onChange={handleAccordionChange("notes")}
				>
					<AccordionSummary expandIcon={<ExpandMore />}>
						<Typography>
							Notes API Response
							<Chip
								label={
									notesLoading ? "Loading" : notesError ? "Error" : "Success"
								}
								size="small"
								color={notesLoading ? "info" : notesError ? "error" : "success"}
								sx={{ ml: 1 }}
							/>
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography variant="subtitle2" gutterBottom>
							Query Params: {JSON.stringify(queryParams, null, 2)}
						</Typography>
						{renderErrorInfo(notesError)}
						<DataAnalysis data={notesData} title="Notes" />
						{renderDataStructure(notesData, "Notes")}
					</AccordionDetails>
				</Accordion>

				{/* Categories Debug */}
				<Accordion
					expanded={expanded === "categories"}
					onChange={handleAccordionChange("categories")}
				>
					<AccordionSummary expandIcon={<ExpandMore />}>
						<Typography>
							Categories API Response
							<Chip
								label={
									categoriesLoading
										? "Loading"
										: categoriesError
										? "Error"
										: "Success"
								}
								size="small"
								color={
									categoriesLoading
										? "info"
										: categoriesError
										? "error"
										: "success"
								}
								sx={{ ml: 1 }}
							/>
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						{renderErrorInfo(categoriesError)}
						<DataAnalysis data={categoriesData} title="Categories" />
						{renderDataStructure(categoriesData, "Categories")}
					</AccordionDetails>
				</Accordion>

				{/* Tags Debug */}
				<Accordion
					expanded={expanded === "tags"}
					onChange={handleAccordionChange("tags")}
				>
					<AccordionSummary expandIcon={<ExpandMore />}>
						<Typography>
							Tags API Response
							<Chip
								label={
									tagsLoading ? "Loading" : tagsError ? "Error" : "Success"
								}
								size="small"
								color={tagsLoading ? "info" : tagsError ? "error" : "success"}
								sx={{ ml: 1 }}
							/>
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						{renderErrorInfo(tagsError)}
						<DataAnalysis data={tagsData} title="Tags" />
						{renderDataStructure(tagsData, "Tags")}
					</AccordionDetails>
				</Accordion>
			</CardContent>
		</Card>
	);
};

export default DebugPanel;
