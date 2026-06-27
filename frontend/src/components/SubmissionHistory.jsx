import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'badge-success';
      case 'wrong': return 'badge-error';
      case 'error': return 'badge-warning';
      case 'pending': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content-fade">
      <h2 className="editorial-header-creative">Submission History</h2>

      {submissions.length === 0 ? (
        <p className="editorial-text-block opacity-60">No submissions found for this problem</p>
      ) : (
        <div className="editorial-table-wrapper">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Language</th>
                <th>Status</th>
                <th>Runtime</th>
                <th>Memory</th>
                <th>Test Cases</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, index) => (
                <tr key={sub._id}>
                  <td>{index + 1}</td>
                  <td className="font-mono text-[12px] opacity-80">{sub.language}</td>
                  <td>
                    <span className={`editorial-status-badge ${sub.status === 'accepted' ? 'status-accepted' :
                        sub.status === 'error' ? 'status-error' : 'status-warning'
                      }`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>

                  <td className="font-mono text-[12px] opacity-80">{sub.runtime}s</td>
                  <td className="font-mono text-[12px] opacity-80">{formatMemory(sub.memory)}</td>
                  <td className="font-mono text-[12px] opacity-80">{sub.testCasesPassed}/{sub.testCasesTotal}</td>
                  <td className="text-[12px] opacity-60">{formatDate(sub.createdAt)}</td>
                  <td>
                    <button
                      className="editorial-btn-premium !py-1 !px-3"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      View Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Premium Editorial Modal */}
      {selectedSubmission && (
        <div className="editorial-modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="editorial-modal-content" onClick={e => e.stopPropagation()}>
            <div className="editorial-modal-header p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="editorial-section-title !m-0">
                  {selectedSubmission.language} Submission
                </h3>
                <div className="flex gap-4 mt-2">
                  <span className={`editorial-status-badge ${selectedSubmission.status === 'accepted' ? 'status-accepted' : 'status-error'
                    }`}>
                    {selectedSubmission.status}
                  </span>
                  <span className="text-[11px] font-heading uppercase tracking-widest text-[#D4AF37]/60">
                    Passed: {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                  </span>
                </div>
              </div>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-white/20 transition-all"
                onClick={() => setSelectedSubmission(null)}
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {selectedSubmission.errorMessage && (
                <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm font-body">
                  {selectedSubmission.errorMessage}
                </div>
              )}
              <pre className="p-8 bg-transparent text-[#E8EDF2] font-mono text-sm leading-relaxed overflow-x-auto m-0">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;