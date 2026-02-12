const { useState, useEffect } = React;

const Check = () => <span style={{fontSize: '20px'}}>✓</span>;
const X = () => <span style={{fontSize: '20px'}}>✕</span>;
const Shuffle = () => <span style={{fontSize: '20px'}}>🔀</span>;

const storage = {
  get: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return { value };
    } catch {
      return null;
    }
  }
};

const getLeaderboardColor = (index) => {
  if (index === 0) return { bg: '#166534', border: '#14532d', text: 'white' };
  if (index === 1) return { bg: '#16a34a', border: '#15803d', text: 'white' };
  if (index === 2) return { bg: '#22c55e', border: '#16a34a', text: 'white' };
  if (index < 10) return { bg: '#86efac', border: '#4ade80', text: '#166534' };
  return { bg: 'white', border: '#d1fae5', text: '#166534' };
};

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundImage: 'url(https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894642/Frame_1000005429_stqrl7.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#7c3aed'
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
  leaderboardButton: {
    background: '#16a34a',
    color: 'white',
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  },
  hero: {
    padding: '40px 20px',
    textAlign: 'center'
  },
  mainContent: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 16px 80px'
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
  },
  footer: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 40
  },
  adminLink: {
    fontSize: '11px',
    color: '#9ca3af',
    textDecoration: 'none',
    cursor: 'pointer',
    opacity: 0.5,
    background: 'none',
    border: 'none'
  }
};

const MatchaYetiLeaderboard = () => {
  const [view, setView] = useState('landing');
  const [submissions, setSubmissions] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [raffleWinners, setRaffleWinners] = useState([]);
  const [showRaffleAnimation, setShowRaffleAnimation] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});

  useEffect(() => {
    loadData();
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'leaderboard') setView('leaderboard');
      else if (hash === 'admin') setView('admin');
      else setView('landing');
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeView = (newView) => {
    if (newView === 'leaderboard') window.location.hash = 'leaderboard';
    else if (newView === 'admin') window.location.hash = 'admin';
    else window.location.hash = '';
  };

  const loadData = () => {
    try {
      const subsResult = storage.get('approved-submissions');
      const pendingResult = storage.get('pending-submissions');
      const winnersResult = storage.get('raffle-winners');
      
      if (subsResult?.value) {
        setSubmissions(JSON.parse(subsResult.value));
      }
      if (pendingResult?.value) {
        setPendingSubmissions(JSON.parse(pendingResult.value));
      }
      if (winnersResult?.value) {
        setRaffleWinners(JSON.parse(winnersResult.value));
      }
    } catch (error) {
      console.log('No existing data found');
    }
  };

  const saveSubmissions = (subs) => {
    try {
      storage.set('approved-submissions', JSON.stringify(subs));
      setSubmissions(subs);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const savePending = (pending) => {
    try {
      storage.set('pending-submissions', JSON.stringify(pending));
      setPendingSubmissions(pending);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const saveWinners = (winners) => {
    try {
      storage.set('raffle-winners', JSON.stringify(winners));
      setRaffleWinners(winners);
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

  const approveSubmission = (submission, hasYeti, isCreative) => {
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
    
    saveSubmissions(updatedApproved);
    savePending(updatedPending);
  };

  const rejectSubmission = (submissionId) => {
    const updatedPending = pendingSubmissions.filter(s => s.id !== submissionId);
    savePending(updatedPending);
  };

  const runRaffle = () => {
    const userScores = getUserLeaderboard();
    const eligibleUsers = userScores.filter(
      user => !raffleWinners.find(w => w.username === user.username)
    );
    
    if (eligibleUsers.length === 0) {
      alert('No eligible participants! All users have already won.');
      return;
    }
    
    setShowRaffleAnimation(true);
    let count = 0;
    let selectedWinner = null;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
      selectedWinner = eligibleUsers[randomIndex];
      count++;
      
      if (count > 20) {
        clearInterval(interval);
        setShowRaffleAnimation(false);
        const updatedWinners = [...raffleWinners, selectedWinner];
        saveWinners(updatedWinners);
      }
    }, 100);
  };

  const resetAllData = () => {
    const code = prompt('Enter confirmation code to reset all data:');
    if (code === 'RESET2026') {
      if (confirm('Are you sure? This will delete ALL submissions, winners, and pending entries. This cannot be undone!')) {
        localStorage.clear();
        setSubmissions([]);
        setPendingSubmissions([]);
        setRaffleWinners([]);
        alert('✅ All data has been reset!');
      }
    } else if (code !== null) {
      alert('❌ Wrong code!');
    }
  };

  const getUserLeaderboard = () => {
    const userMap = {};
    
    submissions.forEach(sub => {
      if (!userMap[sub.username]) {
        userMap[sub.username] = {
          username: sub.username,
          totalPoints: 0,
          posts: [],
          hasYeti: false,
          isCreative: false
        };
      }
      
      userMap[sub.username].totalPoints += sub.points;
      userMap[sub.username].posts.push(sub);
      if (sub.hasYeti) userMap[sub.username].hasYeti = true;
      if (sub.isCreative) userMap[sub.username].isCreative = true;
    });
    
    return Object.values(userMap).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const getUserPosts = (username) => {
    return submissions.filter(sub => sub.username === username);
  };

  const leaderboard = getUserLeaderboard();

  if (view === 'admin' && !isAdmin) {
    return (
      <div style={{...styles.container, padding: '40px 16px'}}>
        <div style={{maxWidth: '400px', margin: '0 auto', ...styles.card}}>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '20px', textAlign: 'center'}}>🏔️ Yeti Command Center</h2>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter admin password"
            style={styles.input}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && adminPassword === 'yeti2026') {
                setIsAdmin(true);
              }
            }}
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
            onClick={() => changeView('landing')}
            style={{...styles.button, background: 'white', color: '#16a34a', marginBottom: 0}}
          >
            Back to Landing
          </button>
        </div>
      </div>
    );
  }

  if (view === 'admin' && isAdmin) {
    const userGroups = getUserLeaderboard();
    
    return (
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <button onClick={() => changeView('leaderboard')} style={styles.leaderboardButton}>
              VIEW LEADERBOARD
            </button>
            <a href="https://matcha.xyz/" target="_blank" rel="noopener noreferrer">
              <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894649/Matcha-lockup-green_1_wdii0l.png" alt="matcha.xyz" style={{height: '32px'}} />
            </a>
          </div>
        </nav>
        
        <div style={{maxWidth: '900px', margin: '0 auto', padding: '24px 16px 80px'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '24px', textAlign: 'center'}}>🏔️ Yeti Command Center</h1>

          <div style={{...styles.card, background: '#f0fdf4'}}>
            <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#166534', marginBottom: '16px'}}>🎲 Run Raffle</h3>
            <button onClick={runRaffle} style={{...styles.button, background: '#16a34a', color: 'white', border: '2px solid #16a34a'}}>
              <Shuffle /> Let the Yeti Decide
            </button>
            
            {raffleWinners.length > 0 && (
              <div style={{marginTop: '16px'}}>
                <h4 style={{fontSize: '16px', fontWeight: 'bold', color: '#166534', marginBottom: '12px'}}>
                  🎉 Winners ({raffleWinners.length}):
                </h4>
                {raffleWinners.map((winner, index) => (
                  <div key={index} style={{padding: '12px', background: 'white', borderRadius: '8px', border: '2px solid #16a34a', marginBottom: '8px'}}>
                    <p style={{fontSize: '18px', fontWeight: 'bold', color: '#16a34a'}}>
                      Winner #{index + 1}: {winner.username}
                    </p>
                    <p style={{fontSize: '14px', color: '#6b7280'}}>{winner.totalPoints} total points</p>
                  </div>
                ))}
              </div>
            )}

            {showRaffleAnimation && (
              <div style={{marginTop: '16px', padding: '16px', background: 'white', borderRadius: '8px', border: '2px solid #fbbf24'}}>
                <p style={{fontSize: '18px', fontWeight: 'bold', color: '#166534', textAlign: 'center'}}>
                  🎰 Selecting winner...
                </p>
              </div>
            )}
          </div>

          <div style={{...styles.card, background: '#fee2e2', borderColor: '#dc2626'}}>
            <h3 style={{fontSize: '18px', fontWeight: 'bold', color: '#dc2626', marginBottom: '12px'}}>⚠️ Danger Zone</h3>
            <p style={{fontSize: '13px', color: '#7f1d1d', marginBottom: '12px'}}>
              Reset all data (submissions, winners, pending). Code: RESET2026
            </p>
            <button
              onClick={resetAllData}
              style={{...styles.button, background: '#dc2626', color: 'white', border: '2px solid #dc2626'}}
            >
              Reset All Data
            </button>
          </div>

          <div style={styles.card}>
            <h3 style={{fontSize: '18px', fontWeight: 'bold', color: '#166534', marginBottom: '16px'}}>
              Pending ({pendingSubmissions.length})
            </h3>
            {pendingSubmissions.length === 0 ? (
              <p style={{color: '#6b7280'}}>No pending submissions</p>
            ) : (
              <div>
                {pendingSubmissions.map((sub) => {
                  const userPastPosts = getUserPosts(sub.username);
                  return (
                    <PendingSubmissionCard
                      key={sub.id}
                      submission={sub}
                      pastPosts={userPastPosts}
                      onApprove={approveSubmission}
                      onReject={rejectSubmission}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={{fontSize: '18px', fontWeight: 'bold', color: '#166534', marginBottom: '16px'}}>
              Approved Users ({userGroups.length})
            </h3>
            {userGroups.length === 0 ? (
              <p style={{color: '#6b7280'}}>No approved submissions yet</p>
            ) : (
              userGroups.map((user) => (
                <UserSubmissionsCard
                  key={user.username}
                  user={user}
                  expanded={expandedUsers[user.username]}
                  onToggle={() => setExpandedUsers({
                    ...expandedUsers,
                    [user.username]: !expandedUsers[user.username]
                  })}
                />
              ))
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={() => changeView('landing')} style={styles.adminLink}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (view === 'leaderboard') {
    return (
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <button onClick={() => changeView('landing')} style={{...styles.leaderboardButton, background: '#374151'}}>
              ← HOME
            </button>
            <a href="https://matcha.xyz/" target="_blank" rel="noopener noreferrer">
              <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894649/Matcha-lockup-green_1_wdii0l.png" alt="matcha.xyz" style={{height: '32px'}} />
            </a>
          </div>
        </nav>
        
        <div style={{maxWidth: '700px', margin: '0 auto', padding: '24px 16px 80px'}}>
          <div style={{background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '24px', border: '2px solid black', boxShadow: '4px 4px 0 black'}}>
            <h1 style={{fontSize: '28px', fontWeight: 'bold', color: '#166534', marginBottom: '24px', textAlign: 'center'}}>Leaderboard</h1>

            {leaderboard.length === 0 ? (
              <div style={{textAlign: 'center', padding: '32px 0'}}>
                <p style={{fontSize: '16px', color: '#6b7280', marginBottom: '16px'}}>The Yeti awaits the first sighting...</p>
                <button onClick={() => changeView('landing')} style={{...styles.button, background: '#16a34a', color: 'white', border: '2px solid #16a34a', width: 'auto', padding: '12px 24px', margin: '0 auto'}}>
                  Be The First →
                </button>
              </div>
            ) : (
              <div>
                {leaderboard.map((user, index) => {
                  const colors = getLeaderboardColor(index);
                  
                  return (
                    <div
                      key={user.username}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: colors.bg,
                        border: '2px solid',
                        borderColor: colors.border
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: colors.text, minWidth: '36px'}}>
                          #{index + 1}
                        </div>
                        <div>
                          <p style={{fontSize: '16px', fontWeight: 'bold', color: colors.text}}>{user.username}</p>
                          <div style={{display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap'}}>
                            <span style={{fontSize: '10px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px', color: colors.text}}>
                              {user.posts.length} post{user.posts.length > 1 ? 's' : ''}
                            </span>
                            {user.hasYeti && <span style={{fontSize: '10px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px', color: colors.text}}>🏔️</span>}
                            {user.isCreative && <span style={{fontSize: '10px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px', color: colors.text}}>⚡</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontSize: '24px', fontWeight: 'bold', color: colors.text}}>{user.totalPoints}</p>
                        <p style={{fontSize: '11px', color: colors.text, opacity: 0.8}}>pts</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={() => changeView('admin')} style={styles.adminLink}>
            Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <button onClick={() => changeView('leaderboard')} style={styles.leaderboardButton}>
            VIEW LEADERBOARD
          </button>
          <a href="https://matcha.xyz/" target="_blank" rel="noopener noreferrer">
            <img src="https://res.cloudinary.com/dijzl4dmq/image/upload/v1770894649/Matcha-lockup-green_1_wdii0l.png" alt="matcha.xyz" style={{height: '32px'}} />
          </a>
        </div>
      </nav>

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

      <div style={styles.mainContent}>
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

          <div style={{background: '#f0fdf4', borderRadius: '12px', padding: '14px', marginTop: '16px', border: '1px solid #86efac'}}>
            <p style={{fontSize: '14px', fontStyle: 'italic', color: '#166534', lineHeight: '1.5'}}>
              More points = Better odds in the raffle<br/>
              Top 10 highest scores win Balaclava ski hats<br/>
              Submit multiple posts to increase your chances!
            </p>
          </div>
        </div>

        <div style={{...styles.card, background: 'linear-gradient(to right, #15803d, #166534)', color: 'white', textAlign: 'center'}}>
          <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#86efac'}}>WINNER ANNOUNCEMENT</h3>
          <p style={{fontSize: '28px', fontWeight: '900', marginBottom: '8px'}}>February 20 at 3pm</p>
          <p style={{fontSize: '14px', marginBottom: '16px', color: '#d1fae5'}}>Claim your prize at the Matcha Garden</p>
          <div style={{height: '1px', background: 'rgba(134, 239, 172, 0.3)', margin: '16px 0'}}></div>
          <p style={{fontSize: '12px', color: '#a7f3d0', marginBottom: '6px'}}>Questions or Updates?</p>
          <a href="https://x.com/matchaxyz" target="_blank" rel="noopener noreferrer" style={{fontSize: '14px', fontWeight: 'bold', color: '#86efac', textDecoration: 'none'}}>
            x.com/matchaxyz →
          </a>
        </div>
      </div>

      <div style={styles.footer}>
        <button onClick={() => changeView('admin')} style={styles.adminLink}>
          Admin
        </button>
      </div>
    </div>
  );
};

const UserSubmissionsCard = ({ user, expanded, onToggle }) => {
  return (
    <div style={{background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '12px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} onClick={onToggle}>
        <div>
          <p style={{fontWeight: 'bold', color: '#166534', fontSize: '16px'}}>{user.username}</p>
          <p style={{fontSize: '14px', color: '#6b7280'}}>
            Total: {user.totalPoints} pts • {user.posts.length} post{user.posts.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{fontSize: '20px', color: '#166534'}}>{expanded ? '▼' : '▶'}</div>
      </div>
      
      {expanded && (
        <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #86efac'}}>
          {user.posts.map((post, index) => (
            <div key={post.id} style={{background: 'white', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                <span style={{fontWeight: 'bold'}}>Post #{index + 1}</span>
                <span style={{fontWeight: 'bold', color: '#16a34a'}}>{post.points} pts</span>
              </div>
              <p style={{color: '#6b7280', fontSize: '11px', marginBottom: '4px'}}>
                {new Date(post.timestamp).toLocaleString()}
              </p>
              <div style={{display: 'flex', gap: '6px', marginBottom: '6px'}}>
                {post.hasYeti && <span style={{fontSize: '10px', background: '#86efac', padding: '2px 6px', borderRadius: '4px'}}>🏔️ Yeti</span>}
                {post.isCreative && <span style={{fontSize: '10px', background: '#e9d5ff', padding: '2px 6px', borderRadius: '4px'}}>⚡ Creative</span>}
              </div>
              <a href={post.postUrl} target="_blank" rel="noopener noreferrer" style={{color: '#16a34a', fontSize: '11px'}}>
                View Post →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PendingSubmissionCard = ({ submission, pastPosts, onApprove, onReject }) => {
  const [hasYeti, setHasYeti] = useState(false);
  const [isCreative, setIsCreative] = useState(false);

  return (
    <div style={{background: '#f9fafb', border: '2px solid #86efac', borderRadius: '8px', padding: '16px', marginBottom: '12px'}}>
      <div style={{marginBottom: '12px'}}>
        <p style={{fontWeight: 'bold', color: '#166534', fontSize: '16px'}}>{submission.username}</p>
        <a href={submission.postUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: '12px', color: '#16a34a'}}>
          View Current Post →
        </a>
        <p style={{fontSize: '11px', color: '#6b7280', marginTop: '4px'}}>
          Submitted: {new Date(submission.timestamp).toLocaleString()}
        </p>
        
        {pastPosts.length > 0 && (
          <div style={{marginTop: '8px', padding: '8px', background: '#fef3c7', borderRadius: '6px'}}>
            <p style={{fontSize: '11px', fontWeight: 'bold', color: '#92400e', marginBottom: '6px'}}>
              📋 Past approved posts: {pastPosts.length}
            </p>
            {pastPosts.map((post) => (
              <div key={post.id} style={{fontSize: '10px', color: '#92400e', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>• {post.points} pts - {new Date(post.timestamp).toLocaleDateString()}</span>
                <a href={post.postUrl} target="_blank" rel="noopener noreferrer" style={{color: '#92400e', textDecoration: 'underline', fontSize: '10px'}}>
                  View →
                </a>
              </div>
            ))}
          </div>
        )}
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
