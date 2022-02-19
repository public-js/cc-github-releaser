import { Options as CchOptions } from 'conventional-changelog';
import { Context, GitRawCommitsOptions, Options, ParserOptions, WriterOptions } from 'conventional-changelog-core';
import { Context as WriterContext, TransformedCommit } from 'conventional-changelog-writer';
import { Commit } from 'conventional-commits-parser';

export interface ChangelogOpts extends CchOptions {
    targetCommitish?: string;
    releasePrefix?: string;
    name?: string;
    draft?: boolean;
}

export type TCommit = Commit & { version?: string; gitTags?: string; committerDate?: string };
export type Chunk<TC extends Commit = TCommit> = TC & { keyCommit: TransformedCommit<TC> };

export type TransCb<TC extends Commit = TCommit> = Options.Transform.Callback<TC>;
export type Transformer<TC extends Commit = TCommit> = (commit: TC, cb: TransCb) => void;

export type TemplateContext<TContext extends WriterContext = Context> = Partial<TContext>;
export type WriterOpts<TC extends Commit = TCommit, TContext extends WriterContext = Context> = WriterOptions<
    TC,
    TContext
>;

export type GitRawCommitsOpts = GitRawCommitsOptions;
export type ParserOpts = ParserOptions;

export type UserCallback<Data = unknown, Err = unknown> = (err: Err | null, data?: Data) => void | never;

export interface ImportedConfig {
    gitRawCommitsOpts?: GitRawCommitsOpts;
    parserOpts?: ParserOpts;
    writerOpts?: WriterOpts;
}

export interface CcGithubReleaserOpts {
    token: string;
    changelogOpts: ChangelogOpts;
    context: TemplateContext;
    gitRawCommitsOpts?: GitRawCommitsOpts;
    parserOpts?: ParserOpts;
    writerOpts?: WriterOpts;
    userCb: UserCallback;
}
