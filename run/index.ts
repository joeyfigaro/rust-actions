"use strict";

import fs from "fs";
import path from "path";
import url from "url";

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import toml from 'toml';

const COMMAND = path.basename(path.dirname(require.main!.filename));
const CARGO_TOML = fs.readFileSync(path.join(__dirname, "../Cargo.toml"));

const {
	name: NAME,
	repository: REPOSITORY,
	version: VERSION,
} = toml.parse(CARGO_TOML.toString()).package;

const { RUNNER_TEMP } = process.env;
const { platform: PLATFORM } = process;

const ACTION_NAME = url.parse(REPOSITORY).pathname!.slice(1);
const BASE_URL = `${REPOSITORY}/releases/download/${VERSION}`;
const FILE_PREFIX = `${NAME}-v${VERSION}`;

async function downloadTar(os: "linux" | "darwin"): Promise<string> {
	const file = `${FILE_PREFIX}-${os}-x64.tar.gz`;
	const url = `${BASE_URL}/${file}`;
	const downloadPath = await tc.downloadTool(url);
	const extractPath = await tc.extractTar(downloadPath, RUNNER_TEMP);
	const extractedFile = path.join(extractPath, NAME);

	return tc.cacheFile(extractedFile, NAME, ACTION_NAME, VERSION);
}

async function linux(): Promise<void> {
	const cacheDir = tc.find(ACTION_NAME, "0.0.0")
		|| await downloadTar("linux");

	const binary = path.join(cacheDir, NAME);

	await exec.exec(binary, [COMMAND]);
}

async function macos(): Promise<void> {
	const cacheDir = tc.find(ACTION_NAME, "0.0.0")
		|| await downloadTar("darwin");

	const binary = path.join(cacheDir, NAME);

	await exec.exec(binary, [COMMAND]);
}

async function run(): Promise<void> {
	switch (PLATFORM) {
		case "linux": return linux();
		case "darwin": return macos();
		case "win32":
		case "aix":
		case "freebsd":
		case "openbsd":
		case "sunos":
		default:
			throw new Error(`Unsupported platform: ${PLATFORM}`);
	}
}

run().catch((error) => core.setFailed(error.message));
