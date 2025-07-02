#!/usr/bin/env node

/**
 * Test script for MangaDex API integration
 * Run with: node scripts/test-mangadex-api.js
 */

const fetch = require('node-fetch');

// MangaDex API configuration
const MANGADEX_API_BASE = 'https://api.mangadex.org';
const TEST_USERNAME = process.env.MANGADEX_USERNAME || 'test_user';
const TEST_PASSWORD = process.env.MANGADEX_PASSWORD || 'test_password';

class MangaDexAPITester {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
    }

    async authenticate() {
        try {
            console.log('🔐 Authenticating with MangaDex...');

            const response = await fetch(`${MANGADEX_API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: TEST_USERNAME,
                    password: TEST_PASSWORD,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.token.session;
                this.refreshToken = data.token.refresh;
                console.log('✅ Authentication successful');
                return true;
            } else {
                console.log('❌ Authentication failed:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Authentication error:', error.message);
            return false;
        }
    }

    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    async testSearchManga() {
        try {
            console.log('\n🔍 Testing manga search...');

            const queryParams = new URLSearchParams({
                title: 'One Piece',
                limit: '5',
                contentRating: 'safe',
                contentRating: 'suggestive',
                order: 'relevance',
            });

            const url = `${MANGADEX_API_BASE}/manga?${queryParams.toString()}`;
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Found ${data.data.length} manga`);

                data.data.forEach((manga, index) => {
                    const title = manga.attributes.title.en || manga.attributes.title.ja || 'Unknown Title';
                    console.log(`  ${index + 1}. ${title} (ID: ${manga.id})`);
                });

                return data.data;
            } else {
                console.log('❌ Search failed:', response.status);
                return [];
            }
        } catch (error) {
            console.error('❌ Search error:', error.message);
            return [];
        }
    }

    async testGetMangaDetails(mangaId) {
        try {
            console.log(`\n📖 Testing manga details for ID: ${mangaId}...`);

            const url = `${MANGADEX_API_BASE}/manga/${mangaId}`;
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                const manga = data.data;
                const title = manga.attributes.title.en || manga.attributes.title.ja || 'Unknown Title';
                const description = manga.attributes.description.en || 'No description';

                console.log(`✅ Manga details retrieved:`);
                console.log(`  Title: ${title}`);
                console.log(`  Status: ${manga.attributes.status}`);
                console.log(`  Content Rating: ${manga.attributes.contentRating}`);
                console.log(`  Description: ${description.substring(0, 100)}...`);

                return manga;
            } else {
                console.log('❌ Get manga details failed:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Get manga details error:', error.message);
            return null;
        }
    }

    async testGetMangaChapters(mangaId) {
        try {
            console.log(`\n📚 Testing chapters for manga ID: ${mangaId}...`);

            const queryParams = new URLSearchParams({
                manga: mangaId,
                limit: '10',
                order: 'chapter',
                translatedLanguage: 'en',
            });

            const url = `${MANGADEX_API_BASE}/chapter?${queryParams.toString()}`;
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Found ${data.data.length} chapters`);

                data.data.forEach((chapter, index) => {
                    const title = chapter.attributes.title || `Chapter ${chapter.attributes.chapter || 'Unknown'}`;
                    console.log(`  ${index + 1}. ${title} (Pages: ${chapter.attributes.pages})`);
                });

                return data.data;
            } else {
                console.log('❌ Get chapters failed:', response.status);
                return [];
            }
        } catch (error) {
            console.error('❌ Get chapters error:', error.message);
            return [];
        }
    }

    async testGetChapterPages(chapterId) {
        try {
            console.log(`\n🖼️ Testing chapter pages for ID: ${chapterId}...`);

            const url = `${MANGADEX_API_BASE}/chapter/${chapterId}`;
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                const chapter = data.data;

                console.log(`✅ Chapter details retrieved:`);
                console.log(`  Title: ${chapter.attributes.title || 'No title'}`);
                console.log(`  Pages: ${chapter.attributes.pages}`);
                console.log(`  Hash: ${chapter.attributes.hash}`);

                if (chapter.attributes.data && chapter.attributes.data.length > 0) {
                    console.log(`  First page: ${chapter.attributes.data[0]}`);
                    console.log(`  Total pages: ${chapter.attributes.data.length}`);
                }

                return chapter;
            } else {
                console.log('❌ Get chapter pages failed:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Get chapter pages error:', error.message);
            return null;
        }
    }

    async testPopularManga() {
        try {
            console.log('\n🔥 Testing popular manga...');

            const queryParams = new URLSearchParams({
                limit: '5',
                order: 'followedCount',
                contentRating: 'safe',
                contentRating: 'suggestive',
            });

            const url = `${MANGADEX_API_BASE}/manga?${queryParams.toString()}`;
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Found ${data.data.length} popular manga`);

                data.data.forEach((manga, index) => {
                    const title = manga.attributes.title.en || manga.attributes.title.ja || 'Unknown Title';
                    console.log(`  ${index + 1}. ${title}`);
                });

                return data.data;
            } else {
                console.log('❌ Popular manga failed:', response.status);
                return [];
            }
        } catch (error) {
            console.error('❌ Popular manga error:', error.message);
            return [];
        }
    }

    async runAllTests() {
        console.log('🚀 Starting MangaDex API Tests\n');

        // Test authentication
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
            console.log('❌ Cannot proceed without authentication');
            return;
        }

        // Test popular manga
        const popularManga = await this.testPopularManga();
        if (popularManga.length === 0) {
            console.log('❌ No popular manga found, skipping other tests');
            return;
        }

        // Test search
        const searchResults = await this.testSearchManga();

        // Test manga details
        if (searchResults.length > 0) {
            const firstManga = searchResults[0];
            await this.testGetMangaDetails(firstManga.id);

            // Test chapters
            const chapters = await this.testGetMangaChapters(firstManga.id);

            // Test chapter pages
            if (chapters.length > 0) {
                await this.testGetChapterPages(chapters[0].id);
            }
        }

        console.log('\n✅ All tests completed!');
    }
}

// Run tests
async function main() {
    const tester = new MangaDexAPITester();
    await tester.runAllTests();
}

// Handle command line arguments
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MangaDexAPITester; 