import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Add, AdminPanelSettings, ArrowBack, ArrowForward, Assignment, CheckCircle,
  ChevronRight, Close, Dashboard as DashboardIcon, Description, Event,
  Home, Inventory2, Key, LocationOn, Logout, MailOutline, ManageSearch,
  Notifications, Person, Report as ReportIcon, School, Search, Settings,
  Visibility, VisibilityOff
} from '@mui/icons-material';
import {
  Alert, Button, CircularProgress, MenuItem, Paper, TextField, Typography
} from '@mui/material';
import api from './api';

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ucu_user') || 'null');
    } catch {
      return null;
    }
  });

  const login = (data) => {
    localStorage.setItem('ucu_token', data.token);
    localStorage.setItem('ucu_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('ucu_token');
    localStorage.removeItem('ucu_user');
    setUser(null);
  };

  const refresh = async () => {
    const { data } = await api.get('/auth/me');
    localStorage.setItem('ucu_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  return <AuthContext.Provider value={{ user, login, logout, refresh }}>{children}</AuthContext.Provider>;
}

function Guard({ children, admin = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function CampusIllustration() {
  return (
    <svg className="campus-art" viewBox="0 0 640 300" role="img" aria-label="Uganda Christian University campus">
      <defs>
        <linearGradient id="campus-sky" x2="0" y2="1"><stop stopColor="#52b9f4" /><stop offset="1" stopColor="#d8f1ff" /></linearGradient>
        <linearGradient id="campus-grass" x2="0" y2="1"><stop stopColor="#7bc54b" /><stop offset="1" stopColor="#25813a" /></linearGradient>
        <linearGradient id="campus-wall" x2="0" y2="1"><stop stopColor="#e4a957" /><stop offset="1" stopColor="#a85d26" /></linearGradient>
      </defs>
      <rect width="640" height="300" fill="url(#campus-sky)" />
      <path d="M0 148Q45 114 90 150T180 142T270 149T360 140T450 148T550 135T640 145V206H0Z" fill="#236d3c" />
      <path d="M0 184Q95 147 190 190T380 176T640 181V300H0Z" fill="url(#campus-grass)" />
      <path d="M254 300 298 187h44l48 113Z" fill="#e2b568" />
      <path d="M33 176h138v74H33zM469 171h137v79H469z" fill="#b46b30" />
      <path d="m27 176 75-44 75 44zm434-5 76-47 76 47z" fill="#6a3826" />
      <path d="M188 184h264v93H188z" fill="url(#campus-wall)" />
      <path d="M255 182v-52h130v52z" fill="#cb8137" />
      <path d="m244 132 76-54 76 54zM315 78h12V56h-12zM308 57h27v6h-27z" fill="#754225" />
      <path d="M294 277v-50a27 27 0 0 1 54 0v50z" fill="#503223" />
      <g fill="#4a2d21">
        <path d="M52 194h19v30H52zm39 0h19v30H91zm42 0h19v30h-19zm79 9h23v30h-23zm42 0h23v30h-23zm108 0h23v30h-23zm43 0h23v30h-23zm84-10h20v31h-20zm42 0h20v31h-20zm42 0h20v31h-20z" />
      </g>
      <g fill="#17552f">
        <circle cx="34" cy="111" r="44" /><circle cx="74" cy="93" r="50" /><circle cx="117" cy="116" r="38" />
        <circle cx="568" cy="101" r="47" /><circle cx="610" cy="121" r="43" /><circle cx="533" cy="128" r="32" />
      </g>
      <g fill="#278343"><circle cx="60" cy="132" r="30" /><circle cx="94" cy="130" r="27" /><circle cx="582" cy="139" r="30" /></g>
    </svg>
  );
}

function Welcome() {
  return (
    <main className="auth-page">
      <section className="auth-phone">
        <header className="welcome-brand">
          <div className="university-lockup">
            <div className="ucu-crest"><School /></div>
            <div><b>UCU</b><span>UGANDA CHRISTIAN<br />UNIVERSITY</span></div>
          </div>
          <h1>UCU<br />LOST &amp; FOUND</h1>
          <p>Find it. Return it. Belong.</p>
        </header>
        <div className="welcome-campus"><CampusIllustration /></div>
        <div className="welcome-actions">
          <Button component={Link} to="/register" className="welcome-button" endIcon={<ArrowForward />}>Get Started</Button>
          <Button component={Link} to="/signin" className="welcome-button welcome-button-outline" endIcon={<ArrowForward />}>Sign In</Button>
          <Link className="admin-access-link" to="/admin/login">Administrator access</Link>
        </div>
      </section>
    </main>
  );
}

function FormField({ label, className = '', ...props }) {
  return <TextField className={`form-field ${className}`} label={label} fullWidth {...props} />;
}

function AuthPage({ register = false, adminLogin = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', student_number: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (register) await api.post('/auth/register', form);
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      if (adminLogin && data.user.role !== 'admin') {
        setError('This account does not have administrator access.');
        return;
      }
      login(data);
      navigate(adminLogin || data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to connect. Check that the backend is running.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className={`auth-phone auth-form-phone${adminLogin ? ' admin-login-phone' : ''}`}>
        <header className="auth-form-brand">
          <div className="ucu-crest"><School /></div>
          <div className="university-lockup-text"><b>UCU</b><span>UGANDA CHRISTIAN<br />UNIVERSITY</span></div>
          <h1>{adminLogin ? 'UCU Admin Portal' : 'UCU LOST & FOUND'}</h1>
          <p>{adminLogin ? 'Secure access for administrators' : register ? 'Create your student account' : 'Welcome back!'}</p>
        </header>
        <Paper component="form" onSubmit={submit} className="auth-form-card" elevation={0}>
          {error && <Alert severity="error" className="screen-alert">{error}</Alert>}
          {register && <FormField label="Full name" value={form.full_name} onChange={update('full_name')} required />}
          {register && <FormField label="Student number (optional)" value={form.student_number} onChange={update('student_number')} />}
          <FormField label="Email address" type="email" value={form.email} onChange={update('email')} required
            InputProps={{ startAdornment: <MailOutline className="field-icon" /> }} />
          <FormField label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')}
            required inputProps={{ minLength: 8 }} InputProps={{
              startAdornment: <Key className="field-icon" />,
              endAdornment: <button type="button" className="field-icon-button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <VisibilityOff /> : <Visibility />}</button>
            }} />
          <div className="auth-forgot">{!register && !adminLogin && <span>Password help? Contact campus support.</span>}</div>
          <Button type="submit" className="primary-button auth-submit" disabled={busy} endIcon={busy ? <CircularProgress size={18} /> : <ArrowForward />}>
            {busy ? 'Please wait...' : register ? 'Create account' : adminLogin ? 'Login' : 'Sign In'}
          </Button>
          <div className="auth-switch">
            {adminLogin ? <Link to="/signin">Student sign in</Link> : register
              ? <>Already have an account? <Link to="/signin">Sign in</Link></>
              : <>Don’t have an account? <Link to="/register">Sign up</Link></>}
          </div>
        </Paper>
      </section>
    </main>
  );
}

const pageTitles = {
  '/dashboard': 'UCU Lost & Found',
  '/items': 'Browse Items',
  '/search': 'Browse Items',
  '/report-lost': 'Report Lost Item',
  '/report-found': 'Report Found Item',
  '/my-claims': 'My Claims',
  '/profile': 'My Profile',
  '/profile/edit': 'Edit Profile',
  '/notifications': 'Notifications',
  '/admin': 'Admin Dashboard',
  '/admin/manage': 'Manage Claims',
  '/admin/reports': 'Manage Reports',
  '/admin/users': 'Manage Users'
};

function BottomNav({ admin }) {
  const { pathname } = useLocation();
  const entries = admin
    ? [
      [DashboardIcon, 'Home', '/admin'],
      [Assignment, 'Claims', '/admin/manage'],
      [Inventory2, 'Reports', '/admin/reports'],
      [Person, 'Users', '/admin/users'],
      [Settings, 'Profile', '/profile']
    ]
    : [
      [Home, 'Home', '/dashboard'],
      [Search, 'Browse', '/items'],
      [Add, 'Report', '/report-lost'],
      [Assignment, 'Claims', '/my-claims'],
      [Person, 'Profile', '/profile']
    ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {entries.map(([Icon, label, to]) => (
        <Link key={to} to={to} className={`bottom-nav-link${pathname === to || (to === '/items' && pathname === '/search') ? ' active' : ''}`}>
          <Icon /><span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Layout({ children, admin = false }) {
  const location = useLocation();
  const { pathname } = location;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const title = pathname === '/items' && new URLSearchParams(location.search).get('mine') === 'true' ? 'My Reports'
    : pathname.startsWith('/items/') ? 'Item Details'
    : pathname.startsWith('/admin/claims/') ? 'Claim Review'
      : pathname === '/claims/new' ? 'Claim Item'
        : pageTitles[pathname] || 'UCU Lost & Found';
  const showAdminNav = admin || user?.role === 'admin';
  const backable = !['/dashboard', '/admin'].includes(pathname);

  return (
    <div className="app-backdrop">
      <div className="app-phone">
        <header className="app-header">
          {backable
            ? <button className="header-icon" aria-label="Go back" onClick={() => navigate(-1)}><ArrowBack /></button>
            : <div className="header-crest"><School /></div>}
          <h1>{title}</h1>
          {showAdminNav
            ? <button className="header-icon" aria-label="Sign out" onClick={() => { logout(); navigate('/admin/login'); }}><Logout /></button>
            : <Link className="header-icon" to="/notifications" aria-label="Notifications"><Notifications /></Link>}
        </header>
        <main className="app-content">{children}</main>
        <BottomNav admin={showAdminNav} />
        <span className="home-indicator" aria-hidden="true" />
        <span className="sr-only">Signed in as {user?.full_name}</span>
      </div>
    </div>
  );
}

function ScreenMessage({ error, children }) {
  return error ? <Alert severity="error" className="screen-alert">{error}</Alert> : children;
}

function Loading() {
  return <div className="loading-state"><CircularProgress size={28} /><span>Loading...</span></div>;
}

function StatusBadge({ status }) {
  const value = (status || 'open').toLowerCase();
  return <span className={`status-badge status-${value}`}>{value}</span>;
}

function itemSymbol(category = '', title = '') {
  const value = `${category} ${title}`.toLowerCase();
  if (value.includes('key')) return '🔑';
  if (value.includes('water') || value.includes('bottle')) return '🧴';
  if (value.includes('phone')) return '📱';
  if (value.includes('headphone')) return '🎧';
  if (value.includes('book')) return '📚';
  if (value.includes('bag') || value.includes('backpack')) return '🎒';
  if (value.includes('laptop') || value.includes('computer')) return '💻';
  return '🎒';
}

function itemPhotoPath(category = '', title = '') {
  const value = `${category} ${title}`.toLowerCase();
  if (/backpack|rucksack|bag/.test(value)) return '/item-images/backpack.jpg';
  if (/watch|wristwatch/.test(value)) return '/item-images/watch.jpg';
  if (/iphone|smartphone|phone/.test(value)) return '/item-images/phone.jpg';
  if (/passbook|pass book|registration book/.test(value)) return '/item-images/student-passbook.jpeg';
  if (/headphone|headset|earbud/.test(value)) return '/item-images/headphones.jpg';
  if (/laptop|notebook computer|computer/.test(value)) return '/item-images/laptop.jpg';
  if (/key/.test(value)) return '/item-images/keys.jpg';
  if (/water|bottle/.test(value)) return '/item-images/water-bottle.jpg';
  return null;
}

function ItemArtwork({ item, large = false }) {
  const photo = item?.image_url || itemPhotoPath(item?.category, item?.title);
  return (
    <div className={`item-artwork${large ? ' item-artwork-large' : ''}`}>
      {photo
        ? <img src={photo} alt={item?.title || 'Reported item'} />
        : <span aria-hidden="true">{itemSymbol(item?.category, item?.title)}</span>}
    </div>
  );
}

function ItemCard({ item, compact = false }) {
  return (
    <article className={`item-card${compact ? ' item-card-compact' : ''}`}>
      <Link to={`/items/${item.id}`} className="item-card-image"><ItemArtwork item={item} /></Link>
      <div className="item-card-info">
        <div className="item-card-title-row">
          <Link to={`/items/${item.id}`} className="item-card-title">{item.title}</Link>
          <StatusBadge status={item.item_type} />
        </div>
        <p>{item.category || 'Personal item'}{item.location ? ` · ${item.location}` : ''}</p>
        <span className={`item-type-tag ${item.item_type === 'lost' ? 'tag-lost' : 'tag-found'}`}>{item.item_type}</span>
      </div>
    </article>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/items'), api.get('/claims/mine')])
      .then(([itemResponse, claimResponse]) => {
        setItems(itemResponse.data.items);
        setClaims(claimResponse.data.claims);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load your campus activity.'))
      .finally(() => setLoading(false));
  }, []);

  const recent = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

  return (
    <div className="home-screen">
      <section className="home-welcome">
        <div className="home-welcome-copy">
          <span>HELLO, {user?.full_name?.split(' ')[0] || 'STUDENT'}!</span>
          <h2>Welcome to UCU Lost &amp; Found</h2>
          <p>Let’s help reunite belongings with their owners.</p>
        </div>
        <div className="home-campus"><CampusIllustration /></div>
      </section>
      <div className="quick-actions">
        <Link to="/items" className="quick-action"><span className="quick-icon"><ManageSearch /></span><b>Find items</b></Link>
        <Link to="/report-lost" className="quick-action"><span className="quick-icon quick-yellow"><ReportIcon /></span><b>Report lost/found</b></Link>
        <Link to="/my-claims" className="quick-action"><span className="quick-icon quick-lilac"><Assignment /></span><b>My claims</b><small>{claims.length} submitted</small></Link>
        {user?.role === 'admin' && <Link to="/admin" className="quick-action"><span className="quick-icon quick-blue"><DashboardIcon /></span><b>Admin portal</b></Link>}
      </div>
      <div className="section-heading"><h2>Recent items</h2><Link to="/items">View all <ChevronRight /></Link></div>
      {loading ? <Loading /> : <ScreenMessage error={error}>
        {recent.length
          ? <div className="item-list">{recent.map((item) => <ItemCard key={item.id} item={item} compact />)}</div>
          : <div className="empty-state"><Inventory2 /><b>No recent reports yet</b><span>New campus reports will appear here.</span></div>}
      </ScreenMessage>}
      <div className="home-stat-row">
        <div><b>{items.filter((item) => item.status === 'open').length}</b><span>Open reports</span></div>
        <div><b>{items.filter((item) => item.item_type === 'lost').length}</b><span>Lost items</span></div>
        <div><b>{items.filter((item) => item.item_type === 'found').length}</b><span>Found items</span></div>
      </div>
    </div>
  );
}

function Items({ search = false }) {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const mine = params.get('mine') === 'true';
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items')
      .then((response) => setItems(response.data.items))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const locations = [...new Set(items.map((item) => item.location).filter(Boolean))];
  const filtered = items.filter((item) => {
    const text = `${item.title} ${item.description} ${item.location}`.toLowerCase();
    return (!mine || Number(item.user_id) === Number(user?.id))
      && (!query || text.includes(query.toLowerCase()))
      && (!type || item.item_type === type)
      && (!category || item.category === category)
      && (!location || item.location === location);
  });

  return (
    <section className="screen-section browse-screen">
      <div className="browse-search">
        <Search />
        <input aria-label="Search items" placeholder={search ? 'Search items...' : 'Search items...'} value={query} onChange={(event) => setQuery(event.target.value)} />
        {query && <button aria-label="Clear search" onClick={() => setQuery('')}><Close /></button>}
      </div>
      <div className="filter-pills" role="group" aria-label="Item type">
        {['', 'lost', 'found'].map((value) => <button key={value} onClick={() => setType(value)} className={type === value ? 'selected' : ''}>{value || 'All'}</button>)}
      </div>
      <div className="filter-selects">
        <TextField select size="small" label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <MenuItem value="">All categories</MenuItem>{categories.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Location" value={location} onChange={(event) => setLocation(event.target.value)}>
          <MenuItem value="">All locations</MenuItem>{locations.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
      </div>
      <div className="section-heading browse-heading"><h2>{filtered.length} {mine ? 'reports' : 'items'}</h2><span><Inventory2 /> UCU campus</span></div>
      {loading ? <Loading /> : <ScreenMessage error={error}>
        {filtered.length
          ? <div className="item-grid">{filtered.map((item) => <ItemCard key={item.id} item={item} />)}</div>
          : <div className="empty-state"><Search /><b>No items found</b><span>Try changing your search or filters.</span></div>}
      </ScreenMessage>}
    </section>
  );
}

function ReportForm({ type }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', otherLocation: '',
    event_date: new Date().toISOString().slice(0, 10), image_url: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const lost = type === 'lost';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/items', {
        ...form,
        location: form.location === 'Other' ? form.otherLocation : form.location,
        item_type: type
      });
      navigate('/items');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit your report.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`report-screen ${lost ? 'report-lost-screen' : 'report-found-screen'}`}>
      <div className="report-illustration">
        <span className="report-emoji" aria-hidden="true">{lost ? '🤔' : '🤝'}</span>
        <h2>{lost ? 'Tell us about your lost item.' : 'Great! You found an item?'}</h2>
        <p>{lost ? 'Provide as much detail as possible.' : 'Help the owner get it back.'}</p>
      </div>
      <Paper component="form" onSubmit={submit} className="report-form" elevation={0}>
        {error && <Alert severity="error" className="screen-alert">{error}</Alert>}
        <FormField label="Item name" placeholder={lost ? 'e.g. Laptop' : 'e.g. Keys'} value={form.title} onChange={update('title')} required />
        <FormField select label="Category" value={form.category} onChange={update('category')} required>
          {['Electronics', 'Documents', 'Bags', 'Clothing', 'Jewellery', 'Books', 'Keys', 'Other'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </FormField>
        <FormField select label={lost ? 'Last seen location' : 'Location found'} value={form.location} onChange={update('location')} required>
          {['Library', 'Main Building', 'Cafeteria', 'Chapel', 'Lecture Hall', 'Sports Centre', 'Other'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </FormField>
        {form.location === 'Other' && <FormField label="Specify location" value={form.otherLocation} onChange={update('otherLocation')} required />}
        <FormField label={lost ? 'Date last seen' : 'Date found'} type="date" value={form.event_date} onChange={update('event_date')} required InputLabelProps={{ shrink: true }} />
        <FormField label="Description" placeholder="Describe the item..." value={form.description} onChange={update('description')} required multiline minRows={2} />
        <FormField label="Photo URL (optional)" placeholder="https://..." value={form.image_url} onChange={update('image_url')} />
        <Button type="submit" className={`primary-button report-submit${lost ? ' button-red' : ''}`} disabled={busy} endIcon={busy ? <CircularProgress size={18} /> : <ArrowForward />}>
          {busy ? 'Submitting...' : 'Submit report'}
        </Button>
        <Link className="alternate-report-link" to={lost ? '/report-found' : '/report-lost'}>{lost ? 'Found something instead?' : 'Lost something instead?'}</Link>
      </Paper>
    </section>
  );
}

function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`)
      .then((response) => setItem(response.data.item))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Item not found.'));
  }, [id]);

  const markReturned = async () => {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/items/${id}`, { status: 'claimed' });
      navigate('/admin/confirmation?status=returned');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this report.');
    } finally {
      setBusy(false);
    }
  };

  if (error && !item) return <Alert severity="error" className="screen-alert">{error}</Alert>;
  if (!item) return <Loading />;

  return (
    <section className="detail-screen">
      <ItemArtwork item={item} large />
      <div className="detail-title-row"><h2>{item.title}</h2><span className={`item-type-tag ${item.item_type === 'lost' ? 'tag-lost' : 'tag-found'}`}>{item.item_type}</span></div>
      <div className="detail-summary">{item.item_type === 'found' ? 'This item was found on campus.' : 'This item was reported missing.'}</div>
      <div className="detail-facts">
        <div><LocationOn /><span><b>Location</b><small>{item.location || 'Not specified'}</small></span></div>
        <div><Event /><span><b>Date</b><small>{item.event_date ? new Date(item.event_date).toLocaleDateString() : 'Not specified'}</small></span></div>
        <div><Description /><span><b>Description</b><small>{item.description}</small></span></div>
        <div><Person /><span><b>Reported by</b><small>{item.reporter_name}</small></span></div>
      </div>
      {error && <Alert severity="error" className="screen-alert">{error}</Alert>}
      {item.status === 'open' && Number(item.user_id) !== Number(user?.id) && (
        <Button component={Link} to={`/claims/new?item=${item.id}`} className="primary-button detail-action">Claim this item</Button>
      )}
      {user?.role === 'admin' && item.status === 'open' && (
        <Button className="secondary-button detail-action" disabled={busy} onClick={markReturned}>{busy ? 'Updating...' : 'Mark as returned'}</Button>
      )}
      {item.status !== 'open' && <div className="detail-status"><CheckCircle /> This item has been returned.</div>}
    </section>
  );
}

function ClaimForm() {
  const [params] = useSearchParams();
  const itemId = params.get('item') || '';
  const [message, setMessage] = useState('');
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (itemId) api.get(`/items/${itemId}`).then((response) => setItem(response.data.item)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load this item.'));
  }, [itemId]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/claims', { item_id: itemId, message });
      navigate('/my-claims');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your claim.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="claim-form-screen">
      {item && <div className="claim-item-summary"><ItemArtwork item={item} /><span><b>{item.title}</b><small>{item.category} · {item.location}</small></span></div>}
      <Paper component="form" onSubmit={submit} className="claim-form-card" elevation={0}>
        <h2>Claim this item</h2>
        <p>Share a detail that helps verify it belongs to you.</p>
        {error && <Alert severity="error" className="screen-alert">{error}</Alert>}
        <FormField label="Item ID" value={itemId} disabled required />
        <FormField label="Tell us why this item is yours" placeholder="Describe a unique detail..." value={message} onChange={(event) => setMessage(event.target.value)} required multiline minRows={4} />
        <Button type="submit" className="primary-button" disabled={busy || !itemId}>{busy ? 'Submitting...' : 'Submit claim'}</Button>
      </Paper>
    </section>
  );
}

function Claims() {
  const [claims, setClaims] = useState([]);
  const [tab, setTab] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/claims/mine')
      .then((response) => setClaims(response.data.claims))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load your claims.'))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    pending: claims.filter((claim) => claim.status === 'pending').length,
    approved: claims.filter((claim) => claim.status === 'approved').length,
    rejected: claims.filter((claim) => claim.status === 'rejected').length
  };
  const visible = claims.filter((claim) => claim.status === tab);

  return (
    <section className="claims-screen">
      <div className="claim-tabs">
        {Object.entries(counts).map(([status, count]) => <button key={status} className={tab === status ? 'selected' : ''} onClick={() => setTab(status)}>{status[0].toUpperCase() + status.slice(1)} ({count})</button>)}
      </div>
      {loading ? <Loading /> : <ScreenMessage error={error}>
        {visible.length
          ? <div className="claim-list">{visible.map((claim) => (
            <article className="claim-card" key={claim.id}>
              <ItemArtwork item={{ title: claim.item_title, item_type: claim.item_type }} />
              <div className="claim-card-copy"><b>{claim.item_title}</b><span>Claimed: {new Date(claim.created_at).toLocaleDateString()}</span><StatusBadge status={claim.status} /></div>
            </article>
          ))}</div>
          : <div className="empty-state"><Assignment /><b>No {tab} claims</b><span>Your claim updates will appear here.</span></div>}
      </ScreenMessage>}
    </section>
  );
}

function Profile({ edit = false }) {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    course: user?.course || '',
    bio: user?.bio || ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api.patch('/users/me', form);
      await refresh();
      setMessage('Profile saved successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  if (edit) {
    return (
      <Paper component="form" onSubmit={save} className="profile-edit-card" elevation={0}>
        {error && <Alert severity="error" className="screen-alert">{error}</Alert>}
        {message && <Alert severity="success" className="screen-alert">{message}</Alert>}
        <FormField label="Full name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
        <FormField label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <FormField label="Course" value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })} />
        <FormField label="About me" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} multiline minRows={3} />
        <Button type="submit" className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</Button>
      </Paper>
    );
  }

  return (
    <section className="profile-screen">
      <div className="profile-banner">
        <div className="profile-avatar"><Person /></div>
        <h2>{user?.full_name}</h2>
        <span>{user?.email}</span>
        {user?.student_number && <small>Student No. {user.student_number}</small>}
      </div>
      <div className="profile-menu">
        <Link to="/items?mine=true"><span className="profile-menu-icon"><Description /></span><b>My Reports</b><ChevronRight /></Link>
        <Link to="/my-claims"><span className="profile-menu-icon"><Assignment /></span><b>My Claims</b><ChevronRight /></Link>
        <Link to="/profile/edit"><span className="profile-menu-icon"><Settings /></span><b>Settings</b><ChevronRight /></Link>
        <Link to="/notifications"><span className="profile-menu-icon"><Notifications /></span><b>Help &amp; Support</b><ChevronRight /></Link>
        <button onClick={() => { logout(); navigate('/login'); }}><span className="profile-menu-icon"><Logout /></span><b>Log Out</b><ChevronRight /></button>
      </div>
      <div className="profile-details"><span>Course</span><b>{user?.course || 'Not added'}</b><span>Phone</span><b>{user?.phone || 'Not added'}</b><span>About</span><b>{user?.bio || 'Add a short bio in settings.'}</b></div>
    </section>
  );
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then((response) => setNotifications(response.data.notifications))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (notification) => {
    try {
      await api.patch(`/notifications/${notification.id}/read`);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: 1 } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this notification.');
    }
  };

  return loading ? <Loading /> : <ScreenMessage error={error}>
    {notifications.length ? <div className="notification-list">{notifications.map((notification) => (
      <button key={notification.id} className={`notification-card${notification.is_read ? '' : ' unread'}`} onClick={() => markRead(notification)}>
        <span className="notification-symbol"><Notifications /></span>
        <span><b>{notification.message}</b><small>{new Date(notification.created_at).toLocaleString()}</small></span>
      </button>
    ))}</div> : <div className="empty-state"><Notifications /><b>You’re all caught up</b><span>New updates will show here.</span></div>}
  </ScreenMessage>;
}

function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/items'), api.get('/claims'), api.get('/users/admin/list')])
      .then(([itemResponse, claimResponse, userResponse]) => {
        setItems(itemResponse.data.items);
        setClaims(claimResponse.data.claims);
        setUsers(userResponse.data.users);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load administrator data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="admin-dashboard">
      <div className="admin-welcome"><AdminPanelSettings /><span>Secure Access for Administrators</span><h2>UCU Admin Portal</h2><p>Manage campus reports and claims.</p></div>
      {loading ? <Loading /> : <ScreenMessage error={error}>
        <div className="admin-stat-grid">
          <Link to="/admin/reports"><span>Reports</span><b>{items.length}</b><Inventory2 /></Link>
          <Link to="/admin/reports"><span>Open items</span><b>{items.filter((item) => item.status === 'open').length}</b><ReportIcon /></Link>
          <Link to="/admin/manage"><span>Pending claims</span><b>{claims.filter((claim) => claim.status === 'pending').length}</b><Assignment /></Link>
          <Link to="/admin/users"><span>Users</span><b>{users.length}</b><Person /></Link>
        </div>
        <div className="section-heading"><h2>Administration</h2></div>
        <div className="admin-action-list">
          <Link to="/admin/manage"><Assignment /><b>Manage claims</b><ChevronRight /></Link>
          <Link to="/admin/reports"><Inventory2 /><b>Manage reports</b><ChevronRight /></Link>
          <Link to="/admin/users"><Person /><b>Manage users</b><ChevronRight /></Link>
        </div>
      </ScreenMessage>}
    </section>
  );
}

function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [tab, setTab] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/claims')
      .then((response) => setClaims(response.data.claims))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load claims.'))
      .finally(() => setLoading(false));
  }, []);

  const tabs = ['pending', 'approved', 'rejected'];
  const visible = claims.filter((claim) => claim.status === tab);

  return (
    <section className="admin-claims-screen">
      <div className="claim-tabs">{tabs.map((status) => <button key={status} className={tab === status ? 'selected' : ''} onClick={() => setTab(status)}>{status[0].toUpperCase() + status.slice(1)} ({claims.filter((claim) => claim.status === status).length})</button>)}</div>
      {loading ? <Loading /> : <ScreenMessage error={error}>
        {visible.length ? <div className="admin-claim-list">{visible.map((claim) => (
          <article className="admin-claim-card" key={claim.id}>
            <div className="claimant-avatar"><Person /></div>
            <div className="admin-claim-copy"><b>{claim.claimant_name}</b><span>{claim.item_title}</span><small>{new Date(claim.created_at).toLocaleDateString()}</small></div>
            <div className="admin-claim-actions"><Link to={`/admin/claims/${claim.id}`}>View</Link>{claim.status === 'pending' && <Link className="approve-quick" to={`/admin/claims/${claim.id}`}>Review</Link>}</div>
          </article>
        ))}</div> : <div className="empty-state"><Assignment /><b>No {tab} claims</b><span>Claims needing your attention will appear here.</span></div>}
      </ScreenMessage>}
    </section>
  );
}

function ClaimReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [item, setItem] = useState(null);
  const [decision, setDecision] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/claims').then(async (response) => {
      const found = response.data.claims.find((entry) => String(entry.id) === String(id));
      if (!found) {
        setError('Claim not found.');
        return;
      }
      setClaim(found);
      const itemResponse = await api.get(`/items/${found.item_id}`);
      setItem(itemResponse.data.item);
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load claim details.'));
  }, [id]);

  const submitDecision = async () => {
    if (!decision) {
      setError('Choose approve or reject before submitting your decision.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.patch(`/claims/${id}`, { status: decision });
      navigate(`/admin/confirmation?status=${decision}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this claim.');
    } finally {
      setBusy(false);
    }
  };

  if (!claim && !error) return <Loading />;
  return (
    <section className="claim-review-screen">
      {error && <Alert severity="error" className="screen-alert">{error}</Alert>}
      {claim && <>
        <ItemArtwork item={item || { title: claim.item_title }} large />
        <div className="review-meta"><span>Item:</span><b>{claim.item_title}</b><span>Claimant:</span><b>{claim.claimant_name}</b></div>
        <div className="evidence-card"><b>Evidence provided</b><p>“{claim.message || 'No explanation provided.'}”</p></div>
        <h2>Decision</h2>
        <div className="decision-buttons">
          <button className={decision === 'approved' ? 'chosen approve' : 'approve'} onClick={() => setDecision('approved')}><CheckCircle /> Approve</button>
          <button className={decision === 'rejected' ? 'chosen reject' : 'reject'} onClick={() => setDecision('rejected')}><Close /> Reject</button>
        </div>
        <Button className="primary-button" disabled={busy} onClick={submitDecision}>{busy ? 'Submitting...' : 'Submit decision'}</Button>
      </>}
    </section>
  );
}

function ManageReports() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items')
      .then((response) => setItems(response.data.items))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const visible = items.filter((item) => !tab || item.item_type === tab);

  return (
    <section className="admin-reports-screen">
      <div className="filter-pills">{[['', 'All'], ['lost', 'Lost'], ['found', 'Found']].map(([value, label]) => <button key={value} className={tab === value ? 'selected' : ''} onClick={() => setTab(value)}>{label}</button>)}</div>
      {loading ? <Loading /> : <ScreenMessage error={error}>
        {visible.length ? <div className="admin-report-list">{visible.map((item) => (
          <article className="admin-report-card" key={item.id}>
            <ItemArtwork item={item} />
            <div className="admin-report-copy"><b>{item.title}</b><span>{item.item_type === 'found' ? 'Found' : 'Lost'}: {new Date(item.event_date).toLocaleDateString()}</span><small>{item.location}</small></div>
            <Link to={`/items/${item.id}`} className="view-report">View</Link>
          </article>
        ))}</div> : <div className="empty-state"><Inventory2 /><b>No reports found</b><span>New lost and found reports will appear here.</span></div>}
      </ScreenMessage>}
    </section>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/admin/list')
      .then((response) => setUsers(response.data.users))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load users.'))
      .finally(() => setLoading(false));
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.patch(`/users/admin/${id}/role`, { role });
      setUsers((current) => current.map((user) => user.id === id ? { ...user, role } : user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update user role.');
    }
  };

  return loading ? <Loading /> : <ScreenMessage error={error}>
    <div className="admin-user-list">{users.map((user) => (
      <article key={user.id} className="admin-user-card">
        <div className="claimant-avatar"><Person /></div>
        <div><b>{user.full_name}</b><span>{user.email}</span><small>{user.student_number || 'Student number not provided'}</small></div>
        <select aria-label={`Role for ${user.full_name}`} value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}>
          <option value="student">Student</option><option value="admin">Admin</option>
        </select>
      </article>
    ))}</div>
  </ScreenMessage>;
}

function Confirmation() {
  const [params] = useSearchParams();
  const status = params.get('status') || 'returned';
  const approved = status === 'approved' || status === 'returned';
  return (
    <section className="confirmation-screen">
      <div className={`confirmation-mark${approved ? '' : ' confirmation-rejected'}`}>{approved ? <CheckCircle /> : <Close />}</div>
      <h2>{status === 'returned' ? 'Item returned successfully!' : `Claim ${status}!`}</h2>
      <p>{status === 'returned' ? 'The item has been marked as returned.' : `The claim decision has been recorded as ${status}.`}</p>
      <Button component={Link} to="/admin" className="primary-button">Done</Button>
      <div className="confirmation-campus"><CampusIllustration /></div>
    </section>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Welcome />} />
      <Route path="/signin" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route path="/admin/login" element={<AuthPage adminLogin />} />
      <Route path="/dashboard" element={<Guard><Layout><Dashboard /></Layout></Guard>} />
      <Route path="/items" element={<Guard><Layout><Items /></Layout></Guard>} />
      <Route path="/search" element={<Guard><Layout><Items search /></Layout></Guard>} />
      <Route path="/items/:id" element={<Guard><Layout><ItemDetails /></Layout></Guard>} />
      <Route path="/report-lost" element={<Guard><Layout><ReportForm type="lost" /></Layout></Guard>} />
      <Route path="/report-found" element={<Guard><Layout><ReportForm type="found" /></Layout></Guard>} />
      <Route path="/claims/new" element={<Guard><Layout><ClaimForm /></Layout></Guard>} />
      <Route path="/my-claims" element={<Guard><Layout><Claims /></Layout></Guard>} />
      <Route path="/profile" element={<Guard><Layout><Profile /></Layout></Guard>} />
      <Route path="/profile/edit" element={<Guard><Layout><Profile edit /></Layout></Guard>} />
      <Route path="/notifications" element={<Guard><Layout><NotificationsPage /></Layout></Guard>} />
      <Route path="/admin" element={<Guard admin><Layout admin><AdminDashboard /></Layout></Guard>} />
      <Route path="/admin/manage" element={<Guard admin><Layout admin><AdminClaims /></Layout></Guard>} />
      <Route path="/admin/reports" element={<Guard admin><Layout admin><ManageReports /></Layout></Guard>} />
      <Route path="/admin/users" element={<Guard admin><Layout admin><AdminUsers /></Layout></Guard>} />
      <Route path="/admin/claims/:id" element={<Guard admin><Layout admin><ClaimReview /></Layout></Guard>} />
      <Route path="/admin/confirmation" element={<Guard admin><Layout admin><Confirmation /></Layout></Guard>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
