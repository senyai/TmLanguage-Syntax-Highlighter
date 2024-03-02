"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOniguruma = void 0;
const vscode = require("vscode");
const vscodeOniguruma = require("vscode-oniguruma");
async function initOniguruma(context) {
    const uri = vscode.Uri.joinPath(context.extensionUri, 'node_modules', 'vscode-oniguruma', 'release', 'onig.wasm');
    const wasm = await vscode.workspace.fs.readFile(uri);
    const options = {
        data: wasm,
        print(string) {
            console.log(string);
        }
    };
    await vscodeOniguruma.loadWASM(options);
    // // https://github.com/microsoft/vscode-oniguruma/issues/10
    // const response = await fetch('/node_modules/vscode-oniguruma/release/onig.wasm');
    // const contentType = response.headers.get('content-type');
    // // Using the response directly only works if the server sets the MIME type 'application/wasm'.
    // // Otherwise, a TypeError is thrown when using the streaming compiler.
    // // We therefore use the non-streaming compiler :(.
    // const wasm = contentType === 'application/wasm' ? response : await response.arrayBuffer();
    // const options: vscodeOniguruma.IDataOptions = {
    // 	data: wasm,
    // 	print(string: string) {
    // 		console.log(string);
    // 	}
    // }
    // await vscodeOniguruma.loadWASM(options);
}
exports.initOniguruma = initOniguruma;
