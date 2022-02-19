#!/usr/bin/env node

import ccGithubReleaser from './runner';
import { ChangelogOpts, GitRawCommitsOpts, ImportedConfig, ParserOpts, TemplateContext, WriterOpts } from './types';
import meow from 'meow';
import { resolve } from 'path';

const cli = meow({
    help: `
Usage      conventional-github-releaser
Example    conventional-github-releaser -p angular

Options
  -t, --token       Your GitHub auth token

  -p, --preset      Name of the preset you want to use. Must be one of the following:
                    angular, atom, codemirror, ember, eslint, express, jquery, jscs or jshint
                    Default: angular

  -k, --pkg         A filepath of where your package.json is located
                    Default is the closest package.json from cwd

  -r, --releases    How many releases to be generated from the latest
                    If 0, the whole changelog will be regenerated and
                    the output file will be overwritten
                    Default: 1

  -f, --prefix      Release name prefix
                    Default: ''

  -n, --config      A filepath of your config script

  -c, --context     A filepath of a javascript that is used to define template variables

  -d, --draft       Publish a draft release
                    Default: false
  `,
    flags: {
        token: {
            alias: 't',
            default:
                process.env['GITHUB_TOKEN'] ||
                process.env['GH_TOKEN'] ||
                process.env['CONVENTIONAL_GITHUB_RELEASER_TOKEN'] ||
                '_',
            type: 'string',
        },
        preset: {
            alias: 'p',
            default: 'angular',
            type: 'string',
        },
        pkg: {
            alias: 'k',
            type: 'string',
        },
        releases: {
            alias: 'r',
            default: 1,
            type: 'number',
        },
        prefix: {
            alias: 'f',
            type: 'string',
        },
        config: {
            alias: 'n',
            type: 'string',
        },
        context: {
            alias: 'c',
            type: 'string',
        },
        draft: {
            alias: 'd',
            default: false,
            type: 'boolean',
        },
    },
});

let config: ImportedConfig = {};
let context: TemplateContext | undefined;
let gitRawCommitsOpts: GitRawCommitsOpts | undefined;
let parserOpts: ParserOpts | undefined;
let writerOpts: WriterOpts | undefined;

try {
    if (cli.flags.context) {
        context = require(resolve(process.cwd(), cli.flags.context));
    }
    if (cli.flags.config) {
        config = require(resolve(process.cwd(), cli.flags.config));
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
} catch (err) {
    console.error('Failed to get file:', err);
    process.exit(1);
}

const changelogOpts: ChangelogOpts = {
    preset: cli.flags.preset,
    pkg: { path: cli.flags.pkg },
    releaseCount: cli.flags.releases,
    releasePrefix: cli.flags.prefix,
    draft: cli.flags.draft,
};

ccGithubReleaser({
    token: cli.flags.token,
    changelogOpts,
    context,
    gitRawCommitsOpts,
    parserOpts,
    writerOpts,
    userCb: function (err, data) {
        if (err) {
            console.error(err.toString());
            process.exit(1);
        }
        // if (flags.verbose) {
        //     console.log(data)
        // }
    },
});
