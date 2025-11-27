# Building the Continue VS Code Extension

This patch simplifies `run_terminal_command` to delegate to VS Code's terminal API, making it work correctly in SSH remotes, dev containers, and local workspaces.

## Prerequisites

- Node.js >= 20.19.0
- npm or pnpm
- Git

## Build Steps

### 1. Clone and Checkout

```bash
git clone https://github.com/continuedev/continue.git
cd continue
git checkout 41e3d7d05  # Or the latest commit with this patch
```

### 2. Install Dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for all packages including the VS Code extension.

### 3. Build the Core

The VS Code extension depends on the core package:

```bash
cd core
npm run build
cd ..
```

### 4. Build the VS Code Extension

```bash
cd extensions/vscode
npm run esbuild
```

This compiles TypeScript and bundles the extension.

### 5. Package the Extension

```bash
npm run package
```

This creates a `.vsix` file in `extensions/vscode/build/continue-1.3.27.vsix` (version may vary).

### 6. Install the Extension

In VS Code:

1. Open Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Click the `...` menu → **"Install from VSIX..."**
3. Navigate to `extensions/vscode/build/continue-1.3.27.vsix`
4. Select and install
5. Reload VS Code when prompted

## Quick Build Script

You can also create a simple build script:

```bash
#!/bin/bash
# build-extension.sh

cd "$(dirname "$0")"

echo "Installing dependencies..."
npm install

echo "Building core..."
cd core && npm run build && cd ..

echo "Building VS Code extension..."
cd extensions/vscode
npm run esbuild
npm run package

echo "✅ Extension built: extensions/vscode/build/continue-*.vsix"
```

## Testing

After installing the extension:

1. Connect to an SSH remote (or open a dev container)
2. Open Continue's chat
3. Run: `run_terminal_command` with command `ping -c 4 8.8.8.8`
4. You should see:
   - The command executes in VS Code's terminal
   - The output appears in Continue's chat UI
   - No `ENOENT` errors

## What Changed

- **Simplified `runTerminalCommand.ts`**: From 823 lines to 77 lines
- **Removed**: All `child_process.spawn` logic, shell detection, retry mechanisms
- **Added**: Simple delegation to `extras.ide.runCommand()` with output capture
- **Works in**: SSH remotes, dev containers, local workspaces (via VS Code's terminal API)

## Troubleshooting

- **Build fails**: Make sure all dependencies are installed (`npm install` from root)
- **Extension doesn't load**: Check VS Code Developer Console for errors
- **No output captured**: The output capture uses VS Code's clipboard method - ensure terminal is visible and command completes
