import { Story, Chapter } from '../types/story';

// MangaDex API base URL
const MANGADEX_API_BASE = 'https://api.mangadex.org';

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
        altTitles: Array<{
            en?: string;
            ja?: string;
            'ja-ro'?: string;
            ko?: string;
            'zh-cn'?: string;
            'zh-hk'?: string;
            'zh-ro'?: string;
            'zh-tw'?: string;
        }>;
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
        tags: Array<{
            id: string;
            type: 'tag';
            attributes: {
                name: {
                    en: string;
                };
                group: string;
            };
        }>;
        originalLanguage: string;
        lastVolume?: string;
        lastChapter?: string;
        publicationDemographic?: 'shounen' | 'shoujo' | 'josei' | 'seinen';
    };
    relationships: Array<{
        id: string;
        type: string;
        attributes?: any;
    }>;
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
    };
    relationships: Array<{
        id: string;
        type: string;
        attributes?: any;
    }>;
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

    // Fallback mock data khi API bị chặn
    private getMockStories(): Story[] {
        return [
            {
                id: 'mock-1',
                title: 'One Piece',
                author: 'Eiichiro Oda',
                cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                description: 'Follow Monkey D. Luffy and his crew as they search for the ultimate treasure, One Piece, to become the next Pirate King.',
                level: 'Intermediate',
                chapters: 1000,
                rating: 4.9,
                readCount: 500000,
                tags: ['Adventure', 'Comedy', 'Shounen'],
                status: 'Ongoing'
            },
            {
                id: 'mock-2',
                title: 'Attack on Titan',
                author: 'Hajime Isayama',
                cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                description: 'Humanity fights for survival against giant humanoid Titans in this dark fantasy series.',
                level: 'Advanced',
                chapters: 139,
                rating: 4.8,
                readCount: 300000,
                tags: ['Action', 'Drama', 'Fantasy'],
                status: 'Completed'
            },
            {
                id: 'mock-3',
                title: 'My Hero Academia',
                author: 'Kohei Horikoshi',
                cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                description: 'In a world where superpowers are common, a boy without powers dreams of becoming a hero.',
                level: 'Intermediate',
                chapters: 400,
                rating: 4.7,
                readCount: 250000,
                tags: ['Superhero', 'School', 'Shounen'],
                status: 'Ongoing'
            },
            {
                id: 'mock-4',
                title: 'Demon Slayer',
                author: 'Koyoharu Gotouge',
                cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                description: 'A young boy becomes a demon slayer to save his sister and avenge his family.',
                level: 'Intermediate',
                chapters: 205,
                rating: 4.9,
                readCount: 400000,
                tags: ['Action', 'Supernatural', 'Historical'],
                status: 'Completed'
            },
            {
                id: 'mock-5',
                title: 'Naruto',
                author: 'Masashi Kishimoto',
                cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                description: 'Follow the journey of Naruto Uzumaki as he trains to become a ninja and pursues his dream of becoming Hokage.',
                level: 'Intermediate',
                chapters: 700,
                rating: 4.8,
                readCount: 600000,
                tags: ['Ninja', 'Adventure', 'Shounen'],
                status: 'Completed'
            }
        ];
    }

    private getMockChapters(storyId: string): Chapter[] {
        return [
            {
                id: `${storyId}-ch1`,
                title: 'Chapter 1: The Beginning',
                content: 'Mock content for chapter 1. This is a sample story content to demonstrate the reading functionality.',
                chapterNumber: 1,
                wordCount: 500,
                difficulty: 'Intermediate'
            },
            {
                id: `${storyId}-ch2`,
                title: 'Chapter 2: First Adventure',
                content: 'Mock content for chapter 2. The adventure continues with new challenges and discoveries.',
                chapterNumber: 2,
                wordCount: 550,
                difficulty: 'Intermediate'
            },
            {
                id: `${storyId}-ch3`,
                title: 'Chapter 3: New Challenges',
                content: 'Mock content for chapter 3. Our heroes face their greatest challenge yet.',
                chapterNumber: 3,
                wordCount: 480,
                difficulty: 'Advanced'
            }
        ];
    }

    private getMockPages(): string[] {
        return [
            'https://via.placeholder.com/800x1200/CCCCCC/FFFFFF?text=Page+1',
            'https://via.placeholder.com/800x1200/DDDDDD/FFFFFF?text=Page+2',
            'https://via.placeholder.com/800x1200/EEEEEE/FFFFFF?text=Page+3',
            'https://via.placeholder.com/800x1200/CCCCCC/FFFFFF?text=Page+4',
            'https://via.placeholder.com/800x1200/DDDDDD/FFFFFF?text=Page+5'
        ];
    }

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
        // Nếu API đã bị chặn, trả về mock data ngay
        if (this.isApiBlocked) {
            console.log('API is blocked, returning mock data');
            return this.getMockStories();
        }

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
            console.log('Fetching manga from URL:', url);
            console.log('Query params:', queryParams.toString());

            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: MangaDexResponse<MangaDexManga> = await response.json();
            console.log('Response data:', data.result, 'Total:', data.total);

            return data.data.map(manga => this.transformMangaToStory(manga));
        } catch (error) {
            console.error('Error fetching manga list:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

            if (error instanceof Error) {
                if (['Network request failed', 'NetworkError', 'TypeError'].some(type => error.message.includes(type) || error.name === type)) {
                    console.warn('MangaDx API blocked for manga list. Using mock data as fallback.');
                    this.isApiBlocked = true;
                    return this.getMockStories();
                }
            }

            // Sử dụng dữ liệu mock cho bất kỳ lỗi nào khác
            console.warn('Manga list API error, falling back to mock data');
            return this.getMockStories();
        }
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
    } = {}): Promise<Chapter[]> {
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

            return data.data.map(chapter => this.transformChapterToChapter(chapter));
        } catch (error) {
            console.error('Error fetching manga chapters:', error);
            // Sử dụng dữ liệu mock nếu API bị chặn
            if (this.isApiBlocked) {
                console.warn('Using mock data for manga chapters');
                return this.getMockChapters('mock-1'); // Trả về dữ liệu mock cho manga đầu tiên
            }
            return [];
        }
    }

    async getChapterPages(chapterId: string): Promise<string[]> {
        try {
            console.log('Getting chapter pages for ID:', chapterId);

            // Lấy thông tin chapter để lấy hash và data/dataSaver
            const chapterRes = await fetch(`${MANGADEX_API_BASE}${ENDPOINTS.CHAPTER}/${chapterId}`, {
                headers: this.getAuthHeaders(),
            });

            console.log('Chapter response status:', chapterRes.status);
            if (!chapterRes.ok) throw new Error(`HTTP error! status: ${chapterRes.status}`);

            const chapterData = await chapterRes.json();
            console.log('Chapter data response:', JSON.stringify(chapterData, null, 2));

            const chapter = chapterData.data;
            if (!chapter) {
                console.error('No chapter data found in response');
                throw new Error('No chapter data found');
            }

            const hash = chapter.attributes.hash;
            const data = chapter.attributes.data;
            const dataSaver = chapter.attributes.dataSaver;

            console.log('Chapter hash:', hash);
            console.log('Data pages:', data ? data.length : 'null');
            console.log('DataSaver pages:', dataSaver ? dataSaver.length : 'null');

            // Lấy baseUrl từ at-home server
            const atHomeRes = await fetch(`${MANGADEX_API_BASE}/at-home/server/${chapterId}`);
            console.log('At-home response status:', atHomeRes.status);
            if (!atHomeRes.ok) throw new Error(`HTTP error! status: ${atHomeRes.status}`);

            const atHomeData = await atHomeRes.json();
            console.log('At-home data:', JSON.stringify(atHomeData, null, 2));
            const baseUrl = atHomeData.baseUrl;

            // Ưu tiên dataSaver nếu có, không thì dùng data
            const pages = (dataSaver && dataSaver.length > 0) ? dataSaver : data;
            console.log('Selected pages array:', pages);

            if (!Array.isArray(pages) || pages.length === 0) {
                console.error('No valid pages array found:', {
                    pages,
                    data: chapter.attributes.data,
                    dataSaver: chapter.attributes.dataSaver
                });
                throw new Error('No pages found for this chapter');
            }

            // Tạo URL ảnh
            const pageUrls = pages.map((page: string) =>
                `${baseUrl}/${(dataSaver && dataSaver.length > 0) ? 'data-saver' : 'data'}/${hash}/${page}`
            );

            console.log('Generated page URLs:', pageUrls);
            return pageUrls;
        } catch (error) {
            console.error('Error fetching chapter pages:', error);

            // Nếu API bị chặn hoặc lỗi network, trả về mock pages
            if (error instanceof Error) {
                if (['Network request failed', 'NetworkError', 'TypeError'].some(type => error.message.includes(type) || error.name === type)) {
                    console.warn('MangaDx API blocked for chapter pages. Using mock data as fallback.');
                    this.isApiBlocked = true;
                    return this.getMockPages();
                }
                if (error.message.includes('No pages found')) {
                    console.warn('No pages found for chapter, using mock pages');
                    return this.getMockPages();
                }
            }

            console.warn('Chapter pages API error, falling back to mock data');
            return this.getMockPages();
        }
    }

    // Transform MangaDex manga to our Story type
    private transformMangaToStory(manga: MangaDexManga): Story {
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
            `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes?.fileName}` :
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
            chapters: 0, // TODO: fetch actual chapter count if needed
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
        return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    }

    // Search manga by title
    async searchManga(query: string, limit: number = 20): Promise<Story[]> {
        return this.getMangaList({
            title: query,
            limit,
            order: { relevance: 'desc' },
            availableTranslatedLanguage: ['en'],
            includes: ['cover_art', 'author']
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

    // Test connectivity to MangaDx API
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            console.log('Testing connection to MangaDx API...');

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
                    console.log('External API works, MangaDx specific issue');
                    return { success: false, message: 'Network works but MangaDx blocked: ' + (error instanceof Error ? error.message : 'Unknown error') };
                }
            } catch (externalError) {
                console.log('External API also fails, general network issue');
                return { success: false, message: 'General network issue: ' + (error instanceof Error ? error.message : 'Unknown error') };
            }

            if (error instanceof Error) {
                return { success: false, message: error.message };
            }
            return { success: false, message: 'Unknown connection error' };
        }
    }
}

export const mangadexService = new MangaDexService();
export default mangadexService;