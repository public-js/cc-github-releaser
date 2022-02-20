import api from './got-wrapper';
import { transformer } from './transformer';
import {
    CcGithubReleaserOpts,
    ChangelogOpts,
    Chunk,
    GitRawCommitsOpts,
    ParserOpts,
    TemplateContext,
    WriterOpts,
} from './types';
import conventionalChangelog from 'conventional-changelog';
import gitSemverTags from 'git-semver-tags';
import { parse as semverParse } from 'semver';
import { Transform, TransformCallback } from 'stream';

function ccGithubReleaser({
    token,
    changelogOpts,
    context,
    gitRawCommitsOpts,
    parserOpts,
    writerOpts,
    userCb,
}: CcGithubReleaserOpts) {
    if (!token) {
        throw new Error('Expected an auth token');
    }
    if (!userCb) {
        throw new Error('Expected a callback');
    }

    const _changelogOpts: ChangelogOpts = Object.assign(
            {},
            { transform: transformer, releaseCount: 1 },
            changelogOpts || {},
        ),
        _context: TemplateContext = context || {},
        _parserOpts: ParserOpts = parserOpts || {},
        _writerOpts: WriterOpts = Object.assign({}, writerOpts || {}, {
            includeDetails: true,
            headerPartial: writerOpts?.headerPartial || '',
        });
    let _gitRawCommitsOpts: GitRawCommitsOpts = gitRawCommitsOpts || {};

    const requests: Promise<unknown>[] = [];

    gitSemverTags((err?: unknown | null, tags?: string[]) => (err ? userCb(err) : generateChangelogs(tags)));

    const generateChangelogs = (tags: string[]) => {
        if (!tags?.length) {
            setImmediate(userCb, new Error('No semver tags found'));
            return;
        }

        const releaseCount = _changelogOpts.releaseCount;
        if (releaseCount !== 0) {
            _gitRawCommitsOpts = Object.assign({}, { from: tags[releaseCount] }, _gitRawCommitsOpts);
        }
        _gitRawCommitsOpts.to = _gitRawCommitsOpts.to || tags[0];

        conventionalChangelog(_changelogOpts, _context, _gitRawCommitsOpts, _parserOpts, _writerOpts)
            .on('error', (err: Error) => userCb(err))
            .pipe(
                new Transform({
                    transform: createApiRequest,
                    flush: executeApiRequests,
                    objectMode: true,
                    highWaterMark: 16,
                }),
            );
    };

    const createApiRequest = (chunk: Chunk, enc: BufferEncoding, cb: TransformCallback) => {
        if (!chunk?.keyCommit?.version) {
            cb();
            return;
        }
        requests.push(
            api(`repos/${_context.owner}/${_context.repository}/releases`, {
                method: 'POST',
                context: { token },
                body: {
                    tag_name: chunk.keyCommit.version,
                    target_commitish: _changelogOpts.targetCommitish,
                    name: (_changelogOpts.releasePrefix || '') + (_changelogOpts.name || chunk.keyCommit.version),
                    body: chunk.log,
                    draft: _changelogOpts.draft || false,
                    prerelease: semverParse(chunk.keyCommit.version).prerelease.length > 0,
                },
            }),
        );
        cb();
    };

    const executeApiRequests = () =>
        Promise.all(requests)
            .then((responses: Awaited<unknown>[]) => userCb(null, responses))
            .catch((err: Error) => userCb(err));
}

export default ccGithubReleaser;
