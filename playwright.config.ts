import { defineConfig, devices } from '@playwright/test';

// Own ports, so the tests never talk to a real backend on :3000 or reuse a dev server
const FRONTEND_PORT = 4317;
const BACKEND_PORT = 3999;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    // The mock backend keeps its data in memory and is reset before every test,
    // so tests can't run at the same time
    fullyParallel: false,
    workers: 1,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
    use: {
        baseURL: `http://localhost:${FRONTEND_PORT}`,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry'
    },

    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        // The nav and cards have their own mobile layout
        { name: 'mobile', use: { ...devices['Pixel 7'] } }
    ],

    webServer: [
        {
            command: 'node e2e/mock-backend.ts',
            url: `http://localhost:${BACKEND_PORT}/books/genres`,
            env: { MOCK_BACKEND_PORT: String(BACKEND_PORT) },
            reuseExistingServer: !process.env.CI
        },
        {
            command: `npm run build && npm run preview -- --port ${FRONTEND_PORT} --strictPort`,
            url: `http://localhost:${FRONTEND_PORT}`,
            env: { BACKEND_URL: `http://localhost:${BACKEND_PORT}` },
            reuseExistingServer: !process.env.CI,
            timeout: 180_000
        }
    ]
});
