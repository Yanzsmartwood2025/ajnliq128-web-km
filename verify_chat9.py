import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir="/home/jules/verification/videos/",
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()
        await page.set_viewport_size({"width": 1280, "height": 720})

        print("Navigating to app...")
        await page.goto('http://localhost:3000')
        await page.wait_for_timeout(3000)

        # Evaluate JS to flip pages programmatically instead of relying on mouse clicks
        print("Flipping pages using API...")
        await page.evaluate("""
            const e = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            document.dispatchEvent(e);
        """)
        await page.wait_for_timeout(1000)

        await page.evaluate("""
            const e = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            document.dispatchEvent(e);
        """)
        await page.wait_for_timeout(1000)

        await page.evaluate("""
            const e = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            document.dispatchEvent(e);
        """)
        await page.wait_for_timeout(1000)

        print("Looking for chat input...")
        try:
            # Let's take a screenshot before trying to interact just to see what's on screen
            await page.screenshot(path='/home/jules/verification/screenshots/verification_state9.png')

            input_box = await page.wait_for_selector('input.chat-input', state='visible', timeout=5000)
            print("Found input, typing...")
            await input_box.fill('Hello arIA!')
            await page.wait_for_timeout(500)
            await page.keyboard.press('Enter')
            print("Sent message, waiting for response...")
            await page.wait_for_timeout(3000)

            await page.screenshot(path='/home/jules/verification/screenshots/verification_success9.png')

        except Exception as e:
            print(f"Error interacting with chat: {e}")
            await page.screenshot(path='/home/jules/verification/screenshots/verification_error9.png')

        print("Done, closing...")
        await context.close()
        await browser.close()

asyncio.run(main())
