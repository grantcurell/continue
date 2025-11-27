import { ToolImpl } from ".";
import { getStringArg } from "../parseArgs";

export const runTerminalCommandImpl: ToolImpl = async (args, extras) => {
  const command = getStringArg(args, "command");

  // Run the command in VS Code's terminal (handles SSH/devcontainer/local correctly)
  await extras.ide.runCommand(command);

  // Wait a bit for the command to execute, then capture output
  // This is a simple approach - wait 2 seconds for quick commands,
  // or up to 10 seconds for longer ones
  let output = "";
  const maxWaitTime = 10000; // 10 seconds max
  const checkInterval = 500; // Check every 500ms
  let waited = 0;

  while (waited < maxWaitTime) {
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
    waited += checkInterval;

    try {
      const terminalOutput = await extras.ide.getTerminalContents();
      // Extract just the command output (remove the command itself and prompt)
      const lines = terminalOutput.split("\n");
      // Find the line with our command
      const commandIndex = lines.findIndex((line) =>
        line.trim().endsWith(command.trim()),
      );
      if (commandIndex >= 0) {
        // Get everything after the command
        output = lines
          .slice(commandIndex + 1)
          .join("\n")
          .trim();
        // If we got output and it's not just a prompt, we're done
        if (output && !output.match(/^[\$#%>]\s*$/)) {
          break;
        }
      } else if (terminalOutput.includes(command)) {
        // Command is in output, try to extract just the result
        const parts = terminalOutput.split(command);
        if (parts.length > 1) {
          output = parts[parts.length - 1].trim();
          // Remove prompt if present
          output = output.replace(/^[\$#%>]\s*/, "").trim();
          if (output) {
            break;
          }
        }
      }
    } catch (error) {
      // If getTerminalContents fails, just use empty output
      break;
    }
  }

  // If we still don't have output, try one more time
  if (!output) {
    try {
      const terminalOutput = await extras.ide.getTerminalContents();
      output = terminalOutput.trim();
    } catch {
      // Ignore errors
    }
  }

  return [
    {
      name: "Terminal",
      description: "Command executed in IDE terminal",
      content: output || "Command executed (output not captured)",
      status: "completed",
    },
  ];
};
