import { Story, Chapter } from '../types/story';

// MangaDex API base URL
const MANGADEX_API_BASE = 'http://10.0.2.2:8080/api/mangadex';

// MangaDex API endpoints
const ENDPOINTS = {
    MANGA: '/manga',
    CHAPTER: '/chapter',
    COVER: '/cover',
    AUTHOR: '/author',
    ARTIST: '/artist',
    TAG: '/tag',
    USER: '/user',
    AUTH: '/auth',
    AT_HOME: '/at-home/server',
} as const;

// MangaDex API response types
interface MangaDexManga {
    id: string;
    type: 'manga';
    attributes: {
        title: {
            en?: string;
            ja?: string;
            'ja-ro'?: string;
            ko?: string;
            'zh-cn'?: string;
            'zh-hk'?: string;
            'zh-ro'?: string;
            'zh-tw'?: string;
        };
        altTitles: {
            en?: string;
            ja?: string;
            'ja-ro'?: string;
            ko?: string;
            'zh-cn'?: string;
            'zh-hk'?: string;
            'zh-ro'?: string;
            'zh-tw'?: string;
        }[];
        description: {
            en?: string;
            ja?: string;
            'ja-ro'?: string;
            ko?: string;
            'zh-cn'?: string;
            'zh-hk'?: string;
            'zh-ro'?: string;
            'zh-tw'?: string;
        };
        status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
        year?: number;
        contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
        tags: {
            id: string;
            type: 'tag';
            attributes: {
                name: {
                    en: string;
                };
                group: string;
            };
        }[];
        originalLanguage: string;
        lastVolume?: string;
        lastChapter?: string;
        publicationDemographic?: 'shounen' | 'shoujo' | 'josei' | 'seinen';
    };
    relationships: {
        id: string;
        type: string;
        attributes?: any;
    }[];
}

interface MangaDexChapter {
    id: string;
    type: 'chapter';
    attributes: {
        title?: string;
        volume?: string;
        chapter?: string;
        pages: number;
        publishAt: string;
        readableAt: string;
        createdAt: string;
        updatedAt: string;
        externalUrl?: string;
        version: number;
        translatedLanguage: string;
    };
    relationships: {
        id: string;
        type: string;
        attributes?: {
            name?: string;
            username?: string;
            fileName?: string;
        };
    }[];
}

interface ChapterDetail {
    id: string;
    title: string;
    volume?: string;
    chapter: string;
    pages: number;
    publishAt: Date;
    translatedLanguage: string;
    scanlationGroup?: string;
    uploader?: string;
    externalUrl?: string;
    version: number;
    mangaId: string;
    mangaTitle: string;
}

interface MangaDexResponse<T> {
    result: 'ok' | 'error';
    response: string;
    data: T[];
    limit: number;
    offset: number;
    total: number;
}

class MangaDexService {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private isApiBlocked: boolean = false;

    // Authentication methods
    async authenticate(username: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${MANGADEX_API_BASE}${ENDPOINTS.AUTH}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.token.session;
                this.refreshToken = data.token.refresh;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Authentication error:', error);
            return false;
        }
    }

    async refreshAuth(): Promise<boolean> {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(`${MANGADEX_API_BASE}${ENDPOINTS.AUTH}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.refreshToken,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.token.session;
                this.refreshToken = data.token.refresh;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    }

    private getAuthHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    // Manga methods
    // Get manga list with advanced filtering (like MangaDx)
    async getMangaList(params: {
        limit?: number;
        offset?: number;
        title?: string;
        authors?: string[];
        artists?: string[];
        year?: number;
        includedTags?: string[];
        excludedTags?: string[];
        status?: string[];
        originalLanguage?: string[];
        excludedOriginalLanguage?: string[];
        availableTranslatedLanguage?: string[];
        publicationDemographic?: string[];
        ids?: string[];
        contentRating?: string[];
        createdAtSince?: string;
        updatedAtSince?: string;
        order?: Record<string, 'asc' | 'desc'>;
        includes?: string[];
    } = {}): Promise<Story[]> {
        try {
            const queryParams = new URLSearchParams();

            // Add parameters to query
            Object.entries({ ...params, availableTranslatedLanguage: ['en'] }).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (key === 'order' && typeof value === 'object' && !Array.isArray(value)) {
                        // Handle order parameter specially
                        Object.entries(value as Record<string, string>).forEach(([orderKey, orderValue]) => {
                            queryParams.set(`order[${orderKey}]`, orderValue);
                        });
                    } else if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(`${key}[]`, v));
                    } else {
                        queryParams.set(key, String(value));
                    }
                }
            });

            const url = `${MANGADEX_API_BASE}${ENDPOINTS.MANGA}?${queryParams.toString()}`;
            console.log('🌐 Fetching manga from URL:', url);
            console.log('📋 Query params:', queryParams.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseText = await response.text();
            console.log('📄 Raw response (first 500 chars):', responseText.substring(0, 500));

            let data: MangaDexResponse<MangaDexManga>;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                console.error('❌ Response text:', responseText);
                throw new Error('Invalid JSON response from server');
            }

            console.log('✅ Parsed data result:', data.result);
            console.log('✅ Data length:', data.data?.length || 0);
            console.log('✅ Total available:', data.total || 0);

            if (data.result !== 'ok') {
                throw new Error(`API returned error: ${data.response || 'Unknown error'}`);
            }

            if (!data.data || !Array.isArray(data.data)) {
                console.warn('⚠️ No data array in response, using fallback');
                return this.getFallbackData();
            }

            const transformedStories = data.data.map(manga => this.transformMangaToStory(manga));
            console.log('🔄 Transformed stories count:', transformedStories.length);
            
            return transformedStories;
        } catch (error) {
            console.error('❌ Error fetching manga list:', error);
            console.error('❌ Error type:', typeof error);
            console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
            console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');

            if (error instanceof Error) {
                if (['Network request failed', 'NetworkError', 'TypeError', 'fetch'].some(type => 
                    error.message.includes(type) || error.name === type)) {
                    console.warn('🚫 MangaDX API blocked or network issue. Using fallback data.');
                    this.isApiBlocked = true;
                    return this.getFallbackData();
                }
            }

            // For any other error, still return fallback data
            console.warn('🔄 API error, falling back to mock data');
            return this.getFallbackData();
        }
    }

    // Fallback data when API is not available
    private getFallbackData(): Story[] {
        return [
            {
                id: 'fallback-1',
                title: 'One Piece',
                author: 'Eiichiro Oda',
                cover: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=One+Piece',
                description: 'Follow Monkey D. Luffy, a young pirate with rubber powers, as he explores the Grand Line with his diverse crew of pirates, named the Straw Hat Pirates.',
                level: 'Intermediate',
                chapters: 1000,
                rating: 4.8,
                readCount: 1500000,
                tags: ['Adventure', 'Comedy', 'Drama', 'Shounen'],
                status: 'Ongoing'
            },
            {
                id: 'fallback-2',
                title: 'Attack on Titan',
                author: 'Hajime Isayama',
                cover: 'https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Attack+on+Titan',
                description: 'Humanity fights for survival against giant humanoid Titans behind three massive walls.',
                level: 'Advanced',
                chapters: 139,
                rating: 4.7,
                readCount: 1200000,
                tags: ['Action', 'Drama', 'Fantasy', 'Shounen'],
                status: 'Completed'
            },
            {
                id: 'fallback-3',
                title: 'My Hero Academia',
                author: 'Kohei Horikoshi',
                cover: 'https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=My+Hero+Academia',
                description: 'In a world where most people have superpowers called "Quirks", Izuku Midoriya dreams of becoming a hero despite being born without powers.',
                level: 'Beginner',
                chapters: 400,
                rating: 4.6,
                readCount: 800000,
                tags: ['Action', 'School', 'Shounen', 'Superhero'],
                status: 'Ongoing'
            },
            {
                id: 'fallback-4',
                title: 'Demon Slayer',
                author: 'Koyoharu Gotouge',
                cover: 'https://via.placeholder.com/300x400/96CEB4/FFFFFF?text=Demon+Slayer',
                description: 'A young boy becomes a demon slayer to avenge his family and cure his sister.',
                level: 'Intermediate',
                chapters: 205,
                rating: 4.5,
                readCount: 900000,
                tags: ['Action', 'Historical', 'Shounen', 'Supernatural'],
                status: 'Completed'
            }
        ];
    }

    async getMangaById(id: string): Promise<Story | null> {
        try {
            const url = `${MANGADEX_API_BASE}${ENDPOINTS.MANGA}/${id}`;
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.transformMangaToStory(data.data);
        } catch (error) {
            console.error('Error fetching manga by ID:', error);
            return null;
        }
    }

    async getMangaChapters(mangaId: string, params: {
        limit?: number;
        offset?: number;
        ids?: string[];
        title?: string;
        groups?: string[];
        uploader?: string[];
        volume?: string[];
        chapter?: string[];
        translatedLanguage?: string[];
        originalLanguage?: string[];
        excludedOriginalLanguage?: string[];
        contentRating?: string[];
        excludedGroups?: string[];
        excludedUploaders?: string[];
        includeFutureUpdates?: boolean;
        includeEmptyPages?: boolean;
        includeFuturePublishAt?: boolean;
        includeExternalUrl?: boolean;
        order?: Record<string, 'asc' | 'desc'>;
        includes?: string[];
    } = {}): Promise<ChapterDetail[]> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.set('manga', mangaId);

            // Add parameters to query
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (key === 'order' && typeof value === 'object' && !Array.isArray(value)) {
                        // Handle order parameter specially
                        Object.entries(value as Record<string, string>).forEach(([orderKey, orderValue]) => {
                            queryParams.set(`order[${orderKey}]`, orderValue);
                        });
                    } else if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(`${key}[]`, v));
                    } else {
                        queryParams.set(key, String(value));
                    }
                }
            });

            const url = `${MANGADEX_API_BASE}${ENDPOINTS.CHAPTER}?${queryParams.toString()}`;
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: MangaDexResponse<MangaDexChapter> = await response.json();

            // Map to ChapterDetail
            return data.data.map(chapter => {
                const groupRel = chapter.relationships.find(rel => rel.type === 'scanlation_group');
                const uploaderRel = chapter.relationships.find(rel => rel.type === 'user');
                return {
                    id: chapter.id,
                    title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter || 'Unknown'}`,
                    volume: chapter.attributes.volume,
                    chapter: chapter.attributes.chapter || '0',
                    pages: chapter.attributes.pages,
                    publishAt: new Date(chapter.attributes.publishAt),
                    translatedLanguage: chapter.attributes.translatedLanguage,
                    scanlationGroup: groupRel?.attributes?.name,
                    uploader: uploaderRel?.attributes?.username,
                    externalUrl: chapter.attributes.externalUrl,
                    version: chapter.attributes.version,
                    mangaId,
                    mangaTitle: '', // Can be fetched from another API if needed
                };
            });
        } catch (error) {
            console.error('Error fetching manga chapters:', error);
            return [];
        }
    }

    async getChapterPages(chapterId: string): Promise<string[]> {
        try {
            console.log('Getting chapter pages for ID:', chapterId);
    
            // Bước 1: Gọi at-home server để lấy baseUrl và dữ liệu ảnh
            const atHomeRes = await fetch(`${MANGADEX_API_BASE}/at-home/server/${chapterId}`);
            console.log('At-home response status:', atHomeRes.status);
    
            if (!atHomeRes.ok) throw new Error(`HTTP error! status: ${atHomeRes.status}`);
    
            const atHomeData = await atHomeRes.json();
            console.log('At-home data (full):', JSON.stringify(atHomeData, null, 2));
    
            const baseUrl = atHomeData.baseUrl;
            const chapter = atHomeData.chapter;
    
            if (!chapter) {
                throw new Error('Chapter data missing in at-home response');
            }
    
            const hash = chapter.hash;
            const data = chapter.data;
            const dataSaver = chapter.dataSaver;
    
            console.log('Chapter hash:', hash);
            console.log('Data pages:', data?.length ?? 'null');
            console.log('DataSaver pages:', dataSaver?.length ?? 'null');
    
            // Ưu tiên dataSaver nếu có, fallback sang data
            const pages = (dataSaver && dataSaver.length > 0) ? dataSaver : data;
    
            if (!Array.isArray(pages) || pages.length === 0) {
                console.warn('No pages found for this chapter. Falling back to mock.');
                return [];
            }
    
            const pageUrls = pages.map((filename: string) => 
                `${baseUrl}/${dataSaver && dataSaver.length > 0 ? 'data-saver' : 'data'}/${hash}/${filename}`
            );
    
            console.log('Generated page URLs:', pageUrls);
            return pageUrls;
        } catch (error) {
            console.error('Error fetching chapter pages:', error);
    
            // Nếu API bị chặn hoặc lỗi, trả về mock
            if (error instanceof Error) {
                if (['Network request failed', 'NetworkError', 'TypeError'].some(type => error.message.includes(type) || error.name === type)) {
                    console.warn('MangaDex API blocked for chapter pages. Using mock fallback.');
                    this.isApiBlocked = true;
                }
            }
    
            return [];
        }
    }    

    // Transform MangaDex manga to our Story type
    private transformMangaToStory(manga: MangaDexManga, chapterCount: number = 0): Story {
        const title = manga.attributes.title.en ||
            manga.attributes.title.ja ||
            manga.attributes.altTitles?.[0]?.en ||
            'Unknown Title';

        const description = manga.attributes.description.en ||
            manga.attributes.description.ja ||
            'No description available';

        // Get author from relationships
        const authorRel = manga.relationships.find(rel => rel.type === 'author');
        const author = authorRel?.attributes?.name?.en || authorRel?.attributes?.name || 'Unknown Author';

        // Get cover from relationships
        const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
        const cover = coverRel ?
            `http://10.0.2.2:8080/api/mangadex/uploads/covers/${manga.id}/${coverRel.attributes?.fileName}` :
            'https://via.placeholder.com/300x400?text=No+Cover';

        // Get tags
        const tags = (manga.attributes.tags || []).map(tag => tag.attributes.name.en);

        // Determine level based on content rating and demographic
        let level = 'Intermediate';
        if (manga.attributes.contentRating === 'safe') {
            level = 'Beginner';
        } else if (manga.attributes.contentRating === 'pornographic') {
            level = 'Advanced';
        }

        return {
            id: manga.id,
            title,
            author,
            cover,
            description,
            level,
            chapters: chapterCount, // Số chapter thực tế
            rating: 4.5, // TODO: fetch actual rating if available
            readCount: 0,
            tags,
            status: manga.attributes.status === 'completed' ? 'Completed' : 'Ongoing'
        };
    }

    // Transform MangaDex chapter to our Chapter type
    private transformChapterToChapter(chapter: MangaDexChapter): Chapter {
        return {
            id: chapter.id,
            title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter || 'Unknown'}`,
            content: chapter.attributes.externalUrl || '', // Store external URL if available
            chapterNumber: parseFloat(chapter.attributes.chapter || '0'),
            wordCount: chapter.attributes.pages * 50, // Estimate word count
            difficulty: 'Intermediate' // Default difficulty
        };
    }

    // Get cover image URL
    getCoverUrl(mangaId: string, fileName: string): string {
        return `http://10.0.2.2:8080/api/mangadex/uploads/covers/${mangaId}/${fileName}`;
    }

    // Search manga by title
    async searchManga(params: {
        title?: string;
        author?: string;
        artist?: string;
        year?: number;
        includedTags?: string[];
        excludedTags?: string[];
        status?: string[];
        originalLanguage?: string[];
        publicationDemographic?: string[];
        contentRating?: string[];
        limit?: number;
        offset?: number;
        order?: Record<string, 'asc' | 'desc'>;
    } = {}): Promise<Story[]> {
        return this.getMangaList({
            ...params,
            includes: ['cover_art', 'author', 'artist'],
            availableTranslatedLanguage: ['en'],
        });
    }

    // Get popular manga
    async getPopularManga(limit: number = 20): Promise<Story[]> {
        return this.getMangaList({
            limit,
            order: { followedCount: 'desc' },
            contentRating: ['safe', 'suggestive'],
            availableTranslatedLanguage: ['en'],
            includes: ['cover_art', 'author']
        });
    }

    // Get latest manga
    async getLatestManga(limit: number = 20): Promise<Story[]> {
        return this.getMangaList({
            limit,
            order: { createdAt: 'desc' },
            contentRating: ['safe', 'suggestive'],
            availableTranslatedLanguage: ['en'],
            includes: ['cover_art', 'author']
        });
    }

    // Get recently updated manga
    async getRecentlyUpdatedManga(limit: number = 20): Promise<Story[]> {
        return this.getMangaList({
            limit,
            order: { updatedAt: 'desc' },
            contentRating: ['safe', 'suggestive'],
            availableTranslatedLanguage: ['en'],
            includes: ['cover_art', 'author']
        });
    }

    // Get manga by demographic (like MangaDex categories)
    async getMangaByDemographic(demographic: string, limit: number = 20): Promise<Story[]> {
        return this.getMangaList({
            limit,
            publicationDemographic: [demographic],
            order: { followedCount: 'desc' },
            contentRating: ['safe', 'suggestive'],
            availableTranslatedLanguage: ['en'],
            includes: ['cover_art', 'author']
        });
    }

    // Get all available tags (for filtering)
    async getTags(): Promise<{ id: string; name: string; group: string }[]> {
        try {
            const response = await fetch(`${MANGADEX_API_BASE}${ENDPOINTS.TAG}`, {
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data.map((tag: any) => ({
                id: tag.id,
                name: tag.attributes.name.en,
                group: tag.attributes.group
            }));
        } catch (error) {
            console.error('Error fetching tags:', error);
            // Return some default tags if API fails
            return [
                { id: '1', name: 'Action', group: 'genre' },
                { id: '2', name: 'Romance', group: 'genre' },
                { id: '3', name: 'Comedy', group: 'genre' },
                { id: '4', name: 'Drama', group: 'genre' },
                { id: '5', name: 'Fantasy', group: 'genre' },
                { id: '6', name: 'School Life', group: 'theme' },
                { id: '7', name: 'Slice of Life', group: 'theme' },
            ];
        }
    }

    // Test connectivity to MangaDex API
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            console.log('Testing connection to MangaDex API...');

            // Test 1: Simple API call
            console.log('Test 1: Basic API call');
            const response = await fetch(`${MANGADEX_API_BASE}/manga?limit=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Basic API test successful');
                return { success: true, message: 'Connection successful' };
            } else {
                return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
            }
        } catch (error) {
            console.error('Connection test failed:', error);

            // Test 2: Try different domain
            try {
                console.log('Test 2: Testing external API');
                const testResponse = await fetch('https://httpbin.org/get');
                if (testResponse.ok) {
                    console.log('External API works, MangaDex specific issue');
                    return { success: false, message: 'Network works but MangaDex blocked: ' + (error instanceof Error ? error.message : 'Unknown error') };
                }
            } catch {
                console.log('External API also fails, general network issue');
                return { success: false, message: 'General network issue: ' + (error instanceof Error ? error.message : 'Unknown error') };
            }

            if (error instanceof Error) {
                return { success: false, message: error.message };
            }
            return { success: false, message: 'Unknown connection error' };
        }
    }

    async getChapterInfo(chapterId: string) {
        const res = await fetch(`${MANGADEX_API_BASE}/chapter/${chapterId}`);
        if (!res.ok) throw new Error('Failed to fetch chapter info');
        const data = await res.json();
        return {
            title: data.data?.attributes?.title || '',
            chapter: data.data?.attributes?.chapter || '',
            volume: data.data?.attributes?.volume || '',
            scanlationGroup: data.data?.relationships?.find((r: any) => r.type === 'scanlation_group')?.attributes?.name || '',
        };
    }
}

export const mangadexService = new MangaDexService();
export default mangadexService;