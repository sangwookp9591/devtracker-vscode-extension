import * as vscode from 'vscode';
import axios from 'axios';

let isTracking = false;
let statusBarItem: vscode.StatusBarItem;
let trackingStartTime: number;
let lastActivityTime: number;

export function activate(context: vscode.ExtensionContext) {
    console.log('DevTracker extension is now active!');

    // 상태바 아이템 생성
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(clock) DevTracker: Ready';
    statusBarItem.command = 'devtracker.configure';
    statusBarItem.show();

    // 명령어 등록
    let startCommand = vscode.commands.registerCommand('devtracker.startTracking', () => {
        startTracking();
    });

    let stopCommand = vscode.commands.registerCommand('devtracker.stopTracking', () => {
        stopTracking();
    });

    let configureCommand = vscode.commands.registerCommand('devtracker.configure', () => {
        configureApiKey();
    });

    context.subscriptions.push(startCommand, stopCommand, configureCommand, statusBarItem);

    // 파일 변경 감지
    let documentChangeListener = vscode.workspace.onDidChangeTextDocument(() => {
        if (isTracking) {
            lastActivityTime = Date.now();
            updateStatusBar();
        }
    });

    context.subscriptions.push(documentChangeListener);

    // API 키가 있으면 자동 시작
    const config = vscode.workspace.getConfiguration('devtracker');
    if (config.get('apiKey')) {
        startTracking();
    }
}

function startTracking() {
    if (isTracking) return;

    const config = vscode.workspace.getConfiguration('devtracker');
    const apiKey = config.get('apiKey') as string;

    if (!apiKey) {
        vscode.window
            .showWarningMessage('API key not configured. Click to configure.', 'Configure')
            .then((selection) => {
                if (selection === 'Configure') {
                    configureApiKey();
                }
            });
        return;
    }

    isTracking = true;
    trackingStartTime = Date.now();
    lastActivityTime = Date.now();

    statusBarItem.text = '$(clock) DevTracker: Tracking...';
    vscode.window.showInformationMessage('DevTracker: Time tracking started!');

    // 5분마다 서버에 전송
    setInterval(sendActivityData, 5 * 60 * 1000);
}

function stopTracking() {
    if (!isTracking) return;

    isTracking = false;
    sendActivityData(); // 마지막 데이터 전송

    statusBarItem.text = '$(clock) DevTracker: Stopped';
    vscode.window.showInformationMessage('DevTracker: Time tracking stopped!');
}

async function configureApiKey() {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your DevTracker API key',
        password: true,
        placeHolder: 'Get API key from DevTracker mobile app',
    });

    if (apiKey) {
        await vscode.workspace
            .getConfiguration('devtracker')
            .update('apiKey', apiKey, vscode.ConfigurationTarget.Global);

        vscode.window.showInformationMessage('API key saved! Starting time tracking...');
        startTracking();
    }
}

function updateStatusBar() {
    if (!isTracking) return;

    const elapsed = Math.floor((Date.now() - trackingStartTime) / 1000 / 60);
    statusBarItem.text = `$(clock) DevTracker: ${elapsed}m`;
}

async function sendActivityData() {
    if (!isTracking) return;

    const config = vscode.workspace.getConfiguration('devtracker');
    const apiKey = config.get('apiKey') as string;
    const serverUrl = config.get('serverUrl') as string;

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return;

    const duration = Math.floor((Date.now() - trackingStartTime) / 1000 / 60);

    const activityData = {
        ideType: 'VSCODE',
        fileName: activeEditor.document.fileName,
        projectPath: vscode.workspace.rootPath || '',
        activityType: 'FILE_EDIT',
        duration: duration,
        language: activeEditor.document.languageId,
        linesChanged: activeEditor.document.lineCount,
        timestamp: new Date().toISOString(),
    };

    try {
        await axios.post(`${serverUrl}/api/v1/ide/activity`, activityData, {
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        console.log('Activity data sent successfully');
    } catch (error) {
        console.error('Failed to send activity data:', error);
    }
}

export function deactivate() {
    if (isTracking) {
        stopTracking();
    }
}
