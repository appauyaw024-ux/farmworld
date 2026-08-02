import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  fetchPosts, createPost as apiCreatePost, togglePostLike, addPostComment,
  fetchJobs, toggleSavedJob, createJob as apiCreateJob, submitJobApplication as apiSubmitJobApplication,
  fetchTradeListings, createTradeListing, toggleTradeInterest,
  fetchAgroShops, createAgroShop,
  fetchNotifications, markAllNotificationsRead,
  fetchConnections, sendConnectionRequest,
  fetchConversations, sendDirectMessage, getOrCreateConversation,
  fetchGroupConversations, sendGroupMessage, createGroupConversation,
} from '../lib/api';

import {
  CURRENT_USER, POSTS, JOBS, CONVERSATIONS, GROUP_CONVERSATIONS,
  NOTIFICATIONS, CONNECTIONS, SUGGESTIONS, TRADE_LISTINGS, AGRO_SHOPS,
} from '../data/mockData';

const AppContext = createContext(null);

// Helper: use real data if non-empty, otherwise fall back to mock
const withFallback = (real, mock) => {
  if (!real || real.length === 0) return mock;
  const realIds = new Set(real.map(r => r.id || r.product || r.title));
  const remainingMock = mock.filter(m => !realIds.has(m.id) && !realIds.has(m.product) && !realIds.has(m.title));
  return [...real, ...remainingMock];
};

export function AppProvider({ children }) {
  const [user,          setUser]          = useState(CURRENT_USER);
  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [authLoading,   setAuthLoading]   = useState(true);
  const [dataLoading,   setDataLoading]   = useState(false);
  // Content state (starts with mock data so the app always looks populated)
  const [posts,         setPosts]         = useState(POSTS);
  const [jobs,          setJobs]          = useState(JOBS);
  const [tradeListings, setTradeListings] = useState(TRADE_LISTINGS);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [groups,        setGroups]        = useState(GROUP_CONVERSATIONS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [connections,   setConnections]   = useState(CONNECTIONS);
  const [suggestions,   setSuggestions]   = useState(SUGGESTIONS);
  const [agroShops,     setAgroShops]     = useState(AGRO_SHOPS);
  const [activeConv,    setActiveConv]    = useState(CONVERSATIONS[0]);
  // Track whether we're using real Supabase user (vs guest)
  const [isRealUser,    setIsRealUser]    = useState(false);

  // ─── Load all app data from Supabase ─────────────────────────
  const loadAppData = useCallback(async (userId) => {
    setDataLoading(true);
    try {
      const [
        realPosts, realJobs, realListings,
        realConvs, realGroups,
        realNotifs, realConns, realShops,
      ] = await Promise.allSettled([
        fetchPosts(userId),
        fetchJobs(userId),
        fetchTradeListings(userId),
        fetchConversations(userId),
        fetchGroupConversations(userId),
        fetchNotifications(userId),
        fetchConnections(userId),
        fetchAgroShops(),
      ]);

      // Use real data if Supabase returned rows; otherwise keep mock data
      if (realPosts.status === 'fulfilled')
        setPosts(withFallback(realPosts.value, POSTS));
      if (realJobs.status === 'fulfilled')
        setJobs(withFallback(realJobs.value, JOBS));
      if (realListings.status === 'fulfilled')
        setTradeListings(withFallback(realListings.value, TRADE_LISTINGS));
      if (realConvs.status === 'fulfilled')
        setConversations(withFallback(realConvs.value, CONVERSATIONS));
      if (realGroups.status === 'fulfilled')
        setGroups(withFallback(realGroups.value, GROUP_CONVERSATIONS));
      if (realNotifs.status === 'fulfilled')
        setNotifications(withFallback(realNotifs.value, NOTIFICATIONS));
      if (realShops.status === 'fulfilled')
        setAgroShops(withFallback(realShops.value, AGRO_SHOPS));
      if (realConns.status === 'fulfilled') {
        const conns = realConns.value;
        setConnections(withFallback(conns, CONNECTIONS));
        // Build suggestions from SUGGESTIONS excluding existing connections
        const connIds = new Set(conns.map(c => c.id));
        setSuggestions(SUGGESTIONS.filter(s => !connIds.has(s.id)));
      }
    } catch (err) {
      console.warn('loadAppData partial failure:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ─── Supabase Auth Listener ───────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        _applySupabaseUser(session.user);
        loadAppData(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        _applySupabaseUser(session.user);
        setIsLoggedIn(true);
        loadAppData(session.user.id);
      } else {
        setIsLoggedIn(false);
        setIsRealUser(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadAppData]);

  const _applySupabaseUser = (supaUser) => {
    const meta = supaUser.user_metadata || {};
    const name = meta.full_name || meta.name || CURRENT_USER.name;
    setUser(u => ({
      ...u,
      id: supaUser.id,
      email: supaUser.email,
      name,
      initials: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    }));
    setIsLoggedIn(true);
    setIsRealUser(true);
  };

  // ─── Auth ─────────────────────────────────────────────────────
  const login = async (email, name) => {
    // Guest demo — no Supabase call
    if (name) setUser(u => ({ ...u, name, email, initials: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }));
    setIsLoggedIn(true);
    setIsRealUser(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsRealUser(false);
    // Reset to mock data on logout
    setPosts(POSTS); setJobs(JOBS); setTradeListings(TRADE_LISTINGS);
    setConversations(CONVERSATIONS); setGroups(GROUP_CONVERSATIONS);
    setNotifications(NOTIFICATIONS); setConnections(CONNECTIONS);
    setSuggestions(SUGGESTIONS); setActiveConv(CONVERSATIONS[0]);
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password, name, headline) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, headline } },
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, name, headline: headline || '', email, avatar_color: '#15803d',
      });
    }
    return data;
  };

  // ─── Posts ────────────────────────────────────────────────────
  const likePost = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    // Optimistic UI
    setPosts(ps => ps.map(p => p.id === postId
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
    if (isRealUser) {
      try { await togglePostLike(postId, user.id, post.liked); }
      catch { // Revert on failure
        setPosts(ps => ps.map(p => p.id === postId
          ? { ...p, liked: post.liked, likes: post.likes }
          : p
        ));
      }
    }
  };

  const addComment = async (postId, text) => {
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: user.name,
      initials: user.initials || 'YY',
      color: user.avatarColor || '#15803d',
      text,
      time: 'just now',
    };

    setPosts(ps => ps.map(p => p.id === postId
      ? { ...p, comments: (p.comments || 0) + 1, commentList: [...(p.commentList || []), newComment] }
      : p
    ));

    if (isRealUser) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials,
          avatar_color: user.avatarColor || '#15803d',
        });
        await addPostComment(postId, user.id, text);
      } catch (err) {
        console.warn('Background addComment sync:', err);
      }
    }
  };

  const createPost = async (content, imageUrl = null) => {
    const newPost = {
      id: `p_${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorHeadline: user.headline || 'Farmer',
      authorInitials: user.initials || 'YY',
      authorColor: user.avatarColor || '#15803d',
      time: 'just now',
      content,
      likes: 0,
      comments: 0,
      reposts: 0,
      liked: false,
      image: imageUrl || null,
      commentList: [],
    };

    // Instantly reflect in UI 100% of the time!
    setPosts(ps => [newPost, ...ps]);

    if (isRealUser) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          headline: user.headline || '',
          email: user.email,
          initials: user.initials,
          avatar_color: user.avatarColor || '#15803d',
        });
        await apiCreatePost(user.id, content, imageUrl);
      } catch (err) {
        console.warn('Background createPost sync:', err);
      }
    }
  };

  const repostPost = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    setPosts(ps => ps.map(p => p.id === postId
      ? { ...p, reposted: !p.reposted, reposts: p.reposted ? Math.max(0, p.reposts - 1) : (p.reposts || 0) + 1 }
      : p
    ));
    if (isRealUser) {
      try {
        if (post.reposted) {
          await supabase.from('post_reposts').delete().eq('post_id', postId).eq('profile_id', user.id);
        } else {
          await supabase.from('post_reposts').insert({ post_id: postId, profile_id: user.id });
        }
      } catch (err) {
        console.error('repostPost failed:', err);
      }
    }
  };

  // ─── Jobs ─────────────────────────────────────────────────────
  const toggleSaveJob = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    setJobs(js => js.map(j => j.id === jobId ? { ...j, saved: !j.saved } : j));
    if (isRealUser) {
      try { await toggleSavedJob(user.id, jobId, job.saved); }
      catch { setJobs(js => js.map(j => j.id === jobId ? { ...j, saved: job.saved } : j)); }
    }
  };

  const postNewJob = async (jobData) => {
    const newJob = {
      id: `j_${Date.now()}`,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      type: jobData.type || 'Full-time',
      salary: jobData.salary || 'Negotiable',
      logo: jobData.logo || '💼',
      posted: 'just now',
      applicants: 0,
      skills: jobData.skills || ['Agriculture', 'Farm Management'],
      saved: false,
      easy: true,
      description: jobData.description || '',
    };

    setJobs(js => [newJob, ...js]);

    if (isRealUser) {
      try {
        await apiCreateJob(jobData, user.id);
      } catch (err) {
        console.warn('Background createJob sync:', err);
      }
    }

    return newJob;
  };

  const applyForJob = async (jobId, applicationData) => {
    setJobs(js => js.map(j => j.id === jobId
      ? { ...j, applicants: (j.applicants || 0) + 1, applied: true }
      : j
    ));

    if (isRealUser) {
      try {
        await apiSubmitJobApplication(jobId, user.id, applicationData);
      } catch (err) {
        console.warn('Background applyForJob sync:', err);
      }
    }
  };

  // ─── Network / Connections ────────────────────────────────────
  const connect = async (userId) => {
    const found = suggestions.find(s => s.id === userId);
    if (found) {
      setSuggestions(ss => ss.filter(s => s.id !== userId));
      setConnections(cs => [...cs, found]);
    }
    if (isRealUser) {
      try { await sendConnectionRequest(user.id, userId); }
      catch (err) { console.error('connect failed:', err); }
    }
  };

  const markConversationRead = (convId) => {
    setConversations(cs => cs.map(c => c.id === convId ? { ...c, unread: 0 } : c));
    setGroups(gs => gs.map(g => g.id === convId ? { ...g, unread: 0 } : g));
    setActiveConv(c => c?.id === convId ? { ...c, unread: 0 } : c);
  };

  const triggerAutoReply = (convId, contactName) => {
    setTimeout(() => {
      const replies = [
        "Thanks for sharing! I'll take a look at this right away 🌾",
        "Got your message! Let's discuss this further soon 👍",
        "Appreciate the update! That sounds very promising for our farm.",
        "Received! Thanks for sending this over 🚜",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const incMsg = { id: `m_inc_${Date.now()}`, senderId: `other_${convId}`, text: randomReply, time };

      setConversations(cs => cs.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            lastMessage: randomReply,
            time: 'just now',
            unread: (c.unread || 0) + 1,
            messages: [...(c.messages || []), incMsg],
          };
        }
        return c;
      }));

      setActiveConv(c => {
        if (c?.id === convId) {
          return { ...c, lastMessage: randomReply, messages: [...(c.messages || []), incMsg] };
        }
        return c;
      });
    }, 3500);
  };

  // ─── Messaging ────────────────────────────────────────────────
  const sendMessage = async (convId, text) => {
    const isGroup = typeof convId === 'string' && (convId.startsWith('g') || convId.length < 20);
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (isGroup) {
      const newMsg = {
        id: `gm${Date.now()}`, senderId: user.id, senderName: user.name,
        senderInitials: user.initials, senderColor: user.avatarColor, text, time,
      };
      const preview = `You: ${text}`;
      setGroups(gs => gs.map(g => g.id === convId
        ? { ...g, lastMessage: preview, messages: [...g.messages, newMsg], unread: 0, time: 'now' }
        : g
      ));
      setActiveConv(c => c?.id === convId
        ? { ...c, lastMessage: preview, messages: [...c.messages, newMsg] } : c
      );
      if (isRealUser) {
        try { await sendGroupMessage(convId, user.id, text); }
        catch (err) { console.error('sendGroupMessage failed:', err); }
      }
    } else {
      const newMsg = { id: `m${Date.now()}`, senderId: user.id, text, time };
      setConversations(cs => cs.map(c => c.id === convId
        ? { ...c, lastMessage: text, messages: [...c.messages, newMsg], unread: 0 }
        : c
      ));
      setActiveConv(c => c?.id === convId
        ? { ...c, lastMessage: text, messages: [...c.messages, newMsg] } : c
      );
      if (isRealUser) {
        try { await sendDirectMessage(convId, user.id, text); }
        catch (err) { console.error('sendDirectMessage failed:', err); }
      }

      // Simulate incoming reply after sending
      const targetConv = conversations.find(c => c.id === convId);
      triggerAutoReply(convId, targetConv?.name || 'Contact');
    }
  };

  const sendPostInDM = async (recipientId, post, noteText = '') => {
    const postSnippet = `📌 Shared Post by ${post.authorName}:\n"${post.content.slice(0, 140)}${post.content.length > 140 ? '...' : ''}"`;
    const fullMsg = noteText.trim() ? `${noteText}\n\n${postSnippet}` : postSnippet;

    let targetConv = conversations.find(c => c.userId === recipientId || c.id === recipientId) ||
                     groups.find(g => g.id === recipientId);
    let convId = targetConv?.id;

    if (!targetConv) {
      const recipient = connections.find(c => c.id === recipientId) || { id: recipientId, name: 'Connection', initials: '??', avatarColor: '#15803d' };
      convId = `c_${Date.now()}`;

      if (isRealUser) {
        try {
          const dbConvId = await getOrCreateConversation(user.id, recipientId);
          if (dbConvId) convId = dbConvId;
        } catch (err) {
          console.error('getOrCreateConversation failed:', err);
        }
      }

      targetConv = {
        id: convId,
        userId: recipient.id,
        name: recipient.name,
        initials: recipient.initials,
        color: recipient.avatarColor || recipient.color || '#15803d',
        lastMessage: fullMsg,
        time: 'just now',
        unread: 0,
        messages: [],
      };
    }

    const isGroup = typeof convId === 'string' && (convId.startsWith('g') || convId.length < 20);
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: `m_${Date.now()}`, senderId: user.id, text: fullMsg, time };

    const updatedConv = {
      ...targetConv,
      lastMessage: fullMsg,
      time: 'just now',
      messages: [...(targetConv.messages || []), newMsg],
    };

    if (isGroup) {
      setGroups(gs => gs.map(g => g.id === convId ? updatedConv : g));
    } else {
      setConversations(cs => {
        const exists = cs.some(c => c.id === convId);
        return exists ? cs.map(c => c.id === convId ? updatedConv : c) : [updatedConv, ...cs];
      });
    }

    setActiveConv(updatedConv);

    if (isRealUser) {
      try {
        if (isGroup) {
          await sendGroupMessage(convId, user.id, fullMsg);
        } else {
          await sendDirectMessage(convId, user.id, fullMsg);
        }
      } catch (err) {
        console.error('Database send message failed:', err);
      }
    }

    return updatedConv;
  };

  // ─── Group management ─────────────────────────────────────────
  const createGroup = async ({ name, emoji, description, memberIds }) => {
    const allIds = [...new Set([user.id, ...memberIds])];
    const allConns = [
      { id: user.id, name: user.name, initials: user.initials, color: user.avatarColor },
      ...connections,
    ];
    const members = allIds.map(id => allConns.find(c => c.id === id) || { id, name: 'Unknown', initials: '?', color: '#555' });

    if (isRealUser) {
      try {
        const groupId = await createGroupConversation({ name, emoji, description, memberIds, createdBy: user.id });
        await loadAppData(user.id); // Refresh groups from DB
        return;
      } catch (err) { console.error('createGroup DB failed:', err); }
    }

    const newGroup = {
      id: `g${Date.now()}`, isGroup: true, name, emoji: emoji || '💬', description,
      createdBy: user.id, members, time: 'now', unread: 0,
      lastMessage: `${user.name} created the group`,
      messages: [{
        id: `gm${Date.now()}`, senderId: 'system', senderName: 'System',
        senderInitials: '📢', senderColor: '#555',
        text: `${user.name} created the group "${name}" 🎉`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      }],
    };
    setGroups(gs => [newGroup, ...gs]);
    setActiveConv(newGroup);
  };

  const updateGroup = (groupId, { name, emoji, description }) => {
    setGroups(gs => gs.map(g => g.id === groupId ? { ...g, name, emoji, description } : g));
    setActiveConv(c => c?.id === groupId ? { ...c, name, emoji, description } : c);
  };

  const addMemberToGroup = (groupId, memberId) => {
    const allConns = [
      { id: user.id, name: user.name, initials: user.initials, color: user.avatarColor },
      ...connections,
    ];
    const newMember = allConns.find(c => c.id === memberId);
    if (!newMember) return;
    setGroups(gs => gs.map(g => {
      if (g.id !== groupId || g.members.find(m => m.id === memberId)) return g;
      return { ...g, members: [...g.members, newMember] };
    }));
    setActiveConv(c => {
      if (c?.id !== groupId || c.members.find(m => m.id === memberId)) return c;
      return { ...c, members: [...c.members, newMember] };
    });
  };

  const leaveGroup = (groupId) => {
    setGroups(gs => gs.map(g => g.id === groupId
      ? { ...g, members: g.members.filter(m => m.id !== user.id) } : g
    ));
    setActiveConv(c => (c?.id === groupId ? null : c));
  };

  // ─── Trade Portal ─────────────────────────────────────────────
  const createListing = async (data) => {
    const products = data.product.split(',').map(p => p.trim()).filter(Boolean);
    const prodsToCreate = products.length > 0 ? products : [data.product];

    if (isRealUser) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials || 'YY',
          avatar_color: user.avatarColor || '#15803d',
        });
        const newListings = await createTradeListing(data, user.id);
        if (Array.isArray(newListings) && newListings.length > 0) {
          setTradeListings(ls => [...newListings, ...ls]);
          return;
        }
      } catch (err) { console.error('createListing failed:', err); }
    }

    const localListings = prodsToCreate.map((pName, idx) => ({
      id: `tl_${Date.now()}_${idx}`,
      ...data,
      product: pName,
      postedDate: 'just now',
      interested: 0,
      verified: false,
      poster: { id: user.id, name: user.name, initials: user.initials, color: user.avatarColor, headline: user.headline },
    }));

    setTradeListings(ls => [...localListings, ...ls]);
  };

  const toggleInterestedListing = async (listingId) => {
    const listing = tradeListings.find(l => l.id === listingId);
    if (!listing) return;
    setTradeListings(ls => ls.map(l => l.id === listingId
      ? { ...l, interested: l._iInterested ? Math.max(0, l.interested - 1) : l.interested + 1, _iInterested: !l._iInterested }
      : l
    ));
    if (isRealUser) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials || 'YY',
          avatar_color: user.avatarColor || '#15803d',
        });
        await toggleTradeInterest(listingId, user.id, listing._iInterested);
      } catch (err) {
        console.warn('Background toggleInterestedListing sync:', err);
      }
    }
  };

  // ─── Notifications ────────────────────────────────────────────
  const markNotificationsRead = async () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    if (isRealUser) {
      try { await markAllNotificationsRead(user.id); }
      catch (err) { console.error('markNotificationsRead failed:', err); }
    }
  };

  // ─── Agro Shops Directory ──────────────────────────────────────
  const registerShop = async (shopData) => {
    if (isRealUser) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials || 'YY',
          avatar_color: user.avatarColor || '#15803d',
        });
        const newShop = await createAgroShop(shopData, user.id);
        if (newShop) {
          setAgroShops(ss => [newShop, ...ss]);
          return newShop;
        }
      } catch (err) {
        console.warn('registerShop Supabase error:', err);
      }
    }

    const localShop = {
      id: `shop_${Date.now()}`,
      name: shopData.name,
      tagline: shopData.tagline,
      description: shopData.description || '',
      logo: shopData.logo || '🌿',
      logoColor: shopData.logoColor || '#15803d',
      banner: shopData.banner || 'linear-gradient(135deg,#15803d,#4ade80)',
      category: Array.isArray(shopData.category) && shopData.category.length > 0 ? shopData.category : ['Fertilizers'],
      location: shopData.location,
      country: shopData.country || 'Ghana',
      phone: shopData.phone || '',
      email: shopData.email || '',
      website: shopData.website || '',
      verified: false,
      rating: 5.0,
      reviews: 1,
      established: shopData.established || new Date().getFullYear().toString(),
      specialties: shopData.specialties || [],
      brands: shopData.brands || [],
      views: 1,
      inquiries: 0,
      isFeatured: false,
    };

    setAgroShops(ss => [localShop, ...ss]);
    return localShop;
  };

  // ─── Derived counts ───────────────────────────────────────────
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const unreadMsgCount = [...conversations, ...groups].reduce((acc, c) => acc + (c.unread || 0), 0);

  return (
    <AppContext.Provider value={{
      user, isLoggedIn, authLoading, dataLoading, isRealUser,
      login, logout, signInWithEmail, signUpWithEmail,
      posts, likePost, addComment, createPost, repostPost,
      jobs, toggleSaveJob, postNewJob, applyForJob,
      tradeListings, createListing, toggleInterestedListing,
      agroShops, registerShop,
      conversations, groups, activeConv, setActiveConv, sendMessage, sendPostInDM, markConversationRead,
      createGroup, updateGroup, addMemberToGroup, leaveGroup,
      notifications, markNotificationsRead, unreadNotifCount, unreadMsgCount,
      connections, suggestions, connect,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
