#!/usr/bin/env node

import { resolve } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import ccGithubReleaser from './runner';
import { ChangelogOpts, GitRawCommitsOpts, ImportedConfig, ParserOpts, TemplateContext, WriterOpts } from './types';

const cli = yargs(hideBin(process.argv))
    .option('token', {
        alias: 't',
        type: 'string',
        description: 'Your GitHub auth token',
    })
    .option('preset', {
        alias: 'p',
        default: 'angular',
        type: 'string',
        description:
            `Name of the preset you want to use. Must be one of the following: ` +
            `angular, atom, codemirror, ember, eslint, express, jquery, jscs or jshint`,
    })
    .option('pkg', {
        alias: 'k',
        type: 'string',
        description: `A filepath of where your package.json is located. Default is the closest package.json from cwd`,
    })
    .option('releases', {
        alias: 'r',
        default: 1,
        type: 'number',
        description:
            `How many releases to be generated from the latest. ` +
            `If 0, the whole changelog will be regenerated and the output file will be overwritten`,
    })
    .option('prefix', {
        alias: 'f',
        default: '',
        type: 'string',
        description: `Release name prefix`,
    })
    .option('config', {
        alias: 'n',
        type: 'string',
        description: 'A filepath of your config script',
    })
    .option('context', {
        alias: 'c',
        type: 'string',
        description: 'A filepath of a javascript that is used to define template variables',
    })
    .option('draft', {
        alias: 'd',
        default: false,
        type: 'boolean',
        description: 'Publish a draft release',
    })
    .option('verbose', {
        alias: 'v',
        default: false,
        type: 'boolean',
        description: 'Verbose output. Use this for debugging',
    })
    .usage('Usage: cc-github-releaser [options]')
    .parse();

if (cli instanceof Promise) {
    throw new TypeError('Can not process async cli object');
}

let config: ImportedConfig = {};
let context: TemplateContext | undefined;
let gitRawCommitsOpts: GitRawCommitsOpts | undefined;
let parserOpts: ParserOpts | undefined;
let writerOpts: WriterOpts | undefined;

try {
    if (cli.context) {
        context = require(resolve(process.cwd(), cli.context));
    }
    if (cli.config) {
        config = require(resolve(process.cwd(), cli.config));
    }
    if (config.gitRawCommitsOpts) {
        gitRawCommitsOpts = config.gitRawCommitsOpts;
    }
    if (config.parserOpts) {
        parserOpts = config.parserOpts;
    }
    if (config.writerOpts) {
        writerOpts = config.writerOpts;
    }
} catch (error) {
    console.error('Failed to get file:', error);
    process.exit(1);
}

const changelogOpts: ChangelogOpts = {
    preset: cli.preset,
    pkg: { path: cli.pkg },
    releaseCount: cli.releases,
    releasePrefix: cli.prefix,
    draft: cli.draft,
};

ccGithubReleaser({
    token:
        cli.token ||
        process.env['GITHUB_TOKEN'] ||
        process.env['GH_TOKEN'] ||
        process.env['CONVENTIONAL_GITHUB_RELEASER_TOKEN'] ||
        '',
    changelogOpts,
    context,
    gitRawCommitsOpts,
    parserOpts,
    writerOpts,
    userCb: (err, data) => {
        if (err) {
            console.error(err.toString());
            process.exit(1);
        }
        if (cli.verbose) {
            console.log(data);
        }
    },
});
