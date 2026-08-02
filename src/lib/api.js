/**
 * src/lib/api.js
 * Data access layer — all Supabase queries in one place.
 * Every function transforms Supabase rows into the shape
 * that existing components already expect, so no page files need to change.
 */
import { supabase } from './supabase';

// ─── Utility: relative time ──────────────────────────────────
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return 'just now';
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

// ─── Row → component shape transformers ─────────────────────

function transformPost(row, currentUserId) {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author?.name || 'Unknown',
    authorHeadline: row.author?.headline || '',
    authorInitials: row.author?.initials || '??',
    authorColor: row.author?.avatar_color || '#15803d',
    time: timeAgo(row.created_at),
    content: row.content,
    image: row.image_url || null,
    likes: row.likes_count || 0,
    comments: row.comments_count || 0,
    reposts: row.reposts_count || 0,
    liked: Array.isArray(row.post_likes) && row.post_likes.some(l => l.profile_id === currentUserId),
    commentList: Array.isArray(row.post_comments)
      ? row.post_comments
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(c => ({
            id: c.id,
            authorName: c.author?.name || 'Unknown',
            initials: c.author?.initials || '??',
            color: c.author?.avatar_color || '#15803d',
            text: c.content,
            time: timeAgo(c.created_at),
          }))
      : [],
  };
}

function transformJob(row, savedIds = new Set()) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.job_type || 'Full-time',
    salary: row.salary_range || '',
    logo: row.logo_emoji || '💼',
    posted: timeAgo(row.created_at),
    applicants: row.applicants || 0,
    skills: Array.isArray(row.job_skills) ? row.job_skills.map(s => s.skill) : [],
    saved: savedIds.has(row.id),
    easy: row.easy_apply || false,
    description: row.description || '',
  };
}

function transformListing(row, interestedIds = new Set()) {
  return {
    id: row.id,
    type: row.trade_type,
    product: row.product,
    category: row.category || '',
    quantity: row.quantity,
    unit: row.unit,
    location: row.location,
    priceMin: row.price_min,
    priceMax: row.price_max,
    currency: row.currency || 'USD',
    perUnit: row.per_unit || 'ton',
    deadline: row.deadline,
    postedDate: timeAgo(row.created_at),
    description: row.description,
    certifications: row.certifications || [],
    verified: row.verified || false,
    interested: row.interested_count || 0,
    _iInterested: interestedIds.has(row.id),
    poster: {
      id: row.poster?.id || '',
      name: row.poster?.name || 'Unknown',
      initials: row.poster?.initials || '??',
      color: row.poster?.avatar_color || '#15803d',
      headline: row.poster?.headline || '',
    },
  };
}

function transformShop(row) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    logo: row.logo_emoji || '🌿',
    logoColor: row.logo_color || '#15803d',
    banner: row.banner_css || 'linear-gradient(135deg,#15803d,#4ade80)',
    category: row.category || [],
    location: row.location || '',
    county: row.county || '',
    country: row.country || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    website: row.website || '',
    verified: row.verified || false,
    rating: row.rating || 0,
    reviews: row.review_count || 0,
    established: row.established || '',
    specialties: row.specialties || [],
    brands: row.brands || [],
    openHours: row.open_hours || '',
    postedDate: timeAgo(row.created_at),
    views: row.views || 0,
    inquiries: row.inquiries || 0,
    isFeatured: row.is_featured || false,
  };
}

function transformConversation(row, profileId) {
  const other = row.participant1 === profileId ? row.p2 : row.p1;
  const msgs = (row.messages || [])
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const unread = msgs.filter(m => m.sender_id !== profileId && !m.read_at).length;
  return {
    id: row.id,
    userId: other?.id || '',
    name: other?.name || 'Unknown',
    initials: other?.initials || '??',
    color: other?.avatar_color || '#15803d',
    lastMessage: row.last_message || '',
    time: timeAgo(row.last_message_at),
    unread,
    messages: msgs.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.content,
      time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })),
  };
}

function transformGroupConv(row, profileId) {
  const msgs = (row.group_messages || [])
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const unread = msgs.filter(m => m.sender_id !== profileId).length; // simplified
  return {
    id: row.id,
    isGroup: true,
    name: row.name,
    emoji: row.emoji || '💬',
    description: row.description || '',
    createdBy: row.created_by,
    lastMessage: row.last_message || '',
    time: timeAgo(row.last_message_at),
    unread,
    members: (row.group_members || []).map(m => ({
      id: m.profile_id,
      name: m.profile?.name || 'Unknown',
      initials: m.profile?.initials || '??',
      color: m.profile?.avatar_color || '#15803d',
    })),
    messages: msgs.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      senderName: m.sender?.name || 'Unknown',
      senderInitials: m.sender?.initials || '??',
      senderColor: m.sender?.avatar_color || '#15803d',
      text: m.content,
      isSystem: m.is_system || false,
      time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })),
  };
}

// ═══════════════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════════════

export async function fetchPosts(currentUserId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(name, headline, avatar_color, initials),
      post_likes(profile_id),
      post_comments(id, content, created_at,
        author:profiles!post_comments_author_id_fkey(name, avatar_color, initials)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map(row => transformPost(row, currentUserId));
}

export async function createPost(authorId, content, imageUrl = null) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id: authorId, content, image_url: imageUrl })
    .select('*, author:profiles!posts_author_id_fkey(name, headline, avatar_color, initials)')
    .single();
  if (error) throw error;
  return transformPost({ ...data, post_likes: [], post_comments: [] }, authorId);
}

export async function togglePostLike(postId, profileId, currentlyLiked) {
  if (currentlyLiked) {
    const { error } = await supabase.from('post_likes')
      .delete().eq('post_id', postId).eq('profile_id', profileId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('post_likes')
      .insert({ post_id: postId, profile_id: profileId });
    if (error) throw error;
  }
}

export async function addPostComment(postId, authorId, content) {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, author_id: authorId, content })
    .select('*, author:profiles!post_comments_author_id_fkey(name, avatar_color, initials)')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    authorName: data.author?.name || 'You',
    initials: data.author?.initials || '??',
    color: data.author?.avatar_color || '#15803d',
    text: data.content,
    time: 'just now',
  };
}

// ═══════════════════════════════════════════════════════════════
// JOBS
// ═══════════════════════════════════════════════════════════════

export async function fetchJobs(profileId) {
  const { data: jobsData, error } = await supabase
    .from('jobs')
    .select('*, job_skills(skill)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const { data: savedData } = await supabase
    .from('saved_jobs').select('job_id').eq('profile_id', profileId);
  const savedIds = new Set((savedData || []).map(s => s.job_id));

  return (jobsData || []).map(row => transformJob(row, savedIds));
}

export async function toggleSavedJob(profileId, jobId, currentlySaved) {
  if (currentlySaved) {
    await supabase.from('saved_jobs')
      .delete().eq('profile_id', profileId).eq('job_id', jobId);
  } else {
    await supabase.from('saved_jobs')
      .insert({ profile_id: profileId, job_id: jobId });
  }
}

export async function createJob(jobData, profileId) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        poster_id: profileId,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        job_type: jobData.type,
        salary_range: jobData.salary,
        logo_emoji: jobData.logo || '💼',
        easy_apply: true,
        description: jobData.description,
      })
      .select('*')
      .single();
    if (error) {
      console.warn('Supabase jobs insert policy:', error.message);
      return null;
    }
    return transformJob(data, new Set());
  } catch (err) {
    console.warn('createJob error:', err);
    return null;
  }
}

export async function submitJobApplication(jobId, profileId, applicationData) {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        applicant_id: profileId,
        full_name: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone,
        cover_note: applicationData.coverNote,
      })
      .select('*')
      .single();
    if (error) console.warn('job_applications insert warning:', error.message);
    return data;
  } catch (err) {
    console.warn('submitJobApplication error:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// TRADE LISTINGS
// ═══════════════════════════════════════════════════════════════

export async function fetchTradeListings(profileId) {
  const { data, error } = await supabase
    .from('trade_listings')
    .select('*, poster:profiles(id, name, headline, avatar_color, initials)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const { data: interestData } = await supabase
    .from('trade_interests').select('listing_id').eq('profile_id', profileId);
  const interestedIds = new Set((interestData || []).map(i => i.listing_id));

  return (data || []).map(row => transformListing(row, interestedIds));
}

export async function createTradeListing(listingData, posterId) {
  const products = listingData.product.split(',').map(p => p.trim()).filter(Boolean);
  const itemsToInsert = (products.length > 0 ? products : [listingData.product]).map(prod => ({
    poster_id: posterId,
    trade_type: listingData.type,
    product: prod,
    category: listingData.category,
    quantity: listingData.quantity,
    unit: listingData.unit,
    price_min: listingData.priceMin,
    price_max: listingData.priceMax,
    currency: listingData.currency || 'USD',
    per_unit: listingData.perUnit,
    location: listingData.location,
    deadline: listingData.deadline,
    description: listingData.description,
    certifications: listingData.certifications || [],
  }));

  const { data, error } = await supabase
    .from('trade_listings')
    .insert(itemsToInsert)
    .select('*, poster:profiles(id, name, headline, avatar_color, initials)');

  if (error) throw error;
  return (data || []).map(row => transformListing(row, new Set()));
}

export async function toggleTradeInterest(listingId, profileId, currentlyInterested) {
  try {
    const isUuid = typeof listingId === 'string' && listingId.length > 20 && listingId.includes('-');
    if (!isUuid) {
      console.warn('Listing ID is mock ID, skipping Supabase persistence:', listingId);
      return;
    }
    if (currentlyInterested) {
      const { error } = await supabase.from('trade_interests')
        .delete().eq('listing_id', listingId).eq('profile_id', profileId);
      if (error) console.warn('trade_interests delete warning:', error.message);
    } else {
      const { error } = await supabase.from('trade_interests')
        .insert({ listing_id: listingId, profile_id: profileId });
      if (error) console.warn('trade_interests insert warning:', error.message);

      // Notify the poster in Supabase notifications table
      try {
        const { data: listingData } = await supabase
          .from('trade_listings')
          .select('poster_id, product')
          .eq('id', listingId)
          .single();

        if (listingData && listingData.poster_id && listingData.poster_id !== profileId) {
          await supabase.from('notifications').insert({
            recipient_id: listingData.poster_id,
            actor_id: profileId,
            type: 'trade_interest',
            content: `offered to supply your listing for ${listingData.product}`,
            read: false,
          });
        }
      } catch (notifErr) {
        console.warn('Notification insert warning:', notifErr);
      }
    }
  } catch (err) {
    console.warn('toggleTradeInterest error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// AGRO SHOPS
// ═══════════════════════════════════════════════════════════════

export async function fetchAgroShops() {
  const { data, error } = await supabase
    .from('agro_shops')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false });
  if (error) throw error;
  return (data || []).map(transformShop);
}

export async function createAgroShop(shopData, ownerId) {
  const { data, error } = await supabase
    .from('agro_shops')
    .insert({
      owner_id: ownerId,
      name: shopData.name,
      tagline: shopData.tagline,
      description: shopData.description,
      logo_emoji: shopData.logo || '🌿',
      logo_color: shopData.logoColor || '#15803d',
      banner_css: shopData.banner || 'linear-gradient(135deg,#15803d,#4ade80)',
      category: shopData.category || ['Fertilizers'],
      location: shopData.location,
      country: shopData.country || 'Ghana',
      phone: shopData.phone || '',
      email: shopData.email || '',
      website: shopData.website || '',
      verified: false,
      rating: 5.0,
      review_count: 1,
      established: shopData.established || new Date().getFullYear().toString(),
      specialties: shopData.specialties || [],
      brands: shopData.brands || [],
      is_featured: false,
    })
    .select()
    .single();

  if (error) throw error;
  return transformShop(data);
}

export async function incrementShopViews(shopId) {
  try {
    const isUuid = typeof shopId === 'string' && shopId.length > 20 && shopId.includes('-');
    if (!isUuid) return;
    await supabase.rpc('increment_shop_views', { shop_id: shopId }).catch(async () => {
      const { data } = await supabase.from('agro_shops').select('views').eq('id', shopId).single();
      if (data) {
        await supabase.from('agro_shops').update({ views: (data.views || 0) + 1 }).eq('id', shopId);
      }
    });
  } catch (err) {
    console.warn('incrementShopViews error:', err);
  }
}

export async function incrementShopInquiries(shopId) {
  try {
    const isUuid = typeof shopId === 'string' && shopId.length > 20 && shopId.includes('-');
    if (!isUuid) return;
    await supabase.rpc('increment_shop_inquiries', { shop_id: shopId }).catch(async () => {
      const { data } = await supabase.from('agro_shops').select('inquiries').eq('id', shopId).single();
      if (data) {
        await supabase.from('agro_shops').update({ inquiries: (data.inquiries || 0) + 1 }).eq('id', shopId);
      }
    });
  } catch (err) {
    console.warn('incrementShopInquiries error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// HERO MEDIA (Images & Videos)
// ═══════════════════════════════════════════════════════════════

export async function fetchHeroMedia(page = 'shops') {
  try {
    const { data, error } = await supabase
      .from('hero_media')
      .select('*')
      .eq('page', page)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('fetchHeroMedia warning:', error.message);
      return [];
    }

    // Auto-detect media type from URL extension as a reliable fallback
    const detectType = (url, storedType) => {
      if (!url) return storedType || 'image';
      const lower = url.toLowerCase().split('?')[0];
      if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.endsWith('.mov')) return 'video';
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif') || lower.endsWith('.avif')) return 'image';
      return storedType || 'image';
    };

    return (data || []).map(row => ({
      id: row.id,
      page: row.page,
      mediaType: detectType(row.media_url, row.media_type),
      mediaUrl: row.media_url,
      posterUrl: row.poster_url,
      title: row.title,
      subtitle: row.subtitle,
      badgeLabel: row.badge_label,
    }));
  } catch (err) {
    console.warn('fetchHeroMedia error:', err);
    return [];
  }
}

export async function saveHeroMedia(mediaData) {
  try {
    // Deactivate all existing hero media for this page so only one is active
    await supabase
      .from('hero_media')
      .update({ is_active: false })
      .eq('page', mediaData.page || 'shops');

    const { data, error } = await supabase
      .from('hero_media')
      .insert({
        page: mediaData.page || 'shops',
        media_type: mediaData.mediaType || 'image',
        media_url: mediaData.mediaUrl,
        poster_url: mediaData.posterUrl || null,
        title: mediaData.title || null,
        subtitle: mediaData.subtitle || null,
        badge_label: mediaData.badgeLabel || null,
        is_active: true,
        display_order: 1,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      page: data.page,
      mediaType: data.media_type,
      mediaUrl: data.media_url,
      posterUrl: data.poster_url,
      title: data.title,
      subtitle: data.subtitle,
      badgeLabel: data.badge_label,
    };
  } catch (err) {
    console.warn('saveHeroMedia error:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export async function fetchNotifications(profileId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(name, avatar_color, initials)')
    .eq('recipient_id', profileId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    type: row.type,
    actor: row.actor?.name || 'Someone',
    actorInitials: row.actor?.initials || '??',
    actorColor: row.actor?.avatar_color || '#15803d',
    content: row.content,
    time: timeAgo(row.created_at),
    read: row.read,
  }));
}

export async function markAllNotificationsRead(profileId) {
  await supabase.from('notifications')
    .update({ read: true })
    .eq('recipient_id', profileId)
    .eq('read', false);
}

// ═══════════════════════════════════════════════════════════════
// CONNECTIONS / NETWORK
// ═══════════════════════════════════════════════════════════════

export async function fetchConnections(profileId) {
  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      requester:profiles!requester_id(id, name, headline, avatar_color, initials, connection_count),
      addressee:profiles!addressee_id(id, name, headline, avatar_color, initials, connection_count)
    `)
    .or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`)
    .eq('status', 'accepted');
  if (error) throw error;

  return (data || []).map(row => {
    const other = row.requester_id === profileId ? row.addressee : row.requester;
    return {
      id: other.id,
      name: other.name,
      headline: other.headline || '',
      initials: other.initials || '??',
      avatarColor: other.avatar_color || '#15803d',
      connections: other.connection_count || 0,
    };
  });
}

export async function sendConnectionRequest(requesterId, addresseeId) {
  const { error } = await supabase
    .from('connections')
    .insert({ requester_id: requesterId, addressee_id: addresseeId });
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY ICONS
// ═══════════════════════════════════════════════════════════════

export async function fetchCategoryIcons() {
  try {
    const { data, error } = await supabase
      .from('category_icons')
      .select('category_name, icon_emoji, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.warn('fetchCategoryIcons error:', error.message);
      return {};
    }

    // Transform to object for easy lookup: { Fertilizers: '🌿', Seeds: '🌱' }
    const iconsMap = {};
    (data || []).forEach(row => {
      iconsMap[row.category_name] = row.icon_emoji || '';
    });
    
    return iconsMap;
  } catch (err) {
    console.warn('fetchCategoryIcons error:', err);
    return {};
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGING — Direct Conversations
// ═══════════════════════════════════════════════════════════════

export async function fetchConversations(profileId) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      p1:profiles!participant1(id, name, avatar_color, initials),
      p2:profiles!participant2(id, name, avatar_color, initials),
      messages(id, sender_id, content, created_at, read_at)
    `)
    .or(`participant1.eq.${profileId},participant2.eq.${profileId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => transformConversation(row, profileId));
}

export async function sendDirectMessage(conversationId, senderId, content) {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  });
  if (error) throw error;
  await supabase.from('conversations').update({
    last_message: content,
    last_message_at: new Date().toISOString(),
  }).eq('id', conversationId);
}

export async function getOrCreateConversation(userId1, userId2) {
  const [p1, p2] = [userId1, userId2].sort(); // canonical order
  const { data } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant1', p1)
    .eq('participant2', p2)
    .maybeSingle();

  if (data) return data.id;

  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({ participant1: p1, participant2: p2 })
    .select('id').single();
  if (error) throw error;
  return newConv.id;
}

// ═══════════════════════════════════════════════════════════════
// MESSAGING — Group Conversations
// ═══════════════════════════════════════════════════════════════

export async function fetchGroupConversations(profileId) {
  try {
    const { data, error } = await supabase
      .from('group_conversations')
      .select(`
        *,
        group_members(
          profile_id,
          profile:profiles(name, avatar_color, initials)
        ),
        group_messages(
          id, sender_id, content, created_at, is_system,
          sender:profiles(name, avatar_color, initials)
        )
      `)
      .order('last_message_at', { ascending: false });
    if (error) {
      console.warn('fetchGroupConversations:', error.message);
      return [];
    }
    // Only return groups the user is a member of
    return (data || [])
      .filter(g => (g.group_members || []).some(m => m.profile_id === profileId))
      .map(g => transformGroupConv(g, profileId));
  } catch (err) {
    console.warn('fetchGroupConversations error:', err);
    return [];
  }
}

export async function sendGroupMessage(groupId, senderId, content, isSystem = false) {
  const { error } = await supabase.from('group_messages').insert({
    group_id: groupId,
    sender_id: isSystem ? null : senderId,
    content,
    is_system: isSystem,
  });
  if (error) throw error;
  await supabase.from('group_conversations').update({
    last_message: content,
    last_message_at: new Date().toISOString(),
  }).eq('id', groupId);
}

export async function createGroupConversation({ name, emoji, description, memberIds, createdBy }) {
  const { data: group, error } = await supabase
    .from('group_conversations')
    .insert({ name, emoji: emoji || '💬', description, created_by: createdBy })
    .select('id').single();
  if (error) throw error;

  const allIds = [...new Set([createdBy, ...memberIds])];
  await supabase.from('group_members').insert(
    allIds.map(id => ({ group_id: group.id, profile_id: id, role: id === createdBy ? 'admin' : 'member' }))
  );

  await sendGroupMessage(group.id, null, `Group "${name}" was created 🎉`, true);
  return group.id;
}
