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
import q from 'q';
import { parse as semverParse } from 'semver';
import through2 from 'through2';

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

    const promises: Promise<unknown>[] = [];

    q.nfcall(gitSemverTags)
        .then(function (tags: string[]) {
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
                .on('error', function (err) {
                    userCb(err);
                })
                .pipe(
                    through2.obj(
                        function (chunk: Chunk, enc: BufferEncoding, cb: through2.TransformCallback) {
                            if (!chunk?.keyCommit?.version) {
                                cb();
                                return;
                            }

                            promises.push(
                                api(`repos/${_context.owner}/${_context.repository}/releases`, {
                                    method: 'POST',
                                    context: { token },
                                    body: {
                                        tag_name: chunk.keyCommit.version,
                                        target_commitish: _changelogOpts.targetCommitish,
                                        name:
                                            (_changelogOpts.releasePrefix || '') +
                                            (_changelogOpts.name || chunk.keyCommit.version),
                                        body: chunk.log,
                                        draft: _changelogOpts.draft || false,
                                        prerelease: semverParse(chunk.keyCommit.version).prerelease.length > 0,
                                    },
                                }),
                            );

                            cb();
                        },
                        function () {
                            q.all(promises)
                                .then(function (responses) {
                                    userCb(null, responses);
                                })
                                .catch(function (err) {
                                    userCb(err);
                                });
                        },
                    ),
                );
        })
        .catch(function (err) {
            userCb(err);
        });
}

export default ccGithubReleaser;
