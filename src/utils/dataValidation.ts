// src/utils/dataValidation.ts - 数据验证工具
export interface ValidatedItem {
	id: number | string;
	[key: string]: any;
}

/**
 * 验证并修复数组数据，确保每个项目都有有效的ID
 */
export function validateArrayData<T extends ValidatedItem>(
	data: any,
	arrayName: string = "items"
): T[] {
	console.log(`Validating ${arrayName}:`, data);

	// 检查数据是否为数组
	if (!Array.isArray(data)) {
		console.warn(`${arrayName} is not an array:`, typeof data, data);
		return [];
	}

	// 验证每个项目并修复缺失的ID
	const validatedData = data.map((item, index) => {
		if (!item) {
			console.warn(`${arrayName}[${index}] is null or undefined:`, item);
			return {
				id: `fallback-${index}`,
				name: "未知项目",
				...item,
			};
		}

		// 确保有ID字段
		if (item.id === undefined || item.id === null) {
			console.warn(`${arrayName}[${index}] missing ID:`, item);
			item.id = `fallback-${index}`;
		}

		return item;
	});

	console.log(`Validated ${arrayName}:`, validatedData);
	return validatedData;
}

/**
 * 验证API响应数据结构
 */
export function validateApiResponse<T>(
	response: any,
	expectedDataType: "array" | "object" = "object"
): {
	isValid: boolean;
	data: T | null;
	error: string | null;
} {
	console.log("Validating API response:", response);

	// 检查响应是否存在
	if (!response) {
		return {
			isValid: false,
			data: null,
			error: "Response is null or undefined",
		};
	}

	// 检查响应是否有正确的结构
	if (typeof response !== "object") {
		return {
			isValid: false,
			data: null,
			error: "Response is not an object",
		};
	}

	// 检查响应码
	if (response.code !== undefined && response.code !== 200) {
		return {
			isValid: false,
			data: null,
			error: response.message || "API returned error code",
		};
	}

	// 检查数据字段
	if (response.data === undefined) {
		return {
			isValid: false,
			data: null,
			error: "Response missing data field",
		};
	}

	// 验证数据类型
	if (expectedDataType === "array" && !Array.isArray(response.data)) {
		console.warn(
			"Expected array but got:",
			typeof response.data,
			response.data
		);
		return {
			isValid: false,
			data: null,
			error: "Expected array data but got different type",
		};
	}

	return {
		isValid: true,
		data: response.data,
		error: null,
	};
}

/**
 * 安全地获取嵌套对象属性
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
	const keys = path.split(".");
	let current = obj;

	for (const key of keys) {
		if (current?.[key] === undefined || current?.[key] === null) {
			return defaultValue;
		}
		current = current[key];
	}

	return current as T;
}

/**
 * 生成安全的React key
 */
export function generateSafeKey(
	item: any,
	index: number,
	prefix: string = "item"
): string {
	if (item?.id !== undefined && item.id !== null) {
		return String(item.id);
	}
	return `${prefix}-${index}`;
}

/**
 * 格式化日期字符串，处理无效日期
 */
export function formatSafeDate(
	dateString?: string,
	defaultText: string = "未知时间"
): string {
	if (!dateString) return defaultText;

	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return defaultText;
		}

		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "今天";
		if (diffDays === 2) return "昨天";
		if (diffDays <= 7) return `${diffDays} 天前`;
		return date.toLocaleDateString();
	} catch (error) {
		console.warn("Error formatting date:", dateString, error);
		return defaultText;
	}
}

/**
 * 安全地获取数组长度
 */
export function getSafeArrayLength(arr: any): number {
	return Array.isArray(arr) ? arr.length : 0;
}

/**
 * 检查值是否为有效数字
 */
export function isValidNumber(value: any): value is number {
	return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/**
 * 安全地获取数字值
 */
export function getSafeNumber(value: any, defaultValue: number = 0): number {
	if (isValidNumber(value)) {
		return value;
	}

	const parsed = Number(value);
	if (isValidNumber(parsed)) {
		return parsed;
	}

	return defaultValue;
}
