import path = require('path');
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');

// The CocoaPods install command is documented here:
// https://guides.cocoapods.org/terminal/commands.html#pod_install

async function run() {
    try {
        // Set path to resource strings
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Change to configured working directory
        tl.cd(tl.getPathInput('cwd', true, true));

        // Set locale to UTF-8
        tl.debug('Setting locale to UTF8 as required by CocoaPods');
        process.env['LC_ALL'] = 'en_US.UTF-8';

        // Locate the CocoaPods 'pod' command
        var podPath: string = tl.which('pod');
        if (!podPath) {
            throw new Error(tl.loc('CocoaPodsNotFound'));
        }

        // Prepare to run 'pod install'
        var pod: trm.ToolRunner = tl.tool(podPath);
        pod.arg('install');

        // Force updating the pod repo before install?
        if (tl.getBoolInput('forceRepoUpdate', true)) {
            pod.arg('--repo-update');
        }

        // Explicitly specify a project directory?
        var projectDirectory: string = tl.getPathInput('projectDirectory', false, true);
        if (projectDirectory) {
            pod.arg('--project-directory=' + projectDirectory);
        }

        // Execute
        var returnCode: number = await pod.exec();
        
        // Get the result code and set the task result accordingly
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('PodReturnCode', returnCode));
    }
    catch(err) {
        // Report failure
        tl.error(err.message);
        tl.setResult(tl.TaskResult.Failed, tl.loc('PodFailed', err.message));
    }
}

run();
