const shell = require('shelljs');

console.log('Pre-push hook starts executing');

// Get current branch name
const currentBranch = shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim();

if (currentBranch === 'develop') {
    console.log('Current branch is develop. Running npm run main...');
    const mergeResult = shell.exec('npm run main');

    if (mergeResult.code !== 0) {
        console.error('Merge to main failed, push aborted');
        shell.exit(1);
    }
    console.log('Merge to main completed successfully');
} else if (currentBranch === 'main') {
    console.log('Current branch is main. Running npm version patch...');
    console.log('运行测试...');
    const testResult = shell.exec('npm test');
    
    if (testResult.code !== 0) {
        console.error('测试失败，推送已中止');
        shell.exit(1);
    }
    console.log('测试通过成功');
    const versionResult = shell.exec('npm run dev');

    if (versionResult.code !== 0) {
        console.error('npm version patch failed, push aborted');
        shell.exit(1);
    }
    console.log('npm version patch completed successfully');
} else {
    console.log(`Current branch is ${currentBranch}. Skipping npm run main and npm version patch.`);
}

console.log('Pre-push hook execution completed');