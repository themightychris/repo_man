const netrc = require('netrc')();
const octokit = require('@octokit/rest')();
const TOML = require('@iarna/toml');
const fs = require('mz/fs');


// authenticate via ~/.netrc configuration
octokit.authenticate({
    type: 'basic',
    username: netrc['api.github.com'].login,
    password: netrc['api.github.com'].password
});


// execute command with CLI arguments
dumpLabels(process.argv[2], process.argv[3]);


// command implementation
async function dumpLabels(repoIdent, file) {
    const [owner, repo] = repoIdent.split('/', 2);

    const result = await octokit.issues.getLabels({
        owner,
        repo,
        per_page: 1000,
        headers: {
            accept: 'application/vnd.github.symmetra-preview+json'
        }
    });

    const labels = result.data.map(label => ({
        name: label.name,
        description: label.description,
        color: label.color
    }));

    await fs.writeFile(file || `${repo}.toml`, TOML.stringify({
        repositories: [repoIdent],
        labels
    }));
}
