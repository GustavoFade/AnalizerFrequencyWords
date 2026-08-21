import { test, expect, _electron } from '@playwright/test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const pdfPath = process.env.E2E_PDF_PATH ?? join(__dirname, '..', 'test', 'fixtures', 'book.pdf');

test.describe('happy path', () => {
  let electronApp: Awaited<ReturnType<typeof _electron.launch>>;
  let userDataDir: string;

  test.beforeAll(async () => {
    userDataDir = await mkdtemp(join(tmpdir(), 'frequency-e2e-'));
    electronApp = await _electron.launch({
      args: [join(__dirname, '..', 'dist', 'presentation', 'main.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        E2E_USER_DATA_DIR: userDataDir
      }
    });

    await electronApp.evaluate(({ dialog }, targetPath) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [targetPath] });
    }, pdfPath);
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('imports a book and shows frequencies', async () => {
    const page = await electronApp.firstWindow();
    await page.waitForSelector('#add-book-form');

    await page.click('#choose-file');
    await expect(page.locator('#status')).toContainText('Selected:', { timeout: 10000 });

    await page.locator('#subject-area').fill('software-architecture');
    await page.locator('#add-book-form button[type="submit"]').click();

    const status = page.locator('#status');
    await expect(status).toContainText('Importing book', { timeout: 30000 });
    await expect(status).toContainText('Book imported successfully', { timeout: 120000 });

    await page.locator('#view-scope').selectOption('global');
    const list = page.locator('#word-list');
    await expect(list).not.toContainText('No books imported yet', { timeout: 10000 });

    const summary = page.locator('#book-summary');
    await expect(summary).toContainText('1 book imported');
  });
});
