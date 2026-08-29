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
        await page.wait_for_selector('.starlight-page', state='visible')

        await page.wait_for_timeout(2000)

        # Click the right edge of the screen to turn pages
        print("Clicking to turn pages...")
        for i in range(3):
            # Click near the middle-right of the window
            await page.mouse.click(1000, 360)
            await page.wait_for_timeout(1000)

        print("Looking for chat input...")
        # Wait for chat input
        try:
            input_box = await page.wait_for_selector('input.chat-input', state='visible', timeout=5000)
            print("Found input, typing...")
            await input_box.fill('Hello arIA!')
            await page.wait_for_timeout(500)
            await page.keyboard.press('Enter')
            print("Sent message, waiting for response...")
            await page.wait_for_timeout(3000)

            # Click the plus button to open tools
            print("Opening tools menu...")
            plus_btn = await page.wait_for_selector('.chat-action-button', state='visible', timeout=2000)
            await plus_btn.click()
            await page.wait_for_timeout(1000)

            # Click Draw option
            print("Clicking draw option...")
            draw_btn = await page.wait_for_selector('text=Draw', state='visible', timeout=2000)
            await draw_btn.click()
            await page.wait_for_timeout(2000)

        except Exception as e:
            print(f"Error interacting with chat: {e}")
            await page.screenshot(path='/home/jules/verification/screenshots/verification_error7.png')

        print("Done, closing...")
        await context.close()
        await browser.close()

asyncio.run(main())
