export abstract class HttpHelper {
  public static async fetchAsJson<Response>(input: RequestInfo): Promise<Response> {
    const response = await fetch(input);
    const responseText = await response.text();
    const result = await JSON.parse(responseText);

    if (result.code === 404) {
      throw new Error(result.message);
    }

    return result;
  }

  public static async fetchPatch<Response>(input: RequestInfo): Promise<Response> {
    const response = await fetch(input, { method: 'PATCH' });
    const responseText = await response.text();
    const result = await JSON.parse(responseText);

    if (result.code === 404) {
      throw new Error(result.message);
    }

    return result;
  }
}
