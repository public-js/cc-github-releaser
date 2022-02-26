import { Options } from 'conventional-changelog-core';
import dateFormat from 'dateformat';
import semverRegex from 'semver-regex';

import { TCommit, Transformer } from './types';

export const transformer: Transformer = (commit: TCommit, cb: Options.Transform.Callback) => {
    if (typeof commit.gitTags === 'string') {
        commit.version = (commit.gitTags.match(semverRegex()) || [])[0];
    }
    if (commit.committerDate) {
        commit.committerDate = dateFormat(commit.committerDate, 'yyyy-mm-dd', true);
    }
    cb(null, commit);
};
