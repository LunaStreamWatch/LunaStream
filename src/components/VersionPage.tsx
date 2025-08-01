import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Clock,
  GitBranch,
  Calendar,
  Code,
  RefreshCw,
  ExternalLink,
  User,
  AlertCircle,
  Info,
} from 'lucide-react';
import { github, GitHubCommit, GitHubRepo } from '../services/github';
import GlobalNavbar from './GlobalNavbar';
import { useLanguage } from './LanguageContext';
import { translations } from '../data/i18n';

const VersionPage: React.FC = () => {
  const [commitInfo, setCommitInfo] = useState<GitHubCommit | null>(null);
  const [commitInfoList, setCommitInfoList] = useState<GitHubCommit[]>([]);
  const [repoInfo, setRepoInfo] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const GITHUB_OWNER = 'Waitlists'; // Replace with your GitHub username
  const GITHUB_REPO = 'lunastream'; // Replace with your repository name
  const GITHUB_BRANCH = 'main'; // Replace if different

  const isGitHubConfigured =
    GITHUB_OWNER !== 'your-username' && GITHUB_OWNER.trim() !== '';

  const currentTime = new Date();
  const lastModified = new Date(document.lastModified);

  const versionInfo = {
    version: '2.1.0',
    buildDate: lastModified,
    environment: 'production',
  };

  const fetchGitHubData = async () => {
    if (!isGitHubConfigured) {
      setError(
        'GitHub integration not configured. Please update GITHUB_OWNER in the code.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchWithRetry = async (fn: () => Promise<any>, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch {
            if (i === retries - 1) throw {};
          }
        }
      };

      const [commit, repo, commits] = await Promise.all([
        fetchWithRetry(() =>
          github.getLatestCommit(GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH)
        ),
        fetchWithRetry(() =>
          github.getRepoInfo(GITHUB_OWNER, GITHUB_REPO)
        ),
        fetchWithRetry(() =>
          github.getCommits(GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, 6)
        ),
      ]);

      setCommitInfo(commit);
      setRepoInfo(repo);
      setCommitInfoList(commits);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch GitHub data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGitHubConfigured) {
      fetchGitHubData();
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <GlobalNavbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Version Information
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
            {t.version_build_info}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">
            Last refreshed: {formatDate(lastRefresh)}
          </p>
        </div>

        {/* GitHub Configuration Notice */}
        {!isGitHubConfigured && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mb-8 transition-colors duration-300">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-800 dark:text-blue-300 font-semibold transition-colors duration-300">
                  GitHub Integration Available
                </h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-1 transition-colors duration-300">
                  To enable real-time repository and commit information, update the{' '}
                  <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">GITHUB_OWNER</code> constant{' '}
                  in the VersionPage component with your actual GitHub username.
                </p>
                <p className="text-blue-500 dark:text-blue-400 text-xs mt-2 transition-colors duration-300">
                  Current configuration: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{GITHUB_OWNER}/{GITHUB_REPO}</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && isGitHubConfigured && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 mb-8 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold transition-colors duration-300">
                  Failed to fetch GitHub data
                </h3>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                  {error}
                </p>
                <button
                  onClick={fetchGitHubData}
                  disabled={loading}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center my-12">
            <RefreshCw className="w-10 h-10 text-pink-600 animate-spin" />
          </div>
        )}

        {/* Repository & Commit Info */}
        {!loading && commitInfo && repoInfo && (
          <div className="space-y-12">
            {/* Repo Info */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Repository Information
              </h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <span>Default Branch: <strong>{repoInfo.default_branch}</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Owner: <strong>{repoInfo.owner.login}</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Created At: <strong>{formatDate(new Date(repoInfo.created_at))}</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <span>Last Updated: <strong>{formatDate(new Date(repoInfo.updated_at))}</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExternalLink className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <a
                    href={repoInfo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    View on GitHub
                  </a>
                </li>
              </ul>
            </section>

            {/* Latest Commit Info */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Latest Commit
              </h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <span>SHA: <code>{commitInfo.sha}</code></span>
                </li>
                <li className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Author: <strong>{commitInfo.commit.author.name}</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Date: <strong>{formatDate(new Date(commitInfo.commit.author.date))}</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <span>Message: {commitInfo.commit.message}</span>
                </li>
                <li>
                  <a
                    href={commitInfo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-pink-600 dark:text-pink-400 hover:underline"
                  >
                    View Commit on GitHub
                  </a>
                </li>
              </ul>
            </section>

            {/* Recent Commits List */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Recent Commits
              </h2>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {commitInfoList.map((commit) => (
                  <li key={commit.sha} className="py-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 rounded">
                        {commit.sha.substring(0, 7)}
                      </code>
                      <div className="flex-1 text-gray-700 dark:text-gray-300 text-sm truncate">
                        {commit.commit.message}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(commit.commit.author.date).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Static Version Info */}
        <section className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Application Version: <span className="font-mono">{versionInfo.version}</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Built on: {formatDate(versionInfo.buildDate)}
          </p>
          <p className="text-gray-600 dark:text-gray-400">Environment: {versionInfo.environment}</p>
        </section>
      </div>
    </div>
  );
};

export default VersionPage;
