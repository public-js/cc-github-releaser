import got, { CancelableRequest, Got, GotReturn, HandlerFunction, Options, Response } from 'got';

type GotResponseExt<T> = GotReturn & CancelableRequest<Response<T>>;
const create: () => Got = <T = unknown>() =>
    got.extend({
        prefixUrl: process.env['GITHUB_ENDPOINT'] || 'https://api.github.com',
        headers: {
            accept: 'application/vnd.github.v3+json',
            'user-agent': 'cc-github-releaser',
        },
        responseType: 'json',
        context: { token: process.env['GITHUB_TOKEN'] },
        handlers: [
            (options: Options, next: (options: Options) => Promise<GotResponseExt<T>>) => {
                // Authorization
                if (options.context?.token && !options.headers.authorization) {
                    options.headers.authorization = `token ${options.context.token}`;
                }
                if (options.context?.accept) {
                    options.headers.accept = options.context.accept as string;
                }

                options.json = options.body as unknown as Record<string, unknown>;
                delete options.body;

                if (options.isStream) {
                    return next(options);
                }

                return (async (): Promise<Response<T>> => {
                    try {
                        return (await next(options)) as Response<T>;
                    } catch (error) {
                        const { response } = error;
                        // Rate limit for errors
                        if (response) {
                            error.statusCode = response.statusCode;
                        }
                        if (response?.body) {
                            error.body = response.body;
                        }
                        if (error.code === 'ERR_NON_2XX_3XX_RESPONSE') {
                            return error;
                        }
                        // Nicer errors
                        if (response?.body) {
                            error.name = 'GitHubError';
                            error.message = `${response.body.message} (${response.statusCode})`;
                        }
                        throw error;
                    }
                })();
            },
        ] as HandlerFunction[],
    });

type GotOptions = Required<Pick<Options, 'method'>> & {
    body?: Record<string, unknown> | Options['body'];
    context?: Options['context'];
};
type GotType = <T = unknown>(methodPath: string, options: GotOptions) => Promise<Response<T>>;
export default create() as GotType;
