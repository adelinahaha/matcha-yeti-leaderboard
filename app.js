const { useState, useEffect } = React;

const Check = () => <span style={{fontSize: '20px'}}>✓</span>;
const X = () => <span style={{fontSize: '20px'}}>✕</span>;
const Shuffle = () => <span style={{fontSize: '20px'}}>🔀</span>;

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundImage: 'url(https://i.imgur.com/D6OZc8F.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#4ade80'
  },
  nav: {
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navButton: {
    color: '#16a34a',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '8px 12px'
  },
  hero: {
    padding: '40px 20px',
    textAlign: 'center'
  },
  mainContent: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 16px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '2px solid black',
    boxShadow: '4px 4px 0 black'
  },
  heroCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px 24px',
    border: '3px solid black',
    boxShadow: '6px 6px 0 black',
    maxWidth: '500px',
    margin: '0 auto'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'black',
    marginBottom: '16px',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  prizeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  prizeBox: {
    border: '2px solid black',
    borderRadius: '8px',
    padding: '12px',
    background: 'white',
    textAlign: 'center'
  },
  prizeImage: {
    width: '100%',
    height: '120px',
    objectFit: 'contain',
    marginBottom: '8px'
  },
  prizeLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'black',
    marginBottom: '2px'
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '2px solid black',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '12px',
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid black',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
    boxSizing: 'border-box'
  }
};

const MatchaYetiLeaderboard = () => {
  const [view, setView] = useState('landing');
  const [submissions, setSubmissions] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [raffleWinner, setRaffleWinner] = useState(null);
  const [showRaffleAnimation, setShowRaffleAnimation] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subsResult = await window.storage.get('approved-submissions');
      const pendingResult = await window.storage.get('pending-submissions');
      
      if (subsResult?.value) {
        setSubmissions(JSON.parse(subsResult.value));
      }
      if (pendingResult?.value) {
        setPendingSubmissions(JSON.parse(pendingResult.value));
      }
    } catch (error) {
      console.log('No existing data found');
    }
  };

  const saveSubmissions = async (subs) => {
    try {
      await window.storage.set('approved-submissions', JSON.stringify(subs));
      setSubmissions(subs);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const savePending = async (pending) => {
    try {
      await window.storage.set('pending-submissions', JSON.stringify(pending));
      setPendingSubmissions(pending);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const extractUsername = (url) => {
    if (url.includes('x.com') || url.includes('twitter.com')) {
      const match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?]+)/);
      return match ? `@${match[1]}` : 'Anonymous';
    }
    if (url.includes('warpcast.com')) {
      const match = url.match(/warpcast\.com\/([^\/\?]+)/);
      return match ? `@${match[1]}` : 'Anonymous';
    }
    return 'Anonymous';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postUrl.trim()) return;
    
    setSubmitting(true);
    const username = extractUsername(postUrl);
    
    const newSubmission = {
      id: Date.now(),
      username,
      postUrl,
      timestamp: new Date().toISOString(),
      approved: false
    };
    
    const updated = [...pendingSubmissions, newSubmission];
    savePending(updated);
    
    setPostUrl('');
    setSubmitting(false);
    alert('✅ You\'re in the raffle!\n\nYour entry has been submitted and is being reviewed by the Yeti itself.\n\nRaffle winner announced:\n📅 February 20 at 3pm\n📍 At the Matcha Garden\n\nGood luck! 🍀');
  };

  const approveSubmission = async (submission, hasYeti, isCreative) => {
    let points = 10;
    if (hasYeti) points = 20;
    if (isCreative) points += 20;
    
    const approved = {
      ...submission,
      points,
      hasYeti,
      isCreative,
      approved: true
    };
    
    const updatedApproved = [...submissions, approved];
    const updatedPending = pendingSubmissions.filter(s => s.id !== submission.id);
    
    await saveSubmissions(updatedApproved);
    await savePending(updatedPending);
  };

  const rejectSubmission = async (submissionId) => {
    const updatedPending = pendingSubmissions.filter(s => s.id !== submissionId);
    await savePending(updatedPending);
  };

  const runRaffle = () => {
    if (submissions.length === 0) {
      alert('No submissions yet!');
      return;
    }
    
    setShowRaffleAnimation(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * submissions.length);
      setRaffleWinner(submissions[randomIndex]);
      count++;
      
      if (count > 20) {
        clearInterval(interval);
        setShowRaffleAnimation(false);
      }
    }, 100);
  };

  const leaderboard = [...submissions].sort((a, b) => b.points - a.points).slice(0, 10);

  // ADMIN LOGIN
  if (view === 'admin' && !isAdmin) {
    return (
      <div style={{...styles.container, padding: '40px 16px', background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)'}}>
        <div style={{maxWidth: '400px', margin: '0 auto', ...styles.card}}>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '20px', textAlign: 'center'}}>🏔️ Yeti Command Center</h2>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter admin password"
            style={styles.input}
          />
          <button
            onClick={() => {
              if (adminPassword === 'yeti2026') {
                setIsAdmin(true);
              } else {
                alert('Wrong password!');
              }
            }}
            style={{...styles.button, background: '#16a34a', color: 'white', border: '2px solid #16a34a'}}
          >
            Access Admin Panel
          </button>
          <button
            onClick={() => setView('landing')}
            style={{...styles.button, background: 'white', color: '#16a34a', marginBottom: 0}}
          >
            Back to Landing
          </button>
        </div>
      </div>
    );
  }

  // ADMIN PANEL
  if (view === 'admin' && isAdmin) {
    return (
      <div style={{...styles.container, background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)'}}>
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <a href="https://matcha.xyz/" target="_blank" rel="noopener noreferrer">
              <img src="https://i.imgur.com/MdOOrcp.png" alt="matcha.xyz" style={{height: '32px'}} />
            </a>
            <button onClick={() => { setView('landing'); setIsAdmin(false); }} style={styles.navButton}>Exit Admin</button>
          </div>
        </nav>
        
        <div style={{maxWidth: '900px', margin: '0 auto', padding: '24px 16px'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', color: '#166534', marginBottom: '24px', textAlign: 'center'}}>🏔️ Yeti Command Center</h1>

          <div style={{...styles.card, background: '#f0fdf4'}}>
            <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#166534', marginBottom: '16px'}}>🎲 Run Raffle</h3>
            <button onClick={runRaffle} style={{...styles.button, background: '#16a34a', color: 'white', border: '2px solid #16a34a'}}>
              <Shuffle /> Let the Yeti Decide
            </button>
            {raffleWinner && (
              <div style={{marginTop: '16px', padding: '16px', background: 'white', borderRadius: '8px', border: '2px solid #16a34a'}}>
                <p style={{fontSize: '16px', fontWeight: 'bold', color: '#166534'}}>
                  {showRaffleAnimation ? '🎰 Selecting...' : '🎉 WINNER:'}
                </p>
                <p style={{fontSize: '24px', fontWeight: 'bold', color: '#16a34a'}}>{raffleWinner.username}</p>
                <p style={{fontSize: '14px', color: '#6b7280'}}>{raffleWinner.points} points</p>
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={{fontSize: '18px', fontWeight: 'bold', color: '#166534', marginBottom: '16px'}}>
              Pending Submissions ({pendingSubmissions.length})
            </h3>
            {pendingSubmissions.length === 0 ? (
              <p style={{color: '#6b7280'}}>No pending submissions</p>
            ) : (
              <div>
                {pendingSubmissions.map((sub) => (
                  <PendingSubmissionCard
                    key={sub.id}
                    submission={sub}
                    onApprove={approveSubmission}
                    onReject={rejectSubmission}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={{fontSize: '18px', fontWeight: 'bold', color: '#166534', marginBottom: '16px'}}>
              Approved Submissions ({submissions.length})
            </h3>
            {submissions.map((sub) => (
              <div key={sub.id} style={{padding: '12px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <p style={{fontWeight: '600', color: '#166534', fontSize: '14px'}}>{sub.username}</p>
                  <p style={{fontSize: '12px', color: '#6b7280'}}>
                    {sub.points} pts {sub.hasYeti && '🏔️'} {sub.isCreative && '⚡'}
                  </p>
                </div>
                <a href={sub.postUrl} target="_blank" rel="noopener noreferrer" style={{color: '#16a34a', fontSize: '12px'}}>
                  View →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // LEADERBOARD
  if (view === 'leaderboard') {
    return (
      <div style={{...styles.container, backgroundImage: 'url(https://i.imgur.com/vuYDe2J.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh'}}>
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <a href="https://matcha.xyz/" target="_blank" rel="noopener noreferrer">
              <img src="https://i.imgur.com/MdOOrcp.png" alt="matcha.xyz" style={{height: '32px'}} />
            </a>
            <button onClick={() => setView('landing')} style={{...styles.navButton, fontSize: '16px', fontWeight: 'bold'}}>Home</button>
          </div>
        </nav>
        
        <div style={{maxWidth: '700px', margin: '0 auto', padding: '24px 16px'}}>
          <div style={{background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '24px', border: '2px solid black', boxShadow: '4px 4px 0 black'}}>
            <h1 style={{fontSize: '28px', fontWeight: 'bold', color: '#166534', marginBottom: '24px', textAlign: 'center'}}>Yeti-Approved Sightings</h1>

            {leaderboard.length === 0 ? (
              <div style={{textAlign: 'center', padding: '32px 0'}}>
                <p style={{fontSize: '16px', color: '#6b7280', marginBottom: '16px'}}>The Yeti awaits the first sighting...</p>
                <button onClick={() => setView('landing')} style={{...styles.button, background: '#16a34a', color: 'white', border: '2px solid #16a34a', width: 'auto', padding: '12px 24px', margin: '0 auto'}}>
                  Be The First →
                </button>
              </div>
            ) : (
              <div>
                {leaderboard.map((sub, index) => (
                  <div
                    key={sub.id}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: index === 0 ? '#fef3c7' : index === 1 ? '#f3f4f6' : index === 2 ? '#fed7aa' : 'white',
                      border: '2px solid',
                      borderColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#fb923c' : '#d1fae5'
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#166534', minWidth: '36px'}}>
                        #{index + 1}
                      </div>
                      <div>
                        <p style={{fontSize: '16px', fontWeight: 'bold', color: '#166534'}}>{sub.username}</p>
                        <div style={{display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap'}}>
                          {sub.hasYeti && <span style={{fontSize: '10px', background: '#86efac', padding: '2px 6px', borderRadius: '4px'}}>Yeti</span>}
                          {sub.isCreative && <span style={{fontSize: '10px', background: '#e9d5ff', padding: '2px 6px', borderRadius: '4px'}}>Creative</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <p style={{fontSize: '24px', fontWeight: 'bold', color: '#16a34a'}}>{sub.points}</p>
                      <p style={{fontSize: '11px', color: '#6b7280'}}>pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LANDING PAGE
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <a href="https://matcha.xyz/" target="_blank" rel="noopener noreferrer">
            <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894649/Matcha-lockup-green_1_wdii0l.png" alt="matcha.xyz" style={{height: '32px'}} />
          </a>
          <div style={{display: 'flex', gap: '12px'}}>
            <button onClick={() => setView('leaderboard')} style={styles.navButton}>Leaderboard</button>
            <button onClick={() => setView('admin')} style={styles.navButton}>Admin</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroCard}>
          <h1 style={styles.title}>
            Spot the Matcha Yeti<br/>at ETHDenver
          </h1>
          <p style={styles.subtitle}>
            Enter to win a limited-edition YETI Tundra cooler & more
          </p>
          
          <div style={{borderTop: '2px solid black', borderBottom: '2px solid black', padding: '16px 0', margin: '20px 0'}}>
            <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>How to enter</h3>
            <ol style={{textAlign: 'left', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', color: '#374151'}}>
              <li>Take a pic of anything Matcha-related at ETHDenver</li>
              <li>Post it on X or Farcaster + tag @matchaxyz</li>
              <li>Paste the link here to lock in your entry</li>
            </ol>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        {/* PRIZES */}
        <div style={{...styles.card, marginTop: '24px'}}>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px'}}>Everything you can win</h2>
          
          <div style={styles.prizeGrid}>
            <div style={styles.prizeBox}>
              <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894654/yetiiii_fqfrds.jpg" alt="YETI Cooler" style={styles.prizeImage} />
              <p style={styles.prizeLabel}>YETI Tundra Cooler</p>
              <p style={{fontSize: '10px', color: '#6b7280'}}>Grand Prize</p>
            </div>
            
            <div style={styles.prizeBox}>
              <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894660/balaclava_prize_x0fmyh.jpg" alt="Balaclava" style={styles.prizeImage} />
              <p style={styles.prizeLabel}>Balaclava Ski Hats</p>
              <p style={{fontSize: '10px', color: '#6b7280'}}>Top 10 Leaderboard</p>
            </div>
            
            <div style={styles.prizeBox}>
              <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894660/asteryx_beanie_prize_frjhen.jpg" alt="Beanie" style={styles.prizeImage} />
              <p style={styles.prizeLabel}>Matcha Beanies</p>
              <p style={{fontSize: '10px', color: '#6b7280'}}>Plinko Winners</p>
            </div>
            
            <div style={styles.prizeBox}>
              <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894660/cuppy_oezkzh.jpg" alt="Matcha Latte" style={styles.prizeImage} />
              <p style={styles.prizeLabel}>Matcha Latte</p>
              <p style={{fontSize: '10px', color: '#6b7280'}}>At the Garden</p>
            </div>
          </div>
        </div>

        {/* ENTER THE RAFFLE */}
        <div style={styles.card}>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px'}}>Enter the raffle</h2>
          
          <a
            href="https://x.com/intent/tweet?text=Just%20hit%20up%20the%20%40matchaxyz%20Matcha%20Garden%20at%20%23ETHDenver!%20%F0%9F%8D%B5%F0%9F%8F%94%EF%B8%8F%0A%0ASmoothest%20swaps%2C%20actual%20matcha%2C%20legendary%20vibes."
            target="_blank"
            rel="noopener noreferrer"
            style={{...styles.button, background: 'black', color: 'white', border: '2px solid black'}}
          >
            POST ON X
          </a>
          
          <a
            href="https://warpcast.com/~/compose?text=Just%20hit%20up%20the%20%40matchaxyz%20Matcha%20Garden%20at%20%23ETHDenver!%20%F0%9F%8D%B5%F0%9F%8F%94%EF%B8%8F%0A%0ASmoothest%20swaps%2C%20actual%20matcha%2C%20legendary%20vibes."
            target="_blank"
            rel="noopener noreferrer"
            style={{...styles.button, background: '#7c3aed', color: 'white', border: '2px solid #7c3aed'}}
          >
            POST ON FARCASTER
          </a>

          <p style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', marginTop: '16px'}}>Already posted? Submit your entry:</p>
          <input
            type="url"
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            placeholder="Paste your post link here"
            style={styles.input}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{...styles.button, background: '#16a34a', color: 'white', border: '2px solid #16a34a', opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer'}}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>

          <div style={{background: '#f9fafb', padding: '12px', borderRadius: '8px', marginTop: '16px'}}>
            <p style={{fontSize: '13px', color: '#374151', lineHeight: '1.6'}}>
              📸 Any Matcha post = +10 pts<br/>
              🏔️ Yeti spotted = +20 pts<br/>
              ⚡ Extra creative = +20 bonus pts
            </p>
          </div>
        </div>

        {/* WINNER ANNOUNCEMENT */}
        <div style={{...styles.card, background: 'linear-gradient(to right, #15803d, #166534)', color: 'white', textAlign: 'center'}}>
          <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#86efac'}}>WINNER ANNOUNCED ON</h3>
          <p style={{fontSize: '32px', fontWeight: '900', marginBottom: '20px'}}>FEB 20</p>
          <p style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '20px'}}>Claim your prize at the<br/>Matcha Garden</p>
          <div style={{height: '1px', background: 'rgba(134, 239, 172, 0.3)', margin: '20px 0'}}></div>
          <p style={{fontSize: '13px', color: '#a7f3d0', marginBottom: '6px'}}>Questions or Updates?</p>
          <a href="https://x.com/matchaxyz" target="_blank" rel="noopener noreferrer" style={{fontSize: '16px', fontWeight: 'bold', color: '#86efac', textDecoration: 'none'}}>
            x.com/matchaxyz →
          </a>
        </div>
      </div>
    </div>
  );
};

const PendingSubmissionCard = ({ submission, onApprove, onReject }) => {
  const [hasYeti, setHasYeti] = useState(false);
  const [isCreative, setIsCreative] = useState(false);

  return (
    <div style={{background: '#f9fafb', border: '2px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '12px'}}>
      <div style={{marginBottom: '12px'}}>
        <p style={{fontWeight: 'bold', color: '#166534', fontSize: '16px'}}>{submission.username}</p>
        <a href={submission.postUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: '12px', color: '#16a34a'}}>
          View Post →
        </a>
        <p style={{fontSize: '11px', color: '#6b7280', marginTop: '4px'}}>
          {new Date(submission.timestamp).toLocaleString()}
        </p>
      </div>

      <div style={{display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap'}}>
        <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px'}}>
          <input
            type="checkbox"
            checked={hasYeti}
            onChange={(e) => setHasYeti(e.target.checked)}
            style={{width: '18px', height: '18px'}}
          />
          <span>🏔️ Yeti (+10 pts)</span>
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px'}}>
          <input
            type="checkbox"
            checked={isCreative}
            onChange={(e) => setIsCreative(e.target.checked)}
            style={{width: '18px', height: '18px'}}
          />
          <span>⚡ Creative (+20 pts)</span>
        </label>
      </div>

      <div style={{display: 'flex', gap: '8px'}}>
        <button
          onClick={() => onApprove(submission, hasYeti, isCreative)}
          style={{flex: 1, background: '#16a34a', color: 'white', padding: '10px', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '13px'}}
        >
          ✓ Approve
        </button>
        <button
          onClick={() => onReject(submission.id)}
          style={{flex: 1, background: '#dc2626', color: 'white', padding: '10px', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '13px'}}
        >
          ✕ Reject
        </button>
      </div>
    </div>
  );
};

ReactDOM.render(<MatchaYetiLeaderboard />, document.getElementById('root'));
