import { handleApi } from "../../server/shared.mjs";

export async function onRequest(context) {
	return handleApi(context.request, context.env);
}
