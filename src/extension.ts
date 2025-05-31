import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  console.log('PCL extension is now active!');



  const runCommand = vscode.commands.registerCommand('pcl.run', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor - open a .pcl file first.');
      return;
    }

    const filePath = editor.document.fileName;

    if (process.platform !== 'linux') {
      vscode.window.showErrorMessage('PCL extension run command works only on Linux.');
      return;
    }

    // Check again at run time
    exec('which pcl', (err, stdout) => {
      if (err || !stdout) {
        vscode.window.showErrorMessage('PCL command not found. Is it installed and in your PATH?');
        return;
      }

      const pclCmd = `pcl run "${filePath}"`;
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Running PCL program',
        cancellable: false
      }, () => {
        return new Promise<void>((resolve) => {
          const terminal = vscode.window.createTerminal('PCL Run');
          terminal.show(true);
          terminal.sendText(pclCmd);
          resolve();
        });
      });
    });
  });

  context.subscriptions.push(runCommand);

  const completionProvider = vscode.languages.registerCompletionItemProvider('pcl', {
    provideCompletionItems() {
      return [
        new vscode.CompletionItem("%c", vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem("%py", vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem("%endc", vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem("%endpy", vscode.CompletionItemKind.Keyword),
        new vscode.CompletionItem("export=", vscode.CompletionItemKind.Property),
        new vscode.CompletionItem("requires=", vscode.CompletionItemKind.Property),
        new vscode.CompletionItem("name=", vscode.CompletionItemKind.Property)
      ];
    }
  }, '%', 'e', 'r', 'n');

  context.subscriptions.push(completionProvider);
}

export function deactivate() {}
