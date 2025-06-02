import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

export interface ApiError {
	status?: number;
	message: string;
	details?: any;
}

/**
 * 统一处理API错误
 */
export function handleApiError(
	error: FetchBaseQueryError | SerializedError | undefined
): ApiError {
	console.error("API Error:", error);

	if (!error) {
		return {
			message: "未知错误",
		};
	}

	if ("status" in error) {
		const status = error.status;

		if (status === "FETCH_ERROR") {
			return {
				status: 0,
				message: "网络连接失败，请检查网络设置",
			};
		}

		if (status === "TIMEOUT_ERROR") {
			return {
				status: 0,
				message: "请求超时，请稍后重试",
			};
		}

		if (status === "PARSING_ERROR") {
			return {
				status: 0,
				message: "数据解析失败",
			};
		}

		if (typeof status === "number") {
			let message = "请求失败";

			switch (status) {
				case 400:
					message = "请求参数错误";
					break;
				case 401:
					message = "未授权，请重新登录";
					break;
				case 403:
					message = "访问被拒绝，权限不足";
					break;
				case 404:
					message = "请求的资源不存在";
					break;
				case 422:
					message = "数据验证失败";
					break;
				case 500:
					message = "服务器内部错误";
					break;
				case 502:
					message = "网关错误";
					break;
				case 503:
					message = "服务暂时不可用";
					break;
				default:
					message = `请求失败 (${status})`;
			}

			if (error.data && typeof error.data === "object") {
				const data = error.data as any;
				if (data.message) {
					message = data.message;
				} else if (data.error) {
					message = data.error;
				}
			}

			return {
				status,
				message,
				details: error.data,
			};
		}
	}

	if ("message" in error) {
		return {
			message: error.message || "请求失败",
		};
	}

	return {
		message: "未知错误",
	};
}

/**
 * 检查是否为网络错误
 */
export function isNetworkError(error: any): boolean {
	return (
		error?.status === "FETCH_ERROR" ||
		error?.status === "TIMEOUT_ERROR" ||
		error?.status === 0 ||
		!navigator.onLine
	);
}

/**
 * 检查是否为认证错误
 */
export function isAuthError(error: any): boolean {
	return error?.status === 401;
}

/**
 * 检查是否为权限错误
 */
export function isPermissionError(error: any): boolean {
	return error?.status === 403;
}

/**
 * 检查是否为数据验证错误
 */
export function isValidationError(error: any): boolean {
	return error?.status === 422 || error?.status === 400;
}

/**
 * 提取错误消息
 */
export function extractErrorMessage(error: any): string {
	const apiError = handleApiError(error);
	return apiError.message;
}

/**
 * 创建用户友好的错误消息
 */
export function createUserFriendlyError(
	error: any,
	context: string = ""
): string {
	const apiError = handleApiError(error);

	if (isNetworkError(error)) {
		return "网络连接失败，请检查网络设置后重试";
	}

	if (isAuthError(error)) {
		return "登录已过期，请重新登录";
	}

	if (isPermissionError(error)) {
		return "权限不足，无法执行此操作";
	}

	let message = apiError.message;

	if (context) {
		switch (context) {
			case "load_notes":
				message = `加载笔记失败: ${message}`;
				break;
			case "load_categories":
				message = `加载分类失败: ${message}`;
				break;
			case "load_tags":
				message = `加载标签失败: ${message}`;
				break;
			case "delete_note":
				message = `删除笔记失败: ${message}`;
				break;
			case "create_note":
				message = `创建笔记失败: ${message}`;
				break;
			case "update_note":
				message = `更新笔记失败: ${message}`;
				break;
			default:
				if (context && !message.includes(context)) {
					message = `${context}失败: ${message}`;
				}
		}
	}

	return message;
}

/**
 * 重试机制
 */
export class RetryHandler {
	private maxRetries: number;
	private retryDelay: number;

	constructor(maxRetries: number = 3, retryDelay: number = 1000) {
		this.maxRetries = maxRetries;
		this.retryDelay = retryDelay;
	}

	async execute<T>(
		operation: () => Promise<T>,
		shouldRetry: (error: any) => boolean = isNetworkError
	): Promise<T> {
		let lastError: any;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error;

				if (attempt === this.maxRetries || !shouldRetry(error)) {
					throw error;
				}

				await new Promise((resolve) =>
					setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
				);
			}
		}

		throw lastError;
	}
}

export const globalRetryHandler = new RetryHandler();
