
export default function OutputPanel({ submission, isRunning }) {
  if (isRunning) {
    return (
      <div className="panel" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="panel-title">Execution Results</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <div className="loader" style={{
            width: '20px',
            height: '20px',
            border: '2px solid var(--color-accent)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Running code inside secure Docker sandbox...</span>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="panel" style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
        <div className="panel-title">Execution Results</div>
        <p>Ready to run code. Setup your inputs and click "Run Code" to execute.</p>
      </div>
    );
  }

  const getVerdictBadgeClass = (verdict) => {
    switch (verdict) {
      case 'AC': return 'badge badge-ac';
      case 'WA': return 'badge badge-wa';
      case 'TLE': return 'badge badge-tle';
      case 'RTE': return 'badge badge-rte';
      case 'CE': return 'badge badge-ce';
      case 'PENDING': return 'badge badge-pending';
      case 'RUNNING': return 'badge badge-running';
      default: return 'badge';
    }
  };

  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'AC': return 'Accepted';
      case 'WA': return 'Wrong Answer';
      case 'TLE': return 'Execution Timeout Exceeded';
      case 'RTE': return 'Runtime Error';
      case 'CE': return 'Compilation Error';
      case 'SYSTEM_ERROR': return 'System Error';
      case 'PENDING': return 'Pending';
      case 'RUNNING': return 'Running';
      default: return verdict;
    }
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderBottom: 'none' }}>
      <div className="panel-title">Execution Results</div>
      
      {/* Verdict Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        backgroundColor: '#161a22',
        borderRadius: '8px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Verdict:</span>
          <span className={getVerdictBadgeClass(submission.verdict)}>{getVerdictLabel(submission.verdict)}</span>
        </div>
        {submission.verdict !== 'PENDING' && submission.verdict !== 'RUNNING' && submission.verdict !== 'CE' && (
          <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <div>Time: <strong style={{ color: '#fff' }}>{submission.executionTime} ms</strong></div>
            <div>Memory: <strong style={{ color: '#fff' }}>{submission.memoryUsed ? submission.memoryUsed.toFixed(1) : 0} MB</strong></div>
          </div>
        )}
      </div>

      {/* Compiler Error display */}
      {submission.verdict === 'CE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-warning)' }}>Compilation Error Details</span>
          <pre style={{
            backgroundColor: '#1b1f23',
            border: '1px solid rgba(241, 196, 110, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-warning)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            textAlign: 'left'
          }}>{submission.error}</pre>
        </div>
      )}

      {/* System Error display */}
      {submission.verdict === 'SYSTEM_ERROR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-error)' }}>System Error Details</span>
          <pre style={{
            backgroundColor: '#1b1f23',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-error)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            textAlign: 'left'
          }}>{submission.error}</pre>
        </div>
      )}

      {/* Test Cases Results */}
      {submission.results && submission.results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          {submission.results.map((res, index) => (
            <div key={res._id || index} style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: '#12161a',
                padding: '8px 12px',
                fontSize: '12px',
                borderBottom: '1px solid var(--color-border)'
              }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Test Case #{index + 1}</span>
                <span className={getVerdictBadgeClass(res.status)}>{getVerdictLabel(res.status)}</span>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Input:</div>
                  <pre style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {res.input || '(empty)'}
                  </pre>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Expected Output:</div>
                  <pre style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--color-success)' }}>
                    {res.expectedOutput || '(empty)'}
                  </pre>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Actual Output:</div>
                  <pre style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: res.status === 'AC' ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {res.output || '(no output)'}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
