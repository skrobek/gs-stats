const gitlog = require('./gitlog').default;

const console = require('better-console');

const format = require('date-fns/format');
const subMonths = require('date-fns/subMonths');
const startOfMonth = require('date-fns/startOfMonth');
var endOfMonth = require('date-fns/endOfMonth')

// const frontend = ['tsx', 'ts'];
const ruby = ['rb'];
const kotlin = ['kt', 'kts'];


const getStats = (after, before) => {
  const mappedCommits = {
    // frontend: [],
    ruby: [],
    kotlin: [],
  };

  const options = {
    // since,
    after,
    before,
    repo: "./../ocean",
    number: 100,
    includeMergeCommitFiles: true,
    fields: [
      "hash",
      "abbrevHash",
      "treeHash",
      "abbrevTreeHash",
      "parentHashes",
      "abbrevParentHashes",
      "authorName",
      "authorEmail",
      "authorDate",
      "authorDateRel",
      "committerName",
      "committerEmail",
      "committerDate",
      "committerDateRel",
      "subject"
    ],
  };

  // Synchronous
  const commits = gitlog(options);
  const mergeTitle = 'Merge pull request #';
  let languageChangePrs = 0;

  const filteredCommits = commits
    .filter((commit) => {
      const { committerName, subject } = commit;

      return committerName == 'GitHub' &&
        subject.startsWith(mergeTitle) &&
        !subject.includes('dependabot') &&
        !subject.includes('renovate');
    });

  filteredCommits.forEach((commit) => {
    const checkFiles = (extensionsList) => {
      return commit.files.filter((pathname) => {
        const ext = pathname.split('.').pop();
        return extensionsList.includes(ext);
      })
    }

    // const frontendFiles = checkFiles(frontend);
    // mappedCommits.frontend.push(frontendFiles.length);

    const rubyFiles = checkFiles(ruby);
    mappedCommits.ruby.push(rubyFiles.length);

    const kotlinFiles = checkFiles(kotlin);
    mappedCommits.kotlin.push(kotlinFiles.length);

    // if (frontendFiles.length > 0 || rubyFiles.length > 0 || kotlinFiles.length > 0) {
    if (rubyFiles.length > 0 || kotlinFiles.length > 0) {
      languageChangePrs++;
    }
  })

  const stats = Object.keys(mappedCommits)
    .map(key => {
      const pullRequestsCount = mappedCommits[key]
        .filter((item) => !!item).length

      const filesChanged = mappedCommits[key]
        .reduce((previousValue, currentValue) => previousValue + currentValue)

      const percentage = Math.round(pullRequestsCount / languageChangePrs * 100);

      return {
        language: key,
        filesChanged,
        pullRequestsCount,
        percentage: `${percentage}%`
      }
    });

  return stats;
}


const monthsBack = 3

for (let i = 0; i < monthsBack; i++) {
  const date = subMonths(new Date(), i + 1);
  console.info(format(startOfMonth(date), 'LLLL'));
  console.table(getStats(startOfMonth(date), endOfMonth(date)));
}

